/* Exhibition paperdoll — public API */
(function()
{
	"use strict";
	setup.ExhibitionPaperdoll = setup.ExhibitionPaperdoll || {};
	const EP = setup.ExhibitionPaperdoll;
	const Core = EP.Core = EP.Core || {};

	EP._assetRoot = "exhibition-paperdoll/";
	EP._basePack = null;
	EP._mods = [];
	EP._baseOverlays = [];
	EP._skinOverlays = [];
	EP._baseFaceOverlays = [];
	EP._faceOverlays = [];
	EP._hairOverlays = [];
	EP._bodyWritingOverlays = [];
	EP._makeupOverlays = [];
	EP._effectOverlays = [];

	EP._initPacksEmbedded = function()
	{
		if (EP._packsFromEmbedded) return;
		EP._packsFromEmbedded = true;
		if (window.__exhibitionPaperdollBasePack)
			EP._basePack = window.__exhibitionPaperdollBasePack;
		else if (!EP._basePack)
			EP._basePack = { canvas: { width: 256, height: 512 }, layers: [] };
		const MR = Core.ModRegistry;
		if (window.__exhibitionPaperdollMods)
			EP._mods = MR && MR.normalizeModBucket
				? MR.normalizeModBucket(window.__exhibitionPaperdollMods)
				: window.__exhibitionPaperdollMods;
		else if (!EP._mods)
			EP._mods = [];
		if (window.__exhibitionPaperdollBaseOverlays)
			EP._baseOverlays = MR && MR.normalizeOverlayBucket
				? MR.normalizeOverlayBucket(window.__exhibitionPaperdollBaseOverlays)
				: window.__exhibitionPaperdollBaseOverlays;
		else if (!EP._baseOverlays)
			EP._baseOverlays = [];
		if (window.__exhibitionPaperdollSkinOverlays)
			EP._skinOverlays = MR && MR.normalizeOverlayBucket
				? MR.normalizeOverlayBucket(window.__exhibitionPaperdollSkinOverlays)
				: window.__exhibitionPaperdollSkinOverlays;
		else if (!EP._skinOverlays)
			EP._skinOverlays = [];
		if (window.__exhibitionPaperdollBaseFaceOverlays)
			EP._baseFaceOverlays = MR && MR.normalizeOverlayBucket
				? MR.normalizeOverlayBucket(window.__exhibitionPaperdollBaseFaceOverlays)
				: window.__exhibitionPaperdollBaseFaceOverlays;
		else if (!EP._baseFaceOverlays)
			EP._baseFaceOverlays = [];
		if (window.__exhibitionPaperdollFaceOverlays)
			EP._faceOverlays = MR && MR.normalizeOverlayBucket
				? MR.normalizeOverlayBucket(window.__exhibitionPaperdollFaceOverlays)
				: window.__exhibitionPaperdollFaceOverlays;
		else if (!EP._faceOverlays)
			EP._faceOverlays = [];
		if (window.__exhibitionPaperdollHairOverlays)
			EP._hairOverlays = MR && MR.normalizeOverlayBucket
				? MR.normalizeOverlayBucket(window.__exhibitionPaperdollHairOverlays)
				: window.__exhibitionPaperdollHairOverlays;
		else if (!EP._hairOverlays)
			EP._hairOverlays = [];
		if (window.__exhibitionPaperdollBodyWritingOverlays)
			EP._bodyWritingOverlays = MR && MR.normalizeOverlayBucket
				? MR.normalizeOverlayBucket(window.__exhibitionPaperdollBodyWritingOverlays)
				: window.__exhibitionPaperdollBodyWritingOverlays;
		else if (!EP._bodyWritingOverlays)
			EP._bodyWritingOverlays = [];
		if (window.__exhibitionPaperdollMakeupOverlays)
			EP._makeupOverlays = MR && MR.normalizeOverlayBucket
				? MR.normalizeOverlayBucket(window.__exhibitionPaperdollMakeupOverlays)
				: window.__exhibitionPaperdollMakeupOverlays;
		else if (!EP._makeupOverlays)
			EP._makeupOverlays = [];
		if (window.__exhibitionPaperdollEffectOverlays)
			EP._effectOverlays = MR && MR.normalizeOverlayBucket
				? MR.normalizeOverlayBucket(window.__exhibitionPaperdollEffectOverlays)
				: window.__exhibitionPaperdollEffectOverlays;
		else if (!EP._effectOverlays)
			EP._effectOverlays = [];
	};

	EP._initPacks = function()
	{
		EP._initPacksEmbedded();
		EP._syncPosesFromPacks();
	};

	/** Union pose ids from base + all mods so clothing/skin/etc. can share custom poses. */
	EP._syncPosesFromPacks = function()
	{
		if (!Core || typeof Core.applyPackPoses !== "function") return;
		const poseIds = new Set(["front", "back"]);
		const meta = {};
		function collect(pack)
		{
			if (!pack) return;
			if (Array.isArray(pack.poses))
			{
				for (const id of pack.poses)
					if (id) poseIds.add(id);
			}
			if (pack.poseMeta && typeof pack.poseMeta === "object")
				Object.assign(meta, pack.poseMeta);
			const lists = [pack.layers, pack.items, pack.overlays];
			for (const list of lists)
			{
				if (!Array.isArray(list)) continue;
				for (const entry of list)
				{
					if (!entry || !entry.poses) continue;
					for (const id of Object.keys(entry.poses))
						if (id) poseIds.add(id);
				}
			}
		}
		collect(EP._basePack);
		for (const mod of EP._mods || []) collect(mod);
		for (const bucket of [
			EP._baseOverlays, EP._skinOverlays, EP._baseFaceOverlays, EP._faceOverlays,
			EP._hairOverlays, EP._bodyWritingOverlays, EP._makeupOverlays, EP._effectOverlays,
		])
		{
			if (!Array.isArray(bucket)) continue;
			for (const pack of bucket) collect(pack);
		}
		Core.applyPackPoses(Array.from(poseIds), meta);
	};

	EP.ensureModsLoaded = async function()
	{
		if (Core.ModRegistry && typeof Core.ModRegistry.loadFromFolder === "function")
			await Core.ModRegistry.loadFromFolder();
		else
			EP._initPacksEmbedded();
		EP._syncPosesFromPacks();
	};

	EP.reloadMods = async function()
	{
		if (Core.ModRegistry && typeof Core.ModRegistry.reload === "function")
			await Core.ModRegistry.reload();
		else
			EP._initPacksEmbedded();
		EP._syncPosesFromPacks();
	};

	EP.getRenderSubject = function()
	{
		return EP._renderSubject || (typeof V !== "undefined" && V.pc) || null;
	};

	EP._prepareRenderSubject = function(person)
	{
		if (!person) return person;
		if (!person.distinguishing_marks) person.distinguishing_marks = [];
		if (EP.BaseFaces && EP.BaseFaces.ensurePersonFace)
		{
			const seed = EP._subjectCacheId(person);
			EP.BaseFaces.ensurePersonFace(person, seed);
		}
		if (!person["hair style"]) person["hair style"] = "unstyled";
		if (!person["hair length"]) person["hair length"] = "shoulder-length";
		if (!person["hair color"]) person["hair color"] = "brown";
		if (!person["skin color"]) person["skin color"] = "beige";
		if (!person["eye color"]) person["eye color"] = "brown";
		if (typeof person.get_clothingItems_classes === "function")
			person.get_clothingItems_classes();
		return person;
	};

	EP._subjectCacheId = function(person)
	{
		if (!person) return "unknown";
		if (person.is_pc || (typeof V !== "undefined" && V.pc && person.equals && person.equals(V.pc))) return "PC";
		return String(person.person || person.name || "subject");
	};

	EP.withRenderSubject = async function(person, fn)
	{
		const prev = EP._renderSubject;
		EP._renderSubject = person;
		try { return await fn(); }
		finally { EP._renderSubject = prev; }
	};

	EP._mergeLayerPoses = function(baseLayer, overlayDefs)
	{
		if (!baseLayer || !baseLayer.poses) return baseLayer;
		const merged = Object.assign({}, baseLayer, { poses: {} });
		for (const [poseId, poseDef] of Object.entries(baseLayer.poses))
		{
			const baseSources = Core.normalizeSources(poseDef);
			let overlaySources = {};
			for (const ov of overlayDefs)
			{
				const oPose = ov && ov.poses && ov.poses[poseId];
				if (oPose) overlaySources = Core.mergeSources(overlaySources, Core.normalizeSources(oPose));
			}
			merged.poses[poseId] = Object.assign({}, poseDef, {
				sources: Core.mergeSources(baseSources, overlaySources),
			});
			delete merged.poses[poseId].asset;
		}
		return merged;
	};

	EP._applyBaseOverlays = function(layers)
	{
		if (!EP._baseOverlays || !EP._baseOverlays.length) return layers;
		const merged = layers.map(layer => Object.assign({}, layer, { poses: Object.assign({}, layer.poses) }));
		const byId = new Map(merged.map(l => [l.id, l]));
		for (const mod of EP._baseOverlays)
		{
			if (!mod || !Array.isArray(mod.overlays)) continue;
			for (const ov of mod.overlays)
			{
				if (!ov || !ov.layer) continue;
				const target = byId.get(ov.layer);
				if (target)
				{
					byId.set(ov.layer, EP._mergeLayerPoses(target, [ov]));
					continue;
				}
				if (!ov.poses) continue;
				const layer = { id: ov.layer, zIndex: ov.zIndex || 10, poses: {} };
				for (const [poseId, poseDef] of Object.entries(ov.poses))
				{
					layer.poses[poseId] = Object.assign({}, poseDef, {
						sources: Core.normalizeSources(poseDef),
					});
					delete layer.poses[poseId].asset;
				}
				byId.set(ov.layer, layer);
				merged.push(layer);
			}
		}
		return merged.map(l => byId.get(l.id) || l);
	};

	EP._buildLayers = async function(person, options)
	{
		await EP.ensureModsLoaded();
		const layers = [];
		if (EP._basePack && Array.isArray(EP._basePack.layers))
		{
			for (const layer of EP._basePack.layers)
			{
				if (!layer || !layer.poses) continue;
				// Body layer: apply physique / part-size variants with fallback to default base art
				if ((layer.id === "body" || layer.layer === "body") && EP.BodyVariants
					&& EP.BodyVariants.expandBodyLayerForPerson)
				{
					const expanded = EP.BodyVariants.expandBodyLayerForPerson(layer, person, options);
					for (const L of expanded) layers.push(L);
				}
				else
					layers.push(Object.assign({}, layer));
			}
		}
		EP._applyBaseOverlays(layers);
		if (EP.mapBaseFaceLayers)
		{
			const baseFaceLayers = EP.mapBaseFaceLayers(person);
			if (baseFaceLayers.length) layers.push.apply(layers, baseFaceLayers);
		}
		if (EP.mapFaceLayers)
		{
			const faceLayers = EP.mapFaceLayers(person);
			if (faceLayers.length) layers.push.apply(layers, faceLayers);
		}
		if (EP.mapHairLayers)
		{
			const hairBack = EP.mapHairLayers(person).filter((l) =>
				l.hairLayer === "back" || (l.layer && String(l.layer).indexOf("hair-back") >= 0));
			if (hairBack.length) layers.push.apply(layers, hairBack);
		}
		if (EP.mapSkinLayers)
		{
			const skinLayers = EP.mapSkinLayers();
			if (skinLayers.length) layers.push.apply(layers, skinLayers);
		}
		if (EP.mapBodyWritingLayers)
		{
			const bodyWritingLayers = EP.mapBodyWritingLayers();
			if (bodyWritingLayers.length) layers.push.apply(layers, bodyWritingLayers);
		}
		// Body hair overlays sit above skin/tattoos so hair can hide them
		if (EP.BodyVariants && EP.BodyVariants.expandBodyHairLayers && EP._basePack)
		{
			const bodyLayer = (EP._basePack.layers || []).find((l) =>
				l && (l.id === "body" || l.layer === "body"));
			if (bodyLayer)
			{
				const hairLayers = EP.BodyVariants.expandBodyHairLayers(bodyLayer, person, options);
				if (hairLayers.length) layers.push.apply(layers, hairLayers);
			}
		}
		if (EP.mapMakeupLayers)
		{
			const makeupLayers = EP.mapMakeupLayers(person);
			if (makeupLayers.length) layers.push.apply(layers, makeupLayers);
		}
		if (EP.mapHairLayers)
		{
			const hairFront = EP.mapHairLayers(person).filter((l) =>
				l.hairLayer !== "back" && (!l.layer || String(l.layer).indexOf("hair-back") < 0));
			if (hairFront.length) layers.push.apply(layers, hairFront);
		}
		if (EP._mods && EP.mapClothingLayers)
		{
			const modLayers = EP.mapClothingLayers(person, options);
			if (modLayers) layers.push.apply(layers, modLayers);
		}
		if (EP.mapEffectLayers)
		{
			const effectLayers = EP.mapEffectLayers();
			if (effectLayers.length) layers.push.apply(layers, effectLayers);
		}
		return layers.slice().sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
	};

	EP._resolveQuality = function(options)
	{
		options = options || {};
		if (options.quality) return options.quality;
		if (options.lod) return options.lod;
		if (options.context && options.context.quality) return options.context.quality;
		if (options.context && options.context.source === "mirror") return "mirror";
		if (options.context && options.context.source === "capture") return "capture";
		return "sidebar";
	};

	EP._cacheKey = function(person, options)
	{
		const pose = Core.normalizePose(options && options.pose);
		const quality = EP._resolveQuality(options);
		const lod = Core.qualityToLod(quality);
		const clothes = person && person.clothes ? person.clothes.map((c) =>
		{
			if (!c) return "";
			const subs = c.subs || {};
			const color = subs.color || subs.color1 || subs.colour || "";
			return (c.item || "") + ":" + color;
		}).join("|") : "";
		const exposure = person && person.clothes ? person.clothes.map((c) =>
		{
			if (!c) return "";
			const adj = (c.properties && c.properties.exposure_adjustments) || {};
			const disps = c.displacements || [];
			return (c.item || "") + "@" + JSON.stringify(adj) + "@" + disps.join("+");
		}).join("|") : "";
		const overlays = (EP._baseOverlays || []).map(m => m && m.id).join(",");
		const baseFace = person ? (person["paperdoll face"] || "") : "";
		const marks = (person && person.distinguishing_marks) ? person.distinguishing_marks.join("+") : "";
		const hair = person ? ((person["hair style"] || "") + "@" + (person["hair length"] || "")) : "";
		const makeup = person && person.makeup
			? Object.entries(person.makeup).map(([k, v]) => k + "=" + v).join("+") : "";
		return EP._subjectCacheId(person) + ":" + pose + ":" + lod + ":" + clothes + ":" + exposure
			+ ":" + baseFace + ":" + marks + ":" + hair + ":" + makeup + ":" + overlays;
	};

	EP._cache = new Map();

	EP.invalidate = function(person)
	{
		if (!person)
		{
			EP._cache.clear();
			return;
		}
		const prefix = EP._subjectCacheId(person) + ":";
		for (const key of Array.from(EP._cache.keys()))
		{
			if (key.startsWith(prefix)) EP._cache.delete(key);
		}
	};

	EP.render = async function(canvas, person, options)
	{
		if (!canvas || !person) return null;
		person = EP._prepareRenderSubject(person);
		options = options || {};
		if (!options.pose && typeof V !== "undefined" && V.optpaperdollview === "back")
			options.pose = "back";
		if (!options.pose && typeof V !== "undefined" && V.tanpose)
			options.pose = Core.poseFromTanpose(V.tanpose);

		const quality = EP._resolveQuality(options);
		const key = EP._cacheKey(person, Object.assign({}, options, { quality: quality }));

		if (!options.bypassCache && EP._cache.has(key))
		{
			const cached = EP._cache.get(key);
			const ctx = canvas.getContext("2d");
			canvas.width = cached.width;
			canvas.height = cached.height;
			canvas._renderLod = cached._renderLod;
			ctx.drawImage(cached, 0, 0);
			const displaySize = Core.applyCanvasScale(canvas, canvas.height, options.scale || { maxHeight: 118, maxWidth: 150 });
			canvas._displaySize = displaySize;
			return cached;
		}

		const layers = await EP._buildLayers(person, options);
		await Core.compose(canvas, {
			pose: options.pose,
			layers: layers,
			pack: EP._basePack,
			quality: quality,
			displacement: options.displacement,
		});
		const displaySize = Core.applyCanvasScale(canvas, canvas.height, options.scale || { maxHeight: 118, maxWidth: 150 });

		const off = document.createElement("canvas");
		off.width = canvas.width;
		off.height = canvas.height;
		off._renderLod = canvas._renderLod;
		off.getContext("2d").drawImage(canvas, 0, 0);
		EP._cache.set(key, off);
		canvas._displaySize = displaySize;
		return canvas;
	};

	EP.capture = async function(person, options)
	{
		options = Object.assign({ quality: "capture" }, options || {});
		const c = document.createElement("canvas");
		await EP.render(c, person, options);
		return {
			dataUrl: c.toDataURL("image/png"),
			width: c.width,
			height: c.height,
			pose: Core.normalizePose(options.pose),
			lod: c._renderLod,
		};
	};

	EP.captureImageHtml = async function(person, options)
	{
		const cap = await EP.capture(person, options);
		const alt = (options && options.alt) || "photo";
		return '<img class="exhib-capture-thumb" src="' + cap.dataUrl + '" alt="' + alt + '">';
	};

	EP.buildCaptureMenu = function(person, context)
	{
		context = context || {};
		const poses = Core.posesForContext(context);
		return poses.map(p => ({
			id: p.id,
			label: p.label,
			pose: p.id,
			narrate: "You snap a " + p.label.toLowerCase() + " pic.",
		}));
	};


	EP._sidebarScale = function()
	{
		return { maxHeight: 118, maxWidth: 150, center: true };
	};

	EP._centerCanvasInViewport = function(canvas)
	{
		if (!canvas) return;
		canvas.style.display = "block";
		canvas.style.margin = "0";
		canvas.style.position = "absolute";
		canvas.style.left = "50%";
		canvas.style.top = "0";
		canvas.style.transform = "translateX(-50%)";
		canvas.style.transformOrigin = "top center";
	};

	EP._syncSidebarViewport = function(body, viewport, canvas, display)
	{
		if (!body || !viewport || !canvas) return;
		const h = (display && display.height) || parseInt(canvas.style.height, 10) || canvas.offsetHeight || 118;
		EP._centerCanvasInViewport(canvas);
		viewport.style.height = "auto";
		viewport.style.minHeight = h + "px";
		viewport.style.width = "100%";
		viewport.style.overflow = "visible";
		viewport.style.position = "relative";
		viewport.style.display = "block";
		body.style.minHeight = (h + 4) + "px";
		body.style.height = "auto";
		body.style.overflow = "visible";
	};

	EP._ensureSidebarCanvasClick = function(canvas)
	{
		if (!canvas || canvas._exhibMirrorClickBound) return;
		canvas._exhibMirrorClickBound = true;
		canvas.style.cursor = "pointer";
		canvas.title = "Open mirror view";
		canvas.addEventListener("click", function()
		{
			EP.openMirrorDialog();
		});
	};

	EP.applyMirrorCanvasLayout = function(canvas)
	{
		if (!canvas) return;
		const container = document.getElementById("paperdollMirror");
		if (!container) return;
		container.style.position = "relative";
		container.style.margin = "0 auto";
		container.style.display = "flex";
		container.style.flexDirection = "column";
		container.style.justifyContent = "flex-start";
		container.style.alignItems = "center";
		// Prefer a large dialog footprint so the doll does not stay tiny
		const hostW = Math.max(container.clientWidth || 0, Math.floor(window.innerWidth * 0.55));
		const hostH = Math.max(container.clientHeight || 0, Math.floor(window.innerHeight * 0.75));
		if (hostH >= hostW)
		{
			canvas.style.width = Math.min(hostW, 520) + "px";
			canvas.style.height = "auto";
		}
		else
		{
			canvas.style.height = Math.min(hostH, 720) + "px";
			canvas.style.width = "auto";
		}
		// Keep canvas in normal flow inside the stage (absolute was collapsing the stage)
		canvas.style.position = "relative";
		canvas.style.left = "auto";
		canvas.style.top = "auto";
		canvas.style.transform = "none";
		canvas.style.display = "block";
		canvas.style.margin = "0 auto";

		const stage = canvas.closest && canvas.closest(".exhib-mirror-stage");
		const BG = Core.Backgrounds;
		if (stage && BG && BG.syncStageToCanvas)
			BG.syncStageToCanvas(stage, canvas);

		const cw = parseInt(canvas.style.width, 10) || canvas.offsetWidth || 320;
		const ch = parseInt(canvas.style.height, 10) || canvas.offsetHeight || 480;
		container.style.width = "auto";
		container.style.height = "auto";
		container.style.minWidth = cw + "px";
		container.style.minHeight = ch + "px";
	};

	/**
	 * True only while the paperdoll/mirror dialog content is open.
	 * Phone, collage, hints, settings, etc. share #ui-dialog-titlebar — do not
	 * leave Ass/Chest (front/back) or download buttons on those dialogs.
	 */
	EP._isMirrorDialogActive = function()
	{
		const dialog = document.getElementById("ui-dialog");
		if (!dialog || !dialog.classList.contains("open")) return false;
		if (document.getElementById("paperdollMirror")) return true;
		if (document.getElementById("paperdollPC-canvas-dialog")) return true;
		const body = document.getElementById("ui-dialog-body");
		if (body && body.querySelector("#paperdollMirror, #paperdollPC-canvas-dialog, .paperdoll-mirror-layout"))
			return true;
		return false;
	};

	/** Show/hide titlebar controls that belong only to the paperdoll mirror dialog. */
	EP.syncDialogTitlebarExtras = function()
	{
		const show = EP._isMirrorDialogActive();
		const viewBtn = document.getElementById("paperdoll-view-btn");
		const dlBtn = document.getElementById("paperdoll-download-btn");
		if (viewBtn) viewBtn.style.display = show ? "" : "none";
		if (dlBtn) dlBtn.style.display = show ? "" : "none";
	};

	EP._ensureMirrorViewButton = function()
	{
		const titlebar = document.getElementById("ui-dialog-titlebar");
		if (!titlebar) return;
		let btn = document.getElementById("paperdoll-view-btn");
		if (!btn)
		{
			const closeBtn = document.getElementById("ui-dialog-close");
			const downloadBtn = document.getElementById("paperdoll-download-btn");
			const anchor = downloadBtn || closeBtn;
			btn = document.createElement("button");
			btn.id = "paperdoll-view-btn";
			btn.type = "button";
			btn.className = "ui-close paperdoll-mirror-view paperdoll-dialog-only";
			btn.textContent = EP.viewButtonLabel(EP.getView());
			btn.title = EP.viewButtonTitle(EP.getView());
			btn.style.cssText = "position:absolute;top:0;background:transparent;border:none;font-size:inherit;color:inherit;margin:0;line-height:inherit;padding:0 0.45em;";
			if (anchor && anchor.id === "paperdoll-download-btn")
			{
				const closeBtnWidth = closeBtn ? closeBtn.offsetWidth : 36;
				btn.style.right = (closeBtnWidth + anchor.offsetWidth) + "px";
			}
			else if (closeBtn)
			{
				btn.style.right = closeBtn.offsetWidth + "px";
			}
			btn.addEventListener("click", function(e)
			{
				e.preventDefault();
				e.stopPropagation();
				EP.toggleView();
			});
			titlebar.appendChild(btn);
		}
		// Only visible while mirror dialog is the active content
		btn.style.display = EP._isMirrorDialogActive() ? "" : "none";
	};

	EP._ensureMirrorDownloadButton = function()
	{
		const titlebar = document.getElementById("ui-dialog-titlebar");
		if (!titlebar) return;
		let btn = document.getElementById("paperdoll-download-btn");
		if (!btn)
		{
			const closeBtn = document.getElementById("ui-dialog-close");
			const closeBtnWidth = closeBtn ? closeBtn.offsetWidth : 36;
			btn = document.createElement("button");
			btn.id = "paperdoll-download-btn";
			btn.type = "button";
			btn.className = "ui-close paperdoll-dialog-only";
			btn.innerHTML = "💾";
			btn.title = "Save Image";
			btn.tabIndex = 0;
			btn.style.cssText = "position:absolute;right:" + closeBtnWidth + "px;top:0;background:transparent;border:none;font-size:inherit;color:inherit;margin:0;line-height:inherit;";
			btn.addEventListener("click", function(e)
			{
				e.preventDefault();
				e.stopPropagation();
				const canvas = document.getElementById("paperdollPC-canvas-dialog");
				if (!canvas) return;
				if (setup.Paperdoll && typeof setup.Paperdoll.saveCanvasImage === "function")
					setup.Paperdoll.saveCanvasImage(canvas);
			});
			titlebar.appendChild(btn);
		}
		btn.style.display = EP._isMirrorDialogActive() ? "" : "none";
	};

	EP.mirrorPC = function()
	{
		const mirror = document.getElementById("paperdollMirror");
		if (!mirror || typeof jQuery === "undefined") return;
		const $mirror = jQuery(mirror);
		$mirror.height("85vh");
		$mirror.width("85vw");
		$mirror.css("display", "grid");
		if (!document.getElementById("paperdollPC-canvas-dialog"))
			$mirror.append('<canvas id="paperdollPC-canvas-dialog"></canvas>');

		EP._ensureMirrorDownloadButton();
		EP._ensureMirrorViewButton();
		EP.syncDialogTitlebarExtras();

		(async function()
		{
			if (typeof V === "undefined" || !V.pc) return;
			EP.invalidate(V.pc);
			const canvas = document.getElementById("paperdollPC-canvas-dialog");
			if (!canvas) return;
			const pose = EP.getPoseForView(EP.getView());
			await EP.renderMirror(canvas, V.pc, { pose: pose });
			EP.syncViewButtons();
			EP.syncDialogTitlebarExtras();
			setTimeout(function() { EP.applyMirrorCanvasLayout(canvas); }, 120);
			setTimeout(function() { EP.applyMirrorCanvasLayout(canvas); }, 500);
		})();
	};

	EP.openMirrorDialog = function()
	{
		if (typeof setup !== "undefined" && typeof setup.open_dialog === "function")
		{
			setup.open_dialog("PaperdollMirror");
			EP.mirrorPC();
			return;
		}
		if (typeof Engine !== "undefined" && Engine.play)
			Engine.play("PaperdollMirrorPassage");
	};

	EP.renderSidebar = async function()
	{
		let body = document.getElementById("exhib-paperdoll-panel-body");
		if (!body) body = document.getElementById("paperdoll-panel-body");
		if (!body || typeof V === "undefined" || !V.pc) return;
		let viewport = body.querySelector(".exhib-paperdoll-viewport");
		if (!viewport)
		{
			viewport = document.createElement("div");
			viewport.className = "exhib-paperdoll-viewport paperdoll-panel-viewport exhib-mirror-stage";
			viewport.setAttribute("data-exhib-mirror", "appearance");
			const canvas = document.createElement("canvas");
			canvas.id = "exhib-paperdoll-sidebar-canvas";
			viewport.appendChild(canvas);
			body.appendChild(viewport);
		}
		else
		{
			viewport.classList.add("exhib-mirror-stage");
			viewport.setAttribute("data-exhib-mirror", "appearance");
		}
		// BG swatches above Appearance paperdoll (black line art visibility)
		const BG = Core.Backgrounds;
		if (BG)
		{
			if (BG.loadManifest) BG.loadManifest();
			BG.applyStyle(viewport, BG.getForMirror("appearance"));
			let barHost = body.querySelector(".exhib-sidebar-bg-host");
			if (!barHost)
			{
				barHost = document.createElement("div");
				barHost.className = "exhib-sidebar-bg-host";
				body.insertBefore(barHost, viewport);
			}
			BG.mountControls(barHost, "appearance", {
				label: "BG",
				stageEl: viewport,
			});
		}
		const canvas = viewport.querySelector("canvas");
		EP._ensureSidebarCanvasClick(canvas);
		const pose = EP.getPoseForView(EP.getView());
		const display = await EP.render(canvas, V.pc, {
			pose,
			quality: "sidebar",
			scale: EP._sidebarScale(),
		});
		EP._syncSidebarViewport(body, viewport, canvas, display && display._displaySize);
	};

	EP.syncPanelFromState = function()
	{
		if (typeof V === "undefined") return;
		let body = document.getElementById("exhib-paperdoll-panel-body");
		if (!body) body = document.getElementById("paperdoll-panel-body");
		if (!body) return;
		const open = !!V.optpaperdollopen;
		body.classList.toggle("is-collapsed", !open);
		body.hidden = !open;
		body.style.display = open ? "" : "none";
		body.style.height = open ? "auto" : "0";
		body.style.overflow = open ? "visible" : "hidden";
	};

	EP.togglePanel = function()
	{
		if (typeof V === "undefined") return;
		V.optpaperdollopen = !V.optpaperdollopen;
		EP.syncPanelFromState();
		if (V.optpaperdollopen) EP.renderSidebar();
	};

	EP.getView = function()
	{
		return (typeof V !== "undefined" && V.optpaperdollview === "back") ? "back" : "front";
	};

	EP.getPoseForView = function(view)
	{
		return view === "back" ? "back" : "front";
	};

	EP.viewButtonLabel = function(view)
	{
		return view === "back" ? "Chest/groin" : "Ass";
	};

	EP.viewButtonTitle = function(view)
	{
		return view === "back" ? "Show chest and groin (front)" : "Show ass (back)";
	};

	EP.rerenderAll = async function()
	{
		if (typeof V === "undefined" || !V.pc) return;
		const pose = EP.getPoseForView(EP.getView());
		let body = document.getElementById("exhib-paperdoll-panel-body");
		if (!body) body = document.getElementById("paperdoll-panel-body");
		if (body && !body.hidden && V.optpaperdollopen)
			await EP.renderSidebar();
		const mirrorDialog = document.getElementById("paperdollPC-canvas-dialog");
		if (mirrorDialog)
		{
			await EP.renderMirror(mirrorDialog, V.pc, { pose: pose });
			setTimeout(function() { EP.applyMirrorCanvasLayout(mirrorDialog); }, 120);
		}
		const mirrorLarge = document.getElementById("paperdollPC-canvas-large");
		if (mirrorLarge)
		{
			await EP.renderMirror(mirrorLarge, V.pc, { pose: pose });
			setTimeout(() => { mirrorLarge.style.transform = "none"; }, 120);
		}
	};

	EP.toggleView = function()
	{
		if (typeof V === "undefined") return;
		V.optpaperdollview = EP.getView() === "back" ? "front" : "back";
		EP.syncViewButtons();
		EP.invalidate();
		EP.rerenderAll();
	};

	EP.syncViewButtons = function()
	{
		if (typeof V === "undefined") return;
		const view = EP.getView();
		const label = EP.viewButtonLabel(view);
		const title = EP.viewButtonTitle(view);
		document.querySelectorAll(".paperdoll-panel-view, .paperdoll-mirror-view").forEach((btn) =>
		{
			btn.textContent = label;
			btn.title = title;
			btn.setAttribute("aria-pressed", view === "back" ? "true" : "false");
		});
		// Appearance sidebar panel only (not Phone / collage / hints / other dialogs)
		document.querySelectorAll(".paperdoll-panel-view, .paperdoll-panel-mirror").forEach((btn) =>
		{
			btn.style.display = V.optpaperdollopen ? "" : "none";
		});
		// Titlebar Ass/Chest + save are mirror-dialog only
		EP.syncDialogTitlebarExtras();
	};

	EP.shopPreview = async function(canvas, tryOnItem)
	{
		if (!canvas || typeof V === "undefined" || !V.pc) return null;
		return EP.render(canvas, V.pc, { pose: "front", quality: "shop", bypassCache: !!tryOnItem });
	};

	EP.renderMirror = async function(canvas, person, options)
	{
		options = Object.assign({
			quality: "mirror",
			// Large enough for PC full-mirror dialog; callers can override
			scale: { maxHeight: 640, maxWidth: 420, center: false },
		}, options || {});
		const result = await EP.render(canvas, person || V.pc, options);

		// Prefer normal flow sizing (absolute + empty stage was shrinking the popup)
		canvas.style.position = "relative";
		canvas.style.left = "auto";
		canvas.style.top = "auto";
		canvas.style.transform = "none";
		canvas.style.display = "block";
		canvas.style.margin = "0 auto";

		const BG = Core.Backgrounds;
		if (BG && canvas)
		{
			const key = options.mirrorKey || "full";
			if (BG.loadManifest) BG.loadManifest();
			const stage = BG.ensureStage(canvas, key);
			if (stage)
			{
				if (BG.syncStageToCanvas) BG.syncStageToCanvas(stage, canvas);
				const host = stage.parentNode;
				if (host && !host.querySelector('.exhib-bg-bar[data-mirror="' + key + '"]'))
				{
					BG.mountControls(host, key, {
						label: "BG",
						stageEl: stage,
						prepend: true,
					});
				}
				else
					BG.applyStyle(stage, BG.getForMirror(key));
			}
		}
		return result;
	};

	EP.listMods = function() { EP._initPacks(); return (EP._mods || []).slice(); };
	EP.listBaseOverlays = function() { EP._initPacks(); return (EP._baseOverlays || []).slice(); };

	setup.Paperdoll = setup.Paperdoll || {};
	const PD = setup.Paperdoll;
	PD.getRenderSubject = EP.getRenderSubject;
	PD.invalidateCache = function() { EP.invalidate(); };
	PD.paperdollSubject = async function(canvas, person, options)
	{
		if (!canvas || !person) return null;
		const opts = Object.assign({ quality: "npc" }, options || {});
		if (person.is_pc || (V.pc && person.equals && person.equals(V.pc)))
			return EP.render(canvas, V.pc, opts);
		try
		{
			return await EP.withRenderSubject(person, () => EP.render(canvas, person, opts));
		}
		catch (e)
		{
			console.warn("[ExhibitionPaperdoll] render failed:", e);
			if (opts.fallbackSilhouette !== false && setup.NpcAppearance && setup.NpcAppearance.renderSilhouetteFallback)
				setup.NpcAppearance.renderSilhouetteFallback(canvas, person);
			return null;
		}
	};
	PD.paperdollPC = async function(canvas) { return EP.render(canvas, V.pc, { quality: "mirror" }); };
	PD.renderSidebarPC = EP.renderSidebar;
	PD.mirrorPC = EP.mirrorPC;
	PD.openMirrorDialog = EP.openMirrorDialog;
	PD.applyMirrorCanvasLayout = EP.applyMirrorCanvasLayout;
	PD.togglePanel = EP.togglePanel;
	PD.toggleView = EP.toggleView;
	PD.syncPanelFromState = EP.syncPanelFromState;
	PD.syncViewButtons = EP.syncViewButtons;
	PD.applyCanvasScale = Core.applyCanvasScale;
	PD.shopModel = EP.shopPreview;

	EP._installPassageHook = function()
	{
		if (EP._passageHookInstalled || typeof jQuery === "undefined") return;
		EP._passageHookInstalled = true;
		jQuery(document).on(":passageend", function() {
			EP.syncViewButtons();
			EP.syncPanelFromState();
			EP.syncDialogTitlebarExtras();
			if (typeof V !== "undefined" && V.optpaperdollopen) EP.renderSidebar();
		});
		// Hide mirror titlebar controls when any other dialog opens (Phone, collage, hints, …)
		jQuery(document).on(":dialogopened", function() {
			// Content is wiki'd just before open; slight defer catches late canvas inject
			EP.syncDialogTitlebarExtras();
			setTimeout(function() { EP.syncDialogTitlebarExtras(); }, 0);
			setTimeout(function() { EP.syncDialogTitlebarExtras(); }, 50);
		});
		jQuery(document).on(":dialogclosed", function() {
			EP.syncDialogTitlebarExtras();
		});
	};
	EP._installPassageHook();

	console.log("[ExhibitionPaperdoll] Runtime ready (LOD " + Core.LOD_TIERS.join("/") + ")");
})();