/* Searchable CoT clothing picker for the standalone editor */
(function()
{
	"use strict";

	const Picker = {
		_catalog: [],
		_packItems: [],
		_filters: {
			search: "",
			category: "",
			hideAuthored: false,
			missingPoseOnly: false,
			hasDisplacement: false,
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

		setCatalog(catalog)
		{
			Picker._catalog = Array.isArray(catalog) ? catalog.slice() : [];
			Picker._fillCategoryFilter();
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

		cleanClothingLabel(text)
		{
			const raw = String(text || "").trim();
			if (!raw) return "";
			if (!/%/.test(raw)) return raw;
			const cleaned = raw.replace(/%[a-z0-9_]+/gi, " ").replace(/\s+/g, " ").trim();
			return cleaned || raw;
		},

		displayNameForBinding(bindingId)
		{
			const row = Picker.getCatalogRow(bindingId);
			if (!row) return Picker.cleanClothingLabel(bindingId) || bindingId;
			if (row.shortname && !/%/.test(row.shortname)) return row.shortname;
			if (row.name && /%/.test(row.name))
				return row.id || Picker.cleanClothingLabel(row.name) || bindingId;
			if (row.name) return row.name;
			return row.id || bindingId;
		},

		getCategories()
		{
			const set = new Set();
			for (const row of Picker._catalog)
				if (row.category) set.add(row.category);
			return Array.from(set).sort();
		},

		_fillCategoryFilter()
		{
			const sel = Picker._els.category;
			if (!sel) return;
			const current = sel.value;
			sel.innerHTML = "";
			const all = document.createElement("option");
			all.value = "";
			all.textContent = "All categories";
			sel.appendChild(all);
			for (const cat of Picker.getCategories())
			{
				const opt = document.createElement("option");
				opt.value = cat;
				opt.textContent = cat;
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

		_itemHasDisplacement(item)
		{
			if (!item || !item.poses) return false;
			return Object.values(item.poses).some((p) =>
			{
				if (!p || !p.displacements) return false;
				return Object.keys(p.displacements).some((id) => id !== "normal");
			});
		},

		_authoredBindingIds()
		{
			const ids = new Set();
			for (const item of Picker._packItems)
			{
				for (const id of item.cotBindings || [])
					if (id) ids.add(id);
			}
			return ids;
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

		_filteredCatalog()
		{
			const q = Picker._filters.search.trim().toLowerCase();
			const cat = Picker._filters.category;
			const poseId = Picker._filters.editPose;
			const authored = Picker._authoredBindingIds();
			const out = [];
			for (const row of Picker._catalog)
			{
				if (cat && row.category !== cat) continue;
				if (q)
				{
					const hay = (row.id + " " + row.name + " " + row.shortname + " " + row.category).toLowerCase();
					if (!hay.includes(q)) continue;
				}
				if (Picker._filters.hideAuthored && Picker._bindingHasAuthoredImages(row.id)) continue;
				if (Picker._filters.missingPoseOnly && !Picker._bindingMissingPose(row.id, poseId)) continue;
				if (Picker._filters.hasDisplacement)
				{
					let found = false;
					for (const item of Picker._packItems)
					{
						if ((item.cotBindings || []).includes(row.id) && Picker._itemHasDisplacement(item))
						{
							found = true;
							break;
						}
					}
					if (!found) continue;
				}
				out.push(row);
			}
			return out;
		},

		_formatLabel(row)
		{
			const tags = [];
			if (Picker._bindingHasAuthoredImages(row.id)) tags.push("has art");
			if (Picker._bindingMissingPose(row.id, Picker._filters.editPose)) tags.push("needs " + Picker._filters.editPose);
			const suffix = tags.length ? " · " + tags.join(", ") : "";
			return row.id + " (" + row.category + ")" + suffix;
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
			blank.textContent = Picker._catalog.length
				? "Choose game clothing…"
				: "Connect game folder to load clothing list…";
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
			if (count) count.textContent = rows.length + " / " + Picker._catalog.length + " items";
		},

		_wire()
		{
			const e = Picker._els;
			if (e.search) e.search.addEventListener("input", () =>
			{
				Picker._filters.search = e.search.value;
				Picker.refresh();
			});
			if (e.category) e.category.addEventListener("change", () =>
			{
				Picker._filters.category = e.category.value;
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
			if (e.hasDisplacement) e.hasDisplacement.addEventListener("change", () =>
			{
				Picker._filters.hasDisplacement = !!e.hasDisplacement.checked;
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

	window.ExhibitionClothingPicker = Picker;
})();