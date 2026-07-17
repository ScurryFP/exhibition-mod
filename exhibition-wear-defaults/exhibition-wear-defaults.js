// Reset exposure/displacement when putting clothes on; optional saved exposure presets.
(function()
{
	const EA = setup.ExhibitionAdjustment;
	if (!EA || EA._wearDefaultsPatched) return;

	// Must run after setup.ExhibitionAdjustment is defined (tanning JS loads earlier).
	EA.step_label = function(person, cItem, type)
	{
		const steps = this.get_steps(cItem, type);
		if (!steps) return "Normal";
		const tmpl = this.TEMPLATES[type];
		const maxS = this.item_max_steps(person, cItem, tmpl) || 1;
		return steps + "/" + maxS;
	};

	const origLinkLabel = EA.link_label.bind(EA);
	EA.link_label = function(cItem, type, direction, person)
	{
		const tmpl = this.TEMPLATES[type];
		if (!tmpl) return origLinkLabel(cItem, type, direction, person);
		person = person || setup.pc();
		const item = setup.capitalize_each(cItem.get_name(true));
		const arrow = direction > 0 ? "▲" : "▼";
		const action = direction > 0 ? tmpl.up : tmpl.down;
		const cur = this.step_label(person, cItem, type);
		return arrow + " " + action + " — " + item + " · " + tmpl.label + " (" + cur + ")";
	};

	EA._preserveExposureWearDepth = 0;

	EA.preserve_exposure_on_wear = function(fn)
	{
		this._preserveExposureWearDepth++;
		try { return fn(); }
		finally { this._preserveExposureWearDepth--; }
	};

	EA.should_preserve_exposure_on_wear = function()
	{
		return this._preserveExposureWearDepth > 0;
	};

	EA.reset_item_to_default = function(cItem)
	{
		if (!cItem) return;
		if (cItem.delete_property)
			cItem.delete_property("exposure_adjustments");
		if (cItem.remove_all_displacements)
			cItem.remove_all_displacements();
	};

	EA.export_item_exposure = function(cItem)
	{
		return {
			adjustments: Object.assign({}, cItem.get_property("exposure_adjustments") || {}),
			displacements: cItem.get_displacements().slice(),
		};
	};

	EA.apply_item_exposure = function(cItem, data)
	{
		if (!cItem || !data) return;
		this.reset_item_to_default(cItem);
		if (data.displacements && data.displacements.length)
		{
			for (const disp of data.displacements)
				cItem.add_displacement(disp);
		}
		if (data.adjustments && Object.keys(data.adjustments).length)
			cItem.set_property("exposure_adjustments", Object.assign({}, data.adjustments));
	};

	EA.capture_current_exposure = function(person)
	{
		const items = [];
		for (const cItem of person.get_clothingItems_classes())
		{
			const exp = this.export_item_exposure(cItem);
			const hasAdj = exp.adjustments && Object.keys(exp.adjustments).length;
			const hasDisp = exp.displacements && exp.displacements.length;
			if (!hasAdj && !hasDisp) continue;
			const data = cItem.get_data_structure();
			items.push({
				item: data.item,
				name: data.name,
				adjustments: exp.adjustments,
				displacements: exp.displacements,
			});
		}
		return items;
	};

	EA.ensure_exposure_presets = function()
	{
		if (!V.exposure_presets) V.exposure_presets = [];
	};

	EA.is_exposure_preset_name_taken = function(name)
	{
		this.ensure_exposure_presets();
		return V.exposure_presets.some(p => p.name === name);
	};

	EA.save_exposure_preset = function(person, name)
	{
		this.ensure_exposure_presets();
		name = (name || "").trim();
		if (!name)
			return { ok: false, msg: "Name your exposure preset first." };
		const items = this.capture_current_exposure(person);
		if (!items.length)
			return { ok: false, msg: "Nothing to save — adjust exposure on what you're wearing first." };
		const preset = { name: name, items: items };
		const idx = V.exposure_presets.findIndex(p => p.name === name);
		if (idx >= 0)
			V.exposure_presets[idx] = preset;
		else
			V.exposure_presets.push(preset);
		return { ok: true, msg: "Exposure preset saved as «" + name + "»." };
	};

	EA.apply_exposure_preset = function(person, name)
	{
		this.ensure_exposure_presets();
		const preset = V.exposure_presets.find(p => p.name === name);
		if (!preset)
			return { ok: false, msg: "That exposure preset doesn't exist." };
		let applied = 0;
		const worn = person.get_clothingItems_classes();
		for (const entry of preset.items)
		{
			const match = worn.find(cItem =>
			{
				const d = cItem.get_data_structure();
				return d.item === entry.item && d.name === entry.name;
			});
			if (match)
			{
				this.apply_item_exposure(match, entry);
				applied++;
			}
		}
		if (!applied)
			return { ok: false, msg: "You're not wearing the same clothes that preset was saved with." };
		return { ok: true, msg: "Applied exposure preset «" + name + "»." };
	};

	EA.delete_exposure_preset = function(name)
	{
		this.ensure_exposure_presets();
		const idx = V.exposure_presets.findIndex(p => p.name === name);
		if (idx < 0) return false;
		V.exposure_presets.splice(idx, 1);
		return true;
	};

	const origWear = Person.prototype.wear_clothing;
	Person.prototype.wear_clothing = function(obj, closet)
	{
		const result = origWear.call(this, obj, closet);
		if (!EA.should_preserve_exposure_on_wear())
		{
			const cItem = new ClothingItem(obj);
			EA.reset_item_to_default(cItem);
		}
		return result;
	};

	const T = setup.Tanning;
	if (T && !T._exposureRestoreWrapped)
	{
		if (typeof T.wear_saved_outfit === "function")
		{
			T.wear_saved_outfit = function(person)
			{
				return EA.preserve_exposure_on_wear(() => {
					if (!T.has_saved_outfit(person)) return false;
					V.pretanningclothes = [];
					for (let i = 0; i < person.clothes.length; i++)
						V.pretanningclothes.push(Object.assign({}, person.clothes[i]));
					if (T.swap_for_tanning)
						T.swap_for_tanning(person);
					else
						person.swap_all_clothing_to_closet();
					person.wear_all_clothes(V.tanningoutfit);
					if (T.maybe_invalidate_paperdoll)
						T.maybe_invalidate_paperdoll(person);
					return true;
				});
			};
		}
		if (typeof T.restore_after_tan === "function")
		{
			const origRestore = T.restore_after_tan.bind(T);
			T.restore_after_tan = function(person)
			{
				return EA.preserve_exposure_on_wear(() => origRestore(person));
			};
		}
		T._exposureRestoreWrapped = true;
	}

	EA._wearDefaultsPatched = true;
})();