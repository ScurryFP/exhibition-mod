/* Exhibition paperdoll — mirror / preview backgrounds (solids + custom images) */
(function()
{
	"use strict";
	setup.ExhibitionPaperdoll = setup.ExhibitionPaperdoll || {};
	const EP = setup.ExhibitionPaperdoll;
	const Core = EP.Core = EP.Core || {};
	const BG = Core.Backgrounds = Core.Backgrounds || {};

	/** Built-in swatches — slate is a mid-tone for black line art. */
	BG.PRESETS = [
		{ id: "black", label: "Black", type: "color", value: "#000000" },
		{ id: "white", label: "White", type: "color", value: "#ffffff" },
		{ id: "slate", label: "Slate", type: "color", value: "#5a6578" },
		{ id: "checker", label: "Checker", type: "checker" },
	];

	BG.DEFAULT = "slate";
	BG._customs = [];
	BG._byMirror = {};
	BG._loadedManifest = false;

	BG.list = function()
	{
		return BG.PRESETS.concat(BG._customs);
	};

	BG.get = function(id)
	{
		const list = BG.list();
		for (let i = 0; i < list.length; i++)
			if (list[i].id === id) return list[i];
		return list.find((e) => e.id === BG.DEFAULT) || list[0];
	};

	BG.registerCustom = function(entry)
	{
		if (!entry || !entry.id) return false;
		const row = {
			id: entry.id,
			label: entry.label || entry.name || entry.id,
			type: "image",
			path: entry.path || entry.file || "",
			url: entry.url || "",
		};
		const idx = BG._customs.findIndex((c) => c.id === row.id);
		if (idx >= 0) BG._customs[idx] = row;
		else BG._customs.push(row);
		return true;
	};

	BG.getForMirror = function(mirrorKey)
	{
		mirrorKey = mirrorKey || "default";
		if (typeof V !== "undefined" && V.exhibMirrorBg && V.exhibMirrorBg[mirrorKey])
			return V.exhibMirrorBg[mirrorKey];
		try
		{
			const ls = localStorage.getItem("exhibMirrorBg." + mirrorKey);
			if (ls) return ls;
		}
		catch (e) { /* private mode */ }
		return BG._byMirror[mirrorKey] || BG.DEFAULT;
	};

	BG.setForMirror = function(mirrorKey, id)
	{
		mirrorKey = mirrorKey || "default";
		BG._byMirror[mirrorKey] = id;
		try
		{
			if (typeof V !== "undefined")
			{
				if (!V.exhibMirrorBg || typeof V.exhibMirrorBg !== "object")
					V.exhibMirrorBg = {};
				V.exhibMirrorBg[mirrorKey] = id;
			}
			localStorage.setItem("exhibMirrorBg." + mirrorKey, id);
		}
		catch (e) { /* ignore */ }
		BG.applyToMirrorKey(mirrorKey);
		return id;
	};

	BG.resolveImageUrl = function(entry)
	{
		if (!entry) return "";
		if (entry.url) return entry.url;
		if (!entry.path) return "";
		const p = String(entry.path).replace(/^\//, "");
		if (/^https?:\/\//i.test(p) || p.indexOf("blob:") === 0 || p.indexOf("data:") === 0)
			return p;
		if (p.indexOf("exhibition-paperdoll/") === 0) return p;
		const root = (EP._assetRoot || "exhibition-paperdoll/").replace(/\/?$/, "/");
		return root + p.replace(/^exhibition-paperdoll\//, "");
	};

	BG.cssFor = function(bgIdOrEntry)
	{
		const entry = typeof bgIdOrEntry === "string" ? BG.get(bgIdOrEntry) : bgIdOrEntry;
		if (!entry) return { backgroundColor: "#5a6578" };
		if (entry.type === "color")
			return { backgroundColor: entry.value, backgroundImage: "none" };
		if (entry.type === "checker")
		{
			return {
				backgroundColor: "#999999",
				backgroundImage: "repeating-conic-gradient(#cccccc 0% 25%, #888888 0% 50%)",
				backgroundSize: "16px 16px",
				backgroundPosition: "center",
			};
		}
		if (entry.type === "image")
		{
			const url = BG.resolveImageUrl(entry);
			return {
				backgroundColor: "#333333",
				backgroundImage: url ? 'url("' + url.replace(/"/g, "\\\"") + '")' : "none",
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
			};
		}
		return { backgroundColor: "#5a6578" };
	};

	BG.applyStyle = function(el, bgId)
	{
		if (!el) return;
		const css = BG.cssFor(bgId);
		el.style.background = "none";
		el.style.backgroundColor = css.backgroundColor || "";
		el.style.backgroundImage = css.backgroundImage || "none";
		el.style.backgroundSize = css.backgroundSize || "";
		el.style.backgroundPosition = css.backgroundPosition || "";
		el.style.backgroundRepeat = css.backgroundRepeat || "";
		el.dataset.exhibBg = typeof bgId === "string" ? bgId : (bgId && bgId.id) || "";
	};

	BG.applyToMirrorKey = function(mirrorKey)
	{
		const nodes = document.querySelectorAll('[data-exhib-mirror="' + mirrorKey + '"]');
		const id = BG.getForMirror(mirrorKey);
		nodes.forEach((el) => BG.applyStyle(el, id));
	};

	BG.applyAllVisible = function()
	{
		document.querySelectorAll("[data-exhib-mirror]").forEach((el) =>
		{
			const key = el.getAttribute("data-exhib-mirror");
			if (key) BG.applyStyle(el, BG.getForMirror(key));
		});
	};

	/**
	 * Fill a 2d context with a solid/checker bg (images rely on CSS stage).
	 * Call after clearRect, before drawing paperdoll layers.
	 */
	BG.fillCanvas = function(ctx, w, h, bgId)
	{
		if (!ctx || !w || !h) return;
		const entry = BG.get(bgId);
		if (!entry) return;
		if (entry.type === "color")
		{
			ctx.fillStyle = entry.value;
			ctx.fillRect(0, 0, w, h);
			return;
		}
		if (entry.type === "checker")
		{
			const s = 12;
			for (let y = 0; y < h; y += s)
			{
				for (let x = 0; x < w; x += s)
				{
					ctx.fillStyle = ((Math.floor(x / s) + Math.floor(y / s)) % 2 === 0) ? "#cccccc" : "#888888";
					ctx.fillRect(x, y, s, s);
				}
			}
		}
		// custom images: stage CSS handles display; leave transparent for compositing on colored stage
	};

	/**
	 * Build / refresh a small BG picker bar.
	 * parent: element that holds the bar; stageEl: optional element with data-exhib-mirror
	 */
	BG.mountControls = function(parent, mirrorKey, options)
	{
		options = options || {};
		if (!parent) return null;
		mirrorKey = mirrorKey || "default";
		let bar = parent.querySelector('.exhib-bg-bar[data-mirror="' + mirrorKey + '"]');
		if (!bar)
		{
			bar = document.createElement("div");
			bar.className = "exhib-bg-bar";
			bar.dataset.mirror = mirrorKey;
			if (options.prepend === false) parent.appendChild(bar);
			else parent.insertBefore(bar, parent.firstChild);
		}
		bar.innerHTML = "";
		const label = document.createElement("span");
		label.className = "exhib-bg-bar-label";
		label.textContent = options.label || "BG";
		bar.appendChild(label);

		const cur = BG.getForMirror(mirrorKey);
		BG.list().forEach((entry) =>
		{
			const btn = document.createElement("button");
			btn.type = "button";
			btn.className = "exhib-bg-btn" + (entry.id === cur ? " is-active" : "");
			btn.title = (entry.label || entry.id) + " background";
			btn.textContent = entry.label || entry.id;
			if (entry.type === "color")
				btn.style.boxShadow = "inset 0 -3px 0 " + entry.value;
			else if (entry.type === "image")
				btn.classList.add("exhib-bg-btn--image");
			btn.addEventListener("click", () =>
			{
				BG.setForMirror(mirrorKey, entry.id);
				if (options.stageEl)
					BG.applyStyle(options.stageEl, entry.id);
				else
					BG.applyToMirrorKey(mirrorKey);
				BG.mountControls(parent, mirrorKey, options);
				if (typeof options.onChange === "function")
					options.onChange(entry.id, entry);
			});
			bar.appendChild(btn);
		});
		return bar;
	};

	/**
	 * Size stage to the canvas display size.
	 * Required when the canvas is position:absolute (otherwise the stage collapses
	 * to min-height and the PC full mirror looks tiny).
	 */
	BG.syncStageToCanvas = function(stage, canvas)
	{
		if (!stage || !canvas) return;
		const styleW = parseInt(canvas.style.width, 10);
		const styleH = parseInt(canvas.style.height, 10);
		const w = (styleW > 0 ? styleW : null)
			|| canvas.offsetWidth
			|| canvas.clientWidth
			|| canvas.width
			|| 0;
		const h = (styleH > 0 ? styleH : null)
			|| canvas.offsetHeight
			|| canvas.clientHeight
			|| canvas.height
			|| 0;
		if (w > 0)
		{
			stage.style.width = w + "px";
			stage.style.minWidth = w + "px";
		}
		if (h > 0)
		{
			stage.style.height = h + "px";
			stage.style.minHeight = h + "px";
		}
		stage.style.display = "block";
		stage.style.position = "relative";
		stage.style.overflow = "hidden";
		stage.style.boxSizing = "border-box";
	};

	BG.ensureStage = function(canvasOrWrap, mirrorKey)
	{
		if (!canvasOrWrap) return null;
		mirrorKey = mirrorKey || "default";
		let stage = canvasOrWrap.classList && canvasOrWrap.classList.contains("exhib-mirror-stage")
			? canvasOrWrap
			: (canvasOrWrap.closest && canvasOrWrap.closest(".exhib-mirror-stage"));
		if (!stage)
		{
			// If given a canvas, wrap it
			if (canvasOrWrap.tagName === "CANVAS" && canvasOrWrap.parentNode)
			{
				stage = document.createElement("div");
				stage.className = "exhib-mirror-stage";
				canvasOrWrap.parentNode.insertBefore(stage, canvasOrWrap);
				stage.appendChild(canvasOrWrap);
			}
			else
			{
				stage = canvasOrWrap;
				stage.classList.add("exhib-mirror-stage");
			}
		}
		stage.setAttribute("data-exhib-mirror", mirrorKey);
		BG.applyStyle(stage, BG.getForMirror(mirrorKey));
		if (canvasOrWrap.tagName === "CANVAS")
			BG.syncStageToCanvas(stage, canvasOrWrap);
		return stage;
	};

	BG.loadManifest = async function()
	{
		if (BG._loadedManifest) return BG._customs.slice();
		BG._loadedManifest = true;
		const root = (EP._assetRoot || "exhibition-paperdoll/").replace(/\/?$/, "/");
		try
		{
			const res = await fetch(root + "backgrounds/manifest.json", { cache: "no-store" });
			if (!res.ok) return BG._customs.slice();
			const data = await res.json();
			const list = data.customs || data.backgrounds || [];
			for (const c of list)
			{
				if (!c || !c.id) continue;
				BG.registerCustom({
					id: c.id,
					label: c.name || c.label || c.id,
					path: c.file || c.path || ("backgrounds/" + c.id + ".png"),
				});
			}
		}
		catch (e)
		{
			/* offline / file:// */
		}
		return BG._customs.slice();
	};

	BG.slugify = function(name)
	{
		return String(name || "bg")
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "")
			.slice(0, 40) || "bg";
	};

	// Eager apply when DOM is ready (game)
	if (typeof jQuery !== "undefined")
	{
		jQuery(document).on(":passageend :dialogopened", function()
		{
			BG.loadManifest().then(function() { BG.applyAllVisible(); });
		});
	}
})();
