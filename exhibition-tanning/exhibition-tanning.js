// Exhibition tanning: pose-aware displacement + exposure tweaks while laying out.
// Appended to setup.Tanning in the appearance-dev HTML build.

Object.assign(setup.Tanning, {
	EXHIB_TANNING_MIN: 5,
	QUICK_SESSION: 15,
	TAN_QUICK_MIN: 1,
	TAN_PLAY_MIN: 5,

	TANNING_SITES: {
		UniMall: {
			returnPassage: "UniMall",
			passagePrefix: "UniMallTan",
			exhibPassage: "UniMall",
			exhibLoc: "UniMall",
			locblock: "Campus",
		},
		UniversityLakeBeach: {
			returnPassage: "UniversityLakeBeach",
			passagePrefix: "LakeTan",
			exhibPassage: "UniversityLakeBeach",
			exhibLoc: "UniversityLakeBeach",
			locblock: "Campus",
		},
	},

	// Outdoor tanning headcounts: ≤10 empty, ~40 typical, ≥70 crowded.
	MALL_CROWD_EMPTY_MAX: 10,
	MALL_CROWD_CROWDED_MIN: 70,

	// PC-initiated audience actions (bold tease / beckon).
	TEASE_AUDIENCE_EXHIB: 7,
	TEASE_AUDIENCE_EXHIB_PLEASING: 5,
	BECKON_AUDIENCE_EXHIB: 9,
	BECKON_AUDIENCE_EXHIB_BOLD: 7,

	// Close watcher interactions (NPC settled near your towel).
	CLOSE_TALK_EXHIB: 5,
	CLOSE_BODY_TEASE_EXHIB: 7,
	CLOSE_SELF_TOUCH_EXHIB: 8,
	CLOSE_SELF_PLAY_EXHIB: 9,
	CLOSE_SHOW_MORE_EXHIB: 8,
	CLOSE_EXPOSE_EXHIB: 8,
	CLOSE_FINGER_EXHIB: 9,
	CLOSE_ORGASM_EXHIB: 10,
	CLOSE_ORGASM_AROUSAL_MIN: 720,
	TAN_AROUSAL_MAX: 1000,

	TAN_DISPLACE_CATEGORIES: ["tops", "top", "swimwear", "underwear", "bottoms", "bodysuits", "dresses", "outerwear"],
	TAN_KEEP_CATEGORIES: ["bags"],

	// Parts an observer can actually see from each laying pose.
	POSE_VIEW: {
		back: {
			label: "Lay on your back",
			visible: ["chest", "breasts", "nipples", "stomach", "crotch", "vagina", "penis", "clitoris", "groin", "thigh", "hip"],
			hidden: ["back", "butt", "anus", "shoulder", "waist", "upper arm"],
		},
		stomach: {
			label: "Lay on your stomach",
			visible: ["back", "butt", "anus", "shoulder", "waist", "thigh", "hip", "upper arm"],
			hidden: ["chest", "breasts", "nipples", "stomach", "crotch", "vagina", "penis", "clitoris", "groin"],
		},
		standing: {
			label: "Standing",
			visible: ["chest", "breasts", "nipples", "stomach", "crotch", "vagina", "penis", "clitoris", "groin", "thigh", "hip", "back", "butt", "anus", "shoulder", "waist", "upper arm"],
			hidden: [],
		},
		seated: {
			label: "Seated",
			visible: ["chest", "breasts", "nipples", "stomach", "crotch", "vagina", "penis", "clitoris", "groin", "thigh", "hip"],
			hidden: ["back", "butt", "anus", "shoulder", "waist", "upper arm"],
		},
		bending: {
			label: "Bending over",
			visible: ["back", "butt", "anus", "shoulder", "waist", "thigh", "hip", "upper arm", "chest", "breasts", "nipples"],
			hidden: ["stomach", "crotch", "vagina", "penis", "clitoris", "groin"],
		},
		walking: {
			label: "Walking together",
			visible: ["chest", "breasts", "nipples", "stomach", "crotch", "vagina", "penis", "clitoris", "groin", "thigh", "hip", "back", "butt", "shoulder", "waist", "upper arm"],
			hidden: ["anus"],
		},
	},

	OUT_ABOUT_POSES: {
		default: "standing",
		activities: {
			"have a park picnic": "seated",
			"have dinner": "seated",
			"grab a coffee": "seated",
			"go to the planetarium": "seated",
			"study together": "seated",
			"hit the arcade": "standing",
			"hit the gym": "standing",
			"hit the bowling alley": "standing",
			"hang out": "standing",
			"exhibition outing": null,
		},
		locations: {
			Cinema: "seated",
			BangCoffee: "seated",
			SummitMarket: "bending",
			BlodgettGymInterior: "standing",
			RiverRat: "standing",
			UniMall: "walking",
			ChamberlainHall: "walking",
			Arcade: "standing",
			StickySteve: "standing",
			UniversityLakeBeach: "back",
		},
		setting_labels: {
			Cinema: "in the dim theatre seats",
			BangCoffee: "at your café table",
			SummitMarket: "in the market aisles",
			BlodgettGymInterior: "on the gym floor",
			RiverRat: "at the bar",
			UniMall: "on the open quad",
			ChamberlainHall: "in the busy hallway",
			Arcade: "on the arcade floor",
			StickySteve: "in the neon-lit shop",
			UniversityLakeBeach: "on the beach",
		},
	},

	// Map clothing anatomy tags to exposure flavor / witness reactions.
	EXPOSURE_TAG_WEIGHT: {
		nipple: { req: 8, att: 6, arousal: 28, parts: ["nipples"] },
		areola: { req: 7, att: 5, arousal: 22, parts: ["nipples"] },
		breasts: { req: 7, att: 5, arousal: 20, parts: ["breasts"] },
		chest: { req: 5, att: 3, arousal: 10, parts: ["chest"] },
		camel_toe: { req: 5, att: 5, arousal: 22, parts: ["crotch", "vagina"] },
		bulge: { req: 5, att: 4, arousal: 18, parts: ["penis", "crotch"] },
		crotch: { req: 8, att: 7, arousal: 32, parts: ["vagina", "penis", "crotch", "clitoris"] },
		bare_crotch: { req: 9, att: 9, arousal: 45, parts: ["vagina", "penis", "clitoris"] },
		bare_genitals: { req: 10, att: 10, arousal: 55, parts: ["vagina", "penis", "clitoris"] },
		butt: { req: 5, att: 4, arousal: 12, parts: ["butt", "anus"] },
		butt_crack: { req: 5, att: 5, arousal: 14, parts: ["butt", "anus"] },
		underbutt: { req: 4, att: 4, arousal: 10, parts: ["butt"] },
		sideboob: { req: 5, att: 4, arousal: 12, parts: ["breasts", "chest"] },
		thigh: { req: 3, att: 2, arousal: 6, parts: ["thigh", "hip"] },
	},

	EXPOSURE_TAG_HINT: {
		nipple: "nipples",
		areola: "areola show-through",
		breasts: "breasts",
		chest: "chest",
		camel_toe: "camel-toe outline",
		bulge: "bulge",
		crotch: "crotch",
		bare_crotch: "bare crotch",
		bare_genitals: "bare genitals",
		butt: "butt",
		butt_crack: "butt crack",
		underbutt: "underbutt",
		sideboob: "sideboob",
		thigh: "thighs",
	},

	// BodyExposure parts an onlooker can see from each tanning pose.
	POSE_EXPOSURE_PARTS: {
		back: ["camel_toe", "bulge", "nipple", "areola", "sideboob", "underboob", "cleavage"],
		stomach: ["underbutt", "butt_crack", "ass_cheeks"],
		standing: ["camel_toe", "bulge", "nipple", "areola", "sideboob", "underboob", "cleavage", "underbutt", "butt_crack", "ass_cheeks"],
		seated: ["camel_toe", "bulge", "nipple", "areola", "sideboob", "underboob", "cleavage", "thigh"],
		bending: ["underbutt", "butt_crack", "ass_cheeks", "sideboob", "cleavage"],
		walking: ["camel_toe", "bulge", "nipple", "areola", "sideboob", "underboob", "cleavage", "underbutt", "butt_crack", "thigh"],
	},

	BODY_PART_TO_TAG: {
		camel_toe: "camel_toe",
		bulge: "bulge",
		nipple: "nipple",
		areola: "areola",
		sideboob: "sideboob",
		underboob: "breasts",
		cleavage: "chest",
		underbutt: "underbutt",
		butt_crack: "butt_crack",
		ass_cheeks: "butt",
	},

	get_tanning_site(loc)
	{
		loc = loc || V.tanninglocation || V.location;
		if (loc && this.TANNING_SITES[loc]) return loc;
		if (V.tanninglocation && this.TANNING_SITES[V.tanninglocation]) return V.tanninglocation;
		return "UniMall";
	},

	get_tan_site_config(loc)
	{
		return this.TANNING_SITES[this.get_tanning_site(loc)];
	},

	get_tan_return_passage()
	{
		return this.get_tan_site_config().returnPassage;
	},

	get_tan_exhib_context()
	{
		const cfg = this.get_tan_site_config();
		return { passage: cfg.exhibPassage, loc: cfg.exhibLoc, locblock: cfg.locblock };
	},

	all_tan_passages()
	{
		const passages = [];
		for (const site of Object.values(this.TANNING_SITES))
		{
			passages.push(site.passagePrefix + "Clothed");
			passages.push(site.passagePrefix + "Swimwear");
			passages.push(site.passagePrefix + "Bikini");
		}
		return passages;
	},

	clothing_category(piece)
	{
		if (!piece) return null;
		const def = setup.Clothes && (setup.Clothes.item[piece.item] || setup.Clothes[piece.item]);
		return def ? def.category : null;
	},

	is_keep_while_tanning(piece)
	{
		const cat = this.clothing_category(piece);
		return cat && this.TAN_KEEP_CATEGORIES.includes(cat);
	},

	get_tan_keep_clothes(person)
	{
		if (!person || !person.clothes) return [];
		return person.clothes
			.filter(c => this.is_keep_while_tanning(c))
			.map(c => Object.assign({}, c));
	},

	swap_for_tanning(person)
	{
		if (!person) return;
		const keep = this.get_tan_keep_clothes(person);
		person.swap_all_clothing_to_closet();
		for (const k of keep)
			person.wear_from_closet(k);
	},

	has_tan_backpack(person)
	{
		person = person || (setup.pc && setup.pc());
		if (!person) return false;
		if (person.clothes && person.clothes.some(c => this.is_keep_while_tanning(c)))
			return true;
		if (V.tanBackpackStash && V.tanBackpackStash.length)
			return true;
		if (V.pretanningclothes && V.pretanningclothes.some(c => this.is_keep_while_tanning(c)))
			return true;
		return false;
	},

	_piece_storage_flags(piece)
	{
		if (!piece) return [];
		try
		{
			const cinfo = new ClothingItem(piece).get_current_archetype();
			return cinfo && cinfo.storage ? cinfo.storage : [];
		}
		catch (e)
		{
			return [];
		}
	},

	_storage_flags_include_phone(flags)
	{
		return (flags || []).some(s => String(s).includes("phone"));
	},

	_clothing_list_has_phone_storage(clothesList)
	{
		if (!clothesList || !clothesList.length) return false;
		for (let i = 0; i < clothesList.length; i++)
		{
			if (this._storage_flags_include_phone(this._piece_storage_flags(clothesList[i])))
				return true;
		}
		return false;
	},

	_clothing_list_has_phone_pockets(person, clothesList)
	{
		if (!person || !clothesList || !clothesList.length) return false;
		for (let i = 0; i < clothesList.length; i++)
		{
			try
			{
				const cinfo = new ClothingItem(clothesList[i]).get_current_archetype();
				if (typeof person.clothing_layergroup === "function" &&
					person.clothing_layergroup(cinfo) === 4)
					continue;
				if (cinfo.storage &&
					(cinfo.storage.includes("cards") || cinfo.storage.includes("phone")))
					return true;
			}
			catch (e) { /* skip bad piece */ }
		}
		return false;
	},

	_outfit_named_has_phone_access(person, outfitName)
	{
		const outfits = V.outfits || [];
		for (let i = 0; i < outfits.length; i++)
		{
			const o = outfits[i];
			if (!o || o.name !== outfitName || !o.clothes || !o.clothes.length) continue;
			if (this._clothing_list_has_phone_storage(o.clothes)) return true;
			if (this._clothing_list_has_phone_pockets(person, o.clothes)) return true;
		}
		return false;
	},

	_collect_tan_backpack_candidates(person)
	{
		const seen = new Set();
		const out = [];
		const add = (piece) =>
		{
			if (!piece || !piece.item) return;
			const key = piece.item + ":" + (piece.set_id || "") + ":" + (piece.color || "");
			if (seen.has(key)) return;
			seen.add(key);
			out.push(Object.assign({}, piece));
		};
		const lists = [V.pretanningclothes, person && person.clothes];
		for (const list of lists)
		{
			if (!list || !list.length) continue;
			for (let i = 0; i < list.length; i++)
			{
				const piece = list[i];
				if (this.is_keep_while_tanning(piece) ||
					this._storage_flags_include_phone(this._piece_storage_flags(piece)))
					add(piece);
			}
		}
		return out;
	},

	ensure_tan_backpack_stash(person)
	{
		person = person || (setup.pc && setup.pc());
		if (!person) return [];
		if (!V.tanBackpackStash) V.tanBackpackStash = [];
		if (V.tanBackpackStash.length) return V.tanBackpackStash;
		const candidates = this._collect_tan_backpack_candidates(person);
		for (let i = 0; i < candidates.length; i++)
			V.tanBackpackStash.push(candidates[i]);
		return V.tanBackpackStash;
	},

	can_use_phone_while_tanning(person)
	{
		// Phone lives in the backpack beside the towel once a pose is chosen.
		return !!V.tanpose;
	},

	pc_has_tan_phone(person)
	{
		person = person || (setup.pc && setup.pc());
		if (!person) return false;
		if (typeof person.has_phone === "function" && person.has_phone())
			return true;
		this.ensure_tan_backpack_stash(person);
		const stashLists = [
			person.clothes,
			V.tanBackpackStash,
			V.pretanningclothes,
		];
		for (let i = 0; i < stashLists.length; i++)
		{
			const list = stashLists[i];
			if (!list || !list.length) continue;
			if (this._clothing_list_has_phone_storage(list)) return true;
			if (this._clothing_list_has_phone_pockets(person, list)) return true;
		}
		if (this._outfit_named_has_phone_access(person, "Everyday")) return true;
		return false;
	},

	ensure_tan_phone_context(person)
	{
		if (!person || !V.tanpose) return false;
		this.ensure_tan_backpack_stash(person);
		V.tanphonesession = true;
		const tanPassages = this.all_tan_passages();
		if (!V.tantanpassage || !tanPassages.includes(V.tantanpassage))
			V.tantanpassage = this.get_tan_passage_from_mode(V.malltanning);
		return true;
	},

	get_tan_phone_passage()
	{
		return this.TAN_PHONE_PASSAGE;
	},

	get_tan_phone_return()
	{
		if (this.can_use_phone_while_tanning(V.pc))
			return this.get_tan_phone_passage();
		return this.get_tan_passage();
	},

	set_tan_phone_return()
	{
		const ret = this.get_tan_phone_return();
		V.prephoneattemptednavigation = ret;
		V.attemptednavigation = ret;
		V.lastlocpassage = ret;
	},

	open_tan_phone(passage)
	{
		this.set_tan_phone_return();
		if (setup.phone && setup.phone.init) setup.phone.init();
		if (setup.phone && setup.phone.open)
			setup.phone.open(passage || "PhoneMain");
	},

	open_tan_text_contact(npc)
	{
		if (!npc) return;
		this.set_tan_phone_return();
		if (setup.phone && setup.phone.init) setup.phone.init();
		V.phonetexter = npc;
		V.phoneconvo = [];
		if (setup.phone && setup.phone.open)
			setup.phone.open("PhoneText");
	},

	get_tan_phone_contacts(person, maxCount = 8)
	{
		const p = setup.people;
		const contacts = [];
		for (const name of Object.keys(V.people || {}))
		{
			if (!p.has_number(name) || !p.is_known(name) || !p.valid_phone_contact(name))
				continue;
			const romantic = p.is_romantic_partner(name) || p.is_bootycall(name);
			const friendly = romantic || p.is_friend(name) || p.is_friendly(name);
			if (!friendly) continue;
			let score = 0;
			if (romantic) score += 6;
			if (p.is_friend(name)) score += 4;
			if (p.is_friendly(name)) score += 2;
			score += (p.get_attitude(name, "lust") || 0) / 200;
			contacts.push({
				name,
				score,
				romantic,
				label: this.menu_npc_label(name),
			});
		}
		contacts.sort((a, b) => b.score - a.score);
		return contacts.slice(0, maxCount);
	},

	register_tan_invite_activities()
	{
		if (!setup.Relationships || !setup.Relationships.activities) return;
		const acts = setup.Relationships.activities;
		if (!acts["lay out at the mall"])
		{
			acts["lay out at the mall"] = {
				location: "UniMall",
				locmsg: "I'm already laying out at the mall — come find my towel.",
				askmsg: "Want to come lay out in the sun with me at the mall?",
				msgs: ["Sure, I could use some sun", "Sounds chill — I'll head over", "Yeah, lay out together sounds nice"],
				studentonly: true,
				daytime: true,
				public: true,
			};
		}
		if (!acts["lay out at the lake"])
		{
			acts["lay out at the lake"] = {
				location: "UniversityLakeBeach",
				locmsg: "I'm at the lake beach already — come find my towel.",
				askmsg: "Want to come lay out at the lake with me?",
				msgs: ["Sure, I could use some sun", "Sounds great — I'll grab my suit", "Yeah, I'm on my way"],
				studentonly: true,
				daytime: true,
				public: true,
			};
		}
	},

	get_tan_invite_activity()
	{
		return this.get_tanning_site() === "UniversityLakeBeach"
			? "lay out at the lake"
			: "lay out at the mall";
	},

	clear_tan_towel_guests()
	{
		delete V.tanTowelGuests;
		delete V.tanTowelWatchers;
		delete V.tanGuestRoles;
		delete V.tanGuestSelfMsg;
		delete V.taninvitemsg;
		delete V.tanBackpackStash;
	},

	_ensure_tan_guest_roles()
	{
		if (!V.tanGuestRoles || typeof V.tanGuestRoles !== "object")
			V.tanGuestRoles = {};
	},

	_tan_guest_role(name)
	{
		return V.tanGuestRoles && V.tanGuestRoles[name] ? V.tanGuestRoles[name] : null;
	},

	_set_tan_guest_role(name, role)
	{
		if (!name || !role) return;
		this._ensure_tan_guest_roles();
		V.tanGuestRoles[name] = role;
	},

	is_tan_exhib_self_guest(name, pc)
	{
		pc = pc || (setup.pc && setup.pc());
		if (!name || !pc) return false;
		if (this.is_controlled_partner(pc, name)) return false;
		return this._tan_guest_role(name) === "exhib_self";
	},

	can_invite_to_join_towel(pc, npc)
	{
		if (!pc || !npc) return false;
		if (this.is_controlled_partner(pc, npc)) return true;
		return this.is_tan_exhib_join_candidate(pc, npc);
	},

	is_tan_exhib_join_candidate(pc, npc)
	{
		if (!pc || !npc) return false;
		const exhib = setup.people.skill_level(npc, "Exhibitionism") || 0;
		if (exhib < 3) return false;
		if (setup.people.has_any_inclination(npc, "just_exhibitionist")) return true;
		if (setup.people.is_friend(npc) && exhib >= 3) return true;
		if (setup.people.is_romantic_partner(npc) && exhib >= 3) return true;
		if (setup.people.is_bootycall(npc) && exhib >= 4) return true;
		return exhib >= 5;
	},

	_add_tan_watcher(npc)
	{
		if (!npc) return;
		if (!V.tanTowelWatchers) V.tanTowelWatchers = [];
		if (!V.tanTowelWatchers.includes(npc)) V.tanTowelWatchers.push(npc);
	},

	_add_tan_towel_guest(npc)
	{
		if (!npc) return;
		if (!V.tanTowelGuests) V.tanTowelGuests = [];
		if (!V.tanTowelGuests.includes(npc)) V.tanTowelGuests.push(npc);
		if (V.tanTowelWatchers)
			V.tanTowelWatchers = V.tanTowelWatchers.filter(n => n !== npc);
	},

	_add_tan_scene_npc(npc)
	{
		if (!npc) return;
		if (!V.peopleatlocation) V.peopleatlocation = [];
		if (!V.peopleatlocation.includes(npc)) V.peopleatlocation.push(npc);
	},

	_get_tan_invite_activity_info()
	{
		this.register_tan_invite_activities();
		const activity = this.get_tan_invite_activity();
		return setup.Relationships && setup.Relationships.activities
			? setup.Relationships.activities[activity]
			: null;
	},

	_selfie_invite_action(raw, session)
	{
		if (!raw || !raw.id) return null;
		if (raw.action === "invite_watch") return "invite_watch";
		if (raw.action === "invite_join") return "invite_join";
		if (raw.action === "invite_towel") return "invite_watch";
		if (raw.action === "invite_hangout") return raw.action;
		const tanning = session && session.context === "tanning";
		if (raw.dynamic === "join")
			return tanning ? "invite_join" : "invite_hangout";
		const id = raw.id;
		const towelInviteIds = {
			come_towel: true,
			join_tan: true,
			join_warm_tan: true,
			join_def_tan: true,
			meet_tan: true,
			see_sunset: true,
			see_sunset_w: true,
			invite_partner_tan: true,
		};
		const hangoutInviteIds = {
			come_over: true,
			join_phone: true,
			join_warm_phone: true,
			join_def_phone: true,
			meet_phone: true,
			see_you: true,
			see_you_partner: true,
			hang_out: true,
			meet_later: true,
		};
		const joinTowelIds = {
			join_tan: true,
			join_warm_tan: true,
			join_def_tan: true,
			invite_partner_tan: true,
		};
		if (joinTowelIds[id])
			return tanning ? "invite_join" : "invite_hangout";
		if (towelInviteIds[id])
			return tanning ? "invite_watch" : "invite_hangout";
		if (hangoutInviteIds[id])
			return tanning ? "invite_watch" : "invite_hangout";
		if (id === "join" || /^join_/.test(id))
			return tanning ? "invite_join" : "invite_hangout";
		return null;
	},

	_pick_tan_invite_busy_reply(npc)
	{
		const pool = [
			"Can't right now — I'm slammed. Rain check?",
			"Wish I could, but I'm stuck for a while.",
			"Not free at the moment, sorry.",
			"Maybe later? Today's a mess for me.",
		];
		return this._format_tan_reply_line(setup.randomchoice(pool), npc);
	},

	_pick_tan_invite_accept_reply(npc, mode)
	{
		const pool = mode === "join"
			? [
				"On my way — save me a spot on your towel.",
				"Bold. I'm coming to lay out with you.",
				"Give me a few minutes. Don't move.",
				"Okay — I'll join you.",
			]
			: mode === "watch"
				? [
					"Yeah, I'll come watch.",
					"On my way — don't cover up on my account.",
					"Okay, I'm heading over to look.",
					"Sounds fun. I'll find you.",
				]
				: [
					"Sounds great — I'll be there.",
					"Yeah, I'm down. Text me when you're there.",
					"Sure, I could use some sun.",
				];
		return this._format_tan_reply_line(setup.randomchoice(pool), npc);
	},

	_evaluate_tan_scene_invite(npc, mode)
	{
		if (!npc || !setup.people.has_number(npc))
			return { ok: false, msg: this._format_tan_reply_line("Wrong number...?", npc) };
		const pc = setup.pc && setup.pc();
		if (mode === "join" && pc && !this.can_invite_to_join_towel(pc, npc))
			return { ok: false, msg: this._format_tan_reply_line("I don't think I'd lay out with you like that.", npc) };
		const actInfo = this._get_tan_invite_activity_info();
		if (!actInfo)
			return { ok: false, msg: this._pick_tan_invite_busy_reply(npc) };
		let resp = setup.Relationships.react_to_activity_proposal(npc, "hangout", actInfo);
		if (!resp[0])
			return { ok: false, msg: this._format_tan_reply_line(resp[1], npc) };
		resp = setup.Relationships.react_to_activity_proposal(npc, "hangout", actInfo, V.gameday);
		if (!resp[0])
			return { ok: false, busy: true, msg: this._format_tan_reply_line(resp[1], npc) };
		if (V.busytoday && V.busytoday.includes(npc))
			return { ok: false, busy: true, msg: this._pick_tan_invite_busy_reply(npc) };

		const p = setup.people;
		const profile = this.profile_tan_witness(npc);
		let acceptChance = mode === "join" ? 0.28 : 0.42;
		if (p.is_romantic_partner(npc)) acceptChance = mode === "join" ? 0.9 : 0.82;
		else if (p.is_bootycall(npc)) acceptChance = mode === "join" ? 0.84 : 0.76;
		else if (p.is_friend(npc)) acceptChance = mode === "join" ? 0.58 : 0.66;
		else if (p.get_attitude(npc, "friendship") >= 250) acceptChance = 0.52;
		if (mode === "join" && pc && this.is_controlled_partner(pc, npc)) acceptChance = 0.95;
		if (mode === "join" && this.is_tan_exhib_join_candidate(pc, npc))
		{
			const exhib = p.skill_level(npc, "Exhibitionism") || 0;
			acceptChance += Math.min(0.2, exhib * 0.03);
		}
		if (mode === "watch" && profile.voyeur) acceptChance += 0.16;
		if (mode === "watch" && profile.attracted) acceptChance += 0.08;
		acceptChance += Math.min(0.22, (p.get_attitude(npc, "lust") || 0) / 2200);
		if ((V.peopleatlocation || []).includes(npc)) acceptChance += 0.15;
		if (State.random() > acceptChance)
			return { ok: false, busy: true, msg: this._pick_tan_invite_busy_reply(npc) };

		return { ok: true, msg: this._pick_tan_invite_accept_reply(npc, mode) };
	},

	_evaluate_tan_watch_invite(npc)
	{
		return this._evaluate_tan_scene_invite(npc, "watch");
	},

	_evaluate_tan_join_invite(npc)
	{
		return this._evaluate_tan_scene_invite(npc, "join");
	},

	_evaluate_tan_towel_invite(npc)
	{
		return this._evaluate_tan_watch_invite(npc);
	},

	_apply_tan_watch_invite(npc)
	{
		if (!npc) return { msg: "" };
		this._add_tan_watcher(npc);
		this._add_tan_scene_npc(npc);

		const person = setup.pc && setup.pc();
		const tags = person ? this.current_visible_exposure(person) : [];
		const pr = setup.people.pronouns(npc);
		const profile = this.profile_tan_witness(npc);
		let msg = setup.capitalize(pr.ps) + " texts back that " + pr.ps + "'s on the way";
		if (person)
		{
			const tier = profile.voyeur ? this.WITNESS_TIER.voyeur : this.WITNESS_TIER.linger;
			this.init_close_escalation(npc, tags, "approach");
			this.register_tan_witness_memory(person, npc, tags, tier);
			if (profile.voyeur && setup.NPCSimulation && setup.NPCSimulation.gain_experience)
				setup.NPCSimulation.gain_experience(npc, "Voyeurism", 0.18);
		}
		if (profile.voyeur)
			msg += " — soon " + pr.ps + " settles nearby with hungry eyes, happy to watch.";
		else
			msg += ". Soon " + pr.ps + " wanders over and finds a spot to watch from a few feet away.";
		setup.people.alter_attitude(npc, "friendship", setup.rir(4, 10));
		setup.people.alter_attitude(npc, "lust", setup.rir(10, 22));
		return { msg };
	},

	_apply_tan_join_invite(npc)
	{
		if (!npc) return { msg: "" };
		const person = setup.pc && setup.pc();
		this._add_tan_towel_guest(npc);
		this._add_tan_scene_npc(npc);

		const tags = person ? this.current_visible_exposure(person) : [];
		const pr = setup.people.pronouns(npc);
		const who = setup.people.firstname(npc) || npc;
		let msg = setup.capitalize(pr.ps) + " texts back that " + pr.ps + "'s on the way";
		if (person && this.is_controlled_partner(person, npc))
		{
			this._set_tan_guest_role(npc, "controlled");
			this._init_partner_tan_state(npc);
			msg += " — and a minute later " + who + " kneels on your towel, waiting for your orders.";
		}
		else if (person && this.is_tan_exhib_join_candidate(person, npc))
		{
			this._set_tan_guest_role(npc, "exhib_self");
			this._init_partner_tan_state(npc);
			const exhib = setup.people.skill_level(npc, "Exhibitionism") || 0;
			if (person) this.register_tan_witness_memory(person, npc, tags, this.WITNESS_TIER.glance);
			msg += " — " + who + " drops onto your towel and shoots you a bold grin";
			if (exhib >= 6)
				msg += ", already eyeing how far " + pr.ps + " dares to push " + pr.pp + " suit.";
			else
				msg += ", testing how much skin " + pr.ps + " can get away with.";
		}
		else
		{
			this._set_tan_guest_role(npc, "guest");
			this._init_partner_tan_state(npc);
			msg += " — and a minute later " + pr.ps + " settles on the edge of your towel.";
		}
		setup.people.alter_attitude(npc, "friendship", setup.rir(6, 12));
		setup.people.alter_attitude(npc, "lust", setup.rir(12, 24));
		return { msg };
	},

	_apply_tan_towel_invite(npc)
	{
		return this._apply_tan_watch_invite(npc);
	},

	_evaluate_tan_hangout_invite(npc)
	{
		if (!npc || !setup.people.has_number(npc))
			return { ok: false, msg: this._format_tan_reply_line("Wrong number...?", npc) };
		const actInfo = this._get_tan_invite_activity_info();
		if (!actInfo)
			return { ok: false, msg: this._pick_tan_invite_busy_reply(npc) };
		let resp = setup.Relationships.react_to_activity_proposal(npc, "hangout", actInfo);
		if (!resp[0])
			return { ok: false, msg: this._format_tan_reply_line(resp[1], npc) };
		resp = setup.Relationships.react_to_activity_proposal(npc, "hangout", actInfo, V.gameday);
		if (!resp[0])
			return { ok: false, busy: true, msg: this._format_tan_reply_line(resp[1], npc) };
		if (V.busytoday && V.busytoday.includes(npc))
			return { ok: false, busy: true, msg: this._pick_tan_invite_busy_reply(npc) };
		return { ok: true, msg: this._pick_tan_invite_accept_reply(npc, false) };
	},

	_schedule_tan_hangout_invite(npc)
	{
		const actInfo = this._get_tan_invite_activity_info();
		if (!npc || !actInfo) return { scheduled: false, msg: "" };
		const activity = this.get_tan_invite_activity();
		const proposed = {
			type: "hangout",
			partner: npc,
			activity,
			location: actInfo.location,
			locmsg: actInfo.locmsg,
			daytime: actInfo.daytime,
			day: V.gameday,
			time: Math.max((V.hour || 11) + 1, actInfo.daytime ? 11 : 18),
			endtime: actInfo.daytime ? 20 : 24,
		};
		if (!V.planneddate) V.planneddate = [];
		V.planneddate.push(proposed);
		let msg = actInfo.locmsg || "Text me when you're there.";
		if (!/[.!?]$/.test(msg)) msg += ".";
		return { scheduled: true, msg: this._format_tan_reply_line(msg, npc) };
	},

	_resolve_tan_invite(npc, mode)
	{
		const evaluation = mode === "join"
			? this._evaluate_tan_join_invite(npc)
			: this._evaluate_tan_watch_invite(npc);
		if (!evaluation.ok)
			return {
				ok: false,
				npcText: evaluation.msg,
				mood: evaluation.busy ? "neutral" : "confused",
				endConvo: true,
			};
		const arrival = mode === "join"
			? this._apply_tan_join_invite(npc)
			: this._apply_tan_watch_invite(npc);
		if (mode === "join")
			this.maybe_exhib_guest_self_adjust(npc, true);
		return {
			ok: true,
			npcText: evaluation.msg,
			arrivalMsg: arrival.msg,
			mood: "flirty",
			endConvo: true,
		};
	},

	resolve_tan_watch_invite(npc)
	{
		return this._resolve_tan_invite(npc, "watch");
	},

	resolve_tan_join_invite(npc)
	{
		return this._resolve_tan_invite(npc, "join");
	},

	resolve_tan_towel_invite(npc)
	{
		return this.resolve_tan_watch_invite(npc);
	},

	resolve_tan_hangout_invite(npc)
	{
		const evaluation = this._evaluate_tan_hangout_invite(npc);
		if (!evaluation.ok)
			return {
				ok: false,
				npcText: evaluation.msg,
				mood: evaluation.busy ? "neutral" : "confused",
				endConvo: true,
			};
		const schedule = this._schedule_tan_hangout_invite(npc);
		return {
			ok: true,
			scheduled: schedule.scheduled,
			npcText: schedule.scheduled ? evaluation.msg + " " + schedule.msg : evaluation.msg,
			mood: "flirty",
			endConvo: true,
		};
	},

	get_exhib_self_tan_guests(pc)
	{
		pc = pc || (setup.pc && setup.pc());
		if (!pc) return [];
		const guests = V.tanTowelGuests || [];
		return guests.filter(name => name && this.is_tan_exhib_self_guest(name, pc));
	},

	format_tan_towel_guests()
	{
		const watchers = V.tanTowelWatchers || [];
		const guests = V.tanTowelGuests || [];
		const lines = [];
		if (watchers.length === 1)
		{
			const pr = setup.people.pronouns(watchers[0]);
			lines.push(setup.capitalize(pr.ps) + " is watching from nearby — " + this.witness_name_link(watchers[0], false) + ".");
		}
		else if (watchers.length > 1)
		{
			const names = watchers.map(n => this.witness_name_link(n, false));
			lines.push(setup.and(names) + " are watching from a few feet away.");
		}
		for (let i = 0; i < guests.length; i++)
		{
			const name = guests[i];
			const role = this._tan_guest_role(name);
			const pr = setup.people.pronouns(name);
			const who = this.witness_name_link(name, false);
			if (role === "controlled")
				lines.push(setup.capitalize(pr.ps) + " is on your towel awaiting orders — " + who + ".");
			else if (role === "exhib_self")
				lines.push(who + " is on your towel, daring the sun (and you) to look.");
			else
				lines.push(setup.capitalize(pr.ps) + " joined you on the towel — " + who + ".");
		}
		return lines.join(" ");
	},

	exhib_guest_self_narration(name, action)
	{
		if (!name || !action) return "";
		const pr = setup.people.pronouns(name);
		const who = setup.people.firstname(name) || name;
		if (action.kind === "legs")
		{
			if (action.spread)
				return who + " casually lets " + pr.pp + " knees fall apart, pretending it's innocent.";
			return who + " presses " + pr.pp + " thighs together, suddenly shy.";
		}
		const cinfo = action.clothing ? this.get_partner_person(name).clothing_archetype(action.clothing) : null;
		const item = cinfo ? cinfo.shortname : "outfit";
		if (action.displacement === "fix")
			return who + " smooths " + pr.pp + " " + item + " back into place, blushing.";
		if (action.exposure_dir === "more")
		{
			const pool = [
				who + " " + action.displacement + "s " + pr.pp + " " + item + " with a shameless little smile.",
				who + " catches your eye, then " + action.displacement + "s " + pr.pp + " " + item + " — just bold enough.",
				"Without asking permission, " + who + " adjusts " + pr.pp + " " + item + " to show more skin.",
			];
			return setup.randomchoice(pool);
		}
		return who + " tugs " + pr.pp + " " + item + " back down, playing it safe for now.";
	},

	pick_exhib_guest_self_action(name)
	{
		const person = this.get_partner_person(name);
		if (!person) return null;
		const exhib = setup.people.skill_level(name, "Exhibitionism") || 0;
		if (exhib < 3) return null;
		const actions = this.get_partner_menu_actions(name, "tanning");
		const willing = actions.filter(a => (a.exhib_req || 0) <= exhib);
		if (!willing.length) return null;
		const profile = this.profile_tan_witness(name);
		let pool = willing.filter(a => a.exposure_dir === "more");
		if (!pool.length) pool = willing;
		if (profile.shy && State.random() < 0.35)
			pool = willing.filter(a => a.exposure_dir === "less");
		if (!pool.length) pool = willing;
		pool.sort((a, b) => {
			const score = act => (act.exposure_dir === "more" ? 1 : -0.5) + (act.exhib_req || 0) * 0.1;
			return score(b) - score(a);
		});
		const top = pool.slice(0, Math.min(4, pool.length));
		return setup.randomchoice(top);
	},

	maybe_exhib_guest_self_adjust(name, force)
	{
		const pc = setup.pc && setup.pc();
		if (!pc || !name || !this.is_tan_exhib_self_guest(name, pc)) return { ok: false, msg: "" };
		if (!force)
		{
			const exhib = setup.people.skill_level(name, "Exhibitionism") || 0;
			let chance = 0.12 + exhib * 0.025;
			if (setup.people.has_any_inclination(name, "just_exhibitionist")) chance += 0.12;
			if (State.random() > chance) return { ok: false, msg: "" };
		}
		const action = this.pick_exhib_guest_self_action(name);
		if (!action) return { ok: false, msg: "" };
		const person = this.get_partner_person(name);
		const legSpread = this.get_partner_leg_spread(name);
		const savedLeg = V.tanlegspread;
		V.tanlegspread = legSpread;
		let applied = false;
		if (action.kind === "legs")
		{
			this._set_partner_leg_spread(name, !!action.spread);
			applied = true;
		}
		else
		{
			applied = this.apply_tan_action(person, action);
		}
		V.tanlegspread = savedLeg;
		if (!applied) return { ok: false, msg: "" };
		this.persist_partner_clothes(name, person);
		const msg = this.exhib_guest_self_narration(name, action);
		if (action.exposure_dir === "more")
		{
			setup.people.alter_attitude(name, "lust", setup.rir(4, 10));
			this.register_tan_witness_memory(pc, name, action.visible_tags || [], this.WITNESS_TIER.glance);
		}
		if (!V.tanGuestSelfMsg) V.tanGuestSelfMsg = {};
		V.tanGuestSelfMsg[name] = msg;
		return { ok: true, msg };
	},

	run_exhib_guest_self_adjustments()
	{
		const pc = setup.pc && setup.pc();
		if (!pc) return [];
		const guests = this.get_exhib_self_tan_guests(pc);
		const out = [];
		for (let i = 0; i < guests.length; i++)
		{
			const result = this.maybe_exhib_guest_self_adjust(guests[i], false);
			if (result.ok && result.msg) out.push(result.msg);
		}
		return out;
	},

	is_controlled_partner(pc, name)
	{
		if (!pc || !name || name === "PC") return false;
		const ED = setup.ExhibitionDate;
		if (ED && ED.can_manage && ED.can_manage(pc, name)) return true;
		if (setup.Relationships.is_sub && setup.Relationships.is_sub(name)) return true;
		if (setup.Relationships.relationship_with(name) === "submissive") return true;
		const control = setup.people.get_attitude(name, "control");
		if (control <= -400 && (setup.people.is_romantic_partner(name) || setup.people.is_bootycall(name)))
			return true;
		return false;
	},

	_clone_clothing_entry(item)
	{
		if (!item) return null;
		if (item.constructor && item.constructor.name === "ClothingItem")
			return clone(item.get_data_structure());
		return clone(item);
	},

	get_partner_person(name)
	{
		if (!name) return null;
		if (setup.ExhibitionDate && setup.ExhibitionDate.partner_person)
		{
			const p = setup.ExhibitionDate.partner_person(name);
			this._load_partner_cum(name, p);
			return p;
		}
		const person = new Person({ person: name });
		const key = setup.people.get_name(name);
		if (V.npcclothingmemory && V.npcclothingmemory[key])
			person.clothes = V.npcclothingmemory[key].map(c => this._clone_clothing_entry(c));
		this._load_partner_cum(name, person);
		return person;
	},

	persist_partner_clothes(name, person)
	{
		if (!name || !person) return;
		const key = setup.people.get_name(name);
		const clothes = [];
		for (let i = 0; i < person.clothes.length; i++)
		{
			const cItem = person.clothes[i].constructor?.name === "ClothingItem"
				? person.clothes[i]
				: new ClothingItem(person.clothes[i]);
			clothes.push(this._clone_clothing_entry(cItem));
		}
		if (!V.npcclothingmemory) V.npcclothingmemory = {};
		V.npcclothingmemory[key] = clothes;
		if (setup.ExhibitionDate && setup.ExhibitionDate.partner_data)
		{
			const data = setup.ExhibitionDate.partner_data(name);
			data.assigned_clothes = clothes.map(c => this._clone_clothing_entry(c));
		}
	},

	_init_partner_tan_state(name)
	{
		if (!name) return;
		if (!V.tanpartnerpose) V.tanpartnerpose = {};
		if (!V.tanpartnerlegspread) V.tanpartnerlegspread = {};
		if (!V.tanpartnerpose[name])
			V.tanpartnerpose[name] = V.tanpose || "back";
	},

	get_controlled_tan_partners()
	{
		const pc = setup.pc && setup.pc();
		if (!pc) return [];
		const guests = V.tanTowelGuests || [];
		const out = [];
		for (let i = 0; i < guests.length; i++)
		{
			const name = guests[i];
			if (name && this.is_controlled_partner(pc, name) && out.indexOf(name) === -1)
				out.push(name);
		}
		if (V.hangout && V.hangout.partner && this.is_controlled_partner(pc, V.hangout.partner))
		{
			if (out.indexOf(V.hangout.partner) === -1 && (guests.includes(V.hangout.partner) || (V.peopleatlocation || []).includes(V.hangout.partner)))
				out.push(V.hangout.partner);
		}
		return out;
	},

	is_out_with_partner()
	{
		return !!(V.hangout && V.hangout.partner);
	},

	resolve_out_about_pose(hangout)
	{
		const h = hangout || V.hangout || {};
		const loc = h.exhib_location || h.location || V.location;
		const activity = h.activity || "";
		const map = this.OUT_ABOUT_POSES;
		let pose = map.activities[activity];
		if (pose == null && activity === "exhibition outing")
			pose = map.locations[loc];
		if (!pose)
			pose = map.locations[loc];
		if (!pose || !this.POSE_VIEW[pose])
			pose = map.default;
		return pose;
	},

	out_about_setting_label(hangout, loc)
	{
		const h = hangout || V.hangout || {};
		const key = h.exhib_location || loc || h.location || V.location;
		const labels = this.OUT_ABOUT_POSES.setting_labels;
		if (labels[key]) return labels[key];
		if (h.activity === "have a park picnic") return "on the picnic blanket";
		if (h.activity === "have dinner") return "at the table";
		if (h.activity === "study together") return "at your study spot";
		if (h.activity === "hit the bowling alley") return "at the lanes";
		if (h.activity === "hit the gym") return "on the gym floor";
		if (h.type === "date") return "on your date";
		return "while you're out together";
	},

	get_out_about_context()
	{
		const h = V.hangout || {};
		const loc = h.exhib_location || h.location || V.location;
		const pose = this.resolve_out_about_pose(h);
		const partner = h.partner;
		const legSpread = !!(V.outaboutlegspread && partner && V.outaboutlegspread[partner]);
		return {
			pose,
			location: loc,
			activity: h.activity || "",
			hangoutType: h.type || "hangout",
			settingLabel: this.out_about_setting_label(h, loc),
			poseLabel: (this.POSE_VIEW[pose] || {}).label || "Out together",
			legSpread,
			partner,
		};
	},

	get_out_leg_spread(partner)
	{
		return !!(V.outaboutlegspread && partner && V.outaboutlegspread[partner]);
	},

	_set_out_leg_spread(partner, spread)
	{
		if (!partner) return;
		if (!V.outaboutlegspread) V.outaboutlegspread = {};
		V.outaboutlegspread[partner] = !!spread;
	},

	get_partner_adjust_pose(name, context)
	{
		if (context === "hangout" || context === "out")
			return this.get_out_about_context().pose;
		if (V.tanpartnerpose && V.tanpartnerpose[name]) return V.tanpartnerpose[name];
		return V.tanpose || "back";
	},

	get_partner_leg_spread(name)
	{
		return !!(V.tanpartnerlegspread && V.tanpartnerlegspread[name]);
	},

	_set_partner_leg_spread(name, spread)
	{
		if (!V.tanpartnerlegspread) V.tanpartnerlegspread = {};
		V.tanpartnerlegspread[name] = !!spread;
	},

	can_order_partner_action(pc, name, action)
	{
		if (!pc || !name || !action) return false;
		if (!this.is_controlled_partner(pc, name)) return false;
		const req = action.exhib_req || 0;
		const ED = setup.ExhibitionDate;
		if (ED && ED.partner_will_do_active)
			return ED.partner_will_do_active(pc, name, Math.max(req, 3));
		if (setup.Relationships.relationship_with(name) === "submissive")
			return pc.skillcheck("Dominance", setup.people.command_difficulty(name) + Math.max(0, req - 3));
		const partnerExhib = setup.people.skill_level(name, "Exhibitionism") || 0;
		if (partnerExhib >= req) return true;
		return pc.skillcheck("Dominance", setup.people.command_difficulty(name) + Math.max(0, req - partnerExhib));
	},

	get_partner_menu_actions(name, context)
	{
		const person = this.get_partner_person(name);
		if (!person) return [];
		const pose = this.get_partner_adjust_pose(name, context);
		const outCtx = (context === "hangout" || context === "out");
		const legSpread = outCtx ? this.get_out_leg_spread(name) : this.get_partner_leg_spread(name);
		const savedLeg = V.tanlegspread;
		V.tanlegspread = legSpread;
		const actions = this.get_tan_menu_actions(person, pose);
		V.tanlegspread = savedLeg;
		for (let i = 0; i < actions.length; i++)
			actions[i].partnerName = name;
		return actions;
	},

	get_pc_out_menu_actions(pc)
	{
		if (!pc) return [];
		const ctx = this.get_out_about_context();
		const savedLeg = V.tanlegspread;
		V.tanlegspread = ctx.legSpread;
		const actions = this.get_tan_menu_actions(pc, ctx.pose);
		V.tanlegspread = savedLeg;
		return actions;
	},

	can_offer_pc_out_adjust(pc)
	{
		if (!pc || !this.is_out_with_partner()) return false;
		if (!this.can_exhibition_tan(pc)) return false;
		return this.get_pc_out_menu_actions(pc).length > 0;
	},

	can_offer_partner_out_adjust(pc)
	{
		pc = pc || (setup.pc && setup.pc());
		if (!pc || !this.is_out_with_partner()) return false;
		return this.is_controlled_partner(pc, V.hangout.partner);
	},

	can_offer_out_exposure(pc)
	{
		return this.can_offer_pc_out_adjust(pc) || this.can_offer_partner_out_adjust(pc);
	},

	partner_action_button_label(name, action)
	{
		const who = setup.people.firstname(name) || name;
		let label = action.button || "";
		label = label.replace(/^▲\s*/, "Tell " + who + " to show more — ");
		label = label.replace(/^▼\s*/, "Tell " + who + " to cover up — ");
		return label;
	},

	partner_displacement_narration(pc, name, action, context)
	{
		if (!action) return "";
		const pr = setup.people.pronouns(name);
		const who = setup.people.firstname(name) || name;
		const outCtx = (context === "hangout" || context === "out");
		const setting = outCtx ? this.get_out_about_context().settingLabel : "on the towel";
		if (action.kind === "legs")
		{
			if (action.spread)
				return "You murmur an order and " + who + " slowly lets " + pr.pp + " knees fall apart " + setting + ".";
			return "You tell " + who + " to press " + pr.pp + " thighs together. " + setup.capitalize(pr.ps) + " obeys, playing innocent.";
		}
		if (action.kind === "adjust" && setup.ExhibitionAdjustment)
		{
			const base = this.adjustment_narration(this.get_partner_person(name), action);
			return base
				.replace(/^You /, "You tell " + who + " to ")
				.replace(/ your /g, " " + pr.pp + " ");
		}
		const cinfo = action.clothing ? this.get_partner_person(name).clothing_archetype(action.clothing) : null;
		const item = cinfo ? cinfo.shortname : "outfit";
		if (action.displacement === "fix")
			return "You tell " + who + " to fix " + pr.pp + " " + item + ". " + setup.capitalize(pr.ps) + " smooths the fabric back into place, blushing.";
		const tags = action.visible_tags || [];
		if (tags.includes("nipple"))
			return "At your word, " + who + " " + action.displacement + "s " + pr.pp + " " + item + " until " + pr.pp + " nipples " + (outCtx ? "peek free" : "catch the sun") + ".";
		if (tags.includes("camel_toe"))
			return "You tell " + who + " to shift " + pr.pp + " " + item + ". The seam digs in shamelessly — exactly what you wanted.";
		if (tags.includes("crotch"))
			return who + " " + action.displacement + "s " + pr.pp + " " + item + " on your order, giving anyone nearby an eyeful.";
		if (tags.includes("butt") || tags.includes("butt_crack") || tags.includes("underbutt"))
			return who + " adjusts " + pr.pp + " " + item + " at your command, baring more ass than " + pr.ps + " would dare alone.";
		return who + " " + action.displacement + "s " + pr.pp + " " + item + " because you told " + pr.po + " to.";
	},

	_partner_refuse_line(name)
	{
		const pr = setup.people.pronouns(name);
		const who = setup.people.firstname(name) || name;
		const pool = [
			who + " shakes " + pr.pp + " head. \"That's too much... not here.\"",
			who + " whispers, \"I can't — people are watching.\"",
			"\"Please, not that,\" " + who + " murmurs, cheeks burning.",
		];
		return setup.randomchoice(pool);
	},

	apply_partner_tan_action(pc, name, action, context)
	{
		if (!pc || !name || !action) return { ok: false, msg: "" };
		if (!this.can_order_partner_action(pc, name, action))
			return { ok: false, msg: this._partner_refuse_line(name) };
		const person = this.get_partner_person(name);
		if (!person) return { ok: false, msg: "" };
		const pose = this.get_partner_adjust_pose(name, context);
		const outCtx = (context === "hangout" || context === "out");
		const legSpread = outCtx ? this.get_out_leg_spread(name) : this.get_partner_leg_spread(name);
		const savedLeg = V.tanlegspread;
		V.tanlegspread = legSpread;
		let applied = false;
		if (action.kind === "legs")
		{
			if (outCtx) this._set_out_leg_spread(name, !!action.spread);
			else this._set_partner_leg_spread(name, !!action.spread);
			applied = true;
		}
		else
		{
			applied = this.apply_tan_action(person, action);
		}
		V.tanlegspread = savedLeg;
		if (!applied) return { ok: false, msg: "" };
		this.persist_partner_clothes(name, person);
		const msg = this.partner_displacement_narration(pc, name, action, context);
		const p = setup.people;
		if (action.exposure_dir === "more")
		{
			p.alter_attitude(name, "lust", setup.rir(6, 14));
			p.alter_attitude(name, "control", setup.rir(4, 10));
			setup.Needs.gain_humiliation(setup.rir(8, 18));
		}
		else if (action.exposure_dir === "less")
		{
			p.alter_attitude(name, "friendship", setup.rir(2, 6));
		}
		if (setup.ExhibitionDate && setup.ExhibitionDate.on_partner_exposure)
		{
			const loc = context === "hangout"
				? (V.hangout && V.hangout.location) || V.location
				: this.get_tan_site_config().exhibLoc;
			const base = 12 + (action.exhib_req || 0) * 2 + (action.exposure_dir === "more" ? 8 : 0);
			setup.ExhibitionDate.on_partner_exposure(pc, name, base, loc);
		}
		if (V.hangout)
		{
			if (action.exposure_dir === "more") V.hangout.heat = (V.hangout.heat || 0) + 2;
			V.hangout.fun = (V.hangout.fun || 0) + 1;
		}
		if (context !== "hangout" && context !== "out" && V.tanpose && action.visible_tags && action.visible_tags.length)
		{
			const tags = action.visible_tags;
			this.register_tan_witness_memory(pc, name, tags, this.WITNESS_TIER.glance);
		}
		return { ok: true, msg };
	},

	out_partner_watch_narration(pc, partner, action, profile)
	{
		if (!partner || !action || action.exposure_dir !== "more") return "";
		const who = setup.people.firstname(partner) || partner;
		const pr = setup.people.pronouns(partner);
		const focus = this.witness_focus_phrase(action.visible_tags || [], pc);
		if (profile.voyeur)
		{
			const pool = [
				who + " goes very still, eyes locked on " + focus + " — drinking in every detail.",
				who + " bites " + pr.pp + " lip and watches shamelessly. \"Keep going,\" " + pr.ps + " murmurs.",
				who + " shifts closer without thinking, hungry to see more of you.",
				"\"I knew you would,\" " + who + " breathes, unable to look away from " + focus + ".",
			];
			return setup.randomchoice(pool);
		}
		if (profile.attracted && profile.shy)
			return who + " blushes but can't stop staring at " + focus + ".";
		if (profile.attracted)
			return who + " watches you, cheeks pink, clearly enjoying the view.";
		if (profile.forward)
			return who + " raises an eyebrow and grins. \"Bold. I like it.\"";
		return who + " notices what you're doing and doesn't look away.";
	},

	react_out_partner_to_pc_exposure(pc, partner, action)
	{
		if (!pc || !partner || !action || action.exposure_dir !== "more") return { msg: "" };
		const profile = this.profile_tan_witness(partner);
		const tags = (action.visible_tags || []).slice();
		if (action.kind === "legs" && action.spread) tags.push("camel_toe");
		const attScore = this.attention_score_for_tags(tags);
		let lustGain = 8 + attScore;
		let funGain = 1;
		let heatGain = 2;
		let romanceGain = 0;
		if (profile.voyeur)
		{
			lustGain = Math.round(lustGain * 1.55);
			funGain += 2;
			heatGain += 2;
		}
		if (profile.attracted)
		{
			lustGain += 5;
			romanceGain = V.hangout && V.hangout.type === "date" ? 1 : 0;
		}
		if (profile.shy && attScore >= 8)
			lustGain = Math.round(lustGain * 1.15);
		setup.people.alter_attitude(partner, "lust", setup.rir(Math.round(lustGain * 0.85), lustGain));
		if (profile.voyeur)
			setup.people.alter_attitude(partner, "friendship", setup.rir(2, 5));
		if (V.hangout)
		{
			V.hangout.fun = (V.hangout.fun || 0) + funGain;
			V.hangout.heat = (V.hangout.heat || 0) + heatGain;
			if (romanceGain) V.hangout.romance = (V.hangout.romance || 0) + romanceGain;
		}
		const tier = profile.voyeur ? this.WITNESS_TIER.voyeur : (profile.attracted ? this.WITNESS_TIER.stare : this.WITNESS_TIER.glance);
		if (tags.length) this.register_tan_witness_memory(pc, partner, tags, tier);
		if (attScore >= 4 && setup.NPCSimulation && setup.NPCSimulation.gain_experience)
		{
			const chance = profile.voyeur ? 0.38 : (profile.attracted ? 0.22 : 0.12);
			setup.NPCSimulation.gain_experience(partner, "Voyeurism", chance);
		}
		if (setup.ExhibitionDate && setup.ExhibitionDate.is_handler && setup.ExhibitionDate.is_handler(pc) && setup.ExhibitionDate.on_partner_exposure)
		{
			const loc = (V.hangout && V.hangout.location) || V.location;
			setup.ExhibitionDate.on_partner_exposure(pc, partner, 10 + attScore, loc);
		}
		return { msg: this.out_partner_watch_narration(pc, partner, action, profile) };
	},

	apply_pc_out_action(pc, action)
	{
		if (!pc || !action) return { ok: false, msg: "", partnerMsg: "" };
		const ctx = this.get_out_about_context();
		const partner = V.hangout && V.hangout.partner;
		const savedLeg = V.tanlegspread;
		V.tanlegspread = ctx.legSpread;
		let applied = false;
		if (action.kind === "legs")
		{
			this._set_out_leg_spread(partner, !!action.spread);
			applied = true;
		}
		else
		{
			applied = this.apply_tan_action(pc, action);
		}
		V.tanlegspread = savedLeg;
		if (!applied) return { ok: false, msg: "", partnerMsg: "" };
		const msg = this.displacement_narration(pc, action);
		let partnerMsg = "";
		if (partner && action.exposure_dir === "more")
		{
			const react = this.react_out_partner_to_pc_exposure(pc, partner, action);
			partnerMsg = react.msg || "";
		}
		else if (partner && action.exposure_dir === "less")
		{
			setup.people.alter_attitude(partner, "friendship", setup.rir(1, 3));
		}
		if (action.exposure_dir === "more")
			setup.Needs.gain_humiliation(setup.rir(4, 12));
		return { ok: true, msg, partnerMsg };
	},

	can_offer_hangout_partner_adjust()
	{
		const pc = setup.pc && setup.pc();
		return this.can_offer_partner_out_adjust(pc);
	},

	out_about_adjust_return()
	{
		if (V.outaboutreturn) return V.outaboutreturn;
		if (setup.ExhibitionDate && setup.ExhibitionDate.hangout_resume_passage && V.hangout && V.hangout.activity === "exhibition outing")
			return setup.ExhibitionDate.hangout_resume_passage();
		return State.passage;
	},

	hangout_partner_adjust_return()
	{
		return this.out_about_adjust_return();
	},

	TAN_SELFIE_TAG_SHOTS: {
		camel_toe: {
			label: "Camel toe angle",
			narrate: "You angle the phone between your thighs, making sure the seam of your suit is the star of the shot.",
		},
		bulge: {
			label: "Bulge outline",
			narrate: "You tilt the phone low across your hips, capturing every outline through damp swim fabric.",
		},
		nipple: {
			label: "Nipple peek",
			narrate: "You frame a close shot where a stiff nipple is clearly visible against your top.",
		},
		areola: {
			label: "Areola show-through",
			narrate: "You snap a pic where your areola shows through the fabric stretched over your chest.",
		},
		breasts: {
			label: "Underboob angle",
			narrate: "You hold the phone low, catching the underside of your breasts spilling from your suit.",
		},
		chest: {
			label: "Cleavage shot",
			narrate: "You angle the phone down your chest, giving the pic a generous view of your cleavage.",
		},
		sideboob: {
			label: "Sideboob shot",
			narrate: "You twist slightly and snap a pic that catches sideboob peeking past your top.",
		},
		crotch: {
			label: "Crotch focus",
			narrate: "You point the camera between your legs, making the crotch of your outfit impossible to ignore.",
		},
		bare_crotch: {
			label: "Bare crotch shot",
			narrate: "You spread your knees enough to snap a shameless pic of your bare crotch in the sun.",
		},
		bare_genitals: {
			label: "Bare genitals shot",
			narrate: "You angle the phone for an unmistakably explicit shot of your bare genitals while you lay out.",
		},
		butt: {
			label: "Ass shot",
			narrate: "You reach back with your phone and snap a pic of your ass on the towel.",
		},
		butt_crack: {
			label: "Butt crack peek",
			narrate: "You twist and snap a pic where your butt crack peeks above your bottoms.",
		},
		underbutt: {
			label: "Underbutt angle",
			narrate: "You angle the phone low behind you, showing the undercurve of your ass in your suit.",
		},
		thigh: {
			label: "Thighs & hips",
			narrate: "You snap a pic that lingers on your thighs and hips, sun-bright and deliberate.",
		},
	},

	_tan_selfie_entry(label, exhib, underwear, naked, props, narrate)
	{
		return [label, exhib, underwear || [], naked || [], props || {}, narrate || ""];
	},

	_push_tan_selfie(menu, seen, entry)
	{
		if (!entry || !entry[0] || seen.has(entry[0])) return;
		seen.add(entry[0]);
		menu.push(entry);
	},

	_tan_part_visible_in_pose(part, pose, legSpread)
	{
		const view = this.get_pose_view(pose);
		if (!view) return false;
		const visible = new Set(view.visible);
		if (pose === "back" && legSpread)
			["crotch", "vagina", "penis", "clitoris", "groin", "thigh"].forEach(p => visible.add(p));
		if (part === "breasts")
			return visible.has("breasts") || visible.has("chest");
		if (part === "butt")
			return visible.has("butt");
		if (part === "vagina" || part === "penis")
			return visible.has(part) || visible.has("crotch") || visible.has("groin");
		return visible.has(part);
	},

	_tan_filter_parts_for_pose(parts, pose, legSpread)
	{
		return (parts || []).filter(p => this._tan_part_visible_in_pose(p, pose, legSpread));
	},

	_tan_visible_passive_exposure(person, pose, legSpread)
	{
		const pasex = person.passive_exhibitionism();
		return [
			this._tan_filter_parts_for_pose(pasex[0], pose, legSpread),
			this._tan_filter_parts_for_pose(pasex[1], pose, legSpread),
		];
	},

	_collect_tan_exposure_tags(person, pose, legSpread)
	{
		const tagSet = new Set(this._active_adjustment_tags(person, pose, legSpread));
		for (let i = 0; i < person.clothes.length; i++)
		{
			const raw = person.clothes[i];
			const cItem = new ClothingItem(raw);
			const cinfo = person.clothing_archetype(raw);
			for (const disp of cItem.get_displacements())
			{
				const visible = this.filter_visible_uncover(cinfo["displace " + disp] || [], pose, legSpread);
				for (const tag of this.anatomy_to_exposure_tags(visible, person, pose, legSpread))
					tagSet.add(tag);
			}
		}
		for (const entry of this.pose_noticeable_parts(person, 2))
		{
			const tag = this._body_part_to_tag(entry.part);
			if (tag) tagSet.add(tag);
		}
		if (pose === "back" && legSpread)
		{
			tagSet.add("thigh");
			if (setup.BodyExposure)
			{
				const ct = setup.BodyExposure.score_camel_toe(person);
				if (ct && ct.score >= 3) tagSet.add("camel_toe");
				const bulge = setup.BodyExposure.score_bulge(person);
				if (bulge && bulge.score >= 3) tagSet.add("bulge");
			}
		}
		return [...tagSet];
	},

	_exhib_for_selfie_tags(tags, person, visibleParts)
	{
		return this.exhib_requirement_for_tags(tags, person, visibleParts);
	},

	_add_tan_tag_selfies(menu, seen, person, pose, legSpread)
	{
		const tags = this._collect_tan_exposure_tags(person, pose, legSpread);
		for (const tag of tags)
		{
			const def = this.TAN_SELFIE_TAG_SHOTS[tag];
			if (!def) continue;
			const visibleParts = (this.EXPOSURE_TAG_WEIGHT[tag] && this.EXPOSURE_TAG_WEIGHT[tag].parts) || [];
			const exhib = this._exhib_for_selfie_tags([tag], person, visibleParts);
			const underwear = [];
			const naked = [];
			if (["bare_genitals", "bare_crotch", "crotch"].includes(tag))
			{
				if (person.has_part("vagina") && this._tan_part_visible_in_pose("vagina", pose, legSpread))
					(person.is_part_covered("vagina") ? underwear : naked).push("vagina");
				if (person.has_part("penis") && this._tan_part_visible_in_pose("penis", pose, legSpread))
					(person.is_part_covered("penis") ? underwear : naked).push("penis");
			}
			if (["nipple", "areola", "breasts", "chest", "sideboob"].includes(tag) && person.has_breasts())
			{
				if (person.is_part_covered("breasts")) underwear.push("breasts");
				else naked.push("breasts");
			}
			if (["butt", "butt_crack", "underbutt"].includes(tag))
			{
				if (person.is_part_covered("butt")) underwear.push("butt");
				else naked.push("butt");
			}
			const props = { lewd: underwear.length > 0 || naked.length > 0, tanning: true };
			if (person.wearing_some_swimwear()) props.swimwear = true;
			this._push_tan_selfie(menu, seen, this._tan_selfie_entry(
				def.label, exhib, underwear, naked, props, def.narrate,
			));
		}
	},

	_add_tan_displaced_selfies(menu, seen, person, pose, legSpread)
	{
		for (let i = 0; i < person.clothes.length; i++)
		{
			const raw = person.clothes[i];
			const cItem = new ClothingItem(raw);
			const cinfo = person.clothing_archetype(raw);
			const disps = cItem.get_displacements();
			if (!disps.length) continue;
			const itemName = setup.capitalize_each(cItem.get_name(true));
			const visible = [];
			for (const disp of disps)
				visible.push(...this.filter_visible_uncover(cinfo["displace " + disp] || [], pose, legSpread));
			const uniqueVisible = [...new Set(visible)];
			if (!uniqueVisible.length) continue;
			const tags = this.anatomy_to_exposure_tags(uniqueVisible, person, pose, legSpread);
			const exhib = this._exhib_for_selfie_tags(tags, person, uniqueVisible);
			const underwear = [];
			const naked = [];
			for (const part of uniqueVisible)
			{
				if (!["breasts", "vagina", "penis", "butt", "nipples"].includes(part)) continue;
				const key = part === "nipples" ? "breasts" : part;
				if (person.is_part_covered(key)) underwear.push(key);
				else naked.push(key);
			}
			const props = { lewd: true, tanning: true, displaced: true };
			this._push_tan_selfie(menu, seen, this._tan_selfie_entry(
				"Current look — " + itemName,
				exhib,
				underwear,
				naked,
				props,
				"You snap a pic exactly as you're showing now, with your " + itemName.toLowerCase() + " displaced and on display in the sun.",
			));
		}
	},

	_add_tan_passive_selfies(menu, seen, person, pose, legSpread)
	{
		const [underwear, naked] = this._tan_visible_passive_exposure(person, pose, legSpread);
		if (underwear.length || naked.length)
		{
			const tags = this.anatomy_to_exposure_tags([...underwear, ...naked], person, pose, legSpread);
			const exhib = this._exhib_for_selfie_tags(tags, person, [...underwear, ...naked]);
			const props = { lewd: true, tanning: true };
			if (person.wearing_some_swimwear()) props.swimwear = true;
			let narrate = "You snap a pic of how you look right now on the towel";
			if (naked.length)
				narrate += ", bare skin on full display.";
			else if (underwear.length)
				narrate += ", underwear peeking where anyone walking by could notice.";
			else if (person.wearing_some_swimwear())
				narrate += ", suit riding exactly where everyone can see.";
			else
				narrate += ", fully dressed on your towel.";
			this._push_tan_selfie(menu, seen, this._tan_selfie_entry(
				"Capture current look",
				exhib,
				underwear.slice(),
				naked.slice(),
				props,
				narrate,
			));
		}
	},

	_add_tan_flash_selfies(menu, seen, person, pose, legSpread)
	{
		if (pose !== "back") return;
		if (person.has_breasts() && person.is_part_covered("breasts"))
		{
			const discoverchance = 0.33;
			this._push_tan_selfie(menu, seen, this._tan_selfie_entry(
				"Flash breasts",
				4,
				[],
				["breasts"],
				{ discoverchance, lewd: true, tanning: true },
				"You " + setup.and(person.clothing_displacements_to_expose("breasts"))
					+ ", flashing your bare breasts long enough to snap a pic.",
			));
		}
		if (person.has_part("vagina") && person.is_part_covered("vagina") && legSpread)
		{
			const partname = !setup.people.is_masc(person) ? "vagina" : "front hole";
			const discoverchance = person.is_upskirt_exhibitionist() ? 0.2 : 0.45;
			this._push_tan_selfie(menu, seen, this._tan_selfie_entry(
				"Flash " + partname,
				5,
				[],
				["vagina"],
				{ discoverchance, lewd: true, tanning: true },
				"You " + setup.and(person.clothing_displacements_to_expose("vagina"))
					+ ", spreading your knees enough to flash your pussy for the camera.",
			));
		}
		if (person.has_part("penis"))
		{
			const discoverchance = person.is_part_covered("penis") ? 0.5 : 0;
			const narrate = person.is_part_covered("penis")
				? "You " + setup.and(person.clothing_displacements_to_expose("penis")) + ", getting your dick out for a sunlit pic."
				: "You angle the phone down your body and snap a shameless dick pic on the towel.";
			this._push_tan_selfie(menu, seen, this._tan_selfie_entry(
				"Dick pic",
				5,
				[],
				["penis"],
				{ discoverchance, lewd: true, tanning: true },
				narrate,
			));
		}
	},

	_add_tan_pose_selfies(menu, seen, person, pose, legSpread)
	{
		if (pose === "back")
		{
			this._push_tan_selfie(menu, seen, this._tan_selfie_entry(
				"Face & sunglasses",
				0,
				[],
				[],
				{ tanning: true },
				"You hold the phone above your face, squinting into the sun with a lazy smile.",
			));
			this._push_tan_selfie(menu, seen, this._tan_selfie_entry(
				"Relaxed on your towel",
				0,
				[],
				[],
				{ tanning: true },
				"You snap a casual pic of yourself laid out on your towel, looking relaxed.",
			));
			this._push_tan_selfie(menu, seen, this._tan_selfie_entry(
				"Arm's-length selfie",
				0,
				[],
				[],
				{ tanning: true },
				"You stretch your arm out for a classic selfie, the mall sun bright behind you.",
			));
			if (person.wearing_some_swimwear())
			{
				const swimExhib = person.wearing_swimwear() ? 1 : 2;
				this._push_tan_selfie(menu, seen, this._tan_selfie_entry(
					"Swimwear upper body",
					swimExhib,
					person.passive_exhibitionism(["breasts"])[0],
					person.passive_exhibitionism(["breasts"])[1],
					{ lewd: swimExhib > 0, swimwear: true, tanning: true },
					"You angle the phone across your chest and stomach, showing off your swimwear in the sun.",
				));
				this._push_tan_selfie(menu, seen, this._tan_selfie_entry(
					"Swimwear full body",
					swimExhib,
					this._tan_visible_passive_exposure(person, pose, legSpread)[0],
					this._tan_visible_passive_exposure(person, pose, legSpread)[1],
					{ lewd: swimExhib > 0, swimwear: true, tanning: true },
					"You prop the phone up and snap a full-body shot of yourself laid out in your swimwear.",
				));
			}
			if (!person.is_part_covered("chest") || !person.is_part_covered("breasts"))
			{
				this._push_tan_selfie(menu, seen, this._tan_selfie_entry(
					"Topless chest",
					4,
					[],
					person.has_breasts() ? ["breasts"] : [],
					{ lewd: true, topless: true, tanning: true },
					"You snap a topless pic of your chest while you lay back in the sun.",
				));
			}
			if (legSpread)
			{
				const tags = ["camel_toe", "crotch", "thigh"];
				const exhib = this._exhib_for_selfie_tags(tags, person, ["crotch", "thigh"]);
				this._push_tan_selfie(menu, seen, this._tan_selfie_entry(
					"Legs-parted shot",
					exhib,
					this._tan_visible_passive_exposure(person, pose, true)[0],
					this._tan_visible_passive_exposure(person, pose, true)[1],
					{ lewd: true, tanning: true, swimwear: person.wearing_some_swimwear() },
					"You let your knees fall open and snap a pic that leaves little to the imagination between your thighs.",
				));
			}
			const [u, n] = this._tan_visible_passive_exposure(person, pose, legSpread);
			if (n.includes("vagina") || n.includes("penis"))
			{
				this._push_tan_selfie(menu, seen, this._tan_selfie_entry(
					"Full body nude",
					10,
					u,
					n,
					{ lewd: true, tanning: true },
					"You prop the phone up for a brazen full-body nude, laid out like you want to be caught.",
				));
			}
		}
		else if (pose === "stomach")
		{
			this._push_tan_selfie(menu, seen, this._tan_selfie_entry(
				"Face over shoulder",
				0,
				[],
				[],
				{ tanning: true },
				"You twist your head back toward the phone, catching a flirty over-the-shoulder face shot.",
			));
			this._push_tan_selfie(menu, seen, this._tan_selfie_entry(
				"Relaxed on your towel",
				0,
				[],
				[],
				{ tanning: true },
				"You snap a casual pic of yourself laid out facedown on your towel.",
			));
			this._push_tan_selfie(menu, seen, this._tan_selfie_entry(
				"Back & shoulders",
				1,
				[],
				[],
				{ tanning: true },
				"You angle the phone to show your bare back and shoulders glistening in the sun.",
			));
			if (person.wearing_some_swimwear())
			{
				const swimExhib = person.wearing_swimwear() ? 2 : 3;
				this._push_tan_selfie(menu, seen, this._tan_selfie_entry(
					"Ass in swimwear",
					swimExhib,
					this._tan_visible_passive_exposure(person, pose, legSpread)[0],
					this._tan_visible_passive_exposure(person, pose, legSpread)[1],
					{ lewd: true, swimwear: true, tanning: true },
					"You reach back and snap a pic of your ass in your swimwear, framed by the towel.",
				));
			}
			const [u, n] = this._tan_visible_passive_exposure(person, pose, legSpread);
			if (n.includes("butt") || u.includes("butt"))
			{
				const exhib = this._exhib_for_selfie_tags(["butt"], person, ["butt"]);
				this._push_tan_selfie(menu, seen, this._tan_selfie_entry(
					"Ass on the towel",
					exhib,
					u.includes("butt") ? ["butt"] : [],
					n.includes("butt") ? ["butt"] : [],
					{ lewd: true, tanning: true },
					"You snap a pic of your ass on full display while you lay on your stomach.",
				));
			}
		}
	},

	build_tan_selfie_menu(person)
	{
		person = person || (setup.pc && setup.pc());
		if (!person || !V.tanpose) return [];
		const pose = V.tanpose;
		const legSpread = !!V.tanlegspread;
		const menu = [];
		const seen = new Set();

		this._add_tan_pose_selfies(menu, seen, person, pose, legSpread);
		this._add_tan_passive_selfies(menu, seen, person, pose, legSpread);
		this._add_tan_displaced_selfies(menu, seen, person, pose, legSpread);
		this._add_tan_tag_selfies(menu, seen, person, pose, legSpread);
		this._add_tan_flash_selfies(menu, seen, person, pose, legSpread);
		this._add_general_clothed_selfies(menu, seen, person, true);

		menu.sort((a, b) => a[1] - b[1] || String(a[0]).localeCompare(String(b[0])));
		return menu;
	},

	_passive_capture_narrate(person, underwear, naked)
	{
		const atTowel = !!V.tanpose;
		let narrate = atTowel
			? "You snap a pic of how you look right now on the towel"
			: "You snap a pic of how you look right now";
		if (naked.length)
			narrate += atTowel ? ", bare skin on full display." : ", showing bare skin.";
		else if (underwear.length)
			narrate += atTowel ? ", underwear peeking where anyone walking by could notice." : ", with your underwear on display.";
		else if (person.wearing_some_swimwear())
			narrate += atTowel ? ", suit riding exactly where everyone can see." : ", in your swimwear.";
		else
			narrate += atTowel ? ", fully dressed on your towel." : ", fully dressed.";
		return narrate;
	},

	_add_general_passive_selfies(menu, seen, person, allowTowelLabel)
	{
		const [underwear, naked] = person.passive_exhibitionism();
		const props = { lewd: !!(underwear.length || naked.length) };
		if (person.wearing_some_swimwear()) props.swimwear = true;
		if (!underwear.length && !naked.length && !props.swimwear) props.clothed = true;
		const label = allowTowelLabel && V.tanpose ? "Capture current look" : "Current look";
		this._push_tan_selfie(menu, seen, this._tan_selfie_entry(
			label,
			props.lewd ? this._exhib_for_selfie_tags([...underwear, ...naked], person, [...underwear, ...naked]) : 0,
			underwear.slice(),
			naked.slice(),
			props,
			this._passive_capture_narrate(person, underwear, naked),
		));
	},

	_add_general_clothed_selfies(menu, seen, person, tanningOnly)
	{
		if (!person || !person.clothes || !person.clothes.length) return;
		if (tanningOnly && !V.tanpose) return;
		const [underwear, naked] = person.passive_exhibitionism();
		if (underwear.length || naked.length) return;
		const props = { clothed: true, tanning: !!V.tanpose };
		if (person.wearing_some_swimwear()) return;
		this._push_tan_selfie(menu, seen, this._tan_selfie_entry(
			"Outfit check",
			0,
			[],
			[],
			props,
			"You snap a full pic of your outfit — casual, but still a look.",
		));
		this._push_tan_selfie(menu, seen, this._tan_selfie_entry(
			"Dressed mirror vibe",
			0,
			[],
			[],
			Object.assign({}, props, { face: true }),
			"You angle the phone for a dressed selfie, head to toe in what you're wearing.",
		));
	},

	_add_general_displaced_selfies(menu, seen, person)
	{
		for (let i = 0; i < person.clothes.length; i++)
		{
			const raw = person.clothes[i];
			const cItem = new ClothingItem(raw);
			const cinfo = person.clothing_archetype(raw);
			const disps = cItem.get_displacements();
			if (!disps.length) continue;
			const itemName = setup.capitalize_each(cItem.get_name(true));
			const visible = [];
			for (const disp of disps)
				visible.push(...(cinfo["displace " + disp] || []));
			const uniqueVisible = [...new Set(visible)];
			if (!uniqueVisible.length) continue;
			const tags = this.anatomy_to_exposure_tags(uniqueVisible, person, V.tanpose, !!V.tanlegspread);
			const exhib = this._exhib_for_selfie_tags(tags, person, uniqueVisible);
			const underwear = [];
			const naked = [];
			for (const part of uniqueVisible)
			{
				if (!["breasts", "vagina", "penis", "butt", "nipples"].includes(part)) continue;
				const key = part === "nipples" ? "breasts" : part;
				if (person.is_part_covered(key)) underwear.push(key);
				else naked.push(key);
			}
			this._push_tan_selfie(menu, seen, this._tan_selfie_entry(
				"Current look — " + itemName,
				exhib,
				underwear,
				naked,
				{ lewd: true, displaced: true, tanning: !!V.tanpose },
				"You snap a pic with your " + itemName.toLowerCase() + " displaced — exactly how you're showing right now.",
			));
		}
	},

	_add_general_flash_selfies(menu, seen, person)
	{
		if (person.has_breasts() && person.is_part_covered("breasts"))
		{
			this._push_tan_selfie(menu, seen, this._tan_selfie_entry(
				"Flash breasts",
				4,
				[],
				["breasts"],
				{ discoverchance: V.tanpose ? 0.33 : 0.15, lewd: true, tanning: !!V.tanpose },
				"You " + setup.and(person.clothing_displacements_to_expose("breasts"))
					+ ", flashing your bare breasts long enough to snap a pic.",
			));
		}
		if (person.has_part("vagina") && person.is_part_covered("vagina"))
		{
			const partname = !setup.people.is_masc(person) ? "vagina" : "front hole";
			this._push_tan_selfie(menu, seen, this._tan_selfie_entry(
				"Flash " + partname,
				5,
				[],
				["vagina"],
				{ discoverchance: person.is_upskirt_exhibitionist() ? 0.2 : 0.35, lewd: true, tanning: !!V.tanpose },
				"You " + setup.and(person.clothing_displacements_to_expose("vagina"))
					+ ", getting a risky pic in before you cover up again.",
			));
		}
		if (person.has_part("penis"))
		{
			const discoverchance = person.is_part_covered("penis") ? 0.4 : 0;
			const narrate = person.is_part_covered("penis")
				? "You " + setup.and(person.clothing_displacements_to_expose("penis")) + ", getting your dick out for a pic."
				: "You angle the phone down and snap a shameless dick pic.";
			this._push_tan_selfie(menu, seen, this._tan_selfie_entry(
				"Dick pic",
				5,
				[],
				["penis"],
				{ discoverchance, lewd: true, tanning: !!V.tanpose },
				narrate,
			));
		}
	},

	build_phone_selfie_menu(person)
	{
		person = person || (setup.pc && setup.pc());
		if (!person) return [];
		const menu = [];
		const seen = new Set();
		this._push_tan_selfie(menu, seen, this._tan_selfie_entry(
			"Face closeup", 0, [], [], {}, "You snap a quick pic of your face.",
		));
		this._add_general_passive_selfies(menu, seen, person, false);
		this._add_general_clothed_selfies(menu, seen, person, false);
		this._add_general_displaced_selfies(menu, seen, person);
		this._add_general_flash_selfies(menu, seen, person);
		if (V.tanpose)
		{
			for (const entry of this.build_tan_selfie_menu(person))
				this._push_tan_selfie(menu, seen, entry);
		}
		menu.sort((a, b) => a[1] - b[1] || String(a[0]).localeCompare(String(b[0])));
		return menu;
	},

	augment_phone_selfie_menu(menu, person)
	{
		menu = menu || [];
		person = person || (setup.pc && setup.pc());
		if (!person) return menu;
		const seen = new Set(menu.map(e => e && e[0]).filter(Boolean));
		const labels = seen;
		if (!labels.has("Capture current look") && !labels.has("Current look"))
			this._add_general_passive_selfies(menu, seen, person, !!V.tanpose);
		this._add_general_clothed_selfies(menu, seen, person, !!V.tanpose);
		this._add_general_displaced_selfies(menu, seen, person);
		if (V.tanpose)
		{
			for (const entry of this.build_tan_selfie_menu(person))
				this._push_tan_selfie(menu, seen, entry);
		}
		menu.sort((a, b) => a[1] - b[1] || String(a[0]).localeCompare(String(b[0])));
		return menu;
	},

	get_tan_site_noun()
	{
		return this.get_tanning_site() === "UniversityLakeBeach" ? "the lake beach" : "the mall";
	},

	get_selfie_context_noun()
	{
		if (V.tanpose) return this.get_tan_site_noun();
		return "out";
	},

	classify_tan_selfie(selfie)
	{
		const props = (selfie && selfie[4]) || {};
		const naked = (selfie && selfie[3]) || [];
		const underwear = (selfie && selfie[2]) || [];
		let tier = "casual";
		if (naked.includes("vagina") || naked.includes("penis")) tier = "nude";
		else if (naked.includes("breasts") || props.topless) tier = "topless";
		else if (underwear.length > 0 || props.lewd || props.displaced) tier = "lewd";
		else if (props.swimwear) tier = "swim";
		else if (!props.lewd && underwear.length === 0 && naked.length === 0) tier = "clothed";
		return {
			tier,
			label: selfie ? selfie[0] : "",
			pose: V.tanpose,
			legSpread: !!V.tanlegspread,
			site: this.get_tan_site_noun(),
			tags: props.tanTags || [],
		};
	},

	get_tan_elkbook_post_text(selfie)
	{
		const info = this.classify_tan_selfie(selfie);
		if (info.tier === "nude") return "Laying out at " + info.site + ". Definitely getting some sun everywhere.";
		if (info.tier === "topless") return "Tanning at " + info.site + " — topless and shameless.";
		if (info.tier === "lewd") return "Laying out at " + info.site + ". The camera caught more than my tan lines.";
		if (info.tier === "swim") return "Laying out at " + info.site + " in my swimwear.";
		return "Laying out in the sun at " + info.site + ".";
	},

	_format_tan_reply_line(line, npc)
	{
		if (!line) return "";
		const pc = setup.pc && setup.pc();
		const pcName = pc && pc.firstname ? pc.firstname() : "you";
		const nick = V.pcnickname || pcName;
		const npcName = npc && setup.people.firstname ? setup.people.firstname(npc) : "someone";
		return String(line)
			.replace(/%pc%/g, pcName)
			.replace(/%nick%/g, nick)
			.replace(/%npc%/g, npcName)
			.replace(/%site%/g, this.get_selfie_context_noun());
	},

	_pick_from_pool(pool, npc)
	{
		if (!pool || !pool.length) return "";
		return this._format_tan_reply_line(setup.randomchoice(pool), npc);
	},

	_reply_entry(text, mood)
	{
		return { text, mood };
	},

	_pick_reply_entry(pool, npc)
	{
		if (!pool || !pool.length) return { text: "...", mood: "neutral" };
		const raw = setup.randomchoice(pool);
		if (typeof raw === "string")
			return { text: this._format_tan_reply_line(raw, npc), mood: this._classify_npc_reply_mood(raw) };
		return {
			text: this._format_tan_reply_line(raw.text, npc),
			mood: raw.mood || this._classify_npc_reply_mood(raw.text),
		};
	},

	_classify_npc_reply_mood(text)
	{
		const t = String(text || "").toLowerCase();
		if (/keep going|don't stop|not mad|not going to|send (the )?next|more please|yes\.|god yes|on my way|meet me|feral|immediately/.test(t))
			return "encouraging";
		if (/holy|damn|wow|hot|🔥|sexy|feral|win/.test(t))
			return "enthusiastic";
		if (/gross|nobody asked|seek attention|must be nice|why are you texting|don't text|unhinged|need help|need jesus|reported|banned|trouble|scold|lecture|can't send|shouldn't|careful/.test(t))
			return "scolding";
		if (/what|delete|cops|blocked|hell|wrong person|uhhh/.test(t))
			return "shocked";
		if (/cute|relaxed|thanks|nice|looking good|enjoy|ttyl|save me/.test(t))
			return "warm";
		if (/wish|jealous|flirt|into it|liked it|fine\.|don't apologize/.test(t))
			return "flirty";
		return "neutral";
	},

	TAN_SELFIE_TIER_RANK: { clothed: 0, casual: 0, swim: 1, lewd: 2, topless: 3, nude: 4 },

	get_tan_selfie_image_html(selfie)
	{
		if (!selfie) return "";
		const naked = selfie[3] || [];
		const underwear = selfie[2] || [];
		const props = selfie[4] || {};
		const pc = setup.pc && setup.pc();
		let selfieclass = pc && setup.people.is_femme(pc) ? "femme" : "masc";
		let selfietype = "";
		if (naked.includes("penis") || naked.includes("vagina"))
		{
			selfietype = "naked";
			if (pc && pc.has_part && pc.has_part("penis")) selfieclass = "masc";
		}
		else if (naked.includes("breasts") || props.topless)
		{
			selfietype = "topless";
			selfieclass = "femme";
		}
		else if (underwear.length > 0)
			selfietype = "underwear";
		let img = "selfie_" + selfieclass;
		if (selfietype) img += "_" + selfietype;
		return '<img class="tan-selfie-thumb" src="res/img/' + img + '.png" alt="' + (selfie[0] || "selfie") + '">';
	},

	_elkbook_reply_pool(info, desrel, npc)
	{
		const known = setup.people.is_known(npc);
		const attracted = setup.people.attracted_enough_to_pc(npc);
		const pools = {
			casual: {
				friend: ["Looking good %nick%!", "Cute tan line energy at %site%", "Enjoy the sun %pc%!"],
				fuckbuddy: ["Hot. Come tan together sometime", "Now I wanna find you at %site%"],
				date: ["You look great out there %pc%", "Wish I was laid out next to you"],
				rival: ["Nobody cares %pc%", "Must be nice to have time to lounge around"],
				default: ["Nice!", "Cute pic", known ? "Looking relaxed %nick%" : "Looking relaxed"],
			},
			swim: {
				friend: ["Ok swimwear pic!", "%site% looks fun", "Serve the sun %nick%"],
				fuckbuddy: ["That suit is doing a lot of work", "Come find me when you're done baking"],
				date: ["Very cute. Save me a spot on the towel?"],
				rival: ["We get it, you own a swimsuit"],
				default: ["Nice swim pic!", "Looking good"],
			},
			lewd: {
				friend: ["Umm. Ok?", "Bold choice for %site% %nick%", "My whole timeline is you and sunscreen"],
				fuckbuddy: ["Fuck. Meet me after you're done?", "You are trouble in the sun", "Keep going 🔥"],
				date: ["I don't know whether to blush or come find you", "Are you trying to kill me at %site%?"],
				hatefuck: ["Saved before Elkbook deletes it", "You're insane. I love it"],
				rival: ["Gross. Delete this", "Seek attention much?"],
				default: attracted
					? ["Holy shit", "That's hot", "Damn %nick%"]
					: ["What am I looking at", "Bold post"],
			},
			topless: {
				friend: ["WHOA %nick%", "Elkbook is gonna nuke this", "What are you DOING %nick%"],
				fuckbuddy: ["Yes. More. Immediately.", "I'm on my way to %site%"],
				date: ["You can't just post that while I'm in class", "Why are you like this. Keep going."],
				rival: ["Reported.", "Seek help"],
				default: ["Holy shit", "Wow"],
			},
			nude: {
				friend: ["I'm calling the police (joking???)", "%nick% WHAT", "This is getting deleted in 5 seconds"],
				fuckbuddy: ["I am sprinting to %site%", "You win. Holy fuck"],
				date: ["I can't believe I know you", "Meet me. Now."],
				hatefuck: ["Spank bank updated. Thanks", "Legendary post"],
				rival: ["Banned. Immediately.", "You need Jesus"],
				default: ["WHAT", "Holy shit"],
			},
		};
		const tierPools = pools[info.tier] || pools.casual;
		if (tierPools[desrel]) return tierPools[desrel];
		if (desrel === "hatefuck" && tierPools.hatefuck) return tierPools.hatefuck;
		return tierPools.default || pools.casual.default;
	},

	apply_elkbook_reply_attitude(npc, info, desrel)
	{
		if (!npc) return;
		const p = setup.people;
		if (info.tier === "nude" || info.tier === "topless" || info.tier === "lewd")
		{
			if (desrel === "rival")
				p.alter_attitude(npc, "friendship", -setup.rir(2, 5));
			else if (desrel === "fuckbuddy" || desrel === "hatefuck")
				p.alter_attitude(npc, "lust", setup.rir(5, 8));
			else if (desrel === "date")
			{
				p.alter_attitude(npc, "lust", setup.rir(5, 8));
				p.alter_attitude(npc, "romance", -setup.rir(2, 5));
			}
			else if (p.attracted_enough_to_pc(npc))
				p.alter_attitude(npc, "lust", setup.rir(5, 8));
			else if (desrel === "friend")
				p.alter_attitude(npc, "friendship", setup.rir(-2, 2));
		}
		else if (["friend", "fuckbuddy", "date"].includes(desrel))
			p.alter_attitude(npc, "friendship", setup.rir(2, 5));
		else if (desrel === "rival" || desrel === "hatefuck")
			p.alter_attitude(npc, "friendship", -setup.rir(2, 5));
	},

	pick_tan_elkbook_reply(npc, selfie)
	{
		const info = this.classify_tan_selfie(selfie);
		const desrel = setup.people.desired_relationship(npc);
		const pool = this._elkbook_reply_pool(info, desrel, npc);
		this.apply_elkbook_reply_attitude(npc, info, desrel);
		return this._pick_from_pool(pool, npc);
	},

	_resolve_phone_reply_pool(tierPools, desrel)
	{
		if (tierPools[desrel]) return tierPools[desrel];
		if (desrel === "hatefuck" && tierPools.hatefuck) return tierPools.hatefuck;
		return tierPools.default || [];
	},

	_phone_reply_pool(info, desrel, npc)
	{
		const attracted = setup.people.attracted_enough_to_pc(npc);
		const poseHint = info.pose === "stomach" ? "that ass shot" : "that pic";
		const pools = {
			clothed: {
				friend: [
					this._reply_entry("Cute! What are you up to?", "warm"),
					this._reply_entry("Looking good %pc%", "warm"),
					this._reply_entry("Nice outfit tbh", "warm"),
				],
				fuckbuddy: [
					this._reply_entry("Cute. Got any more where that came from?", "flirty"),
					this._reply_entry("You look good dressed. Bet you look better undressed.", "flirty"),
				],
				date: [
					this._reply_entry("You look happy", "warm"),
					this._reply_entry("Very cute %pc%", "warm"),
				],
				rival: [
					this._reply_entry("Why are you texting me?", "shocked"),
					this._reply_entry("Nobody asked for this %pc%", "scolding"),
				],
				hatefuck: [
					this._reply_entry("You're annoying. Send more.", "encouraging"),
					this._reply_entry("Fine. You look good. Happy?", "scolding"),
				],
				indifferent: [
					this._reply_entry("Ok", "neutral"),
					this._reply_entry("Cool I guess", "neutral"),
				],
				default: [this._reply_entry("Nice pic", "warm")],
			},
			casual: {
				friend: [
					this._reply_entry("Cute! Still at %site%?", "warm"),
					this._reply_entry("Haha nice. How's it going?", "warm"),
				],
				fuckbuddy: [
					this._reply_entry("Cute. Got any more where that came from?", "flirty"),
					this._reply_entry("Wish I was there with you", "flirty"),
				],
				date: [
					this._reply_entry("You look happy out there", "warm"),
					this._reply_entry("Very cute %pc%", "warm"),
				],
				rival: [
					this._reply_entry("Why are you texting me this", "shocked"),
					this._reply_entry("Must be nice to have free time %pc%", "scolding"),
				],
				hatefuck: [
					this._reply_entry("Stop. ...Send another.", "encouraging"),
					this._reply_entry("You're a menace. I like it.", "flirty"),
				],
				default: [this._reply_entry("Nice selfie!", "warm")],
			},
			swim: {
				friend: [
					this._reply_entry("Ok the suit pic is cute", "warm"),
					this._reply_entry("Serving vibes at %site%", "warm"),
				],
				fuckbuddy: [
					this._reply_entry("That swimsuit should be illegal", "flirty"),
					this._reply_entry("Come find me after %site%", "flirty"),
				],
				date: [
					this._reply_entry("Very hot. In both senses.", "flirty"),
					this._reply_entry("I'm jealous of your spot", "warm"),
				],
				rival: [
					this._reply_entry("We get it, you own swimwear", "scolding"),
					this._reply_entry("Seek attention much?", "scolding"),
				],
				hatefuck: [
					this._reply_entry("Unfair. You look too good.", "enthusiastic"),
					this._reply_entry("Keep them coming.", "encouraging"),
				],
				default: [this._reply_entry("Hot pic!", "warm")],
			},
			lewd: {
				friend: [
					this._reply_entry("Uhhh ok?", "shocked"),
					this._reply_entry("Bold move %pc%", "scolding"),
				],
				fuckbuddy: [
					this._reply_entry("Fuck. " + poseHint + " though", "enthusiastic"),
					this._reply_entry("Don't stop. I'm replying one-handed", "encouraging"),
				],
				date: [
					this._reply_entry("You can't send me that while I'm in lecture", "scolding"),
					this._reply_entry("I should scold you. I won't.", "encouraging"),
				],
				rival: [
					this._reply_entry("Why are you texting me this", "shocked"),
					this._reply_entry("Blocked. (Not really but wow)", "shocked"),
				],
				hatefuck: [
					this._reply_entry("You're insane. Send more.", "encouraging"),
					this._reply_entry("Saved before I come to my senses.", "enthusiastic"),
				],
				default: attracted
					? [
						this._reply_entry("Damn", "enthusiastic"),
						this._reply_entry("More please", "encouraging"),
					]
					: [
						this._reply_entry("What the hell %pc%", "shocked"),
						this._reply_entry("Wrong person?", "confused"),
					],
			},
			topless: {
				fuckbuddy: [
					this._reply_entry("Yes. Immediately.", "encouraging"),
					this._reply_entry("I'm leaving work early.", "enthusiastic"),
					this._reply_entry("God yes", "enthusiastic"),
				],
				date: [
					this._reply_entry("You are going to get us both in trouble.", "scolding"),
					this._reply_entry("I should scold you. I'm not going to.", "encouraging"),
					this._reply_entry("Keep going. I'm not mad.", "encouraging"),
				],
				friend: [
					this._reply_entry("WHAT.", "shocked"),
					this._reply_entry("Delete this after I finish looking.", "flirty"),
					this._reply_entry("My phone just got a tan too.", "enthusiastic"),
				],
				rival: [
					this._reply_entry("Gross. Delete this.", "shocked"),
					this._reply_entry("Reported. (Not really.)", "scolding"),
				],
				hatefuck: [
					this._reply_entry("Holy shit. Again.", "encouraging"),
					this._reply_entry("You're going to ruin me.", "enthusiastic"),
				],
				default: [
					this._reply_entry("Holy shit", "enthusiastic"),
					this._reply_entry("Wow %pc%", "warm"),
				],
			},
			nude: {
				fuckbuddy: [
					this._reply_entry("On my way to %site%", "enthusiastic"),
					this._reply_entry("I am feral now thanks", "enthusiastic"),
					this._reply_entry("You win. Holy fuck.", "encouraging"),
				],
				date: [
					this._reply_entry("Meet me. Now.", "enthusiastic"),
					this._reply_entry("I cannot believe you texted that from a towel", "shocked"),
				],
				friend: [
					this._reply_entry("I'm calling the cops (kidding???)", "shocked"),
					this._reply_entry("WHAT", "shocked"),
					this._reply_entry("Delete delete delete (but wow)", "flirty"),
				],
				rival: [
					this._reply_entry("You need help.", "shocked"),
					this._reply_entry("Absolutely not. Wow though.", "shocked"),
				],
				hatefuck: [
					this._reply_entry("I am feral now thanks", "enthusiastic"),
					this._reply_entry("On my way.", "enthusiastic"),
				],
				default: [
					this._reply_entry("WHAT", "shocked"),
					this._reply_entry("Holy shit %pc%", "enthusiastic"),
				],
			},
		};
		return this._resolve_phone_reply_pool(pools[info.tier] || pools.casual, desrel);
	},

	apply_phone_selfie_reply_attitude(npc, selfie)
	{
		if (!npc) return;
		const info = this.classify_tan_selfie(selfie);
		const desrel = setup.people.desired_relationship(npc);
		const p = setup.people;
		if (!V.textedtoday) V.textedtoday = [];
		if (V.textedtoday.includes(npc)) return;
		if (info.tier === "nude" || info.tier === "topless" || info.tier === "lewd")
		{
			if (p.attracted_enough_to_pc(npc))
				p.alter_attitude(npc, "lust", setup.rir(2, 5));
			if (p.willing_date && p.willing_date(npc))
			{
				if (p.willing_sex && p.willing_sex(npc))
					p.alter_attitude(npc, "romance", setup.rir(2, 5));
				else
					p.alter_attitude(npc, "romance", -setup.rir(2, 5));
			}
		}
		else if (["friend", "fuckbuddy", "date"].includes(desrel))
			p.alter_attitude(npc, "friendship", setup.rir(2, 5));
		else if (desrel === "rival" || desrel === "hatefuck")
			p.alter_attitude(npc, "friendship", -setup.rir(1, 4));
		V.textedtoday.push(npc);
	},

	prepare_tan_phone_selfie_reply(npc, selfie)
	{
		npc = npc || V.phoneselfietarget || V.tanphoneselfietarget;
		selfie = selfie || V.phoneselfiesent;
		if (!npc || !selfie) return "";
		return this._pick_initial_npc_reply(npc, selfie).text;
	},

	TAN_SELFIE_CONVO_MAX_TURNS: 3,
	TAN_SELFIE_CONVO_MAX_PHOTOS: 3,
    TAN_SELFIE_CONVO_OPTIONS_SHOWN: 5,

	_convo_add_line(from, text, extra)
	{
		if (!V.phoneselfiesession) return;
		const line = { from, text: text || "" };
		if (extra) Object.assign(line, extra);
		V.phoneselfiesession.lines.push(line);
	},

	_phone_convo_send(msg)
	{
		if (!msg) return;
		if (!V.phoneconvo) V.phoneconvo = [];
		V.phoneconvo.push(["send", msg]);
	},

	_phone_convo_receive(npc, text)
	{
		if (!text || !npc) return;
		if (!V.phoneconvo) V.phoneconvo = [];
		const msg = setup.people.text_msg(npc, text);
		V.phoneconvo.push(["receive", msg]);
	},

	_convo_set_npc_mood(session, mood)
	{
		if (!session) return;
		session.lastNpcMood = mood || "neutral";
		if (mood === "encouraging" || mood === "enthusiastic" || mood === "flirty")
			session.encouragement = (session.encouragement || 0) + 1;
	},

	_pick_initial_npc_reply(npc, selfie)
	{
		if (V.selfierequest && V.selfierequest[npc])
		{
			const naked = selfie[3] || [];
			const requested = V.selfierequest[npc];
			const fulfilled = Array.isArray(requested) && requested.every(p => naked.includes(p));
			delete V.selfierequest[npc];
			if (fulfilled && setup.phone && setup.phone.get_response)
			{
				const msg = setup.phone.get_response(npc, "fulfilled selfie request");
				if (msg) return { text: this._format_tan_reply_line(msg, npc), mood: "encouraging" };
			}
			else if (setup.phone && setup.phone.get_response)
			{
				const msg = setup.phone.get_response(npc, "mismatch selfie request");
				if (msg) return { text: this._format_tan_reply_line(msg, npc), mood: "scolding" };
			}
		}
		const pool = this._phone_reply_pool(
			this.classify_tan_selfie(selfie),
			setup.people.desired_relationship(npc),
			npc,
		);
		return this._pick_reply_entry(pool, npc);
	},

	_pick_followup_selfie_npc_reply(npc, selfie, session)
	{
		const info = this.classify_tan_selfie(selfie);
		const desrel = setup.people.desired_relationship(npc);
		const bolder = (session.maxExhibSent || 0) < (selfie[1] || 0);
		let pool;
		if (bolder && (info.tier === "nude" || info.tier === "topless"))
			pool = [
				this._reply_entry("Jesus. You actually sent another.", "enthusiastic"),
				this._reply_entry("You're going to get arrested. Send more.", "encouraging"),
				this._reply_entry("I can't look away.", "enthusiastic"),
			];
		else if (bolder)
			pool = [
				this._reply_entry("Ok that one's worse. In a good way.", "flirty"),
				this._reply_entry("You're really pushing it now.", "scolding"),
				this._reply_entry("More. Don't stop now.", "encouraging"),
			];
		else
			pool = this._phone_reply_pool(info, desrel, npc);
		return this._pick_reply_entry(pool, npc);
	},

	_phone_followup_pool(info, desrel, tone)
	{
		const pools = {
			bold: {
				fuckbuddy: ["Keep going.", "You're gonna get us caught.", "Send the next one faster."],
				date: ["Damn right it was.", "You're impossible. Don't stop.", "Meet me after you're done laying out."],
				friend: ["You're wild %pc%.", "Ok but delete after I look.", "The mall has cameras, you know."],
				rival: ["You're unhinged.", "I'm not deleting it.", "Why are you like this %pc%."],
				hatefuck: ["You're a menace. Don't stop.", "Awful. Send another.", "You're going to ruin me."],
				indifferent: ["Ok then.", "Sure.", "Whatever."],
				default: ["Worth it.", "You're trouble.", "Ok wow."],
			},
			flirty: {
				fuckbuddy: ["I do. A lot.", "Get over here.", "You're making this hard to ignore."],
				date: ["I like it a lot.", "Come prove it in person.", "You're making it hard to focus on anything else."],
				friend: ["Flirt much?", "Serving looks at %site%.", "Ok that was hot."],
				rival: ["Stop.", "Gross.", "Don't text me this."],
				hatefuck: ["You're impossible.", "Fine. I liked it.", "Don't flirt with me. (Keep going.)"],
				indifferent: ["Huh?", "Ok...", "What?"],
				default: ["I see you.", "Looking good.", "Careful, I might flirt back."],
			},
			apologetic: {
				fuckbuddy: ["Don't apologize to me.", "It's fine. I liked it.", "You worry too much."],
				date: ["It's fine. I didn't mind.", "Don't apologize. I liked it.", "You worry too much."],
				friend: ["It's ok lol", "Too much? Nah.", "You're fine %pc%."],
				rival: ["Too late for sorry.", "Don't do it again.", "Yeah you should be."],
				hatefuck: ["Don't apologize. I liked it.", "You're fine. Keep going.", "Stop saying sorry."],
				indifferent: ["It's fine.", "Ok.", "Sure."],
				default: ["It's alright.", "No worries.", "Didn't bother me."],
			},
			casual: {
				fuckbuddy: ["Later then.", "Hit me when you're free.", "Don't leave me hanging."],
				date: ["Talk soon.", "Save me a spot on the towel.", "Miss you already."],
				friend: ["Anytime!", "Enjoy the sun.", "ttyl %pc%"],
				rival: ["Bye.", "Don't text me this again.", "Whatever %pc%."],
				hatefuck: ["Later, menace.", "Text me when you're done.", "Bye. Send more later."],
				indifferent: ["Ok.", "Later.", "Bye."],
				default: ["Later!", "Thanks.", "Talk soon."],
			},
		};
		const tonePools = pools[tone] || pools.casual;
		if (tonePools[desrel]) return tonePools[desrel];
		return tonePools.default || pools.casual.default;
	},

	pick_tan_selfie_npc_followup(npc, selfie, opt)
	{
		let text = "";
		let mood = "neutral";
		const desrel = setup.people.desired_relationship(npc);
		const lane = this._resolve_selfie_reply_lane({ target: npc, desrel });
		const skipGamePool = ["rival", "hater", "indifferent", "professor"].includes(lane)
			|| (lane === "hatefuck" && opt && ["bold", "flirty"].includes(opt.tone));
		if (!skipGamePool && opt && opt.replyTags && setup.phone && setup.phone.get_response)
		{
			const msg = setup.phone.get_response(npc, opt.replyTags);
			if (msg)
			{
				text = this._format_tan_reply_line(msg, npc);
				mood = this._classify_npc_reply_mood(text);
			}
		}
		if (!text)
		{
			const info = this.classify_tan_selfie(selfie);
			const desrel = setup.people.desired_relationship(npc);
			const pool = this._phone_followup_pool(info, desrel, (opt && opt.tone) || "casual");
			const entry = this._pick_reply_entry(pool, npc);
			text = entry.text;
			mood = entry.mood;
		}
		return { text, mood };
	},

	_selfie_convo_join_text(session)
	{
		return session && session.context === "phone"
			? "wanna hang out later?"
			: "still at the towel if you wanna join";
	},

	_selfie_convo_bye_text(session)
	{
		return session && session.context === "phone"
			? "ttyl!"
			: "gotta get back to tanning";
	},

	_get_selfie_desrel(session)
	{
		session = session || V.phoneselfiesession;
		if (!session) return "default";
		if (session.desrel) return session.desrel;
		if (!session.target) return "default";
		return setup.people.desired_relationship(session.target);
	},

	_is_rival_desrel(desrel)
	{
		return desrel === "rival";
	},

	_is_hatefuck_desrel(desrel)
	{
		return desrel === "hatefuck";
	},

	_is_cold_desrel(desrel)
	{
		return desrel === "rival" || desrel === "hatefuck" || desrel === "indifferent";
	},

	_selfie_reply_pick(id, text, extra)
	{
		return Object.assign({
			id, text, tone: "casual", replyTags: ["phone response", "positive selfie reply"],
		}, extra || {});
	},

	_selfie_reply_tags()
	{
		return {
			pos: ["phone response", "positive selfie reply"],
			flirty: ["phone response", "flirty selfie reply"],
			lewd: ["phone response", "lewd selfie reply"],
			confused: ["phone response", "confused selfie reply"],
			neg: ["phone response", "negative selfie reply"],
		};
	},

	_selfie_bolder_pick(session, id, text, extra)
	{
		const canSendMore = (session.photoCount || 1) < this.TAN_SELFIE_CONVO_MAX_PHOTOS;
		if (!canSendMore) return null;
		return this._selfie_reply_pick(id, text, Object.assign({
			action: "pick_selfie",
			boldBoost: 1,
			pendingText: text,
			tone: "bold",
			selfiePrompt: "Pick something bolder to send.",
		}, extra || {}));
	},

	_resolve_selfie_reply_lane(session)
	{
		session = session || V.phoneselfiesession;
		const npc = session && session.target;
		if (!npc) return "indifferent";
		const p = setup.people;
		const desrel = this._get_selfie_desrel(session);
		if (p.is_romantic_partner(npc)) return "partner";
		if (V.bestfriend === npc) return "bestfriend";
		if (p.is_professor(npc)) return "professor";
		const control = p.get_attitude(npc, "control");
		if (control >= 400) return "dom";
		if (control <= -400) return "sub";
		if (p.is_ex(npc)) return "ex";
		if (p.is_crush(npc) || V.crush === npc) return "admirer";
		if (p.is_hater(npc) && desrel !== "hatefuck") return "hater";
		if (p.is_rival(npc) || desrel === "rival") return "rival";
		if (desrel === "hatefuck") return "hatefuck";
		if (desrel === "fuckbuddy" || p.is_bootycall(npc)) return "fuckbuddy";
		if (desrel === "date") return "date";
		if (desrel === "friend") return "friend";
		if (p.get_attitude(npc, "friendship") >= 200) return "acquaintance";
		if (desrel === "indifferent") return "indifferent";
		return desrel || "indifferent";
	},

	_get_selfie_convo_profile(session)
	{
		session = session || V.phoneselfiesession;
		const npc = session && session.target;
		const p = setup.people;
		const lane = this._resolve_selfie_reply_lane(session);
		return {
			lane,
			desrel: this._get_selfie_desrel(session),
			target: npc,
			friendship: npc ? p.get_attitude(npc, "friendship") : 0,
			lust: npc ? p.get_attitude(npc, "lust") : 0,
			romance: npc ? p.get_attitude(npc, "romance") : 0,
			control: npc ? p.get_attitude(npc, "control") : 0,
			attracted: npc ? p.attracted_enough_to_pc(npc) : false,
			isPartner: npc ? p.is_romantic_partner(npc) : false,
			isEx: npc ? p.is_ex(npc) : false,
			isCrush: npc ? (p.is_crush(npc) || V.crush === npc) : false,
			isHater: npc ? p.is_hater(npc) : false,
			isBestFriend: npc ? V.bestfriend === npc : false,
			isProfessor: npc ? p.is_professor(npc) : false,
		};
	},

	_attitude_meets_tier(value, stat, tier)
	{
		const tiers = (this.SelfieConvoPools && this.SelfieConvoPools.attitudeTiers) || {};
		const table = tiers[stat];
		if (!table || !tier) return true;
		const threshold = table[tier];
		if (threshold == null) return true;
		if (stat === "control")
			return (tier === "sub" || tier === "subMid") ? value <= threshold : value >= threshold;
		if (tier === "veryLow" || tier === "low" || tier === "none")
			return value <= threshold;
		return value >= threshold;
	},

	_selfie_entry_passes_req(entry, profile, session)
	{
		if (!entry) return false;
		if (entry.ctx && session && entry.ctx !== session.context) return false;
		const req = entry.req;
		if (!req) return true;
		if (req.attracted != null && !!req.attracted !== !!profile.attracted) return false;
		if (req.encouraged)
		{
			const canSendMore = (session.photoCount || 1) < this.TAN_SELFIE_CONVO_MAX_PHOTOS;
			if (!canSendMore || (session.encouragement || 0) <= 0) return false;
		}
		for (const stat of ["friendship", "lust", "romance", "control"])
		{
			if (req[stat] && !this._attitude_meets_tier(profile[stat] || 0, stat, req[stat]))
				return false;
		}
		return true;
	},

	_resolve_lane_data(lane, seen)
	{
		seen = seen || new Set();
		if (seen.has(lane)) return null;
		seen.add(lane);
		const pools = this.SelfieConvoPools;
		if (!pools || !pools.lanes) return null;
		const raw = pools.lanes[lane];
		if (!raw) return null;
		if (raw.extends)
		{
			const parent = this._resolve_lane_data(raw.extends, seen);
			if (!parent) return null;
			const moods = Object.assign({}, parent.moods || {});
			if (raw.moods)
			{
				for (const k of Object.keys(raw.moods))
					moods[k] = (moods[k] || []).concat(raw.moods[k]);
			}
			if (raw.moodExtra)
			{
				for (const k of Object.keys(raw.moodExtra))
					moods[k] = (moods[k] || []).concat(raw.moodExtra[k]);
			}
			const wrapup = Object.assign({}, parent.wrapup || {});
			if (raw.wrapup)
			{
				for (const k of Object.keys(raw.wrapup))
					wrapup[k] = (wrapup[k] || []).concat(raw.wrapup[k]);
			}
			return {
				label: raw.label || parent.label,
				moods,
				wrapup,
				wrapupExtra: (raw.wrapupExtra || []).slice(),
				bias: raw.bias || parent.bias,
				moodFallback: raw.moodFallback || parent.moodFallback,
			};
		}
		return {
			label: raw.label,
			moods: raw.moods || {},
			wrapup: raw.wrapup || {},
			wrapupExtra: raw.wrapupExtra || [],
			bias: raw.bias || {},
			moodFallback: raw.moodFallback,
		};
	},

	_materialize_pool_entry(raw, session, bias)
	{
		if (!raw || !raw.id || (!raw.text && !raw.dynamic)) return null;
		const t = this._selfie_reply_tags();
		const tagMap = { pos: t.pos, flirty: t.flirty, lewd: t.lewd, confused: t.confused, neg: t.neg };
		let text = raw.text || "";
		if (raw.dynamic === "join") text = this._selfie_convo_join_text(session);
		if (raw.dynamic === "bye") text = this._selfie_convo_bye_text(session);
		if (!text) return null;
		const extra = {};
		if (raw.tone) extra.tone = raw.tone;
		for (const stat of ["friendship", "lust", "romance", "control"])
		{
			if (raw[stat] == null) continue;
			let v = raw[stat];
			if (bias && bias.lustBias && stat === "lust" && v > 0) v = Math.round(v * 1.15);
			if (bias && bias.romanceBias && stat === "romance" && v > 0) v = Math.round(v * 1.15);
			extra[stat] = v;
		}
		if (raw.tags) extra.replyTags = tagMap[raw.tags] || t.pos;
		if (raw.action === "invite_watch" || raw.action === "invite_join" || raw.action === "invite_towel" || raw.action === "invite_hangout")
		{
			const act = raw.action === "invite_towel" ? "invite_watch" : raw.action;
			return this._selfie_reply_pick(raw.id, text, Object.assign({ action: act }, extra));
		}
		if (raw.action === "bolder")
			return this._selfie_bolder_pick(session, raw.id, text, extra);
		if (raw.action === "safer")
			return this._selfie_reply_pick(raw.id, text, Object.assign({
				action: "pick_selfie", boldBoost: 0, pendingText: text,
				selfiePrompt: "Pick something safer to send.",
			}, extra));
		if (raw.action === "casual")
			return this._selfie_reply_pick(raw.id, text, Object.assign({
				action: "pick_selfie", boldBoost: 0, pendingText: text,
				selfiePrompt: "Pick another shot to send.",
			}, extra));
		const inviteAction = this._selfie_invite_action(raw, session);
		if (inviteAction)
			return this._selfie_reply_pick(raw.id, text, Object.assign({ action: inviteAction }, extra));
		return this._selfie_reply_pick(raw.id, text, extra);
	},

	_collect_attitude_bonus_entries(mood, profile, session)
	{
		const pools = this.SelfieConvoPools;
		if (!pools || !pools.attitudeBonus) return [];
		const out = [];
		for (const bonus of Object.values(pools.attitudeBonus))
		{
			if (!bonus || !bonus.entries || !bonus.entries.length) continue;
			if (bonus.mood && bonus.mood.indexOf(mood) < 0) continue;
			if (!this._selfie_entry_passes_req({ req: bonus.req }, profile, session)) continue;
			out.push.apply(out, bonus.entries);
		}
		return out;
	},

	_build_mood_pc_replies(session)
	{
		const mood = session.lastNpcMood || "neutral";
		const lane = this._resolve_selfie_reply_lane(session);
		const profile = this._get_selfie_convo_profile(session);
		const laneData = this._resolve_lane_data(lane);
		if (!laneData)
			return this._pc_reply_options_tier_fallback(this.classify_tan_selfie(session.selfie), session);
		let rawEntries = (laneData.moods && laneData.moods[mood]) || [];
		if (!rawEntries.length && mood !== "neutral")
			rawEntries = (laneData.moods && laneData.moods.neutral) || [];
		if (!rawEntries.length && mood !== "warm" && laneData.moods && laneData.moods.warm)
			rawEntries = laneData.moods.warm;
		if (!rawEntries.length && laneData.moodFallback)
		{
			const fb = this._resolve_lane_data(laneData.moodFallback);
			if (fb && fb.moods)
				rawEntries = fb.moods[mood] || fb.moods.neutral || fb.moods.warm || [];
		}
		if (!rawEntries.length && lane === "hatefuck")
		{
			const rival = this._resolve_lane_data("rival");
			if (rival && rival.moods)
				rawEntries = rival.moods[mood] || rival.moods.neutral || [];
		}
		rawEntries = rawEntries.concat(this._collect_attitude_bonus_entries(mood, profile, session));
		const bias = laneData.bias || {};
		let options = rawEntries
			.filter(e => this._selfie_entry_passes_req(e, profile, session))
			.map(e => this._materialize_pool_entry(e, session, bias))
			.filter(Boolean);
		if (!options.length)
			options = this._pc_reply_options_tier_fallback(this.classify_tan_selfie(session.selfie), session);
		return options;
	},

	_build_wrapup_pc_replies(session)
	{
		const lane = this._resolve_selfie_reply_lane(session);
		const profile = this._get_selfie_convo_profile(session);
		const laneData = this._resolve_lane_data(lane);
		if (!laneData) return this._pc_reply_wrapup_default(session);
		const tone = session.lastTone || "casual";
		let rawEntries = [];
		if (laneData.wrapup)
		{
			if (laneData.wrapup[tone]) rawEntries = laneData.wrapup[tone].slice();
			else if (laneData.wrapup.default) rawEntries = laneData.wrapup.default.slice();
		}
		if (laneData.wrapupExtra && laneData.wrapupExtra.length)
			rawEntries = rawEntries.concat(laneData.wrapupExtra);
		const bias = laneData.bias || {};
		let options = rawEntries
			.filter(e => this._selfie_entry_passes_req(e, profile, session))
			.map(e => this._materialize_pool_entry(e, session, bias))
			.filter(Boolean);
		if (!options.length) return this._pc_reply_wrapup_default(session);
		return options;
	},

	_select_pc_replies(candidates, session)
	{
		candidates = (candidates || []).filter(Boolean);
		if (!candidates.length) return [];
		const used = new Set((session && session.usedPcReplyIds) || []);
		let pool = candidates.filter(o => o.id && !used.has(o.id));
		if (!pool.length) pool = candidates.slice();
		pool = setup.shuffle(pool.slice());
		return pool.slice(0, this.TAN_SELFIE_CONVO_OPTIONS_SHOWN);
	},

	_gather_mood_pool(session)
	{
		return this._build_mood_pc_replies(session);
	},

	_gather_wrapup_pool(session)
	{
		return this._build_wrapup_pc_replies(session);
	},

	_pc_reply_wrapup_default(session)
	{
		const canSendMore = (session.photoCount || 1) < this.TAN_SELFIE_CONVO_MAX_PHOTOS;
		const encouraged = (session.encouragement || 0) > 0;
		const byeText = this._selfie_convo_bye_text(session);
		const joinText = this._selfie_convo_join_text(session);
		const t = this._selfie_reply_tags();
		if (session.lastTone === "apologetic")
			return [
				this._selfie_reply_pick("reassure", "didn't mean to make it weird", { friendship: 5, replyTags: t.pos }),
				this._selfie_reply_pick("bye", "talk later", { friendship: 3, replyTags: t.pos }),
				this._selfie_reply_pick("sorry_wrap", "sorry again", { friendship: 2, tone: "apologetic", replyTags: t.confused }),
			];
		const opts = [];
		if (canSendMore && encouraged)
			opts.push(this._selfie_bolder_pick(session, "one_more", "one more for the road?", { lust: 12, replyTags: t.lewd }));
		if (session.lastTone === "flirty" || session.lastTone === "bold")
		{
			const seeInvite = session.context === "tanning" ? "invite_watch" : "invite_hangout";
			opts.push(this._selfie_reply_pick("bye", byeText, { friendship: 5, replyTags: t.pos }));
			opts.push(this._selfie_reply_pick("see_you", session.context === "phone" ? "see you soon?" : "come watch me after the sun sets?", { romance: 10, tone: "flirty", replyTags: t.flirty, action: seeInvite }));
			opts.push(this._selfie_reply_pick("dream", "dream about it", { lust: 8, tone: "flirty", replyTags: t.flirty }));
		}
		else
		{
			const joinInvite = session.context === "tanning" ? "invite_join" : "invite_hangout";
			opts.push(this._selfie_reply_pick("bye", "ttyl!", { friendship: 5, replyTags: t.pos }));
			opts.push(this._selfie_reply_pick("join", joinText, { friendship: 10, romance: 8, tone: "flirty", replyTags: t.flirty, action: joinInvite }));
			opts.push(this._selfie_reply_pick("later", "talk later", { friendship: 5, replyTags: t.pos }));
		}
		return opts.filter(Boolean);
	},

	_pc_reply_options_tier_fallback(info, session)
	{
		session = session || V.phoneselfiesession;
		const joinText = this._selfie_convo_join_text(session);
		if (info.tier === "clothed")
			return [
				this._selfie_reply_pick("thanks", "thanks!", { friendship: 8 }),
				this._selfie_reply_pick("outfit", "like the outfit?", { friendship: 5, tone: "flirty", replyTags: ["phone response", "flirty selfie reply"] }),
				this._selfie_reply_pick("another", "want another pic?", {
					action: "pick_selfie", boldBoost: 0, pendingText: "want another pic?", tone: "casual",
					selfiePrompt: "Pick another shot to send.", friendship: 5,
				}),
			];
		if (info.tier === "nude" || info.tier === "topless")
			return [
				{ id: "bold", text: "worth the risk?", lust: 15, romance: 5, tone: "bold", replyTags: ["phone response", "lewd selfie reply"] },
				{ id: "flirty", text: "like what you see?", lust: 20, tone: "flirty", replyTags: ["phone response", "flirty selfie reply"] },
				{ id: "sorry", text: "sorry, too much", friendship: -5, lust: -15, romance: -10, tone: "apologetic", replyTags: ["phone response", "confused selfie reply"] },
			];
		if (info.tier === "lewd")
			return [
				{ id: "glad", text: "glad you liked it", lust: 12, friendship: 5, tone: "flirty", replyTags: ["phone response", "flirty selfie reply"] },
				{ id: "bold", text: "just couldn't resist", lust: 8, romance: 5, tone: "bold", replyTags: ["phone response", "lewd selfie reply"] },
				{ id: "sorry", text: "oops, too bold?", friendship: -3, lust: -10, tone: "apologetic", replyTags: ["phone response", "confused selfie reply"] },
			];
		return [
			{ id: "thanks", text: "thanks!", friendship: 8, tone: "casual", replyTags: ["phone response", "positive selfie reply"] },
			{ id: "join", text: joinText, friendship: 10, romance: 8, tone: "flirty", replyTags: ["phone response", "flirty selfie reply"] },
			{ id: "impulse", text: "sorry, random impulse", friendship: -2, tone: "apologetic", replyTags: ["phone response", "confused selfie reply"] },
		];
	},

	get_selfie_pc_replies(session)
	{
		return this.get_tan_selfie_pc_replies(session);
	},

	_selfie_pc_reply_pool(session)
	{
		session = session || V.phoneselfiesession;
		if (!session) return [];
		const turn = session.turn || 0;
		const maxTurns = session.maxTurns || this.TAN_SELFIE_CONVO_MAX_TURNS;
		return turn >= maxTurns - 1
			? this._gather_wrapup_pool(session)
			: this._gather_mood_pool(session);
	},

	_find_selfie_pc_reply(optionId, session)
	{
		session = session || V.phoneselfiesession;
		if (!session) return null;
		const turn = session.turn || 0;
		const maxTurns = session.maxTurns || this.TAN_SELFIE_CONVO_MAX_TURNS;
		const pool = turn >= maxTurns - 1
			? this._build_wrapup_pc_replies(session)
			: this._build_mood_pc_replies(session);
		return pool.find(o => o && o.id === optionId) || null;
	},

	get_tan_selfie_pc_replies(session)
	{
		session = session || V.phoneselfiesession;
		if (!session || session.done || !session.awaitingPc || session.awaitingSelfiePick) return [];
		return this._select_pc_replies(this._selfie_pc_reply_pool(session), session);
	},

	build_selfie_menu_for_convo(person, session)
	{
		session = session || V.phoneselfiesession;
		if (session && session.context === "phone")
			return this.build_phone_selfie_menu_for_convo(person, session);
		return this.build_tan_selfie_menu_for_convo(person, session);
	},

	build_phone_selfie_menu_for_convo(person, session)
	{
		person = person || (setup.pc && setup.pc());
		session = session || V.phoneselfiesession;
		if (!person || !session) return [];
		return this._filter_selfie_menu_for_convo(this.build_phone_selfie_menu(person), person, session);
	},

	build_tan_selfie_menu_for_convo(person, session)
	{
		person = person || (setup.pc && setup.pc());
		session = session || V.phoneselfiesession;
		if (!person || !session) return [];
		const menu = V.tanpose ? this.build_tan_selfie_menu(person) : this.build_phone_selfie_menu(person);
		return this._filter_selfie_menu_for_convo(menu, person, session);
	},

	_filter_selfie_menu_for_convo(menu, person, session)
	{
		const sentLabels = new Set(session.sentLabels || []);
		const maxExhib = session.maxExhibSent || 0;
		const mode = session.selfiePickMode || (session.boldBoost > 0 ? "bolder" : "casual");
		const ranks = this.TAN_SELFIE_TIER_RANK;
		const sentTier = this.classify_tan_selfie(session.selfie).tier;
		const sentRank = ranks[sentTier] || 0;

		return menu.filter(entry =>
		{
			if (!entry || sentLabels.has(entry[0])) return false;
			if (!person.skillleveled("Exhibitionism", entry[1])) return false;
			const tier = this.classify_tan_selfie(entry).tier;
			const rank = ranks[tier] || 0;
			if (mode === "bolder")
				return entry[1] > maxExhib || rank > sentRank || (rank === sentRank && entry[1] >= maxExhib && entry[0] !== session.selfie[0]);
			if (mode === "safer")
				return entry[1] < maxExhib || rank < sentRank;
			return entry[1] <= maxExhib;
		}).sort((a, b) =>
		{
			if (mode === "bolder") return b[1] - a[1] || String(a[0]).localeCompare(String(b[0]));
			if (mode === "safer") return a[1] - b[1] || String(a[0]).localeCompare(String(b[0]));
			return b[1] - a[1] || String(a[0]).localeCompare(String(b[0]));
		});
	},

	_apply_pc_reply_attitude(npc, opt)
	{
		if (!npc || !opt) return;
		const p = setup.people;
		if (opt.friendship) p.alter_attitude(npc, "friendship", opt.friendship);
		if (opt.lust) p.alter_attitude(npc, "lust", opt.lust);
		if (opt.romance) p.alter_attitude(npc, "romance", opt.romance);
		if (opt.control) p.alter_attitude(npc, "control", opt.control);
	},

	apply_selfie_pc_reply(optionId)
	{
		return this.apply_tan_selfie_pc_reply(optionId);
	},

	apply_tan_selfie_pc_reply(optionId)
	{
		optionId = optionId || V.tanselfiereplypick;
		delete V.tanselfiereplypick;
		const session = V.phoneselfiesession;
		if (!session || session.done || !session.awaitingPc) return false;
		const opt = this._find_selfie_pc_reply(optionId, session);
		if (!opt) return false;
		if (!session.usedPcReplyIds) session.usedPcReplyIds = [];
		if (opt.id) session.usedPcReplyIds.push(opt.id);
		if (opt.action === "pick_selfie")
		{
			session.awaitingSelfiePick = true;
			session.selfiePickPrompt = opt.selfiePrompt || "Pick a shot to send:";
			session.pendingPcText = opt.pendingText || opt.text;
			session.boldBoost = Math.max(session.boldBoost || 0, opt.boldBoost || 0);
			session.selfiePickMode = (opt.boldBoost || 0) > 0 ? "bolder" : (opt.tone === "apologetic" ? "safer" : "casual");
			return true;
		}
		const inviteAction = opt.action === "invite_watch" || opt.action === "invite_join"
			|| opt.action === "invite_towel" || opt.action === "invite_hangout"
			? (opt.action === "invite_towel" ? "invite_watch" : opt.action)
			: this._selfie_invite_action(opt, session);
		if (inviteAction === "invite_watch" || inviteAction === "invite_join" || inviteAction === "invite_hangout")
		{
			if (session.context === "phone")
				this._phone_convo_send(opt.text);
			else
				this._convo_add_line("pc", opt.text);
			this._apply_pc_reply_attitude(session.target, opt);
			let inviteResult;
			if (inviteAction === "invite_join")
				inviteResult = this.resolve_tan_join_invite(session.target);
			else if (inviteAction === "invite_watch")
				inviteResult = this.resolve_tan_watch_invite(session.target);
			else
				inviteResult = this.resolve_tan_hangout_invite(session.target);
			if (session.context === "phone")
				this._phone_convo_receive(session.target, inviteResult.npcText);
			else
				this._convo_add_line("npc", inviteResult.npcText, { mood: inviteResult.mood || "neutral" });
			if (inviteResult.ok && inviteResult.arrivalMsg)
			{
				if (session.context === "phone")
					this._phone_convo_receive(session.target, inviteResult.arrivalMsg);
				else
					this._convo_add_line("narrate", inviteResult.arrivalMsg);
				V.taninvitemsg = inviteResult.arrivalMsg;
			}
			else if (inviteResult.ok)
				V.taninvitemsg = inviteResult.npcText;
			else
				V.taninvitemsg = inviteResult.npcText;
			session.lastTone = opt.tone || "flirty";
			this._convo_set_npc_mood(session, inviteResult.mood || "neutral");
			session.turn = (session.turn || 0) + 1;
			session.done = true;
			session.awaitingPc = false;
			session.inviteResolved = true;
			return true;
		}
		if (session.context === "phone")
			this._phone_convo_send(opt.text);
		else
			this._convo_add_line("pc", opt.text);
		this._apply_pc_reply_attitude(session.target, opt);
		const followup = this.pick_tan_selfie_npc_followup(session.target, session.selfie, opt);
		if (session.context === "phone")
			this._phone_convo_receive(session.target, followup.text);
		else
			this._convo_add_line("npc", followup.text, { mood: followup.mood });
		this._convo_set_npc_mood(session, followup.mood);
		session.lastTone = opt.tone || "casual";
		session.turn = (session.turn || 0) + 1;
		if (session.turn >= (session.maxTurns || this.TAN_SELFIE_CONVO_MAX_TURNS))
		{
			session.done = true;
			session.awaitingPc = false;
		}
		return true;
	},

	cancel_convo_selfie_pick()
	{
		return this.cancel_tan_convo_selfie_pick();
	},

	cancel_tan_convo_selfie_pick()
	{
		const session = V.phoneselfiesession;
		if (!session) return;
		session.awaitingSelfiePick = false;
		delete session.selfiePickPrompt;
		delete session.pendingPcText;
		delete session.selfiePickMode;
	},

	send_convo_followup_selfie(entry)
	{
		return this.send_tan_convo_followup_selfie(entry);
	},

	send_tan_convo_followup_selfie(entry)
	{
		entry = entry || V.tanphoneselfiepick;
		delete V.tanphoneselfiepick;
		const session = V.phoneselfiesession;
		if (!session || !session.awaitingSelfiePick) return false;
		let selfie;
		if (session.context === "phone")
			selfie = this.stage_phone_selfie_send(entry, session.target);
		else
		{
			selfie = this.clone_tan_selfie_entry(entry);
			if (!selfie) return false;
			selfie[4] = this.tan_phone_selfie_props(Object.assign({}, selfie[4] || {}));
			selfie[4].target = session.target;
			selfie[4].inccomposure = true;
		}
		if (!selfie) return false;
		if (session.pendingPcText)
		{
			if (session.context === "phone") this._phone_convo_send(session.pendingPcText);
			else this._convo_add_line("pc", session.pendingPcText);
		}
		const image = this.get_tan_selfie_image_html(selfie);
		if (session.context === "phone")
			this._phone_convo_send(image);
		else
			this._convo_add_line("photo", "", { label: selfie[0], image });
		session.selfie = selfie;
		V.phoneselfiesent = selfie;
		if (!session.sentLabels) session.sentLabels = [];
		session.sentLabels.push(selfie[0]);
		session.photoCount = (session.photoCount || 1) + 1;
		session.maxExhibSent = Math.max(session.maxExhibSent || 0, selfie[1] || 0);
		session.pendingEffects = selfie;
		session.effectsShown = false;
		const npcReply = this._pick_followup_selfie_npc_reply(session.target, selfie, session);
		if (session.context === "phone")
			this._phone_convo_receive(session.target, npcReply.text);
		else
			this._convo_add_line("npc", npcReply.text, { mood: npcReply.mood });
		this._convo_set_npc_mood(session, npcReply.mood);
		session.awaitingSelfiePick = false;
		delete session.selfiePickPrompt;
		delete session.pendingPcText;
		delete session.selfiePickMode;
		if (session.photoCount > 1)
			session.maxTurns = Math.max(session.maxTurns || this.TAN_SELFIE_CONVO_MAX_TURNS, 3);
		return true;
	},

	stage_phone_selfie_send(entry, target)
	{
		entry = entry || V.tanphoneselfiepick;
		target = target || V.phonetexter || V.tanphoneselfiecontact;
		const selfie = this.clone_tan_selfie_entry(entry);
		delete V.tanphoneselfiepick;
		if (!selfie) return null;
		const props = Object.assign({}, selfie[4] || {});
		const naked = selfie[3] || [];
		const underwear = selfie[2] || [];
		if (naked.includes("penis") || naked.includes("vagina")) props.lewd = true;
		else if (naked.includes("breasts")) props.lewd = true;
		else if (underwear.length > 0) props.lewd = true;
		if (!V.selfiestoday) V.selfiestoday = [];
		let selfietype = "";
		if (naked.includes("penis") || naked.includes("vagina")) selfietype = "naked";
		else if (naked.includes("breasts")) selfietype = "topless";
		else if (underwear.length) selfietype = "underwear";
		let inccomposure = true;
		if (!V.selfiestoday.includes(selfietype))
			V.selfiestoday.push(selfietype);
		else
			inccomposure = false;
		props.inccomposure = inccomposure;
		if (target)
		{
			props.target = target;
			const pdata = setup.people.get_person(target);
			props.prevattitude = pdata && pdata.attitude ? Object.assign({}, pdata.attitude) : {};
		}
		selfie[4] = props;
		V.phoneselfiesent = selfie;
		return selfie;
	},

	begin_phone_selfie_convo(entry, target)
	{
		return this.begin_selfie_convo(entry, target, "phone");
	},

	begin_tan_phone_selfie_convo(entry, target)
	{
		return this.begin_selfie_convo(entry, target, "tanning");
	},

	begin_selfie_convo(entry, target, context)
	{
		context = context || "tanning";
		const selfie = context === "phone"
			? this.stage_phone_selfie_send(entry, target)
			: this.stage_tan_phone_selfie_send(entry, target);
		if (!selfie || !target) return null;
		const firstReply = this._pick_initial_npc_reply(target, selfie);
		this.apply_phone_selfie_reply_attitude(target, selfie);
		const info = this.classify_tan_selfie(selfie);
		const desrel = setup.people.desired_relationship(target);
		V.phoneselfiesession = {
			target,
			desrel,
			convoLane: null,
			usedPcReplyIds: [],
			selfie,
			context,
			lines: [],
			turn: 0,
			maxTurns: this.TAN_SELFIE_CONVO_MAX_TURNS,
			done: false,
			awaitingPc: true,
			effectsShown: context === "phone",
			lastTone: null,
			lastNpcMood: firstReply.mood,
			encouragement: 0,
			boldBoost: 0,
			photoCount: 1,
			maxExhibSent: selfie[1] || 0,
			sentLabels: [selfie[0]],
			sentTiers: [info.tier],
			pendingEffects: context === "phone" ? selfie : null,
		};
		V.phoneselfiesession.convoLane = this._resolve_selfie_reply_lane(V.phoneselfiesession);
		if (context === "phone")
		{
			const image = this.get_tan_selfie_image_html(selfie);
			this._phone_convo_send(image);
			this._phone_convo_receive(target, firstReply.text);
		}
		else
		{
			const narrate = selfie[5] || "";
			if (narrate) this._convo_add_line("narrate", narrate);
			const image = this.get_tan_selfie_image_html(selfie);
			this._convo_add_line("photo", "", { label: selfie[0], image });
			this._convo_add_line("npc", firstReply.text, { mood: firstReply.mood });
		}
		this._convo_set_npc_mood(V.phoneselfiesession, firstReply.mood);
		V.phoneselfieconvoactive = true;
		V.phoneselfietarget = target;
		V.phoneselfieactive = true;
		delete V.tanphoneselfiecontact;
		delete V.tanphoneselfiereply;
		delete V.phoneresponsemenu;
		delete V.phoneselfiemenu;
		return selfie;
	},

	mark_selfie_effects_shown()
	{
		return this.mark_tan_selfie_effects_shown();
	},

	mark_tan_selfie_effects_shown()
	{
		const session = V.phoneselfiesession;
		if (!session) return;
		session.effectsShown = true;
		delete session.pendingEffects;
	},

	finish_selfie_convo()
	{
		return this.finish_tan_phone_selfie_convo();
	},

	finish_tan_phone_selfie_convo()
	{
		delete V.phoneselfiesession;
		delete V.phoneselfieconvoactive;
		this.clear_tan_selfie_staging();
	},

	clear_selfie_convo()
	{
		return this.clear_tan_selfie_convo();
	},

	clear_tan_selfie_convo()
	{
		delete V.phoneselfiesession;
		delete V.phoneselfieconvoactive;
		delete V.tanselfiereplypick;
	},

	clone_tan_selfie_entry(entry)
	{
		if (!entry || !entry.length) return null;
		return [
			entry[0],
			entry[1],
			(entry[2] || []).slice(),
			(entry[3] || []).slice(),
			Object.assign({}, entry[4] || {}),
			entry[5] || "",
		];
	},

	stage_tan_phone_selfie_send(entry, target)
	{
		entry = entry || V.tanphoneselfiepick;
		target = target || V.tanphoneselfiecontact;
		const selfie = this.clone_tan_selfie_entry(entry);
		delete V.tanphoneselfiepick;
		if (!selfie)
		{
			V.tanphoneselfieactive = false;
			return null;
		}
		selfie[4] = this.tan_phone_selfie_props(Object.assign({}, selfie[4]));
		selfie[4].inccomposure = true;
		if (target)
		{
			selfie[4].target = target;
			const pdata = setup.people.get_person(target);
			selfie[4].prevattitude = pdata && pdata.attitude ? Object.assign({}, pdata.attitude) : {};
		}
		V.phoneselfiesent = selfie;
		V.tanphoneselfietarget = target || null;
		V.tanphoneselfieactive = !!target;
		return selfie;
	},

	stage_tan_elkbook_selfie_send(entry)
	{
		entry = entry || V.tanphoneselfiepick;
		const selfie = this.clone_tan_selfie_entry(entry);
		delete V.tanphoneselfiepick;
		if (!selfie)
		{
			V.tanphoneselfieactive = false;
			return null;
		}
		selfie[4] = this.tan_phone_selfie_props(Object.assign({}, selfie[4]));
		selfie[4].inccomposure = true;
		V.phoneselfiesent = selfie;
		V.tanphoneselfieactive = true;
		return selfie;
	},

	init_tan_phone_selfie_passage()
	{
		const selfie = this.clone_tan_selfie_entry(V.phoneselfiesent);
		if (!selfie || !selfie[4] || !selfie[4].target)
		{
			V.tanphoneselfieactive = false;
			return false;
		}
		V.phoneselfiesent = selfie;
		V.tanphoneselfietarget = selfie[4].target;
		V.tanphoneselfieactive = true;
		return true;
	},

	init_tan_elkbook_selfie_passage()
	{
		const selfie = this.clone_tan_selfie_entry(V.phoneselfiesent);
		if (!selfie)
		{
			V.tanphoneselfieactive = false;
			return false;
		}
		V.phoneselfiesent = selfie;
		V.tanphoneselfieactive = true;
		return true;
	},

	clear_tan_selfie_staging()
	{
		delete V.phoneselfiesent;
		delete V.tanphoneselfiereply;
		delete V.phoneresponsemenu;
		delete V.tanphoneselfiepick;
		delete V.tanphoneselfietarget;
		delete V.tanphoneselfieactive;
		if (!V.phoneselfieconvoactive) this.clear_tan_selfie_convo();
	},

	tan_phone_selfie_props(props)
	{
		props = props || {};
		if (!V.tanpose) return props;
		let chance = props.discoverchance || 0;
		chance += 0.2;
		if ((V.peopleatlocation || []).length >= 3) chance += 0.15;
		props.discoverchance = Math.min(0.85, chance);
		props.tanning = true;
		return props;
	},

	can_post_tan_video(person)
	{
		return !!(person && V.streaming && V.streaming.aptscreenname);
	},

	TAN_VIDEO_EXHIB: 6,

	prepare_tan_exhibition_video(person)
	{
		if (!person || !V.tanpose)
			return { ok: false, msg: "You need to be laying out first." };
		if (!this.can_post_tan_video(person))
			return { ok: false, msg: "You'd need an Amateur Porn Town account first — register from your phone's internet browser." };
		if (!person.skillleveled("Exhibitionism", this.TAN_VIDEO_EXHIB))
			return { ok: false, msg: "You're not bold enough to film yourself like that in public." };

		const APT = setup.AmateurPornTown;
		if (!APT) return { ok: false, msg: "You can't upload that right now." };

		const tags = this.current_visible_exposure(person);
		const attScore = this.attention_score_for_tags(tags);
		const site = this.get_tanning_site();
		const area = site === "UniversityLakeBeach" ? "the lake beach" : "the mall";
		let desc = "You filmed yourself laying out in your swimwear at " + area + ".";
		if (attScore >= 8)
			desc = "You filmed yourself shamelessly showing off while tanning at " + area + ".";
		else if (attScore >= 5)
			desc = "You filmed yourself teasing the camera in your swimwear at " + area + ".";

		if (!APT.segments) APT.segments = {};
		APT.segments["tanning exhibition"] = {
			description: desc,
			emoji: "☀️📱",
			ifflags: ["solo"],
			excitement: Math.round(350 + attScore * 25),
			satisfaction: Math.round(attScore * 15),
		};

		const flags = setup.encode_bitwise_array
			? setup.encode_bitwise_array(APT.allflags, ["solo"])
			: ["solo"];
		V.pendingxvideo = {
			videotype: "solo video",
			title: (person.nickname || person.firstname()) + "'s Tanning Video",
			segments: ["tanning exhibition"],
			partners: [],
			flags: flags,
			orgasmflags: 0,
		};

		const parts = this.tags_to_exhibition_parts(tags, person);
		if (parts.length)
		{
			setup.Events.exhibitionism(
				parts,
				person.wearing_some_swimwear() ? "underwear" : "underwear",
				"video",
				true,
				V.peopleatlocation || [],
				{ silent: true }
			);
		}

		this.set_tan_phone_return();
		return {
			ok: true,
			msg: "You prop your phone against your backpack and hit record, angling the shot shamelessly across your towel.",
		};
	},

	init_exhib_session()
	{
		this.register_tan_invite_activities();
		this.clear_tan_towel_guests();
		const pc = setup.pc && setup.pc();
		if (pc) this.ensure_tan_backpack_stash(pc);
		V.tanpose = null;
		V.tanlegspread = false;
		V.tanexhibapplied = [];
		V.tanexhibexpanded = false;
		V.tancumonexpanded = false;
		delete V.tanphonesession;
		delete V.tanphoneselfiecontact;
		delete V.tanphoneelkbookopen;
		delete V.tanphoneselfiereply;
		delete V.tanphoneselfiepick;
		delete V.tanphoneselfietarget;
		delete V.tanphoneselfieactive;
		this.clear_tan_selfie_convo();
		delete V.tanactivewitnesses;
		delete V.tanwitnessescalation;
		if (!V.tanninglocation && this.TANNING_SITES[V.location])
			V.tanninglocation = V.location;
		V.tantanpassage = this.get_tan_passage_from_mode(V.malltanning);
		if (!V.tanningduration) V.tanningduration = null;
	},

	abort_tan_menu(person)
	{
		this.clear_tan_towel_guests();
		delete V.malltanning;
		delete V.tanninglocation;
		delete V.tanswimchangetarget;
		delete V.tanswimchangemsg;
		delete V.tanswimpick;
		delete V.tanpose;
		delete V.tanlegspread;
		delete V.tantanpassage;
		delete V.tanningduration;
		delete V.tanexhibexpanded;
		delete V.tancumonexpanded;
		delete V.tanphonesession;
		delete V.tanphoneselfiecontact;
		delete V.tanphoneelkbookopen;
		delete V.tanphoneselfiereply;
		delete V.tanphoneselfiepick;
		delete V.tanphoneselfietarget;
		delete V.tanphoneselfieactive;
		this.clear_tan_selfie_convo();
		delete V.tanexhibapplied;
		delete V.malltaneventfired;
		delete V.tanwitnessescalation;
		delete V.tanactivewitnesses;
		if (this.restore_displacement_snapshot)
			this.restore_displacement_snapshot(person);
		if (person && V.pretanningclothes && V.pretanningclothes.length)
		{
			const restore = () =>
			{
				this.swap_for_tanning(person);
				person.wear_all_clothes(V.pretanningclothes);
			};
			if (setup.ExhibitionAdjustment && setup.ExhibitionAdjustment.preserve_exposure_on_wear)
				setup.ExhibitionAdjustment.preserve_exposure_on_wear(restore);
			else
				restore();
			delete V.pretanningclothes;
			this.maybe_invalidate_paperdoll(person);
		}
	},

	get_tan_passage_from_mode(mode, site)
	{
		const cfg = this.get_tan_site_config(site);
		if (mode === "clothed") return cfg.passagePrefix + "Clothed";
		if (mode === "bikini") return cfg.passagePrefix + "Bikini";
		if (mode === "swimwear") return cfg.passagePrefix + "Swimwear";
		return cfg.passagePrefix + "Clothed";
	},

	get_tan_passage()
	{
		const tanPassages = this.all_tan_passages();
		if (V.tantanpassage && tanPassages.includes(V.tantanpassage))
			return V.tantanpassage;
		if (State.passage && tanPassages.includes(State.passage))
			return State.passage;
		return this.get_tan_passage_from_mode(V.malltanning);
	},

	get_saved_passage()
	{
		if (V.lastmalltanning === "bikini") return this.get_tan_passage_from_mode("bikini");
		if (V.lastmalltanning === "swimwear") return this.get_tan_passage_from_mode("swimwear");
		return this.get_tan_passage_from_mode("swimwear");
	},

	session_minutes_from_vars()
	{
		if (V.tanningduration != null) return V.tanningduration;
		return this.session_minutes_from_mode(V.malltanning);
	},

	can_exhibition_tan(person)
	{
		return person && person.skillleveled("Exhibitionism", this.EXHIB_TANNING_MIN);
	},

	_close_result(msg, needs = {})
	{
		return {
			msg,
			arousal: needs.arousal || 0,
			attention: needs.attention || 0,
			humiliation: needs.humiliation || 0,
			orgasm: !!needs.orgasm,
		};
	},

	tan_gain_arousal(amt)
	{
		if (!amt) return 0;
		amt = Math.abs(Math.round(amt));
		setup.Needs.gain_arousal(amt, this.TAN_AROUSAL_MAX);
		return amt;
	},

	tan_gain_attention(amt)
	{
		if (!amt) return 0;
		amt = Math.abs(Math.round(amt));
		setup.Needs.sexual_attention(amt);
		return amt;
	},

	crotch_genitals_visible(person)
	{
		if (!person) return false;
		if (!person.is_part_covered("vagina") && person.has_part("vagina")) return true;
		if (!person.is_part_covered("penis") && person.has_part("penis")) return true;
		if (!person.is_part_covered("clitoris") && person.has_part("clitoris")) return true;
		return false;
	},

	close_expose_action(person)
	{
		if (!person || !V.tanpose) return null;
		const actions = this.get_tan_menu_actions(person, V.tanpose);
		const more = actions.filter(a => {
			if (a.exposure_dir !== "more" || !a.visible_tags || !a.visible_tags.length) return false;
			const bare = (a.uncover || []).some(p => ["vagina", "penis", "clitoris"].includes(p));
			return a.visible_tags.includes("crotch") || bare;
		});
		if (!more.length) return null;
		more.sort((a, b) => (b.exhib_req || 0) - (a.exhib_req || 0));
		return more[0];
	},

	can_close_finger(person)
	{
		return this.crotch_genitals_visible(person);
	},

	can_close_orgasm(person)
	{
		return setup.Needs.get_need("Arousal") >= this.CLOSE_ORGASM_AROUSAL_MIN;
	},

	get_pose_view(pose)
	{
		return this.POSE_VIEW[pose] || null;
	},

	filter_visible_uncover(uncover, pose, legSpread = false)
	{
		const view = this.get_pose_view(pose);
		if (!view || !uncover || !uncover.length) return [];
		const visibleSet = new Set(view.visible);
		if ((pose === "back" || pose === "seated") && legSpread)
		{
			["crotch", "vagina", "penis", "clitoris", "groin", "thigh"].forEach(p => visibleSet.add(p));
		}
		return uncover.filter(p => visibleSet.has(p) && !view.hidden.includes(p));
	},

	anatomy_to_exposure_tags(visibleParts, person, pose, legSpread)
	{
		const tags = [];
		const parts = visibleParts || [];
		const add = (tag) => { if (!tags.includes(tag)) tags.push(tag); };

		if (parts.includes("nipples") || (pose === "back" && person.is_part_visible("nipples")))
			add("nipple");
		if (parts.includes("breasts") || (pose === "back" && person.is_part_visible("breasts")))
			add("breasts");
		if (parts.includes("chest") && pose === "back")
			add("chest");
		if (parts.includes("vagina") || parts.includes("penis") || parts.includes("clitoris"))
			add("crotch");
		else if (parts.includes("crotch") || parts.includes("groin"))
			add("crotch");
		if (parts.includes("butt") || parts.includes("anus"))
			add("butt");
		if (parts.includes("thigh") || parts.includes("hip"))
			add("thigh");

		if (pose === "back" && legSpread && setup.BodyExposure)
		{
			const ct = setup.BodyExposure.score_camel_toe(person);
			if (ct && ct.score >= 3) add("camel_toe");
			const bulge = setup.BodyExposure.score_bulge(person);
			if (bulge && bulge.score >= 3) add("bulge");
		}
		if (pose === "stomach" && setup.BodyExposure)
		{
			for (const entry of setup.BodyExposure.score_butt_region(person))
			{
				if (entry.score >= 4)
				{
					if (entry.part === "butt_crack") add("butt_crack");
					else if (entry.part === "underbutt") add("underbutt");
					else add("butt");
				}
			}
		}
		if (pose === "back" && setup.BodyExposure)
		{
			const side = setup.BodyExposure.score_sideboob(person);
			if (side && side.score >= 3) add("sideboob");
		}

		return tags;
	},

	exhib_requirement_for_tags(tags, person, visibleParts)
	{
		let req = this.EXHIB_TANNING_MIN;
		const parts = visibleParts || [];
		const bareGenitals = parts.some(p => ["vagina", "penis", "clitoris"].includes(p));
		for (const tag of tags || [])
		{
			const def = this.EXPOSURE_TAG_WEIGHT[tag];
			if (def) req = Math.max(req, def.req);
		}
		if (bareGenitals)
		{
			req = Math.max(req, 9);
			if (!person.underwear_covering("crotch") && !person.middlewear_covering("crotch"))
				req = Math.max(req, 10);
		}
		if (setup.SwimwearExhibition && person.wearing_some_swimwear())
		{
			const tier = setup.SwimwearExhibition.outfit_swimwear_tier(person);
			if (tier >= 3) req += 1;
			if (tier >= 4) req += 1;
			if (tier >= 5) req += 1;
		}
		else if (setup.BodyExposure)
		{
			const bottom = person.middlewear_covering("crotch") || person.outermost_covering("crotch");
			if (bottom)
			{
				const tier = setup.BodyExposure.get_bottom_tier(person, bottom);
				if (tier >= 2) req += 1;
				if (tier >= 3) req += 1;
				if (tier >= 4) req += 2;
			}
		}
		return Math.min(10, req);
	},

	attention_score_for_tags(tags)
	{
		let score = 0;
		for (const tag of tags || [])
		{
			const def = this.EXPOSURE_TAG_WEIGHT[tag];
			if (def) score += def.att;
		}
		return score;
	},

	template_visible_for_pose(tmpl, pose)
	{
		const view = this.get_pose_view(pose);
		if (!view || !tmpl || !tmpl.coverAny) return false;
		return tmpl.coverAny.some(c => view.visible.includes(c)
			|| (c === "breasts" && view.visible.includes("chest"))
			|| (c === "groin" && view.visible.includes("crotch")));
	},

	save_displacement_snapshot(person)
	{
		if (!person) return;
		V.tanpretanningdisplacements = [];
		for (let i = 0; i < person.clothes.length; i++)
		{
			const cItem = new ClothingItem(person.clothes[i]);
			V.tanpretanningdisplacements.push({
				item: person.clothes[i].item,
				displacements: cItem.get_displacements().slice(),
				adjustments: Object.assign({}, cItem.get_property("exposure_adjustments") || {}),
			});
		}
	},

	restore_displacement_snapshot(person)
	{
		if (!person || !V.tanpretanningdisplacements) return;
		for (let i = 0; i < person.clothes.length; i++)
		{
			const snap = V.tanpretanningdisplacements.find(s => s.item === person.clothes[i].item);
			const cItem = new ClothingItem(person.clothes[i]);
			cItem.remove_all_displacements();
			if (snap)
			{
				for (const disp of snap.displacements)
					cItem.add_displacement(disp);
				if (snap.adjustments && Object.keys(snap.adjustments).length)
					cItem.set_property("exposure_adjustments", snap.adjustments);
				else
					cItem.delete_property("exposure_adjustments");
			}
			person.clothes[i] = cItem.get_data_structure();
		}
		delete V.tanpretanningdisplacements;
		delete V.tanpose;
		delete V.tanlegspread;
		delete V.tanexhibapplied;
		delete V.tanexhibexpanded;
		delete V.tanwitnessescalation;
		delete V.tanactivewitnesses;
		this.maybe_invalidate_paperdoll(person);
	},

	exposure_bonus_for_displacements(person)
	{
		if (!V.tanpose) return 0;
		let bonus = 0;
		const pose = V.tanpose;
		const legSpread = !!V.tanlegspread;
		for (let i = 0; i < person.clothes.length; i++)
		{
			const cItem = new ClothingItem(person.clothes[i]);
			const cinfo = person.clothing_archetype(person.clothes[i]);
			for (const disp of cItem.get_displacements())
			{
				const visible = this.filter_visible_uncover(cinfo["displace " + disp] || [], pose, legSpread);
				const tags = this.anatomy_to_exposure_tags(visible, person, pose, legSpread);
				for (const tag of tags)
				{
					if (tag === "nipple") bonus += 0.18;
					else if (tag === "breasts") bonus += 0.12;
					else if (tag === "chest") bonus += 0.06;
					else if (tag === "crotch" || tag === "camel_toe" || tag === "bulge") bonus += 0.14;
					else if (tag === "butt" || tag === "butt_crack" || tag === "underbutt") bonus += 0.10;
				}
			}
		}
		if (legSpread && pose === "back") bonus += 0.05;
		return Math.min(0.50, bonus);
	},

	clothing_menu_name(person, clothingName)
	{
		for (let i = 0; i < person.clothes.length; i++)
		{
			const raw = person.clothes[i];
			if (raw.item === clothingName || raw === clothingName)
			{
				const cItem = new ClothingItem(raw);
				return setup.capitalize_each(cItem.get_name(true));
			}
		}
		const cinfo = person.clothing_archetype(clothingName);
		return setup.capitalize_each(cinfo.shortname || clothingName);
	},

	format_exposure_hint(tags)
	{
		if (!tags || !tags.length) return "";
		const parts = tags.map(t => this.EXPOSURE_TAG_HINT[t] || t.replace(/_/g, " "));
		return "Reveals: " + parts.join(", ");
	},

	format_tan_button(dir, main, sub)
	{
		const prefix = dir === "more" ? "▲"
			: dir === "less" ? "▼"
				: "·";
		let text = prefix + " " + main;
		if (sub) text += " (" + sub + ")";
		return text;
	},

	exposure_step_label(person, cItem, type)
	{
		const EA = setup.ExhibitionAdjustment;
		if (!EA) return "Normal";
		const steps = EA.get_steps(cItem, type);
		if (!steps) return "Normal";
		const tmpl = EA.TEMPLATES[type];
		const maxS = EA.item_max_steps(person, cItem, tmpl) || 1;
		return steps + "/" + maxS;
	},

	format_tan_action_meta(action)
	{
		if (!action) return "";
		const parts = [];
		if (action.hint)
		{
			const hint = action.hint.replace(/^Covers up \/ tones down this tweak$/i, "Covers up");
			parts.push(hint);
		}
		if (action.exhib_req > 0)
			parts.push("Exhib " + action.exhib_req);
		else if (action.exposure_dir === "less")
			parts.push("no Exhib needed");
		return parts.join(" · ");
	},

	displacement_verb(disp)
	{
		const verbs = {
			"pull aside": "Pull aside",
			"tug aside": "Tug aside",
			"shift": "Shift",
			"lift": "Lift",
			"pull down": "Pull down",
			"pull up": "Pull up",
			"unhook": "Unhook",
			"loosen": "Loosen",
		};
		return verbs[disp] || setup.capitalize_each(disp);
	},

	get_displacement_actions(person, pose)
	{
		return this.get_tan_menu_actions(person, pose);
	},

	get_tan_menu_actions(person, pose)
	{
		const actions = [];
		if (!person || !pose || !this.get_pose_view(pose)) return actions;
		const legSpread = !!V.tanlegspread;
		const clothes = person.targetable_clothing(person);
		const EA = setup.ExhibitionAdjustment;

		if (pose === "back" || pose === "seated")
		{
			const spreadLabel = pose === "seated" ? "Shift and part your knees" : "Let legs drift apart";
			const closeLabel = pose === "seated" ? "Press knees together" : "Press thighs together";
			if (legSpread)
			{
				actions.push({
					kind: "legs",
					button: this.format_tan_button("less", closeLabel),
					hint: "Covers up between your legs",
					exposure_dir: "less",
					exhib_req: 0,
					visible_tags: [],
					id: "legs::close",
					spread: false,
				});
			}
			else
			{
				actions.push({
					kind: "legs",
					button: this.format_tan_button("more", spreadLabel),
					hint: this.format_exposure_hint(["camel_toe", "crotch"]),
					exposure_dir: "more",
					exhib_req: 4,
					visible_tags: ["camel_toe", "crotch"],
					id: "legs::spread",
					spread: true,
				});
			}
		}

		for (let i = 0; i < clothes.length; i++)
		{
			const clothingName = clothes[i];
			const cinfo = person.clothing_archetype(clothingName);
			if (!this.TAN_DISPLACE_CATEGORIES.includes(cinfo.category)) continue;
			if (person.is_clothing_obscured(clothingName)) continue;

			const displacements = person.available_clothing_displacements(clothingName);
			for (const disp of displacements)
			{
				const uncover = cinfo["displace " + disp] || [];
				const visible = this.filter_visible_uncover(uncover, pose, legSpread);
				if (!visible.length) continue;
				let tags = this.anatomy_to_exposure_tags(visible, person, pose, legSpread);
				if (!tags.length) continue;
				const bareGenitals = visible.some(p => ["vagina", "penis", "clitoris"].includes(p));
				if (bareGenitals)
				{
					if (!tags.includes("crotch")) tags.push("crotch");
					if (!tags.includes("bare_crotch")) tags.push("bare_crotch");
					if (!person.underwear_covering("crotch")) tags.push("bare_genitals");
				}
				const itemName = this.clothing_menu_name(person, clothingName);
				const exhibReq = this.exhib_requirement_for_tags(tags, person, visible);
				actions.push({
					kind: "displace",
					button: this.format_tan_button("more", this.displacement_verb(disp) + " — " + itemName),
					hint: this.format_exposure_hint(tags),
					exposure_dir: "more",
					clothingLabel: itemName,
					clothing: clothingName,
					displacement: disp,
					uncover: visible,
					visible_tags: tags,
					exhib_req: exhibReq,
					id: clothingName + "::" + disp,
				});
			}

			const active = person.active_clothing_displacements(clothingName);
			if (active.length > 0)
			{
				const itemName = this.clothing_menu_name(person, clothingName);
				actions.push({
					kind: "displace",
					button: this.format_tan_button("less", "Fix — " + itemName),
					hint: "Covers displaced fabric",
					exposure_dir: "less",
					clothingLabel: itemName,
					clothing: clothingName,
					displacement: "fix",
					uncover: [],
					visible_tags: [],
					exhib_req: 0,
					id: clothingName + "::fix",
				});
			}
		}

		if (EA)
		{
			for (const cItem of person.get_clothingItems_classes())
			{
				const adjs = EA.available_for_item(person, cItem);
				for (const adj of adjs)
				{
					if (!this.template_visible_for_pose(adj.info, pose)) continue;
					if (EA.can_adjust(person, cItem, adj.type, 1))
					{
						const tags = this._tags_for_adjustment(person, cItem, adj.type, pose, legSpread, 1);
						const itemName = setup.capitalize_each(cItem.get_name(true));
						const tmpl = adj.info;
						const cur = this.exposure_step_label(person, cItem, adj.type);
						const next = EA.get_steps(cItem, adj.type) + 1;
						const maxS = EA.item_max_steps(person, cItem, tmpl) || 1;
						actions.push({
							kind: "adjust",
							button: this.format_tan_button("more", tmpl.up + " — " + itemName + " · " + tmpl.label, cur + " → " + next + "/" + maxS),
							hint: this.format_exposure_hint(tags),
							exposure_dir: "more",
							clothingLabel: itemName,
							clothingItem: cItem,
							adjType: adj.type,
							direction: 1,
							visible_tags: tags,
							exhib_req: EA.skill_for_step(person, adj.type, EA.get_steps(cItem, adj.type) + 1),
							id: cItem.get_item() + "::adj::" + adj.type + "::up",
						});
					}
					if (EA.get_steps(cItem, adj.type) > 0)
					{
						const itemName = setup.capitalize_each(cItem.get_name(true));
						const tmpl = adj.info;
						const cur = this.exposure_step_label(person, cItem, adj.type);
						const prev = EA.get_steps(cItem, adj.type) - 1;
						const maxS = EA.item_max_steps(person, cItem, tmpl) || 1;
						const prevLabel = prev <= 0 ? "Normal" : (prev + "/" + maxS);
						actions.push({
							kind: "adjust",
							button: this.format_tan_button("less", tmpl.down + " — " + itemName + " · " + tmpl.label, cur + " → " + prevLabel),
							hint: "Covers up",
							exposure_dir: "less",
							clothingLabel: itemName,
							clothingItem: cItem,
							adjType: adj.type,
							direction: -1,
							visible_tags: [],
							exhib_req: 0,
							id: cItem.get_item() + "::adj::" + adj.type + "::down",
						});
					}
				}
			}
		}

		const dirOrder = { more: 0, neutral: 1, less: 2 };
		actions.sort((a, b) => {
			const itemCmp = (a.clothingLabel || a.button).localeCompare(b.clothingLabel || b.button);
			if (itemCmp !== 0) return itemCmp;
			const dirCmp = (dirOrder[a.exposure_dir] || 1) - (dirOrder[b.exposure_dir] || 1);
			if (dirCmp !== 0) return dirCmp;
			return a.exhib_req - b.exhib_req || a.button.localeCompare(b.button);
		});
		return actions;
	},

	_tags_for_adjustment(person, cItem, type, pose, legSpread, direction)
	{
		const EA = setup.ExhibitionAdjustment;
		if (!EA || direction <= 0) return [];
		return this._tags_for_adjustment_step(person, cItem, type, pose, legSpread, EA.get_steps(cItem, type) + 1);
	},

	_tags_for_adjustment_step(person, cItem, type, pose, legSpread, steps)
	{
		const EA = setup.ExhibitionAdjustment;
		if (!EA || steps <= 0) return [];
		const tmpl = EA.TEMPLATES[type];
		if (!tmpl) return [];
		const tags = [];
		if (tmpl.flag === "cameltoe" && pose === "back") tags.push("camel_toe");
		if (tmpl.flag === "nipslip" || tmpl.flag === "sideboob") tags.push(pose === "back" ? "nipple" : "sideboob");
		if (type === "areola_show" && pose === "back") tags.push("areola");
		if (tmpl.flag === "underboob" && pose === "back") tags.push("breasts");
		if (tmpl.flag === "downblouse" && pose === "back") tags.push("chest");
		if ((tmpl.flag === "upshorts" || tmpl.altFlags && tmpl.altFlags.includes("underbutt")) && pose === "stomach")
			tags.push("butt");
		if (tmpl.altFlags && tmpl.altFlags.includes("underbutt") && pose === "stomach") tags.push("underbutt");
		if (tmpl.altFlags && tmpl.altFlags.includes("buttcrack") && pose === "stomach") tags.push("butt_crack");
		if (tags.length) return tags;
		const view = this.get_pose_view(pose);
		if (view && tmpl.coverAny)
		{
			for (const c of tmpl.coverAny)
			{
				if (view.visible.includes(c) || view.visible.includes("crotch") && c === "groin")
					return this.anatomy_to_exposure_tags([c], person, pose, legSpread);
			}
		}
		return ["thigh"];
	},

	_active_adjustment_tags(person, pose, legSpread)
	{
		const EA = setup.ExhibitionAdjustment;
		if (!EA || !person) return [];
		const tagSet = new Set();
		for (const cItem of person.get_clothingItems_classes())
		{
			for (const [type] of Object.entries(EA._get_adjustments(cItem)))
			{
				const steps = EA.get_steps(cItem, type);
				if (steps <= 0) continue;
				const tmpl = EA.TEMPLATES[type];
				if (!tmpl || !this.template_visible_for_pose(tmpl, pose)) continue;
				for (const tag of this._tags_for_adjustment_step(person, cItem, type, pose, legSpread, steps))
					tagSet.add(tag);
			}
		}
		return [...tagSet];
	},

	pose_noticeable_parts(person, minScore = 3)
	{
		if (!person || !V.tanpose || !setup.BodyExposure) return [];
		const allowed = new Set(this.POSE_EXPOSURE_PARTS[V.tanpose] || []);
		if (!allowed.size) return [];
		return setup.BodyExposure.noticeable_parts(person, minScore)
			.filter(entry => allowed.has(entry.part));
	},

	_body_part_to_tag(part)
	{
		return this.BODY_PART_TO_TAG[part] || null;
	},

	pose_exposure_phrases(person, maxCount = 3, minScore = 3)
	{
		const phrases = [];
		const seen = new Set();
		for (const entry of this.pose_noticeable_parts(person, minScore))
		{
			const phrase = this.exposure_phrase_for_part(entry);
			if (!phrase || seen.has(phrase)) continue;
			seen.add(phrase);
			phrases.push(phrase);
			if (phrases.length >= maxCount) break;
		}
		return phrases;
	},

	exposure_phrase_for_part(entry)
	{
		if (!entry) return "";
		const BE = setup.BodyExposure;
		if (BE && BE.exposure_part_phrase)
			return BE.exposure_part_phrase(entry.part, entry);
		const tag = this._body_part_to_tag(entry.part);
		return tag ? (this.EXPOSURE_TAG_HINT[tag] || tag.replace(/_/g, " ")) : "";
	},

	format_pose_exposure_summary(person)
	{
		if (!person || !V.tanpose) return "";
		const phrases = this.pose_exposure_phrases(person, 4, 3);
		if (!phrases.length) return "";
		if (phrases.length === 1)
			return "From this angle, onlookers can see " + phrases[0] + ".";
		const last = phrases.pop();
		return "From this angle, onlookers can see " + phrases.join(", ") + ", and " + last + ".";
	},

	adjustment_narration(person, action)
	{
		const EA = setup.ExhibitionAdjustment;
		if (!EA || !action || !action.clothingItem) return "";
		const cItem = action.clothingItem;
		const item = setup.capitalize_each(cItem.get_name(true));
		const type = action.adjType;
		const tmpl = EA.TEMPLATES[type] || {};
		const dir = action.direction > 0 ? "up" : "down";
		const byType = this.ADJUST_NARRATION[type];
		if (byType && byType[dir])
			return byType[dir].replace(/%item%/g, item);
		const flag = tmpl.flag || (tmpl.altFlags && tmpl.altFlags[0]);
		const byFlag = flag && this.ADJUST_NARRATION_FLAG[flag];
		if (byFlag && byFlag[dir])
			return byFlag[dir].replace(/%item%/g, item);
		const verb = dir === "up" ? (tmpl.up || "adjust") : (tmpl.down || "adjust");
		if (dir === "up")
			return "You " + verb.toLowerCase() + " your " + item + ", letting the fabric settle in a more revealing way — as if it happened on its own.";
		return "You " + verb.toLowerCase() + " your " + item + ", toning down the show and playing innocent.";
	},

	ADJUST_NARRATION: {
		areola_show: {
			up: "You adjust your %item% until your areolas show through the fabric in broad daylight — deliberate, shameless, impossible to unsee.",
			down: "You smooth your %item% back over your areolas, though the fabric still clings where anyone's looking.",
		},
		nipple_slip: {
			up: "You tug your %item% until a nipple slips free in the sunlight, then lie back like you didn't mean to.",
			down: "You tuck your nipple back under your %item%, but not before giving anyone nearby an eyeful.",
		},
		tie_top: {
			up: "You tie your %item% higher, hiking the hem until your stomach and the underside of your breasts are on display.",
			down: "You loosen your %item%, letting the hem fall and cover a little more skin.",
		},
		tighten_bottom: {
			up: "You hike the waistband on your %item%, working the fabric up until the seam digs in and your camel toe is impossible to miss.",
			down: "You tug your %item% back down, smoothing the fabric over your crotch like you're just getting comfortable.",
		},
		hike_skirt: {
			up: "You hike your %item% higher, baring more thigh and letting anyone behind you see how little you're wearing.",
			down: "You tug your %item% back down, pretending you didn't just flash half the mall.",
		},
		loosen_neck: {
			up: "You loosen the neckline on your %item%, giving anyone walking past a deeper view down your chest.",
			down: "You tighten your %item% at the neck, pulling fabric back over what you'd been showing off.",
		},
		side_gap: {
			up: "You loosen your %item% at the sides until your breasts threaten to spill out with every breath.",
			down: "You tug your %item% back into place at the sides, though the memory of sideboob lingers.",
		},
		bare_midriff: {
			up: "You tug your %item% up, baring the underside of your breasts and a strip of midriff to the sun.",
			down: "You pull your %item% back down, covering the strip of skin you'd been flaunting.",
		},
		open_outer: {
			up: "You leave your %item% hanging open, giving a generous view of what's underneath.",
			down: "You close your %item% up, though you don't quite manage to look like you meant to cover everything.",
		},
		dress_daring: {
			up: "You adjust your %item% daringly — neckline lower, hem higher — until the whole outfit reads as an invitation.",
			down: "You tug your %item% back into something closer to modest, without quite undoing the impression you made.",
		},
		underwear_peek: {
			up: "You tug your %item% so the waistband rides lower, flashing the curve of your ass to anyone behind you.",
			down: "You hike your %item% back up, hiding the waistband peek you'd been offering.",
		},
		swim_adjust: {
			up: "You adjust your %item% skimpier — straps looser, fit tighter — until it looks less like swimwear and more like a dare.",
			down: "You settle your %item% into a safer fit, though you're still very much on display.",
		},
	},

	ADJUST_NARRATION_FLAG: {
		cameltoe: {
			up: "You hike your %item% until the fabric bites in shamelessly — the camel-toe outline unmistakable from this angle.",
			down: "You smooth your %item% over your crotch, but the seam still remembers where it was digging in.",
		},
		nipslip: {
			up: "You pull your %item% tight across your chest until your nipples show through — then relax like the fabric did it on its own.",
			down: "You loosen your %item% over your chest, though your nipples still press against the fabric.",
		},
		downblouse: {
			up: "You loosen your %item% until the neckline gapes, offering a down-blouse view to anyone walking past.",
			down: "You tighten your %item% at the neck, pulling fabric back over the view you'd been giving.",
		},
		upshorts: {
			up: "You hike your %item% up your thighs, leaving less and less to the imagination from behind.",
			down: "You tug your %item% back down your legs, playing innocent.",
		},
		sideboob: {
			up: "You loosen your %item% until the sides gape and your breasts spill into view with every shift.",
			down: "You tug your %item% snug at the sides again, though you've already given them a look.",
		},
		underboob: {
			up: "You tug your %item% up until the underside of your breasts catches the sun.",
			down: "You pull your %item% back down, covering the underboob you'd been showing off.",
		},
		underbutt: {
			up: "You tug your %item% lower so the waistband rides under your ass, flashing underbutt to anyone behind you.",
			down: "You hike your %item% back up, hiding the strip of skin beneath your shorts.",
		},
	},

	apply_tan_action(person, action)
	{
		if (!person || !action) return false;
		if (action.kind === "legs")
		{
			V.tanlegspread = !!action.spread;
			this.maybe_invalidate_paperdoll(person);
			return true;
		}
		if (action.kind === "adjust" && setup.ExhibitionAdjustment)
		{
			setup.ExhibitionAdjustment.adjust(person, action.clothingItem, action.adjType, action.direction);
			this.maybe_invalidate_paperdoll(person);
			return true;
		}
		return this.apply_tan_displacement(person, action);
	},

	apply_tan_displacement(person, action)
	{
		if (!person || !action) return false;
		if (action.displacement === "fix")
			person.remove_all_clothing_displacements(action.clothing);
		else
			person.add_clothing_displacement(action.clothing, action.displacement);

		if (!V.tanexhibapplied) V.tanexhibapplied = [];
		if (action.displacement !== "fix" && V.tanexhibapplied.indexOf(action.id) === -1)
			V.tanexhibapplied.push(action.id);

		this.maybe_invalidate_paperdoll(person);
		return true;
	},

	// Witness reaction tiers (higher = bolder / more overt).
	WITNESS_TIER: {
		none: 0,
		fleeting: 1,
		glance: 2,
		look: 3,
		linger: 4,
		stare: 5,
		voyeur: 6,
		touch_self: 7,
		approach: 8,
		grope: 9,
	},

	witness_label(name, cap = false)
	{
		let label = this.menu_npc_label(name);
		if (cap) label = setup.capitalize(label);
		return label;
	},

	menu_npc_label(name)
	{
		if (!name) return "someone";
		const p = setup.people;
		if (p.can_identify_name(name)) return p.fullname(name);
		if (p.is_known(name)) return p.firstname(name);
		if (typeof p.anonymous_name === "function")
		{
			const anon = p.anonymous_name(name);
			if (anon) return anon;
		}
		return "a passerby";
	},

	menu_link_label(kind, name)
	{
		const who = this.menu_npc_label(name);
		switch (kind)
		{
			case "beckon": return "Beckon " + who + " over";
			case "show": return "Shift to show " + who;
			case "hide": return "Hide from " + who;
			case "wave": return "Wave to " + who;
			case "tease": return "Show off more for " + who;
			default: return who;
		}
	},

	ensure_witness_roster()
	{
		if (!V.tanactivewitnesses || !Array.isArray(V.tanactivewitnesses))
			V.tanactivewitnesses = [];
	},

	register_active_witness(data)
	{
		if (!data || !data.witness) return;
		const tier = data.tier || 0;
		const T = this.WITNESS_TIER;
		if (tier >= T.approach) return;

		const profile = this.profile_tan_witness(data.witness);
		const offers = data.offerChoice === true
			|| this.witness_offers_view_choice(tier, profile);
		if (!offers) return;

		this.ensure_witness_roster();
		let entry = V.tanactivewitnesses.find(w => w.witness === data.witness);
		if (!entry)
		{
			entry = { witness: data.witness };
			V.tanactivewitnesses.push(entry);
		}
		entry.tier = Math.max(entry.tier || 0, tier);
		entry.tags = (data.tags || entry.tags || []).slice();
		entry.offerChoice = true;
		if (data.template) entry.template = data.template;
		if (data.focus) entry.focus = data.focus;
		if (data.plain) entry.plain = data.plain;
		if (data.suffix) entry.suffix = data.suffix;
	},

	dismiss_active_witness(npc)
	{
		if (!npc) return;
		this.ensure_witness_roster();
		V.tanactivewitnesses = V.tanactivewitnesses.filter(w => w.witness !== npc);
	},

	ensure_witness_display(entry, person)
	{
		if (!entry || !entry.witness || entry.template || entry.plain) return;
		const tags = entry.tags || (person ? this.current_visible_exposure(person) : []);
		const tier = entry.tier || this.WITNESS_TIER.glance;
		const profile = this.profile_tan_witness(entry.witness);
		const attScore = this.attention_score_for_tags(tags);
		const flavor = this.pick_tan_witness_flavor(entry.witness, tier, tags, attScore, profile, person);
		if (!flavor) return;
		if (flavor.template) entry.template = flavor.template;
		if (flavor.plain) entry.plain = flavor.plain;
		if (flavor.focus) entry.focus = flavor.focus;
	},

	ambient_witness_tier(attScore, ambTh)
	{
		const T = this.WITNESS_TIER;
		if (attScore >= ambTh + 4) return T.stare;
		if (attScore >= ambTh + 2) return T.linger;
		if (attScore >= ambTh + 1) return T.look;
		return T.glance;
	},

	ensure_scene_witnesses(person, maxCount = 3)
	{
		if (!person || !V.tanpose) return;
		this.ensure_witness_roster();

		const attScore = this.attention_from_displacements(person);
		const ambTh = this.mall_ambient_attention_threshold();
		if (attScore < ambTh) return;

		const active = V.tanactivewitnesses.filter(w => w.offerChoice && w.witness);
		const needed = maxCount - active.length;
		if (needed <= 0) return;

		const people = (V.peopleatlocation || []).filter(p => p && p !== "dummy");
		if (!people.length) return;

		const esc = this.normalize_close_escalation();
		const closeNpc = esc && esc.npc;
		const existing = new Set(V.tanactivewitnesses.map(w => w.witness));
		const tags = this.current_visible_exposure(person);
		const crowdFx = this.mall_crowd_modifiers(people.length);
		let tier = this.ambient_witness_tier(attScore, ambTh);
		if (crowdFx.level === "crowded")
			tier = Math.min(tier, this.WITNESS_TIER.stare);

		const scored = people.map(name => {
			const profile = this.profile_tan_witness(name);
			let score = profile.watchScore + State.random() * 1.5;
			if (name === closeNpc) score -= 100;
			return { name, score, profile };
		}).filter(e => !existing.has(e.name) && e.name !== closeNpc);
		scored.sort((a, b) => b.score - a.score);

		let added = 0;
		for (const entry of scored)
		{
			if (added >= needed) break;
			const flavor = this.pick_tan_witness_flavor(entry.name, tier, tags, attScore, entry.profile, person);
			if (!flavor || flavor.plain) continue;
			this.register_active_witness({
				witness: entry.name,
				template: flavor.template,
				focus: flavor.focus,
				tier,
				tags: tags.slice(),
				offerChoice: true,
			});
			added++;
		}
	},

	get_active_witness_choices(person)
	{
		if (person) this.ensure_scene_witnesses(person);
		this.ensure_witness_roster();
		const T = this.WITNESS_TIER;
		const choices = V.tanactivewitnesses.filter(w =>
			w.offerChoice && w.witness && (w.tier || 0) < T.approach);
		if (person)
		{
			for (const w of choices)
				this.ensure_witness_display(w, person);
		}
		return choices;
	},

	register_witness_notice_batch(witnessData, extras, tags)
	{
		if (witnessData)
			this.register_active_witness(witnessData);
		if (!extras || !extras.length) return;
		for (const ex of extras)
		{
			if (!ex || !ex.witness) continue;
			const profile = this.profile_tan_witness(ex.witness);
			this.annotate_witness_choice(ex, ex.tier || this.WITNESS_TIER.glance, profile, tags);
			this.register_active_witness(ex);
		}
	},

	witness_focus_phrase(tags, person)
	{
		if (person)
		{
			const parts = this.pose_noticeable_parts(person, 3);
			if (parts.length)
				return this.exposure_phrase_for_part(parts[0]);
		}
		if (tags.includes("camel_toe"))
			return "the camel-toe outline through your bottoms";
		if (tags.includes("bulge"))
			return "the bulge straining your bottoms";
		if (tags.includes("areola"))
			return "your areola showing through your top";
		if (tags.includes("nipple"))
			return "your nipples showing through your top";
		if (tags.includes("crotch") || tags.includes("bare_crotch") || tags.includes("bare_genitals"))
			return "how much you're showing between your legs";
		if (tags.includes("sideboob"))
			return "the side of your breast spilling out";
		if (tags.includes("breasts") || tags.includes("underboob"))
			return "your breasts";
		if (tags.includes("butt_crack"))
			return "your butt crack peeking out";
		if (tags.includes("underbutt"))
			return "the strip of skin beneath your shorts";
		if (tags.includes("butt"))
			return "your ass";
		if (tags.includes("chest") || tags.includes("cleavage"))
			return "your cleavage";
		if (tags.includes("thigh"))
			return "your thighs";
		return "how your clothes have shifted";
	},

	profile_tan_witness(name)
	{
		const p = setup.people;
		const lust = p.get_attitude(name, "lust") || 0;
		const voyeur = p.has_any_inclination(name, "voyeur") || p.has_any_inclination(name, "basic_voyeur");
		const groper = p.has_any_inclination(name, "groper") || p.has_any_inclination(name, "anon_groper");
		const dominant = p.has_any_inclination(name, "just_dominant") || p.has_any_inclination(name, "Dominant");
		const forward = p.has_any_inclination(name, "forward") || p.has_any_inclination(name, "Confident");
		const attracted = p.attracted_enough_to_pc(name);
		const shy = p.has_any_inclination(name, "shy");

		let boldness = 0;
		if (forward) boldness += 2;
		if (dominant) boldness += 2;
		if (groper) boldness += 3;
		if (voyeur) boldness += 1;
		if (attracted) boldness += 1;
		if (lust >= 400) boldness += 1;
		if (lust >= 700) boldness += 2;
		if (shy) boldness -= 2;

		const watchScore = boldness + (voyeur ? 3 : 0) + (attracted ? 2 : 0) + lust / 300;
		return { lust, voyeur, groper, dominant, forward, attracted, shy, boldness, watchScore };
	},

	witness_name_link(name, capfirst = false)
	{
		if (!name) return capfirst ? "Someone" : "someone";
		if (capfirst)
			return '<<viewperson "' + name + '">><<danonorfullnamec "' + name + '">><</viewperson>>';
		return '<<viewperson "' + name + '">><<danonorfullname "' + name + '">><</viewperson>>';
	},

	format_tan_witness_wiki(data)
	{
		if (!data) return "";
		if (data.plain) return data.plain;
		if (!data.witness || !data.template)
		{
			if (data.witness)
				return this.witness_name_link(data.witness, true)
					+ " has been watching you — not even pretending to look away.";
			return "";
		}
		let text = data.template;
		const pr = setup.people.pronouns(data.witness);
		text = text.replace(/%Witness%/g, this.witness_name_link(data.witness, true));
		text = text.replace(/%witness%/g, this.witness_name_link(data.witness, false));
		text = text.replace(/%Ps%/g, pr.psc);
		text = text.replace(/%ps%/g, pr.ps);
		text = text.replace(/%po%/g, pr.po);
		text = text.replace(/%pp%/g, pr.pp);
		text = text.replace(/%focus%/g, data.focus || "how your clothes have shifted");
		if (data.suffix) text += " " + data.suffix;
		return text;
	},

	tags_to_exhibition_parts(tags, person)
	{
		const parts = [];
		const add = (p) => { if (!parts.includes(p) && person.has_part(p)) parts.push(p); };
		for (const tag of tags || [])
		{
			if (["nipple", "breasts", "chest", "sideboob"].includes(tag)) add("breasts");
			else if (["butt", "butt_crack", "underbutt"].includes(tag)) add("butt");
			else if (["crotch", "camel_toe", "bulge"].includes(tag))
			{
				if (person.has_part("penis")) add("penis");
				if (person.has_part("vagina")) add("vagina");
			}
		}
		return parts;
	},

	register_tan_witness_memory(person, witness, tags, tier)
	{
		if (!person || !witness || tier <= this.WITNESS_TIER.fleeting) return;
		const attScore = this.attention_score_for_tags(tags);
		const rumor = Math.round(8 + attScore + tier * 2);
		setup.people.alter_rumor_strength(witness, "exhibitionism", rumor);
		const parts = this.tags_to_exhibition_parts(tags, person);
		if (parts.length && tier >= this.WITNESS_TIER.glance)
		{
			const exType = person.wearing_some_swimwear() ? "underwear" : "underwear";
			setup.Events.exhibitionism(parts, exType, "in person", true, [witness], { silent: true });
		}
	},

	fill_witness_template(str, witness, focus)
	{
		const pr = setup.people.pronouns(witness);
		const who = this.witness_name_link(witness, false);
		const Who = this.witness_name_link(witness, true);
		return str
			.replace(/\{who\}/g, who)
			.replace(/\{Who\}/g, Who)
			.replace(/\{ps\}/g, pr.ps)
			.replace(/\{Ps\}/g, pr.psc)
			.replace(/\{po\}/g, pr.po)
			.replace(/\{pp\}/g, pr.pp)
			.replace(/\{focus\}/g, focus);
	},

	roll_tan_notice(attScore, profile, crowdSize)
	{
		const n = crowdSize != null ? crowdSize : this.mall_crowd_count();
		if (n <= 0) return false;
		const crowd = this.mall_crowd_modifiers(n);
		let chance = 0.05 + attScore * 0.032 + Math.min(n, 120) * 0.0018;
		if (profile.attracted) chance += 0.10;
		if (profile.voyeur) chance += 0.14;
		if (profile.forward) chance += 0.05;
		chance *= crowd.noticeMult;
		return State.random() < Math.min(0.88, chance);
	},

	is_passive_witness_tier(tier)
	{
		const T = this.WITNESS_TIER;
		return tier >= T.fleeting && tier <= T.touch_self;
	},

	is_active_witness_tier(tier)
	{
		return tier >= this.WITNESS_TIER.approach;
	},

	roll_witness_tier(attScore, profile)
	{
		const T = this.WITNESS_TIER;
		const crowd = this.mall_crowd_modifiers();
		let maxTier = T.fleeting;
		if (attScore >= 3) maxTier = T.glance;
		if (attScore >= 5) maxTier = T.look;
		if (attScore >= 7) maxTier = T.linger;
		if (attScore >= 9) maxTier = T.stare;
		if (attScore >= 11 && profile.voyeur) maxTier = T.voyeur;
		if (attScore >= 12 && profile.lust >= 350 && profile.voyeur) maxTier = T.touch_self;
		if (attScore >= 13 && profile.boldness >= 3 && profile.attracted) maxTier = T.approach;
		if (attScore >= 14 && profile.groper && profile.lust >= 400 && profile.boldness >= 4)
			maxTier = T.grope;

		if (profile.boldness >= 5) maxTier = Math.min(T.grope, maxTier + 1);
		if (profile.lust >= 600) maxTier = Math.min(T.grope, maxTier + 1);

		// Crowded malls pile on passive watching; quiet malls free bolder approach/grope.
		if (crowd.activeMaxCap != null)
			maxTier = Math.min(maxTier, crowd.activeMaxCap);
		if (crowd.passiveMinFloor != null && maxTier < crowd.passiveMinFloor && attScore >= 3)
			maxTier = crowd.passiveMinFloor;

		const weights = [];
		for (let tier = T.fleeting; tier <= maxTier; tier++)
		{
			let w = 0;
			switch (tier)
			{
				case T.fleeting: w = 34; break;
				case T.glance: w = 26; break;
				case T.look: w = 18; break;
				case T.linger: w = 11; break;
				case T.stare: w = 6; break;
				case T.voyeur: w = profile.voyeur ? 4 : 1; break;
				case T.touch_self: w = profile.voyeur && profile.lust >= 300 ? 2.5 : 0.4; break;
				case T.approach: w = profile.boldness >= 3 ? 1.2 : 0.3; break;
				case T.grope:
					w = (profile.groper && profile.lust >= 400 && attScore >= 10) ? 0.6 : 0;
					break;
			}
			if (this.is_passive_witness_tier(tier))
				w *= crowd.passiveWeightMult;
			else if (this.is_active_witness_tier(tier))
				w *= crowd.activeWeightMult;
			if (w > 0) weights.push({ tier, w });
		}
		if (!weights.length) return T.none;

		const total = weights.reduce((s, e) => s + e.w, 0);
		let roll = State.random() * total;
		for (const entry of weights)
		{
			roll -= entry.w;
			if (roll <= 0) return entry.tier;
		}
		return weights[weights.length - 1].tier;
	},

	witness_offers_view_choice(tier, profile)
	{
		const T = this.WITNESS_TIER;
		if (!profile || tier < T.glance || tier >= T.approach) return false;
		return true;
	},

	annotate_witness_choice(witnessData, tier, profile, tags)
	{
		if (!witnessData || witnessData.plain || !witnessData.witness) return witnessData;
		if (tier >= this.WITNESS_TIER.approach) return witnessData;
		if (!this.witness_offers_view_choice(tier, profile)) return witnessData;
		witnessData.offerChoice = true;
		witnessData.tags = (tags || []).slice();
		witnessData.tier = tier;
		return witnessData;
	},

	roll_passive_extra_witnesses(person, tags, attScore, excludeWitness, crowdFx)
	{
		const T = this.WITNESS_TIER;
		if (!crowdFx || attScore < 2) return [];
		let extraCount = crowdFx.extraPassiveCount || 0;
		if (crowdFx.level === "normal" && attScore >= 5 && State.random() < 0.28)
			extraCount += 1;
		if (extraCount <= 0) return [];

		const people = (V.peopleatlocation || []).filter(p => p && p !== "dummy" && p !== excludeWitness);
		if (!people.length) return [];

		const passiveCeiling = crowdFx.level === "crowded" ? T.stare : T.linger;
		const results = [];
		const picked = new Set();

		for (let i = 0; i < extraCount && picked.size < people.length; i++)
		{
			let name = setup.randomchoice(people.filter(p => !picked.has(p)));
			if (!name) break;
			picked.add(name);
			const profile = this.profile_tan_witness(name);
			if (!this.roll_tan_notice(attScore * 0.55, profile, crowdFx.count))
				continue;

			let tier = T.glance + Math.floor(State.random() * (passiveCeiling - T.glance + 1));
			tier = Math.min(passiveCeiling, Math.max(T.glance, tier));
			const flavor = this.pick_tan_witness_flavor(name, tier, tags, attScore, profile, person);
			if (!flavor || flavor.plain) continue;
			this.apply_witness_lust(name, tier, attScore, profile);
			this.register_tan_witness_memory(person, name, tags, tier);
			results.push(flavor);
		}
		return results;
	},

	escalate_visible_exposure(person)
	{
		if (!person || !V.tanpose) return { applied: false, msg: "You shift slightly, though there's not much more to show." };
		const pose = V.tanpose;
		if (pose === "back" && !V.tanlegspread)
		{
			V.tanlegspread = true;
			this.maybe_invalidate_paperdoll(person);
			return { applied: true, msg: "You let your knees fall wider, giving a shameless view of what's between your thighs." };
		}

		const actions = this.get_tan_menu_actions(person, pose);
		const more = actions.filter(a => {
			if (a.exposure_dir !== "more" || !a.visible_tags || !a.visible_tags.length) return false;
			return person.skillleveled("Exhibitionism", a.exhib_req || 0);
		});
		if (more.length)
		{
			const act = more[0];
			this.apply_tan_action(person, act);
			return { applied: true, msg: this.displacement_narration(person, act) };
		}

		if (pose === "stomach")
			return { applied: true, msg: "You arch your back a little, lifting your ass off the towel for anyone walking behind you." };
		return { applied: true, msg: "You stretch languidly, making sure every adjustment is aimed right at your audience." };
	},

	reduce_visible_exposure(person)
	{
		if (!person || !V.tanpose) return { msg: "You tug your outfit back into place." };
		const pose = V.tanpose;
		let changed = false;

		if (V.tanlegspread)
		{
			V.tanlegspread = false;
			changed = true;
		}

		const clothes = person.targetable_clothing(person);
		for (let i = 0; i < clothes.length; i++)
		{
			const clothingName = clothes[i];
			if (!person.active_clothing_displacements(clothingName).length) continue;
			const cinfo = person.clothing_archetype(clothingName);
			let coversVisible = false;
			for (const disp of person.active_clothing_displacements(clothingName))
			{
				const visible = this.filter_visible_uncover(cinfo["displace " + disp] || [], pose, false);
				if (visible.length) { coversVisible = true; break; }
			}
			if (coversVisible)
			{
				person.remove_all_clothing_displacements(clothingName);
				changed = true;
			}
		}

		if (setup.ExhibitionAdjustment)
		{
			for (const cItem of person.get_clothingItems_classes())
			{
				for (const adj of setup.ExhibitionAdjustment.available_for_item(person, cItem))
				{
					if (!this.template_visible_for_pose(adj.info, pose)) continue;
					if (setup.ExhibitionAdjustment.get_steps(cItem, adj.type) > 0)
					{
						setup.ExhibitionAdjustment.adjust(person, cItem, adj.type, -1);
						changed = true;
						break;
					}
				}
				if (changed) break;
			}
		}

		this.maybe_invalidate_paperdoll(person);
		return {
			changed,
			msg: changed
				? "You angle away and tug your clothes back into place, shutting down the show."
				: "You turn your shoulder to the onlooker, but your outfit was already about as covered as it was going to get.",
		};
	},

	apply_tease_witness(person, witnessData)
	{
		if (!person || !witnessData || !witnessData.witness) return "";
		const npc = witnessData.witness;
		const tags = witnessData.tags || this.current_visible_exposure(person);
		const attScore = this.attention_score_for_tags(tags);
		const esc = this.escalate_visible_exposure(person);
		const profile = this.profile_tan_witness(npc);

		setup.people.alter_attitude(npc, "lust", setup.rir(18, 32));
		this.register_tan_witness_memory(person, npc, this.current_visible_exposure(person), this.WITNESS_TIER.linger);
		this.tan_gain_arousal(setup.rir(28, 48));
		this.tan_gain_attention(setup.rir(18, 32));

		const pr = setup.people.pronouns(npc);
		return esc.msg + " "
			+ this.witness_name_link(npc, true) + " definitely noticed the invitation — " + pr.ps + " doesn't look away.";
	},

	apply_hide_from_witness(person, witnessData)
	{
		if (!person || !witnessData || !witnessData.witness) return "";
		const npc = witnessData.witness;
		const tier = witnessData.tier || 0;
		const T = this.WITNESS_TIER;
		const esc = this.normalize_close_escalation();
		const profile = this.profile_tan_witness(npc);
		const hide = this.reduce_visible_exposure(person);
		const pr = setup.people.pronouns(npc);
		const who = this.witness_name_link(npc, true);
		const tags = witnessData.tags || this.current_visible_exposure(person);
		const isClose = esc && esc.npc === npc;
		const isBold = isClose || tier >= T.approach
			|| profile.boldness >= 4
			|| (profile.groper && profile.lust >= 350);

		this.dismiss_active_witness(npc);

		if (isBold)
		{
			if (profile.groper && profile.lust >= 400 || tier >= T.grope || (esc && esc.tier === "grope"))
			{
				this.init_close_escalation(npc, tags, "grope");
				return hide.msg + " You try to cover up, but that only eggs " + who
					+ " on — " + pr.ps + " closes in like your modesty was the invitation.";
			}
			const nextTier = (esc && esc.tier === "approach") ? "grope" : "approach";
			this.init_close_escalation(npc, tags, nextTier);
			return hide.msg + " You angle away, but " + who
				+ " follows the movement closer, unwilling to let the view go.";
		}

		setup.people.alter_attitude(npc, "lust", -setup.rir(6, 14));
		setup.Needs.gain_composure(setup.rir(10, 18));
		return hide.msg + " " + who + " loses the view " + pr.ps + " was enjoying.";
	},

	can_pleasing_tease_path(person)
	{
		if (!person) return false;
		return person.has_inclination("Pleaser")
			|| person.has_inclination("Submissive Vibe")
			|| person.has_inclination("Accommodating")
			|| person.has_inclination("Submissive")
			|| person.has_any_inclination("submissive");
	},

	can_bold_exhib_path(person)
	{
		if (!person) return false;
		return person.has_inclination("Deliberate Exhibitionist")
			|| person.has_inclination("Audacious Exhibitionist")
			|| person.has_inclination("Proud Exhibitionist")
			|| person.has_inclination("Lewd Exhibitionist");
	},

	tease_audience_exhib_req(person)
	{
		return this.can_pleasing_tease_path(person)
			? this.TEASE_AUDIENCE_EXHIB_PLEASING
			: this.TEASE_AUDIENCE_EXHIB;
	},

	beckon_audience_exhib_req(person)
	{
		if (this.can_bold_exhib_path(person)) return this.BECKON_AUDIENCE_EXHIB_BOLD;
		if (this.can_pleasing_tease_path(person)) return this.BECKON_AUDIENCE_EXHIB - 1;
		return this.BECKON_AUDIENCE_EXHIB;
	},

	can_tease_audience(person, npc)
	{
		if (!person || !npc || !this.is_familiar_npc(npc)) return false;
		return person.skillleveled("Exhibitionism", this.tease_audience_exhib_req(person))
			&& this.attention_from_displacements(person) >= 2;
	},

	can_beckon_audience(person, npc)
	{
		if (!person || !npc) return false;
		const profile = this.profile_tan_witness(npc);
		const receptive = profile.voyeur || profile.attracted || profile.lust >= 280;
		if (!this.is_familiar_npc(npc) && !receptive) return false;
		return person.skillleveled("Exhibitionism", this.beckon_audience_exhib_req(person))
			&& this.attention_from_displacements(person) >= 2;
	},

	is_familiar_npc(name)
	{
		const p = setup.people;
		if (!name || !p.is_known(name)) return false;
		if (p.is_classmate(name) || p.is_coworker(name) || p.is_teammate(name)) return true;
		if (p.is_friend(name) || p.is_romantic_partner(name) || p.is_bootycall(name)) return true;
		const rel = setup.Relationships.relationship_with(name);
		return rel && rel !== "stranger";
	},

	audience_priority_score(name, profile, familiar)
	{
		let score = familiar ? 4 : 0;
		if (profile.attracted) score += 5;
		if (profile.voyeur) score += 3;
		if (profile.lust >= 400) score += 2;
		score += (profile.lust || 0) / 250;
		return score;
	},

	get_audience_targets(person, maxCount = 3)
	{
		if (!person || !V.tanpose) return [];
		if (this.attention_from_displacements(person) < 2) return [];

		const people = (V.peopleatlocation || []).filter(p => p && p !== "dummy");
		const targets = [];

		for (const name of people)
		{
			const profile = this.profile_tan_witness(name);
			const familiar = this.is_familiar_npc(name);
			const receptive = profile.voyeur || profile.attracted || profile.lust >= 280;
			const canWave = familiar && setup.people.is_known(name);
			const canTease = this.can_tease_audience(person, name);
			const canBeckon = this.can_beckon_audience(person, name);
			if (!canWave && !canTease && !canBeckon) continue;
			targets.push({
				name,
				profile,
				familiar,
				receptive,
				canWave,
				canTease,
				canBeckon,
				score: this.audience_priority_score(name, profile, familiar),
			});
		}

		targets.sort((a, b) => b.score - a.score);
		return targets.slice(0, maxCount);
	},

	apply_bold_tease_audience(person, npc)
	{
		if (!person || !npc) return "";
		const esc = this.escalate_visible_exposure(person);
		const tags = this.current_visible_exposure(person);
		const pr = setup.people.pronouns(npc);

		setup.people.alter_attitude(npc, "lust", setup.rir(14, 26));
		this.register_tan_witness_memory(person, npc, tags, this.WITNESS_TIER.linger);
		this.tan_gain_arousal(setup.rir(32, 52));
		this.tan_gain_attention(setup.rir(22, 36));

		let msg = esc.msg + " You deliberately aim the display at " + this.witness_name_link(npc, false);
		if (this.is_familiar_npc(npc))
		{
			const rels = setup.people.relation(npc, ["classmate", "hallmate"]);
			if (rels.length) msg += " — your " + setup.and(rels);
		}
		msg += ". " + setup.capitalize(pr.ps) + " freezes, then can't pretend " + pr.ps + " wasn't looking.";
		return msg;
	},

	apply_beckon_audience(person, npc)
	{
		if (!person || !npc) return "";
		this.dismiss_active_witness(npc);
		const profile = this.profile_tan_witness(npc);
		const tags = this.current_visible_exposure(person);
		const crowd = this.mall_crowd_modifiers();
		const esc = this.escalate_visible_exposure(person);
		const pr = setup.people.pronouns(npc);

		setup.people.alter_attitude(npc, "lust", setup.rir(28, 48));
		this.register_tan_witness_memory(person, npc, tags, this.WITNESS_TIER.voyeur);
		this.tan_gain_arousal(setup.rir(48, 72));
		this.tan_gain_attention(setup.rir(32, 50));

		let msg = esc.msg + " You catch " + this.witness_name_link(npc, false)
			+ "'s eye and pat the edge of your towel — an unmistakable invite. ";

		if (crowd.level === "empty" && (profile.boldness >= 2 || profile.attracted || profile.groper))
		{
			this.init_close_escalation(npc, tags, "approach");
			msg += setup.capitalize(pr.ps) + " actually drifts closer.";
		}
		else if (profile.voyeur || profile.attracted)
		{
			this.init_close_escalation(npc, tags, "approach");
			msg += setup.capitalize(pr.ps) + " settles in nearby, hungry for a better angle.";
		}
		else
		{
			this.init_close_escalation(npc, tags, "approach");
			msg += setup.capitalize(pr.ps) + " hesitates, then lingers anyway — looking.";
		}

		return msg;
	},

	close_exhib_req(base, person)
	{
		if (this.can_pleasing_tease_path(person)) return Math.max(this.EXHIB_TANNING_MIN, base - 2);
		return base;
	},

	normalize_close_escalation()
	{
		const esc = V.tanwitnessescalation;
		if (!esc || typeof esc !== "object" || Array.isArray(esc))
		{
			delete V.tanwitnessescalation;
			return null;
		}

		const npc = (typeof esc.npc === "string" && esc.npc)
			? esc.npc
			: ((typeof esc.witness === "string" && esc.witness) ? esc.witness : null);
		if (!npc)
		{
			delete V.tanwitnessescalation;
			return null;
		}

		esc.npc = npc;
		esc.tier = (esc.tier === "grope" || esc.tier === "approach") ? esc.tier : "approach";
		esc.npcAsked = !!esc.npcAsked;
		esc.talked = Number(esc.talked) || 0;
		esc.selfTouches = Number(esc.selfTouches) || 0;
		esc.finished = !!esc.finished;
		esc.pcOrgasmed = !!esc.pcOrgasmed;
		esc.finishedKind = esc.finishedKind || null;
		esc.tags = Array.isArray(esc.tags) ? esc.tags : [];
		V.tanwitnessescalation = esc;
		return esc;
	},

	has_valid_close_escalation()
	{
		return !!this.normalize_close_escalation();
	},

	init_close_escalation(npc, tags, tier = "approach")
	{
		if (!npc) return;
		V.tanwitnessescalation = {
			npc,
			tier: (tier === "grope" || tier === "approach") ? tier : "approach",
			tags: (tags || []).slice(),
			talked: 0,
			npcAsked: false,
			selfTouches: 0,
		};
	},

	get_close_escalation()
	{
		return this.normalize_close_escalation();
	},

	maybe_npc_asks_show_more()
	{
		const esc = this.normalize_close_escalation();
		if (!esc || esc.npcAsked || esc.tier === "grope") return null;
		const profile = this.profile_tan_witness(esc.npc);
		let chance = 0.22;
		if (profile.voyeur) chance += 0.18;
		if (profile.attracted) chance += 0.14;
		if (profile.lust >= 400) chance += 0.12;
		if (profile.forward) chance += 0.08;
		if (State.random() >= chance) return null;

		esc.npcAsked = true;
		const focus = this.witness_focus_phrase(esc.tags || this.current_visible_exposure(setup.pc()), setup.pc());
		const pools = [
			"%Who% clears %pp% throat. \"Don't stop on my account — I like the view of %focus%.\"",
			"%Who% leans closer. \"You gonna show me more, or just tease?\"",
			"\"Keep going,\" %witness% murmurs, eyes locked on %focus%.",
			"%Who% bites %pp% lip. \"Think you could give me a better look?\"",
		];
		let text = setup.randomchoice(pools);
		const pr = setup.people.pronouns(esc.npc);
		text = text.replace(/%Witness%/g, this.witness_name_link(esc.npc, true));
		text = text.replace(/%witness%/g, this.witness_name_link(esc.npc, false));
		text = text.replace(/%Who%/g, this.witness_name_link(esc.npc, true));
		text = text.replace(/%ps%/g, pr.ps);
		text = text.replace(/%pp%/g, pr.pp);
		text = text.replace(/%focus%/g, focus);
		return text;
	},

	apply_close_talk(person, npc, prompt)
	{
		const profile = this.profile_tan_witness(npc);
		const pr = setup.people.pronouns(npc);
		const who = this.witness_name_link(npc, false);
		const focus = this.witness_focus_phrase(this.current_visible_exposure(person), person);
		let pcLine = "";
		let npcLine = "";

		if (prompt === "like")
			pcLine = "\"Like what you see?\" you ask, voice lazy with false innocence.";
		else if (prompt === "think")
			pcLine = "\"So?\" you murmur. \"What do you think?\"";
		else if (prompt === "more")
			pcLine = "\"Want me to show more?\" The question slips out before you can pretend it was accidental.";
		else
			pcLine = "You meet " + who + "'s eyes without sitting up.";

		if (profile.shy && prompt === "more")
			npcLine = setup.capitalize(pr.ps) + " blushes hard. \"I... I shouldn't...\" But " + pr.ps + " doesn't leave.";
		else if (profile.attracted && (prompt === "like" || prompt === "more"))
			npcLine = "\"Yeah,\" " + who + " breathes. \"I really do.\"";
		else if (profile.voyeur)
			npcLine = setup.capitalize(pr.ps) + " swallows. \"It's... a hell of a view. Especially %focus%.\"".replace("%focus%", focus);
		else if (prompt === "think")
			npcLine = setup.capitalize(pr.ps) + " pauses. \"Bold. Didn't expect you to ask.\"";
		else
			npcLine = setup.capitalize(pr.ps) + " hesitates, then nods once, unable to play it cool.";

		setup.people.alter_attitude(npc, "lust", setup.rir(10, 18));
		const arousal = this.tan_gain_arousal(setup.rir(18, 32));
		const attention = this.tan_gain_attention(setup.rir(10, 18));

		const esc = this.get_close_escalation();
		if (esc && esc.npc === npc)
		{
			esc.talked = (esc.talked || 0) + 1;
			if (prompt === "more" && (profile.voyeur || profile.attracted || profile.lust >= 350))
				esc.npcAsked = true;
		}

		return this._close_result(pcLine + " " + npcLine, { arousal, attention });
	},

	apply_close_body_tease(person, npc, kind)
	{
		const pr = setup.people.pronouns(npc);
		let msg = "";
		if (kind === "trace")
			msg = "You drag your fingertips slowly over your stomach and down your thigh, watching " + this.witness_name_link(npc, false) + " track every inch.";
		else if (kind === "chest")
			msg = "You squeeze and knead your chest through your clothes, making sure " + this.witness_name_link(npc, false) + " has a front-row seat.";
		else if (kind === "hips")
			msg = "You roll your hips and arch into the sun, presenting yourself like it's for " + pr.po + " alone.";
		else
			msg = "You stretch with exaggerated leisure, every motion aimed at " + this.witness_name_link(npc, false) + ".";

		setup.people.alter_attitude(npc, "lust", setup.rir(14, 24));
		this.register_tan_witness_memory(person, npc, this.current_visible_exposure(person), this.WITNESS_TIER.linger);
		const arousal = this.tan_gain_arousal(setup.rir(28, 48));
		const attention = this.tan_gain_attention(setup.rir(18, 30));
		return this._close_result(msg, { arousal, attention });
	},

	apply_close_self_touch(person, npc, kind)
	{
		const pr = setup.people.pronouns(npc);
		const tags = this.current_visible_exposure(person);
		const who = this.witness_name_link(npc, false);
		const bare = this.crotch_genitals_visible(person);
		let msg = "";
		let arousalRoll = [30, 50];
		let attentionRoll = [18, 30];
		let touchWeight = 1;

		if (kind === "thigh")
			msg = "Your hand slides along your inner thigh, slow enough that " + who + " can't mistake the intent.";
		else if (kind === "crotch")
		{
			msg = "You let your fingers press and rub over the fabric between your legs, sighing like you forgot anyone was watching — while staring right at " + who + ".";
			arousalRoll = [45, 70];
			attentionRoll = [22, 38];
		}
		else if (kind === "play")
		{
			if (bare && person.has_part("vagina"))
				msg = "You hook your fingers under what's left of your coverage and rub your bare pussy where " + who + " can see every stroke.";
			else if (bare && person.has_part("penis"))
				msg = "You wrap your hand around your bare cock and stroke yourself shamelessly for " + who + "'s benefit.";
			else
				msg = "You stop pretending this is innocent and touch yourself openly, giving " + who + " the show " + pr.ps + " came over for.";
			arousalRoll = bare ? [75, 110] : [55, 85];
			attentionRoll = [30, 50];
			touchWeight = 2;
		}
		else
			msg = "You trail your hand where " + who + " can see, heat building under your skin.";

		const tier = kind === "play" ? this.WITNESS_TIER.voyeur : this.WITNESS_TIER.stare;
		setup.people.alter_attitude(npc, "lust", setup.rir(kind === "play" ? 28 : 18, kind === "play" ? 42 : 30));
		this.register_tan_witness_memory(person, npc, tags, tier);
		const arousal = this.tan_gain_arousal(setup.rir(arousalRoll[0], arousalRoll[1]));
		const attention = this.tan_gain_attention(setup.rir(attentionRoll[0], attentionRoll[1]));

		const esc = this.get_close_escalation();
		if (esc && esc.npc === npc)
			esc.selfTouches = (esc.selfTouches || 0) + touchWeight;

		return this._close_result(msg, { arousal, attention });
	},

	apply_close_pull_down(person, npc)
	{
		const act = this.close_expose_action(person);
		const who = this.witness_name_link(npc, false);
		if (!act)
			return this._close_result("You tug at your clothes, but there's nothing left you can bare without getting up.", {});

		this.apply_tan_action(person, act);
		const tags = this.current_visible_exposure(person);
		const pr = setup.people.pronouns(npc);
		setup.people.alter_attitude(npc, "lust", setup.rir(32, 52));
		this.register_tan_witness_memory(person, npc, tags, this.WITNESS_TIER.voyeur);
		const arousal = this.tan_gain_arousal(setup.rir(50, 80));
		const attention = this.tan_gain_attention(setup.rir(28, 45));
		const humiliation = setup.rir(20, 40);
		setup.Needs.gain_humiliation(humiliation);

		let msg = this.displacement_narration(person, act) + " " + setup.capitalize(pr.ps)
			+ " freezes, drinking in the view you just handed " + pr.po + ".";
		return this._close_result(msg, { arousal, attention, humiliation });
	},

	apply_close_finger(person, npc)
	{
		const who = this.witness_name_link(npc, false);
		const pr = setup.people.pronouns(npc);
		const tags = this.current_visible_exposure(person);
		let msg = "";
		if (person.has_part("vagina"))
			msg = "You spread yourself open on your towel and slide two fingers into your pussy, fucking yourself slowly while staring at " + who + " — making sure " + pr.ps + " doesn't miss a single wet sound.";
		else if (person.has_part("penis"))
			msg = "You fist your cock with deliberate, hungry strokes, putting on a show for " + who + " until your breath comes ragged.";
		else
			msg = "You touch yourself with nothing held back, every motion aimed straight at " + who + ".";

		setup.people.alter_attitude(npc, "lust", setup.rir(38, 58));
		this.register_tan_witness_memory(person, npc, tags, this.WITNESS_TIER.voyeur);
		const arousal = this.tan_gain_arousal(setup.rir(90, 130));
		const attention = this.tan_gain_attention(setup.rir(35, 55));
		const humiliation = setup.rir(25, 45);
		setup.Needs.gain_humiliation(humiliation);

		const esc = this.get_close_escalation();
		if (esc && esc.npc === npc)
			esc.selfTouches = (esc.selfTouches || 0) + 3;

		return this._close_result(msg, { arousal, attention, humiliation });
	},

	apply_close_orgasm(person, npc)
	{
		const who = this.witness_name_link(npc, false);
		const pr = setup.people.pronouns(npc);
		setup.people.alter_attitude(npc, "lust", setup.rir(50, 75));
		this.register_tan_witness_memory(person, npc, this.current_visible_exposure(person), this.WITNESS_TIER.grope);
		this.register_close_aftermath_memory(npc, "watched pc orgasm tanning");
		const attention = this.tan_gain_attention(setup.rir(40, 60));
		const humiliation = setup.rir(45, 75);
		setup.Needs.gain_humiliation(humiliation);

		let msg = "You can't hold back anymore — you ";
		if (person.has_part("vagina"))
			msg += "rub your clit frantically until your pussy clenches and you cum right there on your towel";
		else if (person.has_part("penis"))
			msg += "stroke yourself through the finish until you're spurting in front of " + who;
		else
			msg += "bring yourself to a shuddering climax";
		msg += ", gasping while " + who + " watches the whole thing. " + setup.capitalize(pr.ps) + " looks wrecked — and doesn't look away.";

		const esc = this.get_close_escalation();
		if (esc && esc.npc === npc)
			esc.selfTouches = (esc.selfTouches || 0) + 5;
		this.enter_close_finished_state(npc, "orgasm");

		return this._close_result(msg, { attention, humiliation, orgasm: true });
	},

	enter_close_finished_state(npc, kind = "climax")
	{
		const esc = this.normalize_close_escalation();
		if (!esc || esc.npc !== npc) return;
		esc.finished = true;
		esc.finishedKind = kind;
		if (kind === "orgasm") esc.pcOrgasmed = true;
		V.tanwitnessescalation = esc;
	},

	is_close_finished()
	{
		const esc = this.get_close_escalation();
		return !!(esc && esc.finished);
	},

	close_npc_stance(npc)
	{
		const p = setup.people;
		const profile = this.profile_tan_witness(npc);
		const rel = setup.Relationships.relationship_with(npc) || "stranger";
		let stance = "stranger";
		if (p.is_romantic_partner(npc) || setup.Relationships.partner("PC") === npc)
			stance = "lover";
		else if (p.is_friend(npc) || p.is_bootycall(npc))
			stance = "friend";
		else if (rel === "enemy" || rel === "archenemy" || rel === "bully")
			stance = "enemy";
		else if (rel === "hatefuck" || rel === "rival")
			stance = "rival";
		else if (p.has_any_inclination(npc, "Bully") || p.has_any_inclination(npc, "Sadist") || p.has_any_inclination(npc, "Breaker"))
			stance = "bully";
		else if (profile.shy)
			stance = "shy";
		else if (profile.voyeur)
			stance = "voyeur";
		else if (profile.attracted)
			stance = "attracted";
		return { stance, profile, rel };
	},

	register_close_aftermath_memory(npc, act)
	{
		if (!npc || !act) return;
		setup.record_sex_memory(npc, act);
	},

	fix_tan_outfit(person)
	{
		if (!person) return "";
		const hide = this.reduce_visible_exposure(person);
		if (setup.ExhibitionAdjustment)
			setup.ExhibitionAdjustment.fix_all(person);
		this.maybe_invalidate_paperdoll(person);
		return hide.changed
			? "You tug your clothes back into place, smoothing everything down like nothing happened."
			: "You sit up enough to adjust your outfit, playing it cool.";
	},

	end_close_watcher()
	{
		delete V.tanwitnessescalation;
	},

	pc_has_aftermath_mess(person)
	{
		if (!person) return false;
		if (person.cum_on_visible_skin_parts && person.cum_on_visible_skin_parts().length > 0)
			return true;
		const esc = this.get_close_escalation();
		return !!(esc && esc.pcOrgasmed);
	},

	can_aftermath_help_npc_finish(npc)
	{
		const esc = this.get_close_escalation();
		if (!esc || esc.npc !== npc) return false;
		const profile = this.profile_tan_witness(npc);
		return esc.selfTouches >= 2 || (profile.voyeur && profile.lust >= 320) || profile.lust >= 500;
	},

	npc_has_penis(npc)
	{
		if (!npc) return false;
		try
		{
			return new Person({ person: npc }).has_part("penis");
		}
		catch (e)
		{
			return false;
		}
	},

	can_aftermath_npc_cum_on(npc)
	{
		if (!this.npc_has_penis(npc)) return false;
		const { stance, profile } = this.close_npc_stance(npc);
		if (profile.shy && stance !== "lover") return false;
		return profile.boldness >= 2 && (profile.attracted || profile.groper || profile.dominant
			|| stance === "lover" || stance === "rival" || stance === "bully");
	},

	AFTERMATH_CUM_TARGET_META: {
		mouth: { loc: "mouth", memory: "came in pc mouth tanning" },
		face: { loc: "face", memory: "came on pc face tanning" },
		breasts_clothed: { loc: "breasts", memory: "came on pc breasts tanning" },
		breasts_bare: { loc: "breasts", memory: "came on pc bare breasts tanning", exposeBreasts: true },
		pussy_on: { loc: "crotch", memory: "came on pc pussy tanning" },
		pussy_in: { loc: "vagina", memory: "creampied pc tanning" },
		ass_on: { loc: "butt", memory: "came on pc ass tanning" },
		ass_in: { loc: "anus", memory: "came in pc ass tanning" },
		bottoms_front: { loc: "crotch", memory: "came on pc bottoms front tanning" },
		bottoms_back: { loc: "butt", memory: "came on pc bottoms back tanning" },
	},

	_find_breast_expose_action(person, pose)
	{
		if (!person || !pose) return null;
		const actions = this.get_tan_menu_actions(person, pose);
		return actions.find(a =>
			a.kind === "displace"
			&& a.exposure_dir === "more"
			&& (a.uncover || []).some(p => ["breasts", "nipples"].includes(p)),
		) || null;
	},

	_can_expose_breasts_for_cum(person)
	{
		if (!person) return false;
		if (!person.has_breasts || !person.has_breasts()) return false;
		if (!person.is_part_covered("breasts")) return true;
		return !!this._find_breast_expose_action(person, V.tanpose);
	},

	_expose_breasts_for_cum(person, npc)
	{
		if (!person || person.is_part_covered("breasts") === false)
			return "";
		const who = this.witness_name_link(npc, false);
		const action = this._find_breast_expose_action(person, V.tanpose);
		if (action)
		{
			this.apply_tan_displacement(person, action);
			return "You tug your " + action.clothingLabel + " aside, baring your breasts where " + who + " can mark them. ";
		}
		const EA = setup.ExhibitionAdjustment;
		if (EA)
		{
			for (const cItem of person.get_clothingItems_classes())
			{
				const adjs = EA.available_for_item(person, cItem);
				for (const adj of adjs)
				{
					const covers = adj.info?.covers || [];
					if (covers.includes("breasts") && EA.can_adjust(person, cItem, adj.type, 1))
					{
						EA.adjust(person, cItem, adj.type, 1);
						this.maybe_invalidate_paperdoll(person);
						return "You adjust your " + setup.capitalize_each(cItem.get_name(true))
							+ ", pulling enough aside to bare your breasts for " + who + ". ";
					}
				}
			}
		}
		this.maybe_invalidate_paperdoll(person);
		return "You peel fabric aside until your breasts are bare for " + who + ". ";
	},

	_apply_cum_sex_stat(person, loc)
	{
		if (!person?.is_pc || typeof setup.add_to_sex_stats !== "function") return;
		switch (loc)
		{
			case "mouth":
				setup.add_to_sex_stats("oral creampie");
				break;
			case "vagina":
				setup.add_to_sex_stats("creampie");
				if (setup.count_sex_stat("creampie") >= 25)
					setup.inclinations.unlock_with_req("Risktaker");
				break;
			case "anus":
				setup.add_to_sex_stats("anal creampie");
				break;
			case "face":
				setup.add_to_sex_stats("facial");
				break;
			case "breasts":
				setup.add_to_sex_stats("cum on tits");
				break;
			case "crotch":
				setup.add_to_sex_stats(person.has_part("vagina") ? "cum on pussy" : "cum on cock");
				break;
			case "butt":
				setup.add_to_sex_stats("cum on ass");
				break;
			default:
				setup.add_to_sex_stats("cum on body");
				break;
		}
	},

	_apply_npc_cum_on_pc(person, npc, loc = "stomach")
	{
		const internal = ["mouth", "vagina", "anus"];
		if (!person.cum_covering) person.cum_covering = {};
		if (!person.cum_covering[loc])
			person.cum_covering[loc] = [npc];
		else if (Array.isArray(person.cum_covering[loc]))
		{
			if (!person.cum_covering[loc].includes(npc))
				person.cum_covering[loc].push(npc);
		}
		else
			person.cum_covering[loc] = [npc];

		if (person.is_pc)
		{
			if (typeof setup.Needs?.dirty === "function")
				setup.Needs.dirty(50);
			this._apply_cum_sex_stat(person, loc);

			if (!internal.includes(loc))
			{
				const clothing = person.outermost_covering(loc);
				const nocumcategories = ["accessories", "hats", "bags", "shoes"];
				if (clothing)
				{
					const arch = person.clothing_archetype(clothing);
					if (arch && !nocumcategories.includes(arch.category))
						person.add_stain(clothing, "cum");
				}
			}

			if (loc === "vagina" && setup.Pregnancy)
			{
				const donor = new Person({ person: npc });
				setup.Pregnancy.register_creampie_given(donor, person);
				setup.Pregnancy.register_creampie_taken(person, donor);
				setup.Pregnancy.inseminated(donor, person);
			}

			delete person.cached_cum_covering_magnitude;
		}

		this.maybe_invalidate_paperdoll(person);
	},

	get_aftermath_cum_on_options(person, npc)
	{
		if (!person || !this.can_aftermath_npc_cum_on(npc)) return [];
		const opts = [];
		const add = (id, label) =>
		{
			const meta = this.AFTERMATH_CUM_TARGET_META[id];
			if (!meta) return;
			opts.push({ id, label, ...meta });
		};

		add("mouth", "Cum in your mouth");
		add("face", "Cum on your face");

		if (person.has_breasts && person.has_breasts())
		{
			if (person.is_part_covered("breasts"))
			{
				add("breasts_clothed", "Cum on your breasts (over clothes)");
				if (this._can_expose_breasts_for_cum(person))
					add("breasts_bare", "Pull top aside — cum on bare breasts");
			}
			else
				add("breasts_bare", "Cum on your bare breasts");
		}

		if (person.has_part("vagina"))
		{
			add("pussy_on", "Cum on your pussy");
			add("pussy_in", "Cum inside your pussy");
		}

		add("ass_on", "Cum on your ass");
		add("ass_in", "Cum inside your ass");

		if (person.outermost_covering("crotch"))
			add("bottoms_front", "Cum on the front of your bottoms");
		if (person.outermost_covering("butt") || (person.wearing_pants && person.wearing_pants()))
			add("bottoms_back", "Cum on the back of your bottoms");

		return opts;
	},

	_cum_on_target_narration(npc, opt)
	{
		const who = this.witness_name_link(npc, false);
		const pr = setup.people.pronouns(npc);
		const stance = this.close_npc_stance(npc).stance;
		const lines = {
			mouth: setup.capitalize(pr.ps) + " grips your chin and finishes in your mouth, leaving you swallowing or dripping in full view of the mall.",
			face: setup.capitalize(pr.ps) + " paints your face, stripe after hot stripe, without a shred of modesty.",
			breasts_clothed: setup.capitalize(pr.ps) + " splashes your chest — thick streaks soaking into the fabric where everyone can see.",
			breasts_bare: "\"Right there,\" " + who + " groans, spilling over your bare breasts.",
			pussy_on: setup.capitalize(pr.ps) + " aims between your legs and coats your pussy with cum.",
			pussy_in: setup.capitalize(pr.ps) + " pushes inside at the last second and fills you, deep and reckless.",
			ass_on: setup.capitalize(pr.ps) + " stripes your ass, leaving a shameless mess on your skin.",
			ass_in: setup.capitalize(pr.ps) + " buries " + pr.pp + " finish inside you before pulling back, breath ragged.",
			bottoms_front: setup.capitalize(pr.ps) + " hoses the front of your bottoms, a wet stain spreading where anyone walking by will notice.",
			bottoms_back: setup.capitalize(pr.ps) + " finishes across the seat of your bottoms, a patch you can't pretend isn't there.",
		};
		if (stance === "bully" && opt.id === "face")
			return "\"Wear it,\" " + who + " grunts, glazing your face.";
		if (stance === "bully" && opt.id === "pussy_in")
			return "\"Mine,\" " + who + " grunts, pumping a load inside you before pulling away.";
		return lines[opt.id] || setup.capitalize(pr.ps) + " groans and spills over you, marking your skin in front of God and the mall.";
	},

	_clear_visible_pc_mess(person)
	{
		if (!person || !person.cum_covering) return;
		const parts = person.cum_on_visible_skin_parts ? person.cum_on_visible_skin_parts() : [];
		for (const part of parts)
			delete person.cum_covering[part];
	},

	_aftermath_npc_reply(npc, kind)
	{
		const { stance, profile } = this.close_npc_stance(npc);
		const pr = setup.people.pronouns(npc);
		const who = this.witness_name_link(npc, false);
		const pools = {
			ask_liked: {
				lover: "\"Are you kidding? That was the hottest thing I've ever seen at this mall.\"",
				friend: "\"Yeah... I liked it. A lot.\"",
				attracted: "\"Yeah. I really, really did.\"",
				voyeur: "\"Liked it? I loved it. Don't pretend you didn't know that.\"",
				shy: setup.capitalize(pr.ps) + " blushes furiously. \"I... yeah. I did.\"",
				bully: "\"Heh. You've got some nerve asking. But yeah — I liked it.\"",
				enemy: "\"Don't fish for compliments. ...But I didn't hate the view.\"",
				rival: "\"You put on quite a show. Happy now?\"",
				stranger: "\"Can't say I minded. That was something.\"",
			},
			thank: {
				lover: setup.capitalize(pr.ps) + " smiles, dazed. \"Anytime. Seriously.\"",
				shy: setup.capitalize(pr.ps) + " nods quickly, still flustered. \"You're... welcome.\"",
				bully: "\"Yeah, yeah. Don't make it weird.\"",
				enemy: setup.capitalize(pr.ps) + " scoffs, but doesn't leave until you're covered up.",
				stranger: setup.capitalize(pr.ps) + " mutters something that might have been 'sure.'",
			},
			abrupt: {
				lover: setup.capitalize(pr.ps) + " looks disappointed as you gather your things. \"Already?\"",
				shy: setup.capitalize(pr.ps) + " blinks, left standing there awkwardly.",
				bully: "\"Running away already? Typical.\"",
				enemy: setup.capitalize(pr.ps) + " watches you go with a smirk.",
				stranger: who + " watches you leave without a word.",
			},
			shoo: {
				lover: setup.capitalize(pr.ps) + " sighs, amused. \"Fine — but you owe me another show sometime.\"",
				voyeur: "\"Greedy,\" " + who + " murmurs, but backs off to keep watching from farther away.",
				bully: "\"Whatever. Enjoy your audience.\"",
				stranger: setup.capitalize(pr.ps) + " shrugs and drifts back into the crowd.",
			},
		};
		const set = pools[kind] || {};
		return set[stance] || set.stranger || set.attracted || "";
	},

	apply_aftermath_ask_liked(person, npc)
	{
		const pcLine = "\"Did you like watching me?\" you ask, still breathless on your towel.";
		const npcLine = this._aftermath_npc_reply(npc, "ask_liked");
		setup.people.alter_attitude(npc, "lust", setup.rir(8, 18));
		this.register_close_aftermath_memory(npc, "pc asked liked watching");
		const arousal = this.tan_gain_arousal(setup.rir(8, 18));
		return this._close_result(pcLine + " " + npcLine, { arousal });
	},

	apply_aftermath_ask_again(person, npc)
	{
		const who = this.witness_name_link(npc, false);
		const pcLine = "\"Want to do that again sometime?\" you murmur, still glowing from the aftershocks.";
		const npcLine = "\"Try and stop me,\" " + who + " says, voice rough with want.";
		setup.people.alter_attitude(npc, "lust", setup.rir(12, 22));
		this.register_close_aftermath_memory(npc, "pc asked repeat tanning show");
		return this._close_result(pcLine + " " + npcLine, { arousal: this.tan_gain_arousal(setup.rir(10, 20)) });
	},

	apply_aftermath_ask_tell_anyone(person, npc)
	{
		const { stance } = this.close_npc_stance(npc);
		const who = this.witness_name_link(npc, false);
		const pr = setup.people.pronouns(npc);
		const pcLine = "You fix " + who + " with a challenging look. \"Going to tell anyone about this?\"";
		let npcLine = "";
		if (stance === "bully" || stance === "enemy")
			npcLine = setup.capitalize(pr.ps) + " smirks. \"That depends on how you behave.\"";
		else if (stance === "rival")
			npcLine = "\"Maybe. Maybe I'll just let you wonder.\"";
		else
			npcLine = setup.capitalize(pr.ps) + " shrugs. \"Not if you don't give me a reason to.\"";
		this.register_close_aftermath_memory(npc, "pc asked keep tanning secret");
		return this._close_result(pcLine + " " + npcLine, {});
	},

	apply_aftermath_thank_leave(person, npc)
	{
		const who = this.witness_name_link(npc, false);
		const fixMsg = this.fix_tan_outfit(person);
		const pcLine = "\"Thank you for watching,\" you tell " + who + " softly, already reaching for your clothes.";
		const npcLine = this._aftermath_npc_reply(npc, "thank");
		setup.people.alter_attitude(npc, "lust", setup.rir(5, 12));
		if (this.is_familiar_npc(npc))
			setup.people.alter_attitude(npc, "friendship", setup.rir(5, 12));
		this.register_close_aftermath_memory(npc, "pc thanked after tanning show");
		this.end_close_watcher();
		return this._close_result(pcLine + " " + fixMsg + " " + npcLine, {});
	},

	apply_aftermath_abrupt_leave(person, npc)
	{
		const who = this.witness_name_link(npc, false);
		const fixMsg = this.fix_tan_outfit(person);
		const pcLine = "\"Okay — I have to go,\" you say, already fixing yourself and not waiting for a reply.";
		const npcLine = this._aftermath_npc_reply(npc, "abrupt");
		this.register_close_aftermath_memory(npc, "pc left after tanning show");
		this.end_close_watcher();
		return this._close_result(pcLine + " " + fixMsg + " " + npcLine, { humiliation: setup.rir(8, 15) });
	},

	apply_aftermath_silent_leave(person, npc)
	{
		const who = this.witness_name_link(npc, false);
		const fixMsg = this.fix_tan_outfit(person);
		setup.people.alter_attitude(npc, "lust", setup.rir(3, 10));
		this.register_close_aftermath_memory(npc, "pc used witness tanning");
		this.end_close_watcher();
		return this._close_result(
			"You fix your clothes without a word, treating " + who + " like a prop you don't need anymore. " + fixMsg,
			{ humiliation: setup.rir(10, 20) },
		);
	},

	apply_aftermath_offer_hand_clean(person, npc)
	{
		const who = this.witness_name_link(npc, false);
		const pr = setup.people.pronouns(npc);
		const { stance } = this.close_npc_stance(npc);
		let npcLine = "";
		if (stance === "shy" || stance === "enemy")
			npcLine = setup.capitalize(pr.ps) + " hesitates, then awkwardly wipes your fingers with a napkin " + pr.ps + " had.";
		else if (stance === "bully" || stance === "rival")
			npcLine = "\"You're unbelievable,\" " + who + " mutters — but cleans your hand anyway.";
		else
			npcLine = setup.capitalize(pr.ps) + " takes your hand and carefully wipes you clean, eyes locked on yours.";
		this._clear_visible_pc_mess(person);
		setup.people.alter_attitude(npc, "lust", setup.rir(15, 28));
		this.register_close_aftermath_memory(npc, "wiped pc after tanning");
		const arousal = this.tan_gain_arousal(setup.rir(12, 22));
		return this._close_result(
			"You hold your hand out to " + who + ", letting " + pr.po + " see exactly what you made. " + npcLine,
			{ arousal },
		);
	},

	apply_aftermath_lick_clean(person, npc)
	{
		const who = this.witness_name_link(npc, false);
		const pr = setup.people.pronouns(npc);
		const { stance, profile } = this.close_npc_stance(npc);
		let npcLine = "";
		if (stance === "shy")
			npcLine = setup.capitalize(pr.ps) + " freezes, then leans in with a mortified little lick before jerking back.";
		else if (stance === "enemy" || stance === "bully")
			npcLine = "\"You are out of your mind,\" " + who + " growls — then does it anyway.";
		else if (profile.voyeur || stance === "lover")
			npcLine = setup.capitalize(pr.ps) + " doesn't need to be asked twice — " + pr.ps + " licks you clean with hungry focus.";
		else
			npcLine = setup.capitalize(pr.ps) + " kneels close and licks the mess away, breath hot on your skin.";
		this._clear_visible_pc_mess(person);
		setup.people.alter_attitude(npc, "lust", setup.rir(25, 45));
		this.register_close_aftermath_memory(npc, "licked pc after tanning");
		const arousal = this.tan_gain_arousal(setup.rir(20, 38));
		const humiliation = setup.rir(15, 30);
		setup.Needs.gain_humiliation(humiliation);
		return this._close_result(
			"You beckon " + who + " closer and guide " + pr.po + " mouth where you need it. " + npcLine,
			{ arousal, humiliation },
		);
	},

	apply_aftermath_help_npc_finish(person, npc)
	{
		const who = this.witness_name_link(npc, false);
		const pr = setup.people.pronouns(npc);
		const { stance } = this.close_npc_stance(npc);
		let npcLine = "";
		if (stance === "lover")
			npcLine = setup.capitalize(pr.ps) + " comes with a broken moan, clutching your wrist like an anchor.";
		else if (stance === "shy")
			npcLine = setup.capitalize(pr.ps) + " stiffens, spills into " + pr.pp + " hand, and can't meet your eyes.";
		else
			npcLine = setup.capitalize(pr.ps) + " shudders through it right there beside your towel, unable to look away from you.";
		setup.people.alter_attitude(npc, "lust", setup.rir(35, 55));
		this.register_close_aftermath_memory(npc, "pc helped finish tanning");
		const arousal = this.tan_gain_arousal(setup.rir(18, 32));
		const attention = this.tan_gain_attention(setup.rir(15, 25));
		return this._close_result(
			"You reach over and help " + who + " finish what your show started — fingers sure, gaze unapologetic. " + npcLine,
			{ arousal, attention },
		);
	},

	apply_aftermath_let_npc_cum_on(person, npc, targetId = null)
	{
		const options = this.get_aftermath_cum_on_options(person, npc);
		const opt = options.find(o => o.id === targetId);
		if (!opt)
			return this._close_result("That doesn't work right now.", {});

		const who = this.witness_name_link(npc, false);
		let prefix = "";
		if (opt.exposeBreasts)
			prefix = this._expose_breasts_for_cum(person, npc);

		this._apply_npc_cum_on_pc(person, npc, opt.loc);
		setup.people.alter_attitude(npc, "lust", setup.rir(30, 50));
		this.register_close_aftermath_memory(npc, opt.memory);
		setup.record_sex_memory(npc, "orgasm given");
		const humiliation = setup.rir(25, 45);
		setup.Needs.gain_humiliation(humiliation);
		const arousal = this.tan_gain_arousal(setup.rir(15, 28));
		const npcLine = this._cum_on_target_narration(npc, opt);
		V.tancumonexpanded = false;
		return this._close_result(
			prefix + "You shift closer, making it obvious you want " + who + " to finish " + this._cum_target_phrase(opt) + ". " + npcLine,
			{ humiliation, arousal },
		);
	},

	_cum_target_phrase(opt)
	{
		const phrases = {
			mouth: "in your mouth",
			face: "on your face",
			breasts_clothed: "on your breasts",
			breasts_bare: "on your bare breasts",
			pussy_on: "on your pussy",
			pussy_in: "inside your pussy",
			ass_on: "on your ass",
			ass_in: "in your ass",
			bottoms_front: "on the front of your bottoms",
			bottoms_back: "on the back of your bottoms",
		};
		return phrases[opt.id] || "on you";
	},

	// --- Towel crossover: controlled subs + close watchers ---
	CLOSE_CROSSOVER_TEASE_EXHIB: 7,
	CLOSE_CROSSOVER_TOUCH_EXHIB: 8,
	CLOSE_CROSSOVER_PLAY_EXHIB: 9,

	CROSSOVER_CUM_ON_SUB_META: {
		face: { loc: "face", memory: "came on sub face tanning", label: "Cum on <<po sub>> face" },
		chest: { loc: "breasts", memory: "came on sub chest tanning", label: "Cum on <<po sub>> chest" },
		stomach: { loc: "stomach", memory: "came on sub stomach tanning", label: "Cum on <<po sub>> stomach" },
		crotch: { loc: "crotch", memory: "came on sub crotch tanning", label: "Cum on <<po sub>> between the legs" },
		ass: { loc: "butt", memory: "came on sub ass tanning", label: "Cum on <<po sub>> ass" },
		pussy_in: { loc: "vagina", memory: "creampied sub tanning", label: "Cum inside <<po sub>> pussy", internal: true },
	},

	sub_breeding_kink_enabled()
	{
		return !!(V.kinkcontent && V.kinkcontent.includes("breeding"));
	},

	sub_has_breeding_kink(name)
	{
		if (!name) return false;
		return setup.people.has_any_inclination(name, "Breeding Kink")
			|| setup.people.has_any_inclination(name, "breedingkink");
	},

	sub_has_vagina(name)
	{
		if (!name) return false;
		if (setup.people.has_part && setup.people.has_part(name, "vagina")) return true;
		try
		{
			return new Person({ person: name }).has_part("vagina");
		}
		catch (e)
		{
			return false;
		}
	},

	sub_control_tier(name)
	{
		if (!name) return "none";
		const control = setup.people.get_attitude(name, "control");
		const rel = setup.Relationships.relationship_with(name);
		if (rel === "submissive") return "full";
		if (setup.Relationships.is_sub && setup.Relationships.is_sub(name)) return "full";
		if (control <= -600) return "full";
		if (control <= -400) return "deep";
		if (control <= -200) return "submid";
		return "light";
	},

	sub_internal_creampie_eligible(sub)
	{
		if (!sub || !this.sub_has_vagina(sub)) return false;
		const P = setup.Pregnancy;
		if (P && P.is_pregnant && P.is_pregnant(sub)) return false;
		return true;
	},

	evaluate_sub_internal_creampie(pc, sub, watcher)
	{
		if (!pc || !sub || !watcher)
			return { ok: false, stance: "refuse", refuseMsg: "" };
		if (!this.is_controlled_partner(pc, sub))
			return { ok: false, stance: "refuse", refuseMsg: "" };
		if (!this.sub_internal_creampie_eligible(sub))
			return { ok: false, stance: "refuse", refuseMsg: "" };
		if (!this.can_crossover_watcher_cum_on_sub(watcher, sub))
			return { ok: false, stance: "refuse", refuseMsg: "" };

		const tier = this.sub_control_tier(sub);
		const breedingKink = this.sub_has_breeding_kink(sub);
		const breedingOn = this.sub_breeding_kink_enabled();

		if (tier === "full")
			return { ok: true, stance: "forced", tier };
		if (tier === "deep")
			return { ok: true, stance: "obedient", tier };
		if (breedingKink && breedingOn)
			return { ok: true, stance: "eager", tier };

		if (pc.skillcheck("Dominance", setup.people.command_difficulty(sub) + 5))
			return { ok: true, stance: "reluctant", tier };

		const sWho = setup.people.firstname(sub) || sub;
		const sPr = setup.people.pronouns(sub);
		const pool = [
			sWho + " shakes " + sPr.pp + " head. \"Not inside — I could get pregnant.\"",
			"\"Please, not a creampie,\" " + sWho + " whispers, panic flashing across " + sPr.pp + " face.",
			sWho + " recoils. \"I'm not doing that here. That's too risky.\"",
		];
		return { ok: false, stance: "refuse", tier, refuseMsg: setup.randomchoice(pool) };
	},

	sub_internal_creampie_needs_domination(pc, sub)
	{
		if (!pc || !sub || !this.is_controlled_partner(pc, sub)) return false;
		const tier = this.sub_control_tier(sub);
		if (tier === "full" || tier === "deep") return false;
		if (this.sub_has_breeding_kink(sub) && this.sub_breeding_kink_enabled()) return false;
		return true;
	},

	sub_internal_creampie_refuse_hint(pc, sub, watcher)
	{
		if (!this.sub_internal_creampie_eligible(sub)) return "";
		if (!this.can_crossover_watcher_cum_on_sub(watcher, sub)) return "";
		if (!this.sub_internal_creampie_needs_domination(pc, sub)) return "";
		const sWho = setup.people.firstname(sub) || sub;
		return sWho + " won't take a creampie here without firmer dominance — too worried about getting pregnant.";
	},

	_crossover_sub_creampie_reaction(sub, stance)
	{
		const sWho = setup.people.firstname(sub) || sub;
		const sPr = setup.people.pronouns(sub);
		if (stance === "eager")
		{
			const pool = [
				sWho + " spreads " + sPr.pp + " thighs without being told, breath hitching. \"Fill " + sPr.po + "... please.\"",
				"\"Breed " + sPr.po + ",\" " + sWho + " breathes, shameless and wanting it.",
				sWho + " arches into it, moaning like getting filled is exactly what " + sPr.ps + " hoped for.",
			];
			return setup.randomchoice(pool);
		}
		if (stance === "forced" || stance === "obedient")
		{
			const pool = [
				sWho + " goes still and takes it — eyes wet, but " + sPr.ps + " doesn't disobey you.",
				"\"Yes,\" " + sWho + " whispers, voice small. " + setup.capitalize(sPr.ps) + " opens for it because you said so.",
				sWho + " swallows a whimper and holds still, letting it happen on your order.",
			];
			return setup.randomchoice(pool);
		}
		if (stance === "reluctant")
		{
			const pool = [
				sWho + " hesitates, then parts " + sPr.pp + " legs with a shaky breath. \"...Fine. But only because you said.\"",
				"\"I don't like this,\" " + sWho + " murmurs — but " + sPr.ps + " stays put and lets it happen.",
				sWho + " flushes, miserable and aroused, as " + sPr.ps + " takes the load you arranged.",
			];
			return setup.randomchoice(pool);
		}
		return "";
	},

	_apply_sub_internal_creampie_pregnancy(subPerson, watcherName, subName)
	{
		const P = setup.Pregnancy;
		if (!P || !subPerson || !watcherName || !this.sub_breeding_kink_enabled()) return false;
		if (!P.can_get_pregnant || !P.can_get_someone_pregnant) return false;
		let donor;
		try
		{
			donor = new Person({ person: watcherName });
		}
		catch (e)
		{
			return false;
		}
		if (!P.can_get_pregnant(subPerson) || !P.can_get_someone_pregnant(donor)) return false;
		P.register_creampie_given(donor, subPerson);
		P.register_creampie_taken(subPerson, donor);
		P.inseminated(donor, subPerson);
		return true;
	},

	CROSSOVER_JERK_ONTO_PC_META: {
		chest: { loc: "breasts", memory: "sub jerked watcher onto pc chest tanning", label: "Onto your chest" },
		face: { loc: "face", memory: "sub jerked watcher onto pc face tanning", label: "Onto your face" },
		stomach: { loc: "stomach", memory: "sub jerked watcher onto pc stomach tanning", label: "Onto your stomach" },
		crotch: { loc: "crotch", memory: "sub jerked watcher onto pc crotch tanning", label: "Onto your lap" },
		pussy_on: { loc: "crotch", memory: "sub jerked watcher onto pc pussy tanning", label: "Onto your pussy" },
		pussy_in: { loc: "vagina", memory: "sub jerked watcher creampie pc tanning", label: "Inside your pussy", internal: true },
	},

	get_tan_crossover_subs(pc, watcher)
	{
		const subs = this.get_controlled_tan_partners();
		if (!subs.length) return [];
		const w = watcher || (this.get_close_escalation() || {}).npc;
		return subs.filter(n => n && n !== w);
	},

	can_tan_crossover(pc, watcher)
	{
		pc = pc || (setup.pc && setup.pc());
		if (!pc || !this.has_valid_close_escalation()) return false;
		return this.get_tan_crossover_subs(pc, watcher).length > 0;
	},

	can_order_partner_crossover(pc, partner, exhibReq)
	{
		if (!pc || !partner) return false;
		return this.can_order_partner_action(pc, partner, { exhib_req: exhibReq || 0 });
	},

	can_crossover_watcher_heated(watcher)
	{
		const esc = this.get_close_escalation();
		if (!esc || esc.npc !== watcher) return false;
		const profile = this.profile_tan_witness(watcher);
		if (esc.finished) return this.can_aftermath_help_npc_finish(watcher);
		return (esc.selfTouches || 0) >= 2
			|| (esc.talked || 0) >= 2
			|| (esc.crossoverStrokes || 0) >= 1
			|| profile.lust >= 350
			|| (profile.voyeur && profile.lust >= 280);
	},

	can_crossover_watcher_jerk(watcher)
	{
		return this.npc_has_penis(watcher) && this.can_crossover_watcher_heated(watcher);
	},

	can_crossover_watcher_cum_on_sub(watcher, sub)
	{
		if (!this.can_crossover_watcher_jerk(watcher) || !sub) return false;
		const { profile } = this.close_npc_stance(watcher);
		if (profile.shy && !setup.people.is_romantic_partner(watcher)) return false;
		return profile.boldness >= 2 || profile.dominant || profile.groper || profile.lust >= 420;
	},

	_load_partner_cum(name, person)
	{
		if (!name || !person || !V.tanpartnercum) return;
		const key = setup.people.get_name(name);
		if (V.tanpartnercum[key])
			person.cum_covering = clone(V.tanpartnercum[key]);
	},

	_persist_partner_cum(name, person)
	{
		if (!name || !person || !person.cum_covering) return;
		if (!V.tanpartnercum) V.tanpartnercum = {};
		V.tanpartnercum[setup.people.get_name(name)] = clone(person.cum_covering);
	},

	_apply_npc_cum_on_person(person, donor, loc, persistName = null)
	{
		if (!person || !donor || !loc) return;
		if (person.is_pc)
		{
			this._apply_npc_cum_on_pc(person, donor, loc);
			return;
		}
		if (!person.cum_covering) person.cum_covering = {};
		if (!person.cum_covering[loc])
			person.cum_covering[loc] = [donor];
		else if (Array.isArray(person.cum_covering[loc]))
		{
			if (!person.cum_covering[loc].includes(donor))
				person.cum_covering[loc].push(donor);
		}
		else
			person.cum_covering[loc] = [donor];

		const clothing = person.outermost_covering && person.outermost_covering(loc);
		const nocumcategories = ["accessories", "hats", "bags", "shoes"];
		if (clothing)
		{
			const arch = person.clothing_archetype(clothing);
			if (arch && !nocumcategories.includes(arch.category) && person.add_stain)
				person.add_stain(clothing, "cum");
		}
		if (loc === "vagina")
			this._apply_sub_internal_creampie_pregnancy(person, donor, persistName);

		if (persistName)
		{
			this.persist_partner_clothes(persistName, person);
			this._persist_partner_cum(persistName, person);
		}
		this.maybe_invalidate_paperdoll(person);
	},

	_crossover_witness_react(watcher, sub, intensity = 1)
	{
		const profile = this.profile_tan_witness(watcher);
		const gain = setup.rir(12 + intensity * 8, 22 + intensity * 12);
		setup.people.alter_attitude(watcher, "lust", gain);
		if (sub)
			setup.people.alter_attitude(sub, "control", setup.rir(-6 - intensity * 2, -12 - intensity * 3));
		const esc = this.get_close_escalation();
		if (esc && esc.npc === watcher)
			esc.crossoverStrokes = (esc.crossoverStrokes || 0) + intensity;
		if (profile.voyeur || profile.attracted)
			return this.witness_name_link(watcher, true) + " watches the three of you with hungry focus.";
		return setup.capitalize(setup.people.pronouns(watcher).ps) + " can't look away from what you're orchestrating.";
	},

	_crossover_partner_tease_narration(watcher, partner, kind)
	{
		const wWho = this.witness_name_link(watcher, false);
		const sWho = setup.people.firstname(partner) || partner;
		const sPr = setup.people.pronouns(partner);
		if (kind === "trace")
			return "You murmur an order and " + sWho + " drags " + sPr.pp + " fingers over " + sPr.pp + " skin, putting on a show for " + wWho + ".";
		if (kind === "chest")
			return "At your word, " + sWho + " kneads " + sPr.pp + " chest where " + wWho + " has a perfect view.";
		if (kind === "hips")
			return sWho + " arches and rolls " + sPr.pp + " hips on your towel, presenting " + sPr.po + "self for " + wWho + "'s benefit.";
		return sWho + " teases " + sPr.po + "self shamelessly while " + wWho + " watches.";
	},

	_crossover_partner_touch_narration(watcher, partner, kind)
	{
		const wWho = this.witness_name_link(watcher, false);
		const sWho = setup.people.firstname(partner) || partner;
		const sPr = setup.people.pronouns(partner);
		const person = this.get_partner_person(partner);
		const bare = person && this.crotch_genitals_visible(person);
		if (kind === "thigh")
			return "You tell " + sWho + " to touch " + sPr.po + "self. " + setup.capitalize(sPr.ps) + " slides a hand along " + sPr.pp + " inner thigh, eyes flicking to " + wWho + ".";
		if (kind === "crotch")
			return sWho + " rubs " + sPr.po + "self through " + sPr.pp + " clothes with obedient pressure, making sure " + wWho + " notices.";
		if (kind === "play")
		{
			if (bare && person.has_part("vagina"))
				return "You nod and " + sWho + " hooks fingers under what's left of " + sPr.pp + " coverage, rubbing " + sPr.pp + " bare pussy where " + wWho + " can see every stroke.";
			if (bare && person.has_part("penis"))
				return sWho + " wraps " + sPr.pp + " hand around " + sPr.pp + " bare cock and strokes openly for " + wWho + "'s benefit.";
			return sWho + " stops pretending this is innocent and touches " + sPr.po + "self openly — exactly what you ordered, with " + wWho + " drinking it in.";
		}
		return sWho + " touches " + sPr.po + "self on your command while " + wWho + " watches.";
	},

	apply_crossover_order_partner_exposure(pc, watcher, partner, action)
	{
		if (!pc || !watcher || !partner || !action) return { ok: false, msg: "" };
		const result = this.apply_partner_tan_action(pc, partner, action, "tanning");
		if (!result.ok) return result;
		const wReact = setup.Tanning._crossover_witness_react(watcher, partner, action.exposure_dir === "more" ? 2 : 1);
		const tags = action.visible_tags || [];
		if (tags.length)
			this.register_tan_witness_memory(pc, watcher, tags, this.WITNESS_TIER.stare);
		return { ok: true, msg: result.msg + " " + wReact };
	},

	apply_crossover_order_partner_tease(pc, watcher, partner, kind)
	{
		if (!this.can_order_partner_crossover(pc, partner, this.CLOSE_CROSSOVER_TEASE_EXHIB))
			return this._close_result(this._partner_refuse_line(partner), {});
		const msg = this._crossover_partner_tease_narration(watcher, partner, kind);
		const wReact = setup.Tanning._crossover_witness_react(watcher, partner, 2);
		this.register_tan_witness_memory(pc, watcher, this.current_visible_exposure(this.get_partner_person(partner)), this.WITNESS_TIER.stare);
		setup.people.alter_attitude(partner, "lust", setup.rir(10, 20));
		return this._close_result(msg + " " + wReact, {
			arousal: this.tan_gain_arousal(setup.rir(20, 38)),
			attention: this.tan_gain_attention(setup.rir(14, 24)),
		});
	},

	apply_crossover_order_partner_touch(pc, watcher, partner, kind)
	{
		const req = kind === "play" ? this.CLOSE_CROSSOVER_PLAY_EXHIB : this.CLOSE_CROSSOVER_TOUCH_EXHIB;
		if (!this.can_order_partner_crossover(pc, partner, req))
			return this._close_result(this._partner_refuse_line(partner), {});
		const msg = this._crossover_partner_touch_narration(watcher, partner, kind);
		const wReact = setup.Tanning._crossover_witness_react(watcher, partner, kind === "play" ? 3 : 2);
		const tier = kind === "play" ? this.WITNESS_TIER.voyeur : this.WITNESS_TIER.stare;
		this.register_tan_witness_memory(pc, watcher, this.current_visible_exposure(this.get_partner_person(partner)), tier);
		setup.people.alter_attitude(partner, "lust", setup.rir(kind === "play" ? 18 : 12, kind === "play" ? 30 : 22));
		setup.people.alter_attitude(partner, "control", setup.rir(-4, -10));
		const arousalRoll = kind === "play" ? [35, 60] : [22, 40];
		return this._close_result(msg + " " + wReact, {
			arousal: this.tan_gain_arousal(setup.rir(arousalRoll[0], arousalRoll[1])),
			attention: this.tan_gain_attention(setup.rir(18, 32)),
			humiliation: kind === "play" ? setup.rir(8, 18) : 0,
		});
	},

	apply_crossover_sub_stroke_watcher(pc, watcher, sub)
	{
		if (!this.can_crossover_watcher_jerk(watcher))
			return this._close_result("Nobody's worked up enough for that yet.", {});
		if (!this.is_controlled_partner(pc, sub))
			return this._close_result(this._partner_refuse_line(sub), {});
		const sWho = setup.people.firstname(sub) || sub;
		const wWho = this.witness_name_link(watcher, false);
		const sPr = setup.people.pronouns(sub);
		const wPr = setup.people.pronouns(watcher);
		const msg = "You nod toward " + wWho + ". " + sWho + " swallows and wraps " + sPr.pp
			+ " hand around " + wPr.pp + " cock, stroking slow while " + wWho
			+ " watches you watch them.";
		const wReact = setup.Tanning._crossover_witness_react(watcher, sub, 3);
		this.register_close_aftermath_memory(watcher, "sub stroked watcher tanning");
		setup.people.alter_attitude(sub, "control", setup.rir(-10, -18));
		return this._close_result(msg + " " + wReact, {
			arousal: this.tan_gain_arousal(setup.rir(35, 58)),
			attention: this.tan_gain_attention(setup.rir(22, 38)),
		});
	},

	get_crossover_cum_on_sub_options(watcher, sub)
	{
		if (!this.can_crossover_watcher_cum_on_sub(watcher, sub)) return [];
		const person = this.get_partner_person(sub);
		if (!person) return [];
		const sPr = setup.people.pronouns(sub);
		const opts = [];
		const add = (id) =>
		{
			const meta = this.CROSSOVER_CUM_ON_SUB_META[id];
			if (!meta) return;
			opts.push({
				id,
				label: meta.label.replace(/<<po sub>>/g, sPr.po),
				...meta,
			});
		};
		add("face");
		if (person.has_breasts && person.has_breasts()) add("chest");
		add("stomach");
		add("crotch");
		add("ass");
		const pc = setup.pc && setup.pc();
		if (pc && this.evaluate_sub_internal_creampie(pc, sub, watcher).ok)
			add("pussy_in");
		return opts;
	},

	_crossover_cum_on_sub_narration(watcher, sub, opt, stance)
	{
		const wWho = this.witness_name_link(watcher, false);
		const sWho = setup.people.firstname(sub) || sub;
		const wPr = setup.people.pronouns(watcher);
		const sPr = setup.people.pronouns(sub);
		const lines = {
			face: wWho + " grips " + sWho + "'s chin and finishes across " + sPr.pp + " face, stripe after hot stripe.",
			chest: wWho + " groans and splashes " + sPr.pp + " chest, leaving a shameless mess on your towel.",
			stomach: wWho + " hoses " + sPr.pp + " stomach, cum pooling in the sun.",
			crotch: wWho + " aims between " + sWho + "'s legs and coats " + sPr.pp + " crotch.",
			ass: wWho + " stripes " + sWho + "'s ass before " + sPr.ps + " can pretend " + sPr.ps + " didn't want it.",
			pussy_in: wWho + " pushes inside at the last second and fills " + sWho + " deep and reckless.",
		};
		let msg = lines[opt.id] || setup.capitalize(wPr.ps) + " spills over " + sWho + " right there on your towel.";
		if (opt.id === "pussy_in" && stance)
		{
			const react = this._crossover_sub_creampie_reaction(sub, stance);
			if (react) msg += " " + react;
		}
		return msg;
	},

	apply_crossover_watcher_cum_on_sub(pc, watcher, sub, targetId = "chest")
	{
		let creampieEval = null;
		if (targetId === "pussy_in")
		{
			creampieEval = this.evaluate_sub_internal_creampie(pc, sub, watcher);
			if (!creampieEval.ok)
				return this._close_result(creampieEval.refuseMsg || this._partner_refuse_line(sub), {});
		}
		const options = this.get_crossover_cum_on_sub_options(watcher, sub);
		const opt = options.find(o => o.id === targetId) || options[0];
		if (!opt)
			return this._close_result("That doesn't work right now.", {});
		const person = this.get_partner_person(sub);
		this._apply_npc_cum_on_person(person, watcher, opt.loc, sub);
		setup.people.alter_attitude(watcher, "lust", setup.rir(28, 45));
		const controlHit = opt.id === "pussy_in" ? setup.rir(-12, -22) : setup.rir(-8, -16);
		setup.people.alter_attitude(sub, "control", controlHit);
		setup.people.alter_attitude(sub, "lust", setup.rir(opt.id === "pussy_in" ? 14 : 10, opt.id === "pussy_in" ? 28 : 22));
		this.register_close_aftermath_memory(watcher, opt.memory);
		setup.record_sex_memory(watcher, "orgasm given");
		if (opt.id === "pussy_in")
			setup.record_sex_memory(sub, "creampied");
		const stance = creampieEval ? creampieEval.stance : null;
		const npcLine = this._crossover_cum_on_sub_narration(watcher, sub, opt, stance);
		const pcLine = opt.id === "pussy_in"
			? "You tell " + this.witness_name_link(watcher, false) + " to finish inside "
				+ (setup.people.firstname(sub) || sub) + "."
			: "You tell " + this.witness_name_link(watcher, false) + " where to finish on "
				+ (setup.people.firstname(sub) || sub) + ".";
		return this._close_result(pcLine + " " + npcLine, {
			arousal: this.tan_gain_arousal(setup.rir(opt.id === "pussy_in" ? 28 : 20, opt.id === "pussy_in" ? 48 : 38)),
			attention: this.tan_gain_attention(setup.rir(18, 30)),
			humiliation: setup.rir(opt.id === "pussy_in" ? 18 : 12, opt.id === "pussy_in" ? 35 : 25),
		});
	},

	can_crossover_pc_jerk_onto_sub(watcher, sub)
	{
		if (!this.can_crossover_watcher_jerk(watcher) || !sub) return false;
		const pc = setup.pc && setup.pc();
		if (!pc || !this.is_controlled_partner(pc, sub)) return false;
		return this.can_crossover_watcher_cum_on_sub(watcher, sub);
	},

	_crossover_pc_jerk_onto_sub_narration(watcher, sub, opt, stance)
	{
		const wWho = this.witness_name_link(watcher, false);
		const sWho = setup.people.firstname(sub) || sub;
		const wPr = setup.people.pronouns(watcher);
		const sPr = setup.people.pronouns(sub);
		const lines = {
			face: "You wrap your hand around " + wPr.pp + " cock and stroke " + wPr.po + " with deliberate rhythm, angling "
				+ wPr.pp + " finish across " + sWho + "'s face when " + wPr.ps + " can't hold back.",
			chest: "Your fingers work " + wWho + "'s cock until " + wPr.ps + " groans and splashes "
				+ sPr.pp + " chest — right where you aimed " + wPr.po + ".",
			stomach: "You jerk " + wWho + " off with unapologetic confidence, guiding " + wPr.pp + " cum onto "
				+ sWho + "'s stomach in hot stripes.",
			crotch: "You stroke " + wWho + "'s cock and aim the mess between " + sWho + "'s legs, coating "
				+ sPr.pp + " crotch where " + sPr.ps + " can't hide it.",
			ass: "You work " + wPr.po + " with your hand until " + wPr.ps + " spills over " + sWho + "'s ass, marking "
				+ sPr.po + " on your towel.",
			pussy_in: "You stroke " + wWho + "'s cock and angle " + wPr.pp + " tip to " + sWho + "'s opening, jerking "
				+ wPr.po + " through a deep, messy finish inside " + sPr.po + ".",
		};
		let msg = lines[opt.id] || "You stroke " + wWho + "'s cock yourself and make " + wPr.po + " finish on " + sWho + ".";
		if (opt.id === "pussy_in" && stance)
		{
			const react = this._crossover_sub_creampie_reaction(sub, stance);
			if (react) msg += " " + react;
		}
		return msg;
	},

	apply_crossover_pc_jerk_onto_sub(pc, watcher, sub, targetId = "chest")
	{
		if (!this.can_crossover_pc_jerk_onto_sub(watcher, sub))
			return this._close_result("That doesn't work right now.", {});
		let creampieEval = null;
		if (targetId === "pussy_in")
		{
			creampieEval = this.evaluate_sub_internal_creampie(pc, sub, watcher);
			if (!creampieEval.ok)
				return this._close_result(creampieEval.refuseMsg || this._partner_refuse_line(sub), {});
		}
		const options = this.get_crossover_cum_on_sub_options(watcher, sub);
		const opt = options.find(o => o.id === targetId) || options[0];
		if (!opt)
			return this._close_result("That doesn't work right now.", {});

		const person = this.get_partner_person(sub);
		this._apply_npc_cum_on_person(person, watcher, opt.loc, sub);
		const stance = creampieEval ? creampieEval.stance : null;
		const msg = "You lean over without getting up and take " + this.witness_name_link(watcher, false)
			+ "'s cock in hand, putting on a show for anyone still watching. "
			+ this._crossover_pc_jerk_onto_sub_narration(watcher, sub, opt, stance);
		setup.people.alter_attitude(watcher, "lust", setup.rir(32, 50));
		const controlHit = opt.id === "pussy_in" ? setup.rir(-14, -24) : setup.rir(-10, -18);
		setup.people.alter_attitude(sub, "control", controlHit);
		setup.people.alter_attitude(sub, "lust", setup.rir(opt.id === "pussy_in" ? 14 : 12, opt.id === "pussy_in" ? 30 : 24));
		this.register_close_aftermath_memory(watcher, opt.id === "pussy_in"
			? "pc jerked watcher creampie sub tanning"
			: "pc jerked watcher onto sub tanning");
		setup.record_sex_memory(watcher, "orgasm given");
		setup.record_sex_memory("PC", "handjob given");
		if (opt.id === "pussy_in")
			setup.record_sex_memory(sub, "creampied");
		const esc = this.get_close_escalation();
		if (esc && esc.npc === watcher)
			esc.crossoverStrokes = (esc.crossoverStrokes || 0) + 2;
		return this._close_result(msg, {
			arousal: this.tan_gain_arousal(setup.rir(28, 48)),
			attention: this.tan_gain_attention(setup.rir(24, 40)),
			humiliation: setup.rir(15, 30),
		});
	},

	get_crossover_jerk_onto_pc_options(watcher, sub)
	{
		if (!this.can_crossover_watcher_jerk(watcher) || !sub) return [];
		const pc = setup.pc && setup.pc();
		if (!pc || !this.is_controlled_partner(pc, sub)) return [];
		const opts = [];
		const add = (id) =>
		{
			const meta = this.CROSSOVER_JERK_ONTO_PC_META[id];
			if (!meta) return;
			opts.push({ id, label: meta.label, ...meta });
		};
		add("chest");
		add("face");
		add("stomach");
		add("crotch");
		if (pc.has_part("vagina"))
		{
			add("pussy_on");
			add("pussy_in");
		}
		return opts;
	},

	apply_crossover_sub_jerk_onto_pc(pc, watcher, sub, targetId = "chest")
	{
		if (!this.can_crossover_watcher_jerk(watcher))
			return this._close_result("Nobody's worked up enough for that yet.", {});
		if (!this.is_controlled_partner(pc, sub))
			return this._close_result(this._partner_refuse_line(sub), {});
		const options = this.get_crossover_jerk_onto_pc_options(watcher, sub);
		const opt = options.find(o => o.id === targetId) || options[0];
		if (!opt)
			return this._close_result("That doesn't work right now.", {});

		const sWho = setup.people.firstname(sub) || sub;
		const wWho = this.witness_name_link(watcher, false);
		const sPr = setup.people.pronouns(sub);
		const wPr = setup.people.pronouns(watcher);
		const phraseId = opt.id === "chest" ? "breasts_bare" : opt.id;
		const targetPhrase = this._cum_target_phrase({ id: phraseId });
		let prefix = "";
		if (opt.id === "chest" && pc.has_breasts && pc.has_breasts() && pc.is_part_covered("breasts"))
			prefix = this._expose_breasts_for_cum(pc, watcher);
		this._apply_npc_cum_on_pc(pc, watcher, opt.loc);
		let msg = "";
		if (opt.id === "pussy_in")
		{
			msg = "You murmur exactly how you want this to end. " + sWho + " wraps " + sPr.pp
				+ " hand around " + wWho + "'s cock and strokes " + wPr.po + " with obedient precision, angling "
				+ wPr.pp + " tip to your opening — pushing " + wPr.po + " inside at the last moment for a deep, reckless creampie on your towel.";
		}
		else
		{
			msg = "You order " + sWho + " to work " + wWho + "'s cock. "
				+ setup.capitalize(sPr.ps) + " obeys — stroking " + wPr.po + " until "
				+ wPr.ps + " groans and hoses cum " + targetPhrase + ", exactly where you wanted it.";
		}
		setup.people.alter_attitude(watcher, "lust", setup.rir(32, 50));
		setup.people.alter_attitude(sub, "control", setup.rir(opt.id === "pussy_in" ? -14 : -12, opt.id === "pussy_in" ? -22 : -20));
		this.register_close_aftermath_memory(watcher, opt.memory);
		setup.record_sex_memory(watcher, "orgasm given");
		if (opt.id === "pussy_in")
			setup.record_sex_memory("PC", "creampied");
		return this._close_result(prefix + msg, {
			arousal: this.tan_gain_arousal(setup.rir(opt.id === "pussy_in" ? 32 : 25, opt.id === "pussy_in" ? 52 : 42)),
			attention: this.tan_gain_attention(setup.rir(20, 35)),
			humiliation: setup.rir(opt.id === "pussy_in" ? 28 : 20, opt.id === "pussy_in" ? 45 : 38),
		});
	},

	apply_aftermath_shoo_nice(person, npc)
	{
		const who = this.witness_name_link(npc, false);
		const pr = setup.people.pronouns(npc);
		const pcLine = "\"That was fun,\" you say, lazy and satisfied. \"But I want to keep tanning — go on, let someone else get a turn.\"";
		const npcLine = this._aftermath_npc_reply(npc, "shoo");
		setup.people.alter_attitude(npc, "lust", setup.rir(5, 12));
		this.register_close_aftermath_memory(npc, "pc shooed after tanning");
		this.end_close_watcher();
		return this._close_result(pcLine + " " + npcLine, { attention: this.tan_gain_attention(setup.rir(5, 12)) });
	},

	apply_close_show_more(person, npc)
	{
		const esc = this.escalate_visible_exposure(person);
		const tags = this.current_visible_exposure(person);
		const pr = setup.people.pronouns(npc);

		setup.people.alter_attitude(npc, "lust", setup.rir(22, 38));
		this.register_tan_witness_memory(person, npc, tags, this.WITNESS_TIER.voyeur);
		const arousal = this.tan_gain_arousal(setup.rir(40, 65));
		const attention = this.tan_gain_attention(setup.rir(25, 40));

		const e = this.get_close_escalation();
		if (e && e.npc === npc) e.npcAsked = false;

		return this._close_result(
			esc.msg + " " + setup.capitalize(pr.ps) + " exhales sharply, clearly pleased you obliged.",
			{ arousal, attention },
		);
	},

	apply_close_tease_denial(person, npc)
	{
		const pr = setup.people.pronouns(npc);
		setup.people.alter_attitude(npc, "lust", setup.rir(8, 15));
		const arousal = this.tan_gain_arousal(setup.rir(20, 35));
		const e = this.get_close_escalation();
		if (e && e.npc === npc) e.npcAsked = false;
		return this._close_result(
			"You smile and adjust just enough to stay covered. " + setup.capitalize(pr.ps) + " groans quietly, still watching.",
			{ arousal },
		);
	},

	pick_tan_witness_flavor(witness, tier, tags, attScore, profile, person)
	{
		const T = this.WITNESS_TIER;
		const focus = this.witness_focus_phrase(tags, person);
		const pools = {
			[T.fleeting]: [
				"You think someone glanced your way, but it was gone before you could be sure.",
				"A flicker of movement in your peripheral vision — maybe just a bird, maybe not.",
				"For a second you feel watched, then the feeling passes.",
			],
			[T.glance]: [
				"%Witness% walks past and does a double-take at %focus%, then keeps moving like it was nothing.",
				"A passerby's eyes snag on %focus% for half a beat before they look away.",
				"You catch %witness% stealing a quick look, then pretending to check their phone.",
			],
			[T.look]: [
				"%Witness% definitely noticed %focus%. %Ps% doesn't look away as quickly as %ps% should.",
				"%Witness% slows a little, watching %focus% with open interest.",
				"You feel %witness%'s gaze settle on %focus% and stay there a moment too long.",
			],
			[T.linger]: [
				"%Witness% slows to a crawl, shamelessly taking in %focus% before drifting on.",
				"%Witness% stops pretending to be heading somewhere and just watches %focus% for a few seconds.",
				"A figure lingers at the edge of your vision, locked on %focus%.",
			],
			[T.stare]: [
				"%Witness% stops outright, staring at %focus% like %ps% forgot %ps% was in public.",
				"%Witness% plants %pp% feet and drinks in the view of %focus%, not even trying to hide it.",
				"You hear someone whistle softly. %Witness% is still staring at %focus%.",
			],
			[T.voyeur]: [
				"%Witness% finds a spot to hover nearby, eyes hungry on %focus%, drinking in every detail.",
				"%Witness% circles slowly like %ps%'s just people-watching — except %pp% eyes never leave %focus%.",
				"%Witness% watches %focus% with the focused hunger of someone who came here hoping to see exactly this.",
			],
			[T.touch_self]: [
				"%Witness% watches %focus%, one hand drifting to %pp% crotch, adjusting — or not really adjusting at all.",
				"From the corner of your eye, %witness% palms %pp%self through %pp% clothes while staring at %focus%.",
				"%Witness% bites %pp% lip, gaze fixed on %focus%, fingers rubbing a slow circle where anyone could notice.",
			],
			[T.approach]: [
				"%Witness% drifts closer, voice low: \"You, uh... need help with your sunscreen?\" %Ps%'s eyes are on %focus%, not your face.",
				"%Witness% stops beside your towel. \"Didn't think I'd get a show today.\" %Ps% doesn't leave.",
				"%Witness% crouches at the edge of your towel, grinning. \"Comfortable?\" %Ps%'s stare crawls over %focus%.",
			],
			[T.grope]: [
				"%Witness% crouches too close and suddenly %pp% hand is on your thigh, sliding toward %focus%. \"Relax,\" %ps% murmurs, like this is normal.",
				"Before you can sit up, %witness% brushes %pp% fingers over %focus% and grins. \"Just helping you adjust.\"",
				"%Witness% leans in under the pretense of whispering something, and %pp% hand gropes %focus% through your clothes.",
			],
		};

		let pool = pools[tier] || pools[T.glance];
		if (tier >= T.voyeur && profile.voyeur && pools[T.voyeur])
			pool = pools[tier].concat(pools[T.voyeur]);
		if (tier >= T.look && profile.attracted && !profile.shy)
		{
			pool = pool.concat([
				"%Witness% looks at %focus% like %ps% already knows %ps% wants you — and doesn't care if you notice.",
			]);
		}
		if (tier <= T.glance && attScore < 5)
		{
			pool = pool.concat([
				"Nobody seems to have paid much attention. You might've gotten away with it.",
			]);
		}

		const chosen = setup.randomchoice(pool);
		if (tier <= T.fleeting || !witness || chosen.indexOf("%Witness%") === -1 && chosen.indexOf("%witness%") === -1)
			return { plain: chosen };

		return {
			witness,
			template: chosen,
			focus,
			tier,
		};
	},

	pick_primary_tan_witness(attScore, tags)
	{
		const people = (V.peopleatlocation || []).filter(p => p && p !== "dummy");
		if (!people.length) return null;
		const scored = people.map(name => {
			const profile = this.profile_tan_witness(name);
			let score = profile.watchScore + State.random() * 2;
			if (tags.includes("camel_toe") && profile.voyeur) score += 1.5;
			if (tags.includes("nipple") && profile.attracted) score += 1;
			return { name, score, profile };
		});
		scored.sort((a, b) => b.score - a.score);
		return scored[0];
	},

	pick_tan_witnesses(maxCount = 4)
	{
		const people = (V.peopleatlocation || []).filter(p => p && p !== "dummy");
		if (!people.length) return [];
		const scored = people.map(name => {
			let score = State.random();
			const profile = this.profile_tan_witness(name);
			score += profile.watchScore;
			return { name, score };
		});
		scored.sort((a, b) => b.score - a.score);
		return scored.slice(0, maxCount).map(s => s.name);
	},

	apply_witness_lust(witness, tier, attScore, profile)
	{
		if (!witness || tier <= this.WITNESS_TIER.fleeting) return;
		let lustGain = Math.round(4 + attScore * 1.2 + tier * 2);
		if (profile.voyeur) lustGain = Math.round(lustGain * 1.35);
		if (profile.attracted) lustGain = Math.round(lustGain * 1.2);
		setup.people.alter_attitude(witness, "lust", lustGain);
		if (tier >= this.WITNESS_TIER.stare)
			setup.people.alter_rumor_strength(witness, "exhibitionism", Math.round(8 + attScore + tier * 2));
	},

	apply_witness_effects(person, action)
	{
		if (!person || !action || action.displacement === "fix")
			return { narration: "", witness: null, tier: 0, witnessNpc: null };

		const tags = (action.visible_tags || []).slice();
		if (action.kind === "legs" && action.spread)
			tags.push("camel_toe");
		if (!tags.length && action.kind !== "legs")
			return { narration: "", witness: null, tier: 0, witnessNpc: null };

		const attScore = this.attention_score_for_tags(tags);
		const crowd = (V.peopleatlocation || []).filter(p => p && p !== "dummy");
		const crowdFx = this.mall_crowd_modifiers(crowd.length);
		const primary = this.pick_primary_tan_witness(attScore, tags);
		const EA = setup.ExhibitionAdjustment;
		let arousal = 6;
		let attention = 4;
		let humiliation = 0;
		let witnessData = null;
		let witnessExtras = [];
		let tier = this.WITNESS_TIER.none;
		let witness = null;

		for (const tag of tags)
		{
			const def = this.EXPOSURE_TAG_WEIGHT[tag];
			if (def)
			{
				arousal += def.arousal;
				attention += def.att;
			}
		}

		if (primary)
		{
			witness = primary.name;
			const profile = primary.profile;

			if (this.roll_tan_notice(attScore, profile, crowd.length))
			{
				tier = this.roll_witness_tier(attScore, profile);
				if (tier > this.WITNESS_TIER.none)
				{
					witnessData = this.pick_tan_witness_flavor(witness, tier, tags, attScore, profile, person);
					witnessData = this.annotate_witness_choice(witnessData, tier, profile, tags);
					this.apply_witness_lust(witness, tier, attScore, profile);
					this.register_tan_witness_memory(person, witness, tags, tier);

					const tierAttn = [0, 2, 4, 7, 12, 18, 25, 35, 45, 60];
					attention += tierAttn[tier] || 0;
					arousal += Math.round((tierAttn[tier] || 0) * 0.6);

					if (tier >= this.WITNESS_TIER.grope)
					{
						humiliation += Math.round(40 + attScore * 4);
						arousal += 30;
						this.init_close_escalation(witness, tags, "grope");
					}
					else if (tier >= this.WITNESS_TIER.approach)
					{
						arousal += 18;
						this.init_close_escalation(witness, tags, "approach");
					}
					else if (tier >= this.WITNESS_TIER.touch_self)
					{
						arousal += 12;
					}

					const extras = this.pick_tan_witnesses(Math.min(4, 1 + Math.floor(attScore / 4) + crowdFx.extraWitnesses));
					for (const w of extras)
					{
						if (w === witness) continue;
						const ep = this.profile_tan_witness(w);
						if (ep.voyeur || ep.attracted)
							this.apply_witness_lust(w, Math.max(this.WITNESS_TIER.glance, tier - 2), attScore, ep);
					}
				}
			}
			else if (attScore >= 3 && State.random() < (crowdFx.paranoiaChance || 0.35))
			{
				witnessData = { plain: crowdFx.level === "empty"
					? "You briefly wonder if anyone even looked — the mall's quiet enough you might've been alone with your choices."
					: "You can't shake the feeling someone might have noticed — but if they did, they're playing it cool." };
			}
		}

		if (EA)
		{
			EA.begin_exposure_moment(person, {
				type: tier >= this.WITNESS_TIER.approach ? "deliberate" : "notice",
				tanning: true,
				plausible_deniability: tier < this.WITNESS_TIER.approach,
				extra_push: Math.min(3, Math.max(0, attScore * 0.25 + crowdFx.exposurePush)),
			});
			const ctx = V.exhibitionexposure_context || {};
			if (tier >= this.WITNESS_TIER.grope)
			{
				humiliation = Math.round(humiliation + attScore * 3);
			}
			else if (ctx.plausible_deniability && ctx.overreach <= 0)
			{
				humiliation = 0;
			}
			else if (ctx.overreach <= 0)
			{
				humiliation = Math.max(0, Math.round(attScore * 0.5 * Math.max(0, ctx.overreach + 1)));
			}
			else
			{
				humiliation = Math.round(attScore * 2 * ctx.overreach);
			}
			if (person.has_inclination("Lewd Exhibitionist") || person.has_inclination("Deliberate Exhibitionist"))
				humiliation = Math.round(humiliation * 0.35);
			const scaled = EA.scale_humiliation(person, humiliation, ctx);
			humiliation = scaled.humiliation;
			arousal += scaled.arousal;
			if (tier > this.WITNESS_TIER.none)
				EA.note_attention(person);
		}

		let arousalGain = 0;
		let attentionGain = 0;
		if (tier > this.WITNESS_TIER.none)
		{
			arousalGain = this.tan_gain_arousal(Math.round(arousal * crowdFx.attentionMult));
			attentionGain = this.tan_gain_attention(Math.round(attention * crowdFx.attentionMult));
		}
		else
		{
			arousalGain = this.tan_gain_arousal(Math.max(8, Math.round(arousal * 0.65)));
			if (attScore >= 2)
				attentionGain = this.tan_gain_attention(Math.round(attention * 0.4));
		}

		if (witnessData)
		{
			if (EA && V.exhibitionreaction === "thrill" && tier >= this.WITNESS_TIER.look)
				witnessData.suffix = "A warm thrill spreads through you — embarrassing, but safely within what you can handle.";
			else if (person.has_inclination("Lewd Exhibitionist") && tier >= this.WITNESS_TIER.linger)
				witnessData.suffix = "You feel yourself getting wetter from the attention, not from shame.";
		}

		if (humiliation > 0)
			setup.Needs.gain_humiliation(humiliation);
		else if (EA && tier < this.WITNESS_TIER.grope)
			EA.clear_exposure_moment();

		if (witnessData && attScore >= 2)
			witnessExtras = this.roll_passive_extra_witnesses(person, tags, attScore, witness, crowdFx);

		this.register_witness_notice_batch(witnessData, witnessExtras, tags);

		return {
			narration: this.displacement_narration(person, action),
			witness: witnessData,
			extras: witnessExtras,
			tier,
			witnessNpc: witness,
			arousalGain,
			attentionGain,
		};
	},

	apply_pass_time(person, minutes = 15)
	{
		const tags = this.current_visible_exposure(person);
		const attScore = this.attention_score_for_tags(tags);
		let passmsg = minutes >= 30
			? "You let the sun work while you zone out, keeping your pose exactly as-is."
			: "You close your eyes and soak up the warmth, unchanged on your towel.";
		let witness = null;
		let extras = [];
		let tier = this.WITNESS_TIER.none;
		let arousalGain = 0;
		let attentionGain = 0;

		if (attScore >= 1 && V.tanpose)
		{
			arousalGain = this.tan_gain_arousal(Math.round(6 + attScore * 2.5 + (minutes >= 30 ? 6 : 0)));
			if (this.has_valid_close_escalation())
				arousalGain += this.tan_gain_arousal(Math.round(8 + attScore * 2));
			if (attScore >= 2)
				attentionGain = this.tan_gain_attention(Math.round(attScore * 1.5));
		}

		if (attScore >= 2 && V.tanpose)
		{
			const crowd = (V.peopleatlocation || []).filter(p => p && p !== "dummy");
			const crowdFx = this.mall_crowd_modifiers(crowd.length);
			const primary = this.pick_primary_tan_witness(attScore, tags);
			if (primary && this.roll_tan_notice(attScore * 0.65, primary.profile, crowd.length))
			{
				tier = this.roll_witness_tier(attScore, primary.profile);
				if (crowdFx.level === "crowded")
					tier = Math.min(tier, this.WITNESS_TIER.stare);
				else if (crowdFx.level !== "empty")
					tier = Math.min(tier, this.WITNESS_TIER.linger);
				if (tier > this.WITNESS_TIER.none)
				{
					const profile = primary.profile;
					witness = this.pick_tan_witness_flavor(primary.name, tier, tags, attScore, profile, person);
					witness = this.annotate_witness_choice(witness, tier, profile, tags);
					this.apply_witness_lust(primary.name, tier, attScore, profile);
					this.register_tan_witness_memory(person, primary.name, tags, tier);

					const tierAttn = [0, 2, 4, 7, 12, 18, 25, 35, 45, 60];
					const attention = Math.round((tierAttn[tier] || 0) * 0.5 * crowdFx.attentionMult);
					const witnessArousal = Math.round(attention * 0.55);
					if (attention > 0)
					{
						arousalGain += this.tan_gain_arousal(witnessArousal);
						attentionGain += this.tan_gain_attention(attention);
					}
					extras = this.roll_passive_extra_witnesses(person, tags, attScore, primary.name, crowdFx);
					this.register_witness_notice_batch(witness, extras, tags);
				}
			}
			else if (attScore >= 4 && State.random() < (crowdFx.paranoiaChance || 0.25))
			{
				witness = { plain: "A shadow falls across your towel, then moves on — hard to tell if anyone really looked." };
			}
			else if (crowdFx.level === "crowded" && attScore >= 3)
			{
				extras = this.roll_passive_extra_witnesses(person, tags, attScore, null, crowdFx);
			}
		}

		const guestMsgs = this.run_exhib_guest_self_adjustments();
		if (guestMsgs.length)
			passmsg += " " + guestMsgs.join(" ");

		return { passmsg, witness, extras, tier, minutes, arousalGain, attentionGain };
	},

	quick_tan_invite(npc, mode)
	{
		mode = mode === "join" ? "join" : "watch";
		return this._resolve_tan_invite(npc, mode);
	},

	displacement_narration(person, action)
	{
		if (!action) return "";
		if (action.kind === "legs")
		{
			if (action.spread)
				return "You let your knees fall open while you stare at the sky, as if you didn't notice how much it shows.";
			return "You casually press your thighs together again, the picture of innocence.";
		}
		if (action.kind === "adjust" && setup.ExhibitionAdjustment)
			return this.adjustment_narration(person, action);
		if (action.displacement === "fix")
			return "You settle your " + person.clothing_archetype(action.clothing).shortname + " back into place, playing it off as a harmless wardrobe fix.";
		const cinfo = person.clothing_archetype(action.clothing);
		const tags = action.visible_tags || [];
		if (tags.includes("nipple"))
			return "You " + action.displacement + " your " + cinfo.shortname + ". Your nipples catch the sun — and more than one wandering eye.";
		if (tags.includes("camel_toe"))
			return "You shift your " + cinfo.shortname + " and the seam digs in shamelessly. The outline is unmistakable from this angle.";
		if (tags.includes("breasts"))
			return "You " + action.displacement + " your " + cinfo.shortname + ", baring more chest than a normal tanning session would dare.";
		if (tags.includes("crotch"))
			return "You " + action.displacement + " your " + cinfo.shortname + ". Anyone walking past gets an eyeful.";
		if (tags.includes("butt") || tags.includes("butt_crack") || tags.includes("underbutt"))
			return "You " + action.displacement + " your " + cinfo.shortname + ", giving the mall a generous view of your ass.";
		return "You casually " + action.displacement + " your " + cinfo.shortname + " while pretending to get comfortable.";
	},

	pose_narration(pose, person)
	{
		let text = "";
		if (pose === "back")
		{
			text = "You stretch out on your back, face tipped toward the sky.";
			if (V.tanlegspread) text += " Your legs are parted just enough to draw the wrong kind of attention.";
		}
		else if (pose === "stomach")
			text = "You settle onto your stomach, presenting your back and ass to the sun — and anyone walking behind you.";
		if (person)
		{
			const summary = this.format_pose_exposure_summary(person);
			if (summary) text += (text ? " " : "") + summary;
		}
		return text;
	},

	current_visible_exposure(person)
	{
		if (!person || !V.tanpose) return [];
		const pose = V.tanpose;
		const legSpread = !!V.tanlegspread;
		const tagSet = new Set(this.anatomy_to_exposure_tags([], person, pose, legSpread));
		for (let i = 0; i < person.clothes.length; i++)
		{
			const cItem = new ClothingItem(person.clothes[i]);
			const cinfo = person.clothing_archetype(person.clothes[i]);
			for (const disp of cItem.get_displacements())
			{
				const visible = this.filter_visible_uncover(cinfo["displace " + disp] || [], pose, legSpread);
				for (const tag of this.anatomy_to_exposure_tags(visible, person, pose, legSpread))
					tagSet.add(tag);
			}
		}
		for (const tag of this._active_adjustment_tags(person, pose, legSpread))
			tagSet.add(tag);
		for (const entry of this.pose_noticeable_parts(person, 3))
		{
			const tag = this._body_part_to_tag(entry.part);
			if (tag) tagSet.add(tag);
		}
		return [...tagSet];
	},

	attention_from_displacements(person)
	{
		return this.attention_score_for_tags(this.current_visible_exposure(person));
	},

	mall_crowd_count()
	{
		return (V.peopleatlocation || []).filter(p => p && p !== "dummy").length;
	},

	mall_crowd_level(count)
	{
		const n = count != null ? count : this.mall_crowd_count();
		if (n <= this.MALL_CROWD_EMPTY_MAX) return "empty";
		if (n < this.MALL_CROWD_CROWDED_MIN) return "normal";
		return "crowded";
	},

	mall_crowd_modifiers(count)
	{
		const n = count != null ? count : this.mall_crowd_count();
		const level = this.mall_crowd_level(n);
		if (level === "empty")
		{
			return {
				level, count: n,
				noticeMult: 0.42,
				passiveWeightMult: 0.65,
				activeWeightMult: 3.0,
				activeMaxCap: null,
				passiveMinFloor: null,
				attentionMult: 0.75,
				exposurePush: -0.4,
				extraWitnesses: 0,
				extraPassiveCount: 0,
				paranoiaChance: 0.15,
				ambientThreshold: 2,
			};
		}
		if (level === "crowded")
		{
			return {
				level, count: n,
				noticeMult: 1.55,
				passiveWeightMult: 1.85,
				activeWeightMult: 0.18,
				activeMaxCap: this.WITNESS_TIER.voyeur,
				passiveMinFloor: this.WITNESS_TIER.glance,
				attentionMult: 1.45,
				exposurePush: 1.1,
				extraWitnesses: 1,
				extraPassiveCount: 2,
				paranoiaChance: 0.45,
				ambientThreshold: -1,
			};
		}
		return {
			level, count: n,
			noticeMult: 1.0,
			passiveWeightMult: 1.0,
			activeWeightMult: 1.0,
			activeMaxCap: null,
			passiveMinFloor: null,
			attentionMult: 1.0,
			exposurePush: 0,
			extraWitnesses: 0,
			extraPassiveCount: 0,
			paranoiaChance: 0.30,
			ambientThreshold: 0,
		};
	},

	tan_crowd_narration()
	{
		const m = this.mall_crowd_modifiers();
		const site = this.get_tanning_site();
		if (site === "UniversityLakeBeach")
		{
			if (m.level === "empty")
				return "The beach is almost empty — fewer onlookers, but anyone bold enough might get personal with you.";
			if (m.level === "normal")
				return "A typical lake afternoon — a mix of glances and the occasional braver approach.";
			return "The beach is crowded — lots of eyes, but most people only dare to watch from a distance.";
		}
		if (m.level === "empty")
			return "The mall is almost empty — fewer onlookers, but anyone bold enough might get personal with you.";
		if (m.level === "normal")
			return "A typical mall afternoon — a mix of glances and the occasional braver approach.";
		return "The mall is crowded — lots of eyes, but most people only dare to watch from a distance.";
	},

	mall_crowd_narration()
	{
		return this.tan_crowd_narration();
	},

	mall_ambient_attention_threshold()
	{
		return 4 + (this.mall_crowd_modifiers().ambientThreshold || 0);
	},

	// --- Swimsuit change before tanning ---
	SWIM_CHANGE_SHRUBS_EXHIB: 4,
	SWIM_CHANGE_OPEN_SHRUBS_EXHIB: 8,
	SWIM_CHANGE_OPEN_GRASS_EXHIB: 10,
	SWIM_WARDROBE_PASSAGE: "TanSwimWardrobe",
	TAN_PHONE_PASSAGE: "TanPhoneMenu",

	SWIM_CHANGE_SITES: {
		UniMall: {
			restroom: "UniMallRestroom",
			tanMenu: "UniMallTanMenu",
		},
	},

	get_swim_change_site()
	{
		return this.get_swim_change_site_config().site;
	},

	get_swim_change_site_config()
	{
		const site = this.get_tanning_site();
		const cfg = this.SWIM_CHANGE_SITES[site] || this.SWIM_CHANGE_SITES.UniMall;
		return { site, ...cfg };
	},

	get_swim_change_tan_menu()
	{
		return this.get_swim_change_site_config().tanMenu;
	},

	get_swim_change_restroom()
	{
		return this.get_swim_change_site_config().restroom;
	},

	is_mall_tan_swimsuit_change_site()
	{
		return this.get_tanning_site() === "UniMall";
	},

	has_swimsuit_available(person)
	{
		if (!person) return false;
		if (this.has_saved_outfit(person)) return true;
		if (person.has_outfit("Swimsuit")) return true;
		const outfits = V.outfits || [];
		for (let i = 0; i < outfits.length; i++)
		{
			const o = outfits[i];
			if (!o || !o.clothes) continue;
			for (let j = 0; j < o.clothes.length; j++)
			{
				const def = setup.Clothes && setup.Clothes.item[o.clothes[j].item];
				if (def && (def.type === "swimwear" || def.tags && def.tags.includes("swimwear")))
				{
					if (person.has_outfit(o.name)) return true;
					break;
				}
			}
		}
		return false;
	},

	can_offer_swimsuit_change(person)
	{
		if (!person || person.wearing_some_swimwear()) return false;
		if (!this.is_mall_tan_swimsuit_change_site()) return false;
		return this.has_swimsuit_available(person);
	},

	is_swimwear_outfit(outfit)
	{
		if (!outfit || !outfit.clothes || !outfit.clothes.length) return false;
		for (let i = 0; i < outfit.clothes.length; i++)
		{
			const piece = outfit.clothes[i];
			const def = setup.Clothes && (setup.Clothes.item[piece.item] || setup.Clothes[piece.item]);
			if (!def) continue;
			if (def.type === "swimwear" || def.category === "swimwear")
				return true;
			if (def.tags && def.tags.includes("swimwear"))
				return true;
		}
		return false;
	},

	begin_swimsuit_picker(person)
	{
		if (!person) return false;
		if (!V.pretanningclothes || !V.pretanningclothes.length)
		{
			V.pretanningclothes = [];
			for (let i = 0; i < person.clothes.length; i++)
				V.pretanningclothes.push(Object.assign({}, person.clothes[i]));
		}
		V.tanswimpick = true;
		if (!V.tanswimchangetarget)
			V.tanswimchangetarget = this.get_swim_change_tan_menu();
		return true;
	},

	cancel_swimsuit_picker(person)
	{
		delete V.tanswimpick;
		if (person && V.pretanningclothes && V.pretanningclothes.length)
		{
			const restore = () =>
			{
				this.swap_for_tanning(person);
				person.wear_all_clothes(V.pretanningclothes);
			};
			if (setup.ExhibitionAdjustment && setup.ExhibitionAdjustment.preserve_exposure_on_wear)
				setup.ExhibitionAdjustment.preserve_exposure_on_wear(restore);
			else
				restore();
			delete V.pretanningclothes;
			this.maybe_invalidate_paperdoll(person);
		}
	},

	get_swim_wardrobe_return()
	{
		return V.tanswimchangetarget || this.get_swim_change_tan_menu();
	},

	swim_wardrobe_exhib_req(person)
	{
		person = person || V.pc;
		if (!person || !setup.SwimwearExhibition) return 0;
		if (!person.wearing_some_swimwear()) return 0;
		const ctx = this.get_tan_exhib_context();
		return setup.SwimwearExhibition.swimwear_requirement(
			person, ctx.passage, ctx.loc, ctx.locblock
		);
	},

	can_leave_swim_wardrobe(person)
	{
		if (!person) return false;
		if (!person.wearing_some_swimwear()) return true;
		const req = this.swim_wardrobe_exhib_req(person);
		return person.skillleveled("Exhibitionism", req);
	},

	describe_swim_wardrobe_outfit(person)
	{
		if (!person || !person.wearing_some_swimwear()) return "";
		const names = [];
		for (let i = 0; i < person.clothes.length; i++)
		{
			const piece = person.clothes[i];
			const def = setup.Clothes && (setup.Clothes.item[piece.item] || setup.Clothes[piece.item]);
			if (!def) continue;
			if (def.type !== "swimwear" && def.category !== "swimwear" &&
				!(def.tags && def.tags.includes("swimwear")))
				continue;
			const c = new ClothingItem(piece);
			names.push(setup.capitalize_each(c.get_name ? c.get_name() : piece.name));
		}
		if (!names.length) return "your swimwear";
		return names.join(" and ");
	},

	reset_swimsuit_picker_outfit(person)
	{
		if (!person) return;
		this.begin_swimsuit_picker(person);
		this.swap_for_tanning(person);
		this.maybe_invalidate_paperdoll(person);
	},

	get_swimsuit_picker_options(person)
	{
		const opts = [];
		const seen = new Set();
		const adding = person && person.wearing_some_swimwear();
		const closetVerb = adding ? "Add" : "Wear";
		const outfits = V.outfits || [];
		for (let i = 0; i < outfits.length; i++)
		{
			const o = outfits[i];
			if (!o || !o.name || !this.is_swimwear_outfit(o)) continue;
			if (seen.has(o.name)) continue;
			seen.add(o.name);
			opts.push({
				kind: "outfit",
				name: o.name,
				label: (adding ? "Switch to «" : "Wear «") + setup.unescape(o.name) + "»",
			});
		}
		const addCloset = (storage) =>
		{
			const items = setup.clothes.get_all_of_category(storage, "swimwear") || [];
			for (let j = 0; j < items.length; j++)
			{
				const c = items[j];
				const label = c.get_name ? c.get_name() : c.name;
				const key = (c.item || "") + ":" + label;
				if (seen.has(key)) continue;
				seen.add(key);
				opts.push({
					kind: "closet",
					clothing: c,
					label: closetVerb + " " + setup.capitalize_each(label),
				});
			}
		};
		addCloset("dormcloset");
		addCloset("PC");
		return opts;
	},

	wear_swimsuit_choice(person, opt)
	{
		if (!person || !opt) return { ok: false, msg: "Nothing selected." };
		this.begin_swimsuit_picker(person);
		const wasWearing = person.wearing_some_swimwear();
		if (opt.kind === "outfit")
		{
			this.swap_for_tanning(person);
			const notfound = person.wear_outfit(opt.name);
			if (notfound && notfound.length)
				return { ok: false, msg: "You couldn't find everything for that outfit in your closet." };
		}
		else if (opt.kind === "closet")
		{
			if (!wasWearing)
				this.swap_for_tanning(person);
			if (!person.wear_from_closet(opt.clothing))
				return { ok: false, msg: "You couldn't find that in your closet." };
		}
		else
			return { ok: false, msg: "That didn't work." };

		if (!person.wearing_some_swimwear())
			return { ok: false, msg: "That didn't leave you in swimwear." };
		this.maybe_invalidate_paperdoll(person);
		let msg = "You change into your swimwear.";
		if (opt.kind === "outfit")
			msg = "You change into «" + setup.unescape(opt.name) + "».";
		else if (wasWearing)
			msg = "You add that to what you're wearing.";
		return { ok: true, msg: msg };
	},

	confirm_swimsuit_for_tanning(person)
	{
		if (!person || !person.wearing_some_swimwear())
			return { ok: false, msg: "Pick swimwear first." };
		V.malltanning = person.wearing_swimwear() ? "bikini" : "swimwear";
		this.save_outfit(person, V.malltanning);
		delete V.tanswimpick;
		this.maybe_invalidate_paperdoll(person);
		return { ok: true, msg: "" };
	},

	_swim_change_crowd()
	{
		return this.mall_crowd_modifiers();
	},

	_swim_change_area_label()
	{
		return this.get_tanning_site() === "UniversityLakeBeach" ? "beach" : "mall";
	},

	get_swimsuit_change_methods(person)
	{
		if (!this.can_offer_swimsuit_change(person)) return [];
		const cfg = this.get_swim_change_site_config();
		const crowd = this._swim_change_crowd();
		const exhib = person.skill_level("Exhibitionism");
		const area = this._swim_change_area_label();
		const methods = [];

		const wardrobe = this.SWIM_WARDROBE_PASSAGE;

		methods.push({
			id: "bathroom",
			label: "Use the restroom, then pick a swimsuit",
			passage: cfg.restroom,
			exhib_req: 0,
			minutes: 2,
			hint: "private",
			enabled: true,
			travel: true,
		});

		const shrubsReq = this.SWIM_CHANGE_SHRUBS_EXHIB;
		methods.push({
			id: "shrubs",
			label: "Change behind the shrubs, then pick a swimsuit",
			passage: wardrobe,
			exhib_req: shrubsReq,
			minutes: 2,
			hint: "mostly hidden",
			enabled: exhib >= shrubsReq,
			disabled_hint: "Need Exhibitionism " + shrubsReq,
		});

		const openShrubsReq = this.SWIM_CHANGE_OPEN_SHRUBS_EXHIB;
		methods.push({
			id: "open_shrubs",
			label: "Change openly behind the shrubs, then pick a swimsuit",
			passage: wardrobe,
			exhib_req: openShrubsReq,
			minutes: 1,
			hint: "bold — someone might glimpse you",
			enabled: exhib >= openShrubsReq,
			disabled_hint: "Need Exhibitionism " + openShrubsReq,
		});

		const openGrassReq = this.SWIM_CHANGE_OPEN_GRASS_EXHIB;
		if (exhib >= openShrubsReq && exhib < openGrassReq)
		{
			methods.push({
				id: "open_grass_empty",
				label: "Change in the open, then pick a swimsuit",
				passage: wardrobe,
				exhib_req: openShrubsReq,
				minutes: 1,
				hint: "only when the " + area + " is nearly empty",
				enabled: crowd.level === "empty",
				disabled_hint: crowd.level !== "empty"
					? "Too many people around — need an empty " + area + " or Exhibitionism " + openGrassReq
					: null,
			});
		}

		methods.push({
			id: "open_grass",
			label: "Change right on the grass, then pick a swimsuit",
			passage: wardrobe,
			exhib_req: openGrassReq,
			minutes: 1,
			hint: "everyone can see",
			enabled: exhib >= openGrassReq,
			disabled_hint: "Need Exhibitionism " + openGrassReq,
		});

		return methods;
	},

	apply_swimsuit_change(person, methodId)
	{
		const fx = { msg: "", attention: 0, humiliation: 0, arousal: 0, exhib: false };
		const crowd = this._swim_change_crowd();
		const cfg = this.get_swim_change_site_config();

		this.begin_swimsuit_picker(person);
		V.tanswimchangetarget = cfg.tanMenu;
		if (!V.tanninglocation && this.TANNING_SITES[V.location])
			V.tanninglocation = V.location;

		if (methodId === "bathroom")
		{
			fx.msg = "You head for the restroom to change.";
			return fx;
		}

		if (methodId === "shrubs")
		{
			fx.msg = "You duck behind a dense screen of shrubs, mostly hidden from the foot traffic on the mall.";
			fx.attention = Math.round(4 * crowd.noticeMult);
			fx.humiliation = 6;
		}
		else if (methodId === "open_shrubs")
		{
			fx.msg = "You settle behind the shrubs where the branches part just enough to silhouette you.";
			fx.attention = Math.round(14 * crowd.noticeMult);
			fx.arousal = 12;
			fx.humiliation = 10;
			fx.exhib = true;
		}
		else if (methodId === "open_grass_empty")
		{
			const area = this._swim_change_area_label();
			fx.msg = "With hardly anyone around, you spread your towel on the grass — the " + area + " feels private enough to change.";
			fx.attention = Math.round(18 * crowd.noticeMult);
			fx.arousal = 18;
			fx.humiliation = 14;
			fx.exhib = true;
		}
		else if (methodId === "open_grass")
		{
			const crowded = crowd.level === "crowded";
			const area = this._swim_change_area_label();
			fx.msg = crowded
				? "You spread your towel on the open grass with no privacy at all. Heads turn across the " + area + "."
				: "You lay out your towel on the grass, well aware anyone passing by could watch you change.";
			fx.attention = Math.round((crowded ? 35 : 25) * crowd.noticeMult);
			fx.arousal = crowded ? 35 : 22;
			fx.humiliation = crowded ? 22 : 12;
			fx.exhib = true;
		}
		else
		{
			fx.msg = "You change into swimwear.";
		}

		return fx;
	},
});

if (setup.Tanning && setup.Tanning.register_tan_invite_activities)
	setup.Tanning.register_tan_invite_activities();

(function ()
{
	const T = setup.Tanning;
	if (!T) return;
	if (typeof T._crossover_witness_react !== "function")
	{
		T._crossover_witness_react = function (watcher, sub, intensity)
		{
			intensity = intensity || 1;
			const profile = T.profile_tan_witness(watcher);
			const gain = setup.rir(12 + intensity * 8, 22 + intensity * 12);
			setup.people.alter_attitude(watcher, "lust", gain);
			if (sub)
				setup.people.alter_attitude(sub, "control", setup.rir(-6 - intensity * 2, -12 - intensity * 3));
			const esc = T.get_close_escalation();
			if (esc && esc.npc === watcher)
				esc.crossoverStrokes = (esc.crossoverStrokes || 0) + intensity;
			if (profile.voyeur || profile.attracted)
				return T.witness_name_link(watcher, true) + " watches the three of you with hungry focus.";
			return setup.capitalize(setup.people.pronouns(watcher).ps) + " can't look away from what you're orchestrating.";
		};
	}
})();

(function ()
{
	const T = setup.Tanning;
	if (!T || T._saveOutfitBackpackPatched || typeof T.save_outfit !== "function") return;
	const origSaveOutfit = T.save_outfit.bind(T);
	T.save_outfit = function (person, mode)
	{
		if (person && mode && mode !== "clothed")
			T.ensure_tan_backpack_stash(person);
		return origSaveOutfit(person, mode);
	};
	T._saveOutfitBackpackPatched = true;
})();