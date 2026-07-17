/* Exhibition paperdoll — displacement masks (base garment + cutout overlays) */
(function()
{
	"use strict";
	setup.ExhibitionPaperdoll = setup.ExhibitionPaperdoll || {};
	const EP = setup.ExhibitionPaperdoll;
	const Core = EP.Core = EP.Core || {};

	/**
	 * Paperdoll displacement art ids (authoring + runtime).
	 * game: CoT clothing "displace <verb>" names that map here.
	 * exposure: ExhibitionAdjustment TEMPLATES keys that map here by default.
	 * Mask hides base where transparent; optional depth PNG on top.
	 */
	Core.DISPLACEMENT_PRESETS = [
		{ id: "normal", label: "Normal (full base)" },
		{
			id: "hem_lifted",
			label: "Hem lifted",
			game: ["pull up", "hike up", "roll up"],
			exposure: ["hike_skirt", "tie_top", "underwear_peek", "swim_adjust", "bare_midriff"],
		},
		{
			id: "neckline_lowered",
			label: "Neckline lowered",
			game: ["pull down", "tug down", "loosen", "unbutton", "unbutton front", "unclasp"],
			exposure: ["loosen_neck", "dress_daring", "open_outer"],
		},
		{
			id: "pulled_aside",
			label: "Pulled aside",
			game: ["pull aside", "tug aside", "tug", "shift", "move aside", "brush aside",
				"pull tentacles aside", "uncover", "unbutton butt"],
			exposure: ["side_gap", "areola_show", "nipple_slip"],
		},
		{
			id: "lifted",
			label: "Lifted / raised",
			game: ["lift", "pull off"],
			exposure: [],
		},
		{
			id: "unzipped",
			label: "Unzipped",
			game: ["unzip"],
			exposure: [],
		},
		{
			id: "open",
			label: "Opened (jacket / flap)",
			game: ["open"],
			exposure: ["open_outer"],
		},
		{
			id: "unfastened",
			label: "Unfastened",
			game: ["unfasten", "unfastened", "undo"],
			exposure: [],
		},
		{
			id: "untied",
			label: "Untied",
			game: ["untie"],
			exposure: ["tie_top"],
		},
		{
			id: "unlaced",
			label: "Unlaced",
			game: ["unlace"],
			exposure: [],
		},
		{
			id: "unbuckled",
			label: "Unbuckled",
			game: ["unbuckle", "unbuckle snout of"],
			exposure: [],
		},
		{
			id: "peeled_down",
			label: "Peeled down",
			game: ["peel down"],
			exposure: [],
		},
		{
			id: "unwrapped",
			label: "Unwrapped / unwound",
			game: ["unwrap", "unwind"],
			exposure: [],
		},
		{
			id: "cameltoe",
			label: "Cameltoe (depth overlay)",
			game: [],
			exposure: ["tighten_bottom", "underwear_peek", "swim_adjust"],
		},
		{
			id: "midriff_bare",
			label: "Midriff bare",
			game: [],
			exposure: ["bare_midriff"],
		},
		{
			id: "side_gap",
			label: "Side gap / sideboob",
			game: [],
			exposure: ["side_gap", "swim_adjust"],
		},
		{
			id: "areola_show",
			label: "Areola show-through",
			game: [],
			exposure: ["areola_show"],
		},
		{
			id: "nipple_slip",
			label: "Nipple slip",
			game: [],
			exposure: ["nipple_slip"],
		},
	];

	/** Lookup preset row by id. */
	Core.displacementPreset = function(id)
	{
		if (!id) return null;
		for (const p of Core.DISPLACEMENT_PRESETS)
		{
			if (p.id === id) return p;
		}
		return null;
	};

	Core.normalizeDisplacementId = function(id)
	{
		if (!id || id === "normal") return "normal";
		return String(id);
	};

	Core._normalizeDispSources = function(disp, kind)
	{
		if (!disp || !disp[kind]) return null;
		const normalized = Core.normalizeSources({ sources: disp[kind] });
		return normalized && Object.keys(normalized).length ? normalized : null;
	};

	Core.displacementHasArt = function(poseDef, dispId)
	{
		if (!poseDef || !poseDef.displacements || !dispId || dispId === "normal") return false;
		const disp = poseDef.displacements[dispId];
		if (!disp) return false;
		return !!(Core._normalizeDispSources(disp, "sources")
			|| Core._normalizeDispSources(disp, "mask")
			|| Core._normalizeDispSources(disp, "depth"));
	};

	Core.resolveSteppedDisplacementId = function(poseDef, baseId, steps)
	{
		if (!poseDef || !baseId || steps <= 0) return null;
		for (let s = steps; s >= 1; s--)
		{
			const stepped = baseId + "_" + s;
			if (Core.displacementHasArt(poseDef, stepped)) return stepped;
		}
		return Core.displacementHasArt(poseDef, baseId) ? baseId : null;
	};

	Core.resolvePoseDrawPlan = function(poseDef, displacementId, requestedLod)
	{
		if (!poseDef) return null;
		const dispId = Core.normalizeDisplacementId(displacementId);
		const baseSources = Core.normalizeSources(poseDef);
		if (dispId === "normal" || !poseDef.displacements)
			return { mode: "base", sources: baseSources, transform: poseDef.transform };

		const disp = poseDef.displacements[dispId];
		if (!disp) return { mode: "base", sources: baseSources, transform: poseDef.transform };

		const customSources = Core._normalizeDispSources(disp, "sources");
		const maskSources = Core._normalizeDispSources(disp, "mask");
		const depthSources = Core._normalizeDispSources(disp, "depth");
		const transform = disp.transform || poseDef.transform;
		const depthTransform = disp.depthTransform || poseDef.transform;

		if (customSources)
		{
			return {
				mode: "replace",
				sources: customSources,
				depth: depthSources,
				transform: transform,
				depthTransform: depthTransform,
			};
		}

		if (maskSources || depthSources)
		{
			return {
				mode: "masked",
				sources: baseSources,
				mask: maskSources,
				depth: depthSources,
				transform: poseDef.transform,
				depthTransform: depthTransform,
			};
		}

		return { mode: "base", sources: baseSources, transform: poseDef.transform };
	};

	Core.loadSourcesAtLod = async function(sources, requestedLod)
	{
		if (!sources || !Object.keys(sources).length) return { img: null };
		return Core.loadPoseImage({ sources: sources }, requestedLod);
	};

	Core._drawDepthOverlay = async function(ctx, plan, requestedLod, outW, outH)
	{
		if (!plan.depth || !Object.keys(plan.depth).length) return;
		const depthLoaded = await Core.loadSourcesAtLod(plan.depth, requestedLod);
		if (!depthLoaded.img) return;
		ctx.save();
		const dt = Core.scaleTransformForLod(plan.depthTransform || plan.transform, outW / (Core.DEFAULT_REF_LOD || 256));
		Core.applyTransform(ctx, dt, outW, outH);
		Core.containDrawImage(ctx, depthLoaded.img, outW, outH);
		ctx.restore();
	};

	Core.drawMaskedLayer = async function(ctx, plan, requestedLod, outW, outH)
	{
		if (!plan) return false;
		const transform = Core.scaleTransformForLod(plan.transform, outW / (Core.DEFAULT_REF_LOD || 256));

		if (plan.mode === "replace")
		{
			const loaded = await Core.loadSourcesAtLod(plan.sources, requestedLod);
			if (!loaded.img) return false;
			ctx.save();
			Core.applyTransform(ctx, transform, outW, outH);
			Core.containDrawImage(ctx, loaded.img, outW, outH);
			ctx.restore();
			await Core._drawDepthOverlay(ctx, plan, requestedLod, outW, outH);
			return true;
		}

		const baseLoaded = await Core.loadSourcesAtLod(plan.sources, requestedLod);
		if (!baseLoaded.img) return false;

		const off = document.createElement("canvas");
		off.width = outW;
		off.height = outH;
		const octx = off.getContext("2d");
		octx.save();
		Core.applyTransform(octx, transform, outW, outH);
		Core.containDrawImage(octx, baseLoaded.img, outW, outH);
		octx.restore();

		if (plan.mask && Object.keys(plan.mask).length)
		{
			const maskLoaded = await Core.loadSourcesAtLod(plan.mask, requestedLod);
			if (maskLoaded.img)
			{
				octx.globalCompositeOperation = "destination-in";
				octx.setTransform(1, 0, 0, 1, 0, 0);
				octx.globalAlpha = 1;
				Core.containDrawImage(octx, maskLoaded.img, outW, outH);
			}
		}

		ctx.drawImage(off, 0, 0);
		await Core._drawDepthOverlay(ctx, plan, requestedLod, outW, outH);
		return true;
	};
})();