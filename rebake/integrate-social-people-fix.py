#!/usr/bin/env python3
"""Harden Social People tab widgets; restore vanilla HTML entity encoding."""

from __future__ import annotations

import re
from pathlib import Path

from rebake_target import HTML, ROOT

VANILLA = ROOT / "old edits" / "CourseOfTemptation.html"


def extract_widget(html_text: str, name: str) -> str:
    pattern = rf"(&lt;&lt;widget &quot;{re.escape(name)}&quot;&gt;&gt;[\s\S]*?&lt;&lt;/widget&gt;&gt;)"
    match = re.search(pattern, html_text)
    if not match:
        raise RuntimeError(f'widget "{name}" not found')
    return match.group(1)


def replace_widget(html_text: str, name: str, widget: str) -> str:
    pattern = rf"&lt;&lt;widget &quot;{re.escape(name)}&quot;&gt;&gt;[\s\S]*?&lt;&lt;/widget&gt;&gt;"
    new_text, count = re.subn(pattern, widget, html_text, count=1)
    if count != 1:
        raise RuntimeError(f'could not replace widget "{name}" ({count} matches)')
    return new_text


def _displaypeoplebody_init_block() -> str:
    return (
        "&lt;&lt;set _peopletab to _args[0] or _peopletab or &quot;here&quot;&gt;&gt;\n"
        "&lt;&lt;script&gt;&gt;\n"
        "if (!V.socialfilters || typeof V.socialfilters !== &quot;object&quot;) State.setVar(&quot;$socialfilters&quot;, {});\n"
        "if (!V.traitfilters || typeof V.traitfilters !== &quot;object&quot;) State.setVar(&quot;$traitfilters&quot;, {});\n"
        "T.people = Array.isArray(T.people) ? T.people.filter(Boolean) : [];\n"
        "if (V.favoritepeople &amp;&amp; Array.isArray(V.favoritepeople))\n"
        "    T.people = T.people.sort((a, b) =&gt; V.favoritepeople.includes(b) - V.favoritepeople.includes(a));\n"
        "const sfilters = V.socialfilters;\n"
        "const tfilters = V.traitfilters;\n"
        "T.anybadgesfiltered = Object.values(sfilters).includes(false);\n"
        "T.anytraitsfiltered = Object.values(tfilters).includes(false);\n"
        "const people = Array.isArray(T.people) ? T.people : [];\n"
        "const filtering = !!(V.socialsearch || T.anybadgesfiltered || T.anytraitsfiltered);\n"
        "if (filtering) {\n"
        "    T.dpeople = people.filter(p =&gt; {\n"
        "        let known = setup.people.is_known(p);\n"
        "        let anyfound = true;\n"
        "        if (T.anybadgesfiltered) {\n"
        "            let anyenabled = Object.values(sfilters).includes(true);\n"
        "            if (!anyenabled)\n"
        "                anyfound = false;\n"
        "            else {\n"
        "                for (let [badge, badgeenabled] of Object.entries(sfilters))\n"
        "                    if (badgeenabled &amp;&amp; !setup.people.has_badge(p, badge)) {\n"
        "                        anyfound = false;\n"
        "                        break;\n"
        "                    }\n"
        "            }\n"
        "        }\n"
        "        if (anyfound &amp;&amp; T.anytraitsfiltered) {\n"
        "            let anyenabled = Object.values(tfilters).includes(true);\n"
        "            if (!anyenabled)\n"
        "                anyfound = false;\n"
        "            else {\n"
        "                let thistraits = setup.people.known_personality_traits(p) || [];\n"
        "                for (let [trait, traitenabled] of Object.entries(tfilters)) {\n"
        "                    if (traitenabled &amp;&amp; !thistraits.includes(trait)) {\n"
        "                        anyfound = false;\n"
        "                        break;\n"
        "                    }\n"
        "                }\n"
        "            }\n"
        "        }\n"
        "        if (!anyfound) return false;\n"
        "        const search = (V.socialsearch || &quot;&quot;).toLowerCase();\n"
        "        if (known &amp;&amp; p.toLowerCase().includes(search))\n"
        "            return true;\n"
        "        else if (!known &amp;&amp; setup.people.anonymous_name(p).toLowerCase().includes(search))\n"
        "            return true;\n"
        "        else\n"
        "            return false;\n"
        "    });\n"
        "} else {\n"
        "    T.dpeople = people;\n"
        "}\n"
        "T.dpeople = Array.isArray(T.dpeople) ? T.dpeople : [];\n"
        "const isValidDisplayPerson = p =&gt; {\n"
        "    if (!p || p === &quot;dummy&quot;) return false;\n"
        "    try {\n"
        "        const db = setup.people_db();\n"
        "        if (!db || typeof db !== &quot;object&quot;) return false;\n"
        "        const name = setup.people.get_name(p);\n"
        "        return !!(name &amp;&amp; name in db);\n"
        "    } catch (e) { return false; }\n"
        "};\n"
        "T.dpeople = T.dpeople.filter(isValidDisplayPerson);\n"
        "try { T.nichesbyperson = setup.people.reverse_niches() || {}; }\n"
        "catch (e) { T.nichesbyperson = {}; }\n"
        "if (!T.nichesbyperson || typeof T.nichesbyperson !== &quot;object&quot;) T.nichesbyperson = {};\n"
        "&lt;&lt;/script&gt;&gt;\n"
        "&lt;&lt;set _anybadgesfiltered to _anybadgesfiltered&gt;&gt;\n"
        "&lt;&lt;set _anytraitsfiltered to _anytraitsfiltered&gt;&gt;\n"
        "&lt;&lt;set _dpeople to _dpeople&gt;&gt;\n"
        "&lt;&lt;set _nichesbyperson to _nichesbyperson&gt;&gt;\n"
        "    &lt;div id=&quot;display-people-body&quot;&gt;\n"
        "        &lt;&lt;if _dpeople.length is 0&gt;&gt;"
    )


def patch_displaypeoplebody(widget: str) -> str:
    init_block = _displaypeoplebody_init_block()

    vanilla_old = (
        "    &lt;&lt;set _peopletab to _args[0]&gt;&gt;\n"
        "    &lt;&lt;sortpeople&gt;&gt;\n"
        "    &lt;div id=&quot;display-people-body&quot;&gt;\n"
        "        &lt;&lt;set _anybadgesfiltered to ndef $socialfilters ? false : Object.values($socialfilters).includes(false)&gt;&gt;\n"
        "        &lt;&lt;set _anytraitsfiltered to ndef $traitfilters ? false : Object.values($traitfilters).includes(false)&gt;&gt;\n"
        "        &lt;&lt;if $socialsearch or _anybadgesfiltered or _anytraitsfiltered&gt;&gt;\n"
        "            &lt;&lt;script&gt;&gt;\n"
        "                T.dpeople = T.people.filter(p =&gt; {\n"
        "                    let known = setup.people.is_known(p);\n"
        "\n"
        "                    let anyfound = true;\n"
        "                    if (T.anybadgesfiltered)\n"
        "                    {\n"
        "                        let anyenabled = Object.values(V.socialfilters).includes(true);\n"
        "                        if (!anyenabled)\n"
        "                            anyfound = false;\n"
        "                        else\n"
        "                        {\n"
        "                            for (let [badge, badgeenabled] of Object.entries(V.socialfilters))\n"
        "                                if (badgeenabled &amp;&amp; !setup.people.has_badge(p, badge))\n"
        "                                {\n"
        "                                    anyfound = false;\n"
        "                                    break;\n"
        "                                }\n"
        "                        }\n"
        "                    }\n"
        "                    if (anyfound &amp;&amp; T.anytraitsfiltered)\n"
        "                    {\n"
        "                        let anyenabled = Object.values(V.traitfilters).includes(true);\n"
        "                        if (!anyenabled)\n"
        "                            anyfound = false;\n"
        "                        else\n"
        "                        {\n"
        "                            let thistraits = setup.people.known_personality_traits(p);\n"
        "                            for (let [trait, traitenabled] of Object.entries(V.traitfilters))\n"
        "                            {\n"
        "                                if (traitenabled &amp;&amp; !thistraits.includes(trait))\n"
        "                                {\n"
        "                                    anyfound = false;\n"
        "                                    break;\n"
        "                                }\n"
        "                            }\n"
        "                        }\n"
        "                    }\n"
        "\n"
        "                    if (!anyfound) return false;\n"
        "\n"
        "                    if (known &amp;&amp; p.toLowerCase().includes(V.socialsearch.toLowerCase()))\n"
        "                        return true;\n"
        "                    else if (!known &amp;&amp; setup.people.anonymous_name(p).toLowerCase().includes(V.socialsearch.toLowerCase()))\n"
        "                        return true;\n"
        "                    else\n"
        "                        return false;\n"
        "                    });\n"
        "\n"
        "            &lt;&lt;/script&gt;&gt;\n"
        "        &lt;&lt;else&gt;&gt;\n"
        "            &lt;&lt;set _dpeople to _people&gt;&gt;\n"
        "        &lt;&lt;/if&gt;&gt;\n"
        "\n"
        "        &lt;&lt;if _dpeople.length is 0&gt;&gt;"
    )

    patched_old = (
        "&lt;&lt;set _peopletab to _args[0] or _peopletab or &quot;here&quot;&gt;&gt;\n"
        "&lt;&lt;script&gt;&gt;\n"
        "if (!V.socialfilters || typeof V.socialfilters !== &quot;object&quot;) State.setVar(&quot;$socialfilters&quot;, {});\n"
        "if (!V.traitfilters || typeof V.traitfilters !== &quot;object&quot;) State.setVar(&quot;$traitfilters&quot;, {});\n"
        "T.people = Array.isArray(T.people) ? T.people.filter(Boolean) : [];\n"
        "if (V.favoritepeople &amp;&amp; Array.isArray(V.favoritepeople))\n"
        "    T.people = T.people.sort((a, b) =&gt; V.favoritepeople.includes(b) - V.favoritepeople.includes(a));\n"
        "T.anybadgesfiltered = Object.values(V.socialfilters).includes(false);\n"
        "T.anytraitsfiltered = Object.values(V.traitfilters).includes(false);\n"
        "&lt;&lt;/script&gt;&gt;\n"
        "    &lt;div id=&quot;display-people-body&quot;&gt;\n"
        "        &lt;&lt;if $socialsearch or _anybadgesfiltered or _anytraitsfiltered&gt;&gt;\n"
        "            &lt;&lt;script&gt;&gt;\n"
        "                const people = Array.isArray(T.people) ? T.people : [];\n"
        "                T.dpeople = people.filter(p =&gt; {\n"
        "                    let known = setup.people.is_known(p);\n"
        "\n"
        "                    let anyfound = true;\n"
        "                    if (T.anybadgesfiltered)\n"
        "                    {\n"
        "                        const filters = (V.socialfilters &amp;&amp; typeof V.socialfilters === &quot;object&quot;) ? V.socialfilters : {};\n"
        "                        let anyenabled = Object.values(filters).includes(true);\n"
        "                        if (!anyenabled)\n"
        "                            anyfound = false;\n"
        "                        else\n"
        "                        {\n"
        "                            for (let [badge, badgeenabled] of Object.entries(filters))\n"
        "                                if (badgeenabled &amp;&amp; !setup.people.has_badge(p, badge))\n"
        "                                {\n"
        "                                    anyfound = false;\n"
        "                                    break;\n"
        "                                }\n"
        "                        }\n"
        "                    }\n"
        "                    if (anyfound &amp;&amp; T.anytraitsfiltered)\n"
        "                    {\n"
        "                        const tfilters = (V.traitfilters &amp;&amp; typeof V.traitfilters === &quot;object&quot;) ? V.traitfilters : {};\n"
        "                        let anyenabled = Object.values(tfilters).includes(true);\n"
        "                        if (!anyenabled)\n"
        "                            anyfound = false;\n"
        "                        else\n"
        "                        {\n"
        "                            let thistraits = setup.people.known_personality_traits(p);\n"
        "                            for (let [trait, traitenabled] of Object.entries(tfilters))\n"
        "                            {\n"
        "                                if (traitenabled &amp;&amp; !thistraits.includes(trait))\n"
        "                                {\n"
        "                                    anyfound = false;\n"
        "                                    break;\n"
        "                                }\n"
        "                            }\n"
        "                        }\n"
        "                    }\n"
        "\n"
        "                    if (!anyfound) return false;\n"
        "\n"
        "                    const search = (V.socialsearch || &quot;&quot;).toLowerCase();\n"
        "                    if (known &amp;&amp; p.toLowerCase().includes(search))\n"
        "                        return true;\n"
        "                    else if (!known &amp;&amp; setup.people.anonymous_name(p).toLowerCase().includes(search))\n"
        "                        return true;\n"
        "                    else\n"
        "                        return false;\n"
        "                });\n"
        "            &lt;&lt;/script&gt;&gt;\n"
        "        &lt;&lt;else&gt;&gt;\n"
        "            &lt;&lt;set _dpeople to _people&gt;&gt;\n"
        "        &lt;&lt;/if&gt;&gt;\n"
        "        &lt;&lt;if ndef _dpeople&gt;&gt;&lt;&lt;set _dpeople to []&gt;&gt;&lt;&lt;/if&gt;&gt;\n"
        "\n"
        "        &lt;&lt;if _dpeople.length is 0&gt;&gt;"
    )

    if vanilla_old in widget:
        widget = widget.replace(vanilla_old, init_block, 1)
    elif patched_old in widget:
        widget = widget.replace(patched_old, init_block, 1)
    elif "const filtering = !!(V.socialsearch" in widget:
        prev_init_start = widget.find("&lt;&lt;set _peopletab to _args[0] or _peopletab")
        prev_init_end = widget.find("        &lt;&lt;if _dpeople.length is 0&gt;&gt;", prev_init_start)
        if prev_init_start != -1 and prev_init_end != -1:
            widget = widget[:prev_init_start] + init_block + widget[prev_init_end:]
    else:
        marker = "&lt;&lt;widget &quot;displaypeoplebody&quot;&gt;&gt;"
        start = widget.find(marker)
        if start == -1:
            raise RuntimeError("displaypeoplebody widget not found")
        body_start = widget.find("&lt;&lt;set _peopletab", start)
        end_marker = "        &lt;&lt;if _dpeople.length is 0&gt;&gt;"
        end = widget.find(end_marker, start)
        if body_start == -1 or end == -1:
            raise RuntimeError("displaypeoplebody init anchor not found")
        widget = widget[:body_start] + init_block + widget[end + len(end_marker) :]

    widget = widget.replace(
        "&lt;&lt;if $socialsearch or (def $socialfilters and Object.values($socialfilters).includes(false)) or (def $traitfilters and Object.values($traitfilters).includes(false))&gt;&gt;",
        "&lt;&lt;if $socialsearch or _anybadgesfiltered or _anytraitsfiltered&gt;&gt;",
        1,
    )
    widget = patch_displaypeoplebody_loop(widget)
    widget = widget.replace("&amp;#39;", "&#39;")
    return widget


def _person_identity_block() -> str:
    return (
        "                    &lt;&lt;script&gt;&gt;\n"
        "T.pname = &quot;&quot;;\n"
        "T.known = false;\n"
        "T.name = &quot;Someone&quot;;\n"
        "T.niche = null;\n"
        "try {\n"
        "    const dp = T.displayperson;\n"
        "    if (dp) {\n"
        "        T.pname = setup.people.get_name(dp) || &quot;&quot;;\n"
        "        if (T.pname) {\n"
        "            T.known = setup.people.is_known(T.pname) &amp;&amp; !setup.people.is_anonymous(T.pname);\n"
        "            if (T.known) {\n"
        "                T.name = setup.people.fullname(T.pname);\n"
        "                const nb = T.nichesbyperson;\n"
        "                T.niche = (nb &amp;&amp; typeof nb === &quot;object&quot; &amp;&amp; T.pname in nb) ? nb[T.pname] : null;\n"
        "            } else {\n"
        "                T.name = setup.people.anonymous_name(T.pname);\n"
        "            }\n"
        "        }\n"
        "    }\n"
        "} catch (e) {\n"
        "    T.pname = T.pname || &quot;&quot;;\n"
        "    T.known = false;\n"
        "    T.name = T.name || &quot;Someone&quot;;\n"
        "    T.niche = null;\n"
        "}\n"
        "&lt;&lt;/script&gt;&gt;\n"
        "                    &lt;&lt;set _pname to _pname&gt;&gt;\n"
        "                    &lt;&lt;set _known to _known&gt;&gt;\n"
        "                    &lt;&lt;set _name to _name&gt;&gt;\n"
        "                    &lt;&lt;set _niche to _niche&gt;&gt;"
    )


def _person_stats_block() -> str:
    return (
        "                    &lt;&lt;script&gt;&gt;\n"
        "try {\n"
        "    const dp = T.displayperson;\n"
        "    T.gender = setup.people.get_gender(dp) || &quot;female&quot;;\n"
        "    const rawBadges = setup.people.get_badges(dp);\n"
        "    T.badges = Array.isArray(rawBadges) ? rawBadges.filter(b =&gt; b &amp;&amp; !b.invisible) : [];\n"
        "    T.label = (typeof dp === &quot;string&quot;) ? dp.split(&quot; &quot;).join(&quot;_&quot;).split(&quot;&#39;&quot;).join(&quot;_&quot;) : &quot;unknown&quot;;\n"
        "    T.friendship = setup.people.get_attitude(dp, &quot;friendship&quot;) || 0;\n"
        "    T.lust = Math.max(0, setup.people.get_attitude(dp, &quot;lust&quot;) || 0);\n"
        "    T.romance = Math.max(0, setup.people.get_attitude(dp, &quot;romance&quot;) || 0);\n"
        "} catch (e) {\n"
        "    T.gender = &quot;female&quot;;\n"
        "    T.badges = [];\n"
        "    T.label = &quot;unknown&quot;;\n"
        "    T.friendship = 0;\n"
        "    T.lust = 0;\n"
        "    T.romance = 0;\n"
        "}\n"
        "&lt;&lt;/script&gt;&gt;\n"
        "                    &lt;&lt;set _gender to _gender&gt;&gt;\n"
        "                    &lt;&lt;set _badges to _badges&gt;&gt;\n"
        "                    &lt;&lt;set _label to _label&gt;&gt;\n"
        "                    &lt;&lt;set _friendship to _friendship&gt;&gt;\n"
        "                    &lt;&lt;set _lust to _lust&gt;&gt;\n"
        "                    &lt;&lt;set _romance to _romance&gt;&gt;"
    )


def patch_displaypeoplebody_loop(widget: str) -> str:
    identity_block = _person_identity_block()
    stats_block = _person_stats_block()

    identity_olds = [
        (
            "                    &lt;&lt;set _pname to setup.people.get_name(_displayperson) or &quot;&quot;&gt;&gt;\n"
            "                    &lt;&lt;set _known to _pname and setup.people.is_known(_pname) and !setup.people.is_anonymous(_pname)&gt;&gt;\n"
            "                    &lt;&lt;if _known&gt;&gt;\n"
            "                        &lt;&lt;set _name to setup.people.fullname(_pname)&gt;&gt;\n"
            "                        &lt;&lt;set _niche to (def _nichesbyperson ? _nichesbyperson[_pname] : null)&gt;&gt;\n"
            "                    &lt;&lt;else&gt;&gt;\n"
            "                        &lt;&lt;set _name to setup.people.anonymous_name(_pname)&gt;&gt;\n"
            "                        &lt;&lt;set _niche to null&gt;&gt;\n"
            "                    &lt;&lt;/if&gt;&gt;"
        ),
        (
            "                    &lt;&lt;set _pname to setup.people.get_name(_displayperson)&gt;&gt;\n"
            "                    &lt;&lt;set _known to setup.people.is_known(_pname) &amp;&amp; !setup.people.is_anonymous(_pname)&gt;&gt;\n"
            "                    &lt;&lt;if _known&gt;&gt;\n"
            "                        &lt;&lt;set _name to setup.people.fullname(_pname)&gt;&gt;\n"
            "                        &lt;&lt;set _niche to _nichesbyperson[_pname]&gt;&gt;\n"
            "                    &lt;&lt;else&gt;&gt;\n"
            "                        &lt;&lt;set _name to setup.people.anonymous_name(_pname)&gt;&gt;\n"
            "                        &lt;&lt;set _niche to null&gt;&gt;\n"
            "                    &lt;&lt;/if&gt;&gt;"
        ),
    ]
    for old in identity_olds:
        if old in widget:
            widget = widget.replace(old, identity_block, 1)
            break

    # Replace gender set and later badge/label/attitude sets as one block
    stats_section_olds = [
        (
            "                    &lt;&lt;set _gender to setup.people.get_gender(_displayperson)&gt;&gt;\n"
            "                    &lt;&lt;set _styleclass to &quot;view-people-person-name &quot; + _gender&gt;&gt;\n"
            "                    &lt;&lt;if _gender is &quot;transgender female&quot;&gt;&gt;\n"
            "                        &lt;&lt;set _coloropt to &quot;female&quot;&gt;&gt;\n"
            "                    &lt;&lt;elseif _gender is &quot;transgender male&quot;&gt;&gt;\n"
            "                        &lt;&lt;set _coloropt to &quot;male&quot;&gt;&gt;\n"
            "                    &lt;&lt;elseif _gender is &quot;nonbinary amab&quot; or _gender is &quot;nonbinary afab&quot;&gt;&gt;\n"
            "                        &lt;&lt;set _coloropt to &quot;nonbinary&quot;&gt;&gt;\n"
            "                    &lt;&lt;else&gt;&gt;\n"
            "                        &lt;&lt;set _coloropt to _gender&gt;&gt;\n"
            "                    &lt;&lt;/if&gt;&gt;\n"
            "                    &lt;&lt;set _style = &#39;color: &#39; + setup.get_color(_coloropt) + &#39;;&#39;&gt;&gt;\n"
            "                    &lt;div class=&quot;view-people-person&quot;&gt;\n"
            "                        &lt;div class=&quot;view-people-person-header&quot;&gt;\n"
            "                            &lt;div @class=&#39;_styleclass&#39; @style=&#39;_style&#39;&gt;\n"
            "                                &lt;&lt;capture _displayperson, _name&gt;&gt;\n"
            "                                    &lt;&lt;link _name&gt;&gt;\n"
            "                                        &lt;&lt;run setup.display_npc_dialog(_displayperson, _name)&gt;&gt;\n"
            "                                    &lt;&lt;/link&gt;&gt;\n"
            "                                &lt;&lt;/capture&gt;&gt;\n"
            "                            &lt;/div&gt;\n"
            "                            &lt;&lt;set _badges to (setup.people.get_badges(_displayperson) || []).filter(badge =&gt; !badge.invisible)&gt;&gt;\n"
            "                            &lt;&lt;if _badges and _badges.length &gt; 0 and $optshowemojis&gt;&gt;"
        ),
        (
            "                    &lt;&lt;set _gender to setup.people.get_gender(_displayperson)&gt;&gt;\n"
            "                    &lt;&lt;set _styleclass to &quot;view-people-person-name &quot; + _gender&gt;&gt;\n"
            "                    &lt;&lt;if _gender is &quot;transgender female&quot;&gt;&gt;\n"
            "                        &lt;&lt;set _coloropt to &quot;female&quot;&gt;&gt;\n"
            "                    &lt;&lt;elseif _gender is &quot;transgender male&quot;&gt;&gt;\n"
            "                        &lt;&lt;set _coloropt to &quot;male&quot;&gt;&gt;\n"
            "                    &lt;&lt;elseif _gender is &quot;nonbinary amab&quot; or _gender is &quot;nonbinary afab&quot;&gt;&gt;\n"
            "                        &lt;&lt;set _coloropt to &quot;nonbinary&quot;&gt;&gt;\n"
            "                    &lt;&lt;else&gt;&gt;\n"
            "                        &lt;&lt;set _coloropt to _gender&gt;&gt;\n"
            "                    &lt;&lt;/if&gt;&gt;\n"
            "                    &lt;&lt;set _style = &#39;color: &#39; + setup.get_color(_coloropt) + &#39;;&#39;&gt;&gt;\n"
            "                    &lt;div class=&quot;view-people-person&quot;&gt;\n"
            "                        &lt;div class=&quot;view-people-person-header&quot;&gt;\n"
            "                            &lt;div @class=&#39;_styleclass&#39; @style=&#39;_style&#39;&gt;\n"
            "                                &lt;&lt;capture _displayperson, _name&gt;&gt;\n"
            "                                    &lt;&lt;link _name&gt;&gt;\n"
            "                                        &lt;&lt;run setup.display_npc_dialog(_displayperson, _name)&gt;&gt;\n"
            "                                    &lt;&lt;/link&gt;&gt;\n"
            "                                &lt;&lt;/capture&gt;&gt;\n"
            "                            &lt;/div&gt;\n"
            "                            &lt;&lt;set _badges to setup.people.get_badges(_displayperson).filter(badge =&gt; !badge.invisible)&gt;&gt;\n"
            "                            &lt;&lt;if _badges.length &gt; 0 and $optshowemojis&gt;&gt;"
        ),
    ]
    stats_section_new = (
        stats_block
        + "\n"
        "                    &lt;&lt;set _styleclass to &quot;view-people-person-name &quot; + _gender&gt;&gt;\n"
        "                    &lt;&lt;if _gender is &quot;transgender female&quot;&gt;&gt;\n"
        "                        &lt;&lt;set _coloropt to &quot;female&quot;&gt;&gt;\n"
        "                    &lt;&lt;elseif _gender is &quot;transgender male&quot;&gt;&gt;\n"
        "                        &lt;&lt;set _coloropt to &quot;male&quot;&gt;&gt;\n"
        "                    &lt;&lt;elseif _gender is &quot;nonbinary amab&quot; or _gender is &quot;nonbinary afab&quot;&gt;&gt;\n"
        "                        &lt;&lt;set _coloropt to &quot;nonbinary&quot;&gt;&gt;\n"
        "                    &lt;&lt;else&gt;&gt;\n"
        "                        &lt;&lt;set _coloropt to _gender&gt;&gt;\n"
        "                    &lt;&lt;/if&gt;&gt;\n"
        "                    &lt;&lt;set _style = &#39;color: &#39; + setup.get_color(_coloropt) + &#39;;&#39;&gt;&gt;\n"
        "                    &lt;div class=&quot;view-people-person&quot;&gt;\n"
        "                        &lt;div class=&quot;view-people-person-header&quot;&gt;\n"
        "                            &lt;div @class=&#39;_styleclass&#39; @style=&#39;_style&#39;&gt;\n"
        "                                &lt;&lt;capture _displayperson, _name&gt;&gt;\n"
        "                                    &lt;&lt;link _name&gt;&gt;\n"
        "                                        &lt;&lt;run setup.display_npc_dialog(_displayperson, _name)&gt;&gt;\n"
        "                                    &lt;&lt;/link&gt;&gt;\n"
        "                                &lt;&lt;/capture&gt;&gt;\n"
        "                            &lt;/div&gt;\n"
        "                            &lt;&lt;if _badges and _badges.length &gt; 0 and $optshowemojis&gt;&gt;"
    )
    for old in stats_section_olds:
        if old in widget:
            widget = widget.replace(old, stats_section_new, 1)
            break

    attitude_olds = [
        (
            "                            &lt;&lt;set _label to (_displayperson and typeof _displayperson === &quot;string&quot; ? _displayperson.split(&#39; &#39;).join(&#39;_&#39;).split(&#39;\\&#39;&#39;).join(&#39;_&#39;) : &quot;unknown&quot;)&gt;&gt;\n"
            "                            &lt;&lt;set _friendship to setup.people.get_attitude(_displayperson, &quot;friendship&quot;)&gt;&gt;"
        ),
        (
            "                            &lt;&lt;set _label to _displayperson.split(&#39; &#39;).join(&#39;_&#39;).split(&#39;\\&#39;&#39;).join(&#39;_&#39;)&gt;&gt;\n"
            "                            &lt;&lt;set _friendship to setup.people.get_attitude(_displayperson, &quot;friendship&quot;)&gt;&gt;"
        ),
    ]
    for old in attitude_olds:
        if old in widget:
            widget = widget.replace(old, "", 1)

    lust_olds = [
        "                            &lt;&lt;set _lust to Math.max(0, setup.people.get_attitude(_displayperson, &quot;lust&quot;))&gt;&gt;",
        "                            &lt;&lt;set _romance to Math.max(0, setup.people.get_attitude(_displayperson, &quot;romance&quot;))&gt;&gt;",
    ]
    for old in lust_olds:
        if old in widget:
            widget = widget.replace(old, "", 1)

    for old in (
        "                &lt;&lt;set _nichesbyperson to setup.people.reverse_niches() or {}&gt;&gt;\n"
        "                &lt;&lt;for _displayperson range _dpeople&gt;&gt;",
        "                &lt;&lt;set _nichesbyperson to setup.people.reverse_niches()&gt;&gt;\n"
        "                &lt;&lt;for _displayperson range _dpeople&gt;&gt;",
    ):
        if old in widget:
            widget = widget.replace(old, "                &lt;&lt;for _displayperson range _dpeople&gt;&gt;", 1)

    return widget


def patch_get_name_guard(text: str) -> str:
    niche_old = (
        "    if (name in setup.people_niches())\n"
        "        name = setup.people_niches()[name];\n"
    )
    niche_new = (
        "    const _nichemap = setup.people_niches();\n"
        "    if (_nichemap && typeof _nichemap === \"object\" && name in _nichemap)\n"
        "        name = _nichemap[name];\n"
    )
    if niche_old in text:
        text = text.replace(niche_old, niche_new, 1)
    elif "const _nichemap = setup.people_niches()" not in text:
        raise RuntimeError("get_name niche guard anchor not found")

    pdb_old = (
        "    if (!(name in setup.people_db()))\n"
        "    {\n"
        "        // forgive me for what i must do\n"
        "        let matches = Object.keys(setup.people_db()).filter(item => item.indexOf(name + \"'\") == 0)\n"
        "        if (matches) name = matches[0];\n"
        "    }\n"
    )
    pdb_new = (
        "    const _pdb = setup.people_db();\n"
        "    if (!_pdb || typeof _pdb !== \"object\")\n"
        "        return name;\n"
        "    if (!(name in _pdb))\n"
        "    {\n"
        "        // forgive me for what i must do\n"
        "        let matches = Object.keys(_pdb).filter(item => item.indexOf(name + \"'\") == 0)\n"
        "        if (matches) name = matches[0];\n"
        "    }\n"
    )
    if pdb_old in text:
        text = text.replace(pdb_old, pdb_new, 1)
    elif "const _pdb = setup.people_db()" not in text:
        raise RuntimeError("get_name db guard anchor not found")
    return text


def patch_reverse_niches(text: str) -> str:
    old = (
        "setup.people.reverse_niches = function()\n"
        "{\n"
        "    let retval = {};\n"
        "    for (const [niche, p] of Object.entries(V.niches))\n"
        "        retval[p] = niche;\n"
        "    return retval;\n"
        "}"
    )
    new = (
        "setup.people.reverse_niches = function()\n"
        "{\n"
        "    let retval = {};\n"
        '    const niches = (V.niches && typeof V.niches === "object") ? V.niches : {};\n'
        "    for (const [niche, p] of Object.entries(niches))\n"
        "        retval[p] = niche;\n"
        "    return retval;\n"
        "}"
    )
    broken = (
        "    const niches = (V.niches &amp;&amp; typeof V.niches === &quot;object&quot;) ? V.niches : {};\n"
    )
    fixed = '    const niches = (V.niches && typeof V.niches === "object") ? V.niches : {};\n'
    if broken in text:
        text = text.replace(broken, fixed, 1)
    if old not in text:
        if 'const niches = (V.niches && typeof V.niches === "object")' in text:
            return text
        raise RuntimeError("reverse_niches anchor not found")
    return text.replace(old, new, 1)


def patch_sortpeople(widget: str) -> str:
    old = (
        "&lt;&lt;widget &quot;sortpeople&quot;&gt;&gt;\n"
        "    &lt;&lt;script&gt;&gt;\n"
        "        T.people = T.people.filter(Boolean);\n"
        "        if (V.favoritepeople)\n"
        "            T.people = T.people.sort((a, b) =&gt; V.favoritepeople.includes(b) - V.favoritepeople.includes(a));\n"
        "    &lt;&lt;/script&gt;&gt;\n"
        "&lt;&lt;/widget&gt;&gt;"
    )
    new = (
        "&lt;&lt;widget &quot;sortpeople&quot;&gt;&gt;\n"
        "    &lt;&lt;script&gt;&gt;\n"
        "        T.people = Array.isArray(T.people) ? T.people.filter(Boolean) : [];\n"
        "        if (V.favoritepeople &amp;&amp; Array.isArray(V.favoritepeople))\n"
        "            T.people = T.people.sort((a, b) =&gt; V.favoritepeople.includes(b) - V.favoritepeople.includes(a));\n"
        "    &lt;&lt;/script&gt;&gt;\n"
        "&lt;&lt;/widget&gt;&gt;"
    )
    if old not in widget:
        if "Array.isArray(T.people)" in widget and "sortpeople" in widget:
            return widget
        raise RuntimeError("sortpeople anchor not found")
    return widget.replace(old, new, 1)


def patch_people_here_tab(text: str) -> str:
    old = (
        "            else\n"
        "            {\n"
        "                T.people = [...V.peopleatlocation];\n"
        "                if (V.arcade &amp;&amp; V.arcade.competitors &amp;&amp; V.location == &quot;Arcade&quot;)"
    )
    new = (
        "            else\n"
        "            {\n"
        "                T.people = Array.isArray(V.peopleatlocation) ? [...V.peopleatlocation] : [];\n"
        "                if (V.arcade &amp;&amp; V.arcade.competitors &amp;&amp; V.location == &quot;Arcade&quot;)"
    )
    if old not in text:
        if "Array.isArray(V.peopleatlocation)" in text:
            return text
        raise RuntimeError("People Here tab anchor not found")
    return text.replace(old, new, 1)


def patch_displaypeoplebodyupdate(text: str) -> str:
    old = (
        "&lt;&lt;widget &quot;displaypeoplebodyupdate&quot;&gt;&gt;\n"
        "    &lt;&lt;set $peoplepage to 0&gt;&gt;\n"
        "    &lt;&lt;replace &quot;#display-people-body&quot;&gt;&gt;\n"
        "        &lt;&lt;displaypeoplebody&gt;&gt;\n"
        "    &lt;&lt;/replace&gt;&gt;\n"
        "&lt;&lt;/widget&gt;&gt;"
    )
    new = (
        "&lt;&lt;widget &quot;displaypeoplebodyupdate&quot;&gt;&gt;\n"
        "    &lt;&lt;set $peoplepage to 0&gt;&gt;\n"
        "    &lt;&lt;replace &quot;#display-people-body&quot;&gt;&gt;\n"
        "        &lt;&lt;displaypeoplebody _peopletab&gt;&gt;\n"
        "    &lt;&lt;/replace&gt;&gt;\n"
        "&lt;&lt;/widget&gt;&gt;"
    )
    if old not in text:
        if "&lt;&lt;displaypeoplebody _peopletab&gt;&gt;" in text:
            return text
        raise RuntimeError("displaypeoplebodyupdate anchor not found")
    return text.replace(old, new, 1)


def patch_socialfilters_init(text: str) -> str:
    replacements = [
        (
            "        &lt;&lt;if ndef $socialfilters&gt;&gt;\n"
            "            &lt;&lt;set $socialfilters to {}&gt;&gt;",
            "        &lt;&lt;if ndef $socialfilters or !$socialfilters or typeof $socialfilters isnot &quot;object&quot;&gt;&gt;\n"
            "            &lt;&lt;set $socialfilters to {}&gt;&gt;",
        ),
        (
            "        &lt;&lt;if ndef $traitfilters&gt;&gt;\n"
            "            &lt;&lt;set $traitfilters to {}&gt;&gt;",
            "        &lt;&lt;if ndef $traitfilters or !$traitfilters or typeof $traitfilters isnot &quot;object&quot;&gt;&gt;\n"
            "            &lt;&lt;set $traitfilters to {}&gt;&gt;",
        ),
    ]
    for old, new in replacements:
        if old in text:
            text = text.replace(old, new, 1)
    return text


def patch_get_tooltip_person(text: str) -> str:
    marker = "let nichekeys = (niches && typeof niches === \"object\") ? Object.keys(niches) : [];"
    if marker in text:
        return text
    old = (
        "\t\t\tlet niches = setup.people_niches();\n"
        "\t\t\tlet nichekeys = Object.keys(niches);"
    )
    new = (
        "\t\t\tlet niches = setup.people_niches();\n"
        "\t\t\tlet nichekeys = (niches && typeof niches === \"object\") ? Object.keys(niches) : [];"
    )
    if old not in text:
        raise RuntimeError("get_tooltip_person niche guard anchor not found")
    return text.replace(old, new, 1)


def patch_pronouns_null_guard(text: str) -> str:
    marker = "if (!pdata || !Array.isArray(pdata.species) || pdata.species.length < 2)"
    if marker in text:
        return text
    old = (
        "            let pdata = this.get_person(name);\n"
        "            sex = pdata.species[1];\n"
        "            pronouns = setup.get_gender_node(sex, \"pronouns\", pdata.species[0]);"
    )
    new = (
        "            let pdata = this.get_person(name);\n"
        "            if (!pdata || !Array.isArray(pdata.species) || pdata.species.length < 2)\n"
        "            {\n"
        "                sex = \"male\";\n"
        "                pronouns = setup.get_gender_node(sex, \"pronouns\");\n"
        "            }\n"
        "            else\n"
        "            {\n"
        "                sex = pdata.species[1];\n"
        "                pronouns = setup.get_gender_node(sex, \"pronouns\", pdata.species[0]);\n"
        "            }"
    )
    if old not in text:
        raise RuntimeError("pronouns null guard anchor not found")
    return text.replace(old, new, 1)


def patch_viewperson_safe_render(text: str) -> str:
    marker = "try { T.npchovertooltip = setup.get_tooltip_person(person); }"
    if marker in text:
        return text
    old = (
        "\t\t\tlet gender = setup.people.pronouns(person).gender;\n"
        "\n"
        "\t\t\tlet openelement = \"\";\n"
        "\t\t\tlet onclick = '\"SugarCube.setup.display_npc_dialog(\\'' + person.split('\\'').join('_apos_').split('&#39;').join('_apos_') + '\\', \\'' + name.split('\\'').join('_apos_').split('&#39;').join('_apos_') + '\\')\"';\n"
        "\t\t\tlet style = '\"color: ' + setup.get_color(gender + \"emlink\") + ';\"';\n"
        "\t\t\tT.npchovertooltip = setup.get_tooltip_person(person);\n"
        "\n"
        "\t\t\topenelement += '<a href=\"#\" onclick=' + onclick + ' class=\"nokeys\" style=' + style + '>';\n"
        "\t\t\tlet closeelement = '</a>';"
    )
    new = (
        "\t\t\tlet gender, openelement = \"\", closeelement = \"\";\n"
        "\t\t\ttry {\n"
        "\t\t\t\tgender = setup.people.pronouns(person).gender;\n"
        "\t\t\t\tlet onclick = '\"SugarCube.setup.display_npc_dialog(\\'' + person.split('\\'').join('_apos_').split('&#39;').join('_apos_') + '\\', \\'' + name.split('\\'').join('_apos_').split('&#39;').join('_apos_') + '\\')\"';\n"
        "\t\t\t\tlet style = '\"color: ' + setup.get_color(gender + \"emlink\") + ';\"';\n"
        "\t\t\t\ttry { T.npchovertooltip = setup.get_tooltip_person(person); }\n"
        "\t\t\t\tcatch (tex) { T.npchovertooltip = \"\"; }\n"
        "\t\t\t\topenelement += '<a href=\"#\" onclick=' + onclick + ' class=\"nokeys\" style=' + style + '>';\n"
        "\t\t\t\tcloseelement = '</a>';\n"
        "\t\t\t} catch (rex) {\n"
        "\t\t\t\tjQuery(this.output).wiki(this.payload[0].contents);\n"
        "\t\t\t\treturn;\n"
        "\t\t\t}"
    )
    if old not in text:
        raise RuntimeError("viewperson safe render anchor not found")
    return text.replace(old, new, 1)


def patch_anon_name_widgets(text: str) -> str:
    replacements = [
        (
            "&lt;&lt;set $lastnpcref to setup.people.get_name(_args[0]) || _args[0]&gt;&gt;&lt;&lt;set _personref to _args[0]&gt;&gt;",
            "&lt;&lt;set _personref to setup.people.get_name(_args[0]) || _args[0]&gt;&gt;&lt;&lt;set $lastnpcref to _personref&gt;&gt;",
        ),
        (
            "&lt;&lt;set $lastnpcref to setup.people.get_name(_args[0])&gt;&gt;&lt;&lt;set _personref to _args[0]&gt;&gt;",
            "&lt;&lt;set _personref to setup.people.get_name(_args[0]) || _args[0]&gt;&gt;&lt;&lt;set $lastnpcref to _personref&gt;&gt;",
        ),
    ]
    for old, new in replacements:
        if old in text:
            text = text.replace(old, new)
        elif new.split("&gt;&gt;")[0] + "&gt;&gt;" in text:
            continue
        else:
            raise RuntimeError(f"anon name widget anchor not found: {old[:60]}...")
    return text


def patch_relation_null_guard(text: str) -> str:
    marker = (
        "    const pdata = this.get_person(name);\n"
        "\n"
        "    if (!pdata || typeof pdata !== \"object\")\n"
        "        return [];\n"
        "\n"
        "    const rels = [];"
    )
    if marker in text:
        return text
    old = (
        "    const pdata = this.get_person(name);\n"
        "\n"
        "    const rels = [];"
    )
    new = (
        "    const pdata = this.get_person(name);\n"
        "\n"
        "    if (!pdata || typeof pdata !== \"object\")\n"
        "        return [];\n"
        "\n"
        "    const rels = [];"
    )
    if old not in text:
        raise RuntimeError("relation null guard anchor not found")
    return text.replace(old, new, 1)


def patch_people_niche_null_guard(text: str) -> str:
    niche_fn = "setup.people.niche = function(name)"
    niche_marker = (
        "    name = this.get_name(name);\n"
        '    const niches = (V.niches && typeof V.niches === "object") ? V.niches : {};'
    )
    if niche_fn in text and niche_marker in text:
        return text
    old = (
        "    name = this.get_name(name);\n"
        "    const niches = V.niches;\n"
        "    for (const niche of Object.keys(niches))"
    )
    new = (
        "    name = this.get_name(name);\n"
        '    const niches = (V.niches && typeof V.niches === "object") ? V.niches : {};\n'
        "    for (const niche of Object.keys(niches))"
    )
    if old not in text:
        if marker in text:
            return text
        raise RuntimeError("people.niche null guard anchor not found")
    return text.replace(old, new, 1)


def patch_is_anonymous_guard(text: str) -> str:
    marker = "if (!npc || typeof npc.is_anonymous !== \"function\") return true;"
    if marker in text:
        return text
    old = (
        "setup.people.is_anonymous = function(npc)\n"
        "{\n"
        "    if (typeof npc != \"object\")\n"
        "        npc = this.expand(npc);\n"
        "    return npc.is_anonymous();\n"
        "}"
    )
    new = (
        "setup.people.is_anonymous = function(npc)\n"
        "{\n"
        "    try\n"
        "    {\n"
        "        if (typeof npc != \"object\")\n"
        "            npc = this.expand(npc);\n"
        "        if (!npc || typeof npc.is_anonymous !== \"function\") return true;\n"
        "        return npc.is_anonymous();\n"
        "    }\n"
        "    catch (e)\n"
        "    {\n"
        "        return true;\n"
        "    }\n"
        "}"
    )
    if old not in text:
        raise RuntimeError("is_anonymous guard anchor not found")
    return text.replace(old, new, 1)


def patch_quickrelationship_widgets(text: str) -> str:
    old = (
        "&lt;&lt;widget &quot;quickrelationship&quot;&gt;&gt;\n"
        "\t&lt;&lt;set _p to _args[0]&gt;&gt;\n"
        "\t&lt;&lt;set _rel to setup.people.is_anonymous(_p) ? null : setup.people.relation(_p, [&quot;hallmate&quot;, &quot;classmate&quot;])&gt;&gt;\n"
        "    &lt;&lt;if _rel &amp;&amp; _rel.length gt 0&gt;&gt;\n"
        "        your &lt;&lt;and _rel&gt;&gt;\n"
        "    &lt;&lt;/if&gt;&gt;\n"
        "&lt;&lt;/widget&gt;&gt;\n"
        "\n"
        "&lt;&lt;widget &quot;quickrelationshipc&quot;&gt;&gt;\n"
        "\t&lt;&lt;set _p to _args[0]&gt;&gt;\n"
        "\t&lt;&lt;set _rel to setup.people.is_anonymous(_p) ? null : setup.people.relation(_p, [&quot;hallmate&quot;, &quot;classmate&quot;])&gt;&gt;\n"
        "    &lt;&lt;if _rel &amp;&amp; _rel.length gt 0&gt;&gt;\n"
        "        Your &lt;&lt;and _rel&gt;&gt;\n"
        "    &lt;&lt;/if&gt;&gt;\n"
        "&lt;&lt;/widget&gt;&gt;"
    )
    new = (
        "&lt;&lt;widget &quot;quickrelationship&quot;&gt;&gt;\n"
        "\t&lt;&lt;set _p to setup.people.get_name(_args[0]) || _args[0]&gt;&gt;\n"
        "\t&lt;&lt;set _rel to setup.people.is_anonymous(_p) ? null : setup.people.relation(_p, [&quot;hallmate&quot;, &quot;classmate&quot;])&gt;&gt;\n"
        "    &lt;&lt;if _rel &amp;&amp; _rel.length gt 0&gt;&gt;\n"
        "        your &lt;&lt;and _rel&gt;&gt;\n"
        "    &lt;&lt;/if&gt;&gt;\n"
        "&lt;&lt;/widget&gt;&gt;\n"
        "\n"
        "&lt;&lt;widget &quot;quickrelationshipc&quot;&gt;&gt;\n"
        "\t&lt;&lt;set _p to setup.people.get_name(_args[0]) || _args[0]&gt;&gt;\n"
        "\t&lt;&lt;set _rel to setup.people.is_anonymous(_p) ? null : setup.people.relation(_p, [&quot;hallmate&quot;, &quot;classmate&quot;])&gt;&gt;\n"
        "    &lt;&lt;if _rel &amp;&amp; _rel.length gt 0&gt;&gt;\n"
        "        Your &lt;&lt;and _rel&gt;&gt;\n"
        "    &lt;&lt;/if&gt;&gt;\n"
        "&lt;&lt;/widget&gt;&gt;"
    )
    if old not in text:
        if "setup.people.get_name(_args[0]) || _args[0]" in text and "quickrelationshipc" in text:
            return text
        raise RuntimeError("quickrelationship widget anchor not found")
    return text.replace(old, new, 1)


def patch_anonorfullnamerel_widgets(text: str) -> str:
    replacements = [
        (
            "&lt;&lt;widget &quot;anonorfullnamerelc&quot;&gt;&gt;&lt;span class=&quot;inline-natural-language&quot;&gt;"
            "&lt;&lt;if setup.people.relation(_args[0], [&quot;classmate&quot;, &quot;hallmate&quot;]) and setup.people.can_identify_name(_args[0])&gt;&gt;"
            "&lt;&lt;quickrelationshipc _args[0]&gt;&gt; &lt;&lt;anonorfullname _args[0]&gt;&gt;"
            "&lt;&lt;else&gt;&gt;&lt;&lt;anonorfullnamec _args[0]&gt;&gt;&lt;&lt;/if&gt;&gt;&lt;/span&gt;&lt;&lt;/widget&gt;&gt;",
            "&lt;&lt;widget &quot;anonorfullnamerelc&quot;&gt;&gt;&lt;span class=&quot;inline-natural-language&quot;&gt;"
            "&lt;&lt;set _p to setup.people.get_name(_args[0]) || _args[0]&gt;&gt;"
            "&lt;&lt;set _rel to setup.people.relation(_p, [&quot;classmate&quot;, &quot;hallmate&quot;])&gt;&gt;"
            "&lt;&lt;if _rel.length gt 0 and setup.people.can_identify_name(_p)&gt;&gt;"
            "&lt;&lt;quickrelationshipc _p&gt;&gt; &lt;&lt;anonorfullname _p&gt;&gt;"
            "&lt;&lt;else&gt;&gt;&lt;&lt;anonorfullnamec _p&gt;&gt;&lt;&lt;/if&gt;&gt;&lt;/span&gt;&lt;&lt;/widget&gt;&gt;",
        ),
        (
            "&lt;&lt;widget &quot;anonorfullnamerel&quot;&gt;&gt;&lt;span class=&quot;inline-natural-language&quot;&gt;"
            "&lt;&lt;if setup.people.relation(_args[0], [&quot;classmate&quot;, &quot;hallmate&quot;]) and setup.people.can_identify_name(_args[0])&gt;&gt;"
            "&lt;&lt;quickrelationship _args[0]&gt;&gt; &lt;&lt;/if&gt;&gt;&lt;&lt;anonorfullname _args[0]&gt;&gt;&lt;/span&gt;&lt;&lt;/widget&gt;&gt;",
            "&lt;&lt;widget &quot;anonorfullnamerel&quot;&gt;&gt;&lt;span class=&quot;inline-natural-language&quot;&gt;"
            "&lt;&lt;set _p to setup.people.get_name(_args[0]) || _args[0]&gt;&gt;"
            "&lt;&lt;set _rel to setup.people.relation(_p, [&quot;classmate&quot;, &quot;hallmate&quot;])&gt;&gt;"
            "&lt;&lt;if _rel.length gt 0 and setup.people.can_identify_name(_p)&gt;&gt;"
            "&lt;&lt;quickrelationship _p&gt;&gt; &lt;&lt;/if&gt;&gt;&lt;&lt;anonorfullname _p&gt;&gt;&lt;/span&gt;&lt;&lt;/widget&gt;&gt;",
        ),
    ]
    for old, new in replacements:
        if old in text:
            text = text.replace(old, new, 1)
        elif "_rel.length gt 0 and setup.people.can_identify_name(_p)" in text:
            continue
        else:
            raise RuntimeError(f"anonorfullnamerel widget anchor not found: {old[:80]}...")
    return text


def patch_turnon_factor_safe(text: str) -> str:
    marker = "if (!npc || typeof npc.has_turnon_characteristic !== \"function\") return 0;"
    if marker in text:
        return text
    old = (
        "setup.people.turnon_factor = function(npc, turnons, turnoffs, turnonmult = 1, turnoffmult = 1, clamp =  true)\n"
        "{\n"
        "    npc = this.expand(npc);\n"
        "    let retval = 0;\n"
        "    for (let i = 0; i < turnons.length; i++)\n"
        "        if (npc.has_turnon_characteristic(turnons[i]))\n"
        "            retval += turnonmult;\n"
        "    for (let i = 0; i < turnoffs.length; i++)\n"
        "        if (npc.has_turnon_characteristic(turnoffs[i]))\n"
        "            retval -= turnoffmult;\n"
        "\n"
        "    return clamp ? Math.clamp(Math.round(retval), -2, 2) : Math.round(retval);\n"
        "}"
    )
    new = (
        "setup.people.turnon_factor = function(npc, turnons, turnoffs, turnonmult = 1, turnoffmult = 1, clamp =  true)\n"
        "{\n"
        "    if (!Array.isArray(turnons) || !Array.isArray(turnoffs)) return 0;\n"
        "    try { npc = this.expand(npc); }\n"
        "    catch (e) { return 0; }\n"
        "    if (!npc || typeof npc.has_turnon_characteristic !== \"function\") return 0;\n"
        "    let retval = 0;\n"
        "    for (let i = 0; i < turnons.length; i++)\n"
        "    {\n"
        "        try {\n"
        "            if (npc.has_turnon_characteristic(turnons[i]))\n"
        "                retval += turnonmult;\n"
        "        } catch (e) {}\n"
        "    }\n"
        "    for (let i = 0; i < turnoffs.length; i++)\n"
        "    {\n"
        "        try {\n"
        "            if (npc.has_turnon_characteristic(turnoffs[i]))\n"
        "                retval -= turnoffmult;\n"
        "        } catch (e) {}\n"
        "    }\n"
        "\n"
        "    return clamp ? Math.clamp(Math.round(retval), -2, 2) : Math.round(retval);\n"
        "}"
    )
    if old not in text:
        raise RuntimeError("turnon_factor safe anchor not found")
    return text.replace(old, new, 1)


def patch_has_turnon_characteristic_safe(text: str) -> str:
    marker = "if (!tinfo || typeof tinfo.condition !== \"function\") return false;"
    if marker in text:
        return text
    old = (
        "    has_turnon_characteristic(turnon)\n"
        "    {\n"
        "        let tinfo = setup.turnons[turnon];\n"
        "        return tinfo.condition(this);\n"
        "    }"
    )
    new = (
        "    has_turnon_characteristic(turnon)\n"
        "    {\n"
        "        let tinfo = setup.turnons && setup.turnons[turnon];\n"
        "        if (!tinfo || typeof tinfo.condition !== \"function\") return false;\n"
        "        try { return tinfo.condition(this); }\n"
        "        catch (e) { return false; }\n"
        "    }"
    )
    if old not in text:
        raise RuntimeError("has_turnon_characteristic safe anchor not found")
    return text.replace(old, new, 1)


def patch_pc_attraction_factor_safe(text: str) -> str:
    replacements = [
        (
            "setup.people.pc_turnon_factor = function(name)\n"
            "{\n"
            "    if (!V.pcturnons || !V.pcturnoffs) return 0;\n"
            "    return this.turnon_factor(name, V.pcturnons, V.pcturnoffs, 1, 2);\n"
            "}",
            "setup.people.pc_turnon_factor = function(name)\n"
            "{\n"
            "    if (!Array.isArray(V.pcturnons) || !Array.isArray(V.pcturnoffs)) return 0;\n"
            "    try { return this.turnon_factor(name, V.pcturnons, V.pcturnoffs, 1, 2); }\n"
            "    catch (e) { return 0; }\n"
            "}",
        ),
        (
            "setup.people.pc_attraction_factor = function(name)\n"
            "{\n"
            "    if (!V.pcturnons || !V.pcturnoffs) return 0;\n"
            "    return this.turnon_factor(name, V.pcturnons, V.pcturnoffs, 1, 1, false);\n"
            "}",
            "setup.people.pc_attraction_factor = function(name)\n"
            "{\n"
            "    if (!Array.isArray(V.pcturnons) || !Array.isArray(V.pcturnoffs)) return 0;\n"
            "    try { return this.turnon_factor(name, V.pcturnons, V.pcturnoffs, 1, 1, false); }\n"
            "    catch (e) { return 0; }\n"
            "}",
        ),
    ]
    for old, new in replacements:
        if old in text:
            text = text.replace(old, new, 1)
        elif new.split("\n")[1].strip() in text:
            continue
        else:
            raise RuntimeError("pc_attraction_factor safe anchor not found")
    return text


def patch_pc_attracted_to_guard(text: str) -> str:
    marker = "if (!V.pcsexualprefs || !Array.isArray(V.pcsexualprefs)) return false;"
    if marker in text:
        return text
    old = (
        "    const genders = [...V.pcsexualprefs];\n"
        "    if (inclusive && !genders.includesAny([\"male\", \"female\"]))"
    )
    new = (
        "    if (!V.pcsexualprefs || !Array.isArray(V.pcsexualprefs)) return false;\n"
        "    const genders = [...V.pcsexualprefs];\n"
        "    if (inclusive && !genders.includesAny([\"male\", \"female\"]))"
    )
    if old not in text:
        raise RuntimeError("pc_attracted_to guard anchor not found")
    return text.replace(old, new, 1)


def patch_inclinations_special_seeds_guard(text: str) -> str:
    marker = "const specialSeeds = (setup.Worldgen && setup.Worldgen.special_seeds"
    if marker in text:
        return text
    old = (
        "        const ordered_specialseeds = Object.keys(setup.Worldgen.special_seeds)\n"
        "            .filter(special => V.seed.includes(special))\n"
        "            .map(specialseed => {\n"
        "                const index = V.seed.indexOf(specialseed);\n"
        "                const nextChar = V.seed[index + specialseed.length];\n"
        "                const chance =\n"
        "                    (nextChar >= '1' && nextChar <= '9')\n"
        "                        ? (nextChar.charCodeAt(0) - '0'.charCodeAt(0)) / 10\n"
        "                        : 1;\n"
        "\n"
        "                return {specialseed, index, chance};\n"
        "            })\n"
        "            .sort((a, b) => a.index - b.index);\n"
        "\n"
        "        for (let { specialseed, chance } of ordered_specialseeds)\n"
        "        {\n"
        "            if (rng.random() < chance) {\n"
        "                for (let inc of setup.Worldgen.special_seeds[specialseed].addinclinations ?? []) {\n"
        "                    if (!inclins.includes(inc)) inclins.push(inc);\n"
        "                }\n"
        "\n"
        "                for (let inc of setup.Worldgen.special_seeds[specialseed].reminclinations ?? []) {\n"
        "                    inclins = inclins.filter(i => i !== inc);\n"
        "                }\n"
        "            }\n"
        "        }"
    )
    new = (
        "        const specialSeeds = (setup.Worldgen && setup.Worldgen.special_seeds && typeof setup.Worldgen.special_seeds === \"object\") ? setup.Worldgen.special_seeds : {};\n"
        "        const seedStr = (typeof V.seed === \"string\") ? V.seed : \"\";\n"
        "        const ordered_specialseeds = Object.keys(specialSeeds)\n"
        "            .filter(special => seedStr.includes(special))\n"
        "            .map(specialseed => {\n"
        "                const index = seedStr.indexOf(specialseed);\n"
        "                const nextChar = seedStr[index + specialseed.length];\n"
        "                const chance =\n"
        "                    (nextChar >= '1' && nextChar <= '9')\n"
        "                        ? (nextChar.charCodeAt(0) - '0'.charCodeAt(0)) / 10\n"
        "                        : 1;\n"
        "\n"
        "                return {specialseed, index, chance};\n"
        "            })\n"
        "            .sort((a, b) => a.index - b.index);\n"
        "\n"
        "        for (let { specialseed, chance } of ordered_specialseeds)\n"
        "        {\n"
        "            if (rng.random() < chance) {\n"
        "                for (let inc of specialSeeds[specialseed].addinclinations ?? []) {\n"
        "                    if (!inclins.includes(inc)) inclins.push(inc);\n"
        "                }\n"
        "\n"
        "                for (let inc of specialSeeds[specialseed].reminclinations ?? []) {\n"
        "                    inclins = inclins.filter(i => i !== inc);\n"
        "                }\n"
        "            }\n"
        "        }"
    )
    if old not in text:
        raise RuntimeError("inclinations special_seeds guard anchor not found")
    return text.replace(old, new, 1)


def patch_calcstyle_tattoos_guard(text: str) -> str:
    marker = "Object.entries(this.tattoos || {})"
    if marker in text:
        return text
    old = "            for (const [tatloc, tat] of Object.entries(this.tattoos))"
    new = "            for (const [tatloc, tat] of Object.entries(this.tattoos || {}))"
    if old not in text:
        if marker in text:
            return text
        raise RuntimeError("calcstyle tattoos guard anchor not found")
    return text.replace(old, new, 1)


def patch_npcattraction_widget(text: str) -> str:
    old = (
        "&lt;&lt;widget &quot;npcattraction&quot;&gt;&gt;\n"
        "\t&lt;&lt;set _attnpc to _args[0] || $lastnpcref&gt;&gt;\n"
        "\t&lt;&lt;set _verbose to _args.includes(&quot;verbose&quot;)&gt;&gt;\n"
        "\t&lt;&lt;set _ignorerel to _args.includes(&quot;ignorerelationship&quot;)&gt;&gt;\n"
        "\t&lt;&lt;if setup.people.pc_attracted_to(_attnpc) and (_ignorerel or !setup.Relationships.relationship_with(_attnpc))&gt;&gt;\n"
        "\t\t&lt;&lt;set _turnonfactor to setup.people.pc_attraction_factor(_attnpc)&gt;&gt;"
    )
    new = (
        "&lt;&lt;widget &quot;npcattraction&quot;&gt;&gt;\n"
        "\t&lt;&lt;set _attnpc to setup.people.get_name(_args[0] || $lastnpcref) || _args[0] || $lastnpcref&gt;&gt;\n"
        "\t&lt;&lt;set _verbose to _args.includes(&quot;verbose&quot;)&gt;&gt;\n"
        "\t&lt;&lt;set _ignorerel to _args.includes(&quot;ignorerelationship&quot;)&gt;&gt;\n"
        "\t&lt;&lt;if setup.people.pc_attracted_to(_attnpc) and (_ignorerel or !setup.Relationships.relationship_with(_attnpc))&gt;&gt;\n"
        "\t\t&lt;&lt;set _turnonfactor to 0&gt;&gt;\n"
        "\t\t&lt;&lt;script&gt;&gt;\n"
        "try { T._turnonfactor = setup.people.pc_attraction_factor(T._attnpc); }\n"
        "catch (e) { T._turnonfactor = 0; }\n"
        "&lt;&lt;/script&gt;&gt;\n"
        "\t\t&lt;&lt;set _turnonfactor to T._turnonfactor&gt;&gt;"
    )
    if old in text:
        return text.replace(old, new, 1)
    if "T._turnonfactor = setup.people.pc_attraction_factor" in text:
        return text
    raise RuntimeError("npcattraction widget anchor not found")


def patch_interactionstoday_checkvars(text: str) -> str:
    old = "!Object.keys($interactionstoday).includes($eventnpc)"
    new = (
        "typeof $interactionstoday !== &quot;object&quot; "
        "or !Object.keys($interactionstoday).includes($eventnpc)"
    )
    if old not in text:
        if "typeof $interactionstoday !==" in text:
            return text
        return text
    return text.replace(old, new)


def patch_beachleadname_widgets(text: str) -> str:
    old_c = (
        "&lt;&lt;widget &quot;beachleadnamec&quot;&gt;&gt;\n"
        "&lt;&lt;if $beachhangoutlead&gt;&gt;&lt;&lt;anonorfullnamec $beachhangoutlead&gt;&gt;&lt;&lt;else&gt;&gt;Someone&lt;&lt;/if&gt;&gt;\n"
        "&lt;&lt;/widget&gt;&gt;"
    )
    new_c = (
        "&lt;&lt;widget &quot;beachleadnamec&quot;&gt;&gt;\n"
        "&lt;&lt;if $beachhangoutlead and setup.LakeBeach.is_valid_person($beachhangoutlead)&gt;&gt;"
        "&lt;&lt;anonorfullnamec setup.people.get_name($beachhangoutlead)&gt;&gt;"
        "&lt;&lt;else&gt;&gt;Someone&lt;&lt;/if&gt;&gt;\n"
        "&lt;&lt;/widget&gt;&gt;"
    )
    old = (
        "&lt;&lt;widget &quot;beachleadname&quot;&gt;&gt;\n"
        "&lt;&lt;if $beachhangoutlead&gt;&gt;&lt;&lt;anonorfullname $beachhangoutlead&gt;&gt;&lt;&lt;else&gt;&gt;someone&lt;&lt;/if&gt;&gt;\n"
        "&lt;&lt;/widget&gt;&gt;"
    )
    new = (
        "&lt;&lt;widget &quot;beachleadname&quot;&gt;&gt;\n"
        "&lt;&lt;if $beachhangoutlead and setup.LakeBeach.is_valid_person($beachhangoutlead)&gt;&gt;"
        "&lt;&lt;anonorfullname setup.people.get_name($beachhangoutlead)&gt;&gt;"
        "&lt;&lt;else&gt;&gt;someone&lt;&lt;/if&gt;&gt;\n"
        "&lt;&lt;/widget&gt;&gt;"
    )
    if old_c in text:
        text = text.replace(old_c, new_c, 1)
    elif "setup.LakeBeach.is_valid_person($beachhangoutlead)" in text:
        pass
    else:
        raise RuntimeError("beachleadnamec widget anchor not found")
    if old in text:
        text = text.replace(old, new, 1)
    elif "setup.LakeBeach.is_valid_person($beachhangoutlead)" in text:
        pass
    else:
        raise RuntimeError("beachleadname widget anchor not found")
    return text


def patch_people_db_null_guard(text: str) -> str:
    marker = 'return (db && typeof db === "object") ? db : {};'
    if marker in text and "setup.people_db = function" in text:
        return text
    old = (
        "setup.people_db = function()\n"
        "{\n"
        "    let db = setup.static_people ? setup.people.db : V.people;\n"
        "    return db;\n"
        "}"
    )
    new = (
        "setup.people_db = function()\n"
        "{\n"
        "    let db = setup.static_people ? setup.people.db : V.people;\n"
        "    return (db && typeof db === \"object\") ? db : {};\n"
        "}"
    )
    if old not in text:
        raise RuntimeError("people_db null guard anchor not found")
    return text.replace(old, new, 1)


def patch_people_niches_fn_null_guard(text: str) -> str:
    marker = 'return (db && typeof db === "object") ? db : {};'
    idx = text.find("setup.people_niches = function")
    if idx < 0:
        raise RuntimeError("people_niches function not found")
    chunk = text[idx:idx + 300]
    if marker in chunk:
        return text
    old = (
        "setup.people_niches = function()\n"
        "{\n"
        "    let db = setup.static_people ? setup.people.niches : V.niches;\n"
        "    return db;\n"
        "}"
    )
    new = (
        "setup.people_niches = function()\n"
        "{\n"
        "    let db = setup.static_people ? setup.people.niches : V.niches;\n"
        "    return (db && typeof db === \"object\") ? db : {};\n"
        "}"
    )
    if old not in text:
        raise RuntimeError("people_niches fn null guard anchor not found")
    return text.replace(old, new, 1)


def patch_display_npc_dialog(text: str) -> str:
    db_guard = (
        "\tconst db = setup.people_db();\n"
        "\tif (!person || !db || typeof db !== \"object\" || !(person in db))\n"
        "\t\treturn;\n"
    )
    if db_guard in text:
        text = text.replace(db_guard, "", 1)
    marker = "try { person = setup.people.get_name(person) || person; }"
    if marker in text:
        return text
    old = (
        "setup.display_npc_dialog = function(person, label=\"\")\n"
        "{\n"
        "\tif (typeof person == \"string\")\n"
        "\t\tperson = person.split('_apos_').join('\\'');\n"
        "\tlabel = label.split('_apos_').join('\\'');\n"
        "\tState.setVar(\"$npctodisplay\", person);\n"
        "\tDialog.setup(\"View Person\", \"view-person\");\n"
        "\tDialog.wiki(Story.get(\"DisplayNPC\").processText());\n"
        "\tDialog.open();\n"
        "}"
    )
    new = (
        "setup.display_npc_dialog = function(person, label=\"\")\n"
        "{\n"
        "\tif (typeof person == \"string\")\n"
        "\t\tperson = person.split('_apos_').join('\\'');\n"
        "\tlabel = label.split('_apos_').join('\\'');\n"
        "\tif (person && typeof person === \"object\" && person.person)\n"
        "\t\tperson = person.person;\n"
        "\ttry { person = setup.people.get_name(person) || person; }\n"
        "\tcatch (e) { return; }\n"
        "\tif (!person) return;\n"
        "\tState.setVar(\"$npctodisplay\", person);\n"
        "\tDialog.setup(\"View Person\", \"view-person\");\n"
        "\tDialog.wiki(Story.get(\"DisplayNPC\").processText());\n"
        "\tDialog.open();\n"
        "}"
    )
    if old not in text:
        raise RuntimeError("display_npc_dialog anchor not found")
    return text.replace(old, new, 1)


def _displaynpc_twee_init() -> str:
    return (
        "&lt;&lt;unset _pobj&gt;&gt;\n"
        "&lt;&lt;unset _personobj&gt;&gt;\n"
        "&lt;&lt;if typeof $npctodisplay is &quot;string&quot;&gt;&gt;\n"
        "    &lt;&lt;if $encounter&gt;&gt;\n"
        "        &lt;&lt;set _pobj to $encounter.pobj($npctodisplay)&gt;&gt;\n"
        "    &lt;&lt;/if&gt;&gt;\n"
        "    &lt;&lt;if _pobj&gt;&gt;\n"
        "        &lt;&lt;set _personobj to _pobj&gt;&gt;\n"
        "    &lt;&lt;else&gt;&gt;\n"
        "        &lt;&lt;script&gt;&gt;\n"
        "        try { T.personobj = new Person({person: V.npctodisplay}); }\n"
        "        catch (e) { T.personobj = null; }\n"
        "        &lt;&lt;/script&gt;&gt;\n"
        "        &lt;&lt;set _personobj to T.personobj&gt;&gt;\n"
        "    &lt;&lt;/if&gt;&gt;\n"
        "&lt;&lt;elseif $npctodisplay and typeof $npctodisplay is &quot;object&quot;&gt;&gt;\n"
        "    &lt;&lt;set _personobj to $npctodisplay&gt;&gt;\n"
        "&lt;&lt;/if&gt;&gt;\n"
        "\n"
        "&lt;&lt;if ndef _personobj or !_personobj or !_personobj.person&gt;&gt;\n"
        "&lt;span class=&quot;notice&quot;&gt;Unable to display this person.&lt;/span&gt;\n"
        "&lt;&lt;else&gt;&gt;\n"
        "&lt;&lt;set _temp to _personobj.temporary&gt;&gt;"
    )


def _patch_displaynpc_personobj_guard(text: str) -> str:
    old_guard = "&lt;&lt;if !_personobj or !_personobj.person&gt;&gt;"
    new_guard = "&lt;&lt;if ndef _personobj or !_personobj or !_personobj.person&gt;&gt;"
    if old_guard in text:
        text = text.replace(old_guard, new_guard, 1)
    return text


def patch_display_npc_passage(text: str) -> str:
    script_init_marker = "T._displaynpc_invalid"
    if script_init_marker in text:
        script_old = (
            "&lt;&lt;script&gt;&gt;\n"
            "(function() {\n"
            "    const fail = () =&gt; { T._personobj = null; T._displaynpc_invalid = true; };\n"
            "    try {\n"
            "        let raw = V.npctodisplay;\n"
            "        if (raw &amp;&amp; typeof raw === &quot;object&quot; &amp;&amp; !Array.isArray(raw)) {\n"
            "            T._personobj = raw;\n"
            "            T._displaynpc_invalid = !(raw.person || raw.name);\n"
            "            return;\n"
            "        }\n"
            "        if (typeof raw !== &quot;string&quot; || !raw) return fail();\n"
            "        let name = setup.people.get_name(raw) || raw;\n"
            "        let pobj = null;\n"
            "        if (V.encounter &amp;&amp; V.encounter.pobj) {\n"
            "            try { pobj = V.encounter.pobj(name); } catch (e) {}\n"
            "        }\n"
            "        if (!pobj) {\n"
            "            try { pobj = new Person({person: name}); } catch (e) { return fail(); }\n"
            "        }\n"
            "        if (!pobj || !pobj.person) return fail();\n"
            "        T._personobj = pobj;\n"
            "        T._displaynpc_invalid = false;\n"
            "    } catch (e) { fail(); }\n"
            "})();\n"
            "&lt;&lt;/script&gt;&gt;\n"
            "&lt;&lt;set _personobj to T._personobj&gt;&gt;\n"
            "&lt;&lt;set _displaynpc_invalid to T._displaynpc_invalid&gt;&gt;\n"
            "&lt;&lt;if _displaynpc_invalid or !_personobj&gt;&gt;\n"
            "&lt;span class=&quot;notice&quot;&gt;Unable to display this person.&lt;/span&gt;\n"
            "&lt;&lt;else&gt;&gt;\n"
            "&lt;&lt;set _temp to _personobj.temporary&gt;&gt;"
        )
        if script_old in text:
            text = text.replace(script_old, _displaynpc_twee_init(), 1)
        else:
            raise RuntimeError("DisplayNPC script init anchor not found")
    unsafe_init = (
        "    &lt;&lt;set _personobj to _pobj || new Person({person: $npctodisplay})&gt;&gt;\n"
        "&lt;&lt;else&gt;&gt;\n"
        "    &lt;&lt;set _personobj to $npctodisplay&gt;&gt;"
    )
    if unsafe_init in text:
        text = text.replace(unsafe_init, (
            "    &lt;&lt;if _pobj&gt;&gt;\n"
            "        &lt;&lt;set _personobj to _pobj&gt;&gt;\n"
            "    &lt;&lt;else&gt;&gt;\n"
            "        &lt;&lt;script&gt;&gt;\n"
            "        try { T.personobj = new Person({person: V.npctodisplay}); }\n"
            "        catch (e) { T.personobj = null; }\n"
            "        &lt;&lt;/script&gt;&gt;\n"
            "        &lt;&lt;set _personobj to T.personobj&gt;&gt;\n"
            "    &lt;&lt;/if&gt;&gt;\n"
            "&lt;&lt;elseif $npctodisplay and typeof $npctodisplay is &quot;object&quot;&gt;&gt;\n"
            "    &lt;&lt;set _personobj to $npctodisplay&gt;&gt;"
        ), 1)
        if "&lt;&lt;unset _personobj&gt;&gt;" not in text:
            text = text.replace("&lt;&lt;unset _pobj&gt;&gt;\n", "&lt;&lt;unset _pobj&gt;&gt;\n&lt;&lt;unset _personobj&gt;&gt;\n", 1)
    script_without_assign = (
        "        &lt;&lt;script&gt;&gt;\n"
        "        try { T.personobj = new Person({person: V.npctodisplay}); }\n"
        "        catch (e) { T.personobj = null; }\n"
        "        &lt;&lt;/script&gt;&gt;\n"
        "    &lt;&lt;/if&gt;&gt;"
    )
    script_with_assign = (
        "        &lt;&lt;script&gt;&gt;\n"
        "        try { T.personobj = new Person({person: V.npctodisplay}); }\n"
        "        catch (e) { T.personobj = null; }\n"
        "        &lt;&lt;/script&gt;&gt;\n"
        "        &lt;&lt;set _personobj to T.personobj&gt;&gt;\n"
        "    &lt;&lt;/if&gt;&gt;"
    )
    if script_without_assign in text:
        text = text.replace(script_without_assign, script_with_assign, 1)
    personobj_assign_marker = "&lt;&lt;set _personobj to T.personobj&gt;&gt;"
    safe_marker = "try { T.personobj = new Person({person: V.npctodisplay}); }"
    if safe_marker in text and personobj_assign_marker in text:
        return text
    twee_marker = "&lt;&lt;if !_personobj or !_personobj.person&gt;&gt;"
    if twee_marker in text:
        return text
    init_old = (
        "&lt;&lt;unset _pobj&gt;&gt;\n"
        "&lt;&lt;if typeof $npctodisplay is &quot;string&quot;&gt;&gt;\n"
        "    &lt;&lt;if $encounter&gt;&gt;\n"
        "        &lt;&lt;set _pobj to $encounter.pobj($npctodisplay)&gt;&gt;\n"
        "    &lt;&lt;/if&gt;&gt;\n"
        "    &lt;&lt;set _personobj to _pobj || new Person({person: $npctodisplay})&gt;&gt;\n"
        "&lt;&lt;else&gt;&gt;\n"
        "    &lt;&lt;set _personobj to $npctodisplay&gt;&gt;\n"
        "&lt;&lt;/if&gt;&gt;\n"
        "\n"
        "&lt;&lt;set _temp to _personobj.temporary&gt;&gt;"
    )
    init_new = _displaynpc_twee_init()
    close_old = (
        "&lt;&lt;/tabgroup&gt;&gt;\n"
        "\n"
        "&lt;&lt;unset $fromphone&gt;&gt;</tw-passagedata><tw-passagedata pid=\"5720\" name=\"DisplayNPCAppearanceWidgets\""
    )
    close_new = (
        "&lt;&lt;/tabgroup&gt;&gt;\n"
        "\n"
        "&lt;&lt;unset $fromphone&gt;&gt;\n"
        "&lt;&lt;/if&gt;&gt;</tw-passagedata><tw-passagedata pid=\"5720\" name=\"DisplayNPCAppearanceWidgets\""
    )
    if init_old not in text:
        raise RuntimeError("DisplayNPC init anchor not found")
    if close_old not in text:
        raise RuntimeError("DisplayNPC close anchor not found")
    text = text.replace(init_old, init_new, 1)
    return text.replace(close_old, close_new, 1)


def patch_subarchetype_guard(text: str) -> str:
    marker = "if (!archetype || typeof archetype !== \"object\" || !(\"subarchetypes\" in archetype))"
    if marker in text:
        return text
    old = (
        "    let archetype = setup.archetypes[this.archetype(name)];\n"
        "\n"
        "    if (!(\"subarchetypes\" in archetype)) return \"none\";"
    )
    new = (
        "    let archetype = setup.archetypes[this.archetype(name)];\n"
        "\n"
        "    if (!archetype || typeof archetype !== \"object\" || !(\"subarchetypes\" in archetype)) return \"none\";"
    )
    if old not in text:
        raise RuntimeError("subarchetype guard anchor not found")
    return text.replace(old, new, 1)


def patch_get_personality_traits_guard(text: str) -> str:
    marker = "if (!traits || typeof traits !== \"object\") return [];"
    if marker in text:
        return text
    old = (
        "setup.people.get_personality_traits = function(name)\n"
        "{\n"
        "    return Object.keys(this.personality_traits).filter(trait => this.has_personality_trait(name, trait));\n"
        "}"
    )
    new = (
        "setup.people.get_personality_traits = function(name)\n"
        "{\n"
        "    const traits = this.personality_traits;\n"
        "    if (!traits || typeof traits !== \"object\") return [];\n"
        "    return Object.keys(traits).filter(trait => this.has_personality_trait(name, trait));\n"
        "}"
    )
    if old not in text:
        raise RuntimeError("get_personality_traits guard anchor not found")
    return text.replace(old, new, 1)


def patch_get_person_null_guard(text: str) -> str:
    marker = "if (!db || typeof db !== \"object\") return null;"
    if marker in text:
        return text
    old = (
        "setup.people.get_person = function(i)\n"
        "{\n"
        "    let db = setup.people_db();\n"
        "    if (typeof i == \"string\" || typeof i == \"object\")"
    )
    new = (
        "setup.people.get_person = function(i)\n"
        "{\n"
        "    let db = setup.people_db();\n"
        "    if (!db || typeof db !== \"object\") return null;\n"
        "    if (typeof i == \"string\" || typeof i == \"object\")"
    )
    if old not in text:
        raise RuntimeError("get_person null guard anchor not found")
    return text.replace(old, new, 1)


def patch_person_constructor_pdata_guard(text: str) -> str:
    marker = "if (!pdata || typeof pdata !== \"object\") throw new Error(\"Missing person record\");"
    multiline_marker = (
        '                        pdata = setup.people.get_person(person);\n'
        '                        if (!pdata || typeof pdata !== "object")\n'
        '                            throw new Error("Missing person record");'
    )
    if marker in text or multiline_marker in text:
        return text
    old = (
        "                        pdata = setup.people.get_person(person);\n"
        "\n"
        "                        // set basic data\n"
        "                        this.name = person;"
    )
    new = (
        "                        pdata = setup.people.get_person(person);\n"
        "                        if (!pdata || typeof pdata !== \"object\")\n"
        "                            throw new Error(\"Missing person record\");\n"
        "\n"
        "                        // set basic data\n"
        "                        this.name = person;"
    )
    if old not in text:
        raise RuntimeError("Person constructor pdata guard anchor not found")
    return text.replace(old, new, 1)


def patch_displaynpc_pdata_guard(text: str) -> str:
    replacements = [
        (
            "&lt;&lt;set _pdata to setup.people_db()[_personobj.person]&gt;&gt;",
            "&lt;&lt;set _pdata to setup.people_db()[_personobj.person] || {}&gt;&gt;",
        ),
        (
            "&lt;&lt;if &quot;job&quot; in _pdata and $jobs.includes(_pdata.job)&gt;&gt;",
            "&lt;&lt;if _pdata and &quot;job&quot; in _pdata and $jobs.includes(_pdata.job)&gt;&gt;",
        ),
        (
            "&lt;&lt;if _pdata.courses&gt;&gt;",
            "&lt;&lt;if _pdata and _pdata.courses&gt;&gt;",
        ),
    ]
    for old, new in replacements:
        if old in text:
            text = text.replace(old, new)
        elif new.split("&gt;&gt;")[0] + "&gt;&gt;" in text:
            continue
        else:
            raise RuntimeError(f"displaynpc pdata guard anchor not found: {old[:60]}...")
    return text


def patch_displaynpcsubtitles_niches(text: str) -> str:
    old_script = (
        "T._nichekeys = (_nichemap &amp;&amp; typeof _nichemap === &quot;object&quot;) ? Object.keys(_nichemap) : [];\n"
        "&lt;&lt;/script&gt;&gt;\n"
        "        &lt;&lt;set _nichekeys to T._nichekeys&gt;&gt;"
    )
    new_script = (
        "T.nichekeys = (_nichemap &amp;&amp; typeof _nichemap === &quot;object&quot;) ? Object.keys(_nichemap) : [];\n"
        "&lt;&lt;/script&gt;&gt;"
    )
    if old_script in text:
        text = text.replace(old_script, new_script, 1)
    old = "&lt;&lt;for _tniche range Object.keys(_niches)&gt;&gt;"
    new = (
        "&lt;&lt;set _nichekeys to []&gt;&gt;\n"
        "        &lt;&lt;script&gt;&gt;\n"
        "const _nichemap = setup.people_niches();\n"
        "T.nichekeys = (_nichemap &amp;&amp; typeof _nichemap === &quot;object&quot;) ? Object.keys(_nichemap) : [];\n"
        "&lt;&lt;/script&gt;&gt;\n"
        "        &lt;&lt;for _tniche range _nichekeys&gt;&gt;"
    )
    if "T.nichekeys = (_nichemap" in text and "displaynpcsubtitles" in text:
        return text
    if old not in text:
        raise RuntimeError("displaynpcsubtitles niches anchor not found")
    return text.replace(old, new, 1)


def patch_displaynpcappearance_args(text: str) -> str:
    old = "&lt;&lt;set _npc to $args[0]&gt;&gt;"
    new = "&lt;&lt;set _npc to _args[0]&gt;&gt;"
    if old not in text:
        if "&lt;&lt;set _npc to _args[0]&gt;&gt;" in text:
            return text
        return text
    return text.replace(old, new, 1)


def patch_viewperson_null_guard(text: str) -> str:
    if "const _pdb = setup.people_db()" in text:
        return text
    old = (
        "            if (person == null || person === undefined)\n"
        "\t\t\t{\n"
        "\t\t\t\tjQuery(this.output).wiki(this.payload[0].contents);\n"
        "\t\t\t\treturn;\n"
        "\t\t\t}\n"
        "            if (typeof person == \"object\")\n"
        "\t\t\t{\n"
        "\t\t\t\tif (person.temporary)\n"
        "\t\t\t\t{\n"
        "\t\t\t\t\t// handle temporary NPCs that don't get a link\n"
        "\t\t\t\t\tlet gender = person.gender;\n"
        "\t\t\t\t\tlet style = '\"color: ' + setup.get_color(gender + \"emlink\") + ';\"';\n"
        "\t\t\t\t\tjQuery(this.output).wiki('<span style=' + style + '>' + this.payload[0].contents + '</span>');\n"
        "\t\t\t\t\treturn;\n"
        "\t\t\t\t}\n"
        "                person = person.person;\n"
        "\t\t\t}\n"
        "            else if (person in setup.people_niches())\n"
        "                person = setup.people_niches()[person];\n"
        "\n"
        "            person = setup.people.get_name(person);\n"
        "            let name = setup.people.is_known(person) ? setup.people.fullname(person) : setup.people.anonymous_name(person);"
    )
    new = (
        "            if (person == null || person === undefined || person === \"\")\n"
        "\t\t\t{\n"
        "\t\t\t\tjQuery(this.output).wiki(this.payload[0].contents);\n"
        "\t\t\t\treturn;\n"
        "\t\t\t}\n"
        "            if (typeof person == \"object\")\n"
        "\t\t\t{\n"
        "\t\t\t\tif (person.temporary)\n"
        "\t\t\t\t{\n"
        "\t\t\t\t\t// handle temporary NPCs that don't get a link\n"
        "\t\t\t\t\tlet gender = person.gender;\n"
        "\t\t\t\t\tlet style = '\"color: ' + setup.get_color(gender + \"emlink\") + ';\"';\n"
        "\t\t\t\t\tjQuery(this.output).wiki('<span style=' + style + '>' + this.payload[0].contents + '</span>');\n"
        "\t\t\t\t\treturn;\n"
        "\t\t\t\t}\n"
        "                person = person.person;\n"
        "\t\t\t}\n"
        "            const _niches = setup.people_niches();\n"
        "            if (_niches && typeof person === \"string\" && person in _niches)\n"
        "                person = _niches[person];\n"
        "\n"
        "            try { person = setup.people.get_name(person); }\n"
        "            catch (ex) {\n"
        "\t\t\t\tjQuery(this.output).wiki(this.payload[0].contents);\n"
        "\t\t\t\treturn;\n"
        "            }\n"
        "            const _pdb = setup.people_db();\n"
        "            if (!person || !_pdb || !(person in _pdb)) {\n"
        "\t\t\t\tjQuery(this.output).wiki(this.payload[0].contents);\n"
        "\t\t\t\treturn;\n"
        "            }\n"
        "            let name;\n"
        "            try {\n"
        "                name = setup.people.is_known(person) ? setup.people.fullname(person) : setup.people.anonymous_name(person);\n"
        "            } catch (ex) {\n"
        "\t\t\t\tjQuery(this.output).wiki(this.payload[0].contents);\n"
        "\t\t\t\treturn;\n"
        "            }"
    )
    if old not in text:
        raise RuntimeError("viewperson macro anchor not found")
    return text.replace(old, new, 1)


def main() -> None:
    vanilla = VANILLA.read_text(encoding="utf-8")
    display_widget = patch_displaypeoplebody(extract_widget(vanilla, "displaypeoplebody"))
    sort_widget = patch_sortpeople(extract_widget(vanilla, "sortpeople"))

    text = HTML.read_text(encoding="utf-8")
    text = replace_widget(text, "displaypeoplebody", display_widget)
    text = replace_widget(text, "sortpeople", sort_widget)
    text = patch_people_here_tab(text)
    text = patch_displaypeoplebodyupdate(text)
    text = patch_socialfilters_init(text)
    text = patch_viewperson_null_guard(text)
    text = patch_viewperson_safe_render(text)
    text = patch_reverse_niches(text)
    text = patch_get_name_guard(text)
    text = patch_get_tooltip_person(text)
    text = patch_pronouns_null_guard(text)
    text = patch_relation_null_guard(text)
    text = patch_people_niche_null_guard(text)
    text = patch_get_person_null_guard(text)
    text = patch_person_constructor_pdata_guard(text)
    text = patch_is_anonymous_guard(text)
    text = patch_anon_name_widgets(text)
    text = patch_quickrelationship_widgets(text)
    text = patch_anonorfullnamerel_widgets(text)
    text = patch_interactionstoday_checkvars(text)
    text = patch_turnon_factor_safe(text)
    text = patch_has_turnon_characteristic_safe(text)
    text = patch_pc_attraction_factor_safe(text)
    text = patch_pc_attracted_to_guard(text)
    text = patch_inclinations_special_seeds_guard(text)
    text = patch_calcstyle_tattoos_guard(text)
    text = patch_npcattraction_widget(text)
    text = patch_beachleadname_widgets(text)
    text = patch_people_db_null_guard(text)
    text = patch_people_niches_fn_null_guard(text)
    text = patch_display_npc_dialog(text)
    text = patch_display_npc_passage(text)
    text = _patch_displaynpc_personobj_guard(text)
    text = patch_displaynpc_pdata_guard(text)
    text = patch_subarchetype_guard(text)
    text = patch_get_personality_traits_guard(text)
    text = patch_displaynpcsubtitles_niches(text)
    text = patch_displaynpcappearance_args(text)

    HTML.write_text(text, encoding="utf-8")
    print(f"Restored and patched Social People widgets in {HTML.name}")


if __name__ == "__main__":
    main()