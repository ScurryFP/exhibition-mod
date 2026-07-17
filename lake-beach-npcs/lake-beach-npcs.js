/* === University Lake Beach NPC activities === */
setup.LakeBeach = {
	LOCATION: "UniversityLakeBeach",
	MAX_CROWD: 30,
	DAY_ACTIVITIES: ["tanning", "swimming", "volleyball", "badminton", "frisbee", "football"],
	NIGHT_ACTIVITIES: ["skinnydipping"],

	is_daytime(hour = V.hour)
	{
		return hour >= 8 && hour <= 19;
	},

	is_open(hour = V.hour)
	{
		return this.is_daytime(hour);
	},

	is_skinnydip_time(hour = V.hour)
	{
		return hour >= 22 || hour < 3;
	},

	is_accessible(hour = V.hour)
	{
		return this.is_daytime(hour) || this.is_skinnydip_time(hour);
	},

	active_activities(hour = V.hour)
	{
		if (this.is_skinnydip_time(hour)) return this.NIGHT_ACTIVITIES;
		if (this.is_daytime(hour)) return this.DAY_ACTIVITIES;
		return [];
	},

	is_beach_loc(loc = V.location)
	{
		return loc === this.LOCATION;
	},

	activity_weights(hour = V.hour)
	{
		if (this.is_skinnydip_time(hour))
		{
			const bad = setup.Weather && setup.Weather.is_bad();
			return { skinnydipping: bad ? 0.35 : 1.0 };
		}
		const tanningWx = setup.SwimwearExhibition && setup.SwimwearExhibition.is_tanning_weather();
		const bad = setup.Weather && setup.Weather.is_bad();
		const sport = bad ? 0.35 : 1.4;
		return {
			tanning: tanningWx ? 3.2 : 0.4,
			swimming: tanningWx ? 2.4 : (bad ? 0.2 : 0.9),
			volleyball: sport * 1.1,
			badminton: sport * 0.75,
			frisbee: sport,
			football: sport * 0.85,
		};
	},

	pick_activity(person, weights = this.activity_weights())
	{
		const prng = setup.newRNG(String(V.day) + ":" + String(V.hour) + ":" + person);
		const acts = Object.keys(weights);
		const entries = acts.map(a => [a, weights[a] || 1]);
		let total = 0;
		for (const [, w] of entries) total += w;
		let roll = prng.random() * total;
		for (const [act, w] of entries)
		{
			roll -= w;
			if (roll <= 0) return act;
		}
		return entries[entries.length - 1][0];
	},

	refresh_activities(people = V.peopleatlocation)
	{
		if (!Array.isArray(people)) return;
		if (!V.lakebeachactivities) V.lakebeachactivities = {};
		const here = new Set(people);
		for (const p of Object.keys(V.lakebeachactivities))
		{
			if (!here.has(p)) delete V.lakebeachactivities[p];
		}
		if (!this.active_activities().length) return;
		const weights = this.activity_weights();
		for (const p of people)
		{
			if (!V.lakebeachactivities[p])
				V.lakebeachactivities[p] = this.pick_activity(p, weights);
		}
		if (setup.NpcTanning && setup.NpcTanning.apply_beach_tick_for_name)
		{
			for (const p of people)
			{
				if (this.get_activity(p) === "tanning")
					setup.NpcTanning.apply_beach_tick_for_name(p);
			}
		}
	},

	get_activity(person)
	{
		return V.lakebeachactivities && V.lakebeachactivities[person] || null;
	},

	people_by_activity(activity, people = V.peopleatlocation)
	{
		if (!activity || !Array.isArray(people)) return [];
		return people.filter(p => this.get_activity(p) === activity);
	},

	activity_counts(people = V.peopleatlocation)
	{
		const counts = {};
		for (const act of this.active_activities()) counts[act] = 0;
		if (!Array.isArray(people)) return counts;
		for (const p of people)
		{
			const act = this.get_activity(p);
			if (act && counts[act] != null) counts[act]++;
		}
		return counts;
	},

	_scene_bits(counts)
	{
		const bits = [];
		if (counts.tanning > 0)
			bits.push(counts.tanning === 1
				? "someone is sprawled on a towel, working on a tan"
				: counts.tanning + " students are laid out on towels, soaking up the sun");
		if (counts.swimming > 0)
			bits.push(counts.swimming === 1
				? "a swimmer splashes around near the shore"
				: "a few people are swimming near the shore");
		if (counts.volleyball > 0)
			bits.push(counts.volleyball < 3
				? "a volleyball net is up with a short-handed game going"
				: "a lively pickup volleyball game is underway on the sand");
		if (counts.badminton > 0)
			bits.push(counts.badminton === 1
				? "someone is practicing badminton footwork alone on the grass"
				: "students bat a shuttlecock back and forth near the water");
		if (counts.frisbee > 0)
			bits.push(counts.frisbee === 1
				? "a frisbee sails through the air between two students"
				: "a frisbee game is going on along the shore");
		if (counts.football > 0)
			bits.push(counts.football === 1
				? "someone tosses a football to nobody in particular"
				: "students toss a football back and forth on the sand");
		if (counts.skinnydipping > 0)
			bits.push(counts.skinnydipping === 1
				? "a lone figure is skinny dipping in the dark water"
				: counts.skinnydipping + " students are skinny dipping in the lake under the stars");
		return bits;
	},

	ambient_scene(people = V.peopleatlocation)
	{
		if (!this.is_accessible() || !people || people.length === 0)
		{
			if (this.is_skinnydip_time() && this.is_accessible())
				return "The beach is dark and quiet — just the lake lapping at the shore.";
			return "";
		}
		this.refresh_activities(people);
		const counts = this.activity_counts(people);
		const bits = this._scene_bits(counts);
		if (this.is_skinnydip_time())
		{
			if (bits.length === 0) return "The beach is dark and quiet — just the lake lapping at the shore.";
			return "In the moonlight, " + bits[0] + (bits.length > 1 ? ", and " + bits.slice(1).join(", ") : "") + ".";
		}
		if (bits.length === 0) return "A handful of students are enjoying the lake beach.";
		if (bits.length === 1) return "Around the shore, " + bits[0] + ".";
		if (bits.length === 2) return "Around the shore, " + bits[0] + ", and " + bits[1] + ".";
		return "Around the shore, " + bits.slice(0, -1).join(", ") + ", and " + bits[bits.length - 1] + ".";
	},

	_opportunity_verbs()
	{
		return {
			tanning: "is laid out on a towel, tanning",
			swimming: "is swimming near the shore",
			volleyball: "is playing volleyball on the sand",
			badminton: "is playing badminton by the water",
			frisbee: "is tossing a frisbee with friends",
			football: "is tossing a football around",
			skinnydipping: "is skinny dipping in the lake",
		};
	},

	opportunity_phrase(person)
	{
		const act = this.get_activity(person);
		const verbs = this._opportunity_verbs();
		return verbs[act] || "is hanging out by the lake";
	},

	hangout_description(person)
	{
		const act = this.get_activity(person);
		const map = {
			tanning: "%N is laid out on a towel nearby, working on a tan.",
			swimming: "%N and some others are swimming near the shore.",
			volleyball: "%N and some others have a volleyball net up on the sand.",
			badminton: "%N and a friend are playing badminton on the grass.",
			frisbee: "%N and some others are tossing a frisbee around.",
			football: "%N and some others are tossing a football back and forth.",
			skinnydipping: "%N and some others are skinny dipping in the dark lake.",
		};
		return map[act] || "%N and some others are hanging out by the water.";
	},

	joinable_activities(people = V.peopleatlocation)
	{
		const counts = this.activity_counts(people);
		const min = this.is_skinnydip_time() ? 1 : 2;
		return this.active_activities().filter(a => counts[a] >= min);
	},

	join_label(activity)
	{
		const labels = {
			tanning: "Join the tanners",
			swimming: "Go for a swim with them",
			volleyball: "Join the volleyball game",
			badminton: "Play badminton",
			frisbee: "Toss the frisbee",
			football: "Join the football toss",
			skinnydipping: "Join the skinny dippers",
		};
		return labels[activity] || "Join them";
	},

	join_passage(activity)
	{
		const passages = {
			tanning: "EventBeachTanHangout",
			swimming: "EventBeachSwimHangout",
			volleyball: "EventBeachVolleyball",
			badminton: "EventBeachBadminton",
			frisbee: "EventBeachFrisbee",
			football: "EventBeachFootball",
			skinnydipping: "EventBeachSkinnyDipHangout",
		};
		return passages[activity] || "EventBeachTalk";
	},

	begin_skinnydip(person)
	{
		if (!person) return;
		V.lakeskinnydipclothes = [];
		for (let i = 0; i < person.clothes.length; i++)
			V.lakeskinnydipclothes.push(Object.assign({}, person.clothes[i]));
		person.remove_all_clothing();
		V.lakeskinnydipactive = true;
		this.maybe_invalidate_paperdoll(person);
	},

	end_skinnydip(person)
	{
		if (!person || !V.lakeskinnydipclothes || !V.lakeskinnydipclothes.length) return;
		person.swap_all_clothing_to_closet();
		person.wear_all_clothes(V.lakeskinnydipclothes);
		delete V.lakeskinnydipclothes;
		delete V.lakeskinnydipactive;
		this.maybe_invalidate_paperdoll(person);
	},

	is_skinnydipping()
	{
		return !!V.lakeskinnydipactive;
	},

	maybe_invalidate_paperdoll(person)
	{
		if (person && person.equals && person.equals(V.pc) && setup.Paperdoll && setup.Paperdoll.invalidateCache)
			setup.Paperdoll.invalidateCache();
	},

	is_valid_person(person)
	{
		if (!person || person === "dummy" || person === "PC") return !!person;
		try
		{
			const name = setup.people.get_name(person);
			const db = setup.people_db();
			return !!(db && name && name in db);
		}
		catch (e)
		{
			return false;
		}
	},

	resolve_hangout_lead()
	{
		const candidates = [
			V.parkmates && V.parkmates[0],
			V.eventnpc,
			Array.isArray(V.peopleatlocation) ? V.peopleatlocation.find(p => p && p !== "dummy") : null,
		];
		for (const c of candidates)
		{
			if (this.is_valid_person(c))
				return setup.people.get_name(c);
		}
		return null;
	},

	ensure_parkmates()
	{
		const lead = this.resolve_hangout_lead();
		if (!lead) return [];
		if (Array.isArray(V.parkmates) && V.parkmates.length && this.is_valid_person(V.parkmates[0]))
			return V.parkmates.filter(p => this.is_valid_person(p));
		const act = this.get_activity(lead) || "tanning";
		const mates = this.pick_mates_for_activity(act, lead).filter(p => this.is_valid_person(p));
		return mates.length ? mates : [lead];
	},

	pick_mates_for_activity(activity, anchor, people = V.peopleatlocation, max = 5)
	{
		if (!this.is_valid_person(anchor))
			return [];
		const anchorName = setup.people.get_name(anchor);
		const pool = this.people_by_activity(activity, people).filter(p =>
		{
			if (!this.is_valid_person(p)) return false;
			return setup.people.get_name(p) !== anchorName;
		});
		const mates = [anchorName];
		for (const p of setup.shuffle(pool))
		{
			if (mates.length >= max) break;
			const pname = setup.people.get_name(p);
			if (mates.includes(pname)) continue;
			mates.push(pname);
		}
		while (mates.length < 3 && pool.length > mates.length - 1)
		{
			for (const p of setup.shuffle(people))
			{
				if (mates.length >= 3 || mates.length >= max) break;
				if (!this.is_valid_person(p)) continue;
				const pname = setup.people.get_name(p);
				if (!mates.includes(pname)) mates.push(pname);
			}
			break;
		}
		return mates;
	},

	cap_crowd(people, max = this.MAX_CROWD)
	{
		if (!Array.isArray(people) || people.length <= max)
			return people;
		return setup.shuffle([...people]).slice(0, max);
	},

	hook_people_at_location(loc, people)
	{
		if (this.is_beach_loc(loc) && this.is_accessible())
		{
			people = this.cap_crowd(people);
			this.refresh_activities(people);
		}
		return people;
	},
};

(function()
{
	const orig = setup.people_at_location;
	if (!orig || orig._lakeBeachHooked) return;
	setup.people_at_location = function(loc, locblock)
	{
		let list = orig.call(this, loc, locblock);
		if (setup.LakeBeach)
			list = setup.LakeBeach.hook_people_at_location(loc, list);
		return list;
	};
	setup.people_at_location._lakeBeachHooked = true;
})();