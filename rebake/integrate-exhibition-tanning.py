#!/usr/bin/env python3
"""Bake exhibition tanning (pose + displacement menus) into appearance-dev HTML."""

from __future__ import annotations

import re
from pathlib import Path

from rebake_target import HTML, ROOT

SRC = ROOT / "exhibition-tanning"

JS_MARKER = "/* === Exhibition Tanning (pose + displacement) === */"
POOLS_MARKER = "/* === Selfie Convo Pools === */"
CSS_MARKER = "/* === Exhibition Tanning CSS === */"
WIDGET_MARKER = 'name="TanExhibWidgets"'


def escape_twee(s: str) -> str:
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def passage_from_twee(path: Path, text: str, default_name: str) -> str:
    raw = path.read_text(encoding="utf-8").strip()
    lines = raw.splitlines()
    header = lines[0]
    body = "\n".join(lines[1:]).strip()
    tags_m = re.search(r"\[([^\]]*)\]", header)
    tags = tags_m.group(1) if tags_m else "nobr"
    name_m = re.search(r"::\s*(\S+)", header)
    name = name_m.group(1) if name_m else default_name
    pids = [int(m) for m in re.findall(r'pid="(\d+)"', text)]
    pid = max(pids) + 1 if pids else 900001
    return (
        f'<tw-passagedata pid="{pid}" name="{name}" tags="{tags}" '
        f'position="100,100" size="100,100">{escape_twee(body)}</tw-passagedata>'
    )


def widget_passage(text: str) -> str:
    raw = (SRC / "exhibition-tanning.twee").read_text(encoding="utf-8")
    return passage_from_twee(SRC / "exhibition-tanning.twee", text, "TanExhibWidgets")


def patch_tanning_js(text: str) -> str:
    ext = (SRC / "exhibition-tanning.js").read_text(encoding="utf-8").strip()
    pools = (SRC / "selfie-convo-pools.js").read_text(encoding="utf-8").strip()
    block = JS_MARKER + "\n" + POOLS_MARKER + "\n" + pools + "\n\n" + ext + "\n"

    if JS_MARKER in text:
        replacement = block.rstrip() + "\n"
        text = re.sub(
            re.escape(JS_MARKER) + r"[\s\S]*?(?=\n// Camel-toe fit)",
            lambda _m: replacement,
            text,
            count=1,
        )
        return text

    anchor = (
        "\tmaybe_invalidate_paperdoll(person)\n"
        "\t{\n"
        "\t\tif (person.equals && person.equals(V.pc)) {\n"
        "\t\t\tif (setup.ExhibitionPaperdoll && setup.ExhibitionPaperdoll.invalidate) setup.ExhibitionPaperdoll.invalidate();\n"
        "\t\t\telse if (setup.Paperdoll && setup.Paperdoll.invalidateCache) setup.Paperdoll.invalidateCache();\n"
        "\t\t}\n"
        "\t},\n"
        "};\n"
        "\n"
        "// Camel-toe fit"
    )
    if anchor not in text:
        raise RuntimeError("setup.Tanning closing anchor not found")
    return text.replace(anchor, anchor.replace("};\n\n// Camel-toe", "};\n\n" + block + "\n// Camel-toe"), 1)


def patch_apply_session(text: str) -> str:
    old = (
        "\t\tconst minutes = options.session_minutes != null\n"
        "\t\t\t? options.session_minutes\n"
        "\t\t\t: this.session_minutes_from_mode(V.malltanning);\n"
        "\t\tconst exposure = this.SET_EXPOSURE[set_id] || 1.0;"
    )
    new = (
        "\t\tconst minutes = options.session_minutes != null\n"
        "\t\t\t? options.session_minutes\n"
        "\t\t\t: (this.session_minutes_from_vars ? this.session_minutes_from_vars() : this.session_minutes_from_mode(V.malltanning));\n"
        "\t\tconst dispBonus = this.exposure_bonus_for_displacements ? this.exposure_bonus_for_displacements(person) : 0;\n"
        "\t\tconst exposure = (this.SET_EXPOSURE[set_id] || 1.0) * (1 + dispBonus);"
    )
    if old in text:
        return text.replace(old, new, 1)
    if "exposure_bonus_for_displacements" in text:
        return text
    raise RuntimeError("apply_session patch target not found")


def patch_restore_after_tan(text: str) -> str:
    old = (
        "\trestore_after_tan(person)\n"
        "\t{\n"
        "\t\tif (!person || !V.pretanningclothes || !V.pretanningclothes.length) return;\n"
        "\t\tperson.swap_all_clothing_to_closet();\n"
        "\t\tperson.wear_all_clothes(V.pretanningclothes);\n"
        "\t\tdelete V.pretanningclothes;\n"
        "\t\tthis.maybe_invalidate_paperdoll(person);\n"
        "\t},"
    )
    new = (
        "\trestore_after_tan(person)\n"
        "\t{\n"
        "\t\tif (this.restore_displacement_snapshot) this.restore_displacement_snapshot(person);\n"
        "\t\tif (!person || !V.pretanningclothes || !V.pretanningclothes.length) return;\n"
        "\t\tperson.swap_all_clothing_to_closet();\n"
        "\t\tperson.wear_all_clothes(V.pretanningclothes);\n"
        "\t\tdelete V.pretanningclothes;\n"
		"\t\tdelete V.tanningduration;\n"
		"\t\tdelete V.tanexhibexpanded;\n"
		"\t\tdelete V.tanninglocation;\n"
		"\t\tif (this.clear_tan_towel_guests) this.clear_tan_towel_guests();\n"
		"\t\tdelete V.tanBackpackStash;\n"
		"\t\tthis.maybe_invalidate_paperdoll(person);\n"
		"\t},"
    )
    if old in text:
        return text.replace(old, new, 1)
    if "restore_displacement_snapshot" in text:
        add_loc = (
            "\t\tdelete V.tanexhibexpanded;\n"
            "\t\tthis.maybe_invalidate_paperdoll(person);"
        )
        add_loc_with = (
            "\t\tdelete V.tanexhibexpanded;\n"
            "\t\tdelete V.tanninglocation;\n"
            "\t\tif (this.clear_tan_towel_guests) this.clear_tan_towel_guests();\n"
            "\t\tthis.maybe_invalidate_paperdoll(person);"
        )
        if add_loc in text and "delete V.tanninglocation" not in text:
            return text.replace(add_loc, add_loc_with, 1)
        return text
    raise RuntimeError("restore_after_tan patch target not found")


def patch_session_minutes(text: str) -> str:
    old = '\tSESSION_MINUTES: {\n\t\tclothed: 30,\n\t\tswimwear: 30,\n\t\tbikini: 45,\n\t},'
    new = '\tSESSION_MINUTES: {\n\t\tclothed: 30,\n\t\tswimwear: 30,\n\t\tbikini: 45,\n\t\tquick: 15,\n\t},'
    if old in text:
        return text.replace(old, new, 1)
    if "quick: 15" in text:
        return text
    raise RuntimeError("SESSION_MINUTES patch target not found")


def patch_tan_menu(text: str) -> str:
    # Quick 15-minute clothed option after standard clothed link
    clothed_quick = (
        '&lt;&lt;link _link&gt;&gt;&lt;&lt;set $malltanning to &quot;clothed&quot;&gt;&gt;&lt;&lt;run setup.Tanning.save_outfit($pc, &quot;clothed&quot;)&gt;&gt;&lt;&lt;unset $malltaneventfired&gt;&gt;&lt;&lt;advtime 30 Relaxation&gt;&gt;&lt;&lt;run setup.Tanning.apply_session($pc)&gt;&gt;&lt;&lt;/link&gt;&gt; &lt;&lt;dtime 30&gt;&gt; &lt;&lt;dalterneed Relaxation 40&gt;&gt;\n'
        '&lt;br&gt;'
    )
    clothed_with_quick = (
        '&lt;&lt;link _link&gt;&gt;&lt;&lt;set $malltanning to &quot;clothed&quot;&gt;&gt;&lt;&lt;run setup.Tanning.init_exhib_session()&gt;&gt;&lt;&lt;run setup.Tanning.save_outfit($pc, &quot;clothed&quot;)&gt;&gt;&lt;&lt;unset $malltaneventfired&gt;&gt;&lt;&lt;advtime 30 Relaxation&gt;&gt;&lt;&lt;run setup.Tanning.apply_session($pc)&gt;&gt;&lt;&lt;/link&gt;&gt; &lt;&lt;dtime 30&gt;&gt; &lt;&lt;dalterneed Relaxation 40&gt;&gt;\n'
        '&lt;br&gt;\n'
        '&lt;&lt;set _qlink to {text: &quot;Quick sun session in your clothes&quot;, link: &quot;UniMallTanClothed&quot;, emoji: &#39;🧴&#39;}&gt;&gt;\n'
        '&lt;&lt;link _qlink&gt;&gt;&lt;&lt;set $malltanning to &quot;clothed&quot;&gt;&gt;&lt;&lt;set $tanningduration to 15&gt;&gt;&lt;&lt;run setup.Tanning.init_exhib_session()&gt;&gt;&lt;&lt;run setup.Tanning.save_outfit($pc, &quot;clothed&quot;)&gt;&gt;&lt;&lt;unset $malltaneventfired&gt;&gt;&lt;&lt;advtime 15 Relaxation&gt;&gt;&lt;&lt;run setup.Tanning.apply_session($pc, {session_minutes: 15})&gt;&gt;&lt;&lt;/link&gt;&gt; &lt;&lt;dtime 15&gt;&gt; &lt;&lt;dalterneed Relaxation 25&gt;&gt;\n'
        '&lt;br&gt;'
    )
    if clothed_with_quick not in text:
        if clothed_quick not in text:
            raise RuntimeError("UniMallTanMenu clothed link not found")
        text = text.replace(clothed_quick, clothed_with_quick, 1)
    else:
        clothed_no_init = (
            '&lt;&lt;link _link&gt;&gt;&lt;&lt;set $malltanning to &quot;clothed&quot;&gt;&gt;&lt;&lt;run setup.Tanning.save_outfit($pc, &quot;clothed&quot;)&gt;&gt;'
        )
        clothed_init = (
            '&lt;&lt;link _link&gt;&gt;&lt;&lt;set $malltanning to &quot;clothed&quot;&gt;&gt;&lt;&lt;run setup.Tanning.init_exhib_session()&gt;&gt;&lt;&lt;run setup.Tanning.save_outfit($pc, &quot;clothed&quot;)&gt;&gt;'
        )
        if clothed_no_init in text and clothed_init not in text:
            text = text.replace(clothed_no_init, clothed_init)
        quick_no_init = (
            '&lt;&lt;set $tanningduration to 15&gt;&gt;&lt;&lt;run setup.Tanning.save_outfit($pc, &quot;clothed&quot;)&gt;&gt;'
        )
        quick_init = (
            '&lt;&lt;set $tanningduration to 15&gt;&gt;&lt;&lt;run setup.Tanning.init_exhib_session()&gt;&gt;&lt;&lt;run setup.Tanning.save_outfit($pc, &quot;clothed&quot;)&gt;&gt;'
        )
        if quick_no_init in text and quick_init not in text:
            text = text.replace(quick_no_init, quick_init)

    swim_no_init = (
        '&lt;&lt;link _link&gt;&gt;&lt;&lt;set $malltanning to &quot;swimwear&quot;&gt;&gt;&lt;&lt;run setup.Tanning.save_outfit($pc, &quot;swimwear&quot;)&gt;&gt;'
    )
    swim_init = (
        '&lt;&lt;link _link&gt;&gt;&lt;&lt;set $malltanning to &quot;swimwear&quot;&gt;&gt;&lt;&lt;run setup.Tanning.init_exhib_session()&gt;&gt;&lt;&lt;run setup.Tanning.save_outfit($pc, &quot;swimwear&quot;)&gt;&gt;'
    )
    if swim_no_init in text:
        text = text.replace(swim_no_init, swim_init)

    bikini_no_init = (
        '&lt;&lt;link _link&gt;&gt;&lt;&lt;set $malltanning to &quot;bikini&quot;&gt;&gt;&lt;&lt;run setup.Tanning.save_outfit($pc, &quot;bikini&quot;)&gt;&gt;'
    )
    bikini_init = (
        '&lt;&lt;link _link&gt;&gt;&lt;&lt;set $malltanning to &quot;bikini&quot;&gt;&gt;&lt;&lt;run setup.Tanning.init_exhib_session()&gt;&gt;&lt;&lt;run setup.Tanning.save_outfit($pc, &quot;bikini&quot;)&gt;&gt;'
    )
    if bikini_no_init in text:
        text = text.replace(bikini_no_init, bikini_init)

    swim_standard = (
        '&lt;&lt;link _link&gt;&gt;&lt;&lt;set $malltanning to &quot;swimwear&quot;&gt;&gt;&lt;&lt;run setup.Tanning.init_exhib_session()&gt;&gt;&lt;&lt;run setup.Tanning.save_outfit($pc, &quot;swimwear&quot;)&gt;&gt;&lt;&lt;unset $malltaneventfired&gt;&gt;&lt;&lt;advtime 30 Relaxation&gt;&gt;&lt;&lt;run setup.Tanning.apply_session($pc)&gt;&gt;&lt;&lt;/link&gt;&gt; &lt;&lt;dtime 30&gt;&gt; &lt;&lt;dalterneed Relaxation 50&gt;&gt;'
    )
    swim_with_quick = swim_standard + (
        '\n'
        '        &lt;br&gt;\n'
        '        &lt;&lt;set _qlink to {text: &quot;Quick tan in your swimwear&quot;, link: &quot;UniMallTanSwimwear&quot;, emoji: &#39;👙&#39;}&gt;&gt;\n'
        '        &lt;&lt;link _qlink&gt;&gt;&lt;&lt;set $malltanning to &quot;swimwear&quot;&gt;&gt;&lt;&lt;set $tanningduration to 15&gt;&gt;&lt;&lt;run setup.Tanning.init_exhib_session()&gt;&gt;&lt;&lt;run setup.Tanning.save_outfit($pc, &quot;swimwear&quot;)&gt;&gt;&lt;&lt;unset $malltaneventfired&gt;&gt;&lt;&lt;advtime 15 Relaxation&gt;&gt;&lt;&lt;run setup.Tanning.apply_session($pc, {session_minutes: 15})&gt;&gt;&lt;&lt;/link&gt;&gt; &lt;&lt;dtime 15&gt;&gt; &lt;&lt;dalterneed Relaxation 35&gt;&gt;'
    )
    if swim_with_quick not in text and swim_standard in text:
        text = text.replace(swim_standard, swim_with_quick, 1)

    bikini_standard = (
        '&lt;&lt;link _link&gt;&gt;&lt;&lt;set $malltanning to &quot;bikini&quot;&gt;&gt;&lt;&lt;run setup.Tanning.init_exhib_session()&gt;&gt;&lt;&lt;run setup.Tanning.save_outfit($pc, &quot;bikini&quot;)&gt;&gt;&lt;&lt;unset $malltaneventfired&gt;&gt;&lt;&lt;advtime 45 Relaxation Attention&gt;&gt;&lt;&lt;run setup.Tanning.apply_session($pc)&gt;&gt;&lt;&lt;/link&gt;&gt; &lt;&lt;dtime 45&gt;&gt; &lt;&lt;dalterneed Relaxation 60&gt;&gt; &lt;&lt;dalterneed Attention 25&gt;&gt; &lt;&lt;skill Exhibitionism _exhibreq&gt;&gt; &lt;&lt;raiseskill Exhibitionism 1&gt;&gt;'
    )
    bikini_with_quick = bikini_standard + (
        '\n'
        '            &lt;br&gt;\n'
        '            &lt;&lt;set _qlink to {text: &quot;Quick lay-out in your bikini&quot;, link: &quot;UniMallTanBikini&quot;, emoji: &#39;☀️&#39;}&gt;&gt;\n'
        '            &lt;&lt;link _qlink&gt;&gt;&lt;&lt;set $malltanning to &quot;bikini&quot;&gt;&gt;&lt;&lt;set $tanningduration to 15&gt;&gt;&lt;&lt;run setup.Tanning.init_exhib_session()&gt;&gt;&lt;&lt;run setup.Tanning.save_outfit($pc, &quot;bikini&quot;)&gt;&gt;&lt;&lt;unset $malltaneventfired&gt;&gt;&lt;&lt;advtime 15 Relaxation Attention&gt;&gt;&lt;&lt;run setup.Tanning.apply_session($pc, {session_minutes: 15})&gt;&gt;&lt;&lt;/link&gt;&gt; &lt;&lt;dtime 15&gt;&gt; &lt;&lt;dalterneed Relaxation 40&gt;&gt; &lt;&lt;dalterneed Attention 15&gt;&gt; &lt;&lt;skill Exhibitionism _exhibreq&gt;&gt; &lt;&lt;raiseskill Exhibitionism 1&gt;&gt;'
    )
    if bikini_with_quick not in text and bikini_standard in text:
        text = text.replace(bikini_standard, bikini_with_quick, 1)

    never_mind = (
        '&lt;&lt;link &quot;Never mind&quot; UniMall&gt;&gt;'
        '&lt;&lt;run setup.Tanning.abort_tan_menu($pc)&gt;&gt;'
        '&lt;&lt;advtime 1&gt;&gt;'
        '&lt;&lt;/link&gt;&gt;'
    )
    never_mind_old = '&lt;&lt;link &quot;Never mind&quot; UniMall&gt;&gt;&lt;&lt;unset $malltanning&gt;&gt;&lt;&lt;/link&gt;&gt;'
    exhib_note = (
        '&lt;&lt;if setup.Tanning.can_exhibition_tan($pc)&gt;&gt;\n'
        '    &lt;br&gt;&lt;br&gt;\n'
        '    &lt;span class=&quot;notice&quot;&gt;While laying out you can shift pose and adjust how your clothes sit — back and stomach show different options (nipples face-up, ass face-down, camel toe with legs apart on your back, and so on). Tan lines follow whatever you keep on.&lt;/span&gt; (Need &lt;&lt;skill Exhibitionism setup.Tanning.EXHIB_TANNING_MIN&gt;&gt;)\n'
        '&lt;&lt;/if&gt;&gt;\n'
        '&lt;br&gt;\n'
        + never_mind
    )
    old_exhib_note = (
        '&lt;&lt;if setup.Tanning.can_exhibition_tan($pc)&gt;&gt;\n'
        '    &lt;br&gt;&lt;br&gt;\n'
        '    &lt;span class=&quot;notice&quot;&gt;While laying out in swimwear you can adjust how your suit sits — pose and displacement options appear on the tanning screen.&lt;/span&gt; (Need &lt;&lt;skill Exhibitionism setup.Tanning.EXHIB_TANNING_MIN&gt;&gt;)\n'
        '&lt;&lt;/if&gt;&gt;\n'
        '&lt;br&gt;\n'
        + never_mind
    )
    if old_exhib_note in text:
        text = text.replace(old_exhib_note, exhib_note, 1)
    else:
        menu_never = (
            '&lt;br&gt;\n'
            + never_mind
            + '&lt;/tw-passagedata&gt;&lt;tw-passagedata pid=&quot;5255&quot; name=&quot;UniMallTanClothed&quot;'
        )
        menu_with_note = (
            '&lt;&lt;if setup.Tanning.can_exhibition_tan($pc)&gt;&gt;\n'
            '    &lt;br&gt;&lt;br&gt;\n'
            '    &lt;span class=&quot;notice&quot;&gt;While laying out you can shift pose and adjust how your clothes sit — back and stomach show different options (nipples face-up, ass face-down, camel toe with legs apart on your back, and so on). Tan lines follow whatever you keep on.&lt;/span&gt; (Need &lt;&lt;skill Exhibitionism setup.Tanning.EXHIB_TANNING_MIN&gt;&gt;)\n'
            '&lt;&lt;/if&gt;&gt;\n'
            '&lt;br&gt;\n'
            + never_mind
            + '&lt;/tw-passagedata&gt;&lt;tw-passagedata pid=&quot;5255&quot; name=&quot;UniMallTanClothed&quot;'
        )
        if menu_never in text and 'shift pose and adjust' not in text:
            text = text.replace(menu_never, menu_with_note, 1)

    dup_quick = (
        '&lt;br&gt;\n'
        '&lt;&lt;set _qlink to {text: &quot;Quick sun session in your clothes&quot;, link: &quot;UniMallTanClothed&quot;, emoji: &#39;🧴&#39;}&gt;&gt;\n'
        '&lt;&lt;link _qlink&gt;&gt;&lt;&lt;set $malltanning to &quot;clothed&quot;&gt;&gt;&lt;&lt;set $tanningduration to 15&gt;&gt;&lt;&lt;run setup.Tanning.save_outfit($pc, &quot;clothed&quot;)&gt;&gt;&lt;&lt;unset $malltaneventfired&gt;&gt;&lt;&lt;advtime 15 Relaxation&gt;&gt;&lt;&lt;run setup.Tanning.apply_session($pc, {session_minutes: 15})&gt;&gt;&lt;&lt;/link&gt;&gt; &lt;&lt;dtime 15&gt;&gt; &lt;&lt;dalterneed Relaxation 25&gt;&gt;\n'
        '&lt;br&gt;'
    )
    if text.count(dup_quick) >= 1:
        text = text.replace(dup_quick, '', 1)

    # Swimsuit change options on tanning entry menu (before wearing-swimwear branch).
    menu_open = (
        'You pick a sunny patch of grass on the University Mall. How do you want to lay out?\n'
        '&lt;br&gt;&lt;br&gt;'
    )
    menu_open_flash = (
        'You pick a sunny patch of grass on the University Mall. How do you want to lay out?\n'
        '&lt;&lt;tanswimsuitchangeflash&gt;&gt;\n'
        '&lt;br&gt;&lt;br&gt;'
    )
    if menu_open in text and menu_open_flash not in text:
        text = text.replace(menu_open, menu_open_flash, 1)

    swim_change_anchor = (
        '&lt;&lt;link _qlink&gt;&gt;&lt;&lt;set $malltanning to &quot;clothed&quot;&gt;&gt;&lt;&lt;set $tanningduration to 15&gt;&gt;'
        '&lt;&lt;run setup.Tanning.init_exhib_session()&gt;&gt;&lt;&lt;run setup.Tanning.save_outfit($pc, &quot;clothed&quot;)&gt;&gt;'
        '&lt;&lt;unset $malltaneventfired&gt;&gt;&lt;&lt;advtime 15 Relaxation&gt;&gt;'
        '&lt;&lt;run setup.Tanning.apply_session($pc, {session_minutes: 15})&gt;&gt;&lt;&lt;/link&gt;&gt; '
        '&lt;&lt;dtime 15&gt;&gt; &lt;&lt;dalterneed Relaxation 25&gt;&gt;\n'
        '&lt;br&gt;\n'
        '&lt;&lt;if $pc.wearing_some_swimwear()&gt;&gt;'
    )
    swim_change_patch = swim_change_anchor.replace(
        '&lt;br&gt;\n'
        '&lt;&lt;if $pc.wearing_some_swimwear()&gt;&gt;',
        '&lt;br&gt;\n'
        '&lt;&lt;tanswimsuitchangemenu&gt;&gt;\n'
        '&lt;&lt;if $pc.wearing_some_swimwear()&gt;&gt;',
        1,
    )
    if swim_change_anchor in text and 'tanswimsuitchangemenu' not in text.split(swim_change_anchor)[1][:200]:
        text = text.replace(swim_change_anchor, swim_change_patch, 1)

    saved_swim = (
        '&lt;&lt;link _link&gt;&gt;&lt;&lt;run setup.Tanning.wear_saved_outfit($pc)&gt;&gt;&lt;&lt;set $malltanning to $lastmalltanning&gt;&gt;&lt;&lt;unset $malltaneventfired&gt;&gt;&lt;&lt;advtime 30 Relaxation&gt;&gt;&lt;&lt;run setup.Tanning.apply_session($pc)&gt;&gt;&lt;&lt;/link&gt;&gt;'
    )
    saved_swim_init = (
        '&lt;&lt;link _link&gt;&gt;&lt;&lt;run setup.Tanning.wear_saved_outfit($pc)&gt;&gt;&lt;&lt;set $malltanning to $lastmalltanning&gt;&gt;&lt;&lt;run setup.Tanning.init_exhib_session()&gt;&gt;&lt;&lt;unset $malltaneventfired&gt;&gt;&lt;&lt;advtime 30 Relaxation&gt;&gt;&lt;&lt;run setup.Tanning.apply_session($pc)&gt;&gt;&lt;&lt;/link&gt;&gt;'
    )
    if saved_swim in text and saved_swim_init not in text:
        text = text.replace(saved_swim, saved_swim_init, 1)

    saved_bikini = (
        '&lt;&lt;link _link&gt;&gt;&lt;&lt;run setup.Tanning.wear_saved_outfit($pc)&gt;&gt;&lt;&lt;set $malltanning to $lastmalltanning&gt;&gt;&lt;&lt;unset $malltaneventfired&gt;&gt;&lt;&lt;advtime 45 Relaxation Attention&gt;&gt;&lt;&lt;run setup.Tanning.apply_session($pc)&gt;&gt;&lt;&lt;/link&gt;&gt;'
    )
    saved_bikini_init = (
        '&lt;&lt;link _link&gt;&gt;&lt;&lt;run setup.Tanning.wear_saved_outfit($pc)&gt;&gt;&lt;&lt;set $malltanning to $lastmalltanning&gt;&gt;&lt;&lt;run setup.Tanning.init_exhib_session()&gt;&gt;&lt;&lt;unset $malltaneventfired&gt;&gt;&lt;&lt;advtime 45 Relaxation Attention&gt;&gt;&lt;&lt;run setup.Tanning.apply_session($pc)&gt;&gt;&lt;&lt;/link&gt;&gt;'
    )
    if saved_bikini in text and saved_bikini_init not in text:
        text = text.replace(saved_bikini, saved_bikini_init, 1)

    if never_mind_old in text:
        text = text.replace(never_mind_old, never_mind)

    return text


def patch_unimall_tan_entry(text: str) -> str:
    old = (
        '&lt;&lt;set _link to {text: &quot;Lay out and tan&quot;, link: &quot;UniMallTanMenu&quot;, emoji: &#39;☀️&#39;}&gt;&gt;\n'
        '    &lt;&lt;link _link&gt;&gt;&lt;&lt;/link&gt;&gt; &lt;&lt;dtime 15&gt;&gt;'
    )
    new = (
        '&lt;&lt;set _link to {text: &quot;Lay out and tan&quot;, link: &quot;UniMallTanMenu&quot;, emoji: &#39;☀️&#39;}&gt;&gt;\n'
        '    &lt;&lt;link _link&gt;&gt;&lt;&lt;set $tanninglocation to &quot;UniMall&quot;&gt;&gt;&lt;&lt;/link&gt;&gt; &lt;&lt;dtime 15&gt;&gt;'
    )
    if old in text:
        return text.replace(old, new, 1)
    return text


def patch_tan_passages(text: str) -> str:
    exhib_block = (
        '&lt;&lt;if setup.Tanning.can_exhibition_tan($pc)&gt;&gt;\n'
        '    &lt;&lt;tandexhibposemenu&gt;&gt;\n'
        '    &lt;&lt;tandexhibmenu&gt;&gt;\n'
        '    &lt;&lt;tandexhibwitnessmenu&gt;&gt;\n'
        '    &lt;&lt;tandexhibflavor&gt;&gt;\n'
        '&lt;&lt;/if&gt;&gt;\n'
        '&lt;br&gt;&lt;br&gt;'
    )
    exhib_block_old = (
        '&lt;&lt;if setup.Tanning.can_exhibition_tan($pc)&gt;&gt;\n'
        '    &lt;&lt;tandexhibposemenu&gt;&gt;\n'
        '    &lt;&lt;tandexhibmenu&gt;&gt;\n'
        '    &lt;&lt;tandexhibflavor&gt;&gt;\n'
        '&lt;&lt;/if&gt;&gt;\n'
        '&lt;br&gt;&lt;br&gt;'
    )
    exhib_block_partner_old = (
        '&lt;&lt;if setup.Tanning.can_exhibition_tan($pc)&gt;&gt;\n'
        '    &lt;&lt;tandexhibposemenu&gt;&gt;\n'
        '    &lt;&lt;tandexhibmenu&gt;&gt;\n'
        '    &lt;&lt;tandexhibwitnessmenu&gt;&gt;\n'
        '    &lt;&lt;tandexhibflavor&gt;&gt;\n'
        '&lt;&lt;/if&gt;&gt;\n'
        '&lt;br&gt;&lt;br&gt;'
    )
    # passtime is inside tandexhibposemenu once a pose is chosen

    # Insert exhibition widgets before alterneed in clothed/swimwear/bikini passages
    patterns = [
        (
            '&lt;&lt;alterneed Relaxation 40&gt;&gt;\n'
            '&lt;&lt;link &quot;Done tanning&quot; UniMall&gt;&gt;&lt;&lt;run setup.Tanning.restore_after_tan($pc)&gt;&gt;&lt;&lt;unset $malltanning&gt;&gt;&lt;&lt;unset $malltaneventfired&gt;&gt;&lt;&lt;/link&gt;&gt;',
            exhib_block
            + '&lt;&lt;alterneed Relaxation 40&gt;&gt;\n'
            '&lt;&lt;link &quot;Done tanning&quot; UniMall&gt;&gt;&lt;&lt;run setup.Tanning.restore_after_tan($pc)&gt;&gt;&lt;&lt;unset $malltanning&gt;&gt;&lt;&lt;unset $malltaneventfired&gt;&gt;&lt;&lt;/link&gt;&gt;',
        ),
        (
            '&lt;&lt;alterneed Relaxation 50&gt;&gt;\n'
            '&lt;&lt;if _attn gte 5&gt;&gt;&lt;&lt;raiseskill Exhibitionism 1&gt;&gt;&lt;&lt;/if&gt;&gt;\n'
            '&lt;&lt;link &quot;Done tanning&quot; UniMall&gt;&gt;',
            exhib_block
            + '&lt;&lt;alterneed Relaxation 50&gt;&gt;\n'
            '&lt;&lt;if _attn gte 5&gt;&gt;&lt;&lt;raiseskill Exhibitionism 1&gt;&gt;&lt;&lt;/if&gt;&gt;\n'
            '&lt;&lt;link &quot;Done tanning&quot; UniMall&gt;&gt;',
        ),
        (
            '&lt;&lt;alterneed Relaxation 60&gt;&gt;\n'
            '&lt;&lt;raiseskill Exhibitionism 1&gt;&gt;\n'
            '&lt;&lt;link &quot;Done tanning&quot; UniMall&gt;&gt;',
            exhib_block
            + '&lt;&lt;alterneed Relaxation 60&gt;&gt;\n'
            '&lt;&lt;raiseskill Exhibitionism 1&gt;&gt;\n'
            '&lt;&lt;link &quot;Done tanning&quot; UniMall&gt;&gt;',
        ),
    ]
    for old, new in patterns:
        if old in text and 'tandexhibposemenu' not in text.split(old)[0][-500:]:
            text = text.replace(old, new, 1)
    if exhib_block_old in text and "tandexhibwitnessmenu" not in text:
        text = text.replace(exhib_block_old, exhib_block)
    return text


SKIP_OUT_ABOUT_PASSAGES = {
    "OutAboutExposure",
    "HangoutPartnerAdjust",
}


def _inject_out_about_offer(segment: str) -> str:
    legacy = "&lt;&lt;hangoutpartneradjustoffer&gt;&gt;\n"
    if legacy in segment:
        segment = segment.replace(legacy, "")
    offer = "&lt;&lt;outaboutexposureoffer&gt;&gt;\n"
    if offer in segment:
        return segment
    if "&lt;&lt;endhangout&gt;&gt;" in segment:
        return segment
    next_link = re.search(
        r"(&lt;&lt;link &quot;Next&quot;&gt;&gt;&lt;&lt;advtime[^&]*&gt;&gt;(?:&lt;&lt;[^&]*&gt;&gt;)*&lt;&lt;gotonexthangoutevent&gt;&gt;)",
        segment,
    )
    if next_link:
        return segment.replace(next_link.group(1), offer + next_link.group(1), 1)
    cont_link = re.search(r"(&lt;&lt;link &quot;Continue&quot;[^&]*&gt;&gt;)", segment)
    if cont_link:
        return segment.replace(cont_link.group(1), offer + cont_link.group(1), 1)
    if "&lt;&lt;link " in segment or "&lt;&lt;continuelink&gt;&gt;" in segment:
        return segment + "\n<br>\n" + offer
    return segment


def patch_out_about_exposure(text: str) -> str:
    """Add outfit/exposure adjust to all hangout and date event passages."""
    passage = passage_from_twee(SRC / "out-about-exposure.twee", text, "OutAboutExposure")
    if 'name="OutAboutExposure"' not in text:
        text = text.replace("</tw-storydata>", passage + "\n</tw-storydata>", 1)

    def repl(match: re.Match[str]) -> str:
        attrs = match.group(1)
        body = match.group(2)
        name_m = re.search(r'name="([^"]+)"', attrs)
        if not name_m:
            return match.group(0)
        name = name_m.group(1)
        if not name.startswith("EventHangout") or name in SKIP_OUT_ABOUT_PASSAGES:
            return match.group(0)
        return f"<tw-passagedata{attrs}>{_inject_out_about_offer(body)}</tw-passagedata>"

    return re.sub(
        r'<tw-passagedata([^>]*name="EventHangout[^"]*"[^>]*)>(.*?)</tw-passagedata>',
        repl,
        text,
        flags=re.DOTALL,
    )


def patch_tan_swim_wardrobe(text: str) -> str:
    passage = passage_from_twee(SRC / "tan-swim-wardrobe.twee", text, "TanSwimWardrobe")
    if 'name="TanSwimWardrobe"' in text:
        text = re.sub(
            r'<tw-passagedata pid="\d+" name="TanSwimWardrobe"[\s\S]*?</tw-passagedata>',
            passage,
            text,
            count=1,
        )
    else:
        text = text.replace("</tw-storydata>", passage + "\n</tw-storydata>", 1)
    return text


def patch_tan_phone_menu(text: str) -> str:
    passage = passage_from_twee(SRC / "tan-phone-menu.twee", text, "TanPhoneMenu")
    if 'name="TanPhoneMenu"' in text:
        text = re.sub(
            r'<tw-passagedata pid="\d+" name="TanPhoneMenu"[\s\S]*?</tw-passagedata>',
            passage,
            text,
            count=1,
        )
    else:
        text = text.replace("</tw-storydata>", passage + "\n</tw-storydata>", 1)
    return text


def patch_tan_selfie_passage(text: str, name: str, twee_file: str) -> str:
    passage = passage_from_twee(SRC / twee_file, text, name)
    if f'name="{name}"' in text:
        text = re.sub(
            rf'<tw-passagedata pid="\d+" name="{name}"[\s\S]*?</tw-passagedata>',
            passage,
            text,
            count=1,
        )
    else:
        text = text.replace("</tw-storydata>", passage + "\n</tw-storydata>", 1)
    return text


def patch_css(text: str) -> str:
    ext = (SRC / "exhibition-tanning.css").read_text(encoding="utf-8").strip()
    block = CSS_MARKER + "\n" + ext + "\n"

    if CSS_MARKER in text:
        text = re.sub(
            re.escape(CSS_MARKER) + r"[\s\S]*?(?=\n#title \{)",
            block.rstrip() + "\n\n",
            text,
            count=1,
        )
        return text

    anchor = "\n#title {\n    text-align: left;"
    if anchor not in text:
        raise RuntimeError("CSS anchor not found for exhibition tanning styles")
    return text.replace(anchor, "\n" + block + anchor, 1)


def patch_widgets(text: str) -> str:
    passage = widget_passage(text)
    if WIDGET_MARKER in text:
        text = re.sub(
            r'<tw-passagedata pid="\d+" name="TanExhibWidgets"[\s\S]*?</tw-passagedata>',
            passage,
            text,
            count=1,
        )
    else:
        text = text.replace("</tw-storydata>", passage + "\n</tw-storydata>", 1)
    return text


def patch_phone_selfie_system(text: str) -> str:
    """Wire unified selfie convo into main PhoneText dialog."""

    dialog_close_old = (
        "        delete V.phoneconvo;\n"
        "        delete V.npctextresponse;\n"
        "    });"
    )
    dialog_close_new = (
        "        delete V.phoneconvo;\n"
        "        delete V.npctextresponse;\n"
        "        delete V.phoneselfiesession;\n"
        "        delete V.phoneselfieconvoactive;\n"
        "        delete V.phoneselfietarget;\n"
        "        delete V.phoneselfieactive;\n"
        "    });"
    )
    if dialog_close_old in text:
        phone_script = text.split('name="PhoneText"', 1)[1].split(":dialogclosed", 1)[1].split("});", 1)[0]
        if "delete V.phoneselfiesession" not in phone_script:
            text = text.replace(dialog_close_old, dialog_close_new, 1)

    phone_text_marker = 'name="PhoneText" tags="dialog noevents phone nobr"'
    if phone_text_marker in text:
        phone_text = text.split(phone_text_marker, 1)[1].split("</tw-passagedata>", 1)[0]
        convo_anchor = "                &lt;&lt;if $phoneresponsemenu&gt;&gt;"
        if convo_anchor in phone_text and "phoneselfieconvomenu" not in phone_text:
            convo_branch = (
                "                &lt;&lt;if $phoneselfieconvoactive and $phoneselfiesession&gt;&gt;\n"
                "\n"
                "                    /* #region SELFIE CONVO LOOP */\n"
                "                    &lt;&lt;phoneselfieconvomenu&gt;&gt;\n"
                "\n"
                "                &lt;&lt;elseif $phoneresponsemenu&gt;&gt;"
            )
            patched = phone_text.replace(convo_anchor, convo_branch, 1)
            text = text.replace(phone_text_marker + phone_text, phone_text_marker + patched, 1)

    menu_augment_marker = '&lt;&lt;widget &quot;phonesetselfiemenu&quot;&gt;&gt;'
    if menu_augment_marker in text and "augment_phone_selfie_menu($phoneselfiemenu" not in text:
        menu_block = text.split(menu_augment_marker, 1)[1].split("&lt;&lt;/widget&gt;&gt;", 1)[0]
        if "augment_phone_selfie_menu" not in menu_block:
            augmented = menu_block.rstrip() + (
                "\n\n"
                "    &lt;&lt;run setup.Tanning.augment_phone_selfie_menu($phoneselfiemenu, $pc)&gt;&gt;\n"
            )
            text = text.replace(menu_augment_marker + menu_block, menu_augment_marker + augmented, 1)

    send_selfie_new = (
        "                    &lt;&lt;case &quot;send selfie&quot;&gt;&gt;\n"
        "                        &lt;&lt;for _selfie range $phoneselfiemenu&gt;&gt;\n"
        "                            &lt;&lt;set _linkname to _selfie[0]&gt;&gt;\n"
        "                            &lt;&lt;set _exhib to _selfie[1]&gt;&gt;\n"
        "                            &lt;&lt;if $pc.skillleveled(&quot;Exhibitionism&quot;, _exhib) and (_exhib is 0 or $pc.skillleveled(&quot;Disinhibition&quot;, 3))&gt;&gt;\n"
        "                                &lt;&lt;capture _exhib, _selfie&gt;&gt;\n"
        "                                    &lt;&lt;phonelink _linkname&gt;&gt;\n"
        "                                        &lt;&lt;run setup.Tanning.begin_phone_selfie_convo(_selfie, $phonetexter)&gt;&gt;\n"
        "                                        &lt;&lt;raiseskill Photography 2&gt;&gt;\n"
        "                                        &lt;&lt;advtime 5 Attention&gt;&gt;\n"
        "                                        &lt;&lt;phonetextrefresh&gt;&gt;\n"
        "                                    &lt;&lt;/phonelink&gt;&gt; &lt;&lt;if _exhib gt 0&gt;&gt;&lt;&lt;skill Exhibitionism _exhib&gt;&gt;&lt;&lt;/if&gt;&gt; &lt;&lt;dtime 5&gt;&gt;\n"
        "                                    &lt;br&gt;\n"
        "                                &lt;&lt;/capture&gt;&gt;\n"
        "                            &lt;&lt;/if&gt;&gt;\n"
        "                        &lt;&lt;/for&gt;&gt;\n"
        "                    &lt;&lt;case &quot;sub rules&quot;&gt;&gt;"
    )
    if "setup.Tanning.begin_phone_selfie_convo" not in text:
        text = re.sub(
            r'                    &lt;&lt;case &quot;send selfie&quot;&gt;&gt;[\s\S]*?'
            r'                    &lt;&lt;case &quot;sub rules&quot;&gt;&gt;',
            send_selfie_new,
            text,
            count=1,
        )

    return text


def patch_tan_event_return(text: str) -> str:
    old = '&lt;&lt;link &quot;Continue tanning&quot; $lastlocpassage&gt;&gt;&lt;&lt;/link&gt;&gt;'
    new = (
        '&lt;&lt;set _tanret to setup.Tanning.get_tan_passage()&gt;&gt;\n'
        '&lt;&lt;link &quot;Continue tanning&quot; _tanret&gt;&gt;&lt;&lt;/link&gt;&gt;'
    )
    if old in text:
        text = text.replace(old, new)
    return text


TAN_HANGOUT_PASSAGE_NAMES = [
    "EventHangoutMallTanArrive",
    "EventHangoutMallTanSunscreen",
    "EventHangoutMallTanChat",
    "EventHangoutMallTanPeopleWatch",
    "EventHangoutMallTanEnd",
    "EventHangoutLakeTanArrive",
    "EventHangoutLakeTanSunscreen",
    "EventHangoutLakeTanChat",
    "EventHangoutLakeTanSwimLook",
    "EventHangoutLakeTanEnd",
]

TAN_HANGOUT_EVENTS_ANCHOR = "    // exhibition outing"
TAN_HANGOUT_EVENTS_BLOCK = (
    "\n"
    "    // lay out at the mall\n"
    "    {\n"
    '        passage: "EventHangoutMallTanArrive",\n'
    '        tags: ["hangout", "date", "lay out at the mall", "1"],\n'
    "        frequency: 100,\n"
    "    },\n"
    "    {\n"
    '        passage: "EventHangoutMallTanSunscreen",\n'
    '        tags: ["hangout", "date", "lay out at the mall", "2", "3"],\n'
    "        frequency: 100,\n"
    "    },\n"
    "    {\n"
    '        passage: "EventHangoutMallTanChat",\n'
    '        tags: ["hangout", "date", "lay out at the mall", "2", "3"],\n'
    "        frequency: 150,\n"
    "    },\n"
    "    {\n"
    '        passage: "EventHangoutMallTanPeopleWatch",\n'
    '        tags: ["hangout", "date", "lay out at the mall", "2", "3"],\n'
    "        frequency: 80,\n"
    "    },\n"
    "    {\n"
    '        passage: "EventHangoutMallTanEnd",\n'
    '        tags: ["hangout", "date", "lay out at the mall", "4"],\n'
    "        frequency: 100,\n"
    "    },\n"
    "\n"
    "    // lay out at the lake\n"
    "    {\n"
    '        passage: "EventHangoutLakeTanArrive",\n'
    '        tags: ["hangout", "date", "lay out at the lake", "1"],\n'
    "        frequency: 100,\n"
    "    },\n"
    "    {\n"
    '        passage: "EventHangoutLakeTanSunscreen",\n'
    '        tags: ["hangout", "date", "lay out at the lake", "2", "3"],\n'
    "        frequency: 100,\n"
    "    },\n"
    "    {\n"
    '        passage: "EventHangoutLakeTanChat",\n'
    '        tags: ["hangout", "date", "lay out at the lake", "2", "3"],\n'
    "        frequency: 150,\n"
    "    },\n"
    "    {\n"
    '        passage: "EventHangoutLakeTanSwimLook",\n'
    '        tags: ["hangout", "date", "lay out at the lake", "2", "3"],\n'
    "        frequency: 80,\n"
    "    },\n"
    "    {\n"
    '        passage: "EventHangoutLakeTanEnd",\n'
    '        tags: ["hangout", "date", "lay out at the lake", "4"],\n'
    "        frequency: 100,\n"
    "    },\n"
    "\n"
)


def build_tan_hangout_passages(text: str) -> str:
    raw = (SRC / "tan-hangout-events.twee").read_text(encoding="utf-8")
    chunks = re.split(r"^::\s+", raw.strip(), flags=re.MULTILINE)
    pids = [int(m) for m in re.findall(r'pid="(\d+)"', text)]
    pid = max(pids) + 1 if pids else 900001
    blocks: list[str] = []
    for chunk in chunks:
        if not chunk.strip():
            continue
        lines = chunk.splitlines()
        header = lines[0].strip()
        name_m = re.search(r"^(\S+)", header)
        if not name_m:
            continue
        name = name_m.group(1)
        if name not in TAN_HANGOUT_PASSAGE_NAMES:
            continue
        tags_m = re.search(r"\[([^\]]*)\]", header)
        tags = tags_m.group(1) if tags_m else "nobr"
        body = "\n".join(lines[1:]).strip()
        blocks.append(
            f'<tw-passagedata pid="{pid}" name="{name}" tags="{tags}" '
            f'position="100,100" size="100,100">{escape_twee(body)}</tw-passagedata>'
        )
        pid += 1
    if len(blocks) != len(TAN_HANGOUT_PASSAGE_NAMES):
        raise RuntimeError(
            f"Expected {len(TAN_HANGOUT_PASSAGE_NAMES)} tan hangout passages, got {len(blocks)}"
        )
    return "\n".join(blocks)


def patch_tan_hangout_passages(text: str) -> str:
    for name in TAN_HANGOUT_PASSAGE_NAMES:
        text = re.sub(
            rf'<tw-passagedata pid="\d+" name="{name}"[\s\S]*?</tw-passagedata>\n?',
            "",
            text,
        )
    block = build_tan_hangout_passages(text)
    return text.replace("</tw-storydata>", block + "\n</tw-storydata>", 1)


def patch_tan_hangout_events(text: str) -> str:
    if 'passage: "EventHangoutMallTanArrive"' in text:
        return text
    if TAN_HANGOUT_EVENTS_ANCHOR not in text:
        raise RuntimeError("Tan hangout events anchor not found")
    return text.replace(
        TAN_HANGOUT_EVENTS_ANCHOR,
        TAN_HANGOUT_EVENTS_BLOCK + TAN_HANGOUT_EVENTS_ANCHOR,
        1,
    )


def patch_godate_tan_duration(text: str) -> str:
    anchor = (
        '                    &lt;&lt;elseif _date.activity is &quot;study together&quot;&gt;&gt;\n'
        "                        &lt;&lt;set _mins to 60&gt;&gt;\n"
        "                    &lt;&lt;/if&gt;&gt;"
    )
    insert = (
        '                    &lt;&lt;elseif _date.activity is &quot;study together&quot;&gt;&gt;\n'
        "                        &lt;&lt;set _mins to 60&gt;&gt;\n"
        '                    &lt;&lt;elseif _date.activity is &quot;lay out at the mall&quot; or _date.activity is &quot;lay out at the lake&quot;&gt;&gt;\n'
        "                        &lt;&lt;set _mins to 60&gt;&gt;\n"
        "                    &lt;&lt;/if&gt;&gt;"
    )
    if 'lay out at the mall&quot; or _date.activity is &quot;lay out at the lake' in text:
        return text
    if anchor not in text:
        raise RuntimeError("godate duration anchor not found for tan hangouts")
    return text.replace(anchor, insert, 1)


def patch_gotonexthangoutevent_fallback(text: str) -> str:
    old = (
        "    &lt;&lt;set _event to setup.Events.passage(_tags)&gt;&gt;\n"
        "    &lt;&lt;run $hangout.events.push(_event)&gt;&gt;\n"
        "    &lt;&lt;set $hangout.stage++&gt;&gt;\n"
        "    &lt;&lt;egoto _event&gt;&gt;"
    )
    new = (
        "    &lt;&lt;set _event to setup.Events.passage(_tags)&gt;&gt;\n"
        "    &lt;&lt;if !_event&gt;&gt;\n"
        "        &lt;&lt;set _loc to $hangout.startlocation&gt;&gt;\n"
        "        &lt;&lt;summarizehangout&gt;&gt;\n"
        "        &lt;&lt;endhangout&gt;&gt;\n"
        "        &lt;&lt;unset $eventnpc&gt;&gt;\n"
        "        &lt;&lt;egoto _loc&gt;&gt;\n"
        "    &lt;&lt;else&gt;&gt;\n"
        "        &lt;&lt;run $hangout.events.push(_event)&gt;&gt;\n"
        "        &lt;&lt;set $hangout.stage++&gt;&gt;\n"
        "        &lt;&lt;egoto _event&gt;&gt;\n"
        "    &lt;&lt;/if&gt;&gt;"
    )
    if "&lt;&lt;if !_event&gt;&gt;\n        &lt;&lt;set _loc to $hangout.startlocation&gt;&gt;" in text:
        return text
    if old not in text:
        raise RuntimeError("gotonexthangoutevent widget anchor not found")
    return text.replace(old, new, 1)


def main() -> None:
    text = HTML.read_text(encoding="utf-8")
    text = patch_tanning_js(text)
    text = patch_apply_session(text)
    text = patch_restore_after_tan(text)
    text = patch_session_minutes(text)
    text = patch_tan_menu(text)
    text = patch_unimall_tan_entry(text)
    text = patch_tan_passages(text)
    text = patch_tan_event_return(text)
    text = patch_css(text)
    text = patch_widgets(text)
    text = patch_tan_swim_wardrobe(text)
    text = patch_tan_phone_menu(text)
    text = patch_phone_selfie_system(text)
    text = patch_tan_selfie_passage(text, "TanPhoneSelfie", "tan-phone-selfie.twee")
    text = patch_tan_selfie_passage(text, "TanElkbookSelfie", "tan-elkbook-selfie.twee")
    text = patch_tan_hangout_events(text)
    text = patch_tan_hangout_passages(text)
    text = patch_godate_tan_duration(text)
    text = patch_gotonexthangoutevent_fallback(text)
    text = patch_out_about_exposure(text)
    HTML.write_text(text, encoding="utf-8")
    print(f"Patched exhibition tanning into {HTML.name}")


if __name__ == "__main__":
    main()