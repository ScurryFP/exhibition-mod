/* Standalone shim — local HTML only, no server */
(function()
{
	"use strict";
	window.setup = window.setup || {};
	setup.ExhibitionPaperdoll = setup.ExhibitionPaperdoll || {};
	const EP = setup.ExhibitionPaperdoll;
	const Core = EP.Core = EP.Core || {};

	EP._assetRoot = "";
	EP._basePack = null;
	EP._baseOverlays = [];
	EP._embedImages = {};

	if (window.__exhibitionEditorBaseEmbed)
	{
		EP._embedImages = window.__exhibitionEditorBaseEmbed.images || {};
		if (window.__exhibitionEditorBaseEmbed.pack)
			EP._basePack = window.__exhibitionEditorBaseEmbed.pack;
	}

	Core.resolveAssetPath = function(relativePath)
	{
		if (!relativePath || typeof relativePath !== "string") return "";
		if (/^(data:|blob:|https?:)/i.test(relativePath)) return relativePath;

		const keys = [
			relativePath,
			relativePath.replace(/^exhibition-paperdoll\//, ""),
			relativePath.replace(/^\.\.\//, ""),
			"base-pack/" + relativePath.replace(/^.*base-pack\//, ""),
		];
		for (const key of keys)
		{
			if (EP._embedImages[key]) return EP._embedImages[key];
		}

		const base = EP._assetRoot || "";
		return base + relativePath.replace(/^\//, "");
	};

	EP.loadBasePack = async function()
	{
		if (EP._basePack) return EP._basePack;
		EP._basePack = { canvas: { width: 256, height: 512 }, layers: [] };
		return EP._basePack;
	};

	EP.buildPreviewLayers = function(editorLayers, options)
	{
		options = options || {};
		const mode = options.editorMode || "clothing";
		const layers = [];

		if (mode === "base-poses")
		{
			if (editorLayers && editorLayers.length)
				layers.push.apply(layers, editorLayers);
			else if (EP._basePack && Array.isArray(EP._basePack.layers))
			{
				for (const layer of EP._basePack.layers)
					if (layer && layer.poses) layers.push(layer);
			}
			return layers.slice().sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
		}

		if (EP._basePack && Array.isArray(EP._basePack.layers))
		{
			for (const layer of EP._basePack.layers)
				if (layer && layer.poses) layers.push(layer);
		}
		if (editorLayers && editorLayers.length)
			layers.push.apply(layers, editorLayers);
		return layers.slice().sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
	};

	EP.previewCompose = async function(canvas, options)
	{
		options = options || {};
		const layers = EP.buildPreviewLayers(options.editorLayers, options);
		return Core.compose(canvas, {
			pose: options.pose || "front",
			quality: options.quality || "preview",
			displacement: options.displacement || "normal",
			layers: layers,
			pack: EP._basePack,
			tintPreviewOverlay: true,
		});
	};

	window.ExhibitionEditorEngine = {
		EP: EP,
		Core: Core,
		POSES: Core.POSES || {},
		LOD_TIERS: Core.LOD_TIERS || [256, 512, 1024, 2048],
	};
})();