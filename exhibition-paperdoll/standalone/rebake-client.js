/* In-browser paperdoll rebake — patches game HTML without a local server */
(function()
{
	"use strict";

	const MARKER = "/* === Exhibition Paperdoll Engine === */";
	const LEGACY_MARKER = "/* === Exhibition Paperdoll (standalone) === */";
	const UNMARKED = "// --- core/transforms.js ---";
	const END_ANCHOR = "/* === Exhibition Sidebar (clothing status tweaks) === */";

	const JS_ORDER = [
		"core/transforms.js",
		"core/masks.js",
		"core/poses.js",
		"core/body-variants.js",
		"core/lod.js",
		"core/loader.js",
		"core/tint.js",
		"core/composer.js",
		"core/backgrounds.js",
		"core/mod-registry.js",
		"runtime/cot-mapper.js",
		"runtime/clothing-flags.js",
		"runtime/overlay-mapper.js",
		"runtime/index.js",
		"runtime/base-faces.js",
		"runtime/face-picker.js",
		"runtime/face-mirror.js",
	];

	const TWEE_FILES = ["twee/panel.twee", "twee/mirror.twee", "twee/face-picker.twee", "twee/face-dialog.twee"];

	const FACE_PICKER_CSS_MARKER = "/* === Exhibition Face Picker CSS === */";

	const MIRROR_LINK = "&lt;&lt;link &#39;🪞&#39; PaperdollMirrorPassage&gt;&gt;&lt;&lt;/link&gt;&gt;";
	const CLOTHES_MENU_ANCHOR = "&lt;&lt;include ClothesMenu&gt;&gt;</tw-passagedata><tw-passagedata pid=\"341\"";
	const CLOTHINGFLAGS_BLOCK = "        &lt;&lt;clothingflags $shopitem.item&gt;&gt;\n        &lt;br&gt;";
	const SHOPMODEL_BLOCK = "&lt;&lt;shopModel&gt;&gt;\n        &lt;br&gt;";
	const SHOP_SUBS_OLD = "            T.subs[sub] = opt;\n            document.getElementById";
	const SHOP_SUBS_NEW = "            T.subs[sub] = opt;if (V.shopitem.type=='clothes'){T.refreshShopModel();}\n            document.getElementById";

	const SIDEBAR_MACRO_FALLBACK = `
// Sidebar macro fallback if widget passages fail to load
(function () {
    function appendPanel(output) {
        if (typeof V !== "undefined") {
            if (typeof V.optpaperdollopen === "undefined") V.optpaperdollopen = false;
            if (typeof V.optpaperdollview === "undefined") V.optpaperdollview = "front";
        }
        const $out = jQuery(output);
        $out.append(
            '<div class="paperdoll-panel exhib-paperdoll-panel">' +
                '<div class="paperdoll-panel-bar">' +
                    '<button type="button" class="paperdoll-panel-toggle" onclick="setup.ExhibitionPaperdoll.togglePanel()">' +
                        '<span class="paperdoll-panel-chevron">▶</span> Appearance' +
                    "</button>" +
                    '<button type="button" class="paperdoll-panel-face" onclick="setup.ExhibitionPaperdoll.openFaceDialog()" title="Face close-up, features, and makeup">Face</button>' +
                    '<button type="button" class="exhib-paperdoll-panel-view paperdoll-panel-view" onclick="setup.ExhibitionPaperdoll.toggleView()" title="Show ass (back)" style="display:none;">Ass</button>' +
                    '<button type="button" class="paperdoll-panel-mirror" onclick="setup.ExhibitionPaperdoll.openMirrorDialog()" title="Open full-body mirror" style="display:none;">🪞</button>' +
                "</div>" +
                '<div id="exhib-paperdoll-panel-body" class="paperdoll-panel-body is-collapsed" hidden style="display:none;height:0;overflow:hidden;"></div>' +
            "</div>"
        );
        window.refreshPaperdollPC = function () {
            setup.ExhibitionPaperdoll.invalidate();
            setup.ExhibitionPaperdoll.renderSidebar();
        };
        jQuery(document).one(":passageend", () => {
            if (setup.ExhibitionPaperdoll.syncViewButtons) setup.ExhibitionPaperdoll.syncViewButtons();
            if (setup.ExhibitionPaperdoll.syncPanelFromState) setup.ExhibitionPaperdoll.syncPanelFromState();
        });
    }

    function installMacros() {
        if (typeof Macro === "undefined") return false;
        if (Macro.has("refreshPaperdollPC")) return true;
        Macro.add("PaperdollPC", { handler() {} });
        Macro.add("PaperdollPanel", { handler() { appendPanel(this.output); } });
        Macro.add("refreshPaperdollPC", { handler() { appendPanel(this.output); } });
        Macro.add("shopModel", {
            handler() {
                jQuery(this.output).append('<canvas id="shopModel-canvas" style="position:relative;left:20vw;width:200px;"></canvas>');
                jQuery(document).one(":passageend", () => {
                    (async function () {
                        const canvas = document.getElementById("shopModel-canvas");
                        await setup.ExhibitionPaperdoll.shopPreview(canvas);
                    })();
                });
                T.refreshShopModel = function () {
                    (async function () {
                        const canvas = document.getElementById("shopModel-canvas");
                        await setup.ExhibitionPaperdoll.shopPreview(canvas);
                    })();
                };
            },
        });
        return true;
    }

    jQuery(document).one(":storyready", () => { installMacros(); });
})();
`;

	async function readTextUnder(rootHandle, relPath)
	{
		const parts = String(relPath || "").replace(/\\/g, "/").split("/").filter(Boolean);
		let dir = rootHandle;
		for (let i = 0; i < parts.length - 1; i++)
			dir = await dir.getDirectoryHandle(parts[i]);
		const fh = await dir.getFileHandle(parts[parts.length - 1]);
		return await (await fh.getFile()).text();
	}

	async function readBytesUnder(rootHandle, relPath)
	{
		const parts = String(relPath || "").replace(/\\/g, "/").split("/").filter(Boolean);
		let dir = rootHandle;
		for (let i = 0; i < parts.length - 1; i++)
			dir = await dir.getDirectoryHandle(parts[i]);
		const fh = await dir.getFileHandle(parts[parts.length - 1]);
		return await (await fh.getFile()).arrayBuffer();
	}

	async function writeTextUnder(rootHandle, relPath, text)
	{
		const blob = new Blob([text], { type: "text/plain" });
		const parts = String(relPath || "").replace(/\\/g, "/").split("/").filter(Boolean);
		let dir = rootHandle;
		for (let i = 0; i < parts.length - 1; i++)
			dir = await dir.getDirectoryHandle(parts[i], { create: true });
		const fh = await dir.getFileHandle(parts[parts.length - 1], { create: true });
		const writable = await fh.createWritable();
		await writable.write(blob);
		await writable.close();
	}

	function prefixAssetPath(path, prefix)
	{
		if (!path || path.startsWith("exhibition-paperdoll/")) return path;
		if (path.startsWith("base-pack/") || path.startsWith("mods/"))
			return "exhibition-paperdoll/" + path;
		return prefix + "/" + path.replace(/^\//, "");
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
					if (entry[kind] && typeof entry[kind] === "object")
					{
						const mapped = {};
						for (const [tier, src] of Object.entries(entry[kind]))
							if (src) mapped[tier] = prefixAssetPath(src, prefix);
						entry[kind] = mapped;
					}
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

	async function walkImages(dirHandle, relPrefix, out)
	{
		for await (const [name, handle] of dirHandle.entries())
		{
			if (handle.kind === "directory")
				await walkImages(handle, relPrefix + name + "/", out);
			else if (/\.(png|webp|jpe?g)$/i.test(name))
				out.push(relPrefix + name);
		}
	}

	async function buildAssetManifest(epHandle)
	{
		const manifest = [];
		for (const sub of ["base-pack", "mods"])
		{
			try
			{
				const subDir = await epHandle.getDirectoryHandle(sub);
				await walkImages(subDir, "exhibition-paperdoll/" + sub + "/", manifest);
			}
			catch (e) { /* missing */ }
		}
		return manifest.sort();
	}

	async function loadMods(epHandle)
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
		try { modsDir = await epHandle.getDirectoryHandle("mods"); }
		catch (e) { return { mods, baseOverlays, skinOverlays, baseFaceOverlays, faceOverlays, hairOverlays, makeupOverlays, bodyWritingOverlays, effectOverlays }; }

		const entries = [];
		for await (const [name, handle] of modsDir.entries())
		{
			if (handle.kind === "directory") entries.push([name, handle]);
		}
		entries.sort((a, b) => a[0].localeCompare(b[0]));

		for (const [modName, modDir] of entries)
		{
			let packText;
			try { packText = await readTextUnder(modDir, "pack.json"); }
			catch (e) { continue; }
			let data;
			try { data = JSON.parse(packText); }
			catch (e) { continue; }
			if (data && data.enabled === false) continue;
			const prefix = "mods/" + modName;
			if (data && data.type === "base-overlay")
			{
				const entry = normalizePackAssets(data, prefix);
				entry.prefix = prefix;
				baseOverlays.push(entry);
				continue;
			}
			if (data && data.type === "skin-overlay")
			{
				const entry = normalizePackAssets(data, prefix);
				entry.prefix = prefix;
				skinOverlays.push(entry);
				continue;
			}
			if (data && data.type === "base-face-overlay")
			{
				const entry = normalizePackAssets(data, prefix);
				entry.prefix = prefix;
				baseFaceOverlays.push(entry);
				continue;
			}
			if (data && data.type === "face-overlay")
			{
				const entry = normalizePackAssets(data, prefix);
				entry.prefix = prefix;
				faceOverlays.push(entry);
				continue;
			}
			if (data && data.type === "hair-overlay")
			{
				const entry = normalizePackAssets(data, prefix);
				entry.prefix = prefix;
				hairOverlays.push(entry);
				continue;
			}
			if (data && data.type === "makeup-overlay")
			{
				const entry = normalizePackAssets(data, prefix);
				entry.prefix = prefix;
				makeupOverlays.push(entry);
				continue;
			}
			if (data && data.type === "body-writing-overlay")
			{
				const entry = normalizePackAssets(data, prefix);
				entry.prefix = prefix;
				bodyWritingOverlays.push(entry);
				continue;
			}
			if (data && data.type === "effect-overlay")
			{
				const entry = normalizePackAssets(data, prefix);
				entry.prefix = prefix;
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
					mods.push({ id: packId, prefix: prefix, items: norm.items });
				}
				if (skin.items && skin.items.length)
				{
					const entry = normalizePackAssets({ id: packId, type: "skin-overlay", items: skin.items }, prefix);
					entry.prefix = prefix;
					skinOverlays.push(entry);
				}
				if (baseFace.items && baseFace.items.length)
				{
					const entry = normalizePackAssets({ id: packId, type: "base-face-overlay", items: baseFace.items }, prefix);
					entry.prefix = prefix;
					baseFaceOverlays.push(entry);
				}
				if (face.items && face.items.length)
				{
					const entry = normalizePackAssets({ id: packId, type: "face-overlay", items: face.items }, prefix);
					entry.prefix = prefix;
					faceOverlays.push(entry);
				}
				if (hair.items && hair.items.length)
				{
					const entry = normalizePackAssets({ id: packId, type: "hair-overlay", items: hair.items }, prefix);
					entry.prefix = prefix;
					hairOverlays.push(entry);
				}
				if (makeup.items && makeup.items.length)
				{
					const entry = normalizePackAssets({ id: packId, type: "makeup-overlay", items: makeup.items }, prefix);
					entry.prefix = prefix;
					makeupOverlays.push(entry);
				}
				if (bodyWriting.items && bodyWriting.items.length)
				{
					const entry = normalizePackAssets({ id: packId, type: "body-writing-overlay", items: bodyWriting.items }, prefix);
					entry.prefix = prefix;
					bodyWritingOverlays.push(entry);
				}
				if (effect.items && effect.items.length)
				{
					const entry = normalizePackAssets({ id: packId, type: "effect-overlay", items: effect.items }, prefix);
					entry.prefix = prefix;
					if (effect.effect) entry.effect = effect.effect;
					effectOverlays.push(entry);
				}
				continue;
			}
			if (data && data.items)
			{
				const norm = normalizePackAssets({ items: data.items }, prefix);
				mods.push({ id: data.id || modName, prefix: prefix, items: norm.items });
			}
			else if (Array.isArray(data))
				mods.push({ id: modName, prefix: prefix, items: data });
			else
				mods.push({ id: modName, prefix: prefix, items: [normalizePackAssets(data, prefix)] });
		}
		return { mods, baseOverlays, skinOverlays, baseFaceOverlays, faceOverlays, hairOverlays, makeupOverlays, bodyWritingOverlays, effectOverlays };
	}

	async function buildStandaloneJs(epHandle, manifest, basePack, modData)
	{
		const parts = [MARKER, ""];
		for (const rel of JS_ORDER)
			parts.push("// --- " + rel + " ---\n" + (await readTextUnder(epHandle, rel)).trim() + "\n");

		parts.push(
			"window.__exhibitionPaperdollBasePack = " + JSON.stringify(basePack) + ";\n"
			+ "window.__exhibitionPaperdollMods = " + JSON.stringify(modData.mods) + ";\n"
			+ "window.__exhibitionPaperdollBaseOverlays = " + JSON.stringify(modData.baseOverlays) + ";\n"
			+ "window.__exhibitionPaperdollSkinOverlays = " + JSON.stringify(modData.skinOverlays) + ";\n"
			+ "window.__exhibitionPaperdollBaseFaceOverlays = " + JSON.stringify(modData.baseFaceOverlays) + ";\n"
			+ "window.__exhibitionPaperdollFaceOverlays = " + JSON.stringify(modData.faceOverlays) + ";\n"
			+ "window.__exhibitionPaperdollHairOverlays = " + JSON.stringify(modData.hairOverlays) + ";\n"
			+ "window.__exhibitionPaperdollMakeupOverlays = " + JSON.stringify(modData.makeupOverlays) + ";\n"
			+ "window.__exhibitionPaperdollBodyWritingOverlays = " + JSON.stringify(modData.bodyWritingOverlays) + ";\n"
			+ "window.__exhibitionPaperdollEffectOverlays = " + JSON.stringify(modData.effectOverlays) + ";\n"
			+ "window.__exhibitionPaperdollManifest = " + JSON.stringify(manifest) + ";\n"
		);
		parts.push(SIDEBAR_MACRO_FALLBACK);
		return parts.join("\n");
	}

	function escapeTwee(s)
	{
		return String(s || "")
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;");
	}

	function nextPassagePids(text, count)
	{
		const pids = [];
		const re = /pid="(\d+)"/g;
		let m;
		while ((m = re.exec(text)) !== null) pids.push(Number(m[1]));
		const start = pids.length ? Math.max.apply(null, pids) + 1 : 900000;
		return Array.from({ length: count }, (_, i) => start + i);
	}

	const PAPERDOLL_PASSAGE_NAMES = [
		"PaperdollUtil",
		"ExhibitionPaperdollUtil",
		"PaperdollMirror",
		"PaperdollMirrorPassage",
		"ExhibitionFacePickerWidgets",
		"PaperdollFace",
		"PaperdollFacePassage",
	];

	/** Remove all injected paperdoll/face passages so rebakes never stack duplicates. */
	function stripPaperdollPassages(text)
	{
		for (const name of PAPERDOLL_PASSAGE_NAMES)
		{
			const re = new RegExp(
				'<tw-passagedata[^>]*\\bname="' + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
				+ '"[^>]*>[\\s\\S]*?</tw-passagedata>\\s*',
				"g"
			);
			text = text.replace(re, "");
		}
		return text;
	}

	async function widgetPassages(epHandle, html)
	{
		const blocks = [];
		const pids = nextPassagePids(html, 16);
		let pidIndex = 0;
		for (const tweeRel of TWEE_FILES)
		{
			const raw = await readTextUnder(epHandle, tweeRel);
			const chunks = raw.split(/(?=^:: )/m).filter((c) => c.trim().startsWith("::"));
			for (const chunk of chunks)
			{
				const lines = chunk.trim().split("\n");
				const header = lines[0] || "";
				const body = lines.slice(1).join("\n").trim();
				const nameMatch = header.match(/^::\s+(\S+)/);
				if (!nameMatch) continue;
				const name = nameMatch[1];
				const tagsMatch = header.match(/\[([^\]]*)\]/);
				const tags = tagsMatch ? tagsMatch[1] : "nobr";
				const pid = pids[pidIndex++];
				blocks.push(
					'<tw-passagedata pid="' + pid + '" name="' + name + '" tags="' + tags + '" '
					+ 'position="100,100" size="100,100">' + escapeTwee(body) + "</tw-passagedata>"
				);
			}
		}
		return blocks.join("\n");
	}

	async function patchFacePickerCss(epHandle, text)
	{
		let css;
		try { css = (await readTextUnder(epHandle, "face-picker.css")).trim(); }
		catch (e) { return text; }
		const block = FACE_PICKER_CSS_MARKER + "\n" + css + "\n";
		if (text.includes(FACE_PICKER_CSS_MARKER))
		{
			const re = new RegExp(FACE_PICKER_CSS_MARKER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\\s\\S]*?(?=\\n\\.paperdoll-mirror-layout|\\n\\.exhib-face-picker|\\n\\.tabgroup)", "m");
			return text.replace(re, block.trim() + "\n\n");
		}
		const anchors = ["\n.paperdoll-mirror-layout {", "\n.exhib-face-picker {", "\n.tabgroup {"];
		for (const anchor of anchors)
		{
			if (text.includes(anchor))
				return text.replace(anchor, "\n" + block + anchor);
		}
		return text;
	}

	function patchPaperdollCss(text)
	{
		const oldCss = ".paperdoll-panel-body {\n"
			+ "    display: flex;\n"
			+ "    flex-direction: column;\n"
			+ "    flex: 1 1 auto;\n"
			+ "    min-height: 0;\n"
			+ "    height: auto;\n"
			+ "    overflow: hidden;\n"
			+ "}\n"
			+ ".paperdoll-panel-body.is-collapsed,";
		const newCss = ".paperdoll-panel-body {\n"
			+ "    display: flex;\n"
			+ "    flex-direction: column;\n"
			+ "    flex: 1 1 auto;\n"
			+ "    min-height: 0;\n"
			+ "    height: auto;\n"
			+ "    overflow: hidden;\n"
			+ "}\n"
			+ ".paperdoll-panel-body:not(.is-collapsed):not([hidden]) {\n"
			+ "    min-height: 120px;\n"
			+ "}\n"
			+ ".paperdoll-panel-body.is-collapsed,";
		return oldCss in text ? text.replace(oldCss, newCss) : text;
	}

	function normalizeStoryCaptionPaperdoll(text)
	{
		if (!text.includes('name="StoryCaption"')) return text;
		text = text.replace(
			"&lt;div style=&quot;display:grid&quot;&gt;&lt;div class=&quot;locimgcontainer&quot; style=&quot;height: 180px; z-index:0&quot;&gt;&lt;&lt;PaperdollPC&gt;&gt;",
			"&lt;div class=&quot;locimgcontainer&quot;&gt;"
		);
		text = text.replace(
			"&lt;div style=&quot;display:grid&quot;&gt;&lt;div class=&quot;locimgcontainer&quot; style=&quot;height: 180px; z-index:0&quot;&gt;",
			"&lt;div class=&quot;locimgcontainer&quot;&gt;"
		);
		const paperdollAnchor = "        &lt;&lt;unset _toys&gt;&gt;\n"
			+ "    &lt;/div&gt;\n"
			+ "    &lt;div class=&quot;uibar&quot;&gt;&lt;/div&gt;\n"
			+ "    &lt;&lt;refreshPaperdollPC&gt;&gt;\n\n"
			+ "    &lt;&lt;if !$prevneeds&gt;&gt;";
		const paperdollMissing = "        &lt;&lt;unset _toys&gt;&gt;\n"
			+ "    &lt;/div&gt;\n"
			+ "    &lt;div class=&quot;uibar&quot;&gt;&lt;/div&gt;\n\n"
			+ "    &lt;&lt;if !$prevneeds&gt;&gt;";
		if (!text.includes(paperdollAnchor) && text.includes(paperdollMissing))
			text = text.replace(paperdollMissing, paperdollAnchor);
		return text;
	}

	function patchPassageHooks(text)
	{
		if (!text.includes(MIRROR_LINK + "&lt;&lt;include ClothesMenu&gt;&gt;") && text.includes(CLOTHES_MENU_ANCHOR))
			text = text.replace(CLOTHES_MENU_ANCHOR, MIRROR_LINK + CLOTHES_MENU_ANCHOR);
		if (!text.includes(CLOTHINGFLAGS_BLOCK + SHOPMODEL_BLOCK) && text.includes(CLOTHINGFLAGS_BLOCK))
			text = text.replace(CLOTHINGFLAGS_BLOCK, CLOTHINGFLAGS_BLOCK + SHOPMODEL_BLOCK);
		if (!text.includes(SHOP_SUBS_NEW) && text.includes(SHOP_SUBS_OLD))
			text = text.replace(SHOP_SUBS_OLD, SHOP_SUBS_NEW);
		return text;
	}

	function stripOldEngine(text)
	{
		const endEsc = END_ANCHOR.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		for (const start of [MARKER, LEGACY_MARKER, UNMARKED])
		{
			if (!text.includes(start)) continue;
			const re = new RegExp(start.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\\s\\S]*?(?=\\n" + endEsc + ")", "m");
			text = text.replace(re, "");
		}
		const shim = "// ModLoader shims for standalone desktop HTML";
		if (text.includes(shim))
		{
			const re = new RegExp(shim.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\\s\\S]*?(?=\\n" + endEsc + ")", "m");
			text = text.replace(re, "");
		}
		return text;
	}

	async function patchHtml(epHandle, html, jsBundle)
	{
		let text = stripOldEngine(html);
		text = patchPaperdollCss(text);
		text = await patchFacePickerCss(epHandle, text);
		text = normalizeStoryCaptionPaperdoll(text);

		const paperdollJs = jsBundle.includes(MARKER)
			? jsBundle.split(MARKER)[1].trim()
			: jsBundle;
		const bundle = MARKER + "\n" + paperdollJs + "\n\n";

		if (text.includes(END_ANCHOR))
			text = text.replace(END_ANCHOR, bundle + END_ANCHOR);
		else if (text.includes(MARKER))
		{
			const re = new RegExp(MARKER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\\s\\S]*?(?=\\n</script><tw-passagedata pid=\"1\")", "m");
			text = text.replace(re, paperdollJs);
		}
		else
		{
			const end = "\n</script><tw-passagedata pid=\"1\"";
			text = text.replace("        }\n};</script><tw-passagedata pid=\"1\"", "        }\n};\n\n" + jsBundle.trim() + end);
		}

		text = patchPassageHooks(text);
		text = normalizeStoryCaptionPaperdoll(text);
		text = patchPaperdollCss(text);

		// Strip every prior copy, then inject one clean set (prevents Face×N stacking)
		text = stripPaperdollPassages(text);
		const passages = await widgetPassages(epHandle, text);
		if (text.includes("</tw-storydata>"))
			text = text.replace("</tw-storydata>", passages + "\n</tw-storydata>");
		else
			text = text + "\n" + passages + "\n";

		return text;
	}

	function mimeForPath(path)
	{
		return /\.png$/i.test(path) ? "image/png" : "image/jpeg";
	}

	async function rebuildBaseEmbed(epHandle)
	{
		const packText = await readTextUnder(epHandle, "base-pack/pack.json");
		const pack = JSON.parse(packText);
		const images = {};

		async function addImage(path)
		{
			if (!path || images[path]) return;
			let rel = path;
			if (rel.startsWith("base-pack/")) rel = rel.slice("base-pack/".length);
			let buf;
			try { buf = await readBytesUnder(epHandle, "base-pack/" + rel); }
			catch (e) { return; }
			const bytes = new Uint8Array(buf);
			let binary = "";
			const chunk = 0x8000;
			for (let i = 0; i < bytes.length; i += chunk)
				binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
			const b64 = btoa(binary);
			const dataUrl = "data:" + mimeForPath(path) + ";base64," + b64;
			images[path] = dataUrl;
			images["base-pack/" + rel] = dataUrl;
		}

		for (const layer of pack.layers || [])
		{
			for (const poseDef of Object.values(layer.poses || {}))
			{
				if (!poseDef) continue;
				const sources = Object.assign({}, poseDef.sources || {});
				if (poseDef.asset) sources["256"] = sources["256"] || poseDef.asset;
				for (const src of Object.values(sources)) await addImage(src);
			}
		}

		const payload = { pack: pack, images: images };
		const out = "/* Auto-generated by editor rebake-client — offline base doll */\n"
			+ "window.__exhibitionEditorBaseEmbed = " + JSON.stringify(payload) + ";\n";
		await writeTextUnder(epHandle, "standalone/base-embed.js", out);
	}

	async function rebake(epHandle, gameHtmlHandle, options)
	{
		options = options || {};
		const basePackRaw = JSON.parse(await readTextUnder(epHandle, "base-pack/pack.json"));
		const basePack = normalizePackAssets(basePackRaw, "exhibition-paperdoll/base-pack");
		const manifest = await buildAssetManifest(epHandle);
		const modData = await loadMods(epHandle);
		const jsBundle = await buildStandaloneJs(epHandle, manifest, basePack, modData);

		const htmlFile = await gameHtmlHandle.getFile();
		const html = await htmlFile.text();
		const patched = await patchHtml(epHandle, html, jsBundle);

		const writable = await gameHtmlHandle.createWritable();
		await writable.write(new Blob([patched], { type: "text/html" }));
		await writable.close();

		if (options.rebuildEmbed !== false)
		{
			try { await rebuildBaseEmbed(epHandle); }
			catch (e) { console.warn("[rebake-client] base-embed skipped:", e); }
		}

		return {
			manifestCount: manifest.length,
			modCount: modData.mods.length,
			baseOverlayCount: modData.baseOverlays.length,
			jsSizeKb: Math.round(jsBundle.length / 1024),
		};
	}

	window.ExhibitionRebakeClient = {
		rebake: rebake,
		rebuildBaseEmbed: rebuildBaseEmbed,
	};
})();