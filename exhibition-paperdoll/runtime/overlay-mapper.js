/* Exhibition paperdoll — skin / face / hair / makeup / effect overlay layers */
(function()
{
	"use strict";
	setup.ExhibitionPaperdoll = setup.ExhibitionPaperdoll || {};
	const EP = setup.ExhibitionPaperdoll;

	function mapOverlayItems(mods, matchFn, options)
	{
		options = options || {};
		if (!mods || !mods.length) return [];
		const layers = [];
		const Core = EP.Core;
		for (const mod of mods)
		{
			if (!mod || !Array.isArray(mod.items)) continue;
			for (const item of mod.items)
			{
				if (!item || !item.poses) continue;
				if (matchFn && !matchFn(item)) continue;
				if (options.requireArt && Core.packEntryHasArt && !Core.packEntryHasArt(item)) continue;
				const pruned = Core.prunePackEntry(item);
				if (!pruned) continue;
				if (options.silentMissing) pruned.silentMissing = true;
				layers.push(pruned);
			}
		}
		return layers;
	}

	EP.bindingHasOverlayArt = function(overlays, bindingId)
	{
		if (!bindingId || !overlays || !overlays.length) return false;
		const Core = EP.Core;
		for (const mod of overlays)
		{
			if (!mod || !Array.isArray(mod.items)) continue;
			for (const item of mod.items)
			{
				if (!item || !item.cotBindings || !item.cotBindings.length) continue;
				if (!item.cotBindings.includes(bindingId)) continue;
				if (Core.packEntryHasArt && Core.packEntryHasArt(item)) return true;
			}
		}
		return false;
	};

	function personMakeup(person)
	{
		return (person && person.makeup && typeof person.makeup === "object") ? person.makeup : {};
	}

	function personMarks(person)
	{
		return (person && Array.isArray(person.distinguishing_marks)) ? person.distinguishing_marks : [];
	}

	function personBaseFace(person)
	{
		const BF = EP.BaseFaces;
		const key = BF && BF.FACE_KEY ? BF.FACE_KEY : "paperdoll face";
		if (!person) return "";
		if (person[key]) return person[key];
		// Fill a default so authored base-face art can show (PC + NPC test path)
		if (BF && BF.ensurePersonFace)
		{
			const face = BF.ensurePersonFace(person, person.person || person.name || "PC");
			if (face)
			{
				// Persist only for PC; NPC faces are applied per-render by NpcAppearance
				if (typeof V !== "undefined" && V.pc
					&& (person.is_pc || (person.equals && person.equals(V.pc))))
					V.pc[key] = face;
				return face;
			}
		}
		// Last resort: first base-face catalog id (editor default)
		if (BF && BF.catalogList)
		{
			const list = BF.catalogList().filter((r) => r && r.id);
			if (list.length) return list[0].id;
		}
		return "base-face-1";
	}

	EP.mapSkinLayers = function()
	{
		return mapOverlayItems(EP._skinOverlays);
	};

	/**
	 * Base face overlay for person["paperdoll face"].
	 * Match order: cotBindings (preferred) → item.id → layer (legacy saves without bindings).
	 */
	EP.mapBaseFaceLayers = function(person)
	{
		const faceId = personBaseFace(person);
		if (!faceId) return [];
		return mapOverlayItems(EP._baseFaceOverlays, (item) =>
		{
			if (!item) return false;
			if (item.cotBindings && item.cotBindings.length)
				return item.cotBindings.includes(faceId);
			// Editor may have saved art bound only by id (e.g. base-face-1)
			if (item.id && item.id === faceId) return true;
			if (item.layer && item.layer === faceId) return true;
			return false;
		}, { requireArt: true, silentMissing: true });
	};

	/** Distinguishing-feature overlays drawn on top of the base face (one layer per chosen mark). */
	EP.mapFaceLayers = function(person)
	{
		const marks = personMarks(person);
		if (!marks.length) return [];
		return mapOverlayItems(EP._faceOverlays, (item) =>
		{
			if (!item.cotBindings || !item.cotBindings.length) return false;
			for (const markId of marks)
			{
				if (item.cotBindings.includes(markId)) return true;
			}
			return false;
		}, { requireArt: true, silentMissing: true });
	};

	EP.mapHairLayers = function(person)
	{
		const style = person && person["hair style"];
		if (!style) return [];
		return mapOverlayItems(EP._hairOverlays, (item) =>
		{
			if (!item.cotBindings || !item.cotBindings.length) return false;
			return item.cotBindings.includes(style);
		});
	};

	EP.mapBodyWritingLayers = function()
	{
		return mapOverlayItems(EP._bodyWritingOverlays);
	};

	EP.mapMakeupLayers = function(person)
	{
		const makeup = personMakeup(person);
		const keys = Object.keys(makeup);
		if (!keys.length) return [];
		return mapOverlayItems(EP._makeupOverlays, (item) =>
		{
			const slot = item.makeupSlot;
			const binding = item.cotBindings && item.cotBindings[0];
			if (!slot || !binding) return false;
			return makeup[slot] === binding;
		});
	};

	/** Editor / preview — show all authored overlays regardless of person bindings. */
	EP.mapAllMakeupLayers = function()
	{
		return mapOverlayItems(EP._makeupOverlays);
	};

	EP.mapEffectLayers = function()
	{
		return mapOverlayItems(EP._effectOverlays);
	};
})();