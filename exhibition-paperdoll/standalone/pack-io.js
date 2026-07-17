/* Pack import/export for standalone editor */
(function()
{
	"use strict";

	const LOD_TIERS = [256, 512, 1024, 2048];
	const DEFAULT_TRANSFORM = { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, flipH: false, flipV: false, opacity: 1 };
	function slugify(text)
	{
		return String(text || "item")
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "") || "item";
	}

	function activePoseIds()
	{
		try
		{
			const Core = (typeof setup !== "undefined" && setup.ExhibitionPaperdoll && setup.ExhibitionPaperdoll.Core)
				|| (window.ExhibitionEditorEngine && window.ExhibitionEditorEngine.Core);
			if (Core && typeof Core.poseIds === "function")
			{
				const ids = Core.poseIds();
				if (ids && ids.length) return ids;
			}
			if (Core && Core.DEFAULT_POSE_IDS) return Core.DEFAULT_POSE_IDS.slice();
		}
		catch (e) { /* fall through */ }
		return ["front", "back"];
	}

	function emptyPoseMap(poseIds)
	{
		const map = {};
		const ids = poseIds && poseIds.length ? poseIds : activePoseIds();
		for (const id of ids)
			map[id] = null;
		// Always include front/back keys for safety
		if (!Object.prototype.hasOwnProperty.call(map, "front")) map.front = null;
		if (!Object.prototype.hasOwnProperty.call(map, "back")) map.back = null;
		return map;
	}

	/** Ensure every item has pose slots for the active pose list. */
	function ensureItemsHavePoses(items, poseIds)
	{
		const ids = poseIds && poseIds.length ? poseIds : activePoseIds();
		for (const item of items || [])
		{
			if (!item) continue;
			item.poses = item.poses || {};
			for (const id of ids)
			{
				if (!Object.prototype.hasOwnProperty.call(item.poses, id) || item.poses[id] === undefined)
					item.poses[id] = item.poses[id] || null;
			}
		}
		return items;
	}

	function blankItem(index)
	{
		return {
			id: "item-" + (index + 1),
			name: "New layer " + (index + 1),
			zIndex: 40 + index,
			cotBindings: [],
			recolor: false,
			exposureDisplacements: {},
			/** Which displacement mask types this clothing piece can use (editor + runtime filter). */
			enabledDisplacements: [],
			/** Game wardrobe flags (underboob chance certain, cleavage, …) applied via exhibition merge_flags. */
			clothingFlags: [],
			/** Graphic/design skin: match worn sub design/print/team/text when non-empty. */
			skinSubKey: "",
			skinSubValue: "",
			poses: emptyPoseMap(),
			_assets: {},
		};
	}

	function blankOverlay(index)
	{
		return {
			layer: "overlay-" + (index + 1),
			zIndex: 15 + index,
			poses: emptyPoseMap(),
			_assets: {},
		};
	}

	function blankBaseBody()
	{
		return {
			id: "body",
			name: "Base body",
			layer: "body",
			zIndex: 10,
			poses: emptyPoseMap(),
			_assets: {},
		};
	}

	function mergeBaseBodyItems(items)
	{
		const merged = blankBaseBody();
		for (const item of items || [])
		{
			for (const [poseId, poseDef] of Object.entries(item.poses || {}))
			{
				if (!poseDef) continue;
				const hasSources = poseDef.sources && Object.keys(poseDef.sources).length;
				const hasVariants = poseDef.variants && Object.keys(poseDef.variants).length;
				if (!hasSources && !hasVariants) continue;
				if (!merged.poses[poseId] || merged.poses[poseId] === null)
					merged.poses[poseId] = { sources: {}, transform: normalizeTransform(poseDef.transform) };
				const target = merged.poses[poseId];
				target.sources = target.sources || {};
				for (const tier of LOD_TIERS)
				{
					if (!poseDef.sources || !poseDef.sources[tier]) continue;
					target.sources[tier] = poseDef.sources[tier];
					const assetKey = poseId + "_" + tier;
					if (item._assets && item._assets[assetKey])
						merged._assets[assetKey] = item._assets[assetKey];
				}
				if (poseDef.variants)
				{
					target.variants = target.variants || {};
					for (const [vKey, vEntry] of Object.entries(poseDef.variants))
					{
						if (!vEntry) continue;
						if (!target.variants[vKey])
							target.variants[vKey] = { sources: {}, transform: normalizeTransform(vEntry.transform) };
						const slot = target.variants[vKey];
						slot.sources = slot.sources || {};
						for (const tier of LOD_TIERS)
						{
							if (!vEntry.sources || !vEntry.sources[tier]) continue;
							slot.sources[tier] = vEntry.sources[tier];
							const assetKey = poseId + "_var_" + vKey + "_" + tier;
							if (item._assets && item._assets[assetKey])
								merged._assets[assetKey] = item._assets[assetKey];
						}
					}
				}
			}
		}
		return merged;
	}

	function blankSkinItem(index)
	{
		return {
			id: "skin-" + (index + 1),
			name: "Skin piece " + (index + 1),
			layer: "skin",
			zIndex: 18 + index,
			poses: emptyPoseMap(),
			_assets: {},
		};
	}

	function blankMakeupItem(index)
	{
		return {
			id: "makeup-" + (index + 1),
			name: "Makeup piece " + (index + 1),
			layer: "makeup",
			makeupSlot: "eyeshadow",
			zIndex: 22 + index,
			cotBindings: [],
			recolor: false,
			poses: emptyPoseMap(),
			_assets: {},
		};
	}

	function blankBodyWritingItem(index)
	{
		return {
			id: "bodywriting-" + (index + 1),
			name: "Body writing " + (index + 1),
			layer: "bodywriting",
			bodyWritingPlacement: "forehead",
			zIndex: 20 + index,
			cotBindings: [],
			recolor: false,
			poses: emptyPoseMap(),
			_assets: {},
		};
	}

	const FACE_PART_SLOT_Z = {
		nose: 0, eyes: 1, eyelashes: 2, eyebrows: 3, lips: 4, cheeks: 5, chin: 6, face: 7,
	};

	function blankBaseFaceItem(index)
	{
		return {
			id: "base-face-" + (index + 1),
			name: "Base face " + (index + 1),
			layer: "base-face",
			zIndex: 15,
			cotBindings: [],
			recolor: false,
			poses: emptyPoseMap(),
			_assets: {},
		};
	}

	function blankFacePartItem(index)
	{
		return {
			id: "face-" + (index + 1),
			name: "Distinguishing overlay " + (index + 1),
			layer: "face-feature",
			zIndex: 17,
			cotBindings: [],
			recolor: false,
			poses: emptyPoseMap(),
			_assets: {},
		};
	}

	function blankHairItem(index, hairLayer)
	{
		hairLayer = hairLayer || "front";
		const zByLayer = { back: 14, sides: 28, front: 32 };
		return {
			id: "hair-" + hairLayer + "-" + (index + 1),
			name: "Hair " + hairLayer + " " + (index + 1),
			layer: "hair-" + hairLayer,
			hairLayer: hairLayer,
			zIndex: (zByLayer[hairLayer] || 32) + index,
			cotBindings: [],
			recolor: false,
			poses: emptyPoseMap(),
			_assets: {},
		};
	}

	function resolveMakeupPackType(options)
	{
		options = options || {};
		const tab = options.makeupSubTab || options.makeupSubKind || "makeup";
		if (tab === "body-writing") return "body-writing-overlay";
		if (tab === "face-hair")
		{
			if (options.faceHairKind === "hair") return "hair-overlay";
			if (options.faceHairKind === "base-face") return "base-face-overlay";
			return "face-overlay";
		}
		return "makeup-overlay";
	}

	function blankWetItem(index)
	{
		return {
			id: "wet-" + (index + 1),
			name: "Wet piece " + (index + 1),
			layer: "wet",
			zIndex: 72 + index,
			poses: emptyPoseMap(),
			_assets: {},
		};
	}

	const APPEARANCE_PACK_ID = "appearance-mod";

	function packTypeToEditorMode(packType)
	{
		if (packType === "base") return "base-poses";
		if (packType === "skin-overlay") return "skin";
		if (packType === "makeup-overlay" || packType === "body-writing-overlay"
			|| packType === "base-face-overlay" || packType === "face-overlay" || packType === "hair-overlay") return "makeup";
		if (packType === "effect-overlay") return "wet";
		if (packType === "base-overlay") return "base-poses";
		if (packType === "appearance") return "clothing";
		return "clothing";
	}

	function editorModeToPackType(editorMode, options)
	{
		options = options || {};
		if (editorMode === "skin") return "skin-overlay";
		if (editorMode === "makeup") return resolveMakeupPackType(options);
		if (editorMode === "wet") return "effect-overlay";
		if (editorMode === "base-poses") return "base";
		return "clothing";
	}

	function appearanceSectionKey(packType)
	{
		if (packType === "skin-overlay") return "skinOverlay";
		if (packType === "base-face-overlay") return "baseFaceOverlay";
		if (packType === "face-overlay") return "faceOverlay";
		if (packType === "hair-overlay") return "hairOverlay";
		if (packType === "makeup-overlay") return "makeupOverlay";
		if (packType === "body-writing-overlay") return "bodyWritingOverlay";
		if (packType === "effect-overlay") return "effectOverlay";
		return "clothing";
	}

	function legacyPackSlugForMode(editorMode)
	{
		if (editorMode === "skin") return "skin-mod";
		if (editorMode === "makeup") return "makeup-mod";
		if (editorMode === "wet") return "wet-mod";
		if (editorMode === "clothing") return "clothing-mod";
		return null;
	}

	function syncPoseAssetsToPoses(items)
	{
		for (const item of items || [])
		{
			for (const [poseId, poseDef] of Object.entries(item.poses || {}))
			{
				if (!poseDef) continue;
				poseDef.sources = poseDef.sources || {};
				for (const tier of LOD_TIERS)
				{
					const srcKey = poseId + "_" + tier;
					const srcRec = item._assets && item._assets[srcKey];
					if (srcRec && srcRec.url) poseDef.sources[tier] = srcRec.url;
				}
				poseDef.colorMask = poseDef.colorMask || {};
				for (const tier of LOD_TIERS)
				{
					const maskKey = "color_" + poseId + "_" + tier;
					const maskRec = item._assets && item._assets[maskKey];
					if (maskRec && maskRec.url) poseDef.colorMask[tier] = maskRec.url;
				}
			}
		}
	}

	function extractPackSlice(pack, packType)
	{
		if (!pack || typeof pack !== "object") return null;
		if (pack.type === "appearance")
		{
			const key = appearanceSectionKey(packType);
			const section = pack[key] || pack[key.replace("Overlay", "-overlay")];
			return section && Array.isArray(section.items) ? section.items : [];
		}
		if (packType === "clothing" && pack.type === "clothing") return pack.items || [];
		if (packType === "skin-overlay" && pack.type === "skin-overlay") return pack.items || [];
		if (packType === "makeup-overlay" && pack.type === "makeup-overlay") return pack.items || [];
		if (packType === "body-writing-overlay" && pack.type === "body-writing-overlay") return pack.items || [];
		if (packType === "base-face-overlay" && pack.type === "base-face-overlay") return pack.items || [];
		if (packType === "face-overlay" && pack.type === "face-overlay") return pack.items || [];
		if (packType === "hair-overlay" && pack.type === "hair-overlay") return pack.items || [];
		if (packType === "effect-overlay" && pack.type === "effect-overlay") return pack.items || [];
		return null;
	}

	function defaultBlankForMode(editorMode, index, options)
	{
		options = options || {};
		if (editorMode === "base-poses") return blankBaseBody();
		if (editorMode === "skin") return blankSkinItem(index || 0);
		if (editorMode === "makeup")
		{
			const tab = options.makeupSubTab || options.makeupSubKind || "makeup";
			if (tab === "body-writing") return blankBodyWritingItem(index || 0);
			if (tab === "face-hair")
			{
				if (options.faceHairKind === "hair") return blankHairItem(index || 0, "front");
				if (options.faceHairKind === "base-face") return blankBaseFaceItem(index || 0);
				return blankFacePartItem(index || 0);
			}
			return blankMakeupItem(index || 0);
		}
		if (editorMode === "wet") return blankWetItem(index || 0);
		return blankItem(index || 0);
	}

	function hydrateBaseBody(layer, blobStore)
	{
		const item = blankBaseBody();
		if (!layer || !layer.poses) return item;
		const poseIds = new Set(Object.keys(item.poses || {}).concat(Object.keys(layer.poses || {})));
		for (const poseId of poseIds)
		{
			const rawPose = layer.poses[poseId];
			if (!rawPose) continue;
			const src = rawPose.sources || (rawPose.asset ? { 256: rawPose.asset } : {});
			for (const tier of LOD_TIERS)
			{
				const path = src[tier] || src[String(tier)];
				if (!path) continue;
				const clean = String(path).replace(/\\/g, "/");
				const url = blobStore[clean] || blobStore[clean.split("/").pop()];
				if (!url) continue;
				if (!item.poses[poseId]) item.poses[poseId] = { sources: {}, transform: normalizeTransform(rawPose.transform) };
				item.poses[poseId].sources = item.poses[poseId].sources || {};
				item.poses[poseId].sources[tier] = url;
				item._assets[poseId + "_" + tier] = { url: url, blob: blobStore[clean + "_blob"] || null };
			}
			if (rawPose.variants && typeof rawPose.variants === "object")
			{
				if (!item.poses[poseId])
					item.poses[poseId] = { sources: {}, transform: normalizeTransform(rawPose.transform) };
				item.poses[poseId].variants = item.poses[poseId].variants || {};
				for (const [vKey, vEntry] of Object.entries(rawPose.variants))
				{
					if (!vEntry) continue;
					const vSrc = vEntry.sources || {};
					const slot = item.poses[poseId].variants[vKey] = {
						sources: {},
						transform: normalizeTransform(vEntry.transform || rawPose.transform),
					};
					for (const tier of LOD_TIERS)
					{
						const path = vSrc[tier] || vSrc[String(tier)];
						if (!path) continue;
						const clean = String(path).replace(/\\/g, "/");
						const url = blobStore[clean] || blobStore[clean.split("/").pop()];
						if (!url) continue;
						slot.sources[tier] = url;
						item._assets[poseId + "_var_" + vKey + "_" + tier] = {
							url: url,
							blob: blobStore[clean + "_blob"] || null,
						};
					}
				}
			}
		}
		return item;
	}

	function normalizeTransform(raw)
	{
		return Object.assign({}, DEFAULT_TRANSFORM, raw || {});
	}

	function parseBindings(text)
	{
		return String(text || "")
			.split(/[\n,]/)
			.map(s => s.trim())
			.filter(Boolean);
	}

	function bindingsToText(bindings)
	{
		return (bindings || []).join(", ");
	}

	function poseEntryFromRaw(raw, blobStore, keyPrefix)
	{
		if (!raw) return null;
		const sources = {};
		const src = raw.sources || (raw.asset ? { 256: raw.asset } : {});
		for (const tier of LOD_TIERS)
		{
			const path = src[tier] || src[String(tier)];
			if (!path) continue;
			const assetKey = keyPrefix + "_" + tier;
			if (blobStore[assetKey]) sources[tier] = blobStore[assetKey];
		}
		if (!Object.keys(sources).length) return null;
		return {
			sources: sources,
			transform: normalizeTransform(raw.transform),
		};
	}

	function hydratePoseColorMask(rawPose, blobStore, keyPrefix, poseEntry)
	{
		if (!rawPose || !rawPose.colorMask || !poseEntry) return;
		const src = rawPose.colorMask;
		poseEntry.colorMask = {};
		for (const tier of LOD_TIERS)
		{
			const path = src[tier] || src[String(tier)];
			if (!path) continue;
			const assetKey = keyPrefix + "_color_" + tier;
			if (blobStore[assetKey]) poseEntry.colorMask[tier] = blobStore[assetKey];
		}
	}

	function hydrateItem(raw, blobStore, index)
	{
		const item = {
			id: raw.id || slugify(raw.name) || ("item-" + (index + 1)),
			name: raw.name || raw.id || ("Item " + (index + 1)),
			layer: raw.layer || raw.id,
			zIndex: Number(raw.zIndex) || (40 + index),
			cotBindings: Array.isArray(raw.cotBindings) ? raw.cotBindings.slice() : [],
			makeupSlot: raw.makeupSlot || raw.makeup_slot || "",
			facePartSlot: raw.facePartSlot || raw.face_part_slot || "",
			hairLayer: raw.hairLayer || raw.hair_layer || "",
			bodyWritingPlacement: raw.bodyWritingPlacement || raw.body_writing_placement || "",
			recolor: !!raw.recolor,
			exposureDisplacements: raw.exposureDisplacements && typeof raw.exposureDisplacements === "object"
				? Object.assign({}, raw.exposureDisplacements) : {},
			enabledDisplacements: Array.isArray(raw.enabledDisplacements)
				? raw.enabledDisplacements.filter((id) => id && id !== "normal").map(String)
				: null,
			clothingFlags: Array.isArray(raw.clothingFlags)
				? raw.clothingFlags.map(String).filter(Boolean)
				: [],
			gameClothing: raw.gameClothing && typeof raw.gameClothing === "object"
				? Object.assign({}, raw.gameClothing)
				: null,
			skinSubKey: raw.skinSubKey || "",
			skinSubValue: raw.skinSubValue != null ? raw.skinSubValue : "",
			poses: emptyPoseMap(),
			_assets: {},
		};
		for (const poseId of Object.keys(item.poses))
		{
			const keyPrefix = item.id + "/" + poseId;
			const entry = poseEntryFromRaw(raw.poses && raw.poses[poseId], blobStore, keyPrefix);
			if (entry)
			{
				hydratePoseColorMask(raw.poses && raw.poses[poseId], blobStore, keyPrefix, entry);
				item.poses[poseId] = entry;
				for (const [tier, url] of Object.entries(entry.sources))
					item._assets[poseId + "_" + tier] = { url: url, blob: blobStore[keyPrefix + "_" + tier + "_blob"] || null };
				if (entry.colorMask)
				{
					for (const [tier, url] of Object.entries(entry.colorMask))
					{
						const assetKey = "color_" + poseId + "_" + tier;
						item._assets[assetKey] = {
							url: url,
							blob: blobStore[keyPrefix + "_color_" + tier + "_blob"] || null,
						};
					}
				}
			}
		}
		// If pack didn't list enabled displacements, infer from raw pose keys (works before blobs resolve).
		if (!Array.isArray(item.enabledDisplacements))
		{
			const inferred = new Set();
			for (const rawPose of Object.values((raw && raw.poses) || {}))
			{
				if (!rawPose || !rawPose.displacements) continue;
				for (const dispId of Object.keys(rawPose.displacements))
				{
					if (dispId && dispId !== "normal") inferred.add(dispId);
				}
			}
			item.enabledDisplacements = Array.from(inferred);
		}
		return item;
	}

	function hydrateOverlay(raw, blobStore, index)
	{
		const ov = {
			layer: raw.layer || raw.id || ("overlay-" + (index + 1)),
			zIndex: Number(raw.zIndex) || (15 + index),
			poses: emptyPoseMap(),
			_assets: {},
		};
		for (const poseId of Object.keys(ov.poses))
		{
			const keyPrefix = ov.layer + "/" + poseId;
			const entry = poseEntryFromRaw(raw.poses && raw.poses[poseId], blobStore, keyPrefix);
			if (entry)
			{
				ov.poses[poseId] = entry;
				for (const [tier, url] of Object.entries(entry.sources))
					ov._assets[poseId + "_" + tier] = { url: url, blob: blobStore[keyPrefix + "_" + tier + "_blob"] || null };
			}
		}
		return ov;
	}

	async function blobFromUrl(url)
	{
		if (!url) return null;
		if (url.startsWith("blob:") || url.startsWith("data:"))
		{
			try
			{
				const res = await fetch(url);
				return await res.blob();
			}
			catch (e) { return null; }
		}
		return null;
	}

	async function blobFromDisk(epRootHandle, relPath)
	{
		if (!epRootHandle || !relPath) return null;
		try
		{
			const clean = String(relPath).replace(/\\/g, "/").replace(/^\//, "");
			const buf = await readBlobUnder(epRootHandle, clean);
			const mime = /\.png$/i.test(clean) ? "image/png"
				: /\.webp$/i.test(clean) ? "image/webp" : "image/jpeg";
			return new Blob([buf], { type: mime });
		}
		catch (e) { return null; }
	}

	async function resolveImageBlob(sourceUrl, assetRecord, epRootHandle, diskRelPath)
	{
		let blob = assetRecord && assetRecord.blob;
		if (!blob && sourceUrl) blob = await blobFromUrl(sourceUrl);
		if (!blob && epRootHandle && diskRelPath) blob = await blobFromDisk(epRootHandle, diskRelPath);
		return blob;
	}

	const IDB_NAME = "exhibition-pack-editor";
	const IDB_STORE = "handles";
	const MODS_HANDLE_KEY = "mods-dir";
	const BASE_HANDLE_KEY = "base-pack-dir";
	const EP_ROOT_HANDLE_KEY = "ep-root-dir";
	const PROJECT_ROOT_KEY = "project-root-dir";
	const GAME_HTML_HANDLE_KEY = "game-html-file";
	const SETUP_META_KEY = "setup-meta";
	const GAME_HTML_DEV_NAME = "CourseOfTemptation-Exhibition-appearance-dev.html";
	const GAME_HTML_INSTALL_NAME = "CourseOfTemptationtest.html";
	const GAME_HTML_PREFERRED_NAMES = [GAME_HTML_DEV_NAME, GAME_HTML_INSTALL_NAME];

	function setStatusIfPresent(msg)
	{
		try
		{
			const el = document.getElementById("status-text");
			if (el) el.textContent = msg;
		}
		catch (e) { /* ignore */ }
	}

	const PATH_HINTS = {
		projectFolder: "…/your-game-folder/",
		epFolder: "…/your-game-folder/exhibition-paperdoll/",
		gameHtmlDev: "…/your-game-folder/" + GAME_HTML_DEV_NAME,
		gameHtmlInstall: "…/your-game-folder/" + GAME_HTML_INSTALL_NAME,
		basePackSave: "exhibition-paperdoll/base-pack/",
		modsSave: "exhibition-paperdoll/mods/<pack-id>/",
	};

	function openIdb()
	{
		return new Promise((resolve, reject) =>
		{
			const req = indexedDB.open(IDB_NAME, 1);
			req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
			req.onsuccess = () => resolve(req.result);
			req.onerror = () => reject(req.error);
		});
	}

	async function idbGet(key)
	{
		const db = await openIdb();
		return new Promise((resolve, reject) =>
		{
			const tx = db.transaction(IDB_STORE, "readonly");
			const req = tx.objectStore(IDB_STORE).get(key);
			req.onsuccess = () => resolve(req.result);
			req.onerror = () => reject(req.error);
		});
	}

	async function idbSet(key, value)
	{
		const db = await openIdb();
		return new Promise((resolve, reject) =>
		{
			const tx = db.transaction(IDB_STORE, "readwrite");
			tx.objectStore(IDB_STORE).put(value, key);
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	}

	async function writeFileUnder(rootHandle, relPath, blob)
	{
		const parts = String(relPath || "").replace(/\\/g, "/").split("/").filter(Boolean);
		if (!parts.length) return;
		let dir = rootHandle;
		for (let i = 0; i < parts.length - 1; i++)
			dir = await dir.getDirectoryHandle(parts[i], { create: true });
		const fileHandle = await dir.getFileHandle(parts[parts.length - 1], { create: true });
		const writable = await fileHandle.createWritable();
		await writable.write(blob);
		await writable.close();
	}

	function prefixAssetPath(path, prefix)
	{
		if (!path || path.startsWith("exhibition-paperdoll/")) return path;
		if (path.startsWith("base-pack/") || path.startsWith("mods/"))
			return "exhibition-paperdoll/" + path;
		return prefix + "/" + String(path).replace(/^\//, "");
	}

	function normalizePoseSources(poseDef, prefix)
	{
		if (!poseDef || typeof poseDef !== "object") return poseDef;
		const out = Object.assign({}, poseDef);
		if (out.asset) out.asset = prefixAssetPath(out.asset, prefix);
		if (out.sources && typeof out.sources === "object")
		{
			const sources = {};
			for (const [tier, src] of Object.entries(out.sources))
				if (src) sources[tier] = prefixAssetPath(src, prefix);
			out.sources = sources;
		}
		if (out.colorMask && typeof out.colorMask === "object")
		{
			const colorMask = {};
			for (const [tier, src] of Object.entries(out.colorMask))
				if (src) colorMask[tier] = prefixAssetPath(src, prefix);
			out.colorMask = colorMask;
		}
		return out;
	}

	function normalizePackAssets(pack, prefix)
	{
		pack = Object.assign({}, pack);
		if (Array.isArray(pack.layers))
		{
			pack.layers = pack.layers.map((layer) =>
			{
				if (!layer || typeof layer !== "object") return layer;
				const out = Object.assign({}, layer);
				const poses = out.poses || {};
				out.poses = {};
				for (const [poseId, poseDef] of Object.entries(poses))
					out.poses[poseId] = normalizePoseSources(poseDef, prefix);
				return out;
			});
		}
		for (const key of ["overlays", "items"])
		{
			if (!Array.isArray(pack[key])) continue;
			pack[key] = pack[key].map((entry) =>
			{
				if (!entry || typeof entry !== "object") return entry;
				const out = Object.assign({}, entry);
				const poses = out.poses || {};
				out.poses = {};
				for (const [poseId, poseDef] of Object.entries(poses))
					out.poses[poseId] = normalizePoseSources(poseDef, prefix);
				return out;
			});
		}
		return pack;
	}

	async function loadModBucketsFromHandle(epRootHandle)
	{
		const mods = [];
		const baseOverlays = [];
		const skinOverlays = [];
		const baseFaceOverlays = [];
		const faceOverlays = [];
		const hairOverlays = [];
		const makeupOverlays = [];
		const bodyWritingOverlays = [];
		const effectOverlays = [];
		let modsDir;
		try { modsDir = await epRootHandle.getDirectoryHandle("mods"); }
		catch (e) { return { mods, baseOverlays, skinOverlays, baseFaceOverlays, faceOverlays, hairOverlays, makeupOverlays, bodyWritingOverlays, effectOverlays, packIds: [] }; }

		const packIds = [];
		const entries = [];
		for await (const [name, handle] of modsDir.entries())
		{
			if (handle.kind === "directory" && !name.startsWith(".")) entries.push([name, handle]);
		}
		entries.sort((a, b) => a[0].localeCompare(b[0]));

		for (const [modName] of entries)
		{
			let packText;
			try { packText = await readTextUnder(epRootHandle, "mods/" + modName + "/pack.json"); }
			catch (e) { continue; }
			let data;
			try { data = JSON.parse(packText); }
			catch (e) { continue; }
			if (data && data.enabled === false) continue;
			packIds.push(modName);
			const prefix = "exhibition-paperdoll/mods/" + modName;
			if (data && data.type === "base-overlay")
			{
				const entry = normalizePackAssets(data, prefix);
				entry.prefix = "mods/" + modName;
				baseOverlays.push(entry);
				continue;
			}
			if (data && data.type === "skin-overlay")
			{
				const entry = normalizePackAssets(data, prefix);
				entry.prefix = "mods/" + modName;
				skinOverlays.push(entry);
				continue;
			}
			if (data && data.type === "base-face-overlay")
			{
				const entry = normalizePackAssets(data, prefix);
				entry.prefix = "mods/" + modName;
				baseFaceOverlays.push(entry);
				continue;
			}
			if (data && data.type === "face-overlay")
			{
				const entry = normalizePackAssets(data, prefix);
				entry.prefix = "mods/" + modName;
				faceOverlays.push(entry);
				continue;
			}
			if (data && data.type === "hair-overlay")
			{
				const entry = normalizePackAssets(data, prefix);
				entry.prefix = "mods/" + modName;
				hairOverlays.push(entry);
				continue;
			}
			if (data && data.type === "makeup-overlay")
			{
				const entry = normalizePackAssets(data, prefix);
				entry.prefix = "mods/" + modName;
				makeupOverlays.push(entry);
				continue;
			}
			if (data && data.type === "body-writing-overlay")
			{
				const entry = normalizePackAssets(data, prefix);
				entry.prefix = "mods/" + modName;
				bodyWritingOverlays.push(entry);
				continue;
			}
			if (data && data.type === "effect-overlay")
			{
				const entry = normalizePackAssets(data, prefix);
				entry.prefix = "mods/" + modName;
				effectOverlays.push(entry);
				continue;
			}
			if (data && data.type === "appearance")
			{
				const packId = data.id || modName;
				const clothing = data.clothing || {};
				const skin = data.skinOverlay || data["skin-overlay"] || {};
				const baseFace = data.baseFaceOverlay || data["base-face-overlay"] || {};
				const face = data.faceOverlay || data["face-overlay"] || {};
				const hair = data.hairOverlay || data["hair-overlay"] || {};
				const makeup = data.makeupOverlay || data["makeup-overlay"] || {};
				const bodyWriting = data.bodyWritingOverlay || data["body-writing-overlay"] || {};
				const effect = data.effectOverlay || data["effect-overlay"] || {};
				if (clothing.items && clothing.items.length)
				{
					const norm = normalizePackAssets({ items: clothing.items }, prefix);
					mods.push({ id: packId, prefix: "mods/" + modName, items: norm.items });
				}
				if (skin.items && skin.items.length)
				{
					const entry = normalizePackAssets({ id: packId, type: "skin-overlay", items: skin.items }, prefix);
					entry.prefix = "mods/" + modName;
					skinOverlays.push(entry);
				}
				if (baseFace.items && baseFace.items.length)
				{
					const entry = normalizePackAssets({ id: packId, type: "base-face-overlay", items: baseFace.items }, prefix);
					entry.prefix = "mods/" + modName;
					baseFaceOverlays.push(entry);
				}
				if (face.items && face.items.length)
				{
					const entry = normalizePackAssets({ id: packId, type: "face-overlay", items: face.items }, prefix);
					entry.prefix = "mods/" + modName;
					faceOverlays.push(entry);
				}
				if (hair.items && hair.items.length)
				{
					const entry = normalizePackAssets({ id: packId, type: "hair-overlay", items: hair.items }, prefix);
					entry.prefix = "mods/" + modName;
					hairOverlays.push(entry);
				}
				if (makeup.items && makeup.items.length)
				{
					const entry = normalizePackAssets({ id: packId, type: "makeup-overlay", items: makeup.items }, prefix);
					entry.prefix = "mods/" + modName;
					makeupOverlays.push(entry);
				}
				if (bodyWriting.items && bodyWriting.items.length)
				{
					const entry = normalizePackAssets({ id: packId, type: "body-writing-overlay", items: bodyWriting.items }, prefix);
					entry.prefix = "mods/" + modName;
					bodyWritingOverlays.push(entry);
				}
				if (effect.items && effect.items.length)
				{
					const entry = normalizePackAssets({ id: packId, type: "effect-overlay", items: effect.items }, prefix);
					entry.prefix = "mods/" + modName;
					if (effect.effect) entry.effect = effect.effect;
					effectOverlays.push(entry);
				}
				continue;
			}
			if (data && data.items)
			{
				const norm = normalizePackAssets({ items: data.items }, prefix);
				mods.push({ id: data.id || modName, prefix: "mods/" + modName, items: norm.items });
			}
		}
		return { mods, baseOverlays, skinOverlays, baseFaceOverlays, faceOverlays, hairOverlays, makeupOverlays, bodyWritingOverlays, effectOverlays, packIds };
	}

	async function writeRuntimePacks(epRootHandle)
	{
		const buckets = await loadModBucketsFromHandle(epRootHandle);
		let basePack = null;
		try
		{
			basePack = normalizePackAssets(
				JSON.parse(await readTextUnder(epRootHandle, "base-pack/pack.json")),
				"exhibition-paperdoll/base-pack"
			);
		}
		catch (e) { /* no base-pack yet */ }

		const payload = {
			updatedAt: new Date().toISOString(),
			basePack: basePack,
			mods: buckets.mods,
			baseOverlays: buckets.baseOverlays,
			skinOverlays: buckets.skinOverlays,
			baseFaceOverlays: buckets.baseFaceOverlays,
			faceOverlays: buckets.faceOverlays,
			hairOverlays: buckets.hairOverlays,
			makeupOverlays: buckets.makeupOverlays,
			bodyWritingOverlays: buckets.bodyWritingOverlays,
			effectOverlays: buckets.effectOverlays,
		};
		const text = "/* Auto-generated — pack registry for local HTML games (do not edit by hand) */\n"
			+ "window.__exhibitionPaperdollRuntimePacks = "
			+ JSON.stringify(payload)
			+ ";\n";
		await writeFileUnder(epRootHandle, "runtime-packs.js", new Blob([text], { type: "application/javascript" }));
		return { modCount: buckets.mods.length, packCount: buckets.packIds.length };
	}

	async function refreshModsManifest(epRootHandle)
	{
		const buckets = await loadModBucketsFromHandle(epRootHandle);
		let modsDir;
		try { modsDir = await epRootHandle.getDirectoryHandle("mods"); }
		catch (e) { modsDir = await epRootHandle.getDirectoryHandle("mods", { create: true }); }

		const manifest = {
			packs: buckets.packIds,
			updatedAt: new Date().toISOString(),
		};
		await writeFileUnder(
			modsDir,
			"manifest.json",
			new Blob([JSON.stringify(manifest, null, 2) + "\n"], { type: "application/json" })
		);
		const runtime = await writeRuntimePacks(epRootHandle);
		return { packCount: buckets.packIds.length, modCount: runtime.modCount };
	}

	function applyEditorEmbed(payload)
	{
		if (!payload) return;
		window.__exhibitionEditorBaseEmbed = payload;
		const ep = window.setup && window.setup.ExhibitionPaperdoll;
		if (!ep) return;
		ep._embedImages = payload.images || {};
		ep._basePack = payload.pack || null;
		if (typeof ep.invalidate === "function") ep.invalidate();
	}

	async function readTextUnder(rootHandle, relPath)
	{
		const parts = String(relPath || "").replace(/\\/g, "/").split("/").filter(Boolean);
		let dir = rootHandle;
		for (let i = 0; i < parts.length - 1; i++)
			dir = await dir.getDirectoryHandle(parts[i]);
		const fh = await dir.getFileHandle(parts[parts.length - 1]);
		return await (await fh.getFile()).text();
	}

	async function readBlobUnder(rootHandle, relPath)
	{
		const parts = String(relPath || "").replace(/\\/g, "/").split("/").filter(Boolean);
		let dir = rootHandle;
		for (let i = 0; i < parts.length - 1; i++)
			dir = await dir.getDirectoryHandle(parts[i]);
		const fh = await dir.getFileHandle(parts[parts.length - 1]);
		return await (await fh.getFile()).arrayBuffer();
	}

	async function blobToDataUrl(blob)
	{
		return new Promise((resolve, reject) =>
		{
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result);
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(blob);
		});
	}

	async function rebuildEditorEmbed(epRootHandle)
	{
		const pack = JSON.parse(await readTextUnder(epRootHandle, "base-pack/pack.json"));
		const images = {};
		for (const layer of pack.layers || [])
		{
			for (const poseDef of Object.values(layer.poses || {}))
			{
				const sources = Object.assign({}, poseDef.sources || {});
				if (poseDef.asset) sources["256"] = sources["256"] || poseDef.asset;
				for (const path of Object.values(sources))
				{
					if (!path || images[path]) continue;
					const rel = path.replace(/^base-pack\//, "");
					try
					{
						const buf = await readBlobUnder(epRootHandle, "base-pack/" + rel);
						const mime = /\.png$/i.test(path) ? "image/png" : "image/jpeg";
						const dataUrl = await blobToDataUrl(new Blob([buf], { type: mime }));
						images[path] = dataUrl;
						images["base-pack/" + rel] = dataUrl;
					}
					catch (e) { /* missing asset */ }
				}
			}
		}
		const payload = { pack: pack, images: images };
		const text = "/* Auto-generated for offline editor preview */\n"
			+ "window.__exhibitionEditorBaseEmbed = "
			+ JSON.stringify(payload)
			+ ";\n";
		await writeFileUnder(
			epRootHandle,
			"standalone/base-embed.js",
			new Blob([text], { type: "application/javascript" })
		);
		applyEditorEmbed(payload);
		return { imageCount: Object.keys(images).length, pack: payload.pack, images: payload.images };
	}

	async function reloadRuntimePacks()
	{
		const ep = window.setup && window.setup.ExhibitionPaperdoll;
		if (ep && typeof ep.reloadMods === "function")
			await ep.reloadMods();
	}

	async function getStoredFileHandle(key, pickerId, forcePick)
	{
		if (!PackIO.canSaveToFolder()) throw new Error("File save is not supported in this browser");
		if (!forcePick)
		{
			const stored = await idbGet(key);
			if (stored)
			{
				try
				{
					const perm = await stored.queryPermission({ mode: "readwrite" });
					if (perm === "granted") return stored;
					if (perm === "prompt")
					{
						const req = await stored.requestPermission({ mode: "readwrite" });
						if (req === "granted") return stored;
					}
				}
				catch (e) { /* stale handle */ }
			}
		}
		const handles = await window.showOpenFilePicker({
			id: pickerId,
			multiple: false,
			types: [{
				description: "Game HTML",
				accept: { "text/html": [".html"] },
			}],
		});
		const handle = handles[0];
		await idbSet(key, handle);
		return handle;
	}

	async function requestWritePermission(handle)
	{
		if (!handle || typeof handle.queryPermission !== "function") return false;
		try
		{
			let perm = await handle.queryPermission({ mode: "readwrite" });
			if (perm === "granted") return true;
			if (perm === "prompt")
			{
				perm = await handle.requestPermission({ mode: "readwrite" });
				return perm === "granted";
			}
		}
		catch (e) { /* stale handle */ }
		return false;
	}

	async function resolveEpFromProject(projectRoot)
	{
		return projectRoot.getDirectoryHandle("exhibition-paperdoll");
	}

	async function validateEpRoot(epRoot)
	{
		try
		{
			await epRoot.getDirectoryHandle("core");
			return true;
		}
		catch (e) { /* continue */ }
		try
		{
			await epRoot.getDirectoryHandle("standalone");
			return true;
		}
		catch (e) { /* continue */ }
		return false;
	}

	async function tryFindGameHtml(projectRoot)
	{
		for (const name of GAME_HTML_PREFERRED_NAMES)
		{
			try { return { handle: await projectRoot.getFileHandle(name), name: name }; }
			catch (e) { /* try next */ }
		}
		return null;
	}

	async function accessFromStoredHandles(projectRoot, gameHtml, legacyEp, requestPerm)
	{
		if (projectRoot && gameHtml)
		{
			const okProject = requestPerm ? await requestWritePermission(projectRoot) : true;
			const okHtml = requestPerm ? await requestWritePermission(gameHtml) : true;
			if (okProject && okHtml)
			{
				try
				{
					const epRoot = await resolveEpFromProject(projectRoot);
					if (await validateEpRoot(epRoot))
						return { projectRoot: projectRoot, epRoot: epRoot, gameHtml: gameHtml };
				}
				catch (e) { /* invalid project root */ }
			}
		}

		if (legacyEp && gameHtml)
		{
			const okEp = requestPerm ? await requestWritePermission(legacyEp) : true;
			const okHtml = requestPerm ? await requestWritePermission(gameHtml) : true;
			if (okEp && okHtml && await validateEpRoot(legacyEp))
				return { projectRoot: null, epRoot: legacyEp, gameHtml: gameHtml };
		}
		return null;
	}

	async function resolveStoredGameAccess(options)
	{
		options = options || {};
		const projectRoot = await idbGet(PROJECT_ROOT_KEY);
		const gameHtml = await idbGet(GAME_HTML_HANDLE_KEY);
		const legacyEp = await idbGet(EP_ROOT_HANDLE_KEY);
		return accessFromStoredHandles(projectRoot, gameHtml, legacyEp, true);
	}

	async function hasStoredGameSetup()
	{
		if (typeof window.showDirectoryPicker !== "function"
			|| typeof window.showOpenFilePicker !== "function") return false;
		const projectRoot = await idbGet(PROJECT_ROOT_KEY);
		const gameHtml = await idbGet(GAME_HTML_HANDLE_KEY);
		const legacyEp = await idbGet(EP_ROOT_HANDLE_KEY);
		return !!(gameHtml && (projectRoot || legacyEp));
	}

	async function reconnectStoredGameAccess()
	{
		const projectRoot = await idbGet(PROJECT_ROOT_KEY);
		const gameHtml = await idbGet(GAME_HTML_HANDLE_KEY);
		const legacyEp = await idbGet(EP_ROOT_HANDLE_KEY);
		return accessFromStoredHandles(projectRoot, gameHtml, legacyEp, true);
	}

	async function verifyGameConnection(access)
	{
		access = access || await resolveStoredGameAccess({ silent: true });
		if (!access || !access.epRoot)
		{
			return {
				ok: false,
				checks: [{ id: "access", ok: false, label: "No game folder access" }],
				meta: await idbGet(SETUP_META_KEY),
			};
		}

		const ep = access.epRoot;
		const meta = await idbGet(SETUP_META_KEY);
		const checks = [];

		if (meta && meta.projectName)
			checks.push({ id: "folder", ok: true, label: "Game folder: " + meta.projectName });
		else
			checks.push({ id: "folder", ok: false, label: "Game folder name unknown" });

		try
		{
			await ep.getDirectoryHandle("core");
			checks.push({ id: "core", ok: true, label: "exhibition-paperdoll/core/ found" });
		}
		catch (e)
		{
			checks.push({ id: "core", ok: false, label: "exhibition-paperdoll/core/ missing" });
		}

		try
		{
			await ep.getDirectoryHandle("standalone");
			checks.push({ id: "standalone", ok: true, label: "exhibition-paperdoll/standalone/ found" });
		}
		catch (e)
		{
			checks.push({ id: "standalone", ok: false, label: "exhibition-paperdoll/standalone/ missing" });
		}

		try
		{
			await readTextUnder(ep, "base-pack/pack.json");
			checks.push({ id: "basePack", ok: true, label: "base-pack/pack.json readable" });
		}
		catch (e)
		{
			checks.push({ id: "basePack", ok: false, label: "base-pack/pack.json missing" });
		}

		try
		{
			await readTextUnder(ep, "runtime-packs.js");
			checks.push({ id: "runtime", ok: true, label: "runtime-packs.js present" });
		}
		catch (e)
		{
			checks.push({ id: "runtime", ok: false, label: "runtime-packs.js missing (save once to create)" });
		}

		if (access.gameHtml)
		{
			try
			{
				const htmlFile = await access.gameHtml.getFile();
				const name = htmlFile.name || "unknown";
				const preferred = GAME_HTML_PREFERRED_NAMES.includes(name);
				checks.push({
					id: "html",
					ok: preferred,
					label: "Game HTML: " + name + (preferred ? "" : " (check this is your game file)"),
				});
			}
			catch (e)
			{
				checks.push({ id: "html", ok: false, label: "Game HTML file not readable" });
			}
		}
		else
		{
			checks.push({ id: "html", ok: false, label: "Game HTML not connected" });
		}

		const requiredOk = checks.filter((c) => c.id !== "runtime").every((c) => c.ok);
		return { ok: requiredOk, checks: checks, meta: meta, access: access };
	}

	async function loadBasePackEditorState(epRootHandle)
	{
		if (!epRootHandle) return null;
		let pack;
		try { pack = JSON.parse(await readTextUnder(epRootHandle, "base-pack/pack.json")); }
		catch (e) { return null; }

		const bodyLayer = (pack.layers || []).find((l) => l && l.id === "body") || (pack.layers || [])[0];
		if (!bodyLayer) return null;

		const blobStore = {};
		async function loadPathIntoStore(path)
		{
			if (!path || blobStore[path]) return;
			const rel = String(path).replace(/^assets\//, "");
			try
			{
				const buf = await readBlobUnder(epRootHandle, "base-pack/" + rel);
				const mime = /\.png$/i.test(path) ? "image/png"
					: /\.webp$/i.test(path) ? "image/webp" : "image/jpeg";
				const blob = new Blob([buf], { type: mime });
				const url = URL.createObjectURL(blob);
				blobStore[path] = url;
				blobStore[path + "_blob"] = blob;
				blobStore["assets/" + rel] = url;
				blobStore["assets/" + rel + "_blob"] = blob;
				const base = rel.split("/").pop();
				blobStore[base] = url;
				blobStore[base + "_blob"] = blob;
			}
			catch (e) { /* missing asset on disk */ }
		}
		for (const poseDef of Object.values(bodyLayer.poses || {}))
		{
			if (!poseDef) continue;
			const sources = poseDef.sources || (poseDef.asset ? { 256: poseDef.asset } : {});
			for (const path of Object.values(sources))
				await loadPathIntoStore(path);
			if (poseDef.variants)
			{
				for (const vEntry of Object.values(poseDef.variants))
				{
					if (!vEntry || !vEntry.sources) continue;
					for (const path of Object.values(vEntry.sources))
						await loadPathIntoStore(path);
				}
			}
		}
		return hydrateBaseBody(bodyLayer, blobStore);
	}

	function mimeForAssetPath(path)
	{
		if (/\.png$/i.test(path)) return "image/png";
		if (/\.webp$/i.test(path)) return "image/webp";
		return "image/jpeg";
	}

	async function loadAssetFromModDisk(epRootHandle, modSlug, assetPath)
	{
		if (!epRootHandle || !modSlug || !assetPath) return null;
		const rel = String(assetPath).replace(/^assets\//, "");
		const diskPath = "mods/" + modSlug + "/assets/" + rel;
		try
		{
			const buf = await readBlobUnder(epRootHandle, diskPath);
			const blob = new Blob([buf], { type: mimeForAssetPath(rel) });
			return { url: URL.createObjectURL(blob), blob: blob, diskPath: diskPath };
		}
		catch (e) { return null; }
	}

	async function loadAssetFromModDiskAny(epRootHandle, modSlugs, assetPath)
	{
		if (!epRootHandle || !assetPath) return null;
		for (const slug of modSlugs || [])
		{
			const loaded = await loadAssetFromModDisk(epRootHandle, slug, assetPath);
			if (loaded) return loaded;
		}
		return null;
	}

	function collectItemAssetPaths(item, paths, add)
	{
		for (const poseDef of Object.values(item.poses || {}))
		{
			if (!poseDef) continue;
			for (const p of Object.values(poseDef.sources || {})) add(p);
			for (const p of Object.values(poseDef.colorMask || {})) add(p);
			for (const disp of Object.values(poseDef.displacements || {}))
			{
				if (!disp) continue;
				for (const kind of ["mask", "depth", "sources"])
				{
					const map = disp[kind];
					if (!map) continue;
					for (const p of Object.values(map)) add(p);
				}
			}
		}
	}

	function packItemLists(pack)
	{
		if (!pack || typeof pack !== "object") return [];
		if (pack.type === "appearance")
		{
			const lists = [];
			for (const key of ["clothing", "skinOverlay", "baseFaceOverlay", "faceOverlay", "hairOverlay", "makeupOverlay", "bodyWritingOverlay", "effectOverlay"])
			{
				const section = pack[key];
				if (section && Array.isArray(section.items) && section.items.length)
					lists.push(section.items);
			}
			return lists;
		}
		if (Array.isArray(pack.items) && pack.items.length) return [pack.items];
		if (Array.isArray(pack.overlays) && pack.overlays.length) return [pack.overlays];
		return [];
	}

	function collectPackAssetPaths(pack)
	{
		const paths = new Set();
		function add(path)
		{
			if (path && typeof path === "string") paths.add(path);
		}
		for (const items of packItemLists(pack))
		{
			for (const item of items)
				collectItemAssetPaths(item, paths, add);
		}
		return Array.from(paths);
	}

	function countPackItems(pack)
	{
		let count = 0;
		for (const items of packItemLists(pack)) count += items.length;
		return count;
	}

	async function loadModPackEditorState(epRootHandle, modSlug, options)
	{
		options = options || {};
		if (!epRootHandle || !modSlug) return null;
		modSlug = slugify(modSlug);
		const requestedPackType = options.packType
			|| editorModeToPackType(options.editorMode || "clothing", options);
		let pack = null;
		let resolvedSlug = modSlug;
		const slugCandidates = [modSlug];
		if (modSlug === APPEARANCE_PACK_ID)
		{
			const legacy = legacyPackSlugForMode(options.editorMode || "clothing");
			if (legacy) slugCandidates.push(legacy);
		}
		let legacyPack = null;
		for (const candidate of slugCandidates)
		{
			try
			{
				const parsed = JSON.parse(await readTextUnder(epRootHandle, "mods/" + candidate + "/pack.json"));
				if (!pack)
				{
					pack = parsed;
					resolvedSlug = candidate;
				}
				else if (!legacyPack && candidate !== resolvedSlug)
					legacyPack = parsed;
			}
			catch (e) { /* try next */ }
		}
		if (!pack) return null;

		const packType = requestedPackType;
		const editorMode = options.editorMode || packTypeToEditorMode(packType);
		let rawItems = extractPackSlice(pack, packType) || [];
		if (legacyPack)
		{
			const legacyItems = extractPackSlice(legacyPack, packType)
				|| (legacyPack.type === "clothing" ? legacyPack.items : null)
				|| [];
			const byId = new Map(rawItems.map((item) => [item.id, Object.assign({}, item)]));
			for (const legacyItem of legacyItems)
			{
				if (!legacyItem || !legacyItem.id) continue;
				const merged = byId.get(legacyItem.id) || Object.assign({}, legacyItem);
				if (!byId.has(legacyItem.id))
				{
					byId.set(legacyItem.id, merged);
					continue;
				}
				if (legacyItem.recolor) merged.recolor = true;
				merged.poses = merged.poses || {};
				for (const [poseId, legacyPose] of Object.entries(legacyItem.poses || {}))
				{
					if (!legacyPose) continue;
					const pose = merged.poses[poseId] = merged.poses[poseId] || {};
					if (!pose.sources && legacyPose.sources) pose.sources = legacyPose.sources;
					if (!pose.colorMask && legacyPose.colorMask) pose.colorMask = legacyPose.colorMask;
					if (!pose.transform && legacyPose.transform) pose.transform = legacyPose.transform;
				}
				byId.set(legacyItem.id, merged);
			}
			rawItems = Array.from(byId.values());
		}
		if (!rawItems.length) return null;
		const items = [];

		for (const [i, raw] of rawItems.entries())
		{
			const hydrated = hydrateItem(raw, {}, i);
			for (const poseId of Object.keys(hydrated.poses))
			{
				const rawPose = raw.poses && raw.poses[poseId];
				if (!rawPose) continue;

				const src = rawPose.sources || (rawPose.asset ? { 256: rawPose.asset } : {});
				for (const tier of LOD_TIERS)
				{
					const path = src[tier] || src[String(tier)];
					if (!path) continue;
					const loaded = await loadAssetFromModDiskAny(epRootHandle, slugCandidates, path);
					if (!loaded) continue;
					if (!hydrated.poses[poseId])
						hydrated.poses[poseId] = { sources: {}, transform: normalizeTransform(rawPose.transform) };
					hydrated.poses[poseId].sources[tier] = loaded.url;
					hydrated._assets[poseId + "_" + tier] = { url: loaded.url, blob: loaded.blob };
				}

				if (!hydrated.poses[poseId])
					hydrated.poses[poseId] = { sources: {}, transform: normalizeTransform(rawPose.transform) };
				hydrated.poses[poseId].colorMask = hydrated.poses[poseId].colorMask || {};
				const maskFromPack = rawPose.colorMask || {};
				for (const tier of LOD_TIERS)
				{
					if (hydrated.poses[poseId].colorMask[tier]) continue;
					const path = maskFromPack[tier] || maskFromPack[String(tier)]
						|| ("assets/items/" + hydrated.id + "/" + poseId + "_color_" + tier + ".png");
					const loaded = await loadAssetFromModDiskAny(epRootHandle, slugCandidates, path);
					if (!loaded) continue;
					hydrated.poses[poseId].colorMask[tier] = loaded.url;
					hydrated._assets["color_" + poseId + "_" + tier] = { url: loaded.url, blob: loaded.blob };
				}

				if (rawPose.displacements)
				{
					hydrated.poses[poseId].displacements = hydrated.poses[poseId].displacements || {};
					for (const [dispId, disp] of Object.entries(rawPose.displacements))
					{
						if (!disp) continue;
						const slot = hydrated.poses[poseId].displacements[dispId]
							= hydrated.poses[poseId].displacements[dispId] || {};
						for (const kind of ["mask", "depth", "sources"])
						{
							const map = disp[kind];
							if (!map) continue;
							slot[kind] = slot[kind] || {};
							for (const tier of LOD_TIERS)
							{
								const path = map[tier] || map[String(tier)];
								if (!path) continue;
								const loaded = await loadAssetFromModDiskAny(epRootHandle, slugCandidates, path);
								if (!loaded) continue;
								slot[kind][tier] = loaded.url;
								hydrated._assets["disp_" + dispId + "_" + kind + "_" + poseId + "_" + tier]
									= { url: loaded.url, blob: loaded.blob };
							}
						}
					}
				}
			}
			if (raw.recolor) hydrated.recolor = true;
			if (!hydrated.recolor)
			{
				for (const poseDef of Object.values(hydrated.poses))
				{
					if (poseDef && poseDef.colorMask && Object.keys(poseDef.colorMask).length)
					{
						hydrated.recolor = true;
						break;
					}
				}
			}
			items.push(hydrated);
		}
		syncPoseAssetsToPoses(items);

		const makeupSubTab = packType === "body-writing-overlay" ? "body-writing"
			: (packType === "base-face-overlay" || packType === "face-overlay" || packType === "hair-overlay" ? "face-hair"
				: (editorMode === "makeup" ? "makeup" : undefined));
		const faceHairKind = packType === "hair-overlay" ? "hair"
			: (packType === "base-face-overlay" ? "base-face"
				: (packType === "face-overlay" ? "face-part" : undefined));
		let poses = Array.isArray(pack.poses) && pack.poses.length ? pack.poses.slice() : null;
		if (!poses)
		{
			const found = new Set(["front", "back"]);
			for (const item of items)
			{
				for (const pid of Object.keys((item && item.poses) || {}))
					if (pid) found.add(pid);
			}
			poses = Array.from(found);
		}
		return {
			editorMode: editorMode,
			makeupSubTab: makeupSubTab,
			makeupSubKind: makeupSubTab,
			faceHairKind: faceHairKind,
			packType: packType,
			packId: pack.type === "appearance" ? APPEARANCE_PACK_ID : (pack.id || resolvedSlug),
			packName: pack.name || resolvedSlug,
			packDescription: pack.description || "",
			enabled: pack.enabled !== false,
			poses: poses,
			poseMeta: pack.poseMeta && typeof pack.poseMeta === "object" ? pack.poseMeta : {},
			items: items.length ? items : null,
		};
	}

	async function verifyModPackOnDisk(epRootHandle, modSlug)
	{
		modSlug = slugify(modSlug || "mod");
		const basePath = "mods/" + modSlug;
		const missing = [];
		const verified = [];
		let pack;
		try { pack = JSON.parse(await readTextUnder(epRootHandle, basePath + "/pack.json")); }
		catch (e)
		{
			return {
				ok: false,
				modSlug: modSlug,
				packPath: basePath,
				missing: [basePath + "/pack.json"],
				verified: [],
				imageCount: 0,
				itemCount: 0,
			};
		}

		for (const assetPath of collectPackAssetPaths(pack))
		{
			const rel = String(assetPath).replace(/^assets\//, "");
			const diskPath = basePath + "/assets/" + rel;
			try
			{
				const buf = await readBlobUnder(epRootHandle, diskPath);
				if (!buf || !buf.byteLength)
					missing.push(diskPath);
				else
					verified.push(diskPath);
			}
			catch (e) { missing.push(diskPath); }
		}

		return {
			ok: missing.length === 0,
			modSlug: modSlug,
			packPath: basePath,
			missing: missing,
			verified: verified,
			imageCount: verified.length,
			itemCount: countPackItems(pack),
		};
	}

	async function getStoredDirHandle(key, pickerId, forcePick)
	{
		if (!PackIO.canSaveToFolder()) throw new Error("Folder save is not supported in this browser");
		if (!forcePick)
		{
			const stored = await idbGet(key);
			if (stored)
			{
				try
				{
					const perm = await stored.queryPermission({ mode: "readwrite" });
					if (perm === "granted") return stored;
					if (perm === "prompt")
					{
						const req = await stored.requestPermission({ mode: "readwrite" });
						if (req === "granted") return stored;
					}
				}
				catch (e) { /* stale handle */ }
			}
		}
		const handle = await window.showDirectoryPicker({ id: pickerId, mode: "readwrite", startIn: "documents" });
		await idbSet(key, handle);
		return handle;
	}

	async function serializePoseDisplacements(item, poseId, poseDef, queueImage)
	{
		if (!poseDef || !poseDef.displacements) return null;
		const out = {};
		for (const [dispId, disp] of Object.entries(poseDef.displacements))
		{
			if (!disp || dispId === "normal") continue;
			const entry = {};
			const writeTierSet = async (kind, map, fnamePrefix) =>
			{
				if (!map) return;
				const built = {};
				for (const tier of LOD_TIERS)
				{
					if (!map[tier]) continue;
					const assetKey = "disp_" + dispId + "_" + kind + "_" + poseId + "_" + tier;
					const rel = await queueImage("items/" + item.id, fnamePrefix + "_" + tier + ".png", map[tier], item._assets && item._assets[assetKey]);
					if (rel) built[tier] = rel;
				}
				if (Object.keys(built).length) entry[kind] = built;
			};
			await writeTierSet("mask", disp.mask, poseId + "_" + dispId + "_mask");
			await writeTierSet("depth", disp.depth, poseId + "_" + dispId + "_depth");
			await writeTierSet("sources", disp.sources, poseId + "_" + dispId + "_custom");
			if (Object.keys(entry).length) out[dispId] = entry;
		}
		return Object.keys(out).length ? out : null;
	}

	async function mergeIntoAppearancePack(epRootHandle, modSlug, packType, sectionPack, state)
	{
		let existing = null;
		if (epRootHandle)
		{
			try { existing = JSON.parse(await readTextUnder(epRootHandle, "mods/" + modSlug + "/pack.json")); }
			catch (e) { /* new pack */ }
		}
		let appearance = existing && existing.type === "appearance"
			? Object.assign({}, existing)
			: {
				id: APPEARANCE_PACK_ID,
				type: "appearance",
				name: state.packName || "Appearance mod",
				description: state.packDescription || "",
				enabled: state.enabled !== false,
				clothing: { items: [] },
				skinOverlay: { items: [] },
				baseFaceOverlay: { items: [] },
				faceOverlay: { items: [] },
				hairOverlay: { items: [] },
				makeupOverlay: { items: [] },
				bodyWritingOverlay: { items: [] },
				effectOverlay: { items: [], effect: "wet" },
			};
		if (existing && existing.type === "appearance")
		{
			if (existing.clothing) appearance.clothing = existing.clothing;
			if (existing.skinOverlay) appearance.skinOverlay = existing.skinOverlay;
			if (existing.baseFaceOverlay) appearance.baseFaceOverlay = existing.baseFaceOverlay;
			if (existing.faceOverlay) appearance.faceOverlay = existing.faceOverlay;
			if (existing.hairOverlay) appearance.hairOverlay = existing.hairOverlay;
			if (existing.makeupOverlay) appearance.makeupOverlay = existing.makeupOverlay;
			if (existing.bodyWritingOverlay) appearance.bodyWritingOverlay = existing.bodyWritingOverlay;
			if (existing.effectOverlay) appearance.effectOverlay = existing.effectOverlay;
		}
		if (existing && existing.type === "clothing" && existing.items)
			appearance.clothing = { items: existing.items };
		if (existing && existing.type === "skin-overlay" && existing.items)
			appearance.skinOverlay = { items: existing.items };
		if (existing && existing.type === "base-face-overlay" && existing.items)
			appearance.baseFaceOverlay = { items: existing.items };
		if (existing && existing.type === "face-overlay" && existing.items)
			appearance.faceOverlay = { items: existing.items };
		if (existing && existing.type === "hair-overlay" && existing.items)
			appearance.hairOverlay = { items: existing.items };
		if (existing && existing.type === "makeup-overlay" && existing.items)
			appearance.makeupOverlay = { items: existing.items };
		if (existing && existing.type === "body-writing-overlay" && existing.items)
			appearance.bodyWritingOverlay = { items: existing.items };
		if (existing && existing.type === "effect-overlay" && existing.items)
			appearance.effectOverlay = { items: existing.items, effect: existing.effect || "wet" };
		const key = appearanceSectionKey(packType);
		const section = { items: (sectionPack && sectionPack.items) || [] };
		if (packType === "effect-overlay")
			section.effect = (sectionPack && sectionPack.effect) || "wet";
		appearance[key] = section;
		appearance.name = state.packName || appearance.name || "Appearance mod";
		appearance.description = state.packDescription != null ? state.packDescription : (appearance.description || "");
		appearance.enabled = state.enabled !== false;
		return appearance;
	}

	async function buildPackArtifacts(state, epRootHandle)
	{
		syncPoseAssetsToPoses(state.items);
		let modSlug = slugify(state.packId || state.packName || "mod");
		if (state.packType !== "base" && state.packType !== "base-overlay")
			modSlug = APPEARANCE_PACK_ID;
		const written = new Set();
		const files = [];
		const packDiskRoot = state.packType === "base" ? "base-pack"
			: (modSlug === "base-pack" ? "base-pack" : "mods/" + modSlug);

		async function queueImage(folder, filename, sourceUrl, assetRecord)
		{
			const pathKey = folder + "/" + filename;
			if (written.has(pathKey)) return "assets/" + pathKey;
			const diskRel = packDiskRoot + "/assets/" + pathKey;
			const blob = await resolveImageBlob(sourceUrl, assetRecord, epRootHandle, diskRel);
			if (!blob) return null;
			files.push({ rel: "assets/" + folder + "/" + filename, blob: blob });
			written.add(pathKey);
			return "assets/" + folder + "/" + filename;
		}

		let packJson;

		if (state.packType === "base")
		{
			const body = mergeBaseBodyItems(state.items);
			const layerPoses = {};
			for (const [poseId, poseDef] of Object.entries(body.poses || {}))
			{
				if (!poseDef) continue;
				const sources = {};
				if (poseDef.sources)
				{
					for (const tier of LOD_TIERS)
					{
						if (!poseDef.sources[tier]) continue;
						const rel = await queueImage("poses/" + poseId, "body_" + tier + ".png", poseDef.sources[tier], body._assets && body._assets[poseId + "_" + tier]);
						if (rel) sources[tier] = rel;
					}
				}
				const poseRow = { transform: normalizeTransform(poseDef.transform) };
				if (Object.keys(sources).length) poseRow.sources = sources;
				// Body shape / part-size variants (physique, breasts, ass, …)
				if (poseDef.variants && typeof poseDef.variants === "object")
				{
					const variants = {};
					for (const [vKey, vEntry] of Object.entries(poseDef.variants))
					{
						if (!vEntry || !vEntry.sources) continue;
						const vSources = {};
						const safe = String(vKey).replace(/[^a-z0-9]+/gi, "_");
						for (const tier of LOD_TIERS)
						{
							if (!vEntry.sources[tier]) continue;
							const fname = "body_" + safe + "_" + tier + ".png";
							const assetKey = poseId + "_var_" + vKey + "_" + tier;
							const rel = await queueImage(
								"poses/" + poseId + "/variants",
								fname,
								vEntry.sources[tier],
								body._assets && body._assets[assetKey]
							);
							if (rel) vSources[tier] = rel;
						}
						if (Object.keys(vSources).length)
						{
							variants[vKey] = {
								sources: vSources,
								transform: normalizeTransform(vEntry.transform || poseDef.transform),
							};
						}
					}
					if (Object.keys(variants).length) poseRow.variants = variants;
				}
				if (poseRow.sources || poseRow.variants)
					layerPoses[poseId] = poseRow;
			}
			modSlug = "base-pack";
			packJson = {
				id: "base",
				type: "base",
				name: state.packName || "Exhibition Base Doll",
				description: state.packDescription || "",
				canvas: { width: 256, height: 512 },
				lod: { reference: 256, tiers: LOD_TIERS },
				poses: (state.poses && state.poses.length) ? state.poses.slice() : activePoseIds(),
				poseMeta: state.poseMeta || {},
				layers: [{ id: "body", zIndex: 10, poses: layerPoses }],
			};
		}
		else if (state.packType === "skin-overlay" || state.packType === "effect-overlay")
		{
			const items = [];
			const assetFolder = state.packType === "skin-overlay" ? "skin" : "wet";
			for (const item of state.items)
			{
				const poses = {};
				for (const [poseId, poseDef] of Object.entries(item.poses))
				{
					if (!poseDef || !poseDef.sources) continue;
					const sources = {};
					for (const tier of LOD_TIERS)
					{
						if (!poseDef.sources[tier]) continue;
						const fname = poseId + "_" + tier + ".png";
						const rel = await queueImage(assetFolder + "/" + item.id, fname, poseDef.sources[tier], item._assets && item._assets[poseId + "_" + tier]);
						if (rel) sources[tier] = rel;
					}
					if (Object.keys(sources).length) poses[poseId] = { sources: sources, transform: normalizeTransform(poseDef.transform) };
				}
				if (!Object.keys(poses).length) continue;
				items.push({
					id: item.id,
					name: item.name,
					layer: item.layer || assetFolder,
					zIndex: item.zIndex,
					poses: poses,
				});
			}
			packJson = {
				id: state.packId || modSlug,
				type: state.packType,
				name: state.packName || modSlug,
				description: state.packDescription || "",
				enabled: state.enabled !== false,
				items: items,
			};
			if (state.packType === "effect-overlay") packJson.effect = "wet";
		}
		else if (state.packType === "base-overlay")
		{
			const overlays = [];
			for (const item of state.items)
			{
				const poses = {};
				for (const [poseId, poseDef] of Object.entries(item.poses))
				{
					if (!poseDef || !poseDef.sources) continue;
					const sources = {};
					for (const tier of LOD_TIERS)
					{
						if (!poseDef.sources[tier]) continue;
						const fname = poseId + "_" + tier + ".png";
						const rel = await queueImage("poses/" + item.layer, fname, poseDef.sources[tier], item._assets && item._assets[poseId + "_" + tier]);
						if (rel) sources[tier] = rel;
					}
					if (Object.keys(sources).length) poses[poseId] = { sources: sources, transform: normalizeTransform(poseDef.transform) };
				}
				if (Object.keys(poses).length)
					overlays.push({ layer: item.layer, zIndex: item.zIndex, poses: poses });
			}
			packJson = {
				id: state.packId || modSlug,
				type: "base-overlay",
				name: state.packName || modSlug,
				description: state.packDescription || "",
				enabled: state.enabled !== false,
				overlays: overlays,
			};
		}
		else if (state.packType === "clothing" || state.packType === "makeup-overlay"
			|| state.packType === "body-writing-overlay" || state.packType === "base-face-overlay"
			|| state.packType === "face-overlay" || state.packType === "hair-overlay")
		{
			const assetFolder = state.packType === "makeup-overlay" ? "makeup"
				: (state.packType === "body-writing-overlay" ? "bodywriting"
					: (state.packType === "base-face-overlay" ? "base-face"
						: (state.packType === "face-overlay" ? "face"
							: (state.packType === "hair-overlay" ? "hair" : "items"))));
			const items = [];
			for (const item of state.items)
			{
				const poses = {};
				for (const [poseId, poseDef] of Object.entries(item.poses))
				{
					if (!poseDef || !poseDef.sources) continue;
					const sources = {};
					for (const tier of LOD_TIERS)
					{
						if (!poseDef.sources[tier]) continue;
						const fname = poseId + "_" + tier + ".png";
						const rel = await queueImage(assetFolder + "/" + item.id, fname, poseDef.sources[tier], item._assets && item._assets[poseId + "_" + tier]);
						if (rel) sources[tier] = rel;
					}
					if (!Object.keys(sources).length) continue;
					const poseRow = { sources: sources, transform: normalizeTransform(poseDef.transform) };
					const displacements = await serializePoseDisplacements(item, poseId, poseDef, queueImage);
					if (displacements) poseRow.displacements = displacements;
					if (poseDef.colorMask && Object.keys(poseDef.colorMask).length)
					{
						const colorMask = {};
						for (const tier of LOD_TIERS)
						{
							if (!poseDef.colorMask[tier]) continue;
							const fname = poseId + "_color_" + tier + ".png";
							const rel = await queueImage(
								assetFolder + "/" + item.id,
								fname,
								poseDef.colorMask[tier],
								item._assets && item._assets["color_" + poseId + "_" + tier]
							);
							if (rel) colorMask[tier] = rel;
						}
						if (Object.keys(colorMask).length) poseRow.colorMask = colorMask;
					}
					poses[poseId] = poseRow;
				}
				if (!Object.keys(poses).length) continue;
				const row = {
					id: item.id,
					name: item.name,
					zIndex: item.zIndex,
					poses: poses,
				};
				if (item.layer) row.layer = item.layer;
				if (item.makeupSlot) row.makeupSlot = item.makeupSlot;
				if (item.facePartSlot) row.facePartSlot = item.facePartSlot;
				if (item.hairLayer) row.hairLayer = item.hairLayer;
				if (item.bodyWritingPlacement) row.bodyWritingPlacement = item.bodyWritingPlacement;
				if (item.cotBindings && item.cotBindings.length) row.cotBindings = item.cotBindings;
				// Base faces must bind to catalog id (person["paperdoll face"]) for in-game draw
				else if (state.packType === "base-face-overlay" && item.id)
					row.cotBindings = [item.id];
				else if ((item.layer === "base-face" || String(item.id || "").indexOf("base-face") === 0) && item.id)
					row.cotBindings = [item.id];
				let itemHasColorMask = !!item.recolor;
				if (!itemHasColorMask)
				{
					for (const poseDef of Object.values(item.poses || {}))
					{
						if (poseDef && poseDef.colorMask && Object.keys(poseDef.colorMask).length)
						{
							itemHasColorMask = true;
							break;
						}
					}
				}
				if (itemHasColorMask) row.recolor = true;
				if (item.exposureDisplacements && Object.keys(item.exposureDisplacements).length)
					row.exposureDisplacements = Object.assign({}, item.exposureDisplacements);
				if (Array.isArray(item.enabledDisplacements) && item.enabledDisplacements.length)
				{
					row.enabledDisplacements = item.enabledDisplacements
						.filter((id) => id && id !== "normal")
						.map(String);
				}
				if (Array.isArray(item.clothingFlags) && item.clothingFlags.length)
					row.clothingFlags = item.clothingFlags.map(String).filter(Boolean);
				if (item.gameClothing && item.gameClothing.itemId)
					row.gameClothing = Object.assign({}, item.gameClothing);
				if (item.skinSubKey) row.skinSubKey = item.skinSubKey;
				if (item.skinSubValue != null && item.skinSubValue !== "")
					row.skinSubValue = item.skinSubValue;
				items.push(row);
			}
			packJson = {
				id: state.packId || modSlug,
				type: state.packType,
				name: state.packName || modSlug,
				description: state.packDescription || "",
				enabled: state.enabled !== false,
				poses: (state.poses && state.poses.length) ? state.poses.slice() : activePoseIds(),
				poseMeta: state.poseMeta && typeof state.poseMeta === "object" ? state.poseMeta : {},
				items: items,
			};
			if (state.packType === "clothing") packJson.maskMode = "default";
		}

		if (state.packType !== "base" && state.packType !== "base-overlay")
			packJson = await mergeIntoAppearancePack(epRootHandle, modSlug, state.packType, packJson, state);

		// Always stamp active pose list for sharing / multi-pose packs
		if (packJson && typeof packJson === "object")
		{
			if (!packJson.poses || !packJson.poses.length)
				packJson.poses = (state.poses && state.poses.length) ? state.poses.slice() : activePoseIds();
			if (!packJson.poseMeta || typeof packJson.poseMeta !== "object")
				packJson.poseMeta = state.poseMeta && typeof state.poseMeta === "object" ? state.poseMeta : {};
		}

		return { modSlug: modSlug, packJson: packJson, files: files };
	}

	function extractClothesCatalogBlock(text)
	{
		const marker = "setup.clothes = {";
		const start = text.indexOf(marker);
		if (start < 0) return null;
		const brace = start + marker.length - 1;
		if (brace < 0) return null;
		let depth = 0;
		for (let i = brace; i < text.length; i++)
		{
			if (text[i] === "{") depth++;
			else if (text[i] === "}")
			{
				depth--;
				if (depth === 0) return text.slice(brace, i + 1);
			}
		}
		return null;
	}

	const MAKEUP_SLOTS = ["eyeshadow", "eyeliner", "mascara", "lipstick", "blush", "fingernails", "toenails"];

	const FACE_PART_SLOTS = ["nose", "eyes", "eyelashes", "eyebrows", "lips", "cheeks", "chin", "face"];

	function parseDistinguishingMarksFromHtml(text)
	{
		const block = extractJsObjectBlock(text, "setup.distinguishing_marks =");
		if (!block) return [];
		const items = [];
		let i = block.indexOf("\"");
		while (i >= 0 && i < block.length)
		{
			const rest = block.slice(i);
			const keyMatch = rest.match(/^"((?:\\.|[^"\\])*)"\s*:\s*\n?\s*\{/);
			if (!keyMatch)
			{
				i = block.indexOf("\"", i + 1);
				continue;
			}
			const id = keyMatch[1].replace(/\\"/g, "\"").replace(/\\\\/g, "\\");
			const entryStart = i + keyMatch[0].length - 1;
			let depth = 0;
			let j = entryStart;
			for (; j < block.length; j++)
			{
				if (block[j] === "{") depth++;
				else if (block[j] === "}")
				{
					depth--;
					if (depth === 0) { j++; break; }
				}
			}
			const body = block.slice(entryStart, j);
			const slotMatch = body.match(/slot\s*:\s*"([^"]+)"/);
			const slot = slotMatch ? slotMatch[1] : "face";
			items.push({ id: id, name: id, slot: slot, category: slot });
			i = block.indexOf("\"", j);
		}
		items.sort((a, b) => (a.slot || "").localeCompare(b.slot || "") || a.name.localeCompare(b.name));
		return items;
	}

	function parseHairstylesFromHtml(text)
	{
		const block = extractJsObjectBlock(text, "setup.hairstyles =");
		if (!block) return [];
		const items = [];
		let i = block.indexOf("\"");
		while (i >= 0 && i < block.length)
		{
			const rest = block.slice(i);
			const keyMatch = rest.match(/^"((?:\\.|[^"\\])*)"\s*:\s*\{/);
			if (!keyMatch)
			{
				i = block.indexOf("\"", i + 1);
				continue;
			}
			const id = keyMatch[1].replace(/\\"/g, "\"").replace(/\\\\/g, "\\");
			const entryStart = i + keyMatch[0].length - 1;
			let depth = 0;
			let j = entryStart;
			for (; j < block.length; j++)
			{
				if (block[j] === "{") depth++;
				else if (block[j] === "}")
				{
					depth--;
					if (depth === 0) { j++; break; }
				}
			}
			const body = block.slice(entryStart, j);
			const basic = /"basic"\s*:\s*true/.test(body);
			const updo = /"updo"\s*:\s*true/.test(body);
			const tags = [];
			if (basic) tags.push("basic");
			if (updo) tags.push("updo");
			items.push({
				id: id,
				name: id,
				slot: updo ? "updo" : "loose",
				category: basic ? "basic" : "style",
				tags: tags,
			});
			i = block.indexOf("\"", j);
		}
		items.sort((a, b) => (a.category || "").localeCompare(b.category || "") || a.name.localeCompare(b.name));
		return items;
	}

	function loadBaseFacesCatalog()
	{
		if (typeof setup !== "undefined"
			&& setup.ExhibitionPaperdoll
			&& setup.ExhibitionPaperdoll.BaseFaces
			&& setup.ExhibitionPaperdoll.BaseFaces.catalogList)
			return setup.ExhibitionPaperdoll.BaseFaces.catalogList();
		return [
			{ id: "base-face-1", name: "Base face 1", slot: "base", category: "base" },
			{ id: "base-face-2", name: "Base face 2", slot: "base", category: "base" },
			{ id: "base-face-3", name: "Base face 3", slot: "base", category: "base" },
		];
	}

	async function loadFacePartsCatalog(access)
	{
		if (!access || !access.gameHtml) return [];
		try
		{
			const file = await access.gameHtml.getFile();
			return parseDistinguishingMarksFromHtml(await file.text());
		}
		catch (e)
		{
			console.warn("[PackIO] loadFacePartsCatalog failed", e);
			return [];
		}
	}

	async function loadHairstylesCatalog(access)
	{
		if (!access || !access.gameHtml) return [];
		try
		{
			const file = await access.gameHtml.getFile();
			return parseHairstylesFromHtml(await file.text());
		}
		catch (e)
		{
			console.warn("[PackIO] loadHairstylesCatalog failed", e);
			return [];
		}
	}

	const BODY_WRITING_PLACEMENTS = [
		{ id: "forehead", name: "Forehead", slot: "forehead", category: "head" },
		{ id: "cheek", name: "Cheek", slot: "cheek", category: "head" },
		{ id: "chin", name: "Chin", slot: "chin", category: "head" },
		{ id: "neck", name: "Neck", slot: "neck", category: "torso" },
		{ id: "chest", name: "Chest", slot: "chest", category: "torso" },
		{ id: "stomach", name: "Stomach", slot: "stomach", category: "torso" },
		{ id: "back", name: "Back", slot: "back", category: "torso" },
		{ id: "lower_back", name: "Lower back", slot: "lower_back", category: "torso" },
		{ id: "shoulder", name: "Shoulder", slot: "shoulder", category: "limb" },
		{ id: "upper_arm", name: "Upper arm", slot: "upper_arm", category: "limb" },
		{ id: "forearm", name: "Forearm", slot: "forearm", category: "limb" },
		{ id: "thigh", name: "Thigh", slot: "thigh", category: "limb" },
		{ id: "calf", name: "Calf", slot: "calf", category: "limb" },
		{ id: "buttock", name: "Buttock", slot: "buttock", category: "limb" },
		{ id: "hip", name: "Hip", slot: "hip", category: "limb" },
	];

	function loadBodyWritingCatalog()
	{
		return BODY_WRITING_PLACEMENTS.slice();
	}

	function extractJsObjectBlock(text, marker)
	{
		const start = text.indexOf(marker);
		if (start < 0) return null;
		const brace = text.indexOf("{", start);
		if (brace < 0) return null;
		let depth = 0;
		for (let i = brace; i < text.length; i++)
		{
			if (text[i] === "{") depth++;
			else if (text[i] === "}")
			{
				depth--;
				if (depth === 0) return text.slice(brace, i + 1);
			}
		}
		return null;
	}

	function expandMakeupAppliedTemplate(template, type, color)
	{
		return String(template || "")
			.replace(/%type/gi, type || "")
			.replace(/%color/gi, color || "")
			.replace(/\s+/g, " ")
			.trim();
	}

	function parseMakeupCatalogFromHtml(text)
	{
		const items = [];
		const seen = new Set();
		function add(row)
		{
			if (!row || !row.id || seen.has(row.id)) return;
			seen.add(row.id);
			items.push(row);
		}

		const stylesBlock = extractJsObjectBlock(text, "setup.makeup_styles =");
		if (stylesBlock)
		{
			for (const slot of MAKEUP_SLOTS)
			{
				const re = new RegExp("\"" + slot + "\"\\s*:\\s*\\[([^\\]]+)\\]", "g");
				let match;
				while ((match = re.exec(stylesBlock)))
				{
					const tokens = [];
					const tokRe = /"([^"]+)"|(\d+)/g;
					let tok;
					while ((tok = tokRe.exec(match[1])))
						tokens.push(tok[1] != null ? tok[1] : Number(tok[2]));
					for (let i = 0; i < tokens.length; i += 2)
					{
						const name = tokens[i];
						if (typeof name !== "string" || !name || name === "none") continue;
						add({ id: name, name: name, slot: slot, category: slot });
					}
				}
			}
		}

		const cosmeticsBlock = extractJsObjectBlock(text, "setup.Cosmetics.makeup = {");
		const makeupCategories = ["Nail Polish", "Eyeliner", "Eyeshadow", "Mascara", "Blush", "Lipstick"];
		if (cosmeticsBlock)
		{
			for (const category of makeupCategories)
			{
				const catRe = new RegExp("\"" + category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\"\\s*:\\s*\\{([\\s\\S]*?)\\n\\s*\\},", "m");
				const catMatch = cosmeticsBlock.match(catRe);
				if (!catMatch) continue;
				const body = catMatch[1];
				const appliedMatch = body.match(/applied\s*:\s*"([^"]+)"/);
				const slotsMatch = body.match(/slots\s*:\s*\[([^\]]+)\]/);
				if (!appliedMatch || !slotsMatch) continue;
				const appliedTemplate = appliedMatch[1];
				const slots = (slotsMatch[1].match(/"([^"]+)"/g) || []).map((s) => s.slice(1, -1));
				const types = (body.match(/"sub type"\s*:\s*\[([\s\S]*?)\]/) || [])[1];
				const colors = (body.match(/"sub color"\s*:\s*\[([\s\S]*?)\]/) || [])[1];
				const typeList = types
					? (types.match(/"([^"]+)"/g) || []).map((s) => s.slice(1, -1))
					: [""];
				const colorList = colors
					? (colors.match(/"([^"]+)"/g) || []).map((s) => s.slice(1, -1))
					: [""];
				for (const slot of slots)
				{
					if (!MAKEUP_SLOTS.includes(slot)) continue;
					for (const type of typeList)
					{
						for (const color of colorList)
						{
							const name = expandMakeupAppliedTemplate(appliedTemplate, type, color);
							if (!name || name === "none") continue;
							add({ id: name, name: name, slot: slot, category: category });
						}
					}
				}
			}
		}

		items.sort((a, b) => (a.slot || "").localeCompare(b.slot || "") || a.name.localeCompare(b.name));
		return items;
	}

	async function loadMakeupCatalog(access)
	{
		if (!access || !access.gameHtml) return [];
		try
		{
			const file = await access.gameHtml.getFile();
			return parseMakeupCatalogFromHtml(await file.text());
		}
		catch (e)
		{
			console.warn("[PackIO] loadMakeupCatalog failed", e);
			return [];
		}
	}

	function parseClothesCatalogFromHtml(text)
	{
		const block = extractClothesCatalogBlock(text);
		if (!block) return [];
		const items = [];
		let i = block.indexOf("\"");
		while (i >= 0 && i < block.length)
		{
			const rest = block.slice(i);
			const keyMatch = rest.match(/^"((?:\\.|[^"\\])*)"\s*:\s*\n?\s*\{/);
			if (!keyMatch)
			{
				i = block.indexOf("\"", i + 1);
				continue;
			}
			const id = keyMatch[1].replace(/\\"/g, "\"").replace(/\\\\/g, "\\");
			const entryStart = i + keyMatch[0].length - 1;
			let depth = 0;
			let j = entryStart;
			for (; j < block.length; j++)
			{
				if (block[j] === "{") depth++;
				else if (block[j] === "}")
				{
					depth--;
					if (depth === 0) break;
				}
			}
			const body = block.slice(entryStart, j + 1);
			const cat = body.match(/"category"\s*:\s*"([^"]+)"/);
			const name = body.match(/"name"\s*:\s*"([^"]+)"/);
			const short = body.match(/"shortname"\s*:\s*"([^"]+)"/);
			items.push({
				id: id,
				category: cat ? cat[1] : "other",
				name: name ? name[1] : id,
				shortname: short ? short[1] : "",
			});
			i = block.indexOf("\"", j + 1);
		}
		items.sort((a, b) => a.id.localeCompare(b.id));
		return items;
	}

	async function loadClothingCatalog(access)
	{
		if (!access || !access.gameHtml) return [];
		try
		{
			const file = await access.gameHtml.getFile();
			return parseClothesCatalogFromHtml(await file.text());
		}
		catch (e)
		{
			console.warn("[PackIO] loadClothingCatalog failed", e);
			return [];
		}
	}

	async function loadClothingDesignCatalog(access)
	{
		const Skins = window.ExhibitionClothingSkins;
		if (access && access.gameHtml && Skins && Skins.parseClothingDesignsFromHtml)
		{
			try
			{
				const file = await access.gameHtml.getFile();
				const parsed = Skins.parseClothingDesignsFromHtml(await file.text());
				if (parsed && parsed.items && parsed.items.length) return parsed;
			}
			catch (e)
			{
				console.warn("[PackIO] live design catalog failed", e);
			}
		}
		try
		{
			const url = new URL("clothing-designs-catalog.json", window.location.href);
			const res = await fetch(url.href);
			if (res.ok) return await res.json();
		}
		catch (e)
		{
			console.warn("[PackIO] design catalog JSON missing", e);
		}
		return { standard_graphics: [], items: [] };
	}

	function serializePose(poseDef, modSlug, assetPathFn)
	{
		if (!poseDef || !poseDef.sources) return null;
		const sources = {};
		for (const tier of LOD_TIERS)
		{
			if (!poseDef.sources[tier]) continue;
			sources[tier] = assetPathFn(tier);
		}
		if (!Object.keys(sources).length) return null;
		return { sources: sources, transform: normalizeTransform(poseDef.transform) };
	}

	const PackIO = {
		LOD_TIERS: LOD_TIERS,
		DEFAULT_TRANSFORM: DEFAULT_TRANSFORM,
		activePoseIds: activePoseIds,
		emptyPoseMap: emptyPoseMap,
		ensureItemsHavePoses: ensureItemsHavePoses,
		blankItem: blankItem,
		blankOverlay: blankOverlay,
		blankBaseBody: blankBaseBody,
		blankSkinItem: blankSkinItem,
		blankMakeupItem: blankMakeupItem,
		blankBodyWritingItem: blankBodyWritingItem,
		blankFacePartItem: blankFacePartItem,
		blankHairItem: blankHairItem,
		blankWetItem: blankWetItem,
		FACE_PART_SLOTS: FACE_PART_SLOTS,
		resolveMakeupPackType: resolveMakeupPackType,
		defaultBlankForMode: defaultBlankForMode,
		packTypeToEditorMode: packTypeToEditorMode,
		editorModeToPackType: editorModeToPackType,
		syncPoseAssetsToPoses: syncPoseAssetsToPoses,
		APPEARANCE_PACK_ID: APPEARANCE_PACK_ID,
		slugify: slugify,
		parseBindings: parseBindings,
		bindingsToText: bindingsToText,
		normalizeTransform: normalizeTransform,

		editorLayersFromState(state)
		{
			syncPoseAssetsToPoses(state.items);
			const out = [];
			for (const item of state.items)
			{
				const poses = {};
				let hasColorMask = false;
				for (const [poseId, poseDef] of Object.entries(item.poses || {}))
				{
					if (!poseDef || !poseDef.sources || !Object.keys(poseDef.sources).length) continue;
					const poseCopy = Object.assign({}, poseDef, {
						sources: Object.assign({}, poseDef.sources),
					});
					if (poseDef.colorMask && Object.keys(poseDef.colorMask).length)
					{
						poseCopy.colorMask = Object.assign({}, poseDef.colorMask);
						hasColorMask = true;
					}
					poses[poseId] = poseCopy;
				}
				if (!Object.keys(poses).length) continue;
				const layerId = state.packType === "base" ? "body"
					: (state.packType === "base-overlay" ? item.layer : item.id);
				const layer = { id: layerId, zIndex: item.zIndex, poses: poses };
				if (item.recolor || hasColorMask) layer.recolor = true;
				if (state.previewTintColor && (item.recolor || hasColorMask))
					layer.tintColor = state.previewTintColor;
				out.push(layer);
			}
			return out;
		},

		async importZip(file)
		{
			const zip = await window.JSZip.loadAsync(file);
			let packRaw = null;
			zip.forEach((rel, entry) =>
			{
				if (entry.dir) return;
				if (rel.endsWith("pack.json") && !packRaw) packRaw = rel;
			});
			if (!packRaw) throw new Error("No pack.json found in ZIP");

			const packText = await zip.file(packRaw).async("string");
			const pack = JSON.parse(packText);
			const modRoot = packRaw.includes("/") ? packRaw.slice(0, packRaw.lastIndexOf("/")) : "";
			const blobStore = {};

			const imageFiles = [];
			zip.forEach((rel, entry) =>
			{
				if (entry.dir) return;
				if (!/\.(png|webp|jpg|jpeg)$/i.test(rel)) return;
				imageFiles.push(rel);
			});

			for (const rel of imageFiles)
			{
				const blob = await zip.file(rel).async("blob");
				const url = URL.createObjectURL(blob);
				const normalized = rel.replace(/\\/g, "/");
				const short = modRoot && normalized.startsWith(modRoot + "/")
					? normalized.slice(modRoot.length + 1)
					: normalized;
				blobStore[short] = url;
				blobStore[short + "_blob"] = blob;
				blobStore[normalized] = url;
				blobStore[normalized + "_blob"] = blob;
			}

			const resolvePath = (p) =>
			{
				if (!p) return null;
				const clean = p.replace(/\\/g, "/");
				if (blobStore[clean]) return blobStore[clean];
				const base = clean.split("/").pop();
				for (const key of Object.keys(blobStore))
				{
					if (key.endsWith("/" + base) || key === base) return blobStore[key];
				}
				return null;
			};

			const resolveBlob = (p) =>
			{
				if (!p) return null;
				const clean = p.replace(/\\/g, "/");
				if (blobStore[clean + "_blob"]) return blobStore[clean + "_blob"];
				const base = clean.split("/").pop();
				for (const key of Object.keys(blobStore))
				{
					if (key.endsWith("/" + base + "_blob") || key === base + "_blob") return blobStore[key];
				}
				return null;
			};

			const packType = pack.type === "base-overlay" ? "base-overlay"
				: pack.type === "base" ? "base"
				: pack.type === "skin-overlay" ? "skin-overlay"
				: pack.type === "base-face-overlay" ? "base-face-overlay"
				: pack.type === "face-overlay" ? "face-overlay"
				: pack.type === "hair-overlay" ? "hair-overlay"
				: pack.type === "makeup-overlay" ? "makeup-overlay"
				: pack.type === "body-writing-overlay" ? "body-writing-overlay"
				: pack.type === "effect-overlay" ? "effect-overlay"
				: "clothing";
			const editorMode = packTypeToEditorMode(packType);
			const makeupSubTab = packType === "body-writing-overlay" ? "body-writing"
				: (packType === "base-face-overlay" || packType === "face-overlay" || packType === "hair-overlay" ? "face-hair" : "makeup");
			const faceHairKind = packType === "hair-overlay" ? "hair"
				: (packType === "base-face-overlay" ? "base-face"
					: (packType === "face-overlay" ? "face-part" : undefined));
			const items = [];

			if (packType === "base")
			{
				const bodyLayer = (pack.layers || []).find((l) => l && l.id === "body") || (pack.layers || [])[0];
				items.push(hydrateBaseBody(bodyLayer, blobStore));
			}
			else if (packType === "base-overlay")
			{
				const overlays = pack.overlays || [];
				overlays.forEach((ov, i) =>
				{
					const hydrated = hydrateOverlay(ov, {}, i);
					for (const poseId of Object.keys(hydrated.poses))
					{
						const rawPose = ov.poses && ov.poses[poseId];
						if (!rawPose) continue;
						const src = rawPose.sources || {};
						for (const tier of LOD_TIERS)
						{
							const path = src[tier] || src[String(tier)];
							const url = resolvePath(path);
							if (!url) continue;
							if (!hydrated.poses[poseId]) hydrated.poses[poseId] = { sources: {}, transform: normalizeTransform(rawPose.transform) };
							hydrated.poses[poseId].sources[tier] = url;
							hydrated._assets[poseId + "_" + tier] = { url: url, blob: resolveBlob(path) };
						}
					}
					items.push(hydrated);
				});
			}
			else
			{
				const rawItems = pack.items || (pack.layers ? [pack] : []);
				rawItems.forEach((raw, i) =>
				{
					const hydrated = hydrateItem(raw, {}, i);
					for (const poseId of Object.keys(hydrated.poses))
					{
						const rawPose = raw.poses && raw.poses[poseId];
						if (!rawPose) continue;
						const src = rawPose.sources || (rawPose.asset ? { 256: rawPose.asset } : {});
						for (const tier of LOD_TIERS)
						{
							const path = src[tier] || src[String(tier)];
							const url = resolvePath(path);
							if (!url) continue;
							if (!hydrated.poses[poseId]) hydrated.poses[poseId] = { sources: {}, transform: normalizeTransform(rawPose.transform) };
							hydrated.poses[poseId].sources[tier] = url;
							hydrated._assets[poseId + "_" + tier] = { url: url, blob: resolveBlob(path) };
						}
						if (rawPose.displacements)
						{
							hydrated.poses[poseId].displacements = hydrated.poses[poseId].displacements || {};
							for (const [dispId, disp] of Object.entries(rawPose.displacements))
							{
								if (!disp) continue;
								const slot = hydrated.poses[poseId].displacements[dispId] = hydrated.poses[poseId].displacements[dispId] || {};
								for (const kind of ["mask", "depth", "sources"])
								{
									const src = disp[kind];
									if (!src) continue;
									slot[kind] = slot[kind] || {};
									for (const tier of LOD_TIERS)
									{
										const path = src[tier] || src[String(tier)];
										const url = resolvePath(path);
										if (!url) continue;
										slot[kind][tier] = url;
										hydrated._assets["disp_" + dispId + "_" + kind + "_" + poseId + "_" + tier] = { url: url, blob: resolveBlob(path) };
									}
								}
							}
						}
						if (rawPose.colorMask)
						{
							hydrated.poses[poseId].colorMask = hydrated.poses[poseId].colorMask || {};
							for (const tier of LOD_TIERS)
							{
								const path = rawPose.colorMask[tier] || rawPose.colorMask[String(tier)];
								const url = resolvePath(path);
								if (!url) continue;
								hydrated.poses[poseId].colorMask[tier] = url;
								hydrated._assets["color_" + poseId + "_" + tier] = { url: url, blob: resolveBlob(path) };
							}
						}
					}
					if (raw.recolor) hydrated.recolor = true;
					items.push(hydrated);
				});
			}

			// Reattach top-level customClothes[] if item.gameClothing was missing
			if (Array.isArray(pack.customClothes) && pack.customClothes.length)
			{
				const byId = new Map(pack.customClothes
					.filter((d) => d && d.itemId)
					.map((d) => [d.itemId, d]));
				for (const item of items)
				{
					if (!item || item.gameClothing) continue;
					const binding = item.cotBindings && item.cotBindings[0];
					if (binding && byId.has(binding))
						item.gameClothing = Object.assign({}, byId.get(binding));
				}
			}

			// Discover poses from pack + item pose keys
			let poses = Array.isArray(pack.poses) && pack.poses.length
				? pack.poses.slice()
				: null;
			if (!poses)
			{
				const found = new Set(["front", "back"]);
				for (const item of items)
				{
					for (const pid of Object.keys((item && item.poses) || {}))
						if (pid) found.add(pid);
				}
				poses = Array.from(found);
			}
			const poseMeta = pack.poseMeta && typeof pack.poseMeta === "object" ? pack.poseMeta : {};

			return {
				editorMode: editorMode,
				makeupSubTab: editorMode === "makeup" ? makeupSubTab : undefined,
				makeupSubKind: editorMode === "makeup" ? makeupSubTab : undefined,
				faceHairKind: faceHairKind,
				packType: packType,
				packId: packType === "base" ? "base" : (pack.id || slugify(pack.name) || "imported-mod"),
				packName: pack.name || pack.id || "Imported mod",
				packDescription: pack.description || "",
				enabled: pack.enabled !== false,
				poses: poses,
				poseMeta: poseMeta,
				items: items.length ? items : [defaultBlankForMode(editorMode, 0, {
					makeupSubTab: makeupSubTab,
					makeupSubKind: makeupSubTab,
					faceHairKind: faceHairKind,
				})],
				customClothes: Array.isArray(pack.customClothes) ? pack.customClothes : undefined,
			};
		},

		canSaveToFolder()
		{
			return typeof window.showDirectoryPicker === "function"
				&& typeof window.showOpenFilePicker === "function";
		},

		pathHints: PATH_HINTS,
		gameHtmlDevName: GAME_HTML_DEV_NAME,
		gameHtmlInstallName: GAME_HTML_INSTALL_NAME,

		async getSetupMeta()
		{
			return (await idbGet(SETUP_META_KEY)) || null;
		},

		async hasStoredGameSetup()
		{
			return hasStoredGameSetup();
		},

		async reconnectStoredGameAccess()
		{
			return reconnectStoredGameAccess();
		},

		async resolveStoredGameAccess(options)
		{
			return resolveStoredGameAccess(options);
		},

		async verifyGameConnection(access)
		{
			return verifyGameConnection(access);
		},

		async loadBasePackEditorState(epRootHandle)
		{
			return loadBasePackEditorState(epRootHandle);
		},

		parseClothesCatalogFromHtml(text)
		{
			return parseClothesCatalogFromHtml(text);
		},

		async loadClothingCatalog(access)
		{
			return loadClothingCatalog(access);
		},

		async loadClothingDesignCatalog(access)
		{
			return loadClothingDesignCatalog(access);
		},

		parseMakeupCatalogFromHtml(text)
		{
			return parseMakeupCatalogFromHtml(text);
		},

		async loadMakeupCatalog(access)
		{
			return loadMakeupCatalog(access);
		},

		loadBodyWritingCatalog()
		{
			return loadBodyWritingCatalog();
		},

		parseDistinguishingMarksFromHtml(text)
		{
			return parseDistinguishingMarksFromHtml(text);
		},

		parseHairstylesFromHtml(text)
		{
			return parseHairstylesFromHtml(text);
		},

		loadBaseFacesCatalog()
		{
			return loadBaseFacesCatalog();
		},

		async loadFacePartsCatalog(access)
		{
			return loadFacePartsCatalog(access);
		},

		async loadHairstylesCatalog(access)
		{
			return loadHairstylesCatalog(access);
		},

		async loadModPackEditorState(epRootHandle, modSlug, options)
		{
			return loadModPackEditorState(epRootHandle, modSlug, options);
		},

		async verifyModPackOnDisk(epRootHandle, modSlug)
		{
			return verifyModPackOnDisk(epRootHandle, modSlug);
		},

		async isGameSetupComplete()
		{
			if (!PackIO.canSaveToFolder()) return true;
			const access = await resolveStoredGameAccess({ silent: true });
			return !!access;
		},

		async ensureGameAccess(options)
		{
			options = options || {};
			if (!PackIO.canSaveToFolder())
				throw new Error("Save to game needs Chrome or Edge (File System Access API).");
			if (!options.force)
			{
				const cached = await resolveStoredGameAccess({ silent: true });
				if (cached) return cached;
			}
			return PackIO.runProjectSetup(options);
		},

		async runProjectSetup(options)
		{
			options = options || {};
			setStatusIfPresent("Choose your game folder (see path hint)…");
			const projectRoot = await window.showDirectoryPicker({
				id: "cot-project-root",
				mode: "readwrite",
				startIn: "documents",
			});

			let epRoot;
			try { epRoot = await resolveEpFromProject(projectRoot); }
			catch (e)
			{
				throw new Error(
					"That folder is missing exhibition-paperdoll/. Pick the game folder that contains "
					+ "exhibition-paperdoll/ and a game HTML file (" + GAME_HTML_DEV_NAME + " or "
					+ GAME_HTML_INSTALL_NAME + ") — e.g. " + PATH_HINTS.projectFolder
				);
			}
			if (!await validateEpRoot(epRoot))
			{
				throw new Error(
					"exhibition-paperdoll/ does not look valid (expected core/ or standalone/). Path: "
					+ PATH_HINTS.epFolder
				);
			}

			let found = await tryFindGameHtml(projectRoot);
			let gameHtml = found && found.handle;
			if (!gameHtml)
			{
				setStatusIfPresent("Select your game HTML in that folder (" + GAME_HTML_DEV_NAME + " or "
					+ GAME_HTML_INSTALL_NAME + ")…");
				const handles = await window.showOpenFilePicker({
					id: "cot-game-html",
					multiple: false,
					types: [{ description: "Game HTML", accept: { "text/html": [".html"] } }],
				});
				gameHtml = handles[0];
			}

			const htmlFile = await gameHtml.getFile();
			await idbSet(PROJECT_ROOT_KEY, projectRoot);
			await idbSet(GAME_HTML_HANDLE_KEY, gameHtml);
			await idbSet(SETUP_META_KEY, {
				projectName: projectRoot.name || "game-folder",
				gameHtmlName: htmlFile.name,
				completedAt: Date.now(),
			});

			return { projectRoot: projectRoot, epRoot: epRoot, gameHtml: gameHtml };
		},

		async rebakeGameInBrowser(options)
		{
			options = options || {};
			const Rebake = window.ExhibitionRebakeClient;
			if (!Rebake || typeof Rebake.rebake !== "function")
				throw new Error("Rebake client not loaded");
			const access = options.epRoot && options.gameHtml
				? { epRoot: options.epRoot, gameHtml: options.gameHtml }
				: await PackIO.ensureGameAccess({ force: !!options.repick });
			return Rebake.rebake(access.epRoot, access.gameHtml, options);
		},

		async injectCustomClothesIntoGameHtml(state, gameHtmlHandle)
		{
			const CC = window.ExhibitionCustomClothing;
			if (!CC || !gameHtmlHandle) return { injected: 0 };
			const defs = CC.collectFromState(state);
			if (!defs.length) return { injected: 0 };
			const file = await gameHtmlHandle.getFile();
			const text = await file.text();
			const next = CC.injectIntoHtml(text, defs);
			if (next === text) return { injected: defs.length, unchanged: true };
			const writable = await gameHtmlHandle.createWritable();
			await writable.write(next);
			await writable.close();
			return { injected: defs.length, unchanged: false };
		},

		/**
		 * Write custom mirror backgrounds into exhibition-paperdoll/backgrounds/
		 * and merge them into backgrounds/manifest.json for the game.
		 * pending: [{ id, label, path, blob }]
		 */
		async saveMirrorBackgrounds(epRootHandle, pending)
		{
			pending = (pending || []).filter((p) => p && p.id && p.blob);
			if (!pending.length) return { written: 0 };

			let existing = { customs: [] };
			try
			{
				const raw = await readTextUnder(epRootHandle, "backgrounds/manifest.json");
				existing = JSON.parse(raw) || existing;
			}
			catch (e) { /* first time */ }
			if (!Array.isArray(existing.customs)) existing.customs = [];

			const byId = {};
			for (const c of existing.customs)
				if (c && c.id) byId[c.id] = c;

			for (const row of pending)
			{
				const path = row.path || ("backgrounds/" + row.id + ".png");
				const rel = String(path).replace(/^exhibition-paperdoll\//, "");
				const filePath = rel.indexOf("backgrounds/") === 0
					? rel
					: ("backgrounds/" + rel.replace(/^.*\//, ""));
				await writeFileUnder(epRootHandle, filePath, row.blob);
				byId[row.id] = {
					id: row.id,
					name: row.label || row.name || row.id,
					file: filePath,
				};
			}

			existing.customs = Object.keys(byId).sort().map((k) => byId[k]);
			existing.updatedAt = new Date().toISOString();
			await writeFileUnder(
				epRootHandle,
				"backgrounds/manifest.json",
				new Blob([JSON.stringify(existing, null, 2)], { type: "application/json" })
			);
			return { written: pending.length, total: existing.customs.length };
		},

		async saveToGame(state)
		{
			const access = await PackIO.ensureGameAccess();
			const saveTarget = state.editorMode === "base-poses" ? "base-pack" : "mods";
			let result;
			if (saveTarget === "base-pack")
				result = await PackIO.saveToBasePackFolder(state, access.epRoot);
			else
				result = await PackIO.saveToModsFolder(state, access.epRoot);

			let saveStats;
			if (saveTarget === "mods")
				saveStats = await refreshModsManifest(access.epRoot);
			else
			{
				saveStats = await rebuildEditorEmbed(access.epRoot);
				const runtime = await writeRuntimePacks(access.epRoot);
				saveStats.packCount = runtime.packCount;
				saveStats.modCount = runtime.modCount;
			}

			let backgrounds = { written: 0 };
			if (state.pendingBgUploads && state.pendingBgUploads.length)
			{
				try
				{
					backgrounds = await PackIO.saveMirrorBackgrounds(access.epRoot, state.pendingBgUploads);
				}
				catch (e)
				{
					console.warn("[PackIO] mirror backgrounds save failed", e);
					backgrounds = { written: 0, error: e.message || String(e) };
				}
			}

			let customClothes = { injected: 0 };
			if (saveTarget === "mods" && access.gameHtml)
			{
				try
				{
					customClothes = await PackIO.injectCustomClothesIntoGameHtml(state, access.gameHtml);
				}
				catch (e)
				{
					console.warn("[PackIO] custom clothes inject failed", e);
					customClothes = { injected: 0, error: e.message || String(e) };
				}
			}

			await reloadRuntimePacks();
			return {
				access: access,
				result: result,
				saveStats: saveStats,
				saveTarget: saveTarget,
				backgrounds: backgrounds,
				customClothes: customClothes,
			};
		},

		async rebuildEditorEmbed(epRootHandle)
		{
			return rebuildEditorEmbed(epRootHandle);
		},

		async refreshModsManifest(epRootHandle)
		{
			return refreshModsManifest(epRootHandle);
		},

		async getEpRootDirectoryHandle(forcePick)
		{
			if (forcePick) return (await PackIO.runProjectSetup()).epRoot;
			return (await PackIO.ensureGameAccess()).epRoot;
		},

		async getGameHtmlHandle(forcePick)
		{
			if (forcePick) return (await PackIO.runProjectSetup()).gameHtml;
			return (await PackIO.ensureGameAccess()).gameHtml;
		},

		async getModsDirectoryHandle(forcePick)
		{
			return PackIO.getEpRootDirectoryHandle(forcePick);
		},

		async getBasePackDirectoryHandle(forcePick)
		{
			return PackIO.getEpRootDirectoryHandle(forcePick);
		},

		async saveToModsFolder(state, epRootHandle)
		{
			const { modSlug, packJson, files } = await buildPackArtifacts(state, epRootHandle);
			const modsDir = await epRootHandle.getDirectoryHandle("mods", { create: true });
			const modDir = await modsDir.getDirectoryHandle(modSlug, { create: true });
			await writeFileUnder(modDir, "pack.json", new Blob([JSON.stringify(packJson, null, 2)], { type: "application/json" }));
			for (const file of files)
				await writeFileUnder(modDir, file.rel, file.blob);
			return {
				modSlug: modSlug,
				fileCount: files.length + 1,
				imageCount: files.length,
				target: "mods",
				writtenFiles: files.map((f) => "mods/" + modSlug + "/" + f.rel),
			};
		},

		async saveToBasePackFolder(state, epRootHandle)
		{
			const { packJson, files } = await buildPackArtifacts(state, epRootHandle);
			const baseDir = await epRootHandle.getDirectoryHandle("base-pack", { create: true });
			await writeFileUnder(baseDir, "pack.json", new Blob([JSON.stringify(packJson, null, 2)], { type: "application/json" }));
			for (const file of files)
				await writeFileUnder(baseDir, file.rel, file.blob);
			return { modSlug: "base-pack", fileCount: files.length + 1, target: "base-pack" };
		},

		async exportZip(state)
		{
			const { modSlug, packJson, files } = await buildPackArtifacts(state, null);
			const zip = new window.JSZip();
			const root = modSlug + "/";
			// Ensure custom clothing defs are always present for sharing
			const CC = window.ExhibitionCustomClothing;
			const customClothes = CC && CC.collectFromState
				? CC.collectFromState(state)
				: [];
			if (customClothes.length)
			{
				packJson.customClothes = customClothes;
				zip.file(root + "custom-clothes.json", JSON.stringify(customClothes, null, 2));
			}
			zip.file(root + "pack.json", JSON.stringify(packJson, null, 2));
			for (const file of files)
				zip.file(root + file.rel, file.blob);
			// Share note for other players
			zip.file(root + "README-SHARE.txt",
				"Exhibition paperdoll pack export\n"
				+ "==============================\n"
				+ "Pack: " + (state.packName || modSlug) + "\n"
				+ "Custom clothing items: " + customClothes.length + "\n"
				+ (customClothes.length
					? "  (see custom-clothes.json and gameClothing on pack items)\n"
						+ "  Import in CoT-Body-Pose-Editor, resolve conflicts, then Save to game.\n"
					: "")
				+ "\nImport via standalone editor: Import asset pack.\n"
			);
			return zip.generateAsync({ type: "blob" });
		},
	};

	window.ExhibitionPackIO = PackIO;
})();