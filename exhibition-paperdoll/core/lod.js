/* Exhibition paperdoll — multi-resolution LOD */
(function()
{
	"use strict";
	setup.ExhibitionPaperdoll = setup.ExhibitionPaperdoll || {};
	const EP = setup.ExhibitionPaperdoll;
	const Core = EP.Core = EP.Core || {};

	Core.LOD_TIERS = [256, 512, 1024, 2048];
	Core.DEFAULT_REF_LOD = 256;

	Core.QUALITY_LOD = {
		sidebar: 256,
		preview: 512,
		shop: 512,
		npc: 512,
		mirror: 2048,
		capture: 2048,
		elkbook: 512,
		library: 512,
		generic: 256,
	};

	Core.qualityToLod = function(quality)
	{
		if (quality == null) return Core.DEFAULT_REF_LOD;
		if (typeof quality === "number" && Core.LOD_TIERS.includes(quality)) return quality;
		const key = String(quality).toLowerCase();
		return Core.QUALITY_LOD[key] || Core.DEFAULT_REF_LOD;
	};

	Core.normalizeSources = function(poseDef)
	{
		if (!poseDef) return {};
		if (poseDef.sources && typeof poseDef.sources === "object")
		{
			const out = {};
			for (const [tier, path] of Object.entries(poseDef.sources))
			{
				const n = Number(tier);
				if (n && path) out[n] = path;
			}
			return out;
		}
		if (poseDef.asset)
			return { [Core.DEFAULT_REF_LOD]: poseDef.asset };
		return {};
	};

	Core.mergeSources = function(baseSources, overlaySources)
	{
		return Object.assign({}, baseSources || {}, overlaySources || {});
	};

	Core.pickLod = function(requestedLod, sources)
	{
		sources = sources || {};
		const available = Core.LOD_TIERS.filter(t => sources[t]);
		if (!available.length) return null;
		const want = Number(requestedLod) || Core.DEFAULT_REF_LOD;
		let pick = available[0];
		for (const tier of available)
		{
			if (tier <= want) pick = tier;
		}
		if (pick > want)
		{
			for (const tier of available)
			{
				if (tier >= want) return tier;
			}
		}
		return pick;
	};

	Core.lodScale = function(lod, refLod)
	{
		refLod = refLod || Core.DEFAULT_REF_LOD;
		return (Number(lod) || refLod) / refLod;
	};

	Core.scaleTransformForLod = function(transform, lodScale)
	{
		const t = Core.normalizeTransform(transform);
		if (lodScale === 1) return t;
		return Object.assign({}, t, {
			x: t.x * lodScale,
			y: t.y * lodScale,
		});
	};

	Core.applyCanvasScaleMode = function(canvas, scale, lod)
	{
		const hi = (Number(lod) || Core.DEFAULT_REF_LOD) >= 1024;
		if (hi)
		{
			canvas.style.imageRendering = "auto";
			return;
		}
		canvas.style.imageRendering = "pixelated";
		canvas.style.imageRendering = "crisp-edges";
	};
})();