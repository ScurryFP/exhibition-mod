#!/usr/bin/env python3
"""Add University Lake Beach (Emerson Road access, tanning, NPC spawns) to appearance-dev HTML."""

from __future__ import annotations

import re
from pathlib import Path

from rebake_target import HTML, ROOT

SRC = ROOT / "university-lake"
LAKE_TAN_SRC = ROOT / "lake-tanning"
BEACH_NPC_SRC = ROOT / "lake-beach-npcs"
PASSAGE_NAME = "UniversityLakeBeach"
LAKE_TAN_PASSAGES = ["LakeTanMenu", "LakeTanClothed", "LakeTanSwimwear", "LakeTanBikini"]
FACILITY_PASSAGES = ["UniversityLakeBeachRestroom", "UniversityLakeBeachChangingRoom"]
BEACH_NPC_PASSAGES = [
    "BeachSocialMenu",
    "EventBeachVolleyball",
    "EventBeachBadminton",
    "EventBeachFrisbee",
    "EventBeachFootball",
    "EventBeachSwimHangout",
    "EventBeachTanHangout",
    "EventBeachTalk",
    "EventBeachWalkFrisbee",
    "EventBeachWalkFrisbeeIgnore",
    "EventBeachWalkFrisbeeToss",
    "EventLakeTanningStare",
    "EventLakeTanningCamelToe",
    "EventBeachSkinnyDipHangout",
    "LakeSkinnyDipMenu",
    "LakeSkinnyDipDo",
    "EventLakeSkinnyDipSwim",
    "LakeSkinnyDipDone",
]
LAKE_BEACH_JS_MARKER = "/* === University Lake Beach NPC activities === */"

# left 500px / top 130px at 600x300 map with 22px marker (see setup.generate_map_html).
MARKER_COORDS = [514, 166]

CAMPUS_NODE = (
    '        "UniversityLakeBeach": {name: "University Lake Beach", '
    'category: "Campus recreation & services", features: "lake beach", '
    f'exits: ["EmersonRd"], markercoords: {MARKER_COORDS},'
    ' seasonvariation: true, snowvariation: true,},'
)

EMERSON_RD_OLD = (
    '"EmersonRd": {name: "Emerson Road", features: "Art", category: "Academic buildings", '
    'exits: ["ThoreauRd", "ChamberlainHall"],'
)
EMERSON_RD_NEW = (
    '"EmersonRd": {name: "Emerson Road", features: "Art", category: "Academic buildings", '
    'exits: ["ThoreauRd", "ChamberlainHall", "UniversityLakeBeach"],'
)

EMERSON_RD_LINK = (
    '        &lt;&lt;link &quot;Emerson Building&quot; EmersonGallery&gt;&gt;&lt;&lt;advtime 1&gt;&gt;&lt;&lt;/link&gt;&gt; &lt;&lt;dtime 1&gt;&gt;\n'
    '    &lt;&lt;/if&gt;&gt;\n'
    '&lt;&lt;/if&gt;&gt;\n\n'
    '&lt;br&gt;&lt;br&gt;\n'
    '&lt;&lt;set _link to {text: &quot;University Lake Beach&quot;, link: &quot;UniversityLakeBeach&quot;, emoji: &#39;🏖️&#39;}&gt;&gt;\n'
    '&lt;&lt;link _link&gt;&gt;&lt;&lt;advtime 2&gt;&gt;&lt;&lt;/link&gt;&gt; &lt;&lt;dtime 2&gt;&gt;\n'
    '&lt;br&gt;&lt;br&gt;\n'
    '&lt;&lt;opportunities&gt;&gt;\n'
    '&lt;&lt;exits&gt;&gt;\n'
    '&lt;br&gt;\n'
    '&lt;&lt;map&gt;&gt;&lt;/tw-passagedata&gt;&lt;tw-passagedata pid=&quot;4986&quot; name=&quot;EmersonGallery&quot;'
)

EMERSON_RD_LINK_ORIG = (
    '        &lt;&lt;link &quot;Emerson Building&quot; EmersonGallery&gt;&gt;&lt;&lt;advtime 1&gt;&gt;&lt;&lt;/link&gt;&gt; &lt;&lt;dtime 1&gt;&gt;\n'
    '    &lt;&lt;/if&gt;&gt;\n'
    '&lt;&lt;/if&gt;&gt;\n\n'
    '&lt;br&gt;&lt;br&gt;\n'
    '&lt;&lt;opportunities&gt;&gt;\n'
    '&lt;&lt;exits&gt;&gt;\n'
    '&lt;br&gt;\n'
    '&lt;&lt;map&gt;&gt;&lt;/tw-passagedata&gt;&lt;tw-passagedata pid=&quot;4986&quot; name=&quot;EmersonGallery&quot;'
)

GALLERY_LAKE_LINK = (
    '&lt;&lt;br&gt;&lt;br&gt;\n'
    '&lt;&lt;set _link to {text: &quot;University Lake Beach&quot;, link: &quot;UniversityLakeBeach&quot;, emoji: &#39;🏖️&#39;}&gt;&gt;\n'
    '&lt;&lt;link _link&gt;&gt;&lt;&lt;advtime 2&gt;&gt;&lt;&lt;/link&gt;&gt; &lt;&lt;dtime 2&gt;&gt;\n'
    '&lt;br&gt;&lt;br&gt;\n'
    '&lt;&lt;bathroom &quot;There is a restroom at the rear of the gallery.&quot;&gt;&gt;'
)

GALLERY_WITHOUT_LAKE = (
    '&lt;br&gt;&lt;br&gt;\n'
    '&lt;&lt;bathroom &quot;There is a restroom at the rear of the gallery.&quot;&gt;&gt;'
)

LAKE_SPAWN_ANCHOR = (
    '\t\t\t\t\t\t\telse if (slotloc == "restroom" || slotloc == "showers")\n'
    '\t\t\t\t\t\t\t\therechance = 0.0075;\n'
    '\n'
    '\t\t\t\t\t\t\tif (loc == "UniMall" && badweather)'
)

LAKE_FACILITY_SPAWN_BLOCK = (
    '\n'
    '\t\t\t\t\t\t\tif (loc == "UniversityLakeBeachRestroom")\n'
    '\t\t\t\t\t\t\t{\n'
    '\t\t\t\t\t\t\t\tif (hour < 8 || hour > 19)\n'
    '\t\t\t\t\t\t\t\t\therechance = 0;\n'
    '\t\t\t\t\t\t\t\telse if (slotloc == "class" && classestoday && hour <= setup.School.last_bell())\n'
    '\t\t\t\t\t\t\t\t\therechance = 0;\n'
    '\t\t\t\t\t\t\t\telse if (setup.people.likely_at_work(person))\n'
    '\t\t\t\t\t\t\t\t\therechance = 0;\n'
    '\t\t\t\t\t\t\t\telse if (slotloc == "restroom" || slotloc == "showers")\n'
    '\t\t\t\t\t\t\t\t\therechance = 0.15;\n'
    '\t\t\t\t\t\t\t\telse if (slotloc == "free time")\n'
    '\t\t\t\t\t\t\t\t\therechance = 0.04;\n'
    '\t\t\t\t\t\t\t\telse\n'
    '\t\t\t\t\t\t\t\t\therechance = 0.01;\n'
    '\t\t\t\t\t\t\t}\n'
    '\n'
    '\t\t\t\t\t\t\tif (loc == "UniversityLakeBeachChangingRoom")\n'
    '\t\t\t\t\t\t\t{\n'
    '\t\t\t\t\t\t\t\tif (hour < 8 || hour > 19)\n'
    '\t\t\t\t\t\t\t\t\therechance = 0;\n'
    '\t\t\t\t\t\t\t\telse if (slotloc == "class" && classestoday && hour <= setup.School.last_bell())\n'
    '\t\t\t\t\t\t\t\t\therechance = 0;\n'
    '\t\t\t\t\t\t\t\telse if (setup.people.likely_at_work(person))\n'
    '\t\t\t\t\t\t\t\t\therechance = 0;\n'
    '\t\t\t\t\t\t\t\telse if (slotloc == "free time")\n'
    '\t\t\t\t\t\t\t\t{\n'
    '\t\t\t\t\t\t\t\t\therechance = 0.08;\n'
    '\t\t\t\t\t\t\t\t\tif (setup.SwimwearExhibition && setup.SwimwearExhibition.is_tanning_weather())\n'
    '\t\t\t\t\t\t\t\t\t\therechance *= 1.3;\n'
    '\t\t\t\t\t\t\t\t}\n'
    '\t\t\t\t\t\t\t\telse\n'
    '\t\t\t\t\t\t\t\t\therechance = 0.02;\n'
    '\t\t\t\t\t\t\t}\n'
)

LAKE_BEACH_SPAWN_BLOCK_OLD = (
    '\t\t\t\t\t\t\tif (loc == "UniversityLakeBeach")\n'
    '\t\t\t\t\t\t\t{\n'
    '\t\t\t\t\t\t\t\tif (hour < 8 || hour > 19)\n'
    '\t\t\t\t\t\t\t\t\therechance = 0;\n'
    '\t\t\t\t\t\t\t\telse if (slotloc == "class" && classestoday && hour <= setup.School.last_bell())\n'
    '\t\t\t\t\t\t\t\t\therechance = 0;\n'
    '\t\t\t\t\t\t\t\telse if (setup.people.likely_at_work(person))\n'
    '\t\t\t\t\t\t\t\t\therechance = 0;\n'
    '\t\t\t\t\t\t\t\telse if (slotloc == "free time")\n'
    '\t\t\t\t\t\t\t\t{\n'
    '\t\t\t\t\t\t\t\t\therechance = 0.12;\n'
    '\t\t\t\t\t\t\t\t\tif (setup.SwimwearExhibition && setup.SwimwearExhibition.is_tanning_weather())\n'
    '\t\t\t\t\t\t\t\t\t\therechance *= 1.4;\n'
    '\t\t\t\t\t\t\t\t\tif (badweather)\n'
    '\t\t\t\t\t\t\t\t\t\therechance *= 0.35;\n'
    '\t\t\t\t\t\t\t\t}\n'
    '\t\t\t\t\t\t\t\telse\n'
    '\t\t\t\t\t\t\t\t\therechance = 0.01;\n'
    '\t\t\t\t\t\t\t}'
)

LAKE_BEACH_SPAWN_BLOCK = (
    '\t\t\t\t\t\t\tif (loc == "UniversityLakeBeach")\n'
    '\t\t\t\t\t\t\t{\n'
    '\t\t\t\t\t\t\t\tif (setup.LakeBeach && setup.LakeBeach.is_skinnydip_time(hour))\n'
    '\t\t\t\t\t\t\t\t{\n'
    '\t\t\t\t\t\t\t\t\tif (slotloc == "class" && classestoday && hour <= setup.School.last_bell())\n'
    '\t\t\t\t\t\t\t\t\t\therechance = 0;\n'
    '\t\t\t\t\t\t\t\t\telse if (setup.people.likely_at_work(person))\n'
    '\t\t\t\t\t\t\t\t\t\therechance = 0;\n'
    '\t\t\t\t\t\t\t\t\telse if (slotloc == "free time")\n'
    '\t\t\t\t\t\t\t\t\t{\n'
    '\t\t\t\t\t\t\t\t\therechance = 0.07;\n'
    '\t\t\t\t\t\t\t\t\t\tif (setup.people.has_any_inclination(person, "basic_exhibitionist"))\n'
    '\t\t\t\t\t\t\t\t\t\t\therechance *= 2;\n'
    '\t\t\t\t\t\t\t\t\t\tif (badweather)\n'
    '\t\t\t\t\t\t\t\t\t\t\therechance *= 0.25;\n'
    '\t\t\t\t\t\t\t\t\t}\n'
    '\t\t\t\t\t\t\t\t\telse\n'
    '\t\t\t\t\t\t\t\t\t\therechance = 0;\n'
    '\t\t\t\t\t\t\t\t}\n'
    '\t\t\t\t\t\t\t\telse if (hour < 8 || hour > 19)\n'
    '\t\t\t\t\t\t\t\t\therechance = 0;\n'
    '\t\t\t\t\t\t\t\telse if (slotloc == "class" && classestoday && hour <= setup.School.last_bell())\n'
    '\t\t\t\t\t\t\t\t\therechance = 0;\n'
    '\t\t\t\t\t\t\t\telse if (setup.people.likely_at_work(person))\n'
    '\t\t\t\t\t\t\t\t\therechance = 0;\n'
    '\t\t\t\t\t\t\t\telse if (slotloc == "free time")\n'
    '\t\t\t\t\t\t\t\t{\n'
    '\t\t\t\t\t\t\t\t\therechance = 0.12;\n'
    '\t\t\t\t\t\t\t\t\tif (setup.SwimwearExhibition && setup.SwimwearExhibition.is_tanning_weather())\n'
    '\t\t\t\t\t\t\t\t\t\therechance *= 1.4;\n'
    '\t\t\t\t\t\t\t\t\tif (badweather)\n'
    '\t\t\t\t\t\t\t\t\t\therechance *= 0.35;\n'
    '\t\t\t\t\t\t\t\t}\n'
    '\t\t\t\t\t\t\t\telse\n'
    '\t\t\t\t\t\t\t\t\therechance = 0.01;\n'
    '\t\t\t\t\t\t\t}'
)

LAKE_SPAWN_PATCH = (
    '\t\t\t\t\t\t\telse if (slotloc == "restroom" || slotloc == "showers")\n'
    '\t\t\t\t\t\t\t\therechance = 0.0075;\n'
    '\n'
    + LAKE_BEACH_SPAWN_BLOCK
    + LAKE_FACILITY_SPAWN_BLOCK
    + '\n'
    '\t\t\t\t\t\t\tif (loc == "UniMall" && badweather)'
)

LAKE_FACILITY_SPAWN_ANCHOR = (
    '\t\t\t\t\t\t\t\telse\n'
    '\t\t\t\t\t\t\t\t\therechance = 0.01;\n'
    '\t\t\t\t\t\t\t}\n'
    '\n'
    '\t\t\t\t\t\t\tif (loc == "UniMall" && badweather)'
)

LAKE_INTERIOR_MAP_ANCHOR = 'setup.Maps.EmersonBuilding = {'
LAKE_INTERIOR_MAP_PATCH = (
    'setup.Maps.UniversityLakeBeach = {\n'
    '    name: "University Lake Beach",\n'
    '    defaultmaptab: "Campus",\n'
    '    outside: "UniversityLakeBeach",\n'
    '    nodes: {\n'
    '        "UniversityLakeBeach": {name: "Shore"},\n'
    '        "UniversityLakeBeachRestroom": {name: "Restrooms"},\n'
    '        "UniversityLakeBeachChangingRoom": {name: "Changing Rooms"},\n'
    '    },\n'
    '};\n'
    '\n'
    + LAKE_INTERIOR_MAP_ANCHOR
)

BUSINESS_JOB_PASSAGE_ANCHOR = (
    'setup.Business.is_employee_here = function(person)\n'
    '{\n'
    '    let result = false;\n'
    '    let job = setup.Business.job_here();\n'
    '    if (job)\n'
    '    {\n'
    '        result = setup.people.is_employee(person, job);\n'
    '    }\n'
    '    return result;\n'
    '}'
)

BUSINESS_JOB_PASSAGE_PATCH = (
    'setup.Business._job_passage_cache = null;\n'
    'setup.Business.location_passage = function(job)\n'
    '{\n'
    '\tif (!job) return null;\n'
    '\tif (!this._job_passage_cache)\n'
    '\t{\n'
    '\t\tthis._job_passage_cache = {};\n'
    '\t\tfor (const name of Object.keys(Story))\n'
    '\t\t{\n'
    '\t\t\tconst tags = Story.get(name).tags;\n'
    '\t\t\tfor (const tag of tags)\n'
    '\t\t\t{\n'
    '\t\t\t\tif (tag.indexOf("job") === 0)\n'
    '\t\t\t\t{\n'
    '\t\t\t\t\tconst j = tag.substring(3).split("_").join(" ");\n'
    '\t\t\t\t\tif (!this._job_passage_cache[j])\n'
    '\t\t\t\t\t\tthis._job_passage_cache[j] = name;\n'
    '\t\t\t\t}\n'
    '\t\t\t}\n'
    '\t\t}\n'
    '\t}\n'
    '\treturn this._job_passage_cache[job] || null;\n'
    '};\n'
    '\n'
    + BUSINESS_JOB_PASSAGE_ANCHOR
)

PEOPLE_LIKELY_AT_WORK_ANCHOR = (
    'setup.people.is_employee = function(name, job)\n'
    '{\n'
    '    return this.get_job(name) == job && !this.is_removed(name);\n'
    '}'
)

PEOPLE_LIKELY_AT_WORK_PATCH = (
    PEOPLE_LIKELY_AT_WORK_ANCHOR
    + '\n\n'
    + 'setup.people.likely_at_work = function(name)\n'
    + '{\n'
    + '    const job = this.get_job(name);\n'
    + '    if (!job) return false;\n'
    + '    const pdata = this.get_person(name);\n'
    + '    if (!pdata) return false;\n'
    + '    if (pdata.type == "student" && setup.School.classes_today() && V.hour < 17)\n'
    + '        return false;\n'
    + '    const passage = setup.Business.location_passage(job);\n'
    + '    if (!passage) return false;\n'
    + '    return setup.is_open(passage);\n'
    + '}'
)

SWIMWEAR_TANNING_ACTIVE_ANCHOR = (
    '\tis_tanning_at_mall()\n'
    '\t{\n'
    '\t\treturn V.malltanning && (V.location == "UniMall" || V.lastlocpassage == "UniMall");\n'
    '\t},'
)

SWIMWEAR_TANNING_ACTIVE_PATCH = (
    '\tis_tanning_at_mall()\n'
    '\t{\n'
    '\t\treturn V.malltanning && (V.location == "UniMall" || V.lastlocpassage == "UniMall");\n'
    '\t},\n'
    '\n'
    '\tis_tanning_active()\n'
    '\t{\n'
    '\t\tif (!V.malltanning) return false;\n'
    '\t\tconst sites = ["UniMall", "UniversityLakeBeach"];\n'
    '\t\tif (sites.includes(V.location) || sites.includes(V.lastlocpassage))\n'
    '\t\t\treturn true;\n'
    '\t\treturn !!(V.tanninglocation && sites.includes(V.tanninglocation));\n'
    '\t},'
)

SWIMWEAR_LAKE_CONTEXT_ANCHOR = (
    '\t\telse if (passage == "BlodgettGym" || loc == "BlodgettGym")\n'
    '\t\t{\n'
    '\t\t\t// Walkway between gym and mall — swimwear draws some eyes but less than class.\n'
    '\t\t\texhib_mod -= 2;\n'
    '\t\t\tattention_mod += 0;\n'
    '\t\t\tlabel = "gym walkway";\n'
    '\t\t}'
)

SWIMWEAR_LAKE_CONTEXT_PATCH = (
    '\t\telse if (passage == "UniversityLakeBeach" || loc == "UniversityLakeBeach")\n'
    '\t\t{\n'
    '\t\t\tif (this.is_tanning_active())\n'
    '\t\t\t{\n'
    '\t\t\t\texhib_mod -= 5;\n'
    '\t\t\t\tattention_mod += 2;\n'
    '\t\t\t\tlabel = "tanning";\n'
    '\t\t\t\tif (V.malltanning == "swimwear" || V.malltanning == "bikini")\n'
    '\t\t\t\t{\n'
    '\t\t\t\t\texhib_mod -= 1;\n'
    '\t\t\t\t\tattention_mod += 1;\n'
    '\t\t\t\t}\n'
    '\t\t\t}\n'
    '\t\t\telse if (this.is_tanning_weather())\n'
    '\t\t\t{\n'
    '\t\t\t\texhib_mod -= 2;\n'
    '\t\t\t\tattention_mod += 1;\n'
    '\t\t\t\tlabel = "sunny lake beach";\n'
    '\t\t\t}\n'
    '\t\t\telse\n'
    '\t\t\t{\n'
    '\t\t\t\texhib_mod -= 1;\n'
    '\t\t\t\tlabel = "university lake beach";\n'
    '\t\t\t}\n'
    '\t\t}\n'
    '\t\telse if (passage == "BlodgettGym" || loc == "BlodgettGym")\n'
    '\t\t{\n'
    '\t\t\t// Walkway between gym and mall — swimwear draws some eyes but less than class.\n'
    '\t\t\texhib_mod -= 2;\n'
    '\t\t\tattention_mod += 0;\n'
    '\t\t\tlabel = "gym walkway";\n'
    '\t\t}'
)

BEACH_EVENTS_ANCHOR = "    // #region gym"
BEACH_EVENTS_BLOCK = """    // #region beach hangout
    {
        passage: "EventBeachVolleyball",
        locations: ["UniversityLakeBeach"],
        tags: ["beach hangout", "Jock", "Overachiever", "volleyball"],
        frequency: 100,
        metadata: {
            description: "%N and some others have a volleyball net up on the sand.",
            linkname: "Join the game",
        },
        season: ["spring", "autumn", "summer"],
        goodweather: true,
    },
    {
        passage: "EventBeachBadminton",
        locations: ["UniversityLakeBeach"],
        tags: ["beach hangout", "Overachiever", "Intellectual", "badminton"],
        frequency: 100,
        metadata: {
            description: "%N and a friend are playing badminton on the grass.",
            linkname: "Play badminton",
        },
        season: ["spring", "autumn", "summer"],
        goodweather: true,
    },
    {
        passage: "EventBeachFrisbee",
        locations: ["UniversityLakeBeach"],
        tags: ["beach hangout", "Jock", "Stoner", "Overachiever", "frisbee"],
        frequency: 100,
        metadata: {
            description: "%N and some others are tossing a frisbee around.",
            linkname: "Toss the frisbee",
        },
        season: ["spring", "autumn", "summer"],
        goodweather: true,
    },
    {
        passage: "EventBeachFootball",
        locations: ["UniversityLakeBeach"],
        tags: ["beach hangout", "Jock", "Overachiever", "football"],
        frequency: 100,
        metadata: {
            description: "%N and some others are tossing a football back and forth.",
            linkname: "Join the toss",
        },
        season: ["spring", "autumn", "summer"],
        goodweather: true,
    },
    {
        passage: "EventBeachSwimHangout",
        locations: ["UniversityLakeBeach"],
        tags: ["beach hangout", "Jock", "Fashionista", "Stoner", "swimming"],
        frequency: 100,
        metadata: {
            description: "%N and some others are swimming near the shore.",
            linkname: "Go for a swim",
        },
        season: ["spring", "autumn", "summer"],
        goodweather: true,
    },
    {
        passage: "EventBeachTanHangout",
        locations: ["UniversityLakeBeach"],
        tags: ["beach hangout", "Fashionista", "Overachiever", "tanning"],
        frequency: 100,
        metadata: {
            description: "%N is laid out on a towel nearby, working on a tan.",
            linkname: "Lay out nearby",
        },
        season: ["spring", "autumn", "summer"],
        goodweather: true,
        hours: [8, 19],
    },
    {
        passage: "EventBeachTalk",
        locations: ["UniversityLakeBeach"],
        tags: ["beach hangout", "Fashionista", "Student Artist", "Overachiever", "Intellectual", "Young Scientist", "Religious", "Punk", "Goth", "Stoner"],
        frequency: 100,
        metadata: {
            description: "%N and some others are hanging out by the water.",
            linkname: "Join them",
        },
        hours: [8, 19],
    },
    {
        passage: "EventBeachWalkFrisbee",
        tags: ["beach walk"],
        frequency: 10,
        hours: [8, 19],
        locations: ["UniversityLakeBeach"],
        findnpc: {type: "student", archetypes: ["Jock", "Overachiever", "Stoner"], strictarchetypes: true},
        season: ["autumn", "spring", "summer"],
        goodweather: true,
    },
    {
        passage: "EventLakeTanningStare",
        locations: ["UniversityLakeBeach"],
        tags: ["lake tanning", "body exposure"],
        frequency: 25,
        checkvar: "setup.SwimwearExhibition.swimwear_attention_score($pc, 'UniversityLakeBeach', 'UniversityLakeBeach', 'Campus') >= 5 || setup.BodyExposure.attention_score($pc, 'UniversityLakeBeach', 'UniversityLakeBeach', 'Campus') >= 5",
        findnpc: {type: "student", attractiontopc: true, attractionfrompc: true, specialok: true},
    },
    {
        passage: "EventLakeTanningCamelToe",
        locations: ["UniversityLakeBeach"],
        tags: ["lake tanning", "camel toe"],
        frequency: 20,
        checkvar: "$malltanning and $malltanning isnot 'bikini' and $malltanning isnot 'swimwear'",
        findnpc: {type: "student", attractiontopc: true, attractionfrompc: true, specialok: true},
    },
    {
        passage: "EventBeachSkinnyDipHangout",
        locations: ["UniversityLakeBeach"],
        tags: ["beach hangout", "skinnydipping", "Stoner", "Jock", "Fashionista", "Punk", "Overachiever"],
        frequency: 100,
        timeofday: "night",
        metadata: {
            description: "%N and some others are skinny dipping in the dark lake.",
            linkname: "Join them",
        },
    },
    {
        passage: "EventLakeSkinnyDipSwim",
        locations: ["UniversityLakeBeach"],
        tags: ["lake skinnydip"],
        frequency: 30,
        timeofday: "night",
        hours: [22, 23, 0, 1, 2],
        checkvar: "setup.LakeBeach.is_skinnydipping()",
    },

"""

BEACH_SKINNYDIP_EVENTS_BLOCK = """
    {
        passage: "EventBeachSkinnyDipHangout",
        locations: ["UniversityLakeBeach"],
        tags: ["beach hangout", "skinnydipping", "Stoner", "Jock", "Fashionista", "Punk", "Overachiever"],
        frequency: 100,
        timeofday: "night",
        metadata: {
            description: "%N and some others are skinny dipping in the dark lake.",
            linkname: "Join them",
        },
    },
    {
        passage: "EventLakeSkinnyDipSwim",
        locations: ["UniversityLakeBeach"],
        tags: ["lake skinnydip"],
        frequency: 30,
        timeofday: "night",
        hours: [22, 23, 0, 1, 2],
        checkvar: "setup.LakeBeach.is_skinnydipping()",
    },
"""

BEACH_OPP_NIGHT_BLOCK = """
    {
        passage: "EventOpportunityCampusTalkToFav",
        tags: ["opportunity", "UniversityLakeBeach"],
        frequency: 100,
        hours: [22, 23, 0, 1, 2],
        timeofday: "night",
        findnpc: {type: "student", favorite: true, specialok: true, knownonly: true},
        metadata:
        {
            narration: "<<anonorfullnamerelc $eventnpc>> <<print setup.LakeBeach.opportunity_phrase($eventnpc)>>. <<npcattraction $eventnpc>>",
            links: [
                {text: "Talk to <<po>>", antigate: "Shy"},
            ],
        },
        checkvar: "!$interactionstoday or typeof $interactionstoday !== 'object' or !Object.keys($interactionstoday).includes($eventnpc)"
    },
    {
        passage: "EventOpportunityCampusSuggestQuickie",
        tags: ["opportunity", "UniversityLakeBeach"],
        frequency: 80,
        hours: [22, 23, 0, 1, 2],
        timeofday: "night",
        "days since": 1,
        findnpc: {type: "student", relationships: ["partner", "open partner", "poly partner", "dominant", "fuckbuddy", "hatefuck"], allowfree: true},
        horny: 1,
        skill: ["Disinhibition", 3],
        metadata:
        {
            narration: "<<anonorfullnamerelc $eventnpc>> <<print setup.LakeBeach.opportunity_phrase($eventnpc)>>. The dark and the water make your mind wander.",
            links: [
                {text: "See if <<ps>> <<conj want>> a quickie"},
            ],
        },
        checkvar: "(!$interactionstoday or typeof $interactionstoday !== 'object' or !Object.keys($interactionstoday).includes($eventnpc)) and setup.quickie_available($eventnpc)",
    },
"""

LAKE_SKINNYDIP_GATE_OLD = (
    '                && (!event.tags.includes("lake tanning") || (setup.SwimwearExhibition.is_tanning_active() && V.tanninglocation === "UniversityLakeBeach"))'
)
LAKE_SKINNYDIP_GATE_NEW = (
    '                && (!event.tags.includes("lake tanning") || (setup.SwimwearExhibition.is_tanning_active() && V.tanninglocation === "UniversityLakeBeach"))\n'
    '                && (!event.tags.includes("lake skinnydip") || (setup.LakeBeach && setup.LakeBeach.is_skinnydipping()))'
)

CAMPUS_OPP_TALK_OLD = (
    'tags: ["opportunity", "BancroftLn", "BlodgettGym", "ChamberlainHall", "EmersonRd", '
    '"HallowellRd", "HannaRdN", "HannaRdS", "Library", "LongfellowRd", "PrescottRd", "SummitMarket", "ThoreauRd"],'
)
CAMPUS_OPP_TALK_NEW = (
    'tags: ["opportunity", "BancroftLn", "BlodgettGym", "ChamberlainHall", "EmersonRd", '
    '"HallowellRd", "HannaRdN", "HannaRdS", "Library", "LongfellowRd", "PrescottRd", "SummitMarket", '
    '"ThoreauRd", "UniversityLakeBeach"],'
)

CAMPUS_OPP_QUICKIE_OLD = (
    'tags: ["opportunity", "BancroftLn", "BlodgettGym", "ChamberlainHall", "EmersonRd", "HallowellRd", '
    '"HannaRdN", "HannaRdS", "Library", "LongfellowRd", "PrescottRd", "SummitMarket", "ThoreauRd", "UniMall", "StudentParking"],'
)
CAMPUS_OPP_QUICKIE_NEW = (
    'tags: ["opportunity", "BancroftLn", "BlodgettGym", "ChamberlainHall", "EmersonRd", "HallowellRd", '
    '"HannaRdN", "HannaRdS", "Library", "LongfellowRd", "PrescottRd", "SummitMarket", "ThoreauRd", "UniMall", '
    '"StudentParking", "UniversityLakeBeach"],'
)

BEACH_OPP_TALK_BLOCK = """
    {
        passage: "EventOpportunityCampusTalkToFav",
        tags: ["opportunity", "UniversityLakeBeach"],
        frequency: 100,
        hours: [8, 19],
        findnpc: {type: "student", favorite: true, specialok: true, knownonly: true},
        metadata:
        {
            narration: "<<anonorfullnamerelc $eventnpc>> <<print setup.LakeBeach.opportunity_phrase($eventnpc)>>. <<npcattraction $eventnpc>>",
            links: [
                {text: "Talk to <<po>>", antigate: "Shy"},
                {text: "Surprise <<po>> with a spank", passage: "EventOpportunitySpankSub", checkvar: 'setup.Relationships.relationship_with($eventnpc) == "submissive"', emoji: '🫲'},
            ],
        },
        checkvar: "!$interactionstoday or typeof $interactionstoday !== 'object' or !Object.keys($interactionstoday).includes($eventnpc)"
    },
    {
        passage: "EventOpportunityCampusTalkToFav",
        tags: ["opportunity", "UniversityLakeBeach"],
        frequency: 100,
        hours: [8, 19],
        findnpc: {type: "student", relationships: ["crush"], specialok: true},
        metadata:
        {
            narration: "<<anonorfullnamerelc $eventnpc>> <<print setup.LakeBeach.opportunity_phrase($eventnpc)>>. Your heart beats faster when you see <<po>>.",
            links: [
                {text: "Talk to <<po>>", antigate: "Shy"},
                {text: "Surprise <<po>> with a spank", passage: "EventOpportunitySpankSub", checkvar: 'setup.Relationships.relationship_with($eventnpc) == "submissive"', emoji: '🫲'},
            ],
        },
        checkvar: "!$interactionstoday or typeof $interactionstoday !== 'object' or !Object.keys($interactionstoday).includes($eventnpc)"
    },
"""

LAKE_TANNING_GATE_OLD = (
    '                && (!event.tags.includes("mall tanning") || setup.SwimwearExhibition.is_tanning_at_mall())'
)
LAKE_TANNING_GATE_NEW = (
    '                && (!event.tags.includes("mall tanning") || setup.SwimwearExhibition.is_tanning_at_mall())\n'
    '                && (!event.tags.includes("lake tanning") || (setup.SwimwearExhibition.is_tanning_active() && V.tanninglocation === "UniversityLakeBeach"))'
)

PETITIONS_JS_ANCHOR = "/* twine-user-script #55: \"petitions.js\" */"


def escape_twee(s: str) -> str:
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def next_pid(text: str) -> int:
    pids = [int(m) for m in re.findall(r'pid="(\d+)"', text)]
    return max(pids, default=900000) + 1


def build_passage(text: str) -> str:
    raw = (SRC / "university-lake.twee").read_text(encoding="utf-8")
    raw = re.sub(r"^::\s+", "", raw.strip())
    lines = raw.splitlines()
    header = lines[0].strip()
    body = "\n".join(lines[1:]).strip()
    tags_m = re.search(r"\[([^\]]*)\]", header)
    tags = tags_m.group(1) if tags_m else "nobr"
    pid = next_pid(text)
    return (
        f'<tw-passagedata pid="{pid}" name="{PASSAGE_NAME}" tags="{tags}" '
        f'position="100,100" size="100,100">{escape_twee(body)}</tw-passagedata>'
    )


def build_facility_passages(text: str) -> str:
    raw = (SRC / "university-lake-facilities.twee").read_text(encoding="utf-8")
    chunks = re.split(r"^::\s+", raw.strip(), flags=re.MULTILINE)
    blocks: list[str] = []
    pid = next_pid(text)
    for chunk in chunks:
        if not chunk.strip():
            continue
        lines = chunk.splitlines()
        header = lines[0].strip()
        name = header.split()[0]
        if name not in FACILITY_PASSAGES:
            continue
        body = "\n".join(lines[1:]).strip()
        tags_m = re.search(r"\[([^\]]*)\]", header)
        tags = tags_m.group(1) if tags_m else "nobr"
        blocks.append(
            f'<tw-passagedata pid="{pid}" name="{name}" tags="{tags}" '
            f'position="100,100" size="100,100">{escape_twee(body)}</tw-passagedata>'
        )
        pid += 1
    if len(blocks) != len(FACILITY_PASSAGES):
        raise RuntimeError(f"Expected {len(FACILITY_PASSAGES)} facility passages, got {len(blocks)}")
    return "\n".join(blocks)


def build_lake_tan_passages(text: str) -> str:
    raw = (LAKE_TAN_SRC / "lake-tanning.twee").read_text(encoding="utf-8")
    chunks = re.split(r"^::\s+", raw.strip(), flags=re.MULTILINE)
    blocks: list[str] = []
    pid = next_pid(text)
    for chunk in chunks:
        if not chunk.strip():
            continue
        lines = chunk.splitlines()
        header = lines[0].strip()
        name = header.split()[0]
        if name not in LAKE_TAN_PASSAGES:
            continue
        body = "\n".join(lines[1:]).strip()
        tags_m = re.search(r"\[([^\]]*)\]", header)
        tags = tags_m.group(1) if tags_m else "nobr"
        blocks.append(
            f'<tw-passagedata pid="{pid}" name="{name}" tags="{tags}" '
            f'position="100,100" size="100,100">{escape_twee(body)}</tw-passagedata>'
        )
        pid += 1
    if len(blocks) != len(LAKE_TAN_PASSAGES):
        raise RuntimeError(f"Expected {len(LAKE_TAN_PASSAGES)} lake tan passages, got {len(blocks)}")
    return "\n".join(blocks)


def patch_campus_node(text: str) -> str:
    if '"UniversityLakeBeach"' in text:
        text = re.sub(
            r'"UniversityLakeBeach": \{name: "University Lake Beach"[\s\S]*?\},',
            CAMPUS_NODE.rstrip(",") + ",",
            text,
            count=1,
        )
    else:
        anchor = '        "HelleborineTrilliumQuad": {name: "Helleborine-Trillium Quad", img: "loc_quad", seasonvariation: true, snowvariation: true,},'
        if anchor not in text:
            raise RuntimeError("Campus map anchor not found")
        text = text.replace(anchor, CAMPUS_NODE + "\n\n" + anchor, 1)

    if EMERSON_RD_NEW.split("exits")[1] not in text:
        if EMERSON_RD_OLD not in text:
            raise RuntimeError("EmersonRd map node not found")
        text = text.replace(EMERSON_RD_OLD, EMERSON_RD_NEW, 1)
    return text


def patch_emerson_rd(text: str) -> str:
    if EMERSON_RD_LINK.split("University Lake Beach")[0] in text:
        return text
    if EMERSON_RD_LINK_ORIG not in text:
        raise RuntimeError("EmersonRd patch anchor not found")
    return text.replace(EMERSON_RD_LINK_ORIG, EMERSON_RD_LINK, 1)


def patch_emerson_gallery(text: str) -> str:
    if GALLERY_LAKE_LINK in text:
        return text.replace(GALLERY_LAKE_LINK, GALLERY_WITHOUT_LAKE, 1)
    return text


def patch_passage(text: str) -> str:
    block = build_passage(text)
    text = re.sub(
        rf'<tw-passagedata pid="\d+" name="{PASSAGE_NAME}"[\s\S]*?</tw-passagedata>\n?',
        "",
        text,
        count=1,
    )
    return text.replace("</tw-storydata>", block + "\n</tw-storydata>", 1)


def patch_lake_tan_passages(text: str) -> str:
    for name in LAKE_TAN_PASSAGES:
        text = re.sub(
            rf'<tw-passagedata pid="\d+" name="{name}"[\s\S]*?</tw-passagedata>\n?',
            "",
            text,
        )
    block = build_lake_tan_passages(text)
    return text.replace("</tw-storydata>", block + "\n</tw-storydata>", 1)


def patch_lake_spawns_skinnydip(text: str) -> str:
    if "setup.LakeBeach.is_skinnydip_time(hour)" in text:
        return text
    if LAKE_BEACH_SPAWN_BLOCK_OLD in text:
        return text.replace(LAKE_BEACH_SPAWN_BLOCK_OLD, LAKE_BEACH_SPAWN_BLOCK, 1)
    if LAKE_BEACH_SPAWN_BLOCK in text:
        return text
    return text


def patch_lake_spawns(text: str) -> str:
    if 'loc == "UniversityLakeBeachRestroom"' in text:
        text = patch_lake_spawns_skinnydip(text)
        return text
    if LAKE_FACILITY_SPAWN_ANCHOR in text:
        new_block = (
            '\t\t\t\t\t\t\t\telse\n'
            '\t\t\t\t\t\t\t\t\therechance = 0.01;\n'
            '\t\t\t\t\t\t\t}'
            + LAKE_FACILITY_SPAWN_BLOCK
            + '\n'
            '\t\t\t\t\t\t\tif (loc == "UniMall" && badweather)'
        )
        return text.replace(LAKE_FACILITY_SPAWN_ANCHOR, new_block, 1)
    if LAKE_SPAWN_ANCHOR not in text:
        raise RuntimeError("Campus spawn anchor not found for lake beach patch")
    return text.replace(LAKE_SPAWN_ANCHOR, LAKE_SPAWN_PATCH, 1)


def patch_lake_interior_map(text: str) -> str:
    if "setup.Maps.UniversityLakeBeach" in text:
        return text
    if LAKE_INTERIOR_MAP_ANCHOR not in text:
        raise RuntimeError("UniversityLakeBeach interior map anchor not found")
    return text.replace(LAKE_INTERIOR_MAP_ANCHOR, LAKE_INTERIOR_MAP_PATCH, 1)


def patch_facility_passages(text: str) -> str:
    for name in FACILITY_PASSAGES:
        text = re.sub(
            rf'<tw-passagedata pid="\d+" name="{name}"[\s\S]*?</tw-passagedata>\n?',
            "",
            text,
        )
    block = build_facility_passages(text)
    return text.replace("</tw-storydata>", block + "\n</tw-storydata>", 1)


def patch_business_job_passage(text: str) -> str:
    if "setup.Business.location_passage" in text:
        return text
    if BUSINESS_JOB_PASSAGE_ANCHOR not in text:
        raise RuntimeError("Business.is_employee_here anchor not found")
    return text.replace(BUSINESS_JOB_PASSAGE_ANCHOR, BUSINESS_JOB_PASSAGE_PATCH, 1)


def patch_likely_at_work(text: str) -> str:
    if "setup.people.likely_at_work" in text:
        return text
    if PEOPLE_LIKELY_AT_WORK_ANCHOR not in text:
        raise RuntimeError("people.is_employee anchor not found")
    return text.replace(PEOPLE_LIKELY_AT_WORK_ANCHOR, PEOPLE_LIKELY_AT_WORK_PATCH, 1)


def build_beach_npc_passages(text: str) -> str:
    raw = (BEACH_NPC_SRC / "lake-beach-npcs.twee").read_text(encoding="utf-8")
    chunks = re.split(r"^::\s+", raw.strip(), flags=re.MULTILINE)
    blocks: list[str] = []
    pid = next_pid(text)
    for chunk in chunks:
        if not chunk.strip():
            continue
        lines = chunk.splitlines()
        header = lines[0].strip()
        name = header.split()[0]
        if name not in BEACH_NPC_PASSAGES:
            continue
        body = "\n".join(lines[1:]).strip()
        tags_m = re.search(r"\[([^\]]*)\]", header)
        tags = tags_m.group(1) if tags_m else "nobr"
        blocks.append(
            f'<tw-passagedata pid="{pid}" name="{name}" tags="{tags}" '
            f'position="100,100" size="100,100">{escape_twee(body)}</tw-passagedata>'
        )
        pid += 1
    if len(blocks) != len(BEACH_NPC_PASSAGES):
        raise RuntimeError(f"Expected {len(BEACH_NPC_PASSAGES)} beach NPC passages, got {len(blocks)}")
    return "\n".join(blocks)


def patch_lake_beach_js(text: str) -> str:
    ext = (BEACH_NPC_SRC / "lake-beach-npcs.js").read_text(encoding="utf-8").strip()
    block = LAKE_BEACH_JS_MARKER + "\n" + ext + "\n"
    if LAKE_BEACH_JS_MARKER in text:
        text = re.sub(
            re.escape(LAKE_BEACH_JS_MARKER) + r"[\s\S]*?(?=\n/\* twine-user-script #55:)",
            block.rstrip() + "\n",
            text,
            count=1,
        )
        return text
    if PETITIONS_JS_ANCHOR not in text:
        raise RuntimeError("petitions.js anchor not found for lake beach JS")
    return text.replace(PETITIONS_JS_ANCHOR, block + PETITIONS_JS_ANCHOR, 1)


BEACH_EVENT_LOCATION_PASSAGES = [
    "EventBeachVolleyball",
    "EventBeachBadminton",
    "EventBeachFrisbee",
    "EventBeachFootball",
    "EventBeachSwimHangout",
    "EventBeachTanHangout",
    "EventBeachTalk",
    "EventLakeTanningStare",
    "EventLakeTanningCamelToe",
    "EventBeachSkinnyDipHangout",
    "EventLakeSkinnyDipSwim",
]


def patch_beach_event_locations(text: str) -> str:
    for passage in BEACH_EVENT_LOCATION_PASSAGES:
        needle = f'passage: "{passage}",'
        loc_needle = f'passage: "{passage}",\n        locations:'
        if needle not in text or loc_needle in text:
            continue
        text = text.replace(
            f'passage: "{passage}",\n        tags:',
            f'passage: "{passage}",\n        locations: ["UniversityLakeBeach"],\n        tags:',
            1,
        )
    return text


def patch_beach_hangout_widget(text: str) -> str:
    name = "LakeBeachHangoutWidgets"
    raw = (BEACH_NPC_SRC / "lake-beach-npcs.twee").read_text(encoding="utf-8")
    chunks = re.split(r"^::\s+", raw.strip(), flags=re.MULTILINE)
    body = None
    tags = "widget nobr"
    for chunk in chunks:
        if not chunk.strip():
            continue
        header = chunk.splitlines()[0].strip()
        if not header.startswith(name):
            continue
        tags_m = re.search(r"\[([^\]]*)\]", header)
        if tags_m:
            tags = tags_m.group(1)
        body = "\n".join(chunk.splitlines()[1:]).strip()
        break
    if not body:
        raise RuntimeError("LakeBeachHangoutWidgets passage not found in lake-beach-npcs.twee")
    passage = (
        f'<tw-passagedata pid="{next_pid(text)}" name="{name}" tags="{tags}" '
        f'position="100,100" size="100,100">{escape_twee(body)}</tw-passagedata>'
    )
    if f'name="{name}"' in text:
        text = re.sub(
            rf'<tw-passagedata pid="\d+" name="{name}"[^>]*>[\s\S]*?</tw-passagedata>\n?',
            passage + "\n",
            text,
            count=1,
        )
        return text
    return text.replace("</tw-storydata>", passage + "\n</tw-storydata>", 1)


def patch_beach_events(text: str) -> str:
    if 'passage: "EventBeachVolleyball"' not in text:
        if BEACH_EVENTS_ANCHOR not in text:
            raise RuntimeError("Beach events anchor not found")
        text = text.replace(BEACH_EVENTS_ANCHOR, BEACH_EVENTS_BLOCK + BEACH_EVENTS_ANCHOR, 1)
    if 'passage: "EventBeachSkinnyDipHangout"' not in text:
        anchor = "    // #region gym"
        if anchor not in text:
            raise RuntimeError("Skinny dip events anchor not found")
        text = text.replace(anchor, BEACH_SKINNYDIP_EVENTS_BLOCK + anchor, 1)
    return patch_beach_event_locations(text)


def patch_beach_opportunities(text: str) -> str:
    if "setup.LakeBeach.opportunity_phrase" not in text:
        anchor = "    {\n        passage: \"EventOpportunityTownTalkToFav\","
        if anchor not in text:
            raise RuntimeError("Beach opportunity insert anchor not found")
        text = text.replace(anchor, BEACH_OPP_TALK_BLOCK + anchor, 1)
    if "The dark and the water make your mind wander" not in text:
        anchor = "    {\n        passage: \"EventOpportunityTownTalkToFav\","
        if anchor in text:
            text = text.replace(anchor, BEACH_OPP_NIGHT_BLOCK + anchor, 1)
    if CAMPUS_OPP_TALK_OLD in text:
        text = text.replace(CAMPUS_OPP_TALK_OLD, CAMPUS_OPP_TALK_NEW)
    if CAMPUS_OPP_QUICKIE_OLD in text:
        text = text.replace(CAMPUS_OPP_QUICKIE_OLD, CAMPUS_OPP_QUICKIE_NEW, 1)
    return text


def patch_lake_tanning_gate(text: str) -> str:
    if 'event.tags.includes("lake skinnydip")' in text:
        return text
    if LAKE_SKINNYDIP_GATE_OLD in text:
        return text.replace(LAKE_SKINNYDIP_GATE_OLD, LAKE_SKINNYDIP_GATE_NEW, 1)
    if 'event.tags.includes("lake tanning")' in text:
        return text
    if LAKE_TANNING_GATE_OLD not in text:
        raise RuntimeError("Mall tanning event gate anchor not found")
    return text.replace(LAKE_TANNING_GATE_OLD, LAKE_TANNING_GATE_NEW, 1)


def patch_beach_npc_passages(text: str) -> str:
    for name in BEACH_NPC_PASSAGES:
        text = re.sub(
            rf'<tw-passagedata pid="\d+" name="{name}"[\s\S]*?</tw-passagedata>\n?',
            "",
            text,
        )
    block = build_beach_npc_passages(text)
    return text.replace("</tw-storydata>", block + "\n</tw-storydata>", 1)


def patch_swimwear_exhibition(text: str) -> str:
    if "is_tanning_active()" not in text:
        if SWIMWEAR_TANNING_ACTIVE_ANCHOR not in text:
            raise RuntimeError("SwimwearExhibition.is_tanning_at_mall anchor not found")
        text = text.replace(SWIMWEAR_TANNING_ACTIVE_ANCHOR, SWIMWEAR_TANNING_ACTIVE_PATCH, 1)
    if 'passage == "UniversityLakeBeach"' not in text:
        if SWIMWEAR_LAKE_CONTEXT_ANCHOR not in text:
            raise RuntimeError("SwimwearExhibition lake context anchor not found")
        text = text.replace(SWIMWEAR_LAKE_CONTEXT_ANCHOR, SWIMWEAR_LAKE_CONTEXT_PATCH, 1)
    return text


def main() -> None:
    text = HTML.read_text(encoding="utf-8")
    text = patch_campus_node(text)
    text = patch_emerson_gallery(text)
    text = patch_emerson_rd(text)
    text = patch_business_job_passage(text)
    text = patch_likely_at_work(text)
    text = patch_lake_spawns(text)
    text = patch_lake_spawns_skinnydip(text)
    text = patch_lake_interior_map(text)
    text = patch_swimwear_exhibition(text)
    text = patch_lake_tanning_gate(text)
    text = patch_beach_events(text)
    text = patch_beach_opportunities(text)
    text = patch_lake_beach_js(text)
    text = patch_passage(text)
    text = patch_facility_passages(text)
    text = patch_lake_tan_passages(text)
    text = patch_beach_npc_passages(text)
    text = patch_beach_hangout_widget(text)
    HTML.write_text(text, encoding="utf-8")
    print(f"Patched University Lake Beach (NPCs + social + tanning + spawns) into {HTML.name}")


if __name__ == "__main__":
    main()