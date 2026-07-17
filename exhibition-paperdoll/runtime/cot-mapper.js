/* Exhibition paperdoll — CoT clothes + exposure tweaks → mod layers */
(function()
{
	"use strict";
	setup.ExhibitionPaperdoll = setup.ExhibitionPaperdoll || {};
	const EP = setup.ExhibitionPaperdoll;
	const Core = EP.Core = EP.Core || {};

	/** CoT exposure adjustment type → default paperdoll displacement id. */
	EP.DEFAULT_EXPOSURE_DISPLACEMENTS = {
		tighten_bottom: "cameltoe",
		hike_skirt: "hem_lifted",
		tie_top: "hem_lifted",
		loosen_neck: "neckline_lowered",
		dress_daring: "neckline_lowered",
		underwear_peek: "hem_lifted",
		bare_midriff: "midriff_bare",
		side_gap: "side_gap",
		open_outer: "open",
		swim_adjust: "side_gap",
		areola_show: "areola_show",
		nipple_slip: "nipple_slip",
		// subtle / generic have no dedicated art by default
		subtle_style: null,
		generic_fit: null,
	};

	/**
	 * Active in-game clothing displacement verb → paperdoll displacement id.
	 * Verbs come from clothing archetype keys: "displace <verb>".
	 * Scanned from CourseOfTemptation clothing defs (pull down, lift, hike up, …).
	 */
	EP.GAME_DISPLACEMENT_MAP = {
		"pull aside": "pulled_aside",
		"tug aside": "pulled_aside",
		"tug": "pulled_aside",
		"shift": "pulled_aside",
		"move aside": "pulled_aside",
		"brush aside": "pulled_aside",
		"pull tentacles aside": "pulled_aside",
		"uncover": "pulled_aside",
		"unbutton butt": "pulled_aside",
		"lift": "lifted",
		"pull off": "lifted",
		"pull up": "hem_lifted",
		"hike up": "hem_lifted",
		"roll up": "hem_lifted",
		"pull down": "neckline_lowered",
		"tug down": "neckline_lowered",
		"loosen": "neckline_lowered",
		"unbutton": "neckline_lowered",
		"unbutton front": "neckline_lowered",
		"unclasp": "neckline_lowered",
		"unhook": "pulled_aside",
		"unfasten": "unfastened",
		"unfastened": "unfastened",
		"undo": "unfastened",
		"unzip": "unzipped",
		"open": "open",
		"untie": "untied",
		"unlace": "unlaced",
		"unbuckle": "unbuckled",
		"unbuckle snout of": "unbuckled",
		"peel down": "peeled_down",
		"unwrap": "unwrapped",
		"unwind": "unwrapped",
		// "remove" is full remove, not a paperdoll mask
	};

	EP._gameDisplacementPriority = [
		"nipple_slip",
		"areola_show",
		"pulled_aside",
		"lifted",
		"peeled_down",
		"unzipped",
		"open",
		"unfastened",
		"untied",
		"unlaced",
		"unbuckled",
		"unwrapped",
		"hem_lifted",
		"neckline_lowered",
		"midriff_bare",
		"side_gap",
		"cameltoe",
	];

	EP._exposureAdjustmentPriority = [
		"nipple_slip",
		"areola_show",
		"tighten_bottom",
		"hike_skirt",
		"tie_top",
		"loosen_neck",
		"dress_daring",
		"underwear_peek",
		"bare_midriff",
		"side_gap",
		"open_outer",
		"swim_adjust",
	];

	EP._baseDisplacementId = function(dispId)
	{
		if (!dispId || dispId === "normal") return "normal";
		const m = String(dispId).match(/^(.*)_(\d+)$/);
		return m ? m[1] : String(dispId);
	};

	/**
	 * Pack authoring: enabledDisplacements checkboxes.
	 * - array with entries → only those paperdoll ids may apply (and only with art)
	 * - empty array → no displacement masks for this piece
	 * - missing / null → legacy: any id with art is allowed
	 */
	EP.packAllowsDisplacement = function(packItem, dispId)
	{
		const baseId = EP._baseDisplacementId(dispId);
		if (!baseId || baseId === "normal") return true;
		if (!packItem) return false;
		if (!Array.isArray(packItem.enabledDisplacements))
			return true;
		if (!packItem.enabledDisplacements.length)
			return false;
		return packItem.enabledDisplacements.indexOf(baseId) >= 0;
	};

	EP._wornClothingItem = function(wornEntry)
	{
		if (!wornEntry) return null;
		if (typeof ClothingItem !== "undefined")
			return new ClothingItem(wornEntry);
		return wornEntry;
	};

	EP._exposureAdjustments = function(cItem)
	{
		if (!cItem) return {};
		if (typeof cItem.get_property === "function")
			return cItem.get_property("exposure_adjustments") || {};
		return (cItem.properties && cItem.properties.exposure_adjustments) || {};
	};

	EP._exposureSteps = function(cItem, type)
	{
		const EA = setup.ExhibitionAdjustment;
		if (EA && typeof EA.get_steps === "function")
			return EA.get_steps(cItem, type);
		const data = EP._exposureAdjustments(cItem)[type];
		if (!data) return 0;
		if (data.steps != null) return data.steps;
		return 0;
	};

	EP._gameDisplacements = function(cItem)
	{
		if (!cItem) return [];
		if (typeof cItem.get_displacements === "function")
			return cItem.get_displacements() || [];
		return cItem.displacements || [];
	};

	EP._resolveMappedDisplacement = function(packItem, poseId, baseId, steps)
	{
		if (!baseId || !packItem || !packItem.poses) return null;
		if (!EP.packAllowsDisplacement(packItem, baseId)) return null;
		const poseDef = packItem.poses[poseId];
		if (!poseDef) return null;
		if (Core.resolveSteppedDisplacementId)
			return Core.resolveSteppedDisplacementId(poseDef, baseId, steps || 1);
		return Core.displacementHasArt && Core.displacementHasArt(poseDef, baseId) ? baseId : null;
	};

	EP._exposureDisplacementMap = function(packItem)
	{
		const map = Object.assign({}, EP.DEFAULT_EXPOSURE_DISPLACEMENTS);
		if (packItem && packItem.exposureDisplacements)
			Object.assign(map, packItem.exposureDisplacements);
		return map;
	};

	EP._resolveFromGameDisplacements = function(cItem, packItem, poseId)
	{
		const active = EP._gameDisplacements(cItem);
		if (!active.length) return null;
		const candidates = [];
		for (const disp of active)
		{
			const baseId = EP.GAME_DISPLACEMENT_MAP[disp];
			if (!baseId) continue;
			const resolved = EP._resolveMappedDisplacement(packItem, poseId, baseId, 1);
			if (resolved) candidates.push({ id: resolved, priority: EP._gameDisplacementPriority.indexOf(baseId) });
		}
		if (!candidates.length) return null;
		candidates.sort((a, b) => {
			const pa = a.priority < 0 ? 99 : a.priority;
			const pb = b.priority < 0 ? 99 : b.priority;
			return pa - pb;
		});
		return candidates[0].id;
	};

	EP._resolveFromExposureAdjustments = function(cItem, packItem, poseId)
	{
		const map = EP._exposureDisplacementMap(packItem);
		const candidates = [];
		for (const type of EP._exposureAdjustmentPriority)
		{
			const steps = EP._exposureSteps(cItem, type);
			if (steps <= 0) continue;
			const baseId = map[type];
			if (!baseId) continue;
			const resolved = EP._resolveMappedDisplacement(packItem, poseId, baseId, steps);
			if (resolved) candidates.push({ id: resolved, steps: steps, type: type });
		}
		if (!candidates.length) return null;
		candidates.sort((a, b) => b.steps - a.steps);
		return candidates[0].id;
	};

	/**
	 * Resolve which paperdoll displacement to draw for a worn clothing item.
	 * Requires: game/exposure state → mapped id → enabled on pack item → art present.
	 */
	EP.resolveClothingDisplacement = function(cItem, packItem, poseId)
	{
		poseId = poseId || "front";
		if (!cItem || !packItem) return "normal";
		const fromGame = EP._resolveFromGameDisplacements(cItem, packItem, poseId);
		if (fromGame) return fromGame;
		const fromExposure = EP._resolveFromExposureAdjustments(cItem, packItem, poseId);
		if (fromExposure) return fromExposure;
		return "normal";
	};

	EP._invalidateAfterExposureChange = function(person)
	{
		if (!person) return;
		EP.invalidate(person);
		if (person.is_pc || (typeof V !== "undefined" && V.pc && person.equals && person.equals(V.pc)))
		{
			if (EP.rerenderAll) EP.rerenderAll().catch(function() {});
			else if (EP.renderSidebar) EP.renderSidebar().catch(function() {});
		}
	};

	EP._installExposureHooks = function()
	{
		if (EP._exposureHooksInstalled) return;
		const EA = setup.ExhibitionAdjustment;
		if (!EA || typeof EA.adjust !== "function") return;
		const origAdjust = EA.adjust.bind(EA);
		EA.adjust = function(person, cItem, type, direction)
		{
			const ok = origAdjust(person, cItem, type, direction);
			if (ok) EP._invalidateAfterExposureChange(person);
			return ok;
		};
		const origApply = EA.apply_item_exposure;
		if (typeof origApply === "function")
		{
			EA.apply_item_exposure = function(cItem, data)
			{
				origApply.call(EA, cItem, data);
				if (typeof V !== "undefined" && V.pc) EP._invalidateAfterExposureChange(V.pc);
			};
		}
		EP._exposureHooksInstalled = true;
	};

	EP._wornDesignValue = function(cItem, wornEntry, subKey)
	{
		const Skins = window.ExhibitionClothingSkins;
		if (Skins && Skins.wornSubValue)
			return Skins.wornSubValue(cItem, wornEntry, subKey || "design");
		const subs = (cItem && (cItem.subs || (typeof cItem.get_subs === "function" && cItem.get_subs())))
			|| (wornEntry && wornEntry.subs)
			|| {};
		if (subKey && subs[subKey] != null && subs[subKey] !== "")
			return String(subs[subKey]);
		for (const k of ["design", "print", "team", "text"])
		{
			if (subs[k] != null && subs[k] !== "") return String(subs[k]);
		}
		return "";
	};

	/** Base skin = no design-specific text (used when worn design has no matching art). */
	EP._isBaseSkinItem = function(item)
	{
		const v = item && item.skinSubValue;
		return v == null || v === "" || v === "_default";
	};

	/**
	 * Pick pack layers for one worn clothing id.
	 * Design-specific skins (skinSubValue === worn design text) win; else base skins only.
	 */
	EP._filterSkinsForWorn = function(packItems, clothingId, wornDesign)
	{
		const Skins = window.ExhibitionClothingSkins;
		if (Skins && Skins.filterSkinsForWorn)
			return Skins.filterSkinsForWorn(packItems, clothingId, wornDesign);

		const bound = (packItems || []).filter((it) =>
			it && it.cotBindings && it.cotBindings.includes(clothingId));
		if (!bound.length) return [];
		const design = wornDesign || "";
		if (design)
		{
			const specific = bound.filter((it) =>
				!EP._isBaseSkinItem(it) && String(it.skinSubValue) === design);
			if (specific.length) return specific;
		}
		return bound.filter(EP._isBaseSkinItem);
	};

	/**
	 * Map worn clothing → paperdoll layers.
	 * Supports graphic skins: pack items with skinSubValue match worn sub design/print.
	 * Design-specific skins win; otherwise base skins (no skinSubValue) are used.
	 */
	EP.mapClothingLayers = function(person, options)
	{
		if (!EP._mods || !EP._mods.length) return [];
		options = options || {};
		const poseId = Core.normalizePose
			? Core.normalizePose(options.pose || (typeof V !== "undefined" && V.optpaperdollview === "back" ? "back" : "front"))
			: (options.pose || "front");
		const worn = person && person.clothes ? person.clothes : [];
		const layers = [];

		// Collect all pack clothing items
		const packItems = [];
		for (const mod of EP._mods)
		{
			if (!mod || !Array.isArray(mod.items)) continue;
			for (const item of mod.items)
			{
				if (item && item.cotBindings && item.poses) packItems.push(item);
			}
		}

		// Group by worn clothing id so skins don't all stack blindly
		const wornIds = [];
		for (const w of worn)
		{
			if (w && w.item && wornIds.indexOf(w.item) < 0) wornIds.push(w.item);
		}

		for (const clothingId of wornIds)
		{
			const wornEntry = worn.find((c) => c && c.item === clothingId);
			if (!wornEntry) continue;
			const cItem = EP._wornClothingItem(wornEntry);
			const design = EP._wornDesignValue(cItem, wornEntry);
			const candidates = EP._filterSkinsForWorn(packItems, clothingId, design);

			for (const item of candidates)
			{
				const pruned = Core.prunePackEntry(item);
				if (!pruned) continue;
				if (Array.isArray(item.enabledDisplacements))
					pruned.enabledDisplacements = item.enabledDisplacements.slice();
				if (item.skinSubValue) pruned.skinSubValue = item.skinSubValue;
				if (item.skinSubKey) pruned.skinSubKey = item.skinSubKey;
				pruned.displacement = EP.resolveClothingDisplacement(cItem, pruned, poseId);
				if (item.recolor)
				{
					const poseDef = pruned.poses && pruned.poses[poseId];
					if (poseDef && Core.poseHasColorMask && Core.poseHasColorMask(poseDef))
					{
						pruned.recolor = true;
						pruned.tintColor = Core._wornClothingTintColor(cItem || wornEntry);
					}
				}
				layers.push(pruned);
			}
		}
		return layers;
	};

	EP._installExposureHooks();
	if (EP._installClothingFlagHooks) EP._installClothingFlagHooks();
})();
