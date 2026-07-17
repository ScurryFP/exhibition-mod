/* Exhibition paperdoll — layer transform helpers */
(function()
{
	"use strict";
	setup.ExhibitionPaperdoll = setup.ExhibitionPaperdoll || {};
	const EP = setup.ExhibitionPaperdoll;
	const Core = EP.Core = EP.Core || {};
	Core.DEFAULT_TRANSFORM = { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, flipH: false, flipV: false, opacity: 1 };
	Core.normalizeTransform = function(raw)
	{
		const t = Object.assign({}, Core.DEFAULT_TRANSFORM, raw || {});
		t.scaleX = Number(t.scaleX) || 1;
		t.scaleY = Number(t.scaleY) || 1;
		t.rotation = Number(t.rotation) || 0;
		t.opacity = t.opacity == null ? 1 : Math.max(0, Math.min(1, Number(t.opacity)));
		t.flipH = !!t.flipH;
		t.flipV = !!t.flipV;
		return t;
	};
	Core.applyTransform = function(ctx, transform, drawWidth, drawHeight)
	{
		const t = Core.normalizeTransform(transform);
		const w = drawWidth || 0;
		const h = drawHeight || 0;
		ctx.translate(t.x + w / 2, t.y + h / 2);
		if (t.rotation) ctx.rotate(t.rotation * Math.PI / 180);
		ctx.scale(t.flipH ? -t.scaleX : t.scaleX, t.flipV ? -t.scaleY : t.scaleY);
		ctx.globalAlpha = t.opacity;
		ctx.translate(-w / 2, -h / 2);
	};
})();
