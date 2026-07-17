/* Exhibition paperdoll — load packs from exhibition-paperdoll/ folders at runtime */
(function()
{
	"use strict";
	setup.ExhibitionPaperdoll = setup.ExhibitionPaperdoll || {};
	const EP = setup.ExhibitionPaperdoll;
	const Core = EP.Core = EP.Core || {};
	const MR = Core.ModRegistry = Core.ModRegistry || {};

	MR._loaded = false;
	MR._loading = null;

	function assetRoot()
	{
		return EP._assetRoot || "exhibition-paperdoll/";
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
		if (out.displacements && typeof out.displacements === "object")
		{
			const displacements = {};
			for (const [dispId, disp] of Object.entries(out.displacements))
			{
				if (!disp || typeof disp !== "object") continue;
				const entry = Object.assign({}, disp);
				for (const kind of ["mask", "depth", "sources"])
				{
					if (!entry[kind] || typeof entry[kind] !== "object") continue;
					const mapped = {};
					for (const [tier, src] of Object.entries(entry[kind]))
						if (src) mapped[tier] = prefixAssetPath(src, prefix);
					entry[kind] = mapped;
				}
				displacements[dispId] = entry;
			}
			out.displacements = displacements;
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

	function ingestPack(data, folderName, buckets)
	{
		if (!data || typeof data !== "object") return;
		if (data.enabled === false) return;
		const prefix = "exhibition-paperdoll/mods/" + folderName;
		if (data.type === "base-overlay")
		{
			const entry = normalizePackAssets(data, prefix);
			entry.prefix = "mods/" + folderName;
			buckets.baseOverlays.push(entry);
			return;
		}
		if (data.type === "skin-overlay")
		{
			const entry = normalizePackAssets(data, prefix);
			entry.prefix = "mods/" + folderName;
			buckets.skinOverlays.push(entry);
			return;
		}
		if (data.type === "base-face-overlay")
		{
			const entry = normalizePackAssets(data, prefix);
			entry.prefix = "mods/" + folderName;
			buckets.baseFaceOverlays = buckets.baseFaceOverlays || [];
			buckets.baseFaceOverlays.push(entry);
			return;
		}
		if (data.type === "face-overlay")
		{
			const entry = normalizePackAssets(data, prefix);
			entry.prefix = "mods/" + folderName;
			buckets.faceOverlays.push(entry);
			return;
		}
		if (data.type === "hair-overlay")
		{
			const entry = normalizePackAssets(data, prefix);
			entry.prefix = "mods/" + folderName;
			buckets.hairOverlays.push(entry);
			return;
		}
		if (data.type === "makeup-overlay")
		{
			const entry = normalizePackAssets(data, prefix);
			entry.prefix = "mods/" + folderName;
			buckets.makeupOverlays.push(entry);
			return;
		}
		if (data.type === "body-writing-overlay")
		{
			const entry = normalizePackAssets(data, prefix);
			entry.prefix = "mods/" + folderName;
			buckets.bodyWritingOverlays.push(entry);
			return;
		}
		if (data.type === "effect-overlay")
		{
			const entry = normalizePackAssets(data, prefix);
			entry.prefix = "mods/" + folderName;
			buckets.effectOverlays.push(entry);
			return;
		}
		if (data.type === "appearance")
		{
			const packId = data.id || folderName;
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
				buckets.mods.push({ id: packId, prefix: "mods/" + folderName, items: norm.items });
			}
			if (skin.items && skin.items.length)
			{
				const entry = normalizePackAssets({ id: packId, type: "skin-overlay", items: skin.items }, prefix);
				entry.prefix = "mods/" + folderName;
				buckets.skinOverlays.push(entry);
			}
			if (baseFace.items && baseFace.items.length)
			{
				const entry = normalizePackAssets({ id: packId, type: "base-face-overlay", items: baseFace.items }, prefix);
				entry.prefix = "mods/" + folderName;
				buckets.baseFaceOverlays = buckets.baseFaceOverlays || [];
				buckets.baseFaceOverlays.push(entry);
			}
			if (face.items && face.items.length)
			{
				const entry = normalizePackAssets({ id: packId, type: "face-overlay", items: face.items }, prefix);
				entry.prefix = "mods/" + folderName;
				buckets.faceOverlays = buckets.faceOverlays || [];
				buckets.faceOverlays.push(entry);
			}
			if (hair.items && hair.items.length)
			{
				const entry = normalizePackAssets({ id: packId, type: "hair-overlay", items: hair.items }, prefix);
				entry.prefix = "mods/" + folderName;
				buckets.hairOverlays = buckets.hairOverlays || [];
				buckets.hairOverlays.push(entry);
			}
			if (makeup.items && makeup.items.length)
			{
				const entry = normalizePackAssets({ id: packId, type: "makeup-overlay", items: makeup.items }, prefix);
				entry.prefix = "mods/" + folderName;
				buckets.makeupOverlays = buckets.makeupOverlays || [];
				buckets.makeupOverlays.push(entry);
			}
			if (bodyWriting.items && bodyWriting.items.length)
			{
				const entry = normalizePackAssets({ id: packId, type: "body-writing-overlay", items: bodyWriting.items }, prefix);
				entry.prefix = "mods/" + folderName;
				buckets.bodyWritingOverlays = buckets.bodyWritingOverlays || [];
				buckets.bodyWritingOverlays.push(entry);
			}
			if (effect.items && effect.items.length)
			{
				const entry = normalizePackAssets({ id: packId, type: "effect-overlay", items: effect.items }, prefix);
				entry.prefix = "mods/" + folderName;
				if (effect.effect) entry.effect = effect.effect;
				buckets.effectOverlays.push(entry);
			}
			return;
		}
		if (Array.isArray(data.items))
		{
			const norm = normalizePackAssets({ items: data.items }, prefix);
			buckets.mods.push({ id: data.id || folderName, prefix: "mods/" + folderName, items: norm.items });
			return;
		}
		if (Array.isArray(data))
			buckets.mods.push({ id: folderName, prefix: "mods/" + folderName, items: data });
		else
			buckets.mods.push({ id: folderName, prefix: "mods/" + folderName, items: [normalizePackAssets(data, prefix)] });
	}

	function normalizeModBucket(mods)
	{
		if (!Array.isArray(mods)) return [];
		return mods.map((mod) =>
		{
			if (!mod || typeof mod !== "object") return mod;
			const prefix = mod.prefix || ("mods/" + (mod.id || "mod"));
			const fullPrefix = prefix.startsWith("exhibition-paperdoll/")
				? prefix
				: ("exhibition-paperdoll/" + prefix.replace(/^\//, ""));
			const out = Object.assign({}, mod, { prefix: prefix.replace(/^exhibition-paperdoll\//, "") });
			if (Array.isArray(mod.items))
			{
				out.items = mod.items.map((item) =>
				{
					if (!item || typeof item !== "object") return item;
					const norm = normalizePackAssets({ items: [item] }, fullPrefix);
					const row = norm.items && norm.items[0] ? norm.items[0] : item;
					if (item.recolor) row.recolor = true;
					if (item.cotBindings) row.cotBindings = item.cotBindings.slice();
					if (item.skinSubKey) row.skinSubKey = item.skinSubKey;
					if (item.skinSubValue != null && item.skinSubValue !== "")
						row.skinSubValue = item.skinSubValue;
					return row;
				});
			}
			return out;
		});
	}

	function normalizeOverlayBucket(overlays)
	{
		if (!Array.isArray(overlays)) return [];
		return overlays.map((mod) =>
		{
			if (!mod || typeof mod !== "object") return mod;
			const prefix = mod.prefix || ("mods/" + (mod.id || "overlay"));
			const fullPrefix = prefix.startsWith("exhibition-paperdoll/")
				? prefix
				: ("exhibition-paperdoll/" + prefix.replace(/^\//, ""));
			return normalizePackAssets(Object.assign({}, mod, { prefix: prefix.replace(/^exhibition-paperdoll\//, "") }), fullPrefix);
		});
	}

	function applyRuntimePayload(data)
	{
		if (!data || typeof data !== "object") return false;
		if (data.basePack)
			EP._basePack = normalizePackAssets(data.basePack, "exhibition-paperdoll/base-pack");
		if (Array.isArray(data.mods)) EP._mods = normalizeModBucket(data.mods);
		if (Array.isArray(data.baseOverlays)) EP._baseOverlays = normalizeOverlayBucket(data.baseOverlays);
		if (Array.isArray(data.skinOverlays)) EP._skinOverlays = normalizeOverlayBucket(data.skinOverlays);
		if (Array.isArray(data.baseFaceOverlays)) EP._baseFaceOverlays = normalizeOverlayBucket(data.baseFaceOverlays);
		if (Array.isArray(data.faceOverlays)) EP._faceOverlays = normalizeOverlayBucket(data.faceOverlays);
		if (Array.isArray(data.hairOverlays)) EP._hairOverlays = normalizeOverlayBucket(data.hairOverlays);
		if (Array.isArray(data.makeupOverlays)) EP._makeupOverlays = normalizeOverlayBucket(data.makeupOverlays);
		if (Array.isArray(data.bodyWritingOverlays)) EP._bodyWritingOverlays = normalizeOverlayBucket(data.bodyWritingOverlays);
		if (Array.isArray(data.effectOverlays)) EP._effectOverlays = normalizeOverlayBucket(data.effectOverlays);
		return !!(data.basePack || (data.mods && data.mods.length) || (data.baseOverlays && data.baseOverlays.length)
			|| (data.skinOverlays && data.skinOverlays.length)
			|| (data.baseFaceOverlays && data.baseFaceOverlays.length)
			|| (data.faceOverlays && data.faceOverlays.length) || (data.hairOverlays && data.hairOverlays.length)
			|| (data.makeupOverlays && data.makeupOverlays.length)
			|| (data.bodyWritingOverlays && data.bodyWritingOverlays.length)
			|| (data.effectOverlays && data.effectOverlays.length));
	}

	function loadRuntimePacksScript()
	{
		if (window.__exhibitionPaperdollRuntimePacks)
			return Promise.resolve(applyRuntimePayload(window.__exhibitionPaperdollRuntimePacks));
		return new Promise((resolve) =>
		{
			const s = document.createElement("script");
			s.src = assetRoot() + "runtime-packs.js?" + Date.now();
			s.onload = () => resolve(applyRuntimePayload(window.__exhibitionPaperdollRuntimePacks));
			s.onerror = () => resolve(false);
			document.head.appendChild(s);
		});
	}

	async function fetchJson(url)
	{
		try
		{
			const res = await fetch(url, { cache: "no-store" });
			if (!res.ok) return null;
			return res.json();
		}
		catch (e)
		{
			return null;
		}
	}

	async function loadModsFromManifest(buckets)
	{
		const root = assetRoot();
		const manifest = await fetchJson(root + "mods/manifest.json");
		if (!manifest || !Array.isArray(manifest.packs)) return false;
		for (const packId of manifest.packs)
		{
			if (!packId || typeof packId !== "string") continue;
			const data = await fetchJson(root + "mods/" + packId + "/pack.json");
			if (data) ingestPack(data, packId, buckets);
		}
		return true;
	}

	async function loadBasePackFromDisk()
	{
		const root = assetRoot();
		const data = await fetchJson(root + "base-pack/pack.json");
		if (!data) return false;
		EP._basePack = normalizePackAssets(data, "exhibition-paperdoll/base-pack");
		return true;
	}

	MR.loadFromFolder = async function()
	{
		if (MR._loaded) return;
		if (MR._loading) return MR._loading;

		MR._loading = (async () =>
		{
			const applied = await loadRuntimePacksScript();
			if (!applied)
			{
				const buckets = { mods: [], baseOverlays: [], skinOverlays: [], baseFaceOverlays: [], faceOverlays: [], hairOverlays: [], makeupOverlays: [], bodyWritingOverlays: [], effectOverlays: [] };
				const hadManifest = await loadModsFromManifest(buckets);
				const hadBase = await loadBasePackFromDisk();
				if (hadManifest)
				{
					EP._mods = buckets.mods;
					EP._baseOverlays = buckets.baseOverlays;
					EP._skinOverlays = buckets.skinOverlays;
					EP._baseFaceOverlays = buckets.baseFaceOverlays || [];
					EP._faceOverlays = buckets.faceOverlays || [];
					EP._hairOverlays = buckets.hairOverlays || [];
					EP._makeupOverlays = buckets.makeupOverlays || [];
					EP._bodyWritingOverlays = buckets.bodyWritingOverlays || [];
					EP._effectOverlays = buckets.effectOverlays;
				}
				if (!hadBase && !EP._basePack && EP._initPacksEmbedded)
				{
					EP._packsFromEmbedded = false;
					EP._initPacksEmbedded();
				}
				else if (!hadManifest && EP._initPacksEmbedded)
				{
					EP._packsFromEmbedded = false;
					EP._initPacksEmbedded();
				}
			}
			MR._loaded = true;
		})();

		try { await MR._loading; }
		finally { MR._loading = null; }
	};

	MR.reload = async function()
	{
		MR._loaded = false;
		MR._loading = null;
		EP._packsFromEmbedded = false;
		delete window.__exhibitionPaperdollRuntimePacks;
		EP._basePack = null;
		EP._mods = [];
		EP._baseOverlays = [];
		EP._skinOverlays = [];
		EP._baseFaceOverlays = [];
		EP._faceOverlays = [];
		EP._hairOverlays = [];
		EP._makeupOverlays = [];
		EP._bodyWritingOverlays = [];
		EP._effectOverlays = [];
		EP.invalidate && EP.invalidate();
		await MR.loadFromFolder();
	};

	MR.normalizeModBucket = normalizeModBucket;
	MR.normalizeOverlayBucket = normalizeOverlayBucket;
})();