/* Exhibition paperdoll — clothing recolor via grayscale color masks */
(function()
{
	"use strict";
	setup.ExhibitionPaperdoll = setup.ExhibitionPaperdoll || {};
	const EP = setup.ExhibitionPaperdoll;
	const Core = EP.Core = EP.Core || {};

	Core._clotheColorTable = null;

	Core._ensureClotheColorTable = function()
	{
		if (Core._clotheColorTable) return Core._clotheColorTable;
		const table = (typeof setup !== "undefined" && setup.clothe_color_table) || {};
		Core._clotheColorTable = table;
		return table;
	};

	/** Resolve CoT clothing color name → CSS color (hex/rgb). */
	Core.resolveClothingTintColor = function(raw)
	{
		if (!raw) return null;
		const text = String(raw).trim();
		if (!text) return null;
		const key = text.toLowerCase();
		if (typeof setup !== "undefined" && setup.Paperdoll && typeof setup.Paperdoll.colorConvert === "function")
		{
			const converted = setup.Paperdoll.colorConvert(key, "clothe");
			if (converted) return converted;
		}
		if (typeof setup !== "undefined" && typeof setup.str_to_color === "function")
		{
			const lookup = setup.str_to_color(key, true);
			if (lookup && lookup.result)
			{
				const full = setup.str_to_color(key, false);
				if (full && full.color) return full.color;
			}
		}
		const clotheTable = Core._ensureClotheColorTable();
		if (clotheTable && (clotheTable[key] || clotheTable[text])) return clotheTable[key] || clotheTable[text];
		if (typeof setup !== "undefined" && setup.color_table && (setup.color_table[key] || setup.color_table[text]))
			return setup.color_table[key] || setup.color_table[text];
		if (/^#([0-9a-f]{3,8})$/i.test(text)) return text;
		if (/^rgb/i.test(text)) return text;
		return key;
	};

	Core._readWornSubColor = function(wornEntry, key)
	{
		if (!wornEntry || !key) return null;
		const subs = wornEntry.subs || {};
		if (subs[key] != null && subs[key] !== "") return subs[key];
		if (typeof wornEntry.get_sub === "function")
		{
			try
			{
				const val = wornEntry.get_sub(key);
				if (val != null && val !== "") return val;
			}
			catch (e) { /* ignore */ }
		}
		return null;
	};

	Core._wornClothingTintColor = function(wornEntry)
	{
		if (!wornEntry) return null;
		const raw = Core._readWornSubColor(wornEntry, "color")
			|| Core._readWornSubColor(wornEntry, "color1")
			|| Core._readWornSubColor(wornEntry, "colour");
		return Core.resolveClothingTintColor(raw);
	};

	Core.normalizeColorMask = function(poseDef)
	{
		if (!poseDef || !poseDef.colorMask) return null;
		if (typeof poseDef.colorMask === "string") return { 256: poseDef.colorMask };
		const out = {};
		for (const [tier, path] of Object.entries(poseDef.colorMask))
		{
			const n = Number(tier);
			if (n && path) out[n] = path;
		}
		return Object.keys(out).length ? out : null;
	};

	Core.poseHasColorMask = function(poseDef)
	{
		const map = Core.normalizeColorMask(poseDef);
		return !!(map && Object.keys(map).length);
	};

	Core._desaturateCanvas = function(srcCanvas, params)
	{
		params = params || [2, 1, 1, 1, 1];
		const out = document.createElement("canvas");
		out.width = srcCanvas.width;
		out.height = srcCanvas.height;
		const ctx = out.getContext("2d", { willReadFrequently: true });
		ctx.drawImage(srcCanvas, 0, 0);
		try
		{
			const imageData = ctx.getImageData(0, 0, out.width, out.height);
			const data = imageData.data;
			const rf = params[0];
			const gf = params[1];
			const bf = params[2];
			const sf = params[3];
			const gamma = params[4];
			const denom = rf + gf + bf;
			const f = denom === 0 ? 0 : sf / denom;
			for (let i = 0; i < data.length; i += 4)
			{
				if (data[i + 3] === 0) continue;
				let r = data[i] / 255;
				let g = data[i + 1] / 255;
				let b = data[i + 2] / 255;
				let value = 0;
				if (f > 0 && gamma > 0)
				{
					value = rf * Math.pow(r, gamma) + gf * Math.pow(g, gamma) + bf * Math.pow(b, gamma);
					if (isNaN(value)) value = 0;
					value *= f;
				}
				else if (f > 0)
				{
					value = (rf * r + gf * g + bf * b) * f;
				}
				value = Math.max(0, Math.min(1, value));
				value = Math.round(value * 255);
				data[i] = value;
				data[i + 1] = value;
				data[i + 2] = value;
			}
			ctx.putImageData(imageData, 0, 0);
		}
		catch (e)
		{
			console.warn("[ExhibitionPaperdoll] desaturate failed:", e);
		}
		return out;
	};

	Core._colorLayerComposite = function(baseCanvas, colorInput, mode, alpha)
	{
		mode = mode || "hard-light";
		alpha = alpha == null ? 1 : alpha;
		const colorCanvas = document.createElement("canvas");
		colorCanvas.width = baseCanvas.width;
		colorCanvas.height = baseCanvas.height;
		const colorCtx = colorCanvas.getContext("2d");
		colorCtx.fillStyle = colorInput;
		colorCtx.fillRect(0, 0, colorCanvas.width, colorCanvas.height);
		colorCtx.globalCompositeOperation = "destination-in";
		colorCtx.drawImage(baseCanvas, 0, 0);

		const temp = document.createElement("canvas");
		temp.width = baseCanvas.width;
		temp.height = baseCanvas.height;
		const tctx = temp.getContext("2d");
		tctx.drawImage(colorCanvas, 0, 0);
		tctx.globalCompositeOperation = mode;
		if (alpha < 1) tctx.globalAlpha = alpha;
		tctx.drawImage(baseCanvas, 0, 0);
		return temp;
	};

	/** Rasterize mask to canvas; white/high-luminance + alpha both contribute to coverage. */
	Core._maskCanvasFromImage = function(maskImg, outW, outH, transform)
	{
		const canvas = document.createElement("canvas");
		canvas.width = outW;
		canvas.height = outH;
		const ctx = canvas.getContext("2d", { willReadFrequently: true });
		ctx.save();
		if (transform) Core.applyTransform(ctx, transform, outW, outH);
		Core.containDrawImage(ctx, maskImg, outW, outH);
		ctx.restore();
		try
		{
			const imageData = ctx.getImageData(0, 0, outW, outH);
			const data = imageData.data;
			for (let i = 0; i < data.length; i += 4)
			{
				const lum = Math.max(data[i], data[i + 1], data[i + 2]);
				const alpha = data[i + 3];
				data[i] = 255;
				data[i + 1] = 255;
				data[i + 2] = 255;
				data[i + 3] = Math.round((alpha / 255) * lum);
			}
			ctx.putImageData(imageData, 0, 0);
		}
		catch (e)
		{
			console.warn("[ExhibitionPaperdoll] mask normalize failed:", e);
		}
		return canvas;
	};

	Core._drawColorMaskFill = function(maskImg, cssColor, outW, outH, transform)
	{
		const maskCanvas = Core._maskCanvasFromImage(maskImg, outW, outH, transform);
		const canvas = document.createElement("canvas");
		canvas.width = outW;
		canvas.height = outH;
		const ctx = canvas.getContext("2d");
		ctx.fillStyle = cssColor;
		ctx.fillRect(0, 0, outW, outH);
		ctx.globalCompositeOperation = "destination-in";
		ctx.drawImage(maskCanvas, 0, 0);
		return canvas;
	};

	/** Tint base garment using a grayscale color-mask and player-chosen color. */
	Core.drawTintedPoseLayer = async function(ctx, poseDef, tintColor, requestedLod, outW, outH, transform, options)
	{
		options = options || {};
		const baseLoaded = await Core.loadPoseImage(poseDef, requestedLod);
		if (!baseLoaded.img) return false;

		const off = document.createElement("canvas");
		off.width = outW;
		off.height = outH;
		const octx = off.getContext("2d");

		octx.save();
		Core.applyTransform(octx, transform, outW, outH);
		Core.containDrawImage(octx, baseLoaded.img, outW, outH);
		octx.restore();

		const cssColor = Core.resolveClothingTintColor(tintColor);
		const maskMap = Core.normalizeColorMask(poseDef);
		const maskLoaded = maskMap && Object.keys(maskMap).length
			? await Core.loadSourcesAtLod(maskMap, requestedLod)
			: null;

		if (cssColor && maskLoaded && maskLoaded.img)
		{
			if (options.previewOverlay)
			{
				const overlay = Core._drawColorMaskFill(maskLoaded.img, cssColor, outW, outH, transform);
				octx.save();
				octx.globalAlpha = options.previewOverlayAlpha == null ? 0.62 : options.previewOverlayAlpha;
				octx.globalCompositeOperation = "source-over";
				octx.drawImage(overlay, 0, 0);
				octx.restore();
			}
			else
			{
				const desaturated = Core._desaturateCanvas(off);
				const garmentTint = Core._colorLayerComposite(desaturated, cssColor, "hard-light", 1);
				const maskFill = Core._drawColorMaskFill(maskLoaded.img, cssColor, outW, outH, transform);

				const masked = document.createElement("canvas");
				masked.width = outW;
				masked.height = outH;
				const mctx = masked.getContext("2d");
				mctx.drawImage(garmentTint, 0, 0);
				mctx.globalCompositeOperation = "destination-in";
				mctx.drawImage(maskFill, 0, 0);

				octx.save();
				octx.globalCompositeOperation = "hard-light";
				octx.drawImage(masked, 0, 0);
				octx.restore();
			}
		}
		else if (maskMap && Object.keys(maskMap).length)
		{
			console.warn("[ExhibitionPaperdoll] color mask failed to load for tint preview");
		}

		ctx.drawImage(off, 0, 0);
		return true;
	};
})();