/* Exhibition paperdoll — base face + distinguishing-feature overlay picker */
(function()
{
	"use strict";
	setup.ExhibitionPaperdoll = setup.ExhibitionPaperdoll || {};
	const EP = setup.ExhibitionPaperdoll;
	const FP = EP.FacePicker = EP.FacePicker || {};
	const BF = EP.BaseFaces;

	const FACE_KEY = BF && BF.FACE_KEY ? BF.FACE_KEY : "paperdoll face";
	/** Story var: player opted into mid-game face editing (cheat). */
	const CHEAT_KEY = "exhibFaceEditCheat";

	FP.SYSTEM_VERSION = BF && BF.SYSTEM_VERSION ? BF.SYSTEM_VERSION : 2;
	FP.CHEAT_KEY = CHEAT_KEY;

	/**
	 * Face base + distinguishing features are set at character creation.
	 * Mid-game free edits are locked (weird to swap faces randomly);
	 * players can unlock via cheat for roleplay / testing.
	 */
	FP.isChargenContext = function()
	{
		try
		{
			if (typeof tags === "function" && tags().includes("chargen"))
				return true;
		}
		catch (e) { /* tags() unavailable */ }
		try
		{
			if (typeof Story !== "undefined" && typeof State !== "undefined" && State.passage)
			{
				const p = Story.get(State.passage);
				if (p && p.tags && p.tags.includes("chargen")) return true;
			}
		}
		catch (e) { /* ignore */ }
		return false;
	};

	FP.isCheatUnlocked = function()
	{
		return typeof V !== "undefined" && !!V[CHEAT_KEY];
	};

	FP.setCheatUnlocked = function(on)
	{
		if (typeof V === "undefined") return false;
		V[CHEAT_KEY] = !!on;
		return V[CHEAT_KEY];
	};

	/** True when the player may change base face / distinguishing feature overlays. */
	FP.canEditFace = function(person, options)
	{
		options = options || {};
		if (options.forceEdit) return true;
		if (options.readOnly) return false;
		if (FP.isChargenContext()) return true;
		if (FP.isCheatUnlocked()) return true;
		return false;
	};

	FP.markCatalog = function()
	{
		return (typeof setup !== "undefined" && setup.distinguishing_marks) ? setup.distinguishing_marks : {};
	};

	FP.markInfo = function(markId)
	{
		if (!markId) return null;
		return FP.markCatalog()[markId] || null;
	};

	FP.getDistinguishingMarks = function(person)
	{
		return (person && person.distinguishing_marks) ? person.distinguishing_marks.slice() : [];
	};

	FP.hasArtForBaseFace = function(faceId)
	{
		if (!faceId) return false;
		if (EP.bindingHasOverlayArt)
			return EP.bindingHasOverlayArt(EP._baseFaceOverlays, faceId);
		return false;
	};

	FP.hasArtForMark = function(markId)
	{
		if (!markId) return false;
		if (EP.bindingHasOverlayArt)
			return EP.bindingHasOverlayArt(EP._faceOverlays, markId);
		return false;
	};

	FP._personWrapper = function(person)
	{
		if (!person) return null;
		if (typeof Person !== "undefined" && person instanceof Person) return person;
		if (typeof Person === "undefined") return person;
		try
		{
			const key = person.person || person.name;
			if (key) return new Person({ person: key });
			if (person.is_pc && typeof V !== "undefined" && V.pc) return V.pc;
		}
		catch (e) { /* fall through */ }
		return person;
	};

	FP.optionsToAddMark = function(person, options)
	{
		options = options || {};
		const current = FP.getDistinguishingMarks(person);
		let possible = [];

		const wrapped = FP._personWrapper(person);
		if (wrapped && typeof wrapped.possible_distinguishing_marks === "function")
			possible = wrapped.possible_distinguishing_marks(true, true).slice();
		else
			possible = Object.keys(FP.markCatalog());

		const out = [];
		for (const markId of possible)
		{
			if (current.includes(markId)) continue;
			const info = FP.markInfo(markId);
			if (!info) continue;
			out.push({
				id: markId,
				name: markId,
				slot: info.slot || "face",
				hasArt: FP.hasArtForMark(markId),
			});
		}
		out.sort((a, b) => a.name.localeCompare(b.name));
		return out;
	};

	FP.persistPerson = function(person)
	{
		if (!person) return;
		const face = person[FACE_KEY] || "";
		const marks = (person.distinguishing_marks || []).slice();

		if (typeof V !== "undefined" && V.pc)
		{
			if (person.is_pc || (person.equals && person.equals(V.pc)))
			{
				V.pc[FACE_KEY] = face;
				V.pc.distinguishing_marks = marks;
			}
		}

		const name = person.person || person.name;
		if (name && setup.people && typeof setup.people.get_person === "function")
		{
			const pdata = setup.people.get_person(name);
			if (pdata)
			{
				pdata[FACE_KEY] = face;
				pdata.distinguishing_marks = marks;
			}
		}
	};

	FP.setBaseFace = function(person, faceId, options)
	{
		if (!person) return false;
		if (!FP.canEditFace(person, options)) return false;
		person[FACE_KEY] = faceId || "";
		FP.persistPerson(person);
		if (EP.invalidate) EP.invalidate(person);
		return true;
	};

	FP.addDistinguishingMark = function(person, markId, options)
	{
		if (!person || !markId) return false;
		if (!FP.canEditFace(person, options)) return false;
		if (!person.distinguishing_marks) person.distinguishing_marks = [];
		if (person.distinguishing_marks.includes(markId)) return false;

		const wrapped = FP._personWrapper(person);
		if (wrapped && typeof wrapped.possible_distinguishing_marks === "function")
		{
			const possible = wrapped.possible_distinguishing_marks(true, true);
			if (!possible.includes(markId)) return false;
		}

		person.distinguishing_marks.push(markId);
		FP.persistPerson(person);
		if (EP.invalidate) EP.invalidate(person);
		return true;
	};

	FP.removeDistinguishingMark = function(person, markId, options)
	{
		if (!person || !markId || !person.distinguishing_marks) return false;
		if (!FP.canEditFace(person, options)) return false;
		const idx = person.distinguishing_marks.indexOf(markId);
		if (idx < 0) return false;
		person.distinguishing_marks.splice(idx, 1);
		FP.persistPerson(person);
		if (EP.invalidate) EP.invalidate(person);
		return true;
	};

	FP.summaryForPerson = function(person)
	{
		if (!person) return "";
		const parts = [];
		const face = person[FACE_KEY];
		if (face)
		{
			const info = BF && BF.faceInfo ? BF.faceInfo(face) : null;
			parts.push("Base: " + ((info && info.name) || face));
		}
		const marks = FP.getDistinguishingMarks(person);
		if (marks.length) parts.push("Features: " + marks.join(", "));
		return parts.length ? parts.join(" · ") : "No base face or distinguishing features";
	};

	FP.rerenderMirrors = async function(person)
	{
		person = person || (typeof V !== "undefined" ? V.pc : null);
		if (!person) return;
		if (EP.rerenderAll) await EP.rerenderAll();
		const large = document.getElementById("paperdollPC-canvas-large");
		if (large && EP.renderMirror)
		{
			const pose = EP.getPoseForView ? EP.getPoseForView(EP.getView()) : "front";
			await EP.renderMirror(large, person, { pose: pose });
		}
		const npcCanvas = document.getElementById("npc-appearance-canvas");
		if (npcCanvas && setup.NpcAppearance && setup.NpcAppearance.renderMirror
			&& typeof V !== "undefined" && V.npcappearancesubject)
		{
			await setup.NpcAppearance.renderMirror(npcCanvas, V.npcappearancesubject);
		}
	};

	FP._appendSelectRow = function(grid, spec)
	{
		const row = document.createElement("div");
		row.className = "exhib-face-picker-row";

		const label = document.createElement("label");
		label.className = "exhib-face-picker-label";
		label.setAttribute("for", spec.id);
		label.textContent = spec.label;

		const sel = document.createElement("select");
		sel.id = spec.id;
		sel.className = "exhib-face-picker-select";

		for (const opt of spec.options)
		{
			const o = document.createElement("option");
			o.value = opt.id;
			let text = opt.name;
			if (opt.id && typeof opt.hasArt === "boolean")
				text += opt.hasArt ? " ✓" : " (no art)";
			o.textContent = text;
			if (opt.id === spec.value) o.selected = true;
			sel.appendChild(o);
		}

		sel.addEventListener("change", () =>
		{
			spec.onChange(sel.value);
			if (typeof spec.onAfterChange === "function")
				spec.onAfterChange(sel.value);
			if (spec.rerender !== false)
				FP.rerenderMirrors(spec.person);
		});

		row.appendChild(label);
		row.appendChild(sel);
		grid.appendChild(row);
	};

	FP._appendMarksSection = function(grid, container, person, options, editable)
	{
		const section = document.createElement("div");
		section.className = "exhib-face-picker-marks";

		const label = document.createElement("div");
		label.className = "exhib-face-picker-label";
		label.textContent = "Distinguishing features";
		section.appendChild(label);

		const list = document.createElement("ul");
		list.className = "exhib-face-features-list exhib-face-picker-mark-list";
		const marks = FP.getDistinguishingMarks(person);

		if (!marks.length)
		{
			const li = document.createElement("li");
			li.className = "muted";
			li.textContent = editable
				? "None — same list as character description"
				: "None";
			list.appendChild(li);
		}
		else
		{
			for (const markId of marks)
			{
				const li = document.createElement("li");
				li.className = "exhib-face-picker-mark-item";
				const text = document.createElement("span");
				text.textContent = markId + (FP.hasArtForMark(markId) ? " ✓" : " (no art)");
				li.appendChild(text);

				if (editable)
				{
					const btn = document.createElement("button");
					btn.type = "button";
					btn.className = "exhib-face-mark-remove";
					btn.title = "Remove " + markId;
					btn.textContent = "×";
					btn.addEventListener("click", () =>
					{
						FP.removeDistinguishingMark(person, markId, options);
						FP.renderInto(container, person, options);
						FP.rerenderMirrors(person);
					});
					li.appendChild(btn);
				}
				list.appendChild(li);
			}
		}
		section.appendChild(list);

		if (editable)
		{
			const addOpts = FP.optionsToAddMark(person, options);
			if (addOpts.length)
			{
				const sel = document.createElement("select");
				sel.className = "exhib-face-picker-select exhib-face-picker-add-mark";
				const blank = document.createElement("option");
				blank.value = "";
				blank.textContent = "Add feature…";
				sel.appendChild(blank);
				for (const opt of addOpts)
				{
					const o = document.createElement("option");
					o.value = opt.id;
					o.textContent = opt.name + (opt.hasArt ? " ✓" : " (no art)");
					sel.appendChild(o);
				}
				sel.addEventListener("change", () =>
				{
					if (!sel.value) return;
					FP.addDistinguishingMark(person, sel.value, options);
					FP.renderInto(container, person, options);
					FP.rerenderMirrors(person);
				});
				section.appendChild(sel);
			}
		}

		grid.appendChild(section);
	};

	FP._appendLockControls = function(container, person, options, editable)
	{
		const bar = document.createElement("div");
		bar.className = "exhib-face-picker-lock-bar";

		if (editable && FP.isChargenContext())
		{
			const note = document.createElement("p");
			note.className = "exhib-face-picker-hint small";
			note.textContent = "Set during character creation. After the game starts this is locked (unless you unlock the cheat).";
			bar.appendChild(note);
		}
		else if (editable && FP.isCheatUnlocked())
		{
			const note = document.createElement("p");
			note.className = "exhib-face-picker-hint small";
			note.textContent = "Cheat unlocked — you can change face art mid-game.";
			bar.appendChild(note);
			const lock = document.createElement("button");
			lock.type = "button";
			lock.className = "exhib-face-picker-cheat-btn";
			lock.textContent = "Lock face editor";
			lock.addEventListener("click", () =>
			{
				FP.setCheatUnlocked(false);
				FP.renderInto(container, person, options);
			});
			bar.appendChild(lock);
		}
		else if (!editable)
		{
			const note = document.createElement("p");
			note.className = "exhib-face-picker-hint small";
			note.textContent = "Face is set at character creation and stays fixed (changing it mid-game feels wrong). Overlay art still follows your current features.";
			bar.appendChild(note);
			const unlock = document.createElement("button");
			unlock.type = "button";
			unlock.className = "exhib-face-picker-cheat-btn";
			unlock.textContent = "Unlock face editor (cheat)";
			unlock.title = "Allows mid-game base face and feature overlay edits";
			unlock.addEventListener("click", () =>
			{
				FP.setCheatUnlocked(true);
				FP.renderInto(container, person, options);
			});
			bar.appendChild(unlock);
		}

		if (bar.childNodes.length) container.appendChild(bar);
	};

	FP.renderInto = function(container, person, options)
	{
		options = options || {};
		if (!container || !person) return;
		const editable = FP.canEditFace(person, options);
		container.innerHTML = "";
		container.className = "exhib-face-picker"
			+ (options.compact ? " exhib-face-picker--compact" : "")
			+ (editable ? "" : " exhib-face-picker--locked");

		if (options.title)
		{
			const heading = document.createElement("h3");
			heading.className = "exhib-face-picker-title";
			heading.textContent = options.title;
			container.appendChild(heading);
		}

		const defaultHint = editable
			? (FP.isChargenContext()
				? "Choose your base face and distinguishing features for the paperdoll. These stick after chargen."
				: "Base face plus every distinguishing feature — each can have overlay art.")
			: "Your paperdoll face (read-only).";
		const hintText = options.hint != null ? options.hint : defaultHint;
		if (hintText)
		{
			const hint = document.createElement("p");
			hint.className = "exhib-face-picker-hint small";
			hint.textContent = hintText;
			container.appendChild(hint);
		}

		const grid = document.createElement("div");
		grid.className = "exhib-face-picker-grid";
		container.appendChild(grid);

		if (BF)
		{
			if (editable)
			{
				FP._appendSelectRow(grid, {
					id: "exhib-base-face-select",
					label: "Base face",
					person: person,
					value: person[FACE_KEY] || "",
					options: BF.optionsForPerson(person, options),
					onChange: (val) => FP.setBaseFace(person, val, options),
					onAfterChange: options.onChange,
					rerender: options.rerender,
				});
			}
			else
			{
				const row = document.createElement("div");
				row.className = "exhib-face-picker-row";
				const lab = document.createElement("div");
				lab.className = "exhib-face-picker-label";
				lab.textContent = "Base face";
				const val = document.createElement("div");
				val.className = "exhib-face-picker-readonly";
				const faceId = person[FACE_KEY] || "";
				const info = faceId && BF.faceInfo ? BF.faceInfo(faceId) : null;
				if (faceId)
				{
					val.textContent = ((info && info.name) || faceId)
						+ (FP.hasArtForBaseFace(faceId) ? " ✓" : " (no art)");
				}
				else
					val.textContent = "— None —";
				row.appendChild(lab);
				row.appendChild(val);
				grid.appendChild(row);
			}
		}

		FP._appendMarksSection(grid, container, person, options, editable);
		FP._appendLockControls(container, person, options, editable);
	};

	/**
	 * Appearance sidebar no longer hosts the face editor — use Face popup.
	 * Kept as a no-op so older call sites do not break.
	 */
	FP.ensureSidebarMount = function()
	{
		// Remove legacy mount if present
		const old = document.getElementById("exhib-face-picker-sidebar");
		if (old && old.parentNode) old.parentNode.removeChild(old);
	};

	/**
	 * During chargen customize: offer a Face button that opens the Face popup
	 * (editable base face + features). Avoids dumping full editor into the story.
	 */
	FP.ensureChargenMount = function()
	{
		if (!FP.isChargenContext()) return;
		if (typeof V === "undefined" || !V.pc) return;
		if (!document.getElementById("skincolorchoice")
			&& !document.querySelector(".chargen-pcname-container"))
			return;

		const passages = document.getElementById("passages") || document.getElementById("story");
		if (!passages) return;
		let mount = document.getElementById("exhib-face-picker-chargen");
		if (!mount)
		{
			mount = document.createElement("div");
			mount.id = "exhib-face-picker-chargen";
			mount.className = "exhib-face-picker-mount exhib-face-picker-chargen-mount";
			const last = passages.querySelector("#passages > .passage, .passage");
			const parent = last || passages;
			parent.appendChild(mount);
		}
		mount.innerHTML = "";
		const note = document.createElement("p");
		note.className = "exhib-face-picker-hint small";
		note.textContent = "Paperdoll face & features are set in the Face mirror (also used for makeup after the game starts).";
		mount.appendChild(note);
		const btn = document.createElement("button");
		btn.type = "button";
		btn.className = "exhib-face-picker-cheat-btn";
		btn.textContent = "Open Face mirror…";
		btn.addEventListener("click", () =>
		{
			if (EP.openFaceDialog)
				EP.openFaceDialog({ forceEditFace: true });
		});
		mount.appendChild(btn);
	};

	FP.renderNpcSummary = function(container, person)
	{
		if (!container || !person) return;
		container.innerHTML = "";
		const title = document.createElement("strong");
		title.textContent = "Face";
		container.appendChild(title);
		const list = document.createElement("ul");
		list.className = "exhib-face-features-list";

		const face = person[FACE_KEY];
		if (face)
		{
			const li = document.createElement("li");
			const info = BF && BF.faceInfo ? BF.faceInfo(face) : null;
			const art = FP.hasArtForBaseFace(face) ? "" : " (no paperdoll art yet)";
			li.textContent = "Base face: " + ((info && info.name) || face) + art;
			list.appendChild(li);
		}

		const marks = FP.getDistinguishingMarks(person);
		if (marks.length)
		{
			for (const markId of marks)
			{
				const li = document.createElement("li");
				const art = FP.hasArtForMark(markId) ? "" : " (no overlay art yet)";
				li.textContent = markId + art;
				list.appendChild(li);
			}
		}
		else if (!face)
		{
			const li = document.createElement("li");
			li.className = "muted";
			li.textContent = "No base face or distinguishing features";
			list.appendChild(li);
		}

		container.appendChild(list);
	};

	/**
	 * Assign a base face only if missing — never randomly replace an existing face.
	 * Distinguishing marks come from the game / chargen; we do not invent them.
	 */
	FP._ensurePersonFaces = function(person, seedName)
	{
		if (!person || typeof person !== "object") return;
		if (BF && BF.ensurePersonFace)
			BF.ensurePersonFace(person, seedName || person.person || person.name || "face");
		else if (BF && !person[FACE_KEY])
			person[FACE_KEY] = BF.pickRandom(person, seedName);
		FP.persistPerson(person);
	};

	/** @deprecated use _ensurePersonFaces — kept name so older hooks do not re-randomize */
	FP._rerollPersonFaces = function(person, seedName)
	{
		FP._ensurePersonFaces(person, seedName);
	};

	FP.migrateIfNeeded = function()
	{
		if (typeof V === "undefined") return false;
		const versionKey = "exhibPaperdollFaceVersion";
		if (V[versionKey] === FP.SYSTEM_VERSION) return false;

		// Only fill blanks — never swap an already-chosen face / features
		if (V.pc)
			FP._ensurePersonFaces(V.pc, V.pc.person || V.pc.name || "PC");

		if (V.people && typeof V.people === "object")
		{
			for (const name of Object.keys(V.people))
			{
				const pdata = V.people[name];
				if (!pdata || typeof pdata !== "object") continue;
				FP._ensurePersonFaces(pdata, name);
			}
		}

		V[versionKey] = FP.SYSTEM_VERSION;
		if (EP.invalidate) EP.invalidate();
		return true;
	};

	const _renderSidebar = EP.renderSidebar;
	if (_renderSidebar)
	{
		EP.renderSidebar = async function()
		{
			await _renderSidebar.apply(EP, arguments);
			// Strip any legacy face editor from the Appearance panel
			FP.ensureSidebarMount();
		};
	}

	if (typeof jQuery !== "undefined")
	{
		jQuery(document).one(":storyready", function()
		{
			FP.migrateIfNeeded();
		});
		jQuery(document).on(":passageend", function()
		{
			FP.ensureChargenMount();
			FP.ensureSidebarMount();
		});
	}
})();