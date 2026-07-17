// Sidebar clothing status: compact exposure chips (all locations).
// Appended to setup.ExhibitionAdjustment in the appearance-dev HTML build.
// Chip wording is loaded from sidebar-chip-labels.txt at rebake time.

(function()
{
	const EA = setup.ExhibitionAdjustment;
	if (!EA || EA._sidebarStatusPatched) return;

	/* INJECT_SIDEBAR_CHIP_LABELS */

	EA.SIDEBAR_ADJ_PART = {
		areola_show: "areola",
		nipple_slip: "nipple",
		tighten_bottom: "camel_toe",
		hike_skirt: "underbutt",
		tie_top: "underboob",
		loosen_neck: "cleavage",
		side_gap: "sideboob",
		bare_midriff: "underboob",
		open_outer: "cleavage",
		dress_daring: "cleavage",
		underwear_peek: "underbutt",
		swim_adjust: "sideboob",
	};

	EA.SIDEBAR_FLAG_PART = {
		cameltoe: "camel_toe",
		nipslip: "nipple",
		downblouse: "cleavage",
		upshorts: "underbutt",
		sideboob: "sideboob",
		underboob: "underboob",
		underbutt: "underbutt",
	};

	EA._sidebar_adj_part = function(tmpl, type)
	{
		if (this.SIDEBAR_ADJ_PART[type]) return this.SIDEBAR_ADJ_PART[type];
		if (tmpl && tmpl.flag && this.SIDEBAR_FLAG_PART[tmpl.flag])
			return this.SIDEBAR_FLAG_PART[tmpl.flag];
		return null;
	};

	EA.sidebar_score_to_level = function(score)
	{
		if (score >= 9) return 5;
		if (score >= 8) return 4;
		if (score >= 6) return 3;
		if (score >= 5) return 2;
		if (score >= 4) return 1;
		return 0;
	};

	EA.sidebar_steps_to_score = function(person, cItem, type, steps, tmpl)
	{
		const flag = this.steps_to_flag(steps, tmpl);
		if (flag === "certain") return 9.5;
		if (flag === "high") return 8;
		if (flag === "medium") return 6.5;
		if (flag === "low") return 5;
		const partial = tmpl.partialSteps != null ? tmpl.partialSteps : 2;
		const maxS = this.item_max_steps(person, cItem, tmpl) || 1;
		if (steps <= partial)
			return 4 + (steps / Math.max(1, partial)) * 0.9;
		return 5.5 + ((steps - partial) / Math.max(1, maxS - partial)) * 2.5;
	};

	EA.sidebar_label_for_level = function(part, level)
	{
		const labels = this.SIDEBAR_CHIP_LABELS && this.SIDEBAR_CHIP_LABELS[part];
		if (!labels || !level) return null;
		if (labels[level]) return labels[level];
		for (let l = level; l >= 1; l--)
		{
			if (labels[l]) return labels[l];
		}
		for (let l = level + 1; l <= 5; l++)
		{
			if (labels[l]) return labels[l];
		}
		return null;
	};

	EA.sidebar_areola_color = function(person)
	{
		if (!person) return "beige";
		return person["areola color"] || "beige";
	};

	EA.sidebar_label_tokens = function(person)
	{
		const color = this.sidebar_areola_color(person);
		return {
			color,
			Color: setup.capitalize_each ? setup.capitalize_each(color) : color,
		};
	};

	EA.sidebar_resolve_label = function(person, part, template)
	{
		if (!template) return null;
		if (template.indexOf("{") === -1) return template;
		const tokens = this.sidebar_label_tokens(person);
		return template.replace(/\{([A-Za-z]+)\}/g, (match, key) => {
			if (Object.prototype.hasOwnProperty.call(tokens, key))
				return tokens[key];
			return match;
		});
	};

	EA.sidebar_part_chip_label = function(person, part, score)
	{
		const level = this.sidebar_score_to_level(score);
		const template = this.sidebar_label_for_level(part, level);
		return this.sidebar_resolve_label(person, part, template);
	};

	EA.SIDEBAR_TIER_META = {
		subtle: { label: "minimal show", title: "Minimal / no malfunction flag" },
		low: { label: "low chance", title: "Low exposure chance" },
		medium: { label: "medium chance", title: "Medium exposure chance" },
		high: { label: "high chance", title: "High exposure chance" },
		certain: { label: "certain", title: "Certain exposure chance" },
		exposed: { label: "exposed now", title: "Bare or visibly exposed" },
	};

	EA.sidebar_part_is_exposed_now = function(person, part)
	{
		if (!person) return false;
		const bare = (p) => {
			try
			{
				return person.has_part && person.has_part(p) && person.is_part_covered && !person.is_part_covered(p);
			}
			catch (e)
			{
				return false;
			}
		};
		const vis = (p) => {
			try
			{
				return person.has_part && person.has_part(p) && person.is_part_visible && person.is_part_visible(p);
			}
			catch (e)
			{
				return false;
			}
		};
		switch (part)
		{
			case "nipple":
			case "areola":
				return vis("nipples") || bare("nipples");
			case "cleavage":
			case "sideboob":
			case "underboob":
				return vis("breasts") || bare("breasts");
			case "camel_toe":
				return vis("vagina") || vis("penis") || vis("clitoris") || bare("vagina") || bare("penis");
			case "bulge":
				return vis("penis") || bare("penis");
			case "underbutt":
			case "butt_crack":
			case "ass_cheeks":
				return vis("butt") || vis("anus") || bare("butt");
			default:
				return false;
		}
	};

	EA.sidebar_best_adj_flag_for_part = function(person, part)
	{
		if (!person) return null;
		const rank = { low: 1, medium: 2, high: 3, certain: 4 };
		let best = null;
		let bestRank = 0;
		for (const cItem of person.get_clothingItems_classes())
		{
			for (const [type, data] of Object.entries(this._get_adjustments(cItem)))
			{
				const steps = data.steps != null ? data.steps : 0;
				if (steps <= 0) continue;
				const tmpl = this.TEMPLATES[type];
				if (!tmpl) continue;
				if (this._sidebar_adj_part(tmpl, type) !== part) continue;
				const flag = this.steps_to_flag(steps, tmpl);
				if (!flag || (rank[flag] || 0) <= bestRank) continue;
				best = flag;
				bestRank = rank[flag];
			}
		}
		return best;
	};

	EA.sidebar_chip_tier = function(person, part, score)
	{
		try
		{
			if (this.sidebar_part_is_exposed_now(person, part)) return "exposed";
			const flag = this.sidebar_best_adj_flag_for_part(person, part);
			if (flag === "certain") return "certain";
			if (flag === "high") return "high";
			if (flag === "medium") return "medium";
			if (flag === "low") return "low";
		}
		catch (e) { /* fall through to score-based tier */ }
		const level = this.sidebar_score_to_level(score);
		if (level >= 5) return "certain";
		if (level >= 4) return "high";
		if (level >= 3) return "medium";
		if (level >= 2) return "low";
		return "subtle";
	};

	EA.sidebar_exposure_scores = function(person)
	{
		if (!person) return {};
		const scores = {};

		const setScore = (part, score) => {
			if (!part || score < 4) return;
			scores[part] = Math.max(scores[part] || 0, score);
		};

		for (const cItem of person.get_clothingItems_classes())
		{
			for (const [type, data] of Object.entries(this._get_adjustments(cItem)))
			{
				const steps = data.steps != null ? data.steps : 0;
				if (steps <= 0) continue;
				const tmpl = this.TEMPLATES[type];
				if (!tmpl) continue;
				const part = this._sidebar_adj_part(tmpl, type);
				if (!part) continue;
				setScore(part, this.sidebar_steps_to_score(person, cItem, type, steps, tmpl));
			}
		}

		if (setup.BodyExposure)
		{
			for (const entry of setup.BodyExposure.noticeable_parts(person, 4))
				setScore(entry.part, entry.score || 0);
		}

		return scores;
	};

	EA.sidebar_exposure_chips = function(person)
	{
		const scores = this.sidebar_exposure_scores(person);
		const chips = [];
		const order = ["camel_toe", "nipple", "areola", "bulge", "cleavage", "sideboob", "underboob", "underbutt", "butt_crack", "ass_cheeks"];
		const seen = new Set();

		for (const part of order)
		{
			if (seen.has(part) || scores[part] == null) continue;
			const label = this.sidebar_part_chip_label(person, part, scores[part]);
			if (!label) continue;
			seen.add(part);
			chips.push({
				part,
				label,
				score: scores[part],
				tier: this.sidebar_chip_tier(person, part, scores[part]),
			});
		}
		for (const part of Object.keys(scores))
		{
			if (seen.has(part)) continue;
			const label = this.sidebar_part_chip_label(person, part, scores[part]);
			if (!label) continue;
			chips.push({
				part,
				label,
				score: scores[part],
				tier: this.sidebar_chip_tier(person, part, scores[part]),
			});
		}
		chips.sort((a, b) => b.score - a.score);
		return chips;
	};

	EA.format_clothing_status_exposure = function(person)
	{
		try
		{
			const chips = this.sidebar_exposure_chips(person);
			if (!chips.length) return "";

			const html = chips.map(c => {
				const tier = c.tier || "subtle";
				const meta = this.SIDEBAR_TIER_META[tier] || {};
				const title = (c.part.replace(/_/g, " ") + " · " + (meta.title || tier)).replace(/"/g, "&quot;");
				return '<span class="clothing-exposure-chip chip-tier-' + tier + '" title="' + title + '">' + c.label + "</span>";
			}).join("");
			return '<span class="clothing-exposure-chips">' + html + "</span>";
		}
		catch (e)
		{
			console.warn("[Exhibition Sidebar] format_clothing_status_exposure failed:", e);
			return "";
		}
	};

	EA._sidebarStatusPatched = true;
})();