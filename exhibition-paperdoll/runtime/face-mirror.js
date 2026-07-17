/* Exhibition paperdoll — Face popup: close-up mirror + face features + makeup */
(function()
{
	"use strict";
	setup.ExhibitionPaperdoll = setup.ExhibitionPaperdoll || {};
	const EP = setup.ExhibitionPaperdoll;
	const FP = EP.FacePicker = EP.FacePicker || {};
	const FM = EP.FaceMirror = EP.FaceMirror || {};

	const MAKEUP_SLOTS = [
		"eyeshadow",
		"eyeliner",
		"mascara",
		"blush",
		"lipstick",
		"fingernails",
		"toenails",
		"right eye contact",
		"left eye contact",
	];

	/** Passages / tags where the game lets you apply makeup (bathrooms, restrooms). */
	FM.MAKEUP_EDIT_PASSAGES = { Makeup: true };
	FM.MAKEUP_EDIT_TAGS = ["bathroom", "roomtypebathroom"];

	FM.isMakeupEditLocation = function()
	{
		if (typeof State === "undefined") return false;
		const passage = State.passage || "";
		if (FM.MAKEUP_EDIT_PASSAGES[passage]) return true;

		try
		{
			if (typeof tags === "function")
			{
				const t = tags();
				for (let i = 0; i < FM.MAKEUP_EDIT_TAGS.length; i++)
				{
					if (t.includes(FM.MAKEUP_EDIT_TAGS[i])) return true;
				}
			}
		}
		catch (e) { /* ignore */ }

		// Named restrooms/bathrooms without a bathroom tag (some mall/plaza variants)
		if (/restroom|bathroom/i.test(passage)
			&& !/^Event/i.test(passage)
			&& !/assault|prank|encounter|showing/i.test(passage))
			return true;

		return false;
	};

	FM.canEditMakeup = function(options)
	{
		options = options || {};
		if (options.forceEditMakeup) return true;
		if (options.readOnlyMakeup) return false;
		// Face-edit cheat also unlocks makeup mid-game (player opt-in)
		if (FP.isCheatUnlocked && FP.isCheatUnlocked()) return true;
		// Dialog may have been opened from a bathroom; location still applies
		return FM.isMakeupEditLocation();
	};

	FM.getPersonMakeup = function(person)
	{
		if (!person) return {};
		if (!person.makeup || typeof person.makeup !== "object") person.makeup = {};
		return person.makeup;
	};

	/**
	 * Options for a makeup slot from owned cosmetics (V.makeup), matching the game Makeup passage.
	 * Always includes "none" and the currently worn value if missing from inventory.
	 */
	FM.optionsForSlot = function(slot, person)
	{
		const opts = [];
		const seen = new Set();
		const push = (label) =>
		{
			if (!label || seen.has(label)) return;
			seen.add(label);
			opts.push(label);
		};

		const inv = (typeof V !== "undefined" && V.makeup && typeof V.makeup === "object")
			? V.makeup : {};
		for (const key of Object.keys(inv))
		{
			const info = inv[key];
			if (!info || !Array.isArray(info.slots)) continue;
			if (!info.slots.includes(slot)) continue;
			if (info.applied) push(info.applied);
		}

		const worn = person && person.makeup && person.makeup[slot];
		if (worn) push(worn);

		opts.sort((a, b) => a.localeCompare(b));
		// none first
		return ["none"].concat(opts);
	};

	FM.setMakeupSlot = function(person, slot, value, options)
	{
		if (!person || !slot) return false;
		if (!FM.canEditMakeup(options)) return false;
		const makeup = FM.getPersonMakeup(person);
		if (!value || value === "none")
			delete makeup[slot];
		else
			makeup[slot] = value;

		// Keep V.pc in sync
		if (typeof V !== "undefined" && V.pc
			&& (person.is_pc || (person.equals && person.equals(V.pc))))
			V.pc.makeup = Object.assign({}, makeup);

		if (EP.invalidate) EP.invalidate(person);
		return true;
	};

	FM.clearAllMakeup = function(person, options)
	{
		if (!person) return false;
		if (!FM.canEditMakeup(options)) return false;
		person.makeup = {};
		if (typeof V !== "undefined" && V.pc
			&& (person.is_pc || (person.equals && person.equals(V.pc))))
			V.pc.makeup = {};
		if (EP.invalidate) EP.invalidate(person);
		return true;
	};

	/**
	 * Bounding box of non-transparent pixels on a canvas (for head framing).
	 */
	FM._contentBBox = function(canvas)
	{
		const w = canvas.width | 0;
		const h = canvas.height | 0;
		if (!w || !h) return null;
		const ctx = canvas.getContext("2d");
		let data;
		try { data = ctx.getImageData(0, 0, w, h).data; }
		catch (e) { return null; }
		const alphaMin = 12;
		let minX = w;
		let minY = h;
		let maxX = 0;
		let maxY = 0;
		let found = false;
		// Sample every 2px for speed on large mirrors
		const step = w * h > 600000 ? 2 : 1;
		for (let y = 0; y < h; y += step)
		{
			for (let x = 0; x < w; x += step)
			{
				if (data[(y * w + x) * 4 + 3] > alphaMin)
				{
					found = true;
					if (x < minX) minX = x;
					if (y < minY) minY = y;
					if (x > maxX) maxX = x;
					if (y > maxY) maxY = y;
				}
			}
		}
		if (!found) return null;
		// Expand sample step error
		minX = Math.max(0, minX - step);
		minY = Math.max(0, minY - step);
		maxX = Math.min(w - 1, maxX + step);
		maxY = Math.min(h - 1, maxY + step);
		return {
			minX: minX,
			minY: minY,
			maxX: maxX,
			maxY: maxY,
			width: maxX - minX + 1,
			height: maxY - minY + 1,
		};
	};

	/**
	 * Head crop rect from full-body render.
	 * Uses figure content bounds so head outline stays in frame; tight zoom cuts chest.
	 */
	FM._headCropRect = function(src, options)
	{
		options = options || {};
		const sw = src.width || 1;
		const sh = src.height || 1;
		// Tighter than old 30% canvas crop — head + a little neck only
		const headFrac = options.headFrac != null ? options.headFrac : 0.175;
		const widthFrac = options.headWidthFrac != null ? options.headWidthFrac : 0.78;
		const topPadFrac = options.topPadFrac != null ? options.topPadFrac : 0.08;
		const neckFrac = options.neckFrac != null ? options.neckFrac : 0.12;

		const bbox = FM._contentBBox(src);
		if (bbox && bbox.height > 8 && bbox.width > 8)
		{
			// Head band from top of figure (includes skull outline), not mid-torso
			const headH = Math.max(16, Math.floor(bbox.height * headFrac));
			const neckH = Math.floor(headH * neckFrac);
			const topPad = Math.floor(headH * topPadFrac);
			let cropH = headH + neckH + topPad;
			let cropW = Math.max(16, Math.floor(bbox.width * widthFrac));
			// Prefer slightly taller portrait frame if very wide crop
			if (cropW > cropH * 1.15)
				cropW = Math.floor(cropH * 1.05);

			const cx = bbox.minX + bbox.width / 2;
			let sx = Math.floor(cx - cropW / 2);
			let sy = bbox.minY - topPad;

			if (sx < 0) sx = 0;
			if (sy < 0) sy = 0;
			if (sx + cropW > sw) sx = Math.max(0, sw - cropW);
			if (sy + cropH > sh) cropH = sh - sy;
			if (sx + cropW > sw) cropW = sw - sx;
			return { sx: sx, sy: sy, cropW: cropW, cropH: Math.max(1, cropH) };
		}

		// Fallback fractions of full canvas (legacy)
		const cropH = Math.max(1, Math.floor(sh * (options.cropHeightFrac || 0.18)));
		const cropW = Math.max(1, Math.floor(sw * (options.cropWidthFrac || 0.42)));
		const sx = Math.max(0, Math.floor((sw - cropW) / 2));
		const sy = Math.max(0, Math.floor(sh * (options.cropTopFrac || 0.0)));
		return { sx: sx, sy: sy, cropW: cropW, cropH: cropH };
	};

	/**
	 * Render a head/face close-up into canvas (front pose, high quality + makeup layers).
	 * Crops tightly to the figure head so the body skull outline stays with face art.
	 */
	EP.renderFaceCloseup = async function(canvas, person, options)
	{
		if (!canvas || !person) return null;
		options = options || {};
		const src = document.createElement("canvas");
		// Full-body composite first (same stack as Appearance / full mirror)
		await EP.render(src, person, {
			pose: "front",
			quality: options.quality || "mirror",
			bypassCache: !!options.bypassCache,
			// Avoid display scaling side-effects on the offscreen buffer
			scale: { maxHeight: 99999, maxWidth: 99999, center: false },
		});
		// Clear absolute positioning left by applyCanvasScale on offscreen canvas
		src.style.position = "";
		src.style.left = "";
		src.style.top = "";
		src.style.transform = "";

		const rect = FM._headCropRect(src, options);
		const outW = options.outWidth || 380;
		const outH = options.outHeight || Math.max(280, Math.round(outW * (rect.cropH / rect.cropW)));
		canvas.width = outW;
		canvas.height = outH;
		const ctx = canvas.getContext("2d");
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = "high";
		ctx.clearRect(0, 0, outW, outH);
		// Solid/checker bg under line-art (stage CSS also applies; canvas fill for export/clarity)
		const Core = EP.Core;
		const bgId = (Core && Core.Backgrounds)
			? Core.Backgrounds.getForMirror(options.mirrorKey || "face")
			: "slate";
		if (Core && Core.Backgrounds && Core.Backgrounds.fillCanvas)
			Core.Backgrounds.fillCanvas(ctx, outW, outH, bgId);
		ctx.drawImage(
			src,
			rect.sx, rect.sy, rect.cropW, rect.cropH,
			0, 0, outW, outH
		);

		const displayW = options.displayWidth || outW;
		const displayH = Math.round(displayW * (outH / outW));
		canvas.style.width = displayW + "px";
		canvas.style.height = displayH + "px";
		canvas.style.maxWidth = "100%";
		canvas.style.imageRendering = "auto";
		canvas.style.position = "";
		canvas.style.left = "";
		canvas.style.top = "";
		canvas.style.transform = "none";
		return canvas;
	};

	FM.refreshCloseup = async function(root)
	{
		root = root || document.getElementById("exhib-face-dialog");
		if (!root || typeof V === "undefined" || !V.pc) return;
		const canvas = root.querySelector("#exhib-face-closeup-canvas");
		if (!canvas) return;
		await EP.renderFaceCloseup(canvas, V.pc, { bypassCache: true });
	};

	FM._appendMakeupSection = function(container, person, options)
	{
		const section = document.createElement("div");
		section.className = "exhib-face-makeup";
		const editable = FM.canEditMakeup(options);

		const title = document.createElement("h3");
		title.className = "exhib-face-picker-title";
		title.textContent = "Makeup";
		section.appendChild(title);

		const hint = document.createElement("p");
		hint.className = "exhib-face-picker-hint small";
		if (editable)
		{
			hint.textContent = FM.isMakeupEditLocation()
				? "Apply makeup here (bathroom / restroom). Changes use the paperdoll makeup overlays."
				: "Cheat unlocked — you can edit makeup here.";
		}
		else
		{
			hint.textContent = "View only. Apply or change makeup in a bathroom / restroom (or open Apply makeup there).";
		}
		section.appendChild(hint);

		const makeup = FM.getPersonMakeup(person);
		const grid = document.createElement("div");
		grid.className = "exhib-face-makeup-grid";

		let anyWorn = false;
		for (const slot of MAKEUP_SLOTS)
		{
			const opts = FM.optionsForSlot(slot, person);
			const worn = makeup[slot] || "";
			// Skip empty slots when view-only and nothing owned/worn (except show worn + common face slots)
			if (!editable && !worn && opts.length <= 1)
			{
				// still show main face slots as none
				if (slot === "fingernails" || slot === "toenails"
					|| slot === "right eye contact" || slot === "left eye contact")
					continue;
			}
			if (worn) anyWorn = true;

			const row = document.createElement("div");
			row.className = "exhib-face-picker-row";

			const lab = document.createElement("label");
			lab.className = "exhib-face-picker-label";
			lab.textContent = slot.charAt(0).toUpperCase() + slot.slice(1);

			if (editable)
			{
				const sel = document.createElement("select");
				sel.className = "exhib-face-picker-select";
				sel.dataset.makeupSlot = slot;
				for (const opt of opts)
				{
					const o = document.createElement("option");
					o.value = opt;
					o.textContent = opt;
					if ((worn || "none") === opt) o.selected = true;
					sel.appendChild(o);
				}
				if (worn && !opts.includes(worn))
				{
					const o = document.createElement("option");
					o.value = worn;
					o.textContent = worn;
					o.selected = true;
					sel.appendChild(o);
				}
				sel.addEventListener("change", () =>
				{
					FM.setMakeupSlot(person, slot, sel.value, options);
					if (typeof options.onChange === "function") options.onChange();
					FM.refreshCloseup(container.closest("#exhib-face-dialog") || document);
					if (FP.rerenderMirrors) FP.rerenderMirrors(person);
				});
				row.appendChild(lab);
				row.appendChild(sel);
			}
			else
			{
				const val = document.createElement("div");
				val.className = "exhib-face-picker-readonly";
				val.textContent = worn || "none";
				row.appendChild(lab);
				row.appendChild(val);
			}
			grid.appendChild(row);
		}

		if (!editable && !anyWorn && !grid.childNodes.length)
		{
			const empty = document.createElement("p");
			empty.className = "exhib-face-picker-hint small";
			empty.textContent = "No makeup applied.";
			section.appendChild(empty);
		}

		section.appendChild(grid);

		if (editable)
		{
			const clear = document.createElement("button");
			clear.type = "button";
			clear.className = "exhib-face-picker-cheat-btn";
			clear.textContent = "Remove all makeup";
			clear.addEventListener("click", () =>
			{
				FM.clearAllMakeup(person, options);
				FM.renderDialog(container.closest("#exhib-face-dialog") || container, person, options);
				if (typeof options.onChange === "function") options.onChange();
				if (FP.rerenderMirrors) FP.rerenderMirrors(person);
			});
			section.appendChild(clear);
		}

		container.appendChild(section);
	};

	/**
	 * Build full Face dialog UI into root element.
	 */
	FM.renderDialog = function(root, person, options)
	{
		options = options || {};
		person = person || (typeof V !== "undefined" ? V.pc : null);
		if (!root || !person) return;

		root.innerHTML = "";
		root.className = "exhib-face-dialog";
		root.id = root.id || "exhib-face-dialog";

		const layout = document.createElement("div");
		layout.className = "exhib-face-dialog-layout";

		const mirrorCol = document.createElement("div");
		mirrorCol.className = "exhib-face-dialog-mirror";
		const mirrorLabel = document.createElement("div");
		mirrorLabel.className = "exhib-face-dialog-mirror-label";
		mirrorLabel.textContent = "Face mirror";
		mirrorCol.appendChild(mirrorLabel);

		const Core = EP.Core;
		const BG = Core && Core.Backgrounds;
		if (BG && BG.loadManifest) BG.loadManifest();

		const stage = document.createElement("div");
		stage.className = "exhib-mirror-stage exhib-face-closeup-stage";
		stage.setAttribute("data-exhib-mirror", "face");
		const canvas = document.createElement("canvas");
		canvas.id = "exhib-face-closeup-canvas";
		canvas.className = "exhib-face-closeup-canvas";
		stage.appendChild(canvas);
		mirrorCol.appendChild(stage);

		if (BG)
		{
			BG.applyStyle(stage, BG.getForMirror("face"));
			BG.mountControls(mirrorCol, "face", {
				label: "BG",
				stageEl: stage,
				onChange: function() { FM.refreshCloseup(root); },
			});
		}

		const refreshBtn = document.createElement("button");
		refreshBtn.type = "button";
		refreshBtn.className = "exhib-face-picker-cheat-btn";
		refreshBtn.textContent = "Refresh mirror";
		refreshBtn.addEventListener("click", () =>
		{
			if (EP.invalidate) EP.invalidate(person);
			FM.refreshCloseup(root);
		});
		mirrorCol.appendChild(refreshBtn);

		const controls = document.createElement("div");
		controls.className = "exhib-face-dialog-controls";

		const faceMount = document.createElement("div");
		faceMount.id = "exhib-face-dialog-face";
		faceMount.className = "exhib-face-picker-mount";
		controls.appendChild(faceMount);

		const makeupMount = document.createElement("div");
		makeupMount.id = "exhib-face-dialog-makeup";
		controls.appendChild(makeupMount);

		layout.appendChild(mirrorCol);
		layout.appendChild(controls);
		root.appendChild(layout);

		const onChange = function()
		{
			if (typeof options.onChange === "function") options.onChange();
			FM.refreshCloseup(root);
			if (FP.rerenderMirrors) FP.rerenderMirrors(person);
		};

		// Base face + distinguishing features (chargen / cheat gate from FacePicker)
		if (FP.renderInto)
		{
			FP.renderInto(faceMount, person, {
				title: "Face",
				compact: true,
				forceEdit: options.forceEditFace,
				readOnly: options.readOnlyFace,
				onChange: onChange,
			});
		}

		FM._appendMakeupSection(makeupMount, person, Object.assign({}, options, { onChange: onChange }));

		FM.refreshCloseup(root).catch((e) => console.warn("[FaceMirror] closeup failed", e));
	};

	/** Open SugarCube dialog with Face mirror UI. */
	EP.openFaceDialog = function(options)
	{
		options = options || {};
		const run = function()
		{
			const root = document.getElementById("exhib-face-dialog")
				|| document.querySelector("#ui-dialog-body #exhib-face-dialog")
				|| document.getElementById("ui-dialog-body");
			let mount = document.getElementById("exhib-face-dialog");
			if (!mount && root)
			{
				if (root.id === "exhib-face-dialog")
					mount = root;
				else
				{
					mount = document.createElement("div");
					mount.id = "exhib-face-dialog";
					root.appendChild(mount);
				}
			}
			if (!mount) return;
			const person = (typeof V !== "undefined" && V.pc) ? V.pc : null;
			FM.renderDialog(mount, person, options);
		};

		if (typeof setup !== "undefined" && typeof setup.open_dialog === "function")
		{
			setup.open_dialog("PaperdollFace", "Face", "exhib-face-dialog-ui");
			// Content is wiki'd; wait for dialog body
			setTimeout(run, 0);
			setTimeout(run, 40);
			setTimeout(run, 120);
			return;
		}
		if (typeof Engine !== "undefined" && Engine.play)
		{
			Engine.play("PaperdollFacePassage");
			return;
		}
		run();
	};

	/** Inject face close-up + controls into the stock Makeup passage when present. */
	FM.enhanceMakeupPassage = function()
	{
		if (typeof State === "undefined" || State.passage !== "Makeup") return;
		if (typeof V === "undefined" || !V.pc) return;
		const passage = document.querySelector("#passages .passage") || document.getElementById("passages");
		if (!passage) return;
		let mount = document.getElementById("exhib-face-dialog-makeup-passage");
		if (!mount)
		{
			mount = document.createElement("div");
			mount.id = "exhib-face-dialog-makeup-passage";
			mount.className = "exhib-face-dialog exhib-face-dialog--inline";
			passage.insertBefore(mount, passage.firstChild);
		}
		FM.renderDialog(mount, V.pc, {
			// Makeup passage is an apply location
			forceEditMakeup: true,
			onChange: function()
			{
				if (EP.invalidate) EP.invalidate(V.pc);
			},
		});
	};

	// Wire open API on FacePicker for convenience
	FP.openFaceDialog = EP.openFaceDialog;
	FP.canEditMakeup = FM.canEditMakeup;

	if (typeof jQuery !== "undefined")
	{
		jQuery(document).on(":passageend", function()
		{
			FM.enhanceMakeupPassage();
		});
		jQuery(document).on(":dialogopened", function()
		{
			setTimeout(function()
			{
				const body = document.getElementById("ui-dialog-body");
				if (!body) return;
				// PaperdollFace dialog content may be an empty shell — fill it
				if (body.querySelector("#exhib-face-dialog")
					|| (body.textContent || "").indexOf("exhib-face-dialog") >= 0
					|| document.getElementById("ui-dialog-title")
						&& /face/i.test(document.getElementById("ui-dialog-title").textContent || ""))
				{
					const shell = body.querySelector("#exhib-face-dialog") || body;
					if (shell.id !== "exhib-face-dialog" && !body.querySelector("#exhib-face-dialog"))
					{
						const mount = document.createElement("div");
						mount.id = "exhib-face-dialog";
						body.innerHTML = "";
						body.appendChild(mount);
						FM.renderDialog(mount, V.pc, {});
					}
					else if (body.querySelector("#exhib-face-dialog"))
					{
						FM.renderDialog(body.querySelector("#exhib-face-dialog"), V.pc, {});
					}
				}
			}, 30);
		});
	}

	// Public Paperdoll aliases
	setup.Paperdoll = setup.Paperdoll || {};
	setup.Paperdoll.openFaceDialog = EP.openFaceDialog;
	setup.Paperdoll.renderFaceCloseup = EP.renderFaceCloseup;
})();
