/* Searchable CoT makeup picker for the standalone editor */
(function()
{
	"use strict";

	const Picker = {
		_catalog: [],
		_packItems: [],
		_overlayKind: "makeup",
		_filters: {
			search: "",
			slot: "",
			hideAuthored: false,
			missingPoseOnly: false,
			hasColorMaskOnly: false,
			editPose: "front",
		},
		_selectedId: "",
		_onSelect: null,
		_els: {},

		init(els, onSelect)
		{
			Picker._els = els || {};
			Picker._onSelect = onSelect || null;
			Picker._wire();
		},

		setOverlayKind(kind)
		{
			const allowed = ["makeup", "body-writing", "base-face", "face-part", "hair"];
			Picker._overlayKind = allowed.includes(kind) ? kind : "makeup";
			Picker._fillSlotFilter();
			Picker.refresh();
		},

		getOverlayKind()
		{
			return Picker._overlayKind;
		},

		setCatalog(catalog)
		{
			Picker._catalog = Array.isArray(catalog) ? catalog.slice() : [];
			Picker._fillSlotFilter();
			Picker.refresh();
		},

		setPackItems(items)
		{
			Picker._packItems = Array.isArray(items) ? items : [];
			Picker.refresh();
		},

		setEditPose(poseId)
		{
			Picker._filters.editPose = poseId || "front";
			Picker.refresh();
		},

		setSelectedBinding(bindingId)
		{
			Picker._selectedId = bindingId || "";
			if (Picker._els.select)
				Picker._els.select.value = Picker._selectedId;
		},

		getCatalogRow(bindingId)
		{
			if (!bindingId) return null;
			return Picker._catalog.find((row) => row.id === bindingId) || null;
		},

		displayNameForBinding(bindingId)
		{
			const row = Picker.getCatalogRow(bindingId);
			return row ? (row.name || row.id) : bindingId;
		},

		getSlots()
		{
			const set = new Set();
			for (const row of Picker._catalog)
				if (row.slot) set.add(row.slot);
			return Array.from(set).sort();
		},

		_fillSlotFilter()
		{
			const sel = Picker._els.slot;
			if (!sel) return;
			const current = sel.value;
			sel.innerHTML = "";
			const all = document.createElement("option");
			all.value = "";
			if (Picker._overlayKind === "body-writing") all.textContent = "All placements";
			else if (Picker._overlayKind === "base-face") all.textContent = "All base faces";
			else if (Picker._overlayKind === "face-part") all.textContent = "All features";
			else if (Picker._overlayKind === "hair") all.textContent = "All hair types";
			else all.textContent = "All slots";
			sel.appendChild(all);
			for (const slot of Picker.getSlots())
			{
				const opt = document.createElement("option");
				opt.value = slot;
				opt.textContent = slot;
				sel.appendChild(opt);
			}
			sel.value = current || "";
		},

		_itemHasImages(item, poseId)
		{
			if (!item || !item.poses) return false;
			const poseDef = item.poses[poseId];
			return !!(poseDef && poseDef.sources && Object.keys(poseDef.sources).length);
		},

		_itemHasAnyImages(item)
		{
			if (!item || !item.poses) return false;
			return Object.values(item.poses).some((p) => p && p.sources && Object.keys(p.sources).length);
		},

		_itemHasColorMask(item)
		{
			if (!item || !item.poses) return false;
			return Object.values(item.poses).some((p) => p && p.colorMask && Object.keys(p.colorMask).length);
		},

		_bindingHasAuthoredImages(bindingId)
		{
			for (const item of Picker._packItems)
			{
				if (!(item.cotBindings || []).includes(bindingId)) continue;
				if (Picker._itemHasAnyImages(item)) return true;
			}
			return false;
		},

		_bindingMissingPose(bindingId, poseId)
		{
			for (const item of Picker._packItems)
			{
				if ((item.cotBindings || []).includes(bindingId))
					return !Picker._itemHasImages(item, poseId);
			}
			return true;
		},

		_bindingHasColorMask(bindingId)
		{
			for (const item of Picker._packItems)
			{
				if ((item.cotBindings || []).includes(bindingId) && Picker._itemHasColorMask(item))
					return true;
			}
			return false;
		},

		_filteredCatalog()
		{
			const q = Picker._filters.search.trim().toLowerCase();
			const slot = Picker._filters.slot;
			const poseId = Picker._filters.editPose;
			const out = [];
			for (const row of Picker._catalog)
			{
				if (slot && row.slot !== slot) continue;
				if (q)
				{
					const hay = (row.id + " " + row.name + " " + row.slot + " " + row.category).toLowerCase();
					if (!hay.includes(q)) continue;
				}
				if (Picker._filters.hideAuthored && Picker._bindingHasAuthoredImages(row.id)) continue;
				if (Picker._filters.missingPoseOnly && !Picker._bindingMissingPose(row.id, poseId)) continue;
				if (Picker._filters.hasColorMaskOnly && !Picker._bindingHasColorMask(row.id)) continue;
				out.push(row);
			}
			return out;
		},

		_formatLabel(row)
		{
			const tags = [];
			if (Picker._bindingHasAuthoredImages(row.id)) tags.push("has art");
			if (Picker._bindingHasColorMask(row.id)) tags.push("color mask");
			if (Picker._bindingMissingPose(row.id, Picker._filters.editPose)) tags.push("needs " + Picker._filters.editPose);
			const suffix = tags.length ? " · " + tags.join(", ") : "";
			let group = row.slot || row.category || "makeup";
			if (Picker._overlayKind === "body-writing") group = row.slot || "placement";
			else if (Picker._overlayKind === "base-face") group = "base face";
			else if (Picker._overlayKind === "face-part") group = row.slot || "feature";
			else if (Picker._overlayKind === "hair") group = row.category || row.slot || "hair";
			return row.name + " (" + group + ")" + suffix;
		},

		refresh()
		{
			const select = Picker._els.select;
			const count = Picker._els.count;
			if (!select) return;
			const rows = Picker._filteredCatalog();
			const prev = Picker._selectedId || select.value;
			select.innerHTML = "";
			const blank = document.createElement("option");
			blank.value = "";
			if (Picker._overlayKind === "body-writing")
				blank.textContent = "Choose body placement…";
			else if (Picker._overlayKind === "base-face")
				blank.textContent = Picker._catalog.length
					? "Choose base face…"
					: "Load base face catalog…";
			else if (Picker._overlayKind === "face-part")
				blank.textContent = Picker._catalog.length
					? "Choose distinguishing feature…"
					: "Connect game folder to load features…";
			else if (Picker._overlayKind === "hair")
				blank.textContent = Picker._catalog.length
					? "Choose hair style…"
					: "Connect game folder to load hairstyles…";
			else
				blank.textContent = Picker._catalog.length
					? "Choose in-game makeup…"
					: "Connect game folder to load makeup list…";
			select.appendChild(blank);
			for (const row of rows)
			{
				const opt = document.createElement("option");
				opt.value = row.id;
				opt.textContent = Picker._formatLabel(row);
				select.appendChild(opt);
			}
			if (prev && rows.some((r) => r.id === prev)) select.value = prev;
			else select.value = "";
			if (count) count.textContent = rows.length + " / " + Picker._catalog.length + " options";
		},

		_wire()
		{
			const e = Picker._els;
			if (e.search) e.search.addEventListener("input", () =>
			{
				Picker._filters.search = e.search.value;
				Picker.refresh();
			});
			if (e.slot) e.slot.addEventListener("change", () =>
			{
				Picker._filters.slot = e.slot.value;
				Picker.refresh();
			});
			if (e.hideAuthored) e.hideAuthored.addEventListener("change", () =>
			{
				Picker._filters.hideAuthored = !!e.hideAuthored.checked;
				Picker.refresh();
			});
			if (e.missingPoseOnly) e.missingPoseOnly.addEventListener("change", () =>
			{
				Picker._filters.missingPoseOnly = !!e.missingPoseOnly.checked;
				Picker.refresh();
			});
			if (e.hasColorMask) e.hasColorMask.addEventListener("change", () =>
			{
				Picker._filters.hasColorMaskOnly = !!e.hasColorMask.checked;
				Picker.refresh();
			});
			if (e.select) e.select.addEventListener("change", () =>
			{
				const id = e.select.value;
				Picker._selectedId = id;
				if (id && Picker._onSelect) Picker._onSelect(id);
			});
		},
	};

	window.ExhibitionMakeupPicker = Picker;
})();