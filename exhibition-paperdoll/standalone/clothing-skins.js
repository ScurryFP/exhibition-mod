/* Clothing skins — graphic/design variants bound to game sub design/print/text/team */
(function()
{
	"use strict";

	const STANDARD_GRAPHICS_MARKER = "setup.clothes_standard_graphics";
	const SUB_FIELDS = ["sub design", "sub print", "sub team", "sub text"];

	function parseStandardGraphics(text)
	{
		const m = String(text || "").match(/setup\.clothes_standard_graphics\s*=\s*\[([\s\S]*?)\];/);
		if (!m) return [];
		return Array.from(String(m[1]).matchAll(/"((?:\\.|[^"\\])*)"/g)).map((x) =>
			x[1].replace(/\\"/g, "\"").replace(/\\\\/g, "\\"));
	}

	function extractClothesBlock(text)
	{
		const marker = "setup.clothes = {";
		const start = text.indexOf(marker);
		if (start < 0) return null;
		const brace = text.indexOf("{", start);
		if (brace < 0) return null;
		let depth = 0;
		for (let i = brace; i < text.length; i++)
		{
			if (text[i] === "{") depth++;
			else if (text[i] === "}")
			{
				depth--;
				if (depth === 0) return text.slice(brace, i + 1);
			}
		}
		return null;
	}

	function parseArrayValues(arrText, standardGraphics)
	{
		const vals = Array.from(String(arrText || "").matchAll(/"((?:\\.|[^"\\])*)"/g)).map((x) =>
			x[1].replace(/\\"/g, "\"").replace(/\\\\/g, "\\"));
		const usesStandard = arrText.indexOf("clothes_standard_graphics") >= 0
			|| arrText.indexOf(STANDARD_GRAPHICS_MARKER) >= 0;
		if (!usesStandard) return vals;
		const extra = vals.filter((v) => standardGraphics.indexOf(v) < 0);
		return standardGraphics.concat(extra);
	}

	/**
	 * Parse clothing items that have design-like subs from game HTML.
	 * Returns { standard_graphics, items: [{ id, category, subs: { design: [...], print: [...] } }] }
	 */
	function parseClothingDesignsFromHtml(text)
	{
		const standard_graphics = parseStandardGraphics(text);
		const block = extractClothesBlock(text);
		if (!block) return { standard_graphics: standard_graphics, items: [] };
		const items = [];
		let i = 0;
		while (i < block.length)
		{
			const rest = block.slice(i);
			const m = rest.match(/\n    "((?:\\.|[^"\\])*)"\s*:\s*\{/);
			if (!m) break;
			const name = m[1].replace(/\\"/g, "\"").replace(/\\\\/g, "\\");
			const itemStart = i + m.index + m[0].length - 1;
			let depth = 0;
			let end = -1;
			for (let j = itemStart; j < block.length && j < itemStart + 20000; j++)
			{
				if (block[j] === "{") depth++;
				else if (block[j] === "}")
				{
					depth--;
					if (depth === 0) { end = j + 1; break; }
				}
			}
			if (end < 0) break;
			const body = block.slice(itemStart, end);
			i = end;
			const subs = {};
			for (let f = 0; f < SUB_FIELDS.length; f++)
			{
				const field = SUB_FIELDS[f];
				const fm = body.match(new RegExp("\"" + field.replace(/ /g, "\\ ") + "\"\\s*:\\s*"));
				if (!fm) continue;
				const after = body.slice(fm.index + fm[0].length).replace(/^\s+/, "");
				let vals = [];
				if (after.charAt(0) === "[")
				{
					let d = 0;
					let arrEnd = -1;
					for (let k = 0; k < after.length; k++)
					{
						if (after[k] === "[") d++;
						else if (after[k] === "]")
						{
							d--;
							if (d === 0) { arrEnd = k + 1; break; }
						}
					}
					if (arrEnd > 0)
						vals = parseArrayValues(after.slice(0, arrEnd), standard_graphics);
				}
				else if (after.indexOf("clothes_standard_graphics") >= 0)
					vals = standard_graphics.slice();
				if (vals.length)
					subs[field.replace(/^sub /, "")] = vals;
			}
			if (!Object.keys(subs).length) continue;
			const cat = (body.match(/"category"\s*:\s*"([^"]+)"/) || [])[1] || "tops";
			items.push({ id: name, category: cat, subs: subs });
		}
		items.sort((a, b) => a.id.localeCompare(b.id));
		return { standard_graphics: standard_graphics, items: items };
	}

	function designSlug(text)
	{
		return String(text || "design")
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "")
			.slice(0, 48) || "design";
	}

	/** Worn clothing's chosen sub value for a key (design/print/team/text). */
	function wornSubValue(cItem, wornEntry, subKey)
	{
		subKey = subKey || "design";
		const subs = (cItem && (cItem.subs || (typeof cItem.get_subs === "function" && cItem.get_subs())))
			|| (wornEntry && wornEntry.subs)
			|| {};
		if (subs[subKey] != null && subs[subKey] !== "") return String(subs[subKey]);
		// fall back: any design-like key present
		for (const k of ["design", "print", "team", "text"])
		{
			if (subs[k] != null && subs[k] !== "") return String(subs[k]);
		}
		return "";
	}

	/**
	 * Whether a pack skin item should draw for this worn clothing.
	 * skinSubValue empty / _default = base art (used when no design-specific skin matches).
	 */
	function isBaseSkin(item)
	{
		const v = item && item.skinSubValue;
		return v == null || v === "" || v === "_default";
	}

	function packItemBindsClothing(item, clothingId)
	{
		return !!(item && item.cotBindings && item.cotBindings.includes(clothingId));
	}

	/**
	 * Select pack clothing layers for a worn item: design-specific skins win over base skins.
	 * Match is on skinSubValue text (must equal shop sub design/print/team/text when worn).
	 */
	function filterSkinsForWorn(packItems, clothingId, wornDesign)
	{
		const bound = (packItems || []).filter((it) => packItemBindsClothing(it, clothingId));
		if (!bound.length) return [];
		const design = wornDesign || "";
		if (design)
		{
			const specific = bound.filter((it) =>
				!isBaseSkin(it) && String(it.skinSubValue) === design);
			if (specific.length) return specific;
		}
		// No design-specific art — use base skins only
		return bound.filter(isBaseSkin);
	}

	window.ExhibitionClothingSkins = {
		parseClothingDesignsFromHtml: parseClothingDesignsFromHtml,
		parseStandardGraphics: parseStandardGraphics,
		designSlug: designSlug,
		wornSubValue: wornSubValue,
		isBaseSkin: isBaseSkin,
		filterSkinsForWorn: filterSkinsForWorn,
		SUB_FIELDS: SUB_FIELDS,
	};
})();
