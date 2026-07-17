// Selfie convo reply data — edit here, then run: python3 generate-selfie-convo-tree.py
// Rebake: ./rebake/integrate-exhibition-tanning.sh

Object.assign(setup.Tanning, {
	SelfieConvoPools: {
		// Attitude tiers used by req: { lust: "high" } etc.
		attitudeTiers: {
			friendship: { veryLow: -333, low: -100, mid: 150, high: 500, veryHigh: 800 },
			lust: { none: 0, low: 150, mid: 300, high: 500, veryHigh: 800 },
			romance: { none: 0, low: 150, mid: 300, high: 500, veryHigh: 600 },
			control: { sub: -400, subMid: -200, domMid: 200, dom: 400, domHigh: 600 },
		},

		// Lane pick order (first match wins). See _resolve_selfie_reply_lane in exhibition-tanning.js
		laneOrder: [
			"partner", "bestfriend", "professor", "dom", "sub", "ex", "admirer",
			"hater", "rival", "hatefuck", "fuckbuddy", "date", "friend", "acquaintance", "indifferent",
		],

		// Extra lines merged into any lane when attitudes match
		attitudeBonus: {
			highLust: {
				req: { lust: "high", attracted: true },
				mood: ["encouraging", "enthusiastic", "flirty"],
				entries: [
					{ id: "bonus_lust_want_more", text: "want more where that came from?", tone: "flirty", tags: "lewd", lust: 10 },
					{ id: "bonus_lust_turned_on", text: "you sound turned on", tone: "bold", tags: "flirty", lust: 8 },
				],
			},
			highRomance: {
				req: { romance: "high" },
				mood: ["warm", "encouraging", "flirty"],
				entries: [
					{ id: "bonus_rom_sweet", text: "being sweet to me?", tone: "flirty", tags: "flirty", romance: 10 },
					{ id: "bonus_rom_mean_it", text: "do you mean that?", tone: "flirty", tags: "flirty", romance: 8 },
				],
			},
			lowFriendship: {
				req: { friendship: "veryLow" },
				mood: ["scolding", "shocked", "neutral"],
				entries: [
					{ id: "bonus_hate_why_text", text: "why are you even texting me", tone: "bold", tags: "neg", friendship: -8 },
				],
			},
			highFriendship: {
				req: { friendship: "high" },
				mood: ["warm", "casual", "encouraging"],
				entries: [
					{ id: "bonus_friend_lol", text: "lol you're ridiculous", tone: "casual", tags: "pos", friendship: 5 },
					{ id: "bonus_friend_appreciate", text: "ok i appreciate you", tone: "warm", tags: "pos", friendship: 8 },
				],
			},
		},

		lanes: {
			rival: {
				label: "Rival (enemy relationship)",
				moods: {
					scolding: [
						{ id: "jealous", text: "jealous?", tone: "bold", tags: "neg", friendship: -8 },
						{ id: "cared", text: "sounds like you cared", tone: "bold", tags: "neg", friendship: -6 },
						{ id: "whatever", text: "whatever", tone: "casual", tags: "neg", friendship: -4 },
						{ id: "rent_free", text: "i live rent free huh", tone: "bold", tags: "neg", friendship: -10 },
						{ id: "pressed", text: "you sound pressed", tone: "bold", tags: "neg", friendship: -8 },
						{ id: "cry", text: "cry about it", tone: "bold", tags: "neg", friendship: -12 },
						{ id: "mad_jealous", text: "mad i'm hotter?", tone: "bold", tags: "neg", friendship: -10, req: { lust: "mid" } },
					],
					shocked: [
						{ id: "looked_anyway", text: "you looked anyway", tone: "bold", tags: "neg", friendship: -8 },
						{ id: "make_me", text: "make me delete it", tone: "bold", tags: "neg", friendship: -10 },
						{ id: "wrong_person", text: "oops, wrong person", tone: "apologetic", tags: "confused", friendship: 2 },
						{ id: "cope", text: "cope harder", tone: "bold", tags: "neg", friendship: -12 },
						{ id: "screenshot", text: "screenshot it then", tone: "bold", tags: "neg", friendship: -8 },
						{ id: "blocked", text: "blocked yet?", tone: "casual", tags: "neg", friendship: -6 },
					],
					encouraging: [
						{ id: "worse_one", text: "want a worse one?", action: "bolder", tags: "neg", friendship: -5 },
						{ id: "touch_grass", text: "touch grass", tone: "bold", tags: "neg", friendship: -10 },
						{ id: "bye_rival", text: "don't text me then", tone: "casual", tags: "neg", friendship: -6 },
						{ id: "mad", text: "mad?", tone: "bold", tags: "neg", friendship: -8 },
					],
					enthusiastic: [
						{ id: "still_gross", text: "still gross though?", tone: "bold", tags: "neg", friendship: -8 },
						{ id: "mad_looked", text: "mad you looked?", tone: "bold", tags: "neg", friendship: -6 },
						{ id: "another_taunt", text: "want another?", action: "bolder", tags: "neg", friendship: -5 },
						{ id: "enjoy", text: "enjoy the view then", tone: "bold", tags: "neg", friendship: -8 },
					],
					flirty: [
						{ id: "not_flirting", text: "wasn't flirting with you", tone: "apologetic", tags: "confused", friendship: -2 },
						{ id: "stop_texting", text: "then stop replying", tone: "bold", tags: "neg", friendship: -8 },
						{ id: "down_bad", text: "you're down bad", tone: "bold", tags: "neg", friendship: -10 },
					],
					warm: [
						{ id: "no_compliment", text: "what, no compliment?", tone: "bold", tags: "neg", friendship: -5 },
						{ id: "knew_hate", text: "knew you'd hate it", tone: "bold", tags: "neg", friendship: -6 },
					],
					neutral: [
						{ id: "looked_anyway_n", text: "you looked anyway", tone: "bold", tags: "neg", friendship: -6 },
						{ id: "whatever_n", text: "whatever", tone: "casual", tags: "neg", friendship: -4 },
						{ id: "problem", text: "problem?", tone: "bold", tags: "neg", friendship: -8 },
					],
				},
				wrapup: {
					apologetic: [
						{ id: "wont_again", text: "won't happen again", tone: "apologetic", tags: "confused", friendship: 2 },
						{ id: "bye_apol", text: "bye", tags: "pos" },
					],
					bold: [
						{ id: "welcome", text: "you're welcome", tone: "bold", tags: "neg", friendship: -8 },
						{ id: "dont_text", text: "don't text me then", tags: "neg", friendship: -10 },
						{ id: "bye_bold", text: "bye", tags: "pos", friendship: -4 },
					],
					default: [
						{ id: "bye", text: "bye", tags: "pos", friendship: -2 },
						{ id: "whatever_w", text: "whatever", tags: "neg", friendship: -4 },
						{ id: "dont_text_again", text: "don't text me this again", tags: "neg", friendship: -8 },
						{ id: "stay_mad_wrap", text: "stay mad", tone: "bold", tags: "neg", friendship: -10 },
					],
				},
			},

			hater: {
				label: "Hater (very negative friendship)",
				extends: "rival",
				moodExtra: {
					scolding: [
						{ id: "hate_me", text: "hate me more", tone: "bold", tags: "neg", friendship: -12 },
						{ id: "stay_mad", text: "stay mad", tags: "neg", friendship: -10 },
						{ id: "unblock", text: "unblock me then", tone: "bold", tags: "neg", friendship: -8 },
					],
				},
				wrapupExtra: [
					{ id: "hate_more_wrap", text: "hate me more", tone: "bold", tags: "neg", friendship: -12 },
				],
			},

			hatefuck: {
				label: "Hatefuck (toxic attraction)",
				moods: {
					encouraging: [
						{ id: "bolder_hf", text: "want a bolder one?", action: "bolder", tags: "lewd", lust: 12 },
						{ id: "love_it", text: "you love it though", tone: "bold", tags: "lewd", lust: 10 },
						{ id: "menace", text: "I'm a menace, what can I say", tone: "bold", tags: "lewd", lust: 8, friendship: -4 },
						{ id: "toxic", text: "toxic? maybe. hot? definitely.", tone: "flirty", tags: "lewd", lust: 14 },
					],
					enthusiastic: [
						{ id: "another_hf", text: "want another?", action: "bolder", tags: "lewd", lust: 15 },
						{ id: "that_much_hf", text: "that turned on?", tone: "flirty", tags: "lewd", lust: 18 },
						{ id: "ruin_you", text: "gonna ruin you", tone: "bold", tags: "lewd", lust: 12 },
						{ id: "feral", text: "get feral then", tone: "bold", tags: "lewd", lust: 16 },
					],
					scolding: [
						{ id: "dont_stop", text: "don't act mad now", tone: "bold", tags: "lewd", lust: 10 },
						{ id: "worse_hf", text: "want a worse one?", action: "bolder", tags: "lewd", lust: 12 },
						{ id: "annoying", text: "you're annoying. hi.", tone: "flirty", tags: "lewd", lust: 8, friendship: -3 },
						{ id: "hate_like", text: "hate that i like it?", tone: "flirty", tags: "lewd", lust: 12 },
					],
					shocked: [
						{ id: "send_more_hf", text: "say that again after the next one", tone: "bold", tags: "lewd", lust: 10 },
						{ id: "worse_hf2", text: "want a worse one?", action: "bolder", tags: "lewd", lust: 12 },
						{ id: "insane", text: "I'm insane, yeah", tone: "bold", tags: "lewd", lust: 8 },
					],
				},
				wrapup: {
					default: [
						{ id: "one_more_hf", text: "one more for the road?", action: "bolder", tags: "lewd", lust: 12, req: { encouraged: true } },
						{ id: "bye_hf", text: "ttyl, troublemaker", tone: "flirty", tags: "lewd", lust: 5, friendship: -2 },
						{ id: "later_hf", text: "text me when you're less mad", tone: "flirty", tags: "lewd", lust: 10 },
						{ id: "ruin_hf", text: "still want me to ruin you?", tone: "flirty", tags: "lewd", lust: 14 },
					],
				},
			},

			partner: {
				label: "Romantic partner",
				moods: {
					encouraging: [
						{ id: "bolder_partner", text: "want a bolder one?", action: "bolder", tags: "lewd", lust: 15, romance: 10 },
						{ id: "miss_you", text: "miss you", tags: "flirty", romance: 15, friendship: 8 },
						{ id: "come_over", text: "come over?", tone: "flirty", tags: "flirty", romance: 12, lust: 10, ctx: "phone" },
						{ id: "come_towel", text: "come watch me at my towel", action: "invite_watch", tone: "flirty", tags: "flirty", romance: 12, lust: 10, ctx: "tanning" },
						{ id: "love_you", text: "love you", tags: "pos", romance: 20, friendship: 10 },
					],
					enthusiastic: [
						{ id: "all_yours", text: "all yours", tone: "flirty", tags: "flirty", lust: 18, romance: 15 },
						{ id: "like_view", text: "like the view?", tags: "flirty", lust: 15, romance: 10 },
						{ id: "meet_later", text: "meet later?", dynamic: "join", tone: "flirty", tags: "flirty", romance: 12, friendship: 8 },
						{ id: "another_partner", text: "want another?", action: "bolder", tags: "lewd", lust: 12, romance: 8 },
					],
					warm: [
						{ id: "thanks_love", text: "thanks babe", tags: "pos", friendship: 10, romance: 12 },
						{ id: "thinking", text: "was thinking of you", tags: "flirty", romance: 15, friendship: 8 },
						{ id: "invite_partner_tan", text: "join me?", dynamic: "join", tone: "flirty", tags: "flirty", romance: 14, friendship: 10, ctx: "tanning" },
						{ id: "cute", text: "cute right?", tags: "pos", friendship: 8, romance: 8 },
					],
					scolding: [
						{ id: "worth_it_partner", text: "worth it though?", tone: "bold", tags: "lewd", lust: 10, romance: 8 },
						{ id: "sorry_babe", text: "sorry babe", tone: "apologetic", tags: "confused", friendship: 5, romance: 5 },
						{ id: "safer_partner", text: "want a safer one?", action: "safer", tags: "pos", friendship: 5 },
					],
				},
				wrapup: {
					default: [
						{ id: "love", text: "love you", tags: "pos", romance: 20, friendship: 10 },
						{ id: "see_you_partner", text: "see you tonight?", tags: "flirty", romance: 15, ctx: "phone" },
						{ id: "see_sunset", text: "come watch after the sun sets?", action: "invite_watch", tags: "flirty", romance: 15, ctx: "tanning" },
						{ id: "bye_partner", text: "bye babe", tags: "pos", romance: 10, friendship: 8 },
						{ id: "one_more_partner", text: "one more for you?", action: "bolder", tags: "lewd", romance: 10, lust: 10 },
					],
				},
			},

			bestfriend: {
				label: "Best friend (V.bestfriend)",
				extends: "friend",
				moodExtra: {
					warm: [
						{ id: "bff_lol", text: "lmaooo you would", tags: "pos", friendship: 10 },
						{ id: "bff_ride", text: "you'd tell me if it's bad right?", tags: "pos", friendship: 8 },
					],
					encouraging: [
						{ id: "bff_iconic", text: "iconic behavior from me", tone: "bold", tags: "pos", friendship: 8 },
						{ id: "bff_witness", text: "you're my witness", tags: "pos", friendship: 10 },
					],
					scolding: [
						{ id: "bff_again", text: "you're doing this again", tone: "apologetic", tags: "confused", friendship: 2 },
					],
				},
				wrapupExtra: [
					{ id: "bff_bye", text: "ok bff ttyl", tags: "pos", friendship: 10 },
					{ id: "bff_story", text: "this stays between us", tags: "pos", friendship: 8 },
				],
			},

			admirer: {
				label: "Crush / admirer",
				moods: {
					encouraging: [
						{ id: "noticed_me", text: "so you noticed me?", tone: "flirty", tags: "flirty", romance: 12, friendship: 8 },
						{ id: "like_me", text: "do you like me or the pic?", tone: "flirty", tags: "flirty", romance: 15, lust: 8 },
						{ id: "bolder_crush", text: "want a bolder one?", action: "bolder", tags: "lewd", lust: 10, romance: 8, req: { lust: "mid" } },
						{ id: "nervous", text: "nervous you liked it", tags: "pos", romance: 10, friendship: 5 },
					],
					enthusiastic: [
						{ id: "really", text: "you really like it?", tone: "flirty", tags: "flirty", romance: 15, lust: 12 },
						{ id: "hang_out", text: "wanna hang out soon?", tone: "flirty", tags: "flirty", romance: 12, friendship: 10 },
						{ id: "blush", text: "you're making me blush", tags: "flirty", romance: 10, friendship: 8 },
					],
					warm: [
						{ id: "thanks_crush", text: "thanks!", tags: "pos", friendship: 10, romance: 8 },
						{ id: "for_you", text: "took it for you", tone: "flirty", tags: "flirty", romance: 12 },
						{ id: "thought_cute", text: "thought you'd think it's cute", tags: "pos", friendship: 8, romance: 8 },
					],
					scolding: [
						{ id: "too_much_crush", text: "too much?", tone: "apologetic", tags: "confused", romance: 5, friendship: 2 },
						{ id: "still_like", text: "still like me though?", tone: "flirty", tags: "flirty", romance: 8 },
						{ id: "sorry_crush", text: "sorry, got brave", tone: "apologetic", tags: "confused", friendship: 5, romance: 5 },
					],
				},
				wrapup: {
					default: [
						{ id: "hope_liked", text: "hope that wasn't weird", tags: "confused", romance: 8, friendship: 5 },
						{ id: "hang_soon", text: "wanna hang soon?", tone: "flirty", tags: "flirty", romance: 12, friendship: 8 },
						{ id: "bye_crush", text: "talk later?", tags: "pos", romance: 8, friendship: 5 },
						{ id: "nervous_bye", text: "ok bye before i panic", tags: "confused", friendship: 3, romance: 5 },
					],
				},
			},

			ex: {
				label: "Ex-partner",
				moods: {
					warm: [
						{ id: "mistake", text: "probably shouldn't have sent that", tone: "apologetic", tags: "confused", friendship: -5, romance: -8 },
						{ id: "old_habit", text: "old habit, sorry", tone: "apologetic", tags: "confused", friendship: -3 },
						{ id: "delete_ex", text: "delete it please", tone: "apologetic", tags: "confused", friendship: -5 },
					],
					scolding: [
						{ id: "boundaries", text: "sorry, crossed a line", tone: "apologetic", tags: "confused", friendship: -8, romance: -10 },
						{ id: "didnt_mean", text: "didn't mean to stir anything", tone: "apologetic", tags: "confused", friendship: -5, romance: -5 },
					],
					flirty: [
						{ id: "miss_ex", text: "do you miss me?", tone: "flirty", tags: "flirty", romance: 5, lust: 5, req: { romance: "low" } },
						{ id: "shouldnt", text: "i shouldn't have texted this", tone: "apologetic", tags: "confused", friendship: -5, romance: -5 },
					],
				},
				wrapup: {
					default: [
						{ id: "sorry_ex", text: "sorry, that was a mistake", tone: "apologetic", tags: "confused", friendship: -5, romance: -8 },
						{ id: "wont_again_ex", text: "won't happen again", tone: "apologetic", tags: "confused", friendship: -3, romance: -5 },
						{ id: "bye_ex", text: "bye", tags: "pos", friendship: -2 },
					],
				},
			},

			professor: {
				label: "Professor / coach (known faculty)",
				moods: {
					scolding: [
						{ id: "prof_sorry", text: "sorry, inappropriate", tone: "apologetic", tags: "confused", friendship: -5 },
						{ id: "prof_mistake", text: "that was unprofessional of me", tone: "apologetic", tags: "confused", friendship: -8 },
						{ id: "prof_delete", text: "please delete that", tone: "apologetic", tags: "confused", friendship: -3 },
					],
					shocked: [
						{ id: "prof_wrong", text: "wrong number, sorry", tone: "apologetic", tags: "confused" },
						{ id: "prof_oops", text: "that wasn't meant for you", tone: "apologetic", tags: "confused" },
					],
					warm: [
						{ id: "prof_casual", text: "just a casual pic, sorry if odd", tone: "apologetic", tags: "confused", friendship: 2 },
					],
				},
				wrapup: {
					default: [
						{ id: "prof_wont", text: "won't happen again", tone: "apologetic", tags: "confused", friendship: 3 },
						{ id: "prof_bye", text: "sorry again, bye", tags: "pos" },
					],
				},
			},

			dom: {
				label: "NPC dominates PC (control ≥ 400)",
				moods: {
					encouraging: [
						{ id: "dom_good", text: "good pet", tone: "bold", tags: "lewd", control: 15, lust: 10, req: { control: "dom" } },
						{ id: "dom_more", text: "want to send more?", action: "bolder", tags: "lewd", control: 10, lust: 12 },
						{ id: "dom_obey", text: "i obey", tone: "apologetic", tags: "lewd", control: 20 },
					],
					scolding: [
						{ id: "dom_sorry", text: "sorry, was i allowed?", tone: "apologetic", tags: "confused", control: 10 },
						{ id: "dom_punish", text: "punish me then", tone: "bold", tags: "lewd", control: 15, lust: 8, req: { lust: "mid" } },
					],
					warm: [
						{ id: "dom_yours", text: "all yours", tone: "flirty", tags: "lewd", control: 12, lust: 10 },
					],
				},
				wrapup: {
					default: [
						{ id: "dom_bye", text: "awaiting orders", tags: "lewd", control: 8 },
						{ id: "dom_thank", text: "thank you", tags: "pos", control: 10, friendship: 5 },
					],
				},
			},

			sub: {
				label: "PC dominates NPC (control ≤ -400)",
				moods: {
					encouraging: [
						{ id: "sub_good", text: "good. keep going", tone: "bold", tags: "lewd", control: -15, lust: 10 },
						{ id: "sub_more", text: "want another?", action: "bolder", tags: "lewd", control: -10, lust: 12 },
					],
					scolding: [
						{ id: "sub_behave", text: "behave or i stop", tone: "bold", tags: "neg", control: -12 },
						{ id: "sub_try_me", text: "try me", tone: "bold", tags: "neg", control: -8 },
					],
					flirty: [
						{ id: "sub_mine", text: "mine", tone: "bold", tags: "lewd", control: -15, lust: 15 },
					],
				},
				wrapup: {
					default: [
						{ id: "sub_bye", text: "you may go", tone: "casual", tags: "pos", control: -5 },
						{ id: "sub_later", text: "text me when you're good", tags: "lewd", control: -8, lust: 8 },
					],
				},
			},

			fuckbuddy: {
				label: "Fuckbuddy / booty call",
				extends: "warm",
				bias: { lustBias: true },
			},

			date: {
				label: "Dating",
				extends: "warm",
				bias: { romanceBias: true },
			},

			friend: {
				label: "Friend",
				extends: "warm",
				bias: {},
			},

			warm: {
				label: "Warm generic (friend/date/fuckbuddy base)",
				moods: {
					encouraging: [
						{ id: "bolder_pic", text: "want a bolder one?", action: "bolder", tags: "lewd", lust: 12 },
						{ id: "not_mad", text: "so you're not mad?", tone: "flirty", tags: "flirty", lust: 10, romance: 5 },
						{ id: "keep_going", text: "only if you keep encouraging me", tone: "bold", tags: "lewd", lust: 18, romance: 5 },
						{ id: "glad", text: "glad you liked it", tags: "pos", friendship: 8, lust: 8 },
					],
					enthusiastic: [
						{ id: "that_much", text: "you like it that much?", tone: "flirty", tags: "flirty", lust: 20 },
						{ id: "meet_phone", text: "meet up later?", tone: "flirty", tags: "flirty", romance: 12, friendship: 8, ctx: "phone" },
						{ id: "meet_tan", text: "meet up after I'm done here?", tone: "flirty", tags: "flirty", romance: 12, friendship: 8, ctx: "tanning" },
						{ id: "hot", text: "think it's hot?", tone: "flirty", tags: "flirty", lust: 15 },
					],
					flirty: [
						{ id: "flirt_back", text: "careful, I'll flirt back", tone: "flirty", tags: "flirty", lust: 15, romance: 10 },
						{ id: "join_phone", text: "come prove it in person", tone: "flirty", tags: "flirty", romance: 12, friendship: 8, ctx: "phone" },
						{ id: "join_tan", text: "come prove it at my towel", tone: "flirty", tags: "flirty", romance: 12, friendship: 8, ctx: "tanning" },
						{ id: "your_turn", text: "your turn to send one", tone: "flirty", tags: "flirty", lust: 12 },
					],
					scolding: [
						{ id: "worth_it", text: "worth it though, right?", tone: "bold", tags: "lewd", lust: 10, romance: 5 },
						{ id: "sorry_scold", text: "sorry, got carried away", tone: "apologetic", tags: "confused", friendship: 3, lust: -5 },
						{ id: "safer_pic", text: "want a safer one instead?", action: "safer", tags: "pos", friendship: 5 },
						{ id: "too_far", text: "too far?", tone: "apologetic", tags: "confused", friendship: -2 },
					],
					shocked: [
						{ id: "sorry_shock", text: "sorry! too much?", tone: "apologetic", tags: "confused", friendship: -2, lust: -10 },
						{ id: "delete_after", text: "delete it after you look", tone: "bold", tags: "lewd", lust: 8, req: { lust: "mid" } },
						{ id: "meant_to", text: "that wasn't meant to be that bad...", action: "safer", tags: "pos", friendship: 2 },
						{ id: "oops", text: "oops...", tone: "apologetic", tags: "confused", friendship: -2 },
					],
					warm: [
						{ id: "thanks", text: "thanks!", tags: "pos", friendship: 8 },
						{ id: "join_warm_phone", text: "wanna hang out later?", tone: "flirty", tags: "flirty", friendship: 10, romance: 8, ctx: "phone" },
						{ id: "join_warm_tan", text: "still at the towel if you wanna join", tone: "flirty", tags: "flirty", friendship: 10, romance: 8, ctx: "tanning" },
						{ id: "another_casual", text: "want another pic?", action: "casual", tags: "pos", friendship: 5 },
						{ id: "random", text: "felt cute, might delete later", tags: "pos", friendship: 5 },
					],
				},
				wrapup: {
					apologetic: [
						{ id: "reassure", text: "didn't mean to make it weird", tags: "pos", friendship: 5 },
						{ id: "bye_apol_w", text: "talk later", tags: "pos", friendship: 3 },
						{ id: "sorry_wrap", text: "sorry again", tone: "apologetic", tags: "confused", friendship: 2 },
					],
					bold: [
						{ id: "bye_bold_w", text: "ttyl!", tags: "pos", friendship: 5, ctx: "phone" },
						{ id: "bye_tan_w", text: "gotta get back to tanning", tags: "pos", friendship: 5, ctx: "tanning" },
						{ id: "see_you", text: "see you soon?", tone: "flirty", tags: "flirty", romance: 10, ctx: "phone" },
						{ id: "see_sunset_w", text: "see you after the sun sets?", tone: "flirty", tags: "flirty", romance: 10, ctx: "tanning" },
						{ id: "dream", text: "dream about it", tone: "flirty", tags: "flirty", lust: 8 },
					],
					flirty: [
						{ id: "bye_bold_w", text: "ttyl!", tags: "pos", friendship: 5, ctx: "phone" },
						{ id: "see_you", text: "see you soon?", tone: "flirty", tags: "flirty", romance: 10, ctx: "phone" },
					],
					default: [
						{ id: "one_more", text: "one more for the road?", action: "bolder", tags: "lewd", lust: 12, req: { encouraged: true } },
						{ id: "bye_def", text: "ttyl!", tags: "pos", friendship: 5 },
						{ id: "join_def_phone", text: "wanna hang out later?", tone: "flirty", tags: "flirty", friendship: 10, romance: 8, ctx: "phone" },
						{ id: "join_def_tan", text: "still at the towel if you wanna join", tone: "flirty", tags: "flirty", friendship: 10, romance: 8, ctx: "tanning" },
						{ id: "later", text: "talk later", tags: "pos", friendship: 5 },
					],
				},
			},

			acquaintance: {
				label: "Acquaintance (friendly but not close)",
				extends: "warm",
				moodExtra: {
					warm: [
						{ id: "acq_hey", text: "hey, random pic", tags: "pos", friendship: 3 },
						{ id: "acq_sorry", text: "sorry if that's weird", tone: "apologetic", tags: "confused", friendship: 1 },
					],
				},
			},

			indifferent: {
				label: "Indifferent / low connection",
				moods: {
					neutral: [
						{ id: "random", text: "random impulse, sorry", tone: "apologetic", tags: "confused", friendship: -2 },
						{ id: "wrong_person", text: "wrong person?", tone: "apologetic", tags: "confused" },
						{ id: "awkward", text: "awkward... anyway", tone: "apologetic", tags: "confused", friendship: -1 },
						{ id: "bye_indiff", text: "anyway, bye", tags: "pos" },
						{ id: "ignore", text: "you can ignore it", tags: "pos" },
					],
				},
				wrapup: {
					default: [
						{ id: "bye", text: "bye", tags: "pos" },
						{ id: "sorry", text: "sorry about that", tone: "apologetic", tags: "confused", friendship: 2 },
						{ id: "awkward_bye", text: "awkward... bye", tags: "pos" },
					],
				},
			},
		},
	},
});