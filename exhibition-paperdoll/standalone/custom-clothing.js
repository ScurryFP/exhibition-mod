/* Create / inject / share full vanilla-style CoT clothing from the standalone editor */
(function()
{
	"use strict";

	const CATEGORIES = [
		"tops", "bottoms", "dresses", "underwear", "swimwear",
		"outerwear", "bodysuits", "footwear", "accessories", "hats", "masks", "bags",
	];

	const STYLE_KEYS = [
		"boho", "casual", "conservative", "costume", "country", "dressy",
		"fashionista", "geek", "glam", "goth", "grunge", "hipster", "punk",
		"scene", "schoolpride", "greekpride", "slutty", "sporty",
	];

	const COMMON_SUB_STYLES = [
		"tight", "form-fitting", "fitted", "casual", "loose", "stretchy",
		"skinny", "baggy", "mini", "micro", "knee-length", "long",
		"sleeveless", "short-sleeved", "long sleeve", "strappy",
	];

	const DISPLACE_VERBS = [
		"lift", "pull down", "pull up", "hike up", "pull aside", "unbutton",
		"unzip", "open", "untie", "unfasten", "undo", "unlace", "unclasp",
		"peel down", "shift", "roll up",
	];

	const DIALOGUE_TAG_OPTIONS = [
		"cleavage", "daring", "short skirt", "dress with pockets", "loose tank",
	];

	const STORAGE_OPTIONS = [
		"cards", "cards hide", "phone", "phone hide", "laptop",
		"textbooks small", "snacks small", "toys small",
	];

	const BOOLEAN_FLAG_OPTIONS = [
		"NoShops", "pc only", "npc only", "cleavage", "shows nipples", "skintight",
		"short skirt", "daring", "athletic", "elastic waistband", "under access",
		"outerwear ok", "not exhibitionist", "non-underwear", "hide nipple erectness",
		"hide bulge", "cool", "slightly warming", "wet cling", "wet transparency",
		"uncomfortable sleep", "always removable by npc", "deprecated", "mask",
		"medical", "neutral", "collar", "default open", "waterproof",
	];

	const CATEGORY_DEFAULTS = {
		tops: {
			layer: 20,
			covers: ["chest", "stomach", "back", "breasts", "nipples"],
			styles: ["tight", "form-fitting", "fitted", "casual"],
			styleFactor: { casual: 2 },
			displace: {
				"lift": ["chest", "stomach", "breasts", "nipples"],
				"pull down": ["chest", "breasts", "nipples"],
			},
			dialogueTags: ["cleavage"],
		},
		bottoms: {
			layer: 20,
			covers: ["hip", "hip", "thigh", "thigh", "crotch", "butt", "penis", "balls", "anus", "vagina", "clitoris"],
			styles: ["tight", "form-fitting", "casual", "loose"],
			styleFactor: { casual: 2 },
			displace: {
				"pull down": ["hip", "hip", "thigh", "thigh", "crotch", "butt", "penis", "balls", "anus", "vagina", "clitoris"],
				"hike up": ["crotch", "butt", "penis", "balls", "anus", "vagina", "clitoris"],
			},
			dialogueTags: [],
		},
		dresses: {
			layer: 25,
			covers: ["chest", "stomach", "back", "breasts", "nipples", "hip", "hip", "thigh", "thigh", "crotch", "butt", "penis", "balls", "anus", "vagina", "clitoris"],
			styles: ["tight", "form-fitting", "casual", "fitted"],
			styleFactor: { dressy: 2, fashionista: 1 },
			displace: {
				"hike up": ["crotch", "butt", "penis", "balls", "anus", "vagina", "clitoris"],
				"pull down": ["chest", "breasts", "nipples"],
			},
			dialogueTags: ["cleavage"],
		},
		underwear: {
			layer: 10,
			covers: ["chest", "breasts", "nipples"],
			styles: ["tight", "form-fitting"],
			styleFactor: { casual: 1 },
			displace: {
				"pull up": ["chest", "breasts", "nipples"],
				"pull down": ["chest", "breasts", "nipples"],
			},
			dialogueTags: [],
		},
		swimwear: {
			layer: 12,
			covers: ["chest", "breasts", "nipples", "crotch", "butt", "penis", "balls", "anus", "vagina", "clitoris"],
			styles: ["tight", "form-fitting"],
			styleFactor: { sporty: 2, slutty: 1 },
			displace: {
				"pull aside": ["chest", "breasts", "nipples", "crotch", "penis", "vagina", "clitoris"],
			},
			dialogueTags: ["cleavage", "daring"],
		},
		outerwear: {
			layer: 30,
			covers: ["chest", "stomach", "back", "shoulder", "shoulder", "breasts", "nipples"],
			styles: ["casual", "fitted", "loose"],
			styleFactor: { casual: 2, dressy: 1 },
			displace: { "open": ["chest", "stomach", "breasts", "nipples"] },
			dialogueTags: [],
		},
		bodysuits: {
			layer: 15,
			covers: ["chest", "stomach", "back", "breasts", "nipples", "hip", "hip", "crotch", "butt", "penis", "balls", "anus", "vagina", "clitoris"],
			styles: ["tight", "form-fitting"],
			styleFactor: { slutty: 2, fashionista: 1 },
			displace: {
				"pull aside": ["crotch", "penis", "vagina", "clitoris"],
				"unfasten": ["chest", "breasts", "nipples"],
			},
			dialogueTags: ["cleavage", "daring"],
		},
		footwear: {
			layer: 20,
			covers: ["foot", "foot", "ankle", "ankle"],
			styles: ["casual"],
			styleFactor: { casual: 2 },
			displace: {},
			dialogueTags: [],
		},
		accessories: {
			layer: 40,
			covers: ["neck"],
			styles: ["casual"],
			styleFactor: { fashionista: 1 },
			displace: {},
			dialogueTags: [],
		},
		hats: {
			layer: 30,
			covers: ["head"],
			styles: ["casual"],
			styleFactor: { casual: 1 },
			displace: {},
			dialogueTags: [],
		},
		masks: {
			layer: 35,
			covers: ["face"],
			styles: ["casual"],
			styleFactor: { costume: 2 },
			displace: {},
			dialogueTags: [],
		},
		bags: {
			layer: 40,
			covers: [],
			styles: ["casual"],
			styleFactor: { casual: 1 },
			displace: {},
			dialogueTags: [],
		},
	};

	const COVER_OPTIONS = [
		"chest", "stomach", "back", "breasts", "nipples", "shoulder", "waist",
		"hip", "thigh", "crotch", "butt", "penis", "balls", "anus", "vagina",
		"clitoris", "neck", "head", "face", "foot", "ankle", "calf", "wrist",
		"forearm", "upper arm", "hand", "mouth",
	];

	const CLOTHING_SHOPS = [
		"Utopia Euphoria", "Wild Fantasies", "SportsDrip", "Bootlicker",
		"Pembleton Way", "Howling Jigoku", "Lsplits", "Mr Gable's",
		"Costume Shop", "University Bookstore", "Greek Life", "JT Ult Seasonal",
		"Niche.tv", "CollegeCams", "Planet X", "Planetarium Gift Shop",
	];

	const MARKER_START = "/* === Exhibition Custom Clothes Start === */";
	const MARKER_END = "/* === Exhibition Custom Clothes End === */";

	function slugifyItemId(text)
	{
		return String(text || "Custom Item").replace(/\s+/g, " ").trim() || "Custom Item";
	}

	function shortnameFromName(name)
	{
		return String(name || "item").toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim() || "item";
	}

	function categoryDefaults(category)
	{
		return CATEGORY_DEFAULTS[category] || CATEGORY_DEFAULTS.tops;
	}

	function paperdollZFromLayer(layer, category)
	{
		const L = Number(layer) || 20;
		if (category === "underwear" || category === "swimwear") return 30 + (L % 10);
		if (category === "outerwear") return 55;
		if (category === "dresses" || category === "bodysuits") return 42;
		if (category === "footwear") return 25;
		if (category === "accessories" || category === "hats" || category === "masks" || category === "bags")
			return 70;
		return 40 + Math.min(15, Math.floor(L / 2));
	}

	/**
	 * Full vanilla-style gameClothing definition (serializable).
	 */
	function buildGameClothingFromForm(form)
	{
		form = form || {};
		const itemId = slugifyItemId(form.itemId || form.name);
		const category = CATEGORIES.includes(form.category) ? form.category : "tops";
		const defaults = categoryDefaults(category);
		const shortname = (form.shortname && form.shortname.trim()) || shortnameFromName(itemId);
		const nameTemplate = (form.nameTemplate && form.nameTemplate.trim()) || ("%color " + shortname);
		const layer = Number(form.layer);
		const covers = Array.isArray(form.covers) && form.covers.length
			? form.covers.slice() : defaults.covers.slice();
		const shops = Array.isArray(form.shops) ? form.shops.filter(Boolean) : [];
		const npcCanWear = form.npcCanWear !== false;
		const pcCanWear = form.pcCanWear !== false;
		let flags = Array.isArray(form.flags) ? form.flags.map(String).filter(Boolean) : [];

		if (!shops.length && !flags.includes("NoShops")) flags.push("NoShops");
		if (!npcCanWear && !flags.includes("pc only")) flags.push("pc only");
		if (!pcCanWear && !flags.includes("npc only")) flags.push("npc only");
		if (Array.isArray(form.clothingFlags))
		{
			for (const f of form.clothingFlags)
				if (f && !flags.includes(f)) flags.push(f);
		}
		// de-dupe chance families: keep last
		flags = normalizeFlagsList(flags);

		const styleFactor = {};
		if (form.styleFactor && typeof form.styleFactor === "object")
		{
			for (const [k, v] of Object.entries(form.styleFactor))
			{
				const n = Number(v);
				if (n) styleFactor[k] = n;
			}
		}
		else
			Object.assign(styleFactor, defaults.styleFactor);

		let styleFactorMods = form.styleFactorMods;
		if (typeof styleFactorMods === "string")
		{
			try { styleFactorMods = JSON.parse(styleFactorMods || "{}"); }
			catch (e) { styleFactorMods = {}; }
		}
		if (!styleFactorMods || typeof styleFactorMods !== "object") styleFactorMods = {};

		let flagsMods = form.flagsMods;
		if (typeof flagsMods === "string")
		{
			try { flagsMods = JSON.parse(flagsMods || "{}"); }
			catch (e) { flagsMods = {}; }
		}
		if (!flagsMods || typeof flagsMods !== "object") flagsMods = {};

		let coversMods = form.coversMods;
		if (typeof coversMods === "string")
		{
			try { coversMods = JSON.parse(coversMods || "{}"); }
			catch (e) { coversMods = {}; }
		}
		if (!coversMods || typeof coversMods !== "object") coversMods = {};

		let configurations = form.configurations;
		if (typeof configurations === "string")
		{
			try { configurations = JSON.parse(configurations || "{}"); }
			catch (e) { configurations = {}; }
		}
		if (!configurations || typeof configurations !== "object") configurations = {};

		const displace = form.displace && typeof form.displace === "object"
			? JSON.parse(JSON.stringify(form.displace))
			: JSON.parse(JSON.stringify(defaults.displace || {}));

		const sheer = Array.isArray(form.sheer) ? form.sheer.slice() : [];
		const skintightException = Array.isArray(form.skintightException)
			? form.skintightException.slice() : [];
		const storage = Array.isArray(form.storage) ? form.storage.slice() : [];
		const dialogueTags = Array.isArray(form.dialogueTags)
			? form.dialogueTags.slice()
			: (defaults.dialogueTags || []).slice();

		return {
			itemId: itemId,
			shortname: shortname,
			nameTemplate: nameTemplate,
			category: category,
			layer: Number.isFinite(layer) && layer > 0 ? layer : defaults.layer,
			covers: covers,
			price: Math.max(0, Number(form.price) || 20),
			descriptionShop: (form.descriptionShop || "").trim()
				|| ("A custom " + shortname + " added via the paperdoll editor."),
			descriptionWardrobe: (form.descriptionWardrobe || "").trim()
				|| ("Your custom " + shortname + "."),
			descriptionThrift: (form.descriptionThrift || "").trim(),
			shops: shops,
			npcCanWear: npcCanWear,
			pcCanWear: pcCanWear,
			flags: flags,
			styles: Array.isArray(form.styles) && form.styles.length
				? form.styles.slice() : defaults.styles.slice(),
			styleFactor: styleFactor,
			styleFactorMods: styleFactorMods,
			flagsMods: flagsMods,
			coversMods: coversMods,
			configurations: configurations,
			displace: displace,
			dialogueTags: dialogueTags,
			storage: storage,
			sheer: sheer,
			skintightException: skintightException,
			useColorSubs: form.useColorSubs !== false,
			useColor2: !!form.useColor2,
			costumeFactor: form.costumeFactor && typeof form.costumeFactor === "object"
				? form.costumeFactor : null,
			createdAt: form.createdAt || Date.now(),
			author: (form.author || "").trim(),
		};
	}

	function normalizeFlagsList(flags)
	{
		const chanceBest = {};
		const other = [];
		const rank = { low: 1, medium: 2, high: 3, certain: 4 };
		for (const f of flags || [])
		{
			const m = String(f).match(/^(.+) chance (low|medium|high|certain)$/);
			if (m)
			{
				const prev = chanceBest[m[1]];
				if (!prev || (rank[m[2]] || 0) > (rank[prev] || 0))
					chanceBest[m[1]] = m[2];
			}
			else if (f && !other.includes(f))
				other.push(f);
		}
		const out = other.slice();
		for (const [family, level] of Object.entries(chanceBest))
			out.push(family + " chance " + level);
		return out;
	}

	function collectFromState(state)
	{
		const list = [];
		const seen = new Set();
		for (const item of (state && state.items) || [])
		{
			if (!item || !item.gameClothing || !item.gameClothing.itemId) continue;
			const def = JSON.parse(JSON.stringify(item.gameClothing));
			if (Array.isArray(item.clothingFlags) && item.clothingFlags.length)
			{
				const flags = (def.flags || []).slice();
				for (const f of item.clothingFlags)
					if (f && !flags.includes(f)) flags.push(f);
				def.flags = normalizeFlagsList(flags);
			}
			if (seen.has(def.itemId)) continue;
			seen.add(def.itemId);
			list.push(def);
		}
		return list;
	}

	function renameGameClothing(def, newId)
	{
		const out = JSON.parse(JSON.stringify(def || {}));
		out.itemId = slugifyItemId(newId);
		if (!out.shortname) out.shortname = shortnameFromName(out.itemId);
		return out;
	}

	function renamePackItem(item, newGameId)
	{
		const next = item; // mutate in place for editor
		const id = slugifyItemId(newGameId);
		next.gameClothing = renameGameClothing(next.gameClothing || {}, id);
		next.cotBindings = [id];
		next.name = id;
		next.id = String(id).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "item";
		return next;
	}

	function jsString(s)
	{
		return JSON.stringify(String(s == null ? "" : s));
	}

	function jsArray(arr)
	{
		return "[" + (arr || []).map((x) => jsString(x)).join(", ") + "]";
	}

	function jsObjectNumbers(obj)
	{
		const parts = [];
		for (const [k, v] of Object.entries(obj || {}))
		{
			const n = Number(v);
			if (n) parts.push(jsString(k) + ": " + n);
		}
		return "{" + parts.join(", ") + "}";
	}

	function jsObjectNested(obj)
	{
		// JSON is valid JS for plain objects/arrays/strings/numbers
		return JSON.stringify(obj || {});
	}

	function emitClothesEntryJs(def)
	{
		const lines = [];
		lines.push("  " + jsString(def.itemId) + ": {");
		lines.push("    name: " + jsString(def.nameTemplate) + ",");
		lines.push("    shortname: " + jsString(def.shortname) + ",");
		lines.push("    \"description shop\": " + jsString(def.descriptionShop) + ",");
		lines.push("    \"description wardrobe\": " + jsString(def.descriptionWardrobe) + ",");
		if (def.descriptionThrift)
			lines.push("    \"description thrift\": " + jsString(def.descriptionThrift) + ",");
		if (def.useColorSubs !== false)
			lines.push("    \"sub color\": setup.clothes_advanced_cloth_colors,");
		if (def.useColor2)
			lines.push("    \"sub color2\": setup.clothes_standard_cloth_colors,");
		if (def.styles && def.styles.length)
			lines.push("    \"sub style\": " + jsArray(def.styles) + ",");
		lines.push("    covers: " + jsArray(def.covers) + ",");
		lines.push("    category: " + jsString(def.category) + ",");
		lines.push("    layer: " + Number(def.layer || 20) + ",");
		lines.push("    flags: " + jsArray(def.flags || []) + ",");
		if (def.dialogueTags && def.dialogueTags.length)
			lines.push("    \"dialogue tags\": " + jsArray(def.dialogueTags) + ",");
		if (def.storage && def.storage.length)
			lines.push("    storage: " + jsArray(def.storage) + ",");
		if (def.sheer && def.sheer.length)
			lines.push("    sheer: " + jsArray(def.sheer) + ",");
		if (def.skintightException && def.skintightException.length)
			lines.push("    \"skintight exception\": " + jsArray(def.skintightException) + ",");
		if (def.styleFactor && Object.keys(def.styleFactor).length)
			lines.push("    \"style factor\": " + jsObjectNumbers(def.styleFactor) + ",");
		if (def.styleFactorMods && Object.keys(def.styleFactorMods).length)
			lines.push("    \"style factor mods\": " + jsObjectNested(def.styleFactorMods) + ",");
		if (def.flagsMods && Object.keys(def.flagsMods).length)
			lines.push("    \"flags mods\": " + jsObjectNested(def.flagsMods) + ",");
		if (def.coversMods && Object.keys(def.coversMods).length)
			lines.push("    \"covers mods\": " + jsObjectNested(def.coversMods) + ",");
		if (def.configurations && Object.keys(def.configurations).length)
			lines.push("    configurations: " + jsObjectNested(def.configurations) + ",");
		if (def.costumeFactor && Object.keys(def.costumeFactor).length)
			lines.push("    \"costume factor\": " + jsObjectNested(def.costumeFactor) + ",");
		for (const [verb, parts] of Object.entries(def.displace || {}))
		{
			if (!parts || !parts.length) continue;
			const key = "displace " + String(verb);
			lines.push("    " + jsString(key) + ": " + jsArray(parts) + ",");
		}
		lines.push("    price: " + Number(def.price || 0));
		lines.push("  }");
		return lines.join("\n");
	}

	function buildInjectionScript(defs)
	{
		const entries = (defs || []).map(emitClothesEntryJs).join(",\n");
		const shopMap = {};
		for (const def of defs || [])
		{
			for (const shop of def.shops || [])
			{
				if (!shopMap[shop]) shopMap[shop] = [];
				shopMap[shop].push({ label: def.itemId, type: "clothes", item: def.itemId });
			}
		}
		return [
			MARKER_START,
			"(function () {",
			"  if (typeof setup === \"undefined\") return;",
			"  setup.clothes = setup.clothes || {};",
			"  var CUSTOM = {",
			entries,
			"  };",
			"  for (var id in CUSTOM) {",
			"    if (Object.prototype.hasOwnProperty.call(CUSTOM, id))",
			"      setup.clothes[id] = CUSTOM[id];",
			"  }",
			"  var shopAdds = " + JSON.stringify(shopMap) + ";",
			"  function ensureShopItem(shopName, row) {",
			"    if (!setup.Shops || !setup.Shops.db) return;",
			"    var shop = setup.Shops.db[shopName];",
			"    if (!shop || !Array.isArray(shop.items)) return;",
			"    shop.items = shop.items.filter(function (it) {",
			"      return !(it && it.type === \"clothes\" && it.item === row.item);",
			"    });",
			"    shop.items.push(row);",
			"  }",
			"  for (var shopName in shopAdds) {",
			"    if (!Object.prototype.hasOwnProperty.call(shopAdds, shopName)) continue;",
			"    var rows = shopAdds[shopName];",
			"    for (var i = 0; i < rows.length; i++) ensureShopItem(shopName, rows[i]);",
			"  }",
			"  setup.ExhibitionCustomClothes = CUSTOM;",
			"})();",
			MARKER_END,
		].join("\n");
	}

	function injectIntoHtml(htmlText, defs)
	{
		if (!htmlText) return htmlText;
		const script = buildInjectionScript(defs || []);
		const start = htmlText.indexOf(MARKER_START);
		const end = htmlText.indexOf(MARKER_END);
		if (start >= 0 && end > start)
		{
			return htmlText.slice(0, start) + script + htmlText.slice(end + MARKER_END.length);
		}
		const bodyClose = htmlText.lastIndexOf("</body>");
		if (bodyClose >= 0)
		{
			return htmlText.slice(0, bodyClose)
				+ "\n<script>\n" + script + "\n</script>\n"
				+ htmlText.slice(bodyClose);
		}
		return htmlText + "\n<script>\n" + script + "\n</script>\n";
	}

	function catalogRowsFromDefs(defs)
	{
		return (defs || []).map((def) => ({
			id: def.itemId,
			name: def.nameTemplate || def.itemId,
			shortname: def.shortname || "",
			category: def.category || "tops",
			custom: true,
		}));
	}

	/** Detect import conflicts against current pack items + clothing catalog. */
	function findImportConflicts(incomingItems, currentItems, clothingCatalog)
	{
		const conflicts = [];
		const currentByBinding = new Map();
		const currentById = new Map();
		for (const it of currentItems || [])
		{
			if (!it) continue;
			currentById.set(it.id, it);
			const binding = (it.cotBindings && it.cotBindings[0])
				|| (it.gameClothing && it.gameClothing.itemId) || "";
			if (binding) currentByBinding.set(binding, it);
		}
		const catalogById = new Map();
		for (const row of clothingCatalog || [])
			if (row && row.id) catalogById.set(row.id, row);

		function itemHasArt(item)
		{
			if (!item || !item.poses) return false;
			return Object.values(item.poses).some((p) =>
				p && p.sources && Object.keys(p.sources).length);
		}

		(incomingItems || []).forEach((inc, index) =>
		{
			if (!inc) return;
			const binding = (inc.cotBindings && inc.cotBindings[0])
				|| (inc.gameClothing && inc.gameClothing.itemId)
				|| inc.id;
			const existingPack = currentByBinding.get(binding) || currentById.get(inc.id);
			const catalogRow = catalogById.get(binding);
			const reasons = [];
			if (existingPack)
			{
				reasons.push(itemHasArt(existingPack)
					? "Pack already has a layer with art for this piece"
					: "Pack already has a layer for this piece");
			}
			if (catalogRow)
			{
				reasons.push(catalogRow.custom
					? "Custom clothing id already installed/known"
					: "Vanilla (or existing) game clothing uses this name");
			}
			if (!reasons.length) return;
			conflicts.push({
				index: index,
				binding: binding,
				reasons: reasons,
				incoming: inc,
				existing: existingPack || null,
				catalog: catalogRow || null,
				incomingGame: (inc.gameClothing && inc.gameClothing.itemId)
					? inc.gameClothing : null,
				existingGame: (existingPack && existingPack.gameClothing)
					? existingPack.gameClothing
					: (catalogRow ? { itemId: catalogRow.id, shortname: catalogRow.shortname, nameTemplate: catalogRow.name, category: catalogRow.category } : null),
			});
		});
		return conflicts;
	}

	window.ExhibitionCustomClothing = {
		CATEGORIES: CATEGORIES,
		STYLE_KEYS: STYLE_KEYS,
		COMMON_SUB_STYLES: COMMON_SUB_STYLES,
		DISPLACE_VERBS: DISPLACE_VERBS,
		DIALOGUE_TAG_OPTIONS: DIALOGUE_TAG_OPTIONS,
		STORAGE_OPTIONS: STORAGE_OPTIONS,
		BOOLEAN_FLAG_OPTIONS: BOOLEAN_FLAG_OPTIONS,
		CATEGORY_DEFAULTS: CATEGORY_DEFAULTS,
		COVER_OPTIONS: COVER_OPTIONS,
		CLOTHING_SHOPS: CLOTHING_SHOPS,
		MARKER_START: MARKER_START,
		MARKER_END: MARKER_END,
		slugifyItemId: slugifyItemId,
		shortnameFromName: shortnameFromName,
		categoryDefaults: categoryDefaults,
		paperdollZFromLayer: paperdollZFromLayer,
		buildGameClothingFromForm: buildGameClothingFromForm,
		collectFromState: collectFromState,
		renameGameClothing: renameGameClothing,
		renamePackItem: renamePackItem,
		buildInjectionScript: buildInjectionScript,
		injectIntoHtml: injectIntoHtml,
		catalogRowsFromDefs: catalogRowsFromDefs,
		findImportConflicts: findImportConflicts,
		normalizeFlagsList: normalizeFlagsList,
	};
})();
