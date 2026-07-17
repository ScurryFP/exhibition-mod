/* Exhibition paperdoll — base face catalog (extensible; art bound in editor) */
(function()
{
	"use strict";
	setup.ExhibitionPaperdoll = setup.ExhibitionPaperdoll || {};
	const EP = setup.ExhibitionPaperdoll;
	const BF = EP.BaseFaces = EP.BaseFaces || {};

	const FACE_KEY = "paperdoll face";

	const DEFAULT_CATALOG = {
		"base-face-1": {
			name: "Base face 1",
			coding: ["femme", "masc", "enby"],
		},
		"base-face-2": {
			name: "Base face 2",
			coding: ["femme", "masc", "enby"],
		},
		"base-face-3": {
			name: "Base face 3",
			coding: ["femme", "masc", "enby"],
		},
	};

	const _registered = {};

	BF.FACE_KEY = FACE_KEY;
	BF.SYSTEM_VERSION = 2;

	BF.catalog = function()
	{
		return Object.assign({}, DEFAULT_CATALOG, _registered);
	};

	/** Add or replace a base face id (mods / other packs can call at runtime). */
	BF.register = function(id, info)
	{
		if (!id) return false;
		_registered[id] = Object.assign({ name: id }, info || {});
		return true;
	};

	BF.catalogList = function()
	{
		return Object.entries(BF.catalog()).map(([id, info]) => ({
			id: id,
			name: (info && info.name) || id,
			slot: "base",
			category: "base",
		})).sort((a, b) => a.name.localeCompare(b.name));
	};

	BF.faceInfo = function(faceId)
	{
		if (!faceId) return null;
		return BF.catalog()[faceId] || null;
	};

	BF.personCoding = function(person)
	{
		if (!person) return "enby";
		if (typeof person.is_femme === "function" && person.is_femme()) return "femme";
		if (typeof person.is_masc === "function" && person.is_masc()) return "masc";
		return "enby";
	};

	BF.getPersonFace = function(person)
	{
		if (!person) return "";
		return person[FACE_KEY] || "";
	};

	BF.optionsForPerson = function(person, options)
	{
		options = options || {};
		const coding = BF.personCoding(person);
		const isPc = !person || person.is_pc
			|| (typeof V !== "undefined" && V.pc && person.equals && person.equals(V.pc));
		const out = [{ id: "", name: "— None —" }];
		const EPfp = EP.FacePicker;
		for (const [faceId, info] of Object.entries(BF.catalog()))
		{
			if (!info) continue;
			if (!options.ignoreRestrict)
			{
				if (info.pconly && !isPc) continue;
				if (info.npconly && isPc) continue;
				if (info.coding && !isPc && !info.coding.includes(coding)) continue;
			}
			const hasArt = EPfp && EPfp.hasArtForBaseFace
				? EPfp.hasArtForBaseFace(faceId) : false;
			out.push({
				id: faceId,
				name: info.name || faceId,
				hasArt: hasArt,
			});
		}
		out.sort((a, b) =>
		{
			if (!a.id) return -1;
			if (!b.id) return 1;
			return a.name.localeCompare(b.name);
		});
		return out;
	};

	BF.pickRandom = function(person, seed)
	{
		const opts = BF.optionsForPerson(person, { ignoreRestrict: false })
			.filter((o) => o.id);
		if (!opts.length) return "";
		let idx = 0;
		if (typeof setup !== "undefined" && setup.newRNG && seed)
		{
			const rng = setup.newRNG(String(seed) + "pface");
			idx = typeof rng.rir === "function" ? rng.rir(0, opts.length - 1, true) : Math.floor(rng.random() * opts.length);
		}
		else
			idx = Math.floor(Math.random() * opts.length);
		return opts[idx].id;
	};

	BF.defaultForPerson = function(person, seed)
	{
		const current = BF.getPersonFace(person);
		if (current && BF.faceInfo(current)) return current;
		return BF.pickRandom(person, seed || "default");
	};

	BF.ensurePersonFace = function(person, seed)
	{
		if (!person) return "";
		if (BF.getPersonFace(person)) return BF.getPersonFace(person);
		const face = BF.defaultForPerson(person, seed);
		if (face) person[FACE_KEY] = face;
		return face;
	};
})();