/* Exhibition paperdoll — canvas composer */
(function()
{
	"use strict";
	setup.ExhibitionPaperdoll = setup.ExhibitionPaperdoll || {};
	const EP = setup.ExhibitionPaperdoll;
	const Core = EP.Core = EP.Core || {};

	Core.drawFallbackBody = function(ctx, width, height, pose)
	{
		ctx.save();
		ctx.clearRect(0, 0, width, height);
		const skin = "#e8c4a8";
		ctx.fillStyle = skin;
		ctx.strokeStyle = "#8b6914";
		ctx.lineWidth = Math.max(1, Math.round(width / 128));
		const cx = width / 2;
		ctx.beginPath();
		ctx.ellipse(cx, height * 0.18, width * 0.14, height * 0.09, 0, 0, Math.PI * 2);
		ctx.fill(); ctx.stroke();
		ctx.fillRect(cx - width * 0.16, height * 0.26, width * 0.32, height * 0.38);
		ctx.strokeRect(cx - width * 0.16, height * 0.26, width * 0.32, height * 0.38);
		ctx.restore();
	};

	Core.containDrawImage = function(ctx, img, destW, destH)
	{
		if (!img || !img.width || !img.height) return false;
		const scale = Math.min(destW / img.width, destH / img.height);
		const dw = img.width * scale;
		const dh = img.height * scale;
		const dx = (destW - dw) / 2;
		const dy = (destH - dh) / 2;
		ctx.drawImage(img, dx, dy, dw, dh);
		return true;
	};

	Core.compose = async function(canvas, spec)
	{
		if (!canvas) return null;
		const pose = Core.normalizePose(spec.pose);
		const pack = spec.pack || EP._basePack;
		const refW = (pack && pack.canvas && pack.canvas.width) || Core.DEFAULT_REF_LOD;
		const refH = (pack && pack.canvas && pack.canvas.height) || (Core.DEFAULT_REF_LOD * 2);
		const requestedLod = spec.lod || Core.qualityToLod(spec.quality);
		const layers = (spec.layers || []).slice().sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

		let renderLod = Core.DEFAULT_REF_LOD;
		for (const layer of layers)
		{
			const poseDef = layer.poses && layer.poses[pose];
			if (!poseDef) continue;
			const pick = Core.pickLod(requestedLod, Core.normalizeSources(poseDef));
			if (pick && pick > renderLod) renderLod = pick;
		}

		const lodScale = Core.lodScale(renderLod, Core.DEFAULT_REF_LOD);
		const outW = Math.round(refW * lodScale);
		const outH = Math.round(refH * lodScale);
		const ctx = canvas.getContext("2d");
		canvas.width = outW;
		canvas.height = outH;
		ctx.clearRect(0, 0, outW, outH);

		// Optional solid/checker fill under transparent line-art layers
		if (spec.background && Core.Backgrounds && Core.Backgrounds.fillCanvas)
			Core.Backgrounds.fillCanvas(ctx, outW, outH, spec.background);

		const fallbackDisplacement = spec.displacement || "normal";
		let drewAny = false;
		for (const layer of layers)
		{
			const poseDef = layer.poses && layer.poses[pose];
			if (!poseDef) continue;
			const displacementId = layer.displacement != null ? layer.displacement : fallbackDisplacement;
			const plan = Core.resolvePoseDrawPlan
				? Core.resolvePoseDrawPlan(poseDef, displacementId, requestedLod)
				: { mode: "base", sources: Core.normalizeSources(poseDef), transform: poseDef.transform };

			if (plan.mode === "masked" || plan.mode === "replace")
			{
				if (await Core.drawMaskedLayer(ctx, plan, requestedLod, outW, outH))
					drewAny = true;
				continue;
			}

			const transform = Core.scaleTransformForLod(poseDef.transform, lodScale);
			const tintColor = layer.tintColor;
			const hasMask = Core.poseHasColorMask && Core.poseHasColorMask(poseDef);
			const useTint = tintColor && hasMask && Core.drawTintedPoseLayer
				&& (layer.recolor || hasMask);
			if (useTint)
			{
				const tintOptions = spec.tintPreviewOverlay ? { previewOverlay: true } : null;
				if (await Core.drawTintedPoseLayer(ctx, poseDef, tintColor, requestedLod, outW, outH, transform, tintOptions))
					drewAny = true;
				continue;
			}

			const loadOpts = layer.silentMissing ? { silent: true } : null;
			const loaded = await Core.loadPoseImage(poseDef, requestedLod, loadOpts);
			if (!loaded.img) continue;
			ctx.save();
			const img = loaded.img;
			if (img.width === outW && img.height === outH && !poseDef.transform)
				ctx.drawImage(img, 0, 0);
			else if (!poseDef.transform && img.width / img.height === outW / outH)
				ctx.drawImage(img, 0, 0, outW, outH);
			else
			{
				Core.applyTransform(ctx, transform, outW, outH);
				Core.containDrawImage(ctx, img, outW, outH);
			}
			ctx.restore();
			drewAny = true;
		}

		if (!drewAny) Core.drawFallbackBody(ctx, outW, outH, pose);
		canvas._renderLod = renderLod;
		canvas._referenceSize = { width: refW, height: refH };
		return canvas;
	};

	Core.applyCanvasScale = function(canvas, scalebase, options)
	{
		if (!canvas) return;
		options = options || {};
		const maxH = options.maxHeight || 120;
		const maxW = options.maxWidth || 160;
		const scale = Math.min(1, maxH / canvas.height, maxW / canvas.width);
		const dw = Math.round(canvas.width * scale);
		const dh = Math.round(canvas.height * scale);
		canvas.style.width = dw + "px";
		canvas.style.height = dh + "px";
		canvas.style.maxWidth = "100%";
		canvas.style.maxHeight = "100%";
		if (options.center !== false)
		{
			canvas.style.position = "absolute";
			canvas.style.left = "50%";
			canvas.style.top = "0";
			canvas.style.transform = "translateX(-50%)";
			canvas.style.transformOrigin = "top center";
		}
		Core.applyCanvasScaleMode(canvas, scale, canvas._renderLod);
		return { width: dw, height: dh, scale: scale, renderLod: canvas._renderLod };
	};
})();