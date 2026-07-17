/* Exhibition paperdoll — body shape / part-size variants (from CoT person ratings)
 *
 * Game stores continuous 0–1000 ratings (breast size, ass size, plumpness, muscle, …).
 * Descriptors use Math.floor(rating/100) → discrete labels (see Person methods in game HTML).
 * Physique is a 4×4 matrix of plumpness × muscle (physique_descriptor).
 *
 * Art keys: "dimension/tierId" e.g. "breasts/large", "physique/toned".
 * Missing art falls back to the pose's default sources (normal base body).
 */
(function()
{
	"use strict";
	setup.ExhibitionPaperdoll = setup.ExhibitionPaperdoll || {};
	const EP = setup.ExhibitionPaperdoll;
	const Core = EP.Core = EP.Core || {};
	const BV = EP.BodyVariants = EP.BodyVariants || {};

	/** Default / average tier when person rating is ~500. */
	BV.DEFAULT_TIER = {
		physique: "toned",
		height: "average_height",
		breasts: "modest",
		areola: "modestly_sized",
		ass: "modest",
		penis: "modestly_sized",
		body_hair_chest: "average",
		body_hair_pubic: "average",
		body_hair_butt: "average",
		body_hair_armpit: "average",
		body_hair_tummy: "average",
		body_hair_leg: "average",
		body_hair_arm: "average",
	};

	/** Slug for art keys (game uses spaces: "very hairy", "landing strip"). */
	BV.styleId = function(label)
	{
		return String(label || "")
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "_")
			.replace(/^_+|_+$/g, "") || "style";
	};

	function hairTiers(labels, defaultLabel)
	{
		return (labels || []).map((label) => ({
			id: BV.styleId(label),
			label: label,
			gameStyle: label,
			isDefault: label === defaultLabel,
		}));
	}

	/**
	 * Body dimensions authorable as base-body art.
	 * mode "replace" = full-body alternative base; "overlay" = drawn on top of base.
	 */
	BV.DIMENSIONS = {
		physique: {
			id: "physique",
			label: "Body physique (plumpness × muscle)",
			mode: "replace",
			personKeys: ["plumpness", "muscle"],
			// Matches Person.physique_descriptor()
			tiers: [
				{ id: "skinny", label: "Skinny", plumpMax: 250, muscleMax: 250 },
				{ id: "lean", label: "Lean", plumpMax: 250, muscleMax: 500 },
				{ id: "wiry", label: "Wiry", plumpMax: 250, muscleMax: 750 },
				{ id: "ripped", label: "Ripped", plumpMax: 250, muscleMax: 1000 },
				{ id: "thin", label: "Thin", plumpMax: 500, muscleMax: 250 },
				{ id: "toned", label: "Toned (default)", plumpMax: 500, muscleMax: 500, isDefault: true },
				{ id: "lithe", label: "Lithe", plumpMax: 500, muscleMax: 750 },
				{ id: "muscular", label: "Muscular", plumpMax: 500, muscleMax: 1000 },
				{ id: "plump", label: "Plump", plumpMax: 750, muscleMax: 250 },
				{ id: "thick_bodied", label: "Thick-bodied", plumpMax: 750, muscleMax: 500 },
				{ id: "brawny", label: "Brawny", plumpMax: 750, muscleMax: 750 },
				{ id: "ample", label: "Ample", plumpMax: 750, muscleMax: 1000 },
				{ id: "round", label: "Round", plumpMax: 1000, muscleMax: 250 },
				{ id: "full_figured", label: "Full-figured", plumpMax: 1000, muscleMax: 500 },
				{ id: "well_padded", label: "Well-padded", plumpMax: 1000, muscleMax: 750 },
				{ id: "stocky", label: "Stocky", plumpMax: 1000, muscleMax: 1000 },
			],
		},
		height: {
			id: "height",
			label: "Height",
			mode: "replace",
			personKey: "height",
			// Person.height_descriptor() — floor(rating/100)
			tiers: [
				{ id: "very_short", label: "Very short", band: 0 },
				{ id: "rather_short", label: "Rather short", band: 1 },
				{ id: "short", label: "Short", band: 2 },
				{ id: "somewhat_short", label: "Somewhat short", band: 3 },
				{ id: "average_height", label: "Average height (default)", band: 4, isDefault: true },
				{ id: "average_height_hi", label: "Average height (high)", band: 5 },
				{ id: "somewhat_tall", label: "Somewhat tall", band: 6 },
				{ id: "tall", label: "Tall", band: 7 },
				{ id: "rather_tall", label: "Rather tall", band: 8 },
				{ id: "very_tall", label: "Very tall", band: 9 },
				{ id: "towering", label: "Towering", band: 10 },
			],
		},
		breasts: {
			id: "breasts",
			label: "Breast size",
			mode: "overlay",
			personKey: "breast size",
			// Person.breast_descriptor() — special-case 0, else floor(size/100)
			tiers: [
				{ id: "completely_flat", label: "Completely flat", exact: 0 },
				{ id: "almost_flat", label: "Almost flat", band: 0 },
				{ id: "tiny", label: "Tiny", band: 1 },
				{ id: "small", label: "Small", band: 2 },
				{ id: "pert", label: "Pert", band: 3 },
				{ id: "modest", label: "Modest (default)", band: 4, isDefault: true },
				{ id: "perky", label: "Perky", band: 5 },
				{ id: "full", label: "Full", band: 6 },
				{ id: "large", label: "Large", band: 7 },
				{ id: "ample", label: "Ample", band: 8 },
				{ id: "massive", label: "Massive", band: 9 },
				{ id: "enormous", label: "Enormous", band: 10 },
			],
		},
		areola: {
			id: "areola",
			label: "Areola size",
			mode: "overlay",
			personKey: "areola size",
			// Person.areola_descriptor size words (color is separate)
			tiers: [
				{ id: "tiny", label: "Tiny", band: 0 },
				{ id: "tiny_hi", label: "Tiny (high)", band: 1 },
				{ id: "small", label: "Small", band: 2 },
				{ id: "small_hi", label: "Small (high)", band: 3 },
				{ id: "modestly_sized", label: "Modestly-sized (default)", band: 4, isDefault: true },
				{ id: "modestly_sized_hi", label: "Modestly-sized (high)", band: 5 },
				{ id: "large", label: "Large", band: 6 },
				{ id: "large_hi", label: "Large (high)", band: 7 },
				{ id: "very_large", label: "Very large", band: 8 },
				{ id: "very_large_mid", label: "Very large (mid)", band: 9 },
				{ id: "very_large_hi", label: "Very large (high)", band: 10 },
			],
		},
		ass: {
			id: "ass",
			label: "Ass / butt size",
			mode: "overlay",
			personKey: "ass size",
			// Person.butt_descriptor() — femme list (masc uses alternate words; same bands)
			tiers: [
				{ id: "skinny", label: "Skinny", band: 0 },
				{ id: "slender", label: "Slender", band: 1 },
				{ id: "slim", label: "Slim", band: 2 },
				{ id: "tight", label: "Tight", band: 3 },
				{ id: "modest", label: "Modest (default)", band: 4, isDefault: true },
				{ id: "round", label: "Round / modest+", band: 5 },
				{ id: "plump", label: "Plump / muscular", band: 6 },
				{ id: "curvaceous", label: "Curvaceous / rounded", band: 7 },
				{ id: "well_padded", label: "Well-padded / thick", band: 8 },
				{ id: "large", label: "Large / thick+", band: 9 },
				{ id: "huge", label: "Huge", band: 10 },
			],
		},
		penis: {
			id: "penis",
			label: "Penis size (length × girth bands)",
			mode: "overlay",
			personKeys: ["penis size", "penis girth"],
			// Simplified art tiers from length band (floor size/100); girth can refine later
			tiers: [
				{ id: "tiny", label: "Tiny", lengthMax: 1 },
				{ id: "small", label: "Small", lengthMax: 2 },
				{ id: "short_slender", label: "Short / slender", lengthMax: 4 },
				{ id: "modestly_sized", label: "Modestly-sized (default)", lengthMax: 5, isDefault: true },
				{ id: "thick", label: "Thick / average+", lengthMax: 6 },
				{ id: "long", label: "Long", lengthMax: 7 },
				{ id: "very_long", label: "Very long", lengthMax: 8 },
				{ id: "enormous", label: "Enormous", lengthMax: 10 },
			],
		},
		// Body hair (setup.Cosmetics.*_hair_styles / pubic_styles). Drawn above skin/tattoos.
		body_hair_chest: {
			id: "body_hair_chest",
			label: "Chest hair",
			group: "body_hair",
			mode: "overlay",
			coversSkin: true,
			bodyHairRegion: "chest",
			personPath: ["body_hair", "chest"],
			tiers: hairTiers(
				["smooth", "stubble", "trimmed", "triangle", "average", "hairy", "very hairy"],
				"average"
			),
		},
		body_hair_pubic: {
			id: "body_hair_pubic",
			label: "Pubic hair",
			group: "body_hair",
			mode: "overlay",
			coversSkin: true,
			bodyHairRegion: "pubic",
			personKey: "pubic_style",
			tiers: hairTiers(
				["shaved", "stubble", "average", "trimmed", "triangle", "postage stamp", "arrow", "heart", "landing strip", "happy trail", "hairy", "very hairy"],
				"average"
			),
		},
		body_hair_butt: {
			id: "body_hair_butt",
			label: "Butt hair",
			group: "body_hair",
			mode: "overlay",
			coversSkin: true,
			bodyHairRegion: "butt",
			personPath: ["body_hair", "butt"],
			tiers: hairTiers(
				["smooth", "stubble", "average", "trimmed", "hairy", "very hairy"],
				"average"
			),
		},
		body_hair_armpit: {
			id: "body_hair_armpit",
			label: "Armpit hair",
			group: "body_hair",
			mode: "overlay",
			coversSkin: true,
			bodyHairRegion: "armpit",
			personPath: ["body_hair", "armpit"],
			tiers: hairTiers(
				["smooth", "stubble", "average", "trimmed", "hairy", "very hairy"],
				"average"
			),
		},
		body_hair_tummy: {
			id: "body_hair_tummy",
			label: "Tummy hair",
			group: "body_hair",
			mode: "overlay",
			coversSkin: true,
			bodyHairRegion: "tummy",
			personPath: ["body_hair", "tummy"],
			tiers: hairTiers(
				["smooth", "stubble", "trimmed", "average", "hairy", "very hairy"],
				"average"
			),
		},
		body_hair_leg: {
			id: "body_hair_leg",
			label: "Leg hair",
			group: "body_hair",
			mode: "overlay",
			coversSkin: true,
			bodyHairRegion: "leg",
			personPath: ["body_hair", "leg"],
			tiers: hairTiers(
				["smooth", "stubble", "average", "hairy", "very hairy"],
				"average"
			),
		},
		body_hair_arm: {
			id: "body_hair_arm",
			label: "Arm hair",
			group: "body_hair",
			mode: "overlay",
			coversSkin: true,
			bodyHairRegion: "arm",
			personPath: ["body_hair", "arm"],
			tiers: hairTiers(
				["smooth", "stubble", "average", "hairy", "very hairy"],
				"average"
			),
		},
	};

	/** Menu groups for the left sidebar. */
	BV.MENU_GROUPS = [
		{ id: "default", label: "Default base" },
		{ id: "shape", label: "Body shape", dims: ["physique", "height"] },
		{ id: "parts", label: "Body parts", dims: ["breasts", "areola", "ass", "penis"] },
		{ id: "body_hair", label: "Body hair (covers skin/tattoos)", dims: [
			"body_hair_chest", "body_hair_pubic", "body_hair_butt", "body_hair_armpit",
			"body_hair_tummy", "body_hair_leg", "body_hair_arm",
		] },
	];

	BV.dimensionList = function()
	{
		return Object.keys(BV.DIMENSIONS).map((id) => BV.DIMENSIONS[id]);
	};

	BV.variantKey = function(dimensionId, tierId)
	{
		return String(dimensionId) + "/" + String(tierId);
	};

	BV.parseVariantKey = function(key)
	{
		if (!key || typeof key !== "string") return null;
		const i = key.indexOf("/");
		if (i < 0) return null;
		return { dimension: key.slice(0, i), tier: key.slice(i + 1) };
	};

	BV.ratingOf = function(person, key, fallback)
	{
		if (!person) return fallback != null ? fallback : 500;
		let v = person[key];
		if (v == null && typeof person.get_property === "function")
			v = person.get_property(key);
		v = Number(v);
		if (!Number.isFinite(v)) return fallback != null ? fallback : 500;
		return Math.max(0, Math.min(1000, v));
	};

	BV.bandOf = function(rating)
	{
		return Math.min(10, Math.max(0, Math.floor(Number(rating) / 100)));
	};

	BV.physiqueTierId = function(person)
	{
		const plump = BV.ratingOf(person, "plumpness", 500);
		const muscle = BV.ratingOf(person, "muscle", 500);
		const dim = BV.DIMENSIONS.physique;
		for (const tier of dim.tiers)
		{
			// tiers ordered by plump band then muscle
		}
		// Match game logic exactly
		if (plump <= 250)
		{
			if (muscle <= 250) return "skinny";
			if (muscle <= 500) return "lean";
			if (muscle <= 750) return "wiry";
			return "ripped";
		}
		if (plump <= 500)
		{
			if (muscle <= 250) return "thin";
			if (muscle <= 500) return "toned";
			if (muscle <= 750) return "lithe";
			return "muscular";
		}
		if (plump <= 750)
		{
			if (muscle <= 250) return "plump";
			if (muscle <= 500) return "thick_bodied";
			if (muscle <= 750) return "brawny";
			return "ample";
		}
		if (muscle <= 250) return "round";
		if (muscle <= 500) return "full_figured";
		if (muscle <= 750) return "well_padded";
		return "stocky";
	};

	BV.penisTierId = function(person)
	{
		const length = BV.bandOf(BV.ratingOf(person, "penis size", 500));
		if (length <= 1) return "tiny";
		if (length <= 2) return "small";
		if (length <= 4) return "short_slender";
		if (length <= 5) return "modestly_sized";
		if (length <= 6) return "thick";
		if (length <= 7) return "long";
		if (length <= 8) return "very_long";
		return "enormous";
	};

	BV.personBodyHairStyle = function(person, dim)
	{
		if (!person || !dim) return null;
		if (dim.personKey)
			return person[dim.personKey] || person.pubic_style || null;
		if (dim.personPath && dim.personPath.length === 2)
		{
			const root = person[dim.personPath[0]];
			if (root && typeof root === "object")
				return root[dim.personPath[1]] || null;
		}
		return null;
	};

	BV.tierIdForDimension = function(dimensionId, person)
	{
		const dim = BV.DIMENSIONS[dimensionId];
		if (!dim) return null;
		if (dimensionId === "physique") return BV.physiqueTierId(person);
		if (dimensionId === "penis") return BV.penisTierId(person);
		if (dim.group === "body_hair")
		{
			const style = BV.personBodyHairStyle(person, dim) || "average";
			const id = BV.styleId(style);
			if (dim.tiers.some((t) => t.id === id)) return id;
			// match by gameStyle
			const hit = dim.tiers.find((t) => t.gameStyle === style || t.label === style);
			return (hit && hit.id) || BV.DEFAULT_TIER[dimensionId] || "average";
		}
		if (dimensionId === "breasts")
		{
			const size = BV.ratingOf(person, "breast size", 500);
			if (size === 0) return "completely_flat";
			const band = BV.bandOf(size);
			const tier = dim.tiers.find((t) => t.band === band);
			return (tier && tier.id) || BV.DEFAULT_TIER.breasts;
		}
		const key = dim.personKey;
		const rating = BV.ratingOf(person, key, 500);
		const band = BV.bandOf(rating);
		const tier = dim.tiers.find((t) => t.band === band);
		return (tier && tier.id) || BV.DEFAULT_TIER[dimensionId] || (dim.tiers[0] && dim.tiers[0].id);
	};

	BV.defaultTierId = function(dimensionId)
	{
		const dim = BV.DIMENSIONS[dimensionId];
		if (!dim) return null;
		const d = dim.tiers.find((t) => t.isDefault);
		return (d && d.id) || (dim.tiers[0] && dim.tiers[0].id) || null;
	};

	BV.poseHasVariantArt = function(poseDef, dimensionId, tierId)
	{
		if (!poseDef || !poseDef.variants) return false;
		const key = BV.variantKey(dimensionId, tierId);
		const entry = poseDef.variants[key];
		if (!entry) return false;
		const sources = Core.normalizeSources
			? Core.normalizeSources(entry)
			: (entry.sources || {});
		return !!(sources && Object.keys(sources).length);
	};

	/**
	 * Resolve sources for a body pose given person stats.
	 * Fallback chain: exact tier art → default-tier art for that dimension → base pose sources.
	 */
	BV.resolvePoseSources = function(poseDef, person, options)
	{
		options = options || {};
		const baseSources = Core.normalizeSources
			? Core.normalizeSources(poseDef)
			: Object.assign({}, (poseDef && poseDef.sources) || {});
		if (!poseDef) return { sources: baseSources, overlays: [], used: [] };

		const used = [];
		let sources = Object.assign({}, baseSources);
		const overlays = [];

		// 1) Full-body replace dimensions (physique, then height if present)
		for (const dimId of ["physique", "height"])
		{
			const dim = BV.DIMENSIONS[dimId];
			if (!dim || dim.mode !== "replace") continue;
			const tierId = options.forceTiers && options.forceTiers[dimId]
				? options.forceTiers[dimId]
				: BV.tierIdForDimension(dimId, person);
			if (!tierId) continue;
			if (BV.poseHasVariantArt(poseDef, dimId, tierId))
			{
				const key = BV.variantKey(dimId, tierId);
				const entry = poseDef.variants[key];
				sources = Core.normalizeSources(entry);
				used.push(key);
			}
			else
			{
				const defTier = BV.defaultTierId(dimId);
				if (defTier && defTier !== tierId && BV.poseHasVariantArt(poseDef, dimId, defTier))
				{
					const key = BV.variantKey(dimId, defTier);
					sources = Core.normalizeSources(poseDef.variants[key]);
					used.push(key + " (default fallback)");
				}
				// else keep base sources
			}
		}

		// 2) Part overlays (only if art exists; else skip — base already drawn)
		// Body hair is applied later (above skin/tattoos) via expandBodyHairLayers.
		for (const dimId of ["breasts", "ass", "penis", "areola"])
		{
			const dim = BV.DIMENSIONS[dimId];
			if (!dim || dim.mode !== "overlay") continue;
			// Skip breast/areola overlays if no breasts
			if ((dimId === "breasts" || dimId === "areola") && person)
			{
				if (typeof person.has_breasts === "function" && !person.has_breasts()) continue;
				if (person["breast size"] === 0 && dimId === "breasts")
				{
					// still allow completely_flat overlay if authored
				}
			}
			if (dimId === "penis" && person)
			{
				if (typeof person.has_penis === "function" && !person.has_penis()) continue;
			}
			const tierId = options.forceTiers && options.forceTiers[dimId]
				? options.forceTiers[dimId]
				: BV.tierIdForDimension(dimId, person);
			if (!tierId) continue;
			let key = BV.variantKey(dimId, tierId);
			if (!BV.poseHasVariantArt(poseDef, dimId, tierId))
			{
				const defTier = BV.defaultTierId(dimId);
				if (defTier && BV.poseHasVariantArt(poseDef, dimId, defTier))
					key = BV.variantKey(dimId, defTier);
				else
					continue; // no overlay art — leave base as-is
			}
			const entry = poseDef.variants[key];
			overlays.push({
				key: key,
				sources: Core.normalizeSources(entry),
				transform: entry.transform || poseDef.transform,
				zIndex: dimId === "areola" ? 3 : dimId === "breasts" ? 2 : dimId === "penis" ? 2 : 1,
			});
			used.push(key);
		}

		return {
			sources: sources,
			transform: poseDef.transform,
			overlays: overlays.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)),
			used: used,
			baseFallback: !used.length,
		};
	};

	/**
	 * Expand a base body pack layer into compose layers for this person
	 * (replaced base + optional part overlays). Missing art → normal base sources.
	 */
	BV.expandBodyLayerForPerson = function(layer, person, options)
	{
		if (!layer || !layer.poses) return [layer];
		options = options || {};
		const outBase = Object.assign({}, layer, { poses: {} });
		const overlayLayers = [];

		for (const [poseId, poseDef] of Object.entries(layer.poses))
		{
			if (!poseDef) continue;
			const resolved = BV.resolvePoseSources(poseDef, person, options);
			outBase.poses[poseId] = Object.assign({}, poseDef, {
				sources: resolved.sources,
				transform: resolved.transform || poseDef.transform,
			});
			// Keep variants on the object for editor, but runtime compose uses sources only
			for (let i = 0; i < resolved.overlays.length; i++)
			{
				const ov = resolved.overlays[i];
				let ol = overlayLayers[i];
				if (!ol)
				{
					ol = {
						id: (layer.id || "body") + "-variant-" + i,
						zIndex: (layer.zIndex || 10) + 1 + i,
						poses: {},
						_bodyVariant: true,
						silentMissing: true,
					};
					overlayLayers[i] = ol;
				}
				ol.poses[poseId] = {
					sources: ov.sources,
					transform: ov.transform,
				};
			}
		}

		return [outBase].concat(overlayLayers.filter(Boolean));
	};

	/** Ensure poseDef.variants map exists. */
	BV.ensureVariantEntry = function(poseDef, dimensionId, tierId)
	{
		if (!poseDef) return null;
		poseDef.variants = poseDef.variants || {};
		const key = BV.variantKey(dimensionId, tierId);
		if (!poseDef.variants[key])
			poseDef.variants[key] = { sources: {}, transform: Object.assign({}, poseDef.transform || {}) };
		return poseDef.variants[key];
	};

	BV.listAuthoredVariants = function(poseDef)
	{
		if (!poseDef || !poseDef.variants) return [];
		const out = [];
		for (const [key, entry] of Object.entries(poseDef.variants))
		{
			const sources = entry && (entry.sources || entry);
			const has = sources && typeof sources === "object" && Object.keys(sources).some((t) => sources[t]);
			if (has) out.push(key);
		}
		return out.sort();
	};

	/**
	 * Body-hair overlays for a base body pack layer — drawn above skin/tattoos.
	 * Returns compose layers (zIndex ~22+). Missing art → skip (skin shows through).
	 */
	BV.expandBodyHairLayers = function(bodyLayer, person, options)
	{
		if (!bodyLayer || !bodyLayer.poses || !person) return [];
		options = options || {};
		const hairDims = Object.keys(BV.DIMENSIONS).filter((id) =>
			BV.DIMENSIONS[id].group === "body_hair");
		const byKey = {};
		let order = 0;
		for (const dimId of hairDims)
		{
			const dim = BV.DIMENSIONS[dimId];
			const tierId = options.forceTiers && options.forceTiers[dimId]
				? options.forceTiers[dimId]
				: BV.tierIdForDimension(dimId, person);
			if (!tierId || tierId === "smooth" || tierId === "shaved") continue;
			const key = BV.variantKey(dimId, tierId);
			const layer = {
				id: "body-hair-" + dimId,
				zIndex: 22 + order,
				poses: {},
				_bodyHair: true,
				silentMissing: true,
			};
			let any = false;
			for (const [poseId, poseDef] of Object.entries(bodyLayer.poses))
			{
				if (!poseDef) continue;
				let useKey = key;
				if (!BV.poseHasVariantArt(poseDef, dimId, tierId))
				{
					const defTier = BV.defaultTierId(dimId);
					if (defTier && BV.poseHasVariantArt(poseDef, dimId, defTier))
						useKey = BV.variantKey(dimId, defTier);
					else
						continue;
				}
				const entry = poseDef.variants[useKey];
				layer.poses[poseId] = {
					sources: Core.normalizeSources(entry),
					transform: entry.transform || poseDef.transform,
				};
				any = true;
			}
			if (any)
			{
				byKey[dimId] = layer;
				order++;
			}
		}
		return Object.values(byKey);
	};
})();
