// DisplayNPC Appearance tab: exposure chips, tan sync, placeholder mirror canvas.
(function()
{
	setup.NpcTanning = setup.NpcTanning || {};

	const NT = setup.NpcTanning;
	const TN = setup.Tanning;
	const SW = setup.SwimwearExhibition;

	NT.SET_LABELS = {
		clothed: "Street-clothes tan lines",
		swimwear: "Swimwear tan lines",
		swimsuit_standard: "One-piece suit lines",
		bikini_standard: "Standard bikini lines",
		bikini_mini: "Mini bikini lines",
		bikini_micro: "Micro bikini lines",
		bikini_sling: "Slingshot bikini lines",
		bikini_crochet: "Crochet / sheer bikini lines",
		sheer_suit: "Sheer swimsuit lines",
		topless_bottom: "Topless-bottom lines",
		nude: "Full-body tan",
	};

	NT.depth_label = function(depth)
	{
		if (depth < 0.08) return "none";
		if (depth < 0.20) return "faint";
		if (depth < 0.35) return "light";
		if (depth < 0.55) return "noticeable";
		if (depth < 0.75) return "deep";
		return "very deep";
	};

	NT.hydrate_person = function(person)
	{
		if (!person || !TN) return;
		const name = person.person;
		if (!name || person.temporary) return;
		const pdata = setup.people.get_person(name);
		TN.ensure_state(person);
		if (pdata && pdata.tan && Array.isArray(pdata.tan.layers))
		{
			person.tan = {
				active_set: pdata.tan.active_set || null,
				last_day_processed: pdata.tan.last_day_processed || 0,
				layers: pdata.tan.layers.map(l => Object.assign({}, l)),
			};
		}
	};

	NT.persist_person = function(person)
	{
		if (!person || !person.tan) return;
		const name = person.person;
		if (!name || person.temporary) return;
		const pdata = setup.people.get_person(name);
		pdata.tan = {
			active_set: person.tan.active_set,
			last_day_processed: person.tan.last_day_processed,
			layers: person.tan.layers.map(l => ({
				set_id: l.set_id,
				depth: l.depth,
				uv_minutes: l.uv_minutes,
				last_tan_day: l.last_tan_day,
				sessions_last_7d: Array.isArray(l.sessions_last_7d) ? l.sessions_last_7d.slice() : [],
				ghost_edge: l.ghost_edge || 0,
			})),
		};
	};

	NT.daily_tick_person = function(person)
	{
		if (!TN || !person) return;
		const state = TN.ensure_state(person);
		const today = V.gameday || 0;
		if (state.last_day_processed === today) return;
		for (const layer of state.layers)
		{
			TN.prune_sessions(layer, today);
			const fade = TN.compute_fade(layer, today);
			if (fade > 0 && layer.depth > 0)
			{
				const dampener = Math.max(0.35, layer.depth);
				layer.depth = Math.max(0, layer.depth - fade * dampener);
			}
			if (layer.ghost_edge > 0)
				layer.ghost_edge = Math.max(0, layer.ghost_edge - TN.GHOST_DECAY);
		}
		state.last_day_processed = today;
	};

	NT.is_tanning_now = function(name)
	{
		if (!name) return false;
		if (setup.LakeBeach && setup.LakeBeach.get_activity(name) === "tanning")
		{
			if (V.location === "UniversityLakeBeach" && V.peopleatlocation && V.peopleatlocation.includes(name))
				return true;
		}
		if (V.location === "UniMall" && V.peopleatlocation && V.peopleatlocation.includes(name))
		{
			if (SW && SW.is_tanning_weather()) return true;
		}
		return false;
	};

	NT.mark_session_today = function(name)
	{
		const pdata = setup.people.get_person(name);
		if (!pdata.tan_sessions_day) pdata.tan_sessions_day = {};
		pdata.tan_sessions_day[V.gameday] = true;
	};

	NT.had_session_today = function(name)
	{
		const pdata = setup.people.get_person(name);
		return !!(pdata.tan_sessions_day && pdata.tan_sessions_day[V.gameday]);
	};

	NT.apply_ambient_session = function(person)
	{
		if (!TN || !person || !person.person || person.temporary) return;
		const name = person.person;
		if (!NT.is_tanning_now(name)) return;
		if (NT.had_session_today(name)) return;
		if (!SW || !SW.is_tanning_weather()) return;
		const weather = TN.weather_mult();
		const tod = TN.time_of_day_mult();
		if (weather <= 0 || tod <= 0) return;
		TN.apply_session(person, {
			session_minutes: 30,
			weather_mult: weather,
			time_mult: tod,
		});
		NT.mark_session_today(name);
	};

	NT.sync_for_display = function(person)
	{
		if (!person || !TN) return;
		NT.hydrate_person(person);
		NT.daily_tick_person(person);
		NT.apply_ambient_session(person);
		NT.persist_person(person);
	};

	NT.format_summary = function(person)
	{
		if (!TN || !person) return '<span class="small">Tan data unavailable.</span>';
		const layers = TN.get_render_layers(person);
		const max = TN.get_max_depth(person);
		if (!layers.length && max < 0.08)
			return '<span class="small">No tan or tan lines yet.</span>';

		const parts = [];
		const overall = NT.depth_label(max);
		if (overall !== "none")
			parts.push(`<strong>Overall tan:</strong> ${overall} (${Math.round(max * 100)}%)`);

		if (layers.length)
		{
			parts.push('<strong>Tan line sets:</strong>');
			parts.push('<ul class="npc-appearance-tan-lines">');
			for (const entry of layers)
			{
				const label = NT.SET_LABELS[entry.set_id] || entry.set_id.replace(/_/g, " ");
				const pct = Math.round((entry.opacity || 0) * 100);
				const ghost = entry.ghost_edge > 0.05
					? ` <span class="small">(fading edge ${Math.round(entry.ghost_edge * 100)}%)</span>`
					: "";
				parts.push(`<li>${label}: ${NT.depth_label(entry.opacity)} (${pct}%)${ghost}</li>`);
			}
			parts.push("</ul>");
		}
		return parts.join(" ");
	};

	NT.apply_beach_tick_for_name = function(name)
	{
		if (!name || name === "PC") return;
		try
		{
			const person = new Person({ person: name });
			NT.sync_for_display(person);
		}
		catch (e)
		{
			console.warn("[NpcTanning] beach tick failed for", name, e);
		}
	};

	setup.NpcAppearance = {
		prepare(person)
		{
			if (!person) return;
			if (setup.NpcExhibition && person.person && !person.temporary)
				setup.NpcExhibition.ensure_clothing_exhib_level(person.person);
			if (setup.NpcTanning)
				setup.NpcTanning.sync_for_display(person);
		},

		swimwear_summary(person)
		{
			if (!SW || !person || !person.wearing_some_swimwear || !person.wearing_some_swimwear())
				return "";
			const tier = SW.outfit_swimwear_tier(person);
			const req = SW.tier_to_base_requirement(tier);
			const exhib = setup.NpcExhibition
				? setup.NpcExhibition.exhibition_level(person)
				: person.skill_level("Exhibitionism");
			return `Swimwear tier ${tier} (Exhibitionism ${exhib}; tier needs ~${req})`;
		},

		exhibition_summary(person)
		{
			if (!person || person.temporary) return "";
			const exhib = setup.NpcExhibition
				? setup.NpcExhibition.exhibition_level(person)
				: person.skill_level("Exhibitionism");
			return `Clothing exhibition level: ${exhib}`;
		},

		renderSilhouetteFallback(canvas, person)
		{
			if (!canvas || !person) return;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			const w = canvas.width;
			const h = canvas.height;
			ctx.clearRect(0, 0, w, h);

			const skin = setup.skin_color_table && setup.skin_color_table[person["skin color"]];
			const base = skin || "#C68642";
			ctx.fillStyle = "#1a1a22";
			ctx.fillRect(0, 0, w, h);

			const cx = w * 0.5;
			const headR = w * 0.11;
			const bodyTop = h * 0.22;
			const bodyH = h * 0.52;

			ctx.fillStyle = base;
			ctx.beginPath();
			ctx.arc(cx, bodyTop, headR, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillRect(cx - headR * 1.15, bodyTop + headR * 0.85, headR * 2.3, bodyH);

			const maxTan = TN ? TN.get_max_depth(person) : 0;
			if (maxTan > 0.05 && typeof tinycolor !== "undefined")
			{
				const tint = TN.get_tan_tint(person);
				ctx.globalAlpha = Math.min(0.75, maxTan);
				ctx.fillStyle = tint;
				ctx.beginPath();
				ctx.arc(cx, bodyTop, headR, 0, Math.PI * 2);
				ctx.fill();
				ctx.fillRect(cx - headR * 1.15, bodyTop + headR * 0.85, headR * 2.3, bodyH);
				ctx.globalAlpha = 1;
			}

			if (TN)
			{
				const layers = TN.get_render_layers(person);
				let band = bodyTop + headR * 1.2;
				for (const entry of layers)
				{
					if (band > bodyTop + bodyH - 8) break;
					ctx.globalAlpha = Math.min(0.55, entry.opacity || 0.2);
					ctx.fillStyle = "#f5e6c8";
					const bandH = 6 + (entry.opacity || 0) * 10;
					ctx.fillRect(cx - headR * 1.05, band, headR * 2.1, bandH);
					band += bandH + 4;
				}
				ctx.globalAlpha = 1;
			}

			ctx.fillStyle = "rgba(255,255,255,0.55)";
			ctx.font = "10px sans-serif";
			ctx.textAlign = "center";
			ctx.fillText("Silhouette fallback", cx, h - 14);
			ctx.textAlign = "left";
		},

		/**
		 * Ensure NPC has a paperdoll face id for testing.
		 * Prefer PC's chosen face (same art), else base-face-1.
		 */
		_ensureTestFace(person)
		{
			if (!person) return;
			const key = (setup.ExhibitionPaperdoll && setup.ExhibitionPaperdoll.BaseFaces
				&& setup.ExhibitionPaperdoll.BaseFaces.FACE_KEY) || "paperdoll face";
			if (person[key]) return person[key];
			let faceId = "base-face-1";
			try
			{
				if (typeof V !== "undefined" && V.pc && V.pc[key])
					faceId = V.pc[key];
			}
			catch (e) { /* ignore */ }
			person[key] = faceId;
			return faceId;
		},

		/**
		 * Full-body frame (≈1:2 paperdoll). Contain-fit so head-to-toe + clothes stay visible.
		 */
		_layoutNpcMirror(canvas, stage)
		{
			if (!canvas) return;
			const maxW = 200;
			const maxH = 400; // full figure, not a face crop
			const bw = Math.max(1, canvas.width || 256);
			const bh = Math.max(1, canvas.height || 512);
			const scale = Math.min(maxW / bw, maxH / bh, 1);
			const dispW = Math.max(120, Math.round(bw * scale));
			const dispH = Math.max(240, Math.round(bh * scale));

			canvas.style.position = "relative";
			canvas.style.left = "auto";
			canvas.style.top = "auto";
			canvas.style.transform = "none";
			canvas.style.display = "block";
			canvas.style.margin = "0 auto";
			canvas.style.background = "transparent";
			canvas.style.width = dispW + "px";
			canvas.style.height = dispH + "px";
			canvas.style.maxWidth = maxW + "px";
			canvas.style.maxHeight = maxH + "px";
			canvas.style.visibility = "visible";
			canvas.style.opacity = "1";

			if (stage)
			{
				stage.style.width = dispW + "px";
				stage.style.minWidth = dispW + "px";
				stage.style.height = dispH + "px";
				stage.style.minHeight = dispH + "px";
				stage.style.maxWidth = maxW + "px";
				stage.style.maxHeight = maxH + "px";
				stage.style.display = "block";
				stage.style.position = "relative";
				stage.style.overflow = "visible";
				stage.style.boxSizing = "border-box";
				stage.style.visibility = "visible";
			}
		},

		_mountNpcBg(canvas, personName)
		{
			const EP = setup.ExhibitionPaperdoll;
			const BG = EP && EP.Core && EP.Core.Backgrounds;
			const stage = document.getElementById("npc-appearance-stage")
				|| (canvas && canvas.closest && canvas.closest(".exhib-mirror-stage"))
				|| (canvas && canvas.parentNode);
			const host = document.getElementById("npc-appearance-bg-host")
				|| (canvas && canvas.closest && canvas.closest(".npc-appearance-mirror-col"));

			if (!BG || !stage) return stage || null;

			if (BG.loadManifest) BG.loadManifest();
			stage.classList.add("exhib-mirror-stage");
			stage.setAttribute("data-exhib-mirror", "npc");
			BG.applyStyle(stage, BG.getForMirror("npc"));

			if (host)
			{
				BG.mountControls(host, "npc", {
					label: "BG",
					stageEl: stage,
					prepend: false,
					onChange: function()
					{
						if (canvas && personName)
							setup.NpcAppearance.renderMirror(canvas, personName);
					},
				});
			}
			return stage;
		},

		/**
		 * Call from the Appearance tab widget. Avoids complex JS inside <<script>>
		 * (SugarCube is picky and tabs often miss :passageend).
		 */
		scheduleMirrorPaint: function()
		{
			function paint()
			{
				try
				{
					const name = (typeof V !== "undefined" && V.npcappearancesubject)
						|| (typeof State !== "undefined" && State.variables && State.variables.npcappearancesubject)
						|| "";
					const canvas = document.getElementById("npc-appearance-canvas");
					if (!canvas || !name) return false;
					if (!setup.NpcAppearance || !setup.NpcAppearance.renderMirror) return false;
					setup.NpcAppearance.renderMirror(canvas, name);
					return true;
				}
				catch (e)
				{
					console.warn("[NpcAppearance] scheduleMirrorPaint failed", e);
					return false;
				}
			}

			setTimeout(paint, 0);
			setTimeout(paint, 40);
			setTimeout(paint, 200);
			setTimeout(paint, 500);

			if (typeof jQuery !== "undefined")
			{
				jQuery(document).one(":passageend.npcAppearMirror", paint);
				jQuery(document).off("click.npcAppearMirror").on("click.npcAppearMirror", function(ev)
				{
					const t = ev && ev.target;
					if (!t) return;
					const label = String(t.textContent || "").replace(/\s+/g, " ").trim();
					if (label === "Appearance" || /Appearance/i.test(label))
						setTimeout(paint, 0);
				});
			}
		},

		async renderMirror(canvas, personName)
		{
			if (!canvas || !personName)
			{
				console.warn("[NpcAppearance] renderMirror missing canvas or name", !!canvas, personName);
				return;
			}

			// Always mount BG bar first so the tab never looks empty of controls
			const stage = setup.NpcAppearance._mountNpcBg(canvas, personName);
			setup.NpcAppearance._layoutNpcMirror(canvas, stage);

			let person;
			try
			{
				person = new Person({ person: personName });
				setup.NpcAppearance.prepare(person);
			}
			catch (e)
			{
				console.warn("[NpcAppearance] Person load failed", personName, e);
				const ctx = canvas.getContext("2d");
				if (ctx)
				{
					if (!canvas.width) canvas.width = 256;
					if (!canvas.height) canvas.height = 512;
					ctx.fillStyle = "#444";
					ctx.fillRect(0, 0, canvas.width, canvas.height);
					ctx.fillStyle = "#eee";
					ctx.font = "14px sans-serif";
					ctx.fillText("Could not load " + personName, 12, 28);
				}
				setup.NpcAppearance._layoutNpcMirror(canvas, stage);
				return;
			}

			// Face test: PC face / base-face-1 until per-NPC face picks exist
			setup.NpcAppearance._ensureTestFace(person);

			const EP = setup.ExhibitionPaperdoll;
			const renderFn = EP && EP.render
				? (c, p, o) => EP.render(c, p, o)
				: (setup.Paperdoll && setup.Paperdoll.paperdollSubject)
					? (c, p, o) => setup.Paperdoll.paperdollSubject(c, p, o)
					: null;

			try
			{
				if (renderFn)
				{
					canvas.classList.add("npc-appearance-paperdoll");
					if (EP && EP.ensureModsLoaded) await EP.ensureModsLoaded();
					// Full-body: body + face + clothes
					await renderFn(canvas, person, {
						pose: "front",
						quality: "npc",
						fallbackSilhouette: true,
						bypassCache: true,
						scale: { maxHeight: 400, maxWidth: 200, center: false },
					});
					setup.NpcAppearance._layoutNpcMirror(canvas, stage);
					return;
				}
			}
			catch (e)
			{
				console.warn("[NpcAppearance] paperdoll render failed, silhouette fallback", e);
			}

			setup.NpcAppearance.renderSilhouetteFallback(canvas, person);
			setup.NpcAppearance._layoutNpcMirror(canvas, stage);
		},
	};
})();