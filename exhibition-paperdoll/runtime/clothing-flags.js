/* Exhibition paperdoll — clothing wardrobe flags from pack items (underboob, sideboob, …) */
(function()
{
	"use strict";
	setup.ExhibitionPaperdoll = setup.ExhibitionPaperdoll || {};
	const EP = setup.ExhibitionPaperdoll;

	/**
	 * Exposure / wardrobe-malfunction flags from setup.clothes_flags (game).
	 * Chance families use exclusive levels low → certain ("always").
	 * Boolean flags are on/off.
	 */
	EP.CLOTHING_FLAG_GROUPS = [
		{
			id: "underboob",
			label: "Underboob",
			kind: "chance",
			hint: "Crop tops, short hems — use certain when the cut always shows underboob.",
		},
		{
			id: "sideboob",
			label: "Sideboob",
			kind: "chance",
			hint: "Sleeveless / strappy sides.",
		},
		{
			id: "underbutt",
			label: "Underbutt",
			kind: "chance",
			levels: ["low", "medium", "high"],
			hint: "Cheeky shorts / hiked hems.",
		},
		{
			id: "buttcrack",
			label: "Buttcrack / butt cleavage",
			kind: "chance",
			levels: ["low", "medium", "high"],
			hint: "Low-rise or thong-cut rear.",
		},
		{
			id: "cameltoe",
			label: "Cameltoe",
			kind: "chance",
			hint: "Skintight crotch cling.",
		},
		{
			id: "downblouse",
			label: "Downblouse",
			kind: "chance",
			hint: "Loose neckline from above.",
		},
		{
			id: "nipslip",
			label: "Nip slip",
			kind: "chance",
			hint: "Loose / stretch neckline risk.",
		},
		{
			id: "upshorts",
			label: "Upshorts / upskirt",
			kind: "chance",
			hint: "Short skirts and dresses.",
		},
		{
			id: "shirtbust",
			label: "Shirtbust",
			kind: "chance",
			levels: ["low", "medium", "high"],
			hint: "Buttons gap / tight shirt strain.",
		},
		{
			id: "ass exposure",
			label: "Ass exposure",
			kind: "chance",
			levels: ["low", "medium", "high"],
			hint: "General rear exposure risk.",
		},
		{
			id: "flip",
			label: "Skirt flip",
			kind: "chance",
			hint: "Wind / flip chance for skirts.",
		},
		{
			id: "cleavage",
			label: "Cleavage",
			kind: "boolean",
			hint: "Neckline always shows cleavage (style flag, not a chance).",
		},
		{
			id: "shows nipples",
			label: "Shows nipples",
			kind: "boolean",
			hint: "Fabric thin enough that nipples show.",
		},
		{
			id: "skintight",
			label: "Skintight",
			kind: "boolean",
		},
		{
			id: "short skirt",
			label: "Short skirt",
			kind: "boolean",
		},
		{
			id: "daring",
			label: "Daring",
			kind: "boolean",
		},
	];

	EP.FLAG_LEVELS = ["low", "medium", "high", "certain"];
	EP.FLAG_LEVEL_RANK = { low: 1, medium: 2, high: 3, certain: 4 };

	EP.clothingFlagGroup = function(groupId)
	{
		for (const g of EP.CLOTHING_FLAG_GROUPS)
		{
			if (g.id === groupId) return g;
		}
		return null;
	};

	EP.chanceFlagName = function(family, level)
	{
		return family + " chance " + level;
	};

	EP.parseChanceFlag = function(flag)
	{
		if (!flag || typeof flag !== "string") return null;
		const m = flag.match(/^(.+) chance (low|medium|high|certain)$/);
		if (!m) return null;
		return { family: m[1], level: m[2] };
	};

	EP.levelsForGroup = function(group)
	{
		if (!group || group.kind !== "chance") return [];
		return group.levels || EP.FLAG_LEVELS.slice();
	};

	/** Normalize stored list: one level per chance family; unique booleans. */
	EP.normalizeClothingFlags = function(flags)
	{
		const list = Array.isArray(flags) ? flags.map(String) : [];
		const chanceBest = {};
		const booleans = new Set();
		for (const f of list)
		{
			const parsed = EP.parseChanceFlag(f);
			if (parsed)
			{
				const rank = EP.FLAG_LEVEL_RANK[parsed.level] || 0;
				const prev = chanceBest[parsed.family];
				if (!prev || rank > (EP.FLAG_LEVEL_RANK[prev] || 0))
					chanceBest[parsed.family] = parsed.level;
			}
			else if (f)
				booleans.add(f);
		}
		const out = [];
		for (const [family, level] of Object.entries(chanceBest))
			out.push(EP.chanceFlagName(family, level));
		for (const b of booleans)
			out.push(b);
		out.sort();
		return out;
	};

	EP.mergeFlagLists = function(baseFlags, extraFlags)
	{
		return EP.normalizeClothingFlags([].concat(baseFlags || [], extraFlags || []));
	};

	EP.packFlagsForClothing = function(clothingId)
	{
		if (!clothingId) return [];
		const mods = EP._mods || [];
		const out = [];
		for (const mod of mods)
		{
			if (!mod || !Array.isArray(mod.items)) continue;
			for (const item of mod.items)
			{
				if (!item || !Array.isArray(item.cotBindings)) continue;
				if (!item.cotBindings.includes(clothingId)) continue;
				if (Array.isArray(item.clothingFlags) && item.clothingFlags.length)
					out.push.apply(out, item.clothingFlags);
			}
		}
		return EP.normalizeClothingFlags(out);
	};

	EP.mergePackClothingFlags = function(baseFlags, cItem)
	{
		if (!cItem) return baseFlags || [];
		let clothingId = null;
		if (typeof cItem.get_item === "function") clothingId = cItem.get_item();
		else if (cItem.item) clothingId = cItem.item;
		const extra = EP.packFlagsForClothing(clothingId);
		if (!extra.length) return baseFlags || [];
		return EP.mergeFlagLists(baseFlags || [], extra);
	};

	/** Patch ExhibitionAdjustment.merge_flags so pack flags apply to will_underboob / get_clothing_flags. */
	EP._installClothingFlagHooks = function()
	{
		if (EP._clothingFlagHooksInstalled) return;
		const EA = setup.ExhibitionAdjustment;
		if (!EA || typeof EA.merge_flags !== "function") return;
		const orig = EA.merge_flags.bind(EA);
		EA.merge_flags = function(baseFlags, cItem)
		{
			let flags = orig(baseFlags, cItem);
			flags = EP.mergePackClothingFlags(flags, cItem);
			return flags;
		};
		EP._clothingFlagHooksInstalled = true;
	};

	// Retry install — ExhibitionAdjustment may load after this script
	EP._installClothingFlagHooks();
	if (!EP._clothingFlagHooksInstalled && typeof document !== "undefined")
	{
		const tryInstall = function()
		{
			EP._installClothingFlagHooks();
			if (!EP._clothingFlagHooksInstalled)
				setTimeout(tryInstall, 250);
		};
		setTimeout(tryInstall, 0);
	}
})();
