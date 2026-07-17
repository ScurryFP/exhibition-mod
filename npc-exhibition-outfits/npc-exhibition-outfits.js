// Gate NPC swimwear (and exhibitionist outfit picks) by cached Exhibitionism level at
// first outfit build — no per-tick exhibition/displacement sim for crowd NPCs.
setup.NpcExhibition = {
	_preset_tier_cache: {},

	preset_max_tier(preset)
	{
		if (preset in this._preset_tier_cache)
			return this._preset_tier_cache[preset];

		let maxTier = 0;
		const info = setup.outfits && setup.outfits[preset];
		if (info && info.items)
		{
			const tiers = setup.SwimwearExhibition.item_tiers;
			for (const entry of info.items)
			{
				const item = entry.item;
				if (item && tiers[item] != null)
					maxTier = Math.max(maxTier, tiers[item]);
			}
		}
		this._preset_tier_cache[preset] = maxTier;
		return maxTier;
	},

	// One-time cache: archetype Exhibitionism + inclination floor (not live skill gains).
	ensure_clothing_exhib_level(name)
	{
		const pdata = setup.people.get_person(name);
		if (!pdata) return 0;
		if (pdata.clothing_exhib_level != null)
			return pdata.clothing_exhib_level;

		let level = setup.people.skill_level(name, "Exhibitionism");
		if (setup.people.has_inclination(name, "Proud Exhibitionist"))
			level = Math.max(level, 6);
		else if (setup.people.has_any_inclination(name, setup.archetypes.inclination_sets.basic_exhibitionist))
			level = Math.max(level, 4);
		if (setup.people.has_inclination(name, "Slut"))
			level = Math.max(level, 5);

		pdata.clothing_exhib_level = Math.max(0, Math.min(10, level));
		return pdata.clothing_exhib_level;
	},

	exhibition_level(person)
	{
		if (!person || person.is_pc) return person ? person.skill_level("Exhibitionism") : 0;
		const name = person.person || person.name;
		if (!name || person.temporary) return setup.people.skill_level(person, "Exhibitionism");
		return this.ensure_clothing_exhib_level(name);
	},

	_dress_codes_for_passage(passage)
	{
		try
		{
			const tags = Story.get(passage)?.tags || [];
			return tags.filter(t => t.startsWith("dc"));
		}
		catch (error)
		{
			return [];
		}
	},

	max_swimwear_tier(person, passage, loc, locblock)
	{
		const SW = setup.SwimwearExhibition;
		if (!SW) return 6;

		passage = passage || SW.effective_passage(loc);
		loc = loc || (typeof V !== "undefined" ? V.location : null);
		locblock = locblock || (typeof V !== "undefined" ? V.locationblock : null);
		const dress_codes = this._dress_codes_for_passage(passage);
		const ctx = SW.get_location_context(person, passage, loc, locblock, dress_codes);
		const exhib = this.exhibition_level(person);

		for (let tier = 6; tier >= 0; tier--)
		{
			let req = SW.tier_to_base_requirement(tier) + ctx.exhib_mod;
			if (setup.petitions && setup.petitions.is_finished("CampusSwimwear") &&
				dress_codes.includesAny(["dcCampusOutside", "dcCampusInside", "dcCampusWorkout", "dcDorm", "dcPool"]))
				req -= 2;
			req = Math.max(0, Math.min(SW.MAX, req));
			if (exhib >= req) return tier;
		}
		return 0;
	},

	filter_swimwear_pool(person, outfitrelfreq, passage, loc, locblock)
	{
		if (!outfitrelfreq || outfitrelfreq.length < 2) return outfitrelfreq;

		const maxTier = this.max_swimwear_tier(person, passage, loc, locblock);
		const filtered = [];
		for (let i = 0; i < outfitrelfreq.length; i += 2)
		{
			const preset = outfitrelfreq[i];
			const weight = outfitrelfreq[i + 1];
			if (this.preset_max_tier(preset) <= maxTier)
				filtered.push(preset, weight);
		}
		return filtered.length >= 2 ? filtered : outfitrelfreq;
	},

	pick_swimwear_outfit(person, outfitrelfreq, exhib, rng, passage, loc, locblock)
	{
		const pool = this.filter_swimwear_pool(person, outfitrelfreq, passage, loc, locblock);
		if (!exhib) return rng.randomrelfreq(pool);

		const maxTier = this.max_swimwear_tier(person, passage, loc, locblock);
		const bold = [];
		for (let i = 0; i < pool.length; i += 2)
		{
			const preset = pool[i];
			const tier = this.preset_max_tier(preset);
			if (tier >= 2 && tier <= maxTier)
				bold.push(preset, pool[i + 1] * (tier >= 3 ? 3 : 1));
		}
		return rng.randomrelfreq(bold.length >= 2 ? bold : pool);
	},

	clamp_built_swimwear(person, clothes, passage, loc, locblock)
	{
		const SW = setup.SwimwearExhibition;
		if (!SW || !clothes || !clothes.length) return clothes;

		const maxTier = this.max_swimwear_tier(person, passage, loc, locblock);
		const kept = [];
		for (const piece of clothes)
		{
			const arch = person.clothing_archetype ? person.clothing_archetype(piece) : new ClothingItem(piece).get_current_archetype();
			if (arch.category !== "swimwear")
			{
				kept.push(piece);
				continue;
			}
			if (SW.get_item_tier(person, piece) <= maxTier)
				kept.push(piece);
		}
		return kept.length ? kept : clothes;
	},
};