/* Exhibition Paperdoll — standalone pack editor */
(function()
{
	"use strict";

	const VIEW_LABELS = { front: "Chest/groin", back: "Ass" };

	function getPoseIds()
	{
		if (Core && typeof Core.poseIds === "function")
		{
			const ids = Core.poseIds();
			if (ids && ids.length) return ids;
		}
		if (state.poses && state.poses.length) return state.poses.slice();
		return ["front", "back"];
	}

	function poseLabel(poseId)
	{
		if (Core && typeof Core.poseLabel === "function") return Core.poseLabel(poseId);
		if (poseId === "front") return "Front";
		if (poseId === "back") return "Back";
		return String(poseId || "").replace(/_/g, " ");
	}

	function syncStatePosesFromCore()
	{
		state.poses = getPoseIds();
		if (Core && typeof Core.exportPoseMeta === "function")
			state.poseMeta = Core.exportPoseMeta();
		else
			state.poseMeta = state.poseMeta || {};
		if (IO && IO.ensureItemsHavePoses)
			IO.ensureItemsHavePoses(state.items, state.poses);
	}

	function applyPosesToEditor(poseIds, poseMeta)
	{
		if (Core && typeof Core.applyPackPoses === "function")
			Core.applyPackPoses(poseIds, poseMeta || {});
		else if (Core && Core.POSES)
		{
			// minimal fallback
			for (const id of poseIds || ["front", "back"])
			{
				if (!Core.POSES[id])
					Core.POSES[id] = { id: id, label: poseLabel(id), contexts: ["generic"] };
			}
		}
		syncStatePosesFromCore();
		if (state.editPose && getPoseIds().indexOf(state.editPose) < 0)
			state.editPose = "front";
		if (state.previewPose && getPoseIds().indexOf(state.previewPose) < 0)
			state.previewPose = "front";
		refreshPoseControls();
		fillEditPoseSelect();
	}

	const IO = window.ExhibitionPackIO;
	const Engine = window.ExhibitionEditorEngine;
	const PackModes = window.ExhibitionPackModes;
	const ClothingPicker = window.ExhibitionClothingPicker;
	const MakeupPicker = window.ExhibitionMakeupPicker;
	const CustomClothing = window.ExhibitionCustomClothing;
	const ClothingSkins = window.ExhibitionClothingSkins;
	const CONNECTION_DISMISS_KEY = "exhibition-editor-connection-dismissed";

	function requireDeps()
	{
		if (!IO) throw new Error("pack-io.js did not load — check the browser console");
		if (!Engine || !Engine.EP || !Engine.Core) throw new Error("engine-boot.js did not load — check the browser console");
		if (!PackModes) throw new Error("pack-config.js did not load");
	}

	let EP;
	let Core;

	const els = {
		status: document.getElementById("status-text"),
		appTitle: document.getElementById("app-title"),
		modeBar: document.getElementById("mode-bar"),
		modeHint: document.getElementById("mode-hint"),
		packBar: document.getElementById("pack-bar"),
		packBarToggle: document.getElementById("pack-bar-toggle"),
		packBarSummary: document.getElementById("pack-bar-summary"),
		packMetaPanel: document.getElementById("pack-meta-panel"),
		layersSection: document.getElementById("layers-section"),
		layerActions: document.getElementById("layer-actions"),
		layersTitle: document.getElementById("layers-title"),
		selectedLayerSection: document.getElementById("selected-layer-section"),
		panelEdit: document.getElementById("panel-edit"),
		layerCategoryField: document.getElementById("layer-category-field"),
		layerCategoryBadge: document.getElementById("layer-category-badge"),
		packId: document.getElementById("pack-id"),
		packName: document.getElementById("pack-name"),
		packDesc: document.getElementById("pack-desc"),
		layerList: document.getElementById("layer-list"),
		btnAddLayer: document.getElementById("btn-add-layer"),
		btnCreateClothing: document.getElementById("btn-create-clothing"),
		btnAddExisting: document.getElementById("btn-add-existing"),
		btnRemoveLayer: document.getElementById("btn-remove-layer"),
		btnNew: document.getElementById("btn-new"),
		newSkinModal: document.getElementById("new-skin-modal"),
		newSkinClose: document.getElementById("new-skin-close"),
		newSkinCancel: document.getElementById("new-skin-cancel"),
		newSkinSubmit: document.getElementById("new-skin-submit"),
		nsClothingSearch: document.getElementById("ns-clothing-search"),
		nsClothingSelect: document.getElementById("ns-clothing-select"),
		nsClothingHint: document.getElementById("ns-clothing-hint"),
		nsSubKey: document.getElementById("ns-sub-key"),
		nsDesignSearch: document.getElementById("ns-design-search"),
		nsDesignSelect: document.getElementById("ns-design-select"),
		nsLayerName: document.getElementById("ns-layer-name"),
		skinDesignStatus: document.getElementById("skin-design-status"),
		createClothingModal: document.getElementById("create-clothing-modal"),
		createClothingClose: document.getElementById("create-clothing-close"),
		createClothingCancel: document.getElementById("create-clothing-cancel"),
		createClothingSubmit: document.getElementById("create-clothing-submit"),
		ccTabs: document.getElementById("cc-tabs"),
		ccItemId: document.getElementById("cc-item-id"),
		ccShortname: document.getElementById("cc-shortname"),
		ccNameTemplate: document.getElementById("cc-name-template"),
		ccCategory: document.getElementById("cc-category"),
		ccLayer: document.getElementById("cc-layer"),
		ccPrice: document.getElementById("cc-price"),
		ccAuthor: document.getElementById("cc-author"),
		ccDescShop: document.getElementById("cc-desc-shop"),
		ccDescWardrobe: document.getElementById("cc-desc-wardrobe"),
		ccDescThrift: document.getElementById("cc-desc-thrift"),
		ccCovers: document.getElementById("cc-covers"),
		ccSheer: document.getElementById("cc-sheer"),
		ccSkintightEx: document.getElementById("cc-skintight-ex"),
		ccStorage: document.getElementById("cc-storage"),
		ccBoolFlags: document.getElementById("cc-bool-flags"),
		ccChanceFlags: document.getElementById("cc-chance-flags"),
		ccDialogue: document.getElementById("cc-dialogue"),
		ccStyles: document.getElementById("cc-styles"),
		ccStyleFactor: document.getElementById("cc-style-factor"),
		ccStyleFactorMods: document.getElementById("cc-style-factor-mods"),
		ccFlagsMods: document.getElementById("cc-flags-mods"),
		ccDisplace: document.getElementById("cc-displace"),
		ccShops: document.getElementById("cc-shops"),
		ccNpcWear: document.getElementById("cc-npc-wear"),
		ccPcWear: document.getElementById("cc-pc-wear"),
		ccUseColor: document.getElementById("cc-use-color"),
		ccUseColor2: document.getElementById("cc-use-color2"),
		ccCoversMods: document.getElementById("cc-covers-mods"),
		ccConfigurations: document.getElementById("cc-configurations"),
		ccCostumeFactor: document.getElementById("cc-costume-factor"),
		importConflictModal: document.getElementById("import-conflict-modal"),
		importConflictProgress: document.getElementById("import-conflict-progress"),
		importConflictReasons: document.getElementById("import-conflict-reasons"),
		importConflictOldMeta: document.getElementById("import-conflict-old-meta"),
		importConflictNewMeta: document.getElementById("import-conflict-new-meta"),
		importConflictOldCanvas: document.getElementById("import-conflict-old-canvas"),
		importConflictNewCanvas: document.getElementById("import-conflict-new-canvas"),
		importConflictRename: document.getElementById("import-conflict-rename"),
		importConflictSkip: document.getElementById("import-conflict-skip"),
		importConflictRenameBtn: document.getElementById("import-conflict-rename-btn"),
		importConflictOverwrite: document.getElementById("import-conflict-overwrite"),
		btnAddImage: document.getElementById("btn-add-image"),
		btnImport: document.getElementById("btn-import"),
		btnSave: document.getElementById("btn-save"),
		btnExport: document.getElementById("btn-export"),
		fileImage: document.getElementById("file-image"),
		fileImport: document.getElementById("file-import"),
		fileBgImage: document.getElementById("file-bg-image"),
		previewBgBar: document.getElementById("preview-bg-bar"),
		canvas: document.getElementById("preview-canvas"),
		dropZone: document.getElementById("drop-zone"),
		importBanner: document.getElementById("import-banner"),
		importBannerName: document.getElementById("import-banner-name"),
		previewLod: document.getElementById("preview-lod"),
		poseBar: document.getElementById("pose-bar"),
		viewBar: document.getElementById("view-bar"),
		panelProps: document.getElementById("panel-props"),
		layerId: document.getElementById("layer-id"),
		layerName: document.getElementById("layer-name"),
		layerZ: document.getElementById("layer-z"),
		makeupField: document.getElementById("makeup-field"),
		makeupSubBar: document.getElementById("makeup-sub-bar"),
		faceHairKindWrap: document.getElementById("face-hair-kind-wrap"),
		faceHairKind: document.getElementById("face-hair-kind"),
		makeupSelectLabel: document.getElementById("makeup-select-label"),
		makeupFieldHint: document.getElementById("makeup-field-hint"),
		makeupSearch: document.getElementById("makeup-search"),
		makeupSlot: document.getElementById("makeup-slot"),
		makeupSelect: document.getElementById("makeup-select"),
		makeupCount: document.getElementById("makeup-count"),
		makeupFilterHideAuthored: document.getElementById("makeup-filter-hide-authored"),
		makeupFilterMissingPose: document.getElementById("makeup-filter-missing-pose"),
		makeupFilterColorMask: document.getElementById("makeup-filter-color-mask"),
		cotField: document.getElementById("cot-field"),
		cotClothingSearch: document.getElementById("cot-clothing-search"),
		cotClothingCategory: document.getElementById("cot-clothing-category"),
		cotClothingSelect: document.getElementById("cot-clothing-select"),
		cotClothingCount: document.getElementById("cot-clothing-count"),
		cotFilterHideAuthored: document.getElementById("cot-filter-hide-authored"),
		cotFilterMissingPose: document.getElementById("cot-filter-missing-pose"),
		cotFilterDisplacement: document.getElementById("cot-filter-displacement"),
		recolorField: document.getElementById("recolor-field"),
		itemRecolor: document.getElementById("item-recolor"),
		previewTintColor: document.getElementById("preview-tint-color"),
		colorMaskPanel: document.getElementById("color-mask-panel"),
		colorMaskGrid: document.getElementById("color-mask-grid"),
		exposureDispField: document.getElementById("exposure-disp-field"),
		exposureDisplacements: document.getElementById("exposure-displacements"),
		clothingFlagsField: document.getElementById("clothing-flags-field"),
		clothingFlagsList: document.getElementById("clothing-flags-list"),
		enabledDispField: document.getElementById("enabled-disp-field"),
		enabledDispList: document.getElementById("enabled-disp-list"),
		enabledDispOnlyOn: document.getElementById("enabled-disp-only-on"),
		enabledDispNeedArt: document.getElementById("enabled-disp-need-art"),
		editPose: document.getElementById("edit-pose"),
		editLod: document.getElementById("edit-lod"),
		lodOtherHint: document.getElementById("lod-other-hint"),
		lodGrid: document.getElementById("lod-grid"),
		poseList: document.getElementById("pose-list"),
		posePresetSelect: document.getElementById("pose-preset-select"),
		btnAddPosePreset: document.getElementById("btn-add-pose-preset"),
		poseCustomId: document.getElementById("pose-custom-id"),
		poseCustomLabel: document.getElementById("pose-custom-label"),
		btnAddPoseCustom: document.getElementById("btn-add-pose-custom"),
		bodySizeSection: document.getElementById("body-size-section"),
		bodySizeMenu: document.getElementById("body-size-menu"),
		bodyVariantStatus: document.getElementById("body-variant-status"),
		bodyImageTargetHint: document.getElementById("body-image-target-hint"),
		transformPanel: document.getElementById("transform-panel"),
		dispPreviewWrap: document.getElementById("disp-preview-wrap"),
		previewDisplacement: document.getElementById("preview-displacement"),
		displacementPanel: document.getElementById("displacement-panel"),
		editDisplacement: document.getElementById("edit-displacement"),
		dispMaskGrid: document.getElementById("disp-mask-grid"),
		dispDepthGrid: document.getElementById("disp-depth-grid"),
		dispCustomGrid: document.getElementById("disp-custom-grid"),
		setupOverlay: document.getElementById("setup-overlay"),
		setupTitle: document.getElementById("setup-title"),
		setupIntro: document.getElementById("setup-intro"),
		setupReconnectNote: document.getElementById("setup-reconnect-note"),
		setupBtnConnect: document.getElementById("setup-btn-connect"),
		setupBtnReconnect: document.getElementById("setup-btn-reconnect"),
		setupBtnVerify: document.getElementById("setup-btn-verify"),
		setupVerifyList: document.getElementById("setup-verify-list"),
		setupStatus: document.getElementById("setup-status"),
		appShell: document.getElementById("app-shell"),
		btnGameFolder: document.getElementById("btn-game-folder"),
		gameFolderLabel: document.getElementById("game-folder-label"),
		setupPathProject: document.getElementById("setup-path-project"),
		setupPathBase: document.getElementById("setup-path-base"),
		setupPathMods: document.getElementById("setup-path-mods"),
		connectionStatusWrap: document.getElementById("connection-status-wrap"),
		connectionStatusCb: document.getElementById("connection-status-cb"),
		connectionStatusLabel: document.getElementById("connection-status-label"),
		connectionStatusTooltip: document.getElementById("connection-status-tooltip"),
		connectionStatusDismiss: document.getElementById("connection-status-dismiss"),
		saveSuccessBanner: document.getElementById("save-success-banner"),
		saveSuccessText: document.getElementById("save-success-text"),
		saveSuccessIcon: document.getElementById("save-success-icon"),
	};

	let saveBannerTimer = null;

	function dispPresets()
	{
		return (Core && Core.DISPLACEMENT_PRESETS) || [{ id: "normal", label: "Normal" }];
	}

	function nonNormalDispPresets()
	{
		return dispPresets().filter((p) => p && p.id && p.id !== "normal");
	}

	function itemHasDisplacementArt(item, dispId)
	{
		if (!item || !dispId || dispId === "normal") return false;
		for (const poseDef of Object.values(item.poses || {}))
		{
			if (!poseDef) continue;
			if (Core && Core.displacementHasArt && Core.displacementHasArt(poseDef, dispId))
				return true;
			const disp = poseDef.displacements && poseDef.displacements[dispId];
			if (!disp) continue;
			if ((disp.mask && Object.keys(disp.mask).length)
				|| (disp.depth && Object.keys(disp.depth).length)
				|| (disp.sources && Object.keys(disp.sources).length))
				return true;
		}
		return false;
	}

	function inferEnabledDisplacements(item)
	{
		const ids = [];
		for (const preset of nonNormalDispPresets())
		{
			if (itemHasDisplacementArt(item, preset.id)) ids.push(preset.id);
		}
		// Also pick up custom ids that already have art
		for (const poseDef of Object.values((item && item.poses) || {}))
		{
			if (!poseDef || !poseDef.displacements) continue;
			for (const id of Object.keys(poseDef.displacements))
			{
				if (!id || id === "normal" || ids.includes(id)) continue;
				if (itemHasDisplacementArt(item, id)) ids.push(id);
			}
		}
		return ids;
	}

	/** Per clothing piece: which displacement types can be authored / previewed. */
	function getEnabledDisplacements(item)
	{
		if (!item) return [];
		if (!Array.isArray(item.enabledDisplacements))
			item.enabledDisplacements = inferEnabledDisplacements(item);
		return item.enabledDisplacements.filter((id) => id && id !== "normal");
	}

	function isDisplacementEnabled(item, dispId)
	{
		if (!dispId || dispId === "normal") return true;
		return getEnabledDisplacements(item).includes(dispId);
	}

	function setDisplacementEnabled(item, dispId, enabled)
	{
		if (!item || !dispId || dispId === "normal") return;
		const list = getEnabledDisplacements(item);
		item.enabledDisplacements = list;
		const idx = list.indexOf(dispId);
		if (enabled && idx < 0) list.push(dispId);
		else if (!enabled && idx >= 0) list.splice(idx, 1);
	}

	function clampDisplacementSelection(item)
	{
		const enabled = getEnabledDisplacements(item);
		if (state.editDisplacement !== "normal" && !enabled.includes(state.editDisplacement))
			state.editDisplacement = enabled[0] || "hem_lifted";
		if (state.previewDisplacement !== "normal" && !enabled.includes(state.previewDisplacement))
			state.previewDisplacement = "normal";
	}

	const state = {
		editorMode: "clothing",
		makeupSubTab: "face-hair",
		makeupSubKind: "face-hair",
		faceHairKind: "face-part",
		packType: "clothing",
		packId: "my-mod",
		packName: "My clothing mod",
		packDescription: "",
		enabled: true,
		items: [],
		selectedIndex: 0,
		editPose: "front",
		editLod: 1024,
		previewPose: "front",
		previewLod: 512,
		poses: ["front", "back"],
		poseMeta: {},
		editBodyDimension: "default",
		editBodyTier: "default",
		designCatalog: { standard_graphics: [], items: [] },
		previewDisplacement: "normal",
		editDisplacement: "hem_lifted",
		previewTintColor: "red",
		clothingAddMode: "bind",
		/** Custom mirror backgrounds pending Save to game: [{ id, label, path, blob, url }] */
		pendingBgUploads: [],
		_dirty: false,
		_pendingInstall: false,
		_importedFrom: "",
		_uiWired: false,
		_editorBooted: false,
	};

	let renderTimer = null;
	let dragDepth = 0;

	function setStatus(msg) { if (els.status) els.status.textContent = msg; }

	function revokeEditorItemBlobs(items)
	{
		for (const item of items || [])
		{
			for (const poseDef of Object.values(item.poses || {}))
			{
				if (!poseDef) continue;
				for (const url of Object.values(poseDef.sources || {}))
				{
					if (!url) continue;
					if (Core && Core.pruneImageCache) Core.pruneImageCache(url);
					if (String(url).startsWith("blob:")) URL.revokeObjectURL(url);
				}
				for (const url of Object.values(poseDef.colorMask || {}))
				{
					if (!url) continue;
					if (Core && Core.pruneImageCache) Core.pruneImageCache(url);
					if (String(url).startsWith("blob:")) URL.revokeObjectURL(url);
				}
				for (const disp of Object.values(poseDef.displacements || {}))
				{
					if (!disp) continue;
					for (const kind of ["mask", "depth", "sources"])
					{
						const map = disp[kind];
						if (!map) continue;
						for (const url of Object.values(map))
						{
							if (!url) continue;
							if (Core && Core.pruneImageCache) Core.pruneImageCache(url);
							if (String(url).startsWith("blob:")) URL.revokeObjectURL(url);
						}
					}
				}
			}
		}
	}

	function applyPackEditorState(loaded, options)
	{
		options = options || {};
		if (!loaded || !loaded.items || !loaded.items.length) return false;
		const prevItems = state.items;
		state.items = loaded.items;
		if (IO.syncPoseAssetsToPoses) IO.syncPoseAssetsToPoses(state.items);
		if (!options.keepItems) revokeEditorItemBlobs(prevItems);
		if (loaded.packId) state.packId = loaded.packId;
		if (loaded.packName) state.packName = loaded.packName;
		if (loaded.packDescription != null) state.packDescription = loaded.packDescription;
		if (loaded.enabled != null) state.enabled = loaded.enabled;
		if (loaded.editorMode) state.editorMode = loaded.editorMode;
		if (loaded.makeupSubTab) state.makeupSubTab = loaded.makeupSubTab;
		else if (loaded.makeupSubKind) state.makeupSubTab = loaded.makeupSubKind;
		if (loaded.faceHairKind) state.faceHairKind = loaded.faceHairKind;
		state.makeupSubKind = state.makeupSubTab;
		if (loaded.packType) state.packType = loaded.packType;
		state.selectedIndex = Math.min(state.selectedIndex, state.items.length - 1);
		if (state.selectedIndex < 0) state.selectedIndex = 0;
		els.packId.value = state.packId;
		els.packName.value = state.packName;
		els.packDesc.value = state.packDescription || "";
		state._dirty = false;
		return true;
	}

	async function loadModPackForEditor(packId)
	{
		if (!IO.loadModPackEditorState) return null;
		try
		{
			const access = await IO.resolveStoredGameAccess({ silent: true });
			if (!access) return null;
			const defaultSlug = (PackModes && PackModes.DEFAULT_APPEARANCE_PACK_ID) || "appearance-mod";
			const slug = IO.slugify(packId || state.packId || state.packName || defaultSlug);
			return await IO.loadModPackEditorState(access.epRoot, slug, {
				editorMode: state.editorMode,
				makeupSubTab: state.makeupSubTab,
				makeupSubKind: state.makeupSubTab,
				faceHairKind: state.faceHairKind,
				packType: IO.editorModeToPackType
					? IO.editorModeToPackType(state.editorMode, {
						makeupSubTab: state.makeupSubTab,
						makeupSubKind: state.makeupSubTab,
						faceHairKind: state.faceHairKind,
					})
					: "clothing",
			});
		}
		catch (e)
		{
			console.warn("loadModPackForEditor", e);
			return null;
		}
	}

	async function preloadEditorImages(items)
	{
		if (!Core || !Core.loadImage) return;
		const urls = new Set();
		for (const item of items || [])
		{
			for (const poseDef of Object.values(item.poses || {}))
			{
				if (!poseDef) continue;
				for (const url of Object.values(poseDef.sources || {}))
					if (url) urls.add(url);
				for (const url of Object.values(poseDef.colorMask || {}))
					if (url) urls.add(url);
				for (const disp of Object.values(poseDef.displacements || {}))
				{
					if (!disp) continue;
					for (const kind of ["mask", "depth", "sources"])
					{
						const map = disp[kind];
						if (!map) continue;
						for (const url of Object.values(map))
							if (url) urls.add(url);
					}
				}
			}
		}
		await Promise.all(Array.from(urls).map((url) => Core.loadImage(url)));
	}

	async function reloadModPackFromGame(packId)
	{
		const loaded = await loadModPackForEditor(packId);
		if (!loaded || !applyPackEditorState(loaded)) return false;
		await preloadEditorImages(state.items);
		if (ClothingPicker) ClothingPicker.setPackItems(state.items);
		if (MakeupPicker) MakeupPicker.setPackItems(state.items);
		renderLayerList();
		renderProps();
		updateDropHint();
		scheduleRender();
		return true;
	}

	async function reloadCurrentPackFromGame()
	{
		if (!IO.canSaveToFolder()) return false;
		if (state.editorMode === "base-poses")
		{
			await reloadBasePosesFromGame();
			return true;
		}
		const packId = state.packId || (PackModes && PackModes.DEFAULT_APPEARANCE_PACK_ID) || "appearance-mod";
		return reloadModPackFromGame(packId);
	}

	function showSaveSuccessBanner(verify, saved)
	{
		if (!els.saveSuccessBanner || !els.saveSuccessText) return;
		if (saveBannerTimer)
		{
			clearTimeout(saveBannerTimer);
			saveBannerTimer = null;
		}

		const where = saved && saved.saveTarget === "base-pack"
			? IO.pathHints.basePackSave
			: IO.pathHints.modsSave.replace("<pack-id>", (saved && saved.result && saved.result.modSlug) || state.packId);
		let text;
		let isError = false;

		const savedImages = (saved && saved.result && saved.result.imageCount) || 0;
		const verifiedImages = (verify && verify.imageCount) || 0;
		const imageTotal = Math.max(savedImages, verifiedImages);
		if (verify && verify.ok)
		{
			text = "Image files saved to game — verified "
				+ imageTotal + " image(s) on disk in "
				+ (verify.packPath || where) + ". Hard-refresh the game (Ctrl+Shift+R).";
			if (els.saveSuccessIcon) els.saveSuccessIcon.textContent = "✓";
		}
		else if (saved && saved.result && imageTotal > 0)
		{
			text = "Saved " + imageTotal + " image(s) + pack.json to " + where
				+ ". Hard-refresh the game (Ctrl+Shift+R).";
			if (els.saveSuccessIcon) els.saveSuccessIcon.textContent = "✓";
		}
		else if (verify && verify.missing && verify.missing.length)
		{
			isError = true;
			text = "Save incomplete — " + verify.missing.length
				+ " file(s) missing on disk. Check browser write permission and try again.";
			if (els.saveSuccessIcon) els.saveSuccessIcon.textContent = "✗";
		}
		else if (saved && saved.result)
		{
			text = "Saved " + saved.result.fileCount + " file(s) to " + where + ".";
			if (els.saveSuccessIcon) els.saveSuccessIcon.textContent = "✓";
		}
		else
		{
			text = "Save finished.";
			if (els.saveSuccessIcon) els.saveSuccessIcon.textContent = "✓";
		}

		els.saveSuccessBanner.classList.remove("hidden", "is-error");
		if (isError) els.saveSuccessBanner.classList.add("is-error");
		els.saveSuccessText.textContent = text;
		saveBannerTimer = setTimeout(() =>
		{
			if (els.saveSuccessBanner) els.saveSuccessBanner.classList.add("hidden");
			saveBannerTimer = null;
		}, 8000);
	}

	function fillPathHints()
	{
		const hints = IO && IO.pathHints ? IO.pathHints : {};
		if (els.setupPathProject && hints.projectFolder) els.setupPathProject.textContent = hints.projectFolder;
		if (els.setupPathBase && hints.basePackSave) els.setupPathBase.textContent = hints.basePackSave;
		if (els.setupPathMods && hints.modsSave) els.setupPathMods.textContent = hints.modsSave;
	}

	function setAppBlocked(blocked)
	{
		if (els.appShell) els.appShell.classList.toggle("is-blocked", !!blocked);
	}

	function showSetupOverlay(show, options)
	{
		options = options || {};
		if (!els.setupOverlay) return;
		if (show)
		{
			configureSetupOverlay(options);
			els.setupOverlay.hidden = false;
			setAppBlocked(true);
		}
		else
		{
			els.setupOverlay.hidden = true;
			setAppBlocked(false);
		}
	}

	function configureSetupOverlay(options)
	{
		const reconnect = !!options.reconnect;
		if (els.setupTitle)
			els.setupTitle.textContent = reconnect
				? "Reconnect to your game"
				: "Connect to your game (one time)";
		if (els.setupIntro) els.setupIntro.hidden = reconnect;
		if (els.setupReconnectNote) els.setupReconnectNote.hidden = !reconnect;
		if (els.setupBtnReconnect)
		{
			els.setupBtnReconnect.hidden = !reconnect;
			els.setupBtnReconnect.classList.toggle("primary", reconnect);
		}
		if (els.setupBtnConnect)
		{
			els.setupBtnConnect.hidden = false;
			els.setupBtnConnect.textContent = reconnect ? "Choose different folder…" : "Choose game folder…";
			els.setupBtnConnect.classList.toggle("primary", !reconnect);
		}
		if (els.setupBtnVerify) els.setupBtnVerify.hidden = !reconnect;
		if (els.setupVerifyList && !options.keepVerify) els.setupVerifyList.hidden = true;
	}

	function renderVerifyChecks(listEl, checks)
	{
		if (!listEl) return;
		listEl.innerHTML = "";
		for (const check of checks || [])
		{
			const li = document.createElement("li");
			li.className = check.ok ? "ok" : "fail";
			const mark = document.createElement("span");
			mark.className = "check-mark";
			mark.textContent = check.ok ? "✓" : "✗";
			li.appendChild(mark);
			li.appendChild(document.createTextNode(check.label));
			listEl.appendChild(li);
		}
		listEl.hidden = !(checks && checks.length);
	}

	function connectionNoticeDismissed()
	{
		try { return localStorage.getItem(CONNECTION_DISMISS_KEY) === "1"; }
		catch (e) { return false; }
	}

	function setConnectionNoticeDismissed(dismissed)
	{
		try
		{
			if (dismissed) localStorage.setItem(CONNECTION_DISMISS_KEY, "1");
			else localStorage.removeItem(CONNECTION_DISMISS_KEY);
		}
		catch (e) { /* ignore */ }
	}

	function formatConnectionTooltip(verify)
	{
		const meta = verify.meta || {};
		const lines = [];
		if (verify.ok)
			lines.push("Proper game file connected — Save to game is ready.");
		else
			lines.push("Game folder linked but some checks failed.");
		if (meta.projectName) lines.push("Folder: " + meta.projectName);
		if (meta.gameHtmlName) lines.push("HTML: " + meta.gameHtmlName);
		for (const check of verify.checks || [])
			lines.push((check.ok ? "✓ " : "✗ ") + check.label);
		return lines.join("\n");
	}

	function showConnectionStatus(verify)
	{
		if (!els.connectionStatusWrap) return;
		if (!verify || !IO.canSaveToFolder())
		{
			els.connectionStatusWrap.classList.add("hidden");
			if (els.connectionStatusDismiss) els.connectionStatusDismiss.hidden = true;
			return;
		}
		if (connectionNoticeDismissed())
		{
			els.connectionStatusWrap.classList.add("hidden");
			if (els.connectionStatusDismiss) els.connectionStatusDismiss.hidden = true;
			return;
		}

		const meta = verify.meta || {};
		const folderName = meta.projectName || "game folder";
		const htmlName = meta.gameHtmlName || "";
		els.connectionStatusWrap.classList.remove("hidden", "is-ok", "is-warn");
		if (verify.ok) els.connectionStatusWrap.classList.add("is-ok");
		else els.connectionStatusWrap.classList.add("is-warn");

		if (els.connectionStatusCb) els.connectionStatusCb.checked = verify.ok;
		if (els.connectionStatusLabel)
			els.connectionStatusLabel.textContent = verify.ok
				? "Game connected"
				: "Game connected (warnings)";
		if (els.connectionStatusTooltip)
		{
			els.connectionStatusTooltip.textContent = formatConnectionTooltip(verify);
			els.connectionStatusWrap.title = folderName + (htmlName ? " · " + htmlName : "");
		}
		if (els.connectionStatusDismiss) els.connectionStatusDismiss.hidden = false;
	}

	async function runConnectionVerify(access, statusEl, listEl)
	{
		if (statusEl) statusEl.textContent = "Testing connection…";
		const verify = await IO.verifyGameConnection(access);
		renderVerifyChecks(listEl, verify.checks);
		if (statusEl)
		{
			statusEl.textContent = verify.ok
				? "Connection OK — all required paths found."
				: "Some checks failed — use Choose different folder if this is the wrong game.";
		}
		return verify;
	}

	async function loadClothingCatalogForEditor(access)
	{
		if (!ClothingPicker || !IO.loadClothingCatalog) return 0;
		const catalog = await IO.loadClothingCatalog(access);
		ClothingPicker.setCatalog(catalog);
		mergeCustomClothesIntoCatalog();
		ClothingPicker.setPackItems(state.items);
		ClothingPicker.setEditPose(state.editPose);
		return catalog.length;
	}

	async function loadDesignCatalogForEditor(access)
	{
		if (!IO.loadClothingDesignCatalog)
		{
			state.designCatalog = { standard_graphics: [], items: [] };
			return 0;
		}
		try
		{
			const catalog = await IO.loadClothingDesignCatalog(access);
			state.designCatalog = catalog && typeof catalog === "object"
				? catalog
				: { standard_graphics: [], items: [] };
			if (!Array.isArray(state.designCatalog.items))
				state.designCatalog.items = [];
			return state.designCatalog.items.length;
		}
		catch (e)
		{
			console.warn("[editor] design catalog load failed", e);
			state.designCatalog = { standard_graphics: [], items: [] };
			return 0;
		}
	}

	async function loadMakeupCatalogForEditor(access)
	{
		if (!MakeupPicker) return 0;
		let catalog = [];
		if (isBodyWritingSubTab() && IO.loadBodyWritingCatalog)
			catalog = IO.loadBodyWritingCatalog();
		else if (isFaceHairSubTab() && state.faceHairKind === "hair" && IO.loadHairstylesCatalog)
			catalog = await IO.loadHairstylesCatalog(access);
		else if (isFaceHairSubTab() && state.faceHairKind === "base-face" && IO.loadBaseFacesCatalog)
			catalog = IO.loadBaseFacesCatalog();
		else if (isFaceHairSubTab() && IO.loadFacePartsCatalog)
			catalog = await IO.loadFacePartsCatalog(access);
		else if (IO.loadMakeupCatalog)
			catalog = await IO.loadMakeupCatalog(access);
		if (MakeupPicker.setOverlayKind) MakeupPicker.setOverlayKind(makeupPickerOverlayKind());
		MakeupPicker.setCatalog(catalog);
		MakeupPicker.setPackItems(state.items);
		MakeupPicker.setEditPose(state.editPose);
		return catalog.length;
	}

	function makeupPackOptions()
	{
		return {
			makeupSubTab: state.makeupSubTab,
			makeupSubKind: state.makeupSubTab,
			faceHairKind: state.faceHairKind,
		};
	}

	function itemHasAnyImages(item)
	{
		if (!item || !item.poses) return false;
		return Object.values(item.poses).some((poseDef) =>
			poseDef && poseDef.sources && Object.keys(poseDef.sources).length);
	}

	function cleanClothingLabel(text)
	{
		if (ClothingPicker && ClothingPicker.cleanClothingLabel)
			return ClothingPicker.cleanClothingLabel(text);
		return String(text || "").replace(/%[a-z0-9_]+/gi, " ").replace(/\s+/g, " ").trim();
	}

	function clothingDisplayName(bindingId)
	{
		return ClothingPicker && ClothingPicker.displayNameForBinding
			? ClothingPicker.displayNameForBinding(bindingId)
			: cleanClothingLabel(bindingId) || bindingId;
	}

	function clearItemArt(item)
	{
		if (!item) return;
		revokeEditorItemBlobs([item]);
		const blank = IO.blankItem(0);
		item.poses = blank.poses;
		item._assets = {};
		item.recolor = false;
	}

	function findLayerIndexForBinding(bindingId)
	{
		return state.items.findIndex((item) => (item.cotBindings || []).includes(bindingId));
	}

	function clearClothingAddMode()
	{
		state.clothingAddMode = "bind";
		if (els.btnAddExisting) els.btnAddExisting.classList.remove("is-armed");
	}

	function ensureSelectedClothingLayer()
	{
		let item = selectedItem();
		if (item) return item;
		item = IO.blankItem(state.items.length);
		state.items.push(item);
		state.selectedIndex = state.items.length - 1;
		state._dirty = true;
		renderLayerList();
		return item;
	}

	function applyClothingBindingToItem(item, bindingId)
	{
		const prevBinding = (item.cotBindings && item.cotBindings[0]) || "";
		const bindingChanged = !!prevBinding && prevBinding !== bindingId;
		if (bindingChanged)
			clearItemArt(item);

		const label = clothingDisplayName(bindingId);
		item.cotBindings = [bindingId];
		item.name = label;
		if (!itemHasAnyImages(item) || bindingChanged)
		{
			item.id = IO.slugify(bindingId);
			item.layer = item.id;
		}
		else if (!item.layer)
			item.layer = item.id;
	}

	function finishClothingPickerAction(bindingId, message)
	{
		state._dirty = true;
		renderLayerList();
		renderProps();
		if (ClothingPicker)
		{
			ClothingPicker.setPackItems(state.items);
			ClothingPicker.setSelectedBinding(bindingId);
		}
		scheduleRender();
		setStatus(message);
	}

	function stackClothingOnPreview(bindingId)
	{
		const existingIdx = findLayerIndexForBinding(bindingId);
		if (existingIdx >= 0)
		{
			state.selectedIndex = existingIdx;
			finishClothingPickerAction(bindingId, "Previewing: " + clothingDisplayName(bindingId));
			return;
		}
		const item = IO.blankItem(state.items.length);
		applyClothingBindingToItem(item, bindingId);
		state.items.push(item);
		state.selectedIndex = state.items.length - 1;
		finishClothingPickerAction(bindingId, "Added to preview: " + clothingDisplayName(bindingId));
	}

	function bindClothingToSelectedLayer(bindingId)
	{
		const existingIdx = findLayerIndexForBinding(bindingId);
		if (existingIdx >= 0 && existingIdx !== state.selectedIndex)
		{
			state.selectedIndex = existingIdx;
			finishClothingPickerAction(bindingId, "Authoring: " + clothingDisplayName(bindingId));
			return;
		}
		const item = ensureSelectedClothingLayer();
		applyClothingBindingToItem(item, bindingId);
		finishClothingPickerAction(bindingId, "Bound to layer: " + clothingDisplayName(bindingId));
	}

	function onClothingPickerSelect(bindingId)
	{
		if (!bindingId || state.editorMode !== "clothing") return;
		if (state.clothingAddMode === "stack")
		{
			stackClothingOnPreview(bindingId);
			clearClothingAddMode();
			return;
		}
		bindClothingToSelectedLayer(bindingId);
	}

	function makeupCatalogRow(bindingId)
	{
		return MakeupPicker && MakeupPicker.getCatalogRow
			? MakeupPicker.getCatalogRow(bindingId)
			: null;
	}

	function applyMakeupBindingToItem(item, bindingId)
	{
		const prevBinding = (item.cotBindings && item.cotBindings[0]) || "";
		const bindingChanged = !!prevBinding && prevBinding !== bindingId;
		if (bindingChanged) clearItemArt(item);

		const row = makeupCatalogRow(bindingId);
		const label = MakeupPicker && MakeupPicker.displayNameForBinding
			? MakeupPicker.displayNameForBinding(bindingId)
			: bindingId;
		item.cotBindings = [bindingId];
		item.name = label;
		if (isBodyWritingSubTab())
		{
			item.bodyWritingPlacement = (row && row.slot) || bindingId;
			item.makeupSlot = "";
			item.facePartSlot = "";
			item.hairLayer = "";
			if (!itemHasAnyImages(item) || bindingChanged)
			{
				item.id = IO.slugify("bodywriting-" + bindingId);
				item.layer = "bodywriting";
				if (item.zIndex == null || item.zIndex < 18 || item.zIndex >= 22)
					item.zIndex = 20;
			}
		}
		else if (isFaceHairSubTab() && state.faceHairKind === "hair")
		{
			item.bodyWritingPlacement = "";
			item.makeupSlot = "";
			item.facePartSlot = "";
			const hairLayer = item.hairLayer || "front";
			item.hairLayer = hairLayer;
			if (!itemHasAnyImages(item) || bindingChanged)
			{
				item.id = IO.slugify("hair-" + bindingId);
				item.layer = "hair-" + hairLayer;
				const zByLayer = { back: 14, sides: 28, front: 32 };
				item.zIndex = (zByLayer[hairLayer] || 32);
			}
		}
		else if (isFaceHairSubTab() && state.faceHairKind === "base-face")
		{
			// Must bind to catalog id (base-face-1, …) — runtime matches person["paperdoll face"]
			item.bodyWritingPlacement = "";
			item.makeupSlot = "";
			item.facePartSlot = "";
			item.hairLayer = "";
			item.cotBindings = [bindingId];
			if (!itemHasAnyImages(item) || bindingChanged || !item.id)
			{
				item.id = bindingId;
				item.layer = "base-face";
				item.zIndex = 15;
			}
			else
			{
				// Keep art, but force id/layer into the base-face shape so saves match runtime
				item.id = bindingId;
				item.layer = "base-face";
				if (item.zIndex == null) item.zIndex = 15;
			}
		}
		else if (isFaceHairSubTab())
		{
			item.bodyWritingPlacement = "";
			item.makeupSlot = "";
			item.hairLayer = "";
			const slot = (row && row.slot) || "face";
			item.facePartSlot = slot;
			const slotZ = IO.FACE_PART_SLOTS && IO.FACE_PART_SLOTS.indexOf(slot) >= 0
				? 16 + IO.FACE_PART_SLOTS.indexOf(slot) * 0.1
				: 16;
			if (!itemHasAnyImages(item) || bindingChanged)
			{
				item.id = IO.slugify("face-" + bindingId);
				item.layer = "face";
				item.zIndex = slotZ;
			}
		}
		else
		{
			item.bodyWritingPlacement = "";
			item.facePartSlot = "";
			item.hairLayer = "";
			if (row && row.slot) item.makeupSlot = row.slot;
			if (!itemHasAnyImages(item) || bindingChanged)
			{
				item.id = IO.slugify(bindingId);
				item.layer = item.layer || "makeup";
			}
		}
	}

	function finishMakeupPickerAction(bindingId, message)
	{
		state._dirty = true;
		renderLayerList();
		renderProps();
		if (MakeupPicker)
		{
			MakeupPicker.setPackItems(state.items);
			MakeupPicker.setSelectedBinding(bindingId);
		}
		scheduleRender();
		setStatus(message);
	}

	function bindMakeupToSelectedLayer(bindingId)
	{
		const existingIdx = state.items.findIndex((item) => (item.cotBindings || []).includes(bindingId));
		if (existingIdx >= 0 && existingIdx !== state.selectedIndex)
		{
			state.selectedIndex = existingIdx;
			finishMakeupPickerAction(bindingId, "Authoring: " + (MakeupPicker.displayNameForBinding(bindingId) || bindingId));
			return;
		}
		const item = ensureSelectedClothingLayer();
		applyMakeupBindingToItem(item, bindingId);
		let noun = "makeup";
		if (isBodyWritingSubTab()) noun = "body writing";
		else if (isFaceHairSubTab() && state.faceHairKind === "hair") noun = "hair";
		else if (isFaceHairSubTab() && state.faceHairKind === "base-face") noun = "base face";
		else if (isFaceHairSubTab()) noun = "face part";
		finishMakeupPickerAction(bindingId, "Bound " + noun + ": " + (MakeupPicker.displayNameForBinding(bindingId) || bindingId));
	}

	function onMakeupPickerSelect(bindingId)
	{
		if (!bindingId || state.editorMode !== "makeup") return;
		bindMakeupToSelectedLayer(bindingId);
	}

	async function reloadMakeupSubSection()
	{
		syncPackTypeFromMode();
		syncMakeupSubTabUi();
		const fromDisk = await loadModPackForEditor(state.packId);
		if (fromDisk && fromDisk.items && fromDisk.items.length)
		{
			state.items = fromDisk.items;
			await preloadEditorImages(state.items);
		}
		else
			state.items = [IO.defaultBlankForMode("makeup", 0, makeupPackOptions())];
		state.selectedIndex = 0;
		state._dirty = false;
		if (MakeupPicker) MakeupPicker.setPackItems(state.items);
		const access = await IO.resolveStoredGameAccess({ silent: true });
		if (access) await loadMakeupCatalogForEditor(access);
		renderLayerList();
		renderProps();
		scheduleRender();
	}

	async function switchMakeupSubTab(tabId)
	{
		const next = tabId === "body-writing" ? "body-writing"
			: (tabId === "makeup" ? "makeup" : "face-hair");
		if (state.makeupSubTab === next) return;
		if (state._dirty && !confirm("Switch section? Unsaved changes in this section will be lost.")) return;
		state.makeupSubTab = next;
		state.makeupSubKind = next;
		await reloadMakeupSubSection();
		let msg = "Makeup — bind per-slot items";
		if (isBodyWritingSubTab()) msg = "Body writing — pick a skin placement";
		else if (isFaceHairSubTab() && state.faceHairKind === "hair") msg = "Hair — pick a hairstyle";
		else if (isFaceHairSubTab()) msg = "Face/Hair — pick a distinguishing feature";
		setStatus(msg);
	}

	async function switchFaceHairKind(kind)
	{
		const next = (kind === "hair" || kind === "base-face") ? kind : "face-part";
		if (state.faceHairKind === next) return;
		if (state._dirty && !confirm("Switch face/hair authoring? Unsaved changes will be lost.")) return;
		state.faceHairKind = next;
		await reloadMakeupSubSection();
		setStatus(next === "hair" ? "Hair — pick a hairstyle" : "Face parts — pick a distinguishing feature");
	}

	function initMakeupSubBar()
	{
		if (!els.makeupSubBar) return;
		els.makeupSubBar.querySelectorAll("button[data-makeup-sub]").forEach((btn) =>
		{
			btn.addEventListener("click", () =>
			{
				switchMakeupSubTab(btn.getAttribute("data-makeup-sub")).catch((e) =>
				{
					console.error(e);
					setStatus("Section switch failed: " + e.message);
				});
			});
		});
		if (els.faceHairKind) els.faceHairKind.addEventListener("change", () =>
		{
			switchFaceHairKind(els.faceHairKind.value).catch((e) =>
			{
				console.error(e);
				setStatus("Face/hair switch failed: " + e.message);
			});
		});
	}

	function initMakeupPicker()
	{
		if (!MakeupPicker) return;
		MakeupPicker.init({
			search: els.makeupSearch,
			slot: els.makeupSlot,
			select: els.makeupSelect,
			count: els.makeupCount,
			hideAuthored: els.makeupFilterHideAuthored,
			missingPoseOnly: els.makeupFilterMissingPose,
			hasColorMask: els.makeupFilterColorMask,
		}, onMakeupPickerSelect);
		MakeupPicker.setPackItems(state.items);
		MakeupPicker.setEditPose(state.editPose);
	}

	function armAddExistingClothing()
	{
		if (state.editorMode !== "clothing") return;
		state.clothingAddMode = "stack";
		if (els.btnAddExisting) els.btnAddExisting.classList.add("is-armed");
		setStatus("Pick a clothing piece to stack on the preview (current layer unchanged)…");
	}

	function initClothingPicker()
	{
		if (!ClothingPicker) return;
		ClothingPicker.init({
			search: els.cotClothingSearch,
			category: els.cotClothingCategory,
			select: els.cotClothingSelect,
			count: els.cotClothingCount,
			hideAuthored: els.cotFilterHideAuthored,
			missingPoseOnly: els.cotFilterMissingPose,
			hasDisplacement: els.cotFilterDisplacement,
		}, onClothingPickerSelect);
		ClothingPicker.setPackItems(state.items);
		ClothingPicker.setEditPose(state.editPose);
	}

	async function finishGameConnection(access, fromOverlay)
	{
		setConnectionNoticeDismissed(false);
		const verify = await IO.verifyGameConnection(access);
		showSetupOverlay(false);
		showConnectionStatus(verify);
		const catalogCount = await loadClothingCatalogForEditor(access);
		const designCount = await loadDesignCatalogForEditor(access);
		const makeupCount = await loadMakeupCatalogForEditor(access);
		await refreshGameFolderLabel(verify);
		if (fromOverlay && els.setupVerifyList)
			renderVerifyChecks(els.setupVerifyList, verify.checks);
		if (!state._editorBooted) await bootEditor();
		await reloadCurrentPackFromGame();
		const msg = verify.ok
			? "Game folder connected — Save to game writes to exhibition-paperdoll/ automatically."
				+ (catalogCount ? " Loaded " + catalogCount + " clothing items." : "")
				+ (designCount ? " " + designCount + " graphic/design items for New Skin." : "")
				+ (makeupCount ? " " + makeupCount + " makeup options." : "")
			: "Folder linked with warnings — hover the footer checkbox for details.";
		setStatus(msg);
		return verify.ok;
	}

	async function refreshGameFolderLabel(verify)
	{
		if (!els.gameFolderLabel || !IO) return;
		if (!IO.canSaveToFolder())
		{
			els.gameFolderLabel.textContent = "";
			return;
		}
		const meta = await IO.getSetupMeta();
		if (!meta || !meta.projectName)
		{
			els.gameFolderLabel.textContent = "";
			return;
		}
		let prefix = "";
		if (verify === undefined)
		{
			const access = await IO.resolveStoredGameAccess({ silent: true });
			if (access) verify = await IO.verifyGameConnection(access);
		}
		if (verify && verify.ok) prefix = "✓ ";
		else if (verify) prefix = "⚠ ";
		els.gameFolderLabel.textContent = prefix + "Game: " + meta.projectName
			+ " / " + (meta.gameHtmlName || "HTML");
	}

	async function runGameSetup(fromOverlay, options)
	{
		options = options || {};
		if (!IO.canSaveToFolder())
		{
			const msg = "Save to game needs Chrome or Edge.";
			if (fromOverlay && els.setupStatus) els.setupStatus.textContent = msg;
			setStatus(msg);
			return false;
		}
		try
		{
			if (!options.forceRepick && await IO.hasStoredGameSetup())
			{
				if (fromOverlay && els.setupStatus) els.setupStatus.textContent = "Requesting folder access…";
				const access = await IO.reconnectStoredGameAccess();
				if (access) return finishGameConnection(access, fromOverlay);
			}

			if (fromOverlay && els.setupStatus) els.setupStatus.textContent = "Opening folder picker…";
			const access = await IO.runProjectSetup(options);
			return finishGameConnection(access, fromOverlay);
		}
		catch (e)
		{
			if (e && e.name === "AbortError")
			{
				const msg = "Folder pick cancelled — connect your game folder to continue.";
				if (fromOverlay && els.setupStatus) els.setupStatus.textContent = msg;
				setStatus(msg);
				return false;
			}
			const msg = (e && e.message) ? e.message : String(e);
			if (fromOverlay && els.setupStatus) els.setupStatus.textContent = msg;
			setStatus(msg);
			return false;
		}
	}

	async function runGameReconnect(fromOverlay)
	{
		if (!IO.canSaveToFolder()) return false;
		try
		{
			if (fromOverlay && els.setupStatus) els.setupStatus.textContent = "Requesting folder access…";
			const access = await IO.reconnectStoredGameAccess();
			if (!access)
			{
				const msg = "Could not restore access — choose your game folder again.";
				if (fromOverlay && els.setupStatus) els.setupStatus.textContent = msg;
				setStatus(msg);
				return false;
			}
			return finishGameConnection(access, fromOverlay);
		}
		catch (e)
		{
			const msg = (e && e.message) ? e.message : String(e);
			if (fromOverlay && els.setupStatus) els.setupStatus.textContent = msg;
			setStatus(msg);
			return false;
		}
	}

	function modeConfig() { return PackModes.get(state.editorMode); }

	function syncPackTypeFromMode()
	{
		if (state.editorMode === "makeup" && IO.editorModeToPackType)
		{
			state.packType = IO.editorModeToPackType("makeup", {
				makeupSubTab: state.makeupSubTab,
				makeupSubKind: state.makeupSubTab,
				faceHairKind: state.faceHairKind,
			});
		}
		else
			state.packType = modeConfig().packType;
	}

	function makeupPickerOverlayKind()
	{
		if (state.makeupSubTab === "body-writing") return "body-writing";
		if (state.makeupSubTab === "face-hair")
		{
			if (state.faceHairKind === "hair") return "hair";
			if (state.faceHairKind === "base-face") return "base-face";
			return "face-part";
		}
		return "makeup";
	}

	function isBodyWritingSubTab() { return state.editorMode === "makeup" && state.makeupSubTab === "body-writing"; }
	function isFaceHairSubTab() { return state.editorMode === "makeup" && state.makeupSubTab === "face-hair"; }
	function isMakeupSubTab() { return state.editorMode === "makeup" && state.makeupSubTab === "makeup"; }

	function syncMakeupSubTabUi()
	{
		if (els.makeupSubBar)
		{
			els.makeupSubBar.querySelectorAll("button[data-makeup-sub]").forEach((btn) =>
			{
				btn.classList.toggle("active", btn.getAttribute("data-makeup-sub") === state.makeupSubTab);
			});
		}
		if (els.faceHairKindWrap)
			els.faceHairKindWrap.classList.toggle("hidden", !isFaceHairSubTab());
		if (els.faceHairKind)
			els.faceHairKind.value = state.faceHairKind || "face-part";
		if (els.makeupSelectLabel)
		{
			if (isBodyWritingSubTab()) els.makeupSelectLabel.textContent = "Body placement";
			else if (isFaceHairSubTab() && state.faceHairKind === "hair") els.makeupSelectLabel.textContent = "Hair style";
			else if (isFaceHairSubTab() && state.faceHairKind === "base-face") els.makeupSelectLabel.textContent = "Base face";
			else if (isFaceHairSubTab()) els.makeupSelectLabel.textContent = "Distinguishing feature";
			else els.makeupSelectLabel.textContent = "In-game makeup item";
		}
		if (els.makeupSearch)
		{
			if (isBodyWritingSubTab()) els.makeupSearch.placeholder = "Search placement or area…";
			else if (isFaceHairSubTab() && state.faceHairKind === "hair") els.makeupSearch.placeholder = "Search hairstyle…";
			else if (isFaceHairSubTab() && state.faceHairKind === "base-face") els.makeupSearch.placeholder = "Search base face…";
			else if (isFaceHairSubTab()) els.makeupSearch.placeholder = "Search distinguishing feature…";
			else els.makeupSearch.placeholder = "Search makeup name or slot…";
		}
		if (els.makeupFieldHint)
		{
			if (isBodyWritingSubTab())
				els.makeupFieldHint.innerHTML = "Click a placement to <strong>bind it to the selected layer</strong>. Body writing draws on skin above tattoos (z≈20), below makeup and clothing.";
			else if (isFaceHairSubTab() && state.faceHairKind === "hair")
				els.makeupFieldHint.innerHTML = "Bind each layer to a <strong>hair style</strong> from <code>setup.hairstyles</code>. Use front/back poses for hair-front and hair-back layers (z≈32 / z≈14). NPCs render hair from <code>hair style</code> + <code>hair length</code>.";
			else if (isFaceHairSubTab() && state.faceHairKind === "base-face")
				els.makeupFieldHint.innerHTML = "Author <strong>full base faces</strong> (z≈15) bound to <code>person[\"paperdoll face\"]</code>. Register more ids with <code>setup.ExhibitionPaperdoll.BaseFaces.register()</code>. Players pick one base face in mirrors.";
			else if (isFaceHairSubTab())
				els.makeupFieldHint.innerHTML = "Author <strong>distinguishing feature overlays</strong> (z≈17) on the base face. Bind each layer to a <code>distinguishing_marks</code> id — all chosen marks render (same list as the in-game description).";
			else
				els.makeupFieldHint.innerHTML = "Bind per-slot makeup items (eyeshadow, lipstick, etc.) — these match <code>person.makeup[slot]</code> after NPCs roll a <code>setup.makeup_styles</code> preset.";
		}
		if (els.layersTitle)
		{
			if (isBodyWritingSubTab()) els.layersTitle.textContent = "Body writing overlays";
			else if (isFaceHairSubTab() && state.faceHairKind === "hair") els.layersTitle.textContent = "Hair overlays";
			else if (isFaceHairSubTab() && state.faceHairKind === "base-face") els.layersTitle.textContent = "Base face overlays";
			else if (isFaceHairSubTab()) els.layersTitle.textContent = "Distinguishing overlays";
			else els.layersTitle.textContent = "Makeup overlays";
		}
		if (els.btnAddLayer && state.editorMode === "makeup")
		{
			let label = "Makeup piece";
			if (isBodyWritingSubTab()) label = "Body writing piece";
			else if (isFaceHairSubTab() && state.faceHairKind === "hair") label = "Hair piece";
			else if (isFaceHairSubTab() && state.faceHairKind === "base-face") label = "Base face";
			else if (isFaceHairSubTab()) label = "Distinguishing overlay";
			els.btnAddLayer.textContent = "+ " + label;
		}
		if (MakeupPicker && MakeupPicker.setOverlayKind)
			MakeupPicker.setOverlayKind(makeupPickerOverlayKind());
	}

	function loadBasePosesFromEmbed()
	{
		const bodyLayer = EP._basePack && EP._basePack.layers && EP._basePack.layers[0];
		if (!bodyLayer) return IO.blankBaseBody();
		const item = IO.blankBaseBody();
		for (const [poseId, poseDef] of Object.entries(bodyLayer.poses || {}))
		{
			if (!poseDef) continue;
			const sources = {};
			const src = poseDef.sources || {};
			for (const [tier, path] of Object.entries(src))
			{
				const url = Core.resolveAssetPath(path);
				if (url) sources[tier] = url;
			}
			if (Object.keys(sources).length)
			{
				item.poses[poseId] = { sources: sources, transform: IO.normalizeTransform(poseDef.transform) };
				for (const [tier, url] of Object.entries(sources))
					item._assets[poseId + "_" + tier] = { url: url, blob: null };
			}
		}
		return item;
	}

	async function loadBasePosesForEditor()
	{
		if (IO.canSaveToFolder())
		{
			try
			{
				const access = await IO.resolveStoredGameAccess({ silent: true });
				if (access)
				{
					const fromDisk = await IO.loadBasePackEditorState(access.epRoot);
					if (fromDisk) return fromDisk;
				}
			}
			catch (e) { console.warn("loadBasePosesForEditor", e); }
		}
		return loadBasePosesFromEmbed();
	}

	async function reloadBasePosesFromGame()
	{
		if (!isBasePosesMode()) return;
		state.items = [await loadBasePosesForEditor()];
		state.selectedIndex = 0;
		state._dirty = false;
		renderLayerList();
		renderProps();
		updateDropHint();
		scheduleRender();
	}

	function renderModeBar()
	{
		if (!els.modeBar) return;
		els.modeBar.innerHTML = "";
		for (const modeId of PackModes.ORDER)
		{
			const cfg = PackModes.get(modeId);
			const btn = document.createElement("button");
			btn.type = "button";
			btn.textContent = cfg.label;
			btn.className = state.editorMode === modeId ? "active" : "";
			btn.addEventListener("click", () => switchEditorMode(modeId));
			els.modeBar.appendChild(btn);
		}
	}

	function updatePackBarSummary()
	{
		if (!els.packBarSummary) return;
		const name = (els.packName && els.packName.value.trim()) || state.packName || "";
		const id = (els.packId && els.packId.value.trim()) || state.packId || "";
		if (name && id && name !== id)
			els.packBarSummary.textContent = name + " · " + id;
		else
			els.packBarSummary.textContent = name || id || "";
	}

	function setPackBarOpen(open)
	{
		if (!els.packBarToggle || !els.packMetaPanel) return;
		els.packBarToggle.setAttribute("aria-expanded", open ? "true" : "false");
		els.packMetaPanel.classList.toggle("is-collapsed", !open);
		els.packMetaPanel.hidden = !open;
	}

	function setSectionOpen(section, open)
	{
		if (!section) return;
		const toggle = section.querySelector(":scope > .section-toggle");
		const body = section.querySelector(":scope > .section-body");
		section.classList.toggle("is-collapsed", !open);
		if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
		if (body) body.hidden = !open;
	}

	function wireCollapsibleUi()
	{
		if (els.packBarToggle)
		{
			els.packBarToggle.addEventListener("click", () =>
			{
				const open = els.packBarToggle.getAttribute("aria-expanded") !== "true";
				setPackBarOpen(open);
			});
			setPackBarOpen(false);
		}

		document.querySelectorAll(".collapsible-section").forEach((section) =>
		{
			const toggle = section.querySelector(":scope > .section-toggle");
			if (!toggle || toggle._collapseWired) return;
			toggle._collapseWired = true;
			const defaultOpen = toggle.getAttribute("aria-expanded") !== "false";
			setSectionOpen(section, defaultOpen);
			toggle.addEventListener("click", () =>
			{
				const open = toggle.getAttribute("aria-expanded") !== "true";
				setSectionOpen(section, open);
			});
		});

		const onPackMetaInput = () => updatePackBarSummary();
		if (els.packId) els.packId.addEventListener("input", onPackMetaInput);
		if (els.packName) els.packName.addEventListener("input", onPackMetaInput);
		updatePackBarSummary();
	}

	function applyModeUi()
	{
		const cfg = modeConfig();
		if (els.appTitle) els.appTitle.textContent = "CoT-Body-Pose-Editor";
		if (els.modeHint) els.modeHint.textContent = cfg.hint;
		if (els.packBar) els.packBar.classList.toggle("hidden", !cfg.showPackMeta);
		if (els.packMetaPanel && !cfg.showPackMeta) setPackBarOpen(false);
		if (els.layersTitle) els.layersTitle.textContent = cfg.layersTitle;
		if (els.btnAddLayer)
		{
			els.btnAddLayer.textContent = state.editorMode === "clothing" ? "+ New Skin" : "+ " + cfg.pieceLabel;
			if (state.editorMode === "clothing")
			{
				els.btnAddLayer.title = "New Skin: art for an existing game clothing item and optional graphic/design (matches shop sub design text when worn).";
			}
			else
			{
				els.btnAddLayer.title = "Add a new pack layer for this workflow.";
			}
		}
		if (els.btnCreateClothing)
			els.btnCreateClothing.style.display = state.editorMode === "clothing" ? "" : "none";
		if (els.btnAddExisting)
		{
			els.btnAddExisting.style.display = state.editorMode === "clothing" ? "" : "none";
			if (state.editorMode !== "clothing") clearClothingAddMode();
		}
		if (els.cotField) els.cotField.classList.toggle("hidden", !cfg.showCotBindings);
		if (els.makeupField) els.makeupField.classList.toggle("hidden", !cfg.showMakeupBindings);
		if (cfg.showMakeupBindings) syncMakeupSubTabUi();
		if (els.exposureDispField) els.exposureDispField.classList.toggle("hidden", state.editorMode !== "clothing");
		if (els.enabledDispField) els.enabledDispField.classList.toggle("hidden", state.editorMode !== "clothing");
		if (els.clothingFlagsField) els.clothingFlagsField.classList.toggle("hidden", state.editorMode !== "clothing");
		const showRecolor = state.editorMode === "clothing" || !!cfg.showRecolor;
		if (els.recolorField) els.recolorField.classList.toggle("hidden", !showRecolor);
		if (els.colorMaskPanel) els.colorMaskPanel.classList.toggle("hidden", !showRecolor);
		if (els.layerCategoryField) els.layerCategoryField.classList.toggle("hidden", !cfg.showLayerCategory);
		if (els.dispPreviewWrap) els.dispPreviewWrap.classList.toggle("hidden", state.editorMode !== "clothing");
		if (els.displacementPanel) els.displacementPanel.classList.toggle("hidden", state.editorMode !== "clothing");
		if (els.layerCategoryBadge && cfg.layerCategoryLabel) els.layerCategoryBadge.textContent = cfg.layerCategoryLabel;
		if (els.layersSection) els.layersSection.classList.toggle("hidden", !cfg.showPieceList);
		if (els.layerActions) els.layerActions.style.display = cfg.showAddPiece ? "flex" : "none";
		if (els.layerList) els.layerList.style.display = cfg.showPieceList ? "" : "none";
		if (els.bodySizeSection)
			els.bodySizeSection.classList.toggle("hidden", state.editorMode !== "base-poses");
		if (state.editorMode === "base-poses") renderBodySizeMenu();
		updatePackBarSummary();
		renderModeBar();
	}

	function switchEditorMode(modeId)
	{
		if (state.editorMode === modeId) return;
		if (state._dirty && !confirm("Switch workflow? Unsaved changes in this pack will be lost.")) return;
		state.editorMode = modeId;
		syncPackTypeFromMode();
		newPack().catch((e) => { console.error(e); setStatus("Mode switch failed: " + e.message); });
	}

	function isImageFile(file)
	{
		if (!file) return false;
		if (file.type && file.type.startsWith("image/")) return true;
		return /\.(png|jpe?g|webp)$/i.test(file.name || "");
	}

	function isZipFile(file)
	{
		if (!file) return false;
		if (/zip/i.test(file.type || "")) return true;
		return /\.zip$/i.test(file.name || "");
	}

	function updateImportBanner()
	{
		if (!els.importBanner) return;
		if (state._pendingInstall)
		{
			els.importBanner.classList.remove("hidden");
			if (els.importBannerName)
				els.importBannerName.textContent = state._importedFrom || state.packName || state.packId;
		}
		else
			els.importBanner.classList.add("hidden");
	}

	function applyImportedState(imported, filename)
	{
		Object.assign(state, imported);
		if (imported.editorMode) state.editorMode = imported.editorMode;
		if (imported.makeupSubTab) state.makeupSubTab = imported.makeupSubTab;
		if (imported.makeupSubKind) state.makeupSubTab = imported.makeupSubKind;
		if (imported.faceHairKind) state.faceHairKind = imported.faceHairKind;
		state.makeupSubKind = state.makeupSubTab;
		syncPackTypeFromMode();
		state.selectedIndex = 0;
		state.editPose = "front";
		state.editLod = 1024;
		state.previewPose = "front";
		state.previewLod = 512;
		state._dirty = false;
		state._pendingInstall = true;
		state._importedFrom = filename || imported.packName || imported.packId || "asset pack";
		els.packId.value = state.packId;
		els.packName.value = state.packName;
		els.packDesc.value = state.packDescription || "";
		els.previewLod.value = String(state.previewLod);
		if (els.editLod) els.editLod.value = String(state.editLod);
		applyPosesToEditor(imported.poses, imported.poseMeta);
		if (els.editPose) els.editPose.value = state.editPose || "front";
		applyModeUi();
		updateImportBanner();
		updateDropHint();
		refreshPoseControls();
		renderPoseManager();
		renderLayerList();
		renderProps();
		if (ClothingPicker) ClothingPicker.setPackItems(state.items);
		scheduleRender();
	}

	async function importPackFile(file)
	{
		if (!isZipFile(file))
		{
			setStatus("Import expects a .zip asset pack");
			return;
		}
		try
		{
			setStatus("Importing " + file.name + "…");
			const imported = await IO.importZip(file);
			const isClothing = !imported.editorMode || imported.editorMode === "clothing";
			const hasCurrent = state.items.some((it) =>
				(it.cotBindings && it.cotBindings.length)
				|| (it.gameClothing && it.gameClothing.itemId)
				|| Object.values(it.poses || {}).some((p) => p && p.sources && Object.keys(p.sources).length)
			);

			if (!isClothing || !hasCurrent)
			{
				if (state._dirty && !confirm("Replace the current pack with \"" + file.name + "\"?"))
					return;
				applyImportedState(imported, file.name);
				mergeCustomClothesIntoCatalog();
				setStatus("Imported " + file.name + " — preview, then Save to install. Custom clothes included if present.");
				return;
			}

			// Merge clothing pack with conflict resolution
			const catalog = (ClothingPicker && ClothingPicker._catalog) || [];
			const conflicts = CustomClothing
				? CustomClothing.findImportConflicts(imported.items, state.items, catalog)
				: [];
			const conflictBindings = new Set(conflicts.map((c) => c.binding));
			const decisions = await resolveImportConflicts(conflicts);

			// Apply non-conflicting items + decided conflicts
			let added = 0;
			let skipped = 0;
			let overwritten = 0;
			let renamed = 0;

			for (const inc of imported.items || [])
			{
				if (!inc) continue;
				const binding = (inc.cotBindings && inc.cotBindings[0])
					|| (inc.gameClothing && inc.gameClothing.itemId)
					|| inc.id;
				if (conflictBindings.has(binding))
				{
					const d = decisions[binding];
					if (!d || d.action === "skip")
					{
						skipped++;
						continue;
					}
					if (d.action === "overwrite")
					{
						const idx = state.items.findIndex((it) =>
							(it.cotBindings && it.cotBindings[0] === binding)
							|| (it.gameClothing && it.gameClothing.itemId === binding)
							|| it.id === inc.id
						);
						if (idx >= 0)
						{
							revokeEditorItemBlobs([state.items[idx]]);
							state.items[idx] = inc;
						}
						else
							state.items.push(inc);
						overwritten++;
						added++;
						continue;
					}
					if (d.action === "rename")
					{
						const renamedItem = inc;
						if (CustomClothing && CustomClothing.renamePackItem)
							CustomClothing.renamePackItem(renamedItem, d.newName);
						else
						{
							renamedItem.name = d.newName;
							renamedItem.cotBindings = [d.newName];
							if (renamedItem.gameClothing)
								renamedItem.gameClothing.itemId = d.newName;
						}
						state.items.push(renamedItem);
						renamed++;
						added++;
						continue;
					}
				}
				else
				{
					// no conflict — append (avoid duplicate id silently)
					const exists = state.items.some((it) => it.id === inc.id
						&& (it.cotBindings && it.cotBindings[0]) === binding);
					if (!exists)
					{
						state.items.push(inc);
						added++;
					}
				}
			}

			if (imported.packName && !state.packName) state.packName = imported.packName;
			state._dirty = true;
			state._pendingInstall = true;
			state._importedFrom = file.name;
			state.selectedIndex = Math.max(0, state.items.length - 1);
			mergeCustomClothesIntoCatalog();
			if (ClothingPicker) ClothingPicker.setPackItems(state.items);
			updateImportBanner();
			updateDropHint();
			renderLayerList();
			renderProps();
			scheduleRender();
			setStatus(
				"Merged " + file.name + ": +" + added
				+ (overwritten ? ", overwrote " + overwritten : "")
				+ (renamed ? ", renamed " + renamed : "")
				+ (skipped ? ", skipped " + skipped : "")
				+ ". Save to game to install clothes + art."
			);
		}
		catch (e)
		{
			console.error(e);
			setStatus("Import failed: " + e.message);
		}
	}

	/**
	 * Show conflict dialog for each conflict; returns map binding -> { action, newName? }.
	 */
	function resolveImportConflicts(conflicts)
	{
		if (!conflicts || !conflicts.length) return Promise.resolve({});
		const decisions = {};
		let i = 0;

		return new Promise((resolve) =>
		{
			const finish = () =>
			{
				if (els.importConflictModal) els.importConflictModal.classList.add("hidden");
				resolve(decisions);
			};

			const showNext = () =>
			{
				if (i >= conflicts.length)
				{
					finish();
					return;
				}
				const c = conflicts[i];
				if (els.importConflictProgress)
					els.importConflictProgress.textContent = (i + 1) + " / " + conflicts.length;
				if (els.importConflictReasons)
					els.importConflictReasons.textContent = (c.reasons || []).join(" · ");
				if (els.importConflictOldMeta)
				{
					const ex = c.existing;
					const g = c.existingGame;
					els.importConflictOldMeta.textContent = ex
						? ((ex.name || ex.id) + (g && g.category ? " · " + g.category : "")
							+ (itemHasAnyImages(ex) ? " · has art" : " · no art"))
						: (c.catalog
							? (c.catalog.id + " (in game catalog"
								+ (c.catalog.custom ? ", custom" : ", vanilla") + ")")
							: "— none in pack —");
				}
				if (els.importConflictNewMeta)
				{
					const inc = c.incoming;
					const g = c.incomingGame;
					els.importConflictNewMeta.textContent = (inc.name || inc.id)
						+ (g && g.category ? " · " + g.category : "")
						+ (itemHasAnyImages(inc) ? " · has art" : " · no art");
				}
				if (els.importConflictRename)
					els.importConflictRename.value = (c.binding || "Custom Item") + " (imported)";

				renderConflictMirrors(c).catch(console.error);

				const go = (action) =>
				{
					const decision = { action: action };
					if (action === "rename")
					{
						const name = (els.importConflictRename && els.importConflictRename.value.trim())
							|| ((c.binding || "Item") + " Import");
						decision.newName = name;
					}
					decisions[c.binding] = decision;
					i++;
					showNext();
				};

				if (els.importConflictSkip)
					els.importConflictSkip.onclick = () => go("skip");
				if (els.importConflictOverwrite)
					els.importConflictOverwrite.onclick = () => go("overwrite");
				if (els.importConflictRenameBtn)
					els.importConflictRenameBtn.onclick = () => go("rename");

				if (els.importConflictModal) els.importConflictModal.classList.remove("hidden");
			};

			showNext();
		});
	}

	async function renderConflictMirrors(conflict)
	{
		const pose = state.previewPose || "front";
		const quality = "sidebar";
		if (els.importConflictOldCanvas)
		{
			const ctx = els.importConflictOldCanvas.getContext("2d");
			ctx.clearRect(0, 0, els.importConflictOldCanvas.width, els.importConflictOldCanvas.height);
			if (conflict.existing && itemHasAnyImages(conflict.existing))
			{
				await EP.previewCompose(els.importConflictOldCanvas, {
					pose: pose,
					quality: quality,
					editorLayers: IO.editorLayersFromState
						? IO.editorLayersFromState({ items: [conflict.existing], packType: "clothing" })
						: [conflict.existing],
					displacement: "normal",
				});
			}
			else
			{
				ctx.fillStyle = "#2a2a40";
				ctx.fillRect(0, 0, els.importConflictOldCanvas.width, els.importConflictOldCanvas.height);
				ctx.fillStyle = "#9a9ab8";
				ctx.font = "12px sans-serif";
				ctx.textAlign = "center";
				ctx.fillText(conflict.existing ? "No art" : "Game only", els.importConflictOldCanvas.width / 2, 160);
			}
		}
		if (els.importConflictNewCanvas)
		{
			const ctx = els.importConflictNewCanvas.getContext("2d");
			ctx.clearRect(0, 0, els.importConflictNewCanvas.width, els.importConflictNewCanvas.height);
			if (conflict.incoming && itemHasAnyImages(conflict.incoming))
			{
				await EP.previewCompose(els.importConflictNewCanvas, {
					pose: pose,
					quality: quality,
					editorLayers: IO.editorLayersFromState
						? IO.editorLayersFromState({ items: [conflict.incoming], packType: "clothing" })
						: [conflict.incoming],
					displacement: "normal",
				});
			}
			else
			{
				ctx.fillStyle = "#2a2a40";
				ctx.fillRect(0, 0, els.importConflictNewCanvas.width, els.importConflictNewCanvas.height);
				ctx.fillStyle = "#9a9ab8";
				ctx.font = "12px sans-serif";
				ctx.textAlign = "center";
				ctx.fillText("No art", els.importConflictNewCanvas.width / 2, 160);
			}
		}
	}

	function updateDropHint()
	{
		const hasAny = state.items.some((item) =>
			Object.values(item.poses || {}).some((p) => p && p.sources && Object.keys(p.sources).length));
		els.dropZone.classList.toggle("has-preview", hasAny);
	}

	function readImageSize(file)
	{
		return new Promise((resolve, reject) =>
		{
			const url = URL.createObjectURL(file);
			const img = new Image();
			img.onload = () =>
			{
				const size = { width: img.naturalWidth, height: img.naturalHeight };
				URL.revokeObjectURL(url);
				resolve(size);
			};
			img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read image")); };
			img.src = url;
		});
	}

	function detectLod(width)
	{
		const tiers = IO.LOD_TIERS.slice().sort((a, b) => a - b);
		let best = tiers[0];
		for (const tier of tiers)
		{
			if (width >= tier * 0.75) best = tier;
		}
		return best;
	}

	function parseFilenameHints(filename)
	{
		const base = String(filename || "").replace(/\.[^.]+$/, "").toLowerCase();
		const hints = { pose: null, name: cleanClothingLabel(base.replace(/[_-]+/g, " ")) };
		if (/\bon[_-]?stomach\b|stomach/.test(base)) hints.pose = "on_stomach";
		else if (/\bon[_-]?back\b/.test(base)) hints.pose = "on_back";
		else if (/\bback\b/.test(base)) hints.pose = "back";
		else if (/\bfront\b/.test(base)) hints.pose = "front";
		return hints;
	}

	function collapseBasePoseItems()
	{
		if (!isBasePosesMode() || state.items.length <= 1) return;
		const merged = IO.defaultBlankForMode("base-poses", 0);
		for (const item of state.items)
		{
			for (const [poseId, poseDef] of Object.entries(item.poses || {}))
			{
				if (!poseDef || !poseDef.sources) continue;
				const target = ensurePoseEntry(merged, poseId);
				for (const [tier, src] of Object.entries(poseDef.sources))
				{
					if (!src) continue;
					target.sources[tier] = src;
					const assetKey = poseId + "_" + tier;
					if (item._assets && item._assets[assetKey])
						merged._assets[assetKey] = item._assets[assetKey];
				}
				if (poseDef.transform) target.transform = Object.assign({}, target.transform, poseDef.transform);
			}
		}
		state.items = [merged];
		state.selectedIndex = 0;
	}

	function ensureItemForImage(hints)
	{
		if (isBasePosesMode())
		{
			if (!state.items.length)
				state.items.push(IO.defaultBlankForMode(state.editorMode, 0));
			state.selectedIndex = 0;
			return state.items[0];
		}

		let item = selectedItem();
		const poseKey = state.editPose;
		const hasImage = item && item.poses[poseKey] && item.poses[poseKey].sources &&
			Object.keys(item.poses[poseKey].sources).length;
		if (!item || hasImage)
		{
			const idx = state.items.length;
			item = IO.defaultBlankForMode(state.editorMode, idx, makeupPackOptions());
			if (hints.name && !isBasePosesMode())
			{
				item.name = hints.name;
				item.id = IO.slugify(hints.name);
			}
			state.items.push(item);
			state.selectedIndex = state.items.length - 1;
			renderLayerList();
		}
		else if (hints.name && !isBasePosesMode() && (item.name === "New layer 1" || item.name.startsWith("New layer") || item.name.startsWith("Skin piece") || item.name.startsWith("Wet piece")))
		{
			item.name = hints.name;
			if (!itemHasAnyImages(item)) item.id = IO.slugify(hints.name);
		}
		return item;
	}

	async function assignImageFile(file, options)
	{
		options = options || {};
		if (!isImageFile(file))
		{
			setStatus("Please drop a PNG, WebP, or JPEG image");
			return;
		}

		const hints = parseFilenameHints(file.name);
		if (hints.pose && !options.keepPose)
		{
			state.editPose = hints.pose;
			state.previewPose = hints.pose;
			els.editPose.value = hints.pose;
			refreshPoseControls();
		}

		let item;
		if (options.forceCurrent)
		{
			item = selectedItem();
			if (!item)
			{
				setStatus("Select a clothing piece first");
				return;
			}
		}
		else
			item = ensureItemForImage(hints);

		const target = getActiveImageTarget(item);
		let tier = options.lod;
		if (!tier)
		{
			try
			{
				const size = await readImageSize(file);
				tier = detectLod(size.width);
			}
			catch (e)
			{
				tier = state.editLod || 1024;
			}
			setEditLod(tier);
		}

		const old = target.sources[tier];
		if (old && old.startsWith("blob:")) URL.revokeObjectURL(old);
		const url = URL.createObjectURL(file);
		target.sources[tier] = url;
		item._assets = item._assets || {};
		item._assets[target.assetPrefix + "_" + tier] = { url: url, blob: file };

		state._dirty = true;
		updateDropHint();
		renderProps();
		applyLayerMeta();
		scheduleRender();
		setStatus("Added " + file.name + " → " + poseLabel(state.editPose)
			+ " / " + target.label + " @ " + tier + "px");
	}

	function setEditLod(tier)
	{
		const n = Number(tier) || 1024;
		const tiers = IO.LOD_TIERS || [256, 512, 1024, 2048];
		state.editLod = tiers.includes(n) ? n : 1024;
		if (els.editLod) els.editLod.value = String(state.editLod);
		return state.editLod;
	}

	function currentEditLod()
	{
		const n = Number(state.editLod) || 1024;
		const tiers = IO.LOD_TIERS || [256, 512, 1024, 2048];
		return tiers.includes(n) ? n : 1024;
	}

	/** Build one image slot at the shared resolution (file picker + optional clear). */
	function renderSingleImageSlot(container, options)
	{
		if (!container) return;
		const url = options.url || "";
		const label = options.label || "Image";
		const slot = document.createElement("div");
		slot.className = "lod-slot" + (url ? " has-image" : "");

		// Only create <img> when a real URL exists — empty src shows a broken icon.
		if (url)
		{
			const img = document.createElement("img");
			img.alt = label;
			img.src = url;
			img.addEventListener("error", () =>
			{
				img.remove();
				const ph = document.createElement("div");
				ph.className = "lod-slot-placeholder lod-slot-error";
				ph.textContent = "Failed to load";
				slot.insertBefore(ph, slot.firstChild);
				slot.classList.remove("has-image");
			});
			slot.appendChild(img);
		}
		else
		{
			const ph = document.createElement("div");
			ph.className = "lod-slot-placeholder";
			ph.textContent = "No image";
			slot.appendChild(ph);
		}

		const cap = document.createElement("div");
		cap.className = "lod-slot-label";
		cap.textContent = label;
		slot.appendChild(cap);

		const actions = document.createElement("div");
		actions.className = "lod-slot-actions";

		const file = document.createElement("input");
		file.type = "file";
		file.accept = "image/png,image/webp,image/jpeg";
		file.title = "Add image at " + currentEditLod() + "px";
		file.addEventListener("change", () =>
		{
			const f = file.files && file.files[0];
			file.value = "";
			if (!f) return;
			if (typeof options.onFile === "function") options.onFile(f);
		});
		actions.appendChild(file);

		if (url && typeof options.onClear === "function")
		{
			const clear = document.createElement("button");
			clear.type = "button";
			clear.textContent = "Clear";
			clear.addEventListener("click", () => options.onClear());
			actions.appendChild(clear);
		}

		slot.appendChild(actions);
		container.appendChild(slot);
	}

	function updateLodOtherHint(item)
	{
		if (!els.lodOtherHint) return;
		if (!item)
		{
			els.lodOtherHint.classList.add("hidden");
			els.lodOtherHint.textContent = "";
			return;
		}
		const poseDef = ensurePoseEntry(item, state.editPose);
		const sources = (poseDef && poseDef.sources) || {};
		const active = currentEditLod();
		const others = (IO.LOD_TIERS || []).filter((t) => t !== active && sources[t]);
		if (!others.length)
		{
			els.lodOtherHint.classList.add("hidden");
			els.lodOtherHint.textContent = "";
			return;
		}
		els.lodOtherHint.classList.remove("hidden");
		els.lodOtherHint.textContent = "Also stored for this pose: " + others.map((t) => t + "px").join(", ")
			+ " (switch size above to view/edit).";
	}

	function wireDropZone()
	{
		const zone = els.dropZone;
		if (!zone) return;

		const onDragEnter = (e) =>
		{
			e.preventDefault();
			dragDepth++;
			zone.classList.add("drag-over");
		};
		const onDragLeave = (e) =>
		{
			e.preventDefault();
			dragDepth = Math.max(0, dragDepth - 1);
			if (dragDepth === 0) zone.classList.remove("drag-over");
		};
		const onDragOver = (e) => { e.preventDefault(); };
		const onDrop = (e) =>
		{
			e.preventDefault();
			dragDepth = 0;
			zone.classList.remove("drag-over");
			const files = e.dataTransfer && e.dataTransfer.files;
			if (!files || !files.length) return;
			for (const file of files)
			{
				if (isZipFile(file))
				{
					importPackFile(file);
					return;
				}
			}
			for (const file of files)
			{
				if (isImageFile(file))
				{
					assignImageFile(file).catch(console.error);
					return;
				}
			}
			setStatus("Drop a PNG image or .zip asset pack");
		};

		zone.addEventListener("dragenter", onDragEnter);
		zone.addEventListener("dragleave", onDragLeave);
		zone.addEventListener("dragover", onDragOver);
		zone.addEventListener("drop", onDrop);

		document.addEventListener("dragover", (e) => e.preventDefault());
		document.addEventListener("drop", (e) =>
		{
			if (!zone.contains(e.target)) e.preventDefault();
		});
	}

	function selectedItem() { return state.items[state.selectedIndex] || null; }

	function isBasePosesMode() { return state.editorMode === "base-poses"; }

	function ensurePoseEntry(item, poseId)
	{
		if (!item.poses[poseId])
		{
			item.poses[poseId] = { sources: {}, transform: IO.normalizeTransform() };
			if (IO.syncPoseAssetsToPoses) IO.syncPoseAssetsToPoses([item]);
		}
		return item.poses[poseId];
	}

	function scheduleRender()
	{
		if (renderTimer) cancelAnimationFrame(renderTimer);
		renderTimer = requestAnimationFrame(() => { renderPreview().catch(console.error); });
	}

	function mirrorBackgrounds()
	{
		return Core && Core.Backgrounds ? Core.Backgrounds : null;
	}

	function refreshPreviewBgBar()
	{
		const BG = mirrorBackgrounds();
		if (!BG || !els.previewBgBar) return;
		if (els.dropZone)
		{
			els.dropZone.classList.add("exhib-mirror-stage");
			els.dropZone.setAttribute("data-exhib-mirror", "editor");
		}
		BG.mountControls(els.previewBgBar, "editor", {
			label: "BG",
			stageEl: els.dropZone,
			onChange: function() { scheduleRender(); },
		});
		if (els.dropZone) BG.applyStyle(els.dropZone, BG.getForMirror("editor"));
	}

	async function initPreviewBackgrounds()
	{
		const BG = mirrorBackgrounds();
		if (!BG) return;
		try
		{
			if (BG.loadManifest) await BG.loadManifest();
		}
		catch (e) { console.warn("[editor] bg manifest", e); }
		// Re-apply any pending uploads (session)
		for (const row of state.pendingBgUploads || [])
			BG.registerCustom({ id: row.id, label: row.label, path: row.path, url: row.url });
		refreshPreviewBgBar();
	}

	function addCustomBackgroundFile(file)
	{
		const BG = mirrorBackgrounds();
		if (!BG || !file) return;
		const base = file.name.replace(/\.[^.]+$/, "");
		let id = BG.slugify(base);
		let n = 2;
		while (BG.list().some((e) => e.id === id))
		{
			id = BG.slugify(base) + "-" + n;
			n++;
		}
		const extMatch = file.name.match(/\.(png|webp|jpe?g)$/i);
		const ext = extMatch ? extMatch[0].toLowerCase().replace("jpeg", "jpg") : ".png";
		const path = "backgrounds/" + id + ext;
		const url = URL.createObjectURL(file);
		BG.registerCustom({ id: id, label: id, path: path, url: url });
		state.pendingBgUploads = state.pendingBgUploads || [];
		// Replace if re-uploaded same id
		state.pendingBgUploads = state.pendingBgUploads.filter((r) => r.id !== id);
		state.pendingBgUploads.push({ id: id, label: id, path: path, blob: file, url: url });
		state._dirty = true;
		BG.setForMirror("editor", id);
		refreshPreviewBgBar();
		setStatus(
			"Background \"" + id + "\" ready in editor. Save to game to use it in Appearance / Face mirrors."
		);
		scheduleRender();
	}

	async function renderPreview()
	{
		if (IO.syncPoseAssetsToPoses) IO.syncPoseAssetsToPoses(state.items);
		// Keep stage BG in sync (line-art visibility)
		const BG = mirrorBackgrounds();
		if (BG && els.dropZone)
			BG.applyStyle(els.dropZone, BG.getForMirror("editor"));
		let layers = IO.editorLayersFromState(state);
		// Base poses: preview selected body variant / hair (or default base)
		if (isBasePosesMode() && EP.BodyVariants && EP.BodyVariants.expandBodyLayerForPerson)
		{
			const forceTiers = {};
			if (isEditingBodyVariant())
				forceTiers[state.editBodyDimension] = state.editBodyTier;
			const fakePerson = {
				plumpness: 500,
				muscle: 500,
				height: 500,
				"breast size": 500,
				"areola size": 500,
				"ass size": 500,
				"penis size": 500,
				"penis girth": 500,
				pubic_style: "average",
				body_hair: {
					chest: "average", butt: "average", armpit: "average",
					tummy: "average", leg: "average", arm: "average",
				},
				has_breasts: () => true,
				has_penis: () => true,
			};
			const expanded = [];
			let bodyLayer = null;
			for (const layer of layers)
			{
				if (layer && (layer.id === "body" || layer.layer === "body"))
				{
					bodyLayer = layer;
					const parts = EP.BodyVariants.expandBodyLayerForPerson(layer, fakePerson, {
						forceTiers: forceTiers,
					});
					expanded.push.apply(expanded, parts);
				}
				else expanded.push(layer);
			}
			if (bodyLayer && EP.BodyVariants.expandBodyHairLayers)
			{
				const hair = EP.BodyVariants.expandBodyHairLayers(bodyLayer, fakePerson, {
					forceTiers: forceTiers,
				});
				expanded.push.apply(expanded, hair);
			}
			layers = expanded;
		}
		const quality = state.previewLod <= 256 ? "sidebar" : state.previewLod >= 2048 ? "mirror" : "preview";
		await EP.previewCompose(els.canvas, {
			editorMode: state.editorMode,
			editorLayers: layers,
			pose: state.previewPose,
			quality: quality,
			displacement: state.previewDisplacement,
		});
		const scale = Math.min(1, 480 / els.canvas.height, 360 / els.canvas.width);
		els.canvas.style.width = Math.round(els.canvas.width * scale) + "px";
		els.canvas.style.height = Math.round(els.canvas.height * scale) + "px";
		Core.applyCanvasScaleMode(els.canvas, scale, els.canvas._renderLod);
		setStatus("Preview " + state.previewPose + " @ LOD " + (els.canvas._renderLod || state.previewLod));
	}

	function skinMetaLabel(item)
	{
		if (!item) return "";
		const design = item.skinSubValue;
		if (design && design !== "_default")
			return " · skin: " + design;
		if (item.cotBindings && item.cotBindings.length
			&& (item.skinSubKey || item.skinSubValue === "" || item.skinSubValue === "_default"))
			return " · base skin";
		return "";
	}

	function renderLayerList()
	{
		els.layerList.innerHTML = "";
		state.items.forEach((item, index) =>
		{
			const li = document.createElement("li");
			li.className = "layer-item" + (index === state.selectedIndex ? " active" : "");
			const title = isBasePosesMode() ? "Base body" : (item.name || item.id);
			const sub = isBasePosesMode()
				? "All poses"
				: (item.id + " · z" + item.zIndex + skinMetaLabel(item));
			li.innerHTML = '<div><strong>' + title + '</strong><div class="meta">' + sub + '</div></div>';
			li.addEventListener("click", () =>
			{
				clearClothingAddMode();
				state.selectedIndex = index;
				renderLayerList();
				renderProps();
				scheduleRender();
			});
			els.layerList.appendChild(li);
		});
	}

	function renderPoseButtons(container, activeId, onPick)
	{
		if (!container) return;
		container.innerHTML = "";
		getPoseIds().forEach((poseId) =>
		{
			const btn = document.createElement("button");
			btn.type = "button";
			btn.textContent = poseLabel(poseId);
			btn.className = activeId === poseId ? "active" : "";
			btn.title = poseId;
			btn.addEventListener("click", () => onPick(poseId));
			container.appendChild(btn);
		});
	}

	function fillEditPoseSelect()
	{
		if (!els.editPose) return;
		const cur = state.editPose || "front";
		els.editPose.innerHTML = "";
		for (const poseId of getPoseIds())
		{
			const opt = document.createElement("option");
			opt.value = poseId;
			opt.textContent = poseLabel(poseId);
			els.editPose.appendChild(opt);
		}
		if (getPoseIds().includes(cur))
			els.editPose.value = cur;
		else if (els.editPose.options.length)
		{
			els.editPose.value = els.editPose.options[0].value;
			state.editPose = els.editPose.value;
		}
	}

	function bodyVariantsApi()
	{
		return (EP && EP.BodyVariants) || (setup.ExhibitionPaperdoll && setup.ExhibitionPaperdoll.BodyVariants) || null;
	}

	function isEditingBodyVariant()
	{
		return isBasePosesMode()
			&& state.editBodyDimension
			&& state.editBodyDimension !== "default"
			&& state.editBodyTier
			&& state.editBodyTier !== "default";
	}

	function selectBodyVariant(dimensionId, tierId)
	{
		state.editBodyDimension = dimensionId || "default";
		state.editBodyTier = tierId || "default";
		renderBodySizeMenu();
		updateBodyVariantStatus();
		const item = selectedItem();
		if (item) renderLodGrid(item);
		scheduleRender();
	}

	function renderBodySizeMenu()
	{
		const BV = bodyVariantsApi();
		if (!els.bodySizeMenu || !BV) return;
		const item = selectedItem();
		const poseDef = item ? ensurePoseEntry(item, state.editPose) : null;
		els.bodySizeMenu.innerHTML = "";

		// Default base
		const defItem = document.createElement("div");
		defItem.className = "body-size-item"
			+ (!isEditingBodyVariant() ? " is-active" : "");
		const defHead = document.createElement("div");
		defHead.className = "body-size-item-head";
		const defTitle = document.createElement("span");
		defTitle.textContent = "Default base body";
		const defMeta = document.createElement("span");
		defMeta.className = "meta";
		const hasBase = poseDef && poseDef.sources && Object.keys(poseDef.sources).length;
		defMeta.textContent = hasBase ? "has art" : "needs art";
		defMeta.style.color = hasBase ? "var(--ok)" : "";
		defHead.appendChild(defTitle);
		defHead.appendChild(defMeta);
		defHead.addEventListener("click", () => selectBodyVariant("default", "default"));
		defItem.appendChild(defHead);
		els.bodySizeMenu.appendChild(defItem);

		const groups = BV.MENU_GROUPS || [];
		for (const group of groups)
		{
			if (group.id === "default") continue;
			const title = document.createElement("div");
			title.className = "body-size-group-title";
			title.textContent = group.label;
			els.bodySizeMenu.appendChild(title);

			for (const dimId of group.dims || [])
			{
				const dim = BV.DIMENSIONS[dimId];
				if (!dim) continue;
				const activeDim = state.editBodyDimension === dimId;
				const row = document.createElement("div");
				row.className = "body-size-item" + (activeDim ? " is-active" : "");

				const head = document.createElement("div");
				head.className = "body-size-item-head";
				const name = document.createElement("span");
				name.textContent = dim.label;
				const meta = document.createElement("span");
				meta.className = "meta";
				const modeTag = dim.group === "body_hair"
					? "hair"
					: (dim.mode === "replace" ? "full body" : "overlay");
				const authoredCount = (poseDef && dim.tiers)
					? dim.tiers.filter((t) => BV.poseHasVariantArt(poseDef, dimId, t.id)).length
					: 0;
				meta.textContent = modeTag + (authoredCount ? " · " + authoredCount + " art" : "");
				head.appendChild(name);
				head.appendChild(meta);
				row.appendChild(head);

				const tiers = document.createElement("div");
				tiers.className = "body-size-tiers";
				for (const tier of dim.tiers)
				{
					const btn = document.createElement("button");
					btn.type = "button";
					btn.textContent = tier.label.replace(/ \(default\)/i, "").replace(" ★", "");
					if (tier.isDefault) btn.title = "Default tier";
					const has = poseDef && BV.poseHasVariantArt(poseDef, dimId, tier.id);
					btn.className = (has ? "has-art" : "needs-art")
						+ (activeDim && state.editBodyTier === tier.id ? " active" : "");
					btn.addEventListener("click", (e) =>
					{
						e.stopPropagation();
						selectBodyVariant(dimId, tier.id);
					});
					tiers.appendChild(btn);
				}
				row.appendChild(tiers);
				els.bodySizeMenu.appendChild(row);
			}
		}
		updateBodyVariantStatus();
	}

	function updateBodyVariantStatus()
	{
		const msg = (() =>
		{
			if (!isBasePosesMode()) return "";
			const item = selectedItem();
			const poseDef = item ? ensurePoseEntry(item, state.editPose) : null;
			if (!isEditingBodyVariant())
			{
				const hasBase = poseDef && poseDef.sources && Object.keys(poseDef.sources).length;
				return hasBase
					? "Right side: default base for " + poseLabel(state.editPose) + " (fallback when size art missing)."
					: "Right side: add default base art for " + poseLabel(state.editPose) + ".";
			}
			const BV = bodyVariantsApi();
			if (!BV) return "";
			const key = BV.variantKey(state.editBodyDimension, state.editBodyTier);
			const has = poseDef && BV.poseHasVariantArt(poseDef, state.editBodyDimension, state.editBodyTier);
			const dim = BV.DIMENSIONS[state.editBodyDimension];
			const hairNote = dim && dim.coversSkin ? " · draws above skin/tattoos" : "";
			return (has ? "Right side: has art for " : "Right side: needs art for ")
				+ key + hairNote;
		})();
		if (els.bodyVariantStatus) els.bodyVariantStatus.textContent = msg;
		if (els.bodyImageTargetHint)
		{
			els.bodyImageTargetHint.classList.toggle("hidden", !isBasePosesMode());
			els.bodyImageTargetHint.textContent = msg;
		}
	}

	function getActiveImageTarget(item)
	{
		const poseDef = ensurePoseEntry(item, state.editPose);
		if (isEditingBodyVariant())
		{
			const BV = bodyVariantsApi();
			const entry = BV.ensureVariantEntry(poseDef, state.editBodyDimension, state.editBodyTier);
			return {
				poseDef: poseDef,
				sources: entry.sources,
				assetPrefix: state.editPose + "_var_" + BV.variantKey(state.editBodyDimension, state.editBodyTier),
				label: BV.variantKey(state.editBodyDimension, state.editBodyTier),
			};
		}
		poseDef.sources = poseDef.sources || {};
		return {
			poseDef: poseDef,
			sources: poseDef.sources,
			assetPrefix: state.editPose,
			label: "default base",
		};
	}

	function renderPoseManager()
	{
		if (!els.poseList) return;
		els.poseList.innerHTML = "";
		for (const poseId of getPoseIds())
		{
			const row = document.createElement("div");
			row.className = "pose-manager-row";
			const locked = Core && Core.isPoseLocked && Core.isPoseLocked(poseId);
			const title = document.createElement("span");
			title.className = "pose-manager-name";
			title.textContent = poseLabel(poseId) + (locked ? " (default)" : "");
			title.title = poseId;
			row.appendChild(title);
			if (!locked)
			{
				const rm = document.createElement("button");
				rm.type = "button";
				rm.className = "danger";
				rm.textContent = "Remove";
				rm.title = "Remove pose (art on items is kept but hidden until re-added)";
				rm.addEventListener("click", () => removePoseFromEditor(poseId));
				row.appendChild(rm);
			}
			els.poseList.appendChild(row);
		}
		if (els.posePresetSelect)
		{
			els.posePresetSelect.innerHTML = "";
			const blank = document.createElement("option");
			blank.value = "";
			blank.textContent = "— Choose preset —";
			els.posePresetSelect.appendChild(blank);
			const presets = (Core && Core.availablePosePresets)
				? Core.availablePosePresets()
				: [];
			for (const p of presets)
			{
				const opt = document.createElement("option");
				opt.value = p.id;
				opt.textContent = p.label || p.id;
				els.posePresetSelect.appendChild(opt);
			}
		}
	}

	function addPoseToEditor(poseId, label)
	{
		if (!poseId) return;
		const id = Core && Core.slugPoseId ? Core.slugPoseId(poseId) : String(poseId).toLowerCase().replace(/[^a-z0-9]+/g, "_");
		if (!id) return;
		if (getPoseIds().includes(id))
		{
			setStatus("Pose already active: " + poseLabel(id));
			return;
		}
		if (Core && Core.registerPose)
			Core.registerPose(id, { label: label || id.replace(/_/g, " ") });
		syncStatePosesFromCore();
		state._dirty = true;
		refreshPoseControls();
		fillEditPoseSelect();
		renderPoseManager();
		renderProps();
		scheduleRender();
		setStatus("Added pose \"" + poseLabel(id) + "\" — author art for all layers under this pose.");
	}

	function removePoseFromEditor(poseId)
	{
		if (!poseId || (Core && Core.isPoseLocked && Core.isPoseLocked(poseId)))
		{
			setStatus("Cannot remove default Front/Back poses");
			return;
		}
		if (!confirm("Remove pose \"" + poseLabel(poseId) + "\" from the editor? Art data stays on items if present."))
			return;
		if (Core && Core.unregisterPose) Core.unregisterPose(poseId);
		if (state.editPose === poseId) state.editPose = "front";
		if (state.previewPose === poseId) state.previewPose = "front";
		syncStatePosesFromCore();
		state._dirty = true;
		refreshPoseControls();
		fillEditPoseSelect();
		renderPoseManager();
		renderProps();
		scheduleRender();
		setStatus("Removed pose \"" + poseId + "\"");
	}

	function renderViewButtons()
	{
		// Quick front/back only — full list is in pose bar
		const active = state.previewPose === "back" ? "back" : (state.previewPose === "front" ? "front" : "");
		els.viewBar.innerHTML = "";
		["front", "back"].forEach((view) =>
		{
			const btn = document.createElement("button");
			btn.type = "button";
			btn.textContent = VIEW_LABELS[view] || poseLabel(view);
			btn.className = active === view ? "active" : "";
			btn.addEventListener("click", () =>
			{
				state.previewPose = view;
				if (getPoseIds().includes(view))
					state.editPose = view;
				if (els.editPose) els.editPose.value = state.editPose;
				renderViewButtons();
				renderPoseButtons(els.poseBar, state.previewPose, onPosePick);
				scheduleRender();
			});
			els.viewBar.appendChild(btn);
		});
	}

	function onPosePick(poseId)
	{
		state.previewPose = poseId;
		if (getPoseIds().includes(poseId))
		{
			state.editPose = poseId;
			if (els.editPose) els.editPose.value = poseId;
		}
		renderPoseButtons(els.poseBar, state.previewPose, onPosePick);
		renderViewButtons();
		scheduleRender();
	}

	function ensureDisplacementEntry(item, dispId)
	{
		const poseDef = ensurePoseEntry(item, state.editPose);
		poseDef.displacements = poseDef.displacements || {};
		if (!poseDef.displacements[dispId])
			poseDef.displacements[dispId] = { mask: {}, depth: {}, sources: {} };
		return poseDef.displacements[dispId];
	}

	/**
	 * @param {boolean} includeNormal — preview toolbar includes Normal
	 * @param {object|null} item — selected pack item
	 * @param {object} [options]
	 * @param {boolean} [options.requireArt] — only list enabled types that already have art
	 *   (game-like preview). Authoring dropdown leaves this false so you can pick empty slots.
	 */
	function fillDisplacementSelect(selectEl, includeNormal, item, options)
	{
		options = options || {};
		if (!selectEl) return;
		const prev = selectEl.value;
		selectEl.innerHTML = "";
		const enabled = item ? getEnabledDisplacements(item) : null;
		const requireArt = !!options.requireArt;
		const presets = dispPresets();
		let added = 0;
		for (const preset of presets)
		{
			if (!includeNormal && preset.id === "normal") continue;
			if (preset.id !== "normal")
			{
				if (enabled && !enabled.includes(preset.id)) continue;
				if (requireArt && item && !itemHasDisplacementArt(item, preset.id)) continue;
			}
			const opt = document.createElement("option");
			opt.value = preset.id;
			let label = preset.label;
			if (preset.id !== "normal" && item)
			{
				const hasArt = itemHasDisplacementArt(item, preset.id);
				if (!hasArt) label += " (needs art)";
			}
			opt.textContent = label;
			selectEl.appendChild(opt);
			added++;
		}
		// Keep custom enabled ids that are not in the preset list
		if (enabled)
		{
			for (const id of enabled)
			{
				if (presets.some((p) => p.id === id)) continue;
				if (requireArt && item && !itemHasDisplacementArt(item, id)) continue;
				const opt = document.createElement("option");
				opt.value = id;
				opt.textContent = id + (item && !itemHasDisplacementArt(item, id) ? " (needs art)" : "");
				selectEl.appendChild(opt);
				added++;
			}
		}
		if (!added && !includeNormal)
		{
			const opt = document.createElement("option");
			opt.value = "";
			opt.textContent = "— Enable types on left —";
			selectEl.appendChild(opt);
		}
		if (prev && Array.from(selectEl.options).some((o) => o.value === prev))
			selectEl.value = prev;
		else if (includeNormal)
			selectEl.value = "normal";
		else if (enabled && enabled.length)
		{
			const first = enabled.find((id) => !requireArt || !item || itemHasDisplacementArt(item, id));
			selectEl.value = first || enabled[0];
		}
	}

	function displacementPresetHint(preset)
	{
		const parts = [];
		if (preset.game && preset.game.length)
			parts.push("game: " + preset.game.slice(0, 4).join(", ")
				+ (preset.game.length > 4 ? "…" : ""));
		if (preset.exposure && preset.exposure.length)
			parts.push("exhib: " + preset.exposure.join(", "));
		return parts.join(" · ") || "authoring slot";
	}

	function clothingFlagGroups()
	{
		return (EP && EP.CLOTHING_FLAG_GROUPS) || [];
	}

	function getItemClothingFlags(item)
	{
		if (!item) return [];
		if (!Array.isArray(item.clothingFlags)) item.clothingFlags = [];
		if (EP && EP.normalizeClothingFlags)
			item.clothingFlags = EP.normalizeClothingFlags(item.clothingFlags);
		return item.clothingFlags;
	}

	function itemChanceFlagLevel(item, family)
	{
		const flags = getItemClothingFlags(item);
		for (const f of flags)
		{
			const parsed = EP && EP.parseChanceFlag ? EP.parseChanceFlag(f) : null;
			if (parsed && parsed.family === family) return parsed.level;
		}
		return "";
	}

	function itemHasBooleanFlag(item, flagId)
	{
		return getItemClothingFlags(item).includes(flagId);
	}

	function setItemChanceFlag(item, family, level)
	{
		if (!item) return;
		let flags = getItemClothingFlags(item).filter((f) =>
		{
			const parsed = EP && EP.parseChanceFlag ? EP.parseChanceFlag(f) : null;
			return !(parsed && parsed.family === family);
		});
		if (level)
			flags.push((EP && EP.chanceFlagName)
				? EP.chanceFlagName(family, level)
				: (family + " chance " + level));
		item.clothingFlags = EP && EP.normalizeClothingFlags
			? EP.normalizeClothingFlags(flags) : flags;
		state._dirty = true;
	}

	function setItemBooleanFlag(item, flagId, on)
	{
		if (!item || !flagId) return;
		let flags = getItemClothingFlags(item).filter((f) => f !== flagId);
		if (on) flags.push(flagId);
		item.clothingFlags = EP && EP.normalizeClothingFlags
			? EP.normalizeClothingFlags(flags) : flags;
		state._dirty = true;
	}

	function renderClothingFlagsUi(item)
	{
		if (!els.clothingFlagsList) return;
		els.clothingFlagsList.innerHTML = "";
		if (!item)
		{
			const empty = document.createElement("p");
			empty.className = "enabled-disp-empty";
			empty.textContent = "Select a clothing piece first.";
			els.clothingFlagsList.appendChild(empty);
			return;
		}
		getItemClothingFlags(item);
		const groups = clothingFlagGroups();
		if (!groups.length)
		{
			const empty = document.createElement("p");
			empty.className = "enabled-disp-empty";
			empty.textContent = "Clothing flag catalog not loaded.";
			els.clothingFlagsList.appendChild(empty);
			return;
		}
		for (const group of groups)
		{
			const row = document.createElement("div");
			row.className = "clothing-flag-row";
			row.title = group.hint || group.label;

			const lab = document.createElement("div");
			lab.className = "flag-label";
			lab.textContent = group.label;
			row.appendChild(lab);

			if (group.kind === "boolean")
			{
				const on = itemHasBooleanFlag(item, group.id);
				if (on) row.classList.add("is-on");
				const wrap = document.createElement("label");
				wrap.className = "flag-bool";
				const cb = document.createElement("input");
				cb.type = "checkbox";
				cb.checked = on;
				cb.addEventListener("change", () =>
				{
					setItemBooleanFlag(item, group.id, cb.checked);
					renderClothingFlagsUi(item);
					setStatus((cb.checked ? "Flag on: " : "Flag off: ") + group.label);
				});
				wrap.appendChild(cb);
				wrap.appendChild(document.createTextNode("On"));
				row.appendChild(wrap);
			}
			else
			{
				const levels = (EP && EP.levelsForGroup)
					? EP.levelsForGroup(group)
					: (group.levels || ["low", "medium", "high", "certain"]);
				const current = itemChanceFlagLevel(item, group.id);
				if (current) row.classList.add("is-on");
				const levelsWrap = document.createElement("div");
				levelsWrap.className = "flag-levels";

				const noneLab = document.createElement("label");
				const noneRadio = document.createElement("input");
				noneRadio.type = "radio";
				noneRadio.name = "flag-" + group.id + "-" + (item.id || "item");
				noneRadio.checked = !current;
				noneRadio.addEventListener("change", () =>
				{
					if (!noneRadio.checked) return;
					setItemChanceFlag(item, group.id, "");
					renderClothingFlagsUi(item);
					setStatus("Cleared " + group.label + " flag");
				});
				noneLab.appendChild(noneRadio);
				noneLab.appendChild(document.createTextNode("off"));
				levelsWrap.appendChild(noneLab);

				for (const level of levels)
				{
					const lvlLab = document.createElement("label");
					const radio = document.createElement("input");
					radio.type = "radio";
					radio.name = "flag-" + group.id + "-" + (item.id || "item");
					radio.checked = current === level;
					radio.addEventListener("change", () =>
					{
						if (!radio.checked) return;
						setItemChanceFlag(item, group.id, level);
						renderClothingFlagsUi(item);
						setStatus(group.label + " → " + level
							+ (level === "certain" ? " (always)" : ""));
					});
					lvlLab.appendChild(radio);
					lvlLab.appendChild(document.createTextNode(level));
					levelsWrap.appendChild(lvlLab);
				}
				row.appendChild(levelsWrap);
			}
			els.clothingFlagsList.appendChild(row);
		}
	}

	function renderEnabledDisplacementChecks(item)
	{
		if (!els.enabledDispList) return;
		els.enabledDispList.innerHTML = "";
		if (!item)
		{
			const empty = document.createElement("p");
			empty.className = "enabled-disp-empty";
			empty.textContent = "Select a clothing piece first.";
			els.enabledDispList.appendChild(empty);
			return;
		}
		getEnabledDisplacements(item);
		const onlyOn = !!(els.enabledDispOnlyOn && els.enabledDispOnlyOn.checked);
		const needArt = !!(els.enabledDispNeedArt && els.enabledDispNeedArt.checked);
		let shown = 0;
		for (const preset of nonNormalDispPresets())
		{
			const on = isDisplacementEnabled(item, preset.id);
			const hasArt = itemHasDisplacementArt(item, preset.id);
			if (onlyOn && !on) continue;
			if (needArt && hasArt) continue;
			shown++;
			const lab = document.createElement("label");
			if (on) lab.classList.add("is-on");
			if (on && !hasArt) lab.classList.add("needs-art");
			lab.title = displacementPresetHint(preset);

			const cb = document.createElement("input");
			cb.type = "checkbox";
			cb.checked = on;
			cb.addEventListener("change", () =>
			{
				setDisplacementEnabled(item, preset.id, cb.checked);
				state._dirty = true;
				clampDisplacementSelection(item);
				renderEnabledDisplacementChecks(item);
				refreshDisplacementUi(item);
				setStatus((cb.checked ? "Enabled " : "Disabled ") + preset.label
					+ " for " + (item.name || item.id)
					+ " (in-game: checked + art)");
			});
			lab.appendChild(cb);

			const title = document.createElement("span");
			title.className = "disp-check-title";
			title.textContent = preset.label;
			lab.appendChild(title);

			const meta = document.createElement("span");
			meta.className = "disp-check-meta " + (hasArt ? "has-art" : "needs-art");
			meta.textContent = hasArt ? "has art" : "needs art";
			lab.appendChild(meta);

			const hint = document.createElement("span");
			hint.className = "disp-check-hint";
			hint.textContent = displacementPresetHint(preset);
			lab.appendChild(hint);

			els.enabledDispList.appendChild(lab);
		}
		if (!shown)
		{
			const empty = document.createElement("p");
			empty.className = "enabled-disp-empty";
			empty.textContent = onlyOn || needArt
				? "No types match the filters above."
				: "No displacement presets loaded.";
			els.enabledDispList.appendChild(empty);
		}
	}

	function refreshDisplacementUi(item)
	{
		// Preview mirrors game: enabled + has art. Authoring lists all enabled (even empty).
		fillDisplacementSelect(els.previewDisplacement, true, item, { requireArt: true });
		fillDisplacementSelect(els.editDisplacement, false, item, { requireArt: false });
		if (els.previewDisplacement)
		{
			if (Array.from(els.previewDisplacement.options).some((o) => o.value === state.previewDisplacement))
				els.previewDisplacement.value = state.previewDisplacement;
			else
			{
				state.previewDisplacement = "normal";
				els.previewDisplacement.value = "normal";
			}
		}
		if (els.editDisplacement)
		{
			const enabled = item ? getEnabledDisplacements(item) : [];
			if (enabled.includes(state.editDisplacement))
				els.editDisplacement.value = state.editDisplacement;
			else if (enabled.length)
			{
				state.editDisplacement = enabled[0];
				els.editDisplacement.value = enabled[0];
			}
			else
			{
				els.editDisplacement.value = "";
			}
		}
		if (item) renderDisplacementGrids(item);
		scheduleRender();
	}

	function renderDispSlotGrid(container, item, kind, label)
	{
		if (!container) return;
		container.innerHTML = "";
		if (!state.editDisplacement || state.editDisplacement === "normal") return;
		if (!isDisplacementEnabled(item, state.editDisplacement)) return;
		const tier = currentEditLod();
		const disp = ensureDisplacementEntry(item, state.editDisplacement);
		const map = disp[kind] || (disp[kind] = {});
		renderSingleImageSlot(container, {
			tier: tier,
			url: map[tier] || "",
			label: label,
			onFile: (f) => assignDispImageFile(f, kind, tier).catch(console.error),
			onClear: () =>
			{
				const old = map[tier];
				if (old && old.startsWith("blob:")) URL.revokeObjectURL(old);
				delete map[tier];
				const assetKey = "disp_" + state.editDisplacement + "_" + kind + "_" + state.editPose + "_" + tier;
				if (item._assets) delete item._assets[assetKey];
				state._dirty = true;
				renderDisplacementGrids(item);
				scheduleRender();
			},
		});
	}

	function renderDisplacementGrids(item)
	{
		const enabled = getEnabledDisplacements(item);
		const showSlots = enabled.length > 0
			&& state.editDisplacement
			&& state.editDisplacement !== "normal"
			&& enabled.includes(state.editDisplacement);

		if (els.dispMaskGrid) els.dispMaskGrid.innerHTML = "";
		if (els.dispDepthGrid) els.dispDepthGrid.innerHTML = "";
		if (els.dispCustomGrid) els.dispCustomGrid.innerHTML = "";

		if (!enabled.length)
		{
			if (els.dispMaskGrid)
			{
				const hint = document.createElement("p");
				hint.className = "enabled-disp-empty";
				hint.textContent = "Enable displacement types for this piece on the left sidebar first.";
				els.dispMaskGrid.appendChild(hint);
			}
			return;
		}

		if (!showSlots) return;
		renderDispSlotGrid(els.dispMaskGrid, item, "mask", "Cutout mask");
		renderDispSlotGrid(els.dispDepthGrid, item, "depth", "Depth overlay");
		renderDispSlotGrid(els.dispCustomGrid, item, "sources", "Custom PNG");
	}

	function renderColorMaskGrid(item)
	{
		if (!els.colorMaskGrid) return;
		els.colorMaskGrid.innerHTML = "";
		const tier = currentEditLod();
		const poseDef = ensurePoseEntry(item, state.editPose);
		poseDef.colorMask = poseDef.colorMask || {};
		const maskUrl = poseDef.colorMask[tier]
			|| (item._assets && item._assets["color_" + state.editPose + "_" + tier]
				&& item._assets["color_" + state.editPose + "_" + tier].url);
		if (maskUrl && !poseDef.colorMask[tier]) poseDef.colorMask[tier] = maskUrl;
		renderSingleImageSlot(els.colorMaskGrid, {
			tier: tier,
			url: maskUrl || "",
			label: "Color mask",
			onFile: (f) => assignColorMaskFile(f, tier).catch(console.error),
			onClear: () =>
			{
				const old = poseDef.colorMask[tier];
				if (old && old.startsWith("blob:")) URL.revokeObjectURL(old);
				delete poseDef.colorMask[tier];
				if (item._assets) delete item._assets["color_" + state.editPose + "_" + tier];
				state._dirty = true;
				renderColorMaskGrid(item);
				scheduleRender();
			},
		});
	}

	async function assignColorMaskFile(file, tier)
	{
		if (!isImageFile(file)) return;
		const item = selectedItem();
		if (!item) return;
		const poseDef = ensurePoseEntry(item, state.editPose);
		poseDef.colorMask = poseDef.colorMask || {};
		const old = poseDef.colorMask[tier];
		if (old && old.startsWith("blob:")) URL.revokeObjectURL(old);
		const url = URL.createObjectURL(file);
		poseDef.colorMask[tier] = url;
		item._assets = item._assets || {};
		item._assets["color_" + state.editPose + "_" + tier] = { url: url, blob: file };
		if (!item.recolor) item.recolor = true;
		if (els.itemRecolor) els.itemRecolor.checked = true;
		state._dirty = true;
		renderColorMaskGrid(item);
		scheduleRender();
		setStatus("Added color mask @ " + tier + "px");
	}

	async function assignDispImageFile(file, kind, tier)
	{
		if (!isImageFile(file) || !state.editDisplacement || state.editDisplacement === "normal") return;
		const item = selectedItem();
		if (!item) return;
		if (!isDisplacementEnabled(item, state.editDisplacement))
		{
			setStatus("Enable this displacement type for the piece first (left sidebar)");
			return;
		}
		const disp = ensureDisplacementEntry(item, state.editDisplacement);
		const map = disp[kind] || (disp[kind] = {});
		const old = map[tier];
		if (old && old.startsWith("blob:")) URL.revokeObjectURL(old);
		const url = URL.createObjectURL(file);
		map[tier] = url;
		const assetKey = "disp_" + state.editDisplacement + "_" + kind + "_" + state.editPose + "_" + tier;
		item._assets = item._assets || {};
		item._assets[assetKey] = { url: url, blob: file };
		state._dirty = true;
		state.previewDisplacement = state.editDisplacement;
		if (els.previewDisplacement) els.previewDisplacement.value = state.previewDisplacement;
		renderDisplacementGrids(item);
		scheduleRender();
		setStatus("Added " + kind + " for " + state.editDisplacement + " @ " + tier + "px");
	}

	function renderLodGrid(item)
	{
		if (!els.lodGrid) return;
		els.lodGrid.innerHTML = "";
		const tier = currentEditLod();
		const target = getActiveImageTarget(item);
		const url = target.sources[tier] || "";
		renderSingleImageSlot(els.lodGrid, {
			tier: tier,
			url: url,
			label: target.label,
			onFile: (f) => assignImageFile(f, { keepPose: true, lod: tier, forceCurrent: true }).catch(console.error),
			onClear: () =>
			{
				const old = target.sources[tier];
				if (old && old.startsWith("blob:")) URL.revokeObjectURL(old);
				delete target.sources[tier];
				if (item._assets) delete item._assets[target.assetPrefix + "_" + tier];
				state._dirty = true;
				updateDropHint();
				renderLodGrid(item);
				updateLodOtherHint(item);
				updateBodyVariantStatus();
				scheduleRender();
			},
		});
		updateLodOtherHint(item);
		updateBodyVariantStatus();
	}

	function bindTransformInput(id, key, parseFn)
	{
		const input = document.getElementById(id);
		const val = document.getElementById(id + "-val");
		if (!input) return;
		input.addEventListener("input", () =>
		{
			const item = selectedItem();
			if (!item) return;
			const poseDef = ensurePoseEntry(item, state.editPose);
			poseDef.transform[key] = parseFn(input.value);
			if (val) val.textContent = String(poseDef.transform[key]);
			state._dirty = true;
			scheduleRender();
		});
	}

	function renderTransformPanel(item)
	{
		const poseDef = ensurePoseEntry(item, state.editPose);
		const t = poseDef.transform;
		const map = [
			["tf-x", "x", Number],
			["tf-y", "y", Number],
			["tf-sx", "scaleX", Number],
			["tf-sy", "scaleY", Number],
			["tf-rot", "rotation", Number],
			["tf-op", "opacity", Number],
		];
		for (const [id, key] of map)
		{
			const input = document.getElementById(id);
			const val = document.getElementById(id + "-val");
			if (!input) continue;
			input.value = t[key];
			if (val) val.textContent = String(t[key]);
		}
		const flipH = document.getElementById("tf-flipH");
		const flipV = document.getElementById("tf-flipV");
		if (flipH) flipH.checked = !!t.flipH;
		if (flipV) flipV.checked = !!t.flipV;
	}

	function renderProps()
	{
		const item = selectedItem();
		if (!item)
		{
			if (els.panelProps) els.panelProps.classList.add("hidden");
			if (els.selectedLayerSection) els.selectedLayerSection.classList.add("hidden");
			if (els.panelEdit) els.panelEdit.classList.add("hidden");
			return;
		}
		if (els.panelProps) els.panelProps.classList.remove("hidden");
		if (els.selectedLayerSection) els.selectedLayerSection.classList.remove("hidden");
		if (els.panelEdit) els.panelEdit.classList.remove("hidden");

		const cfg = modeConfig();
		document.getElementById("layer-id-label").textContent = isBasePosesMode() ? "Body layer ID" : "Piece ID";
		document.getElementById("layer-name-field").classList.toggle("hidden", isBasePosesMode() || !cfg.showPieceList);
		els.layerId.value = item.id;
		els.layerName.value = item.name || "";
		els.layerZ.value = item.zIndex;
		if (cfg.showCotBindings && ClothingPicker)
		{
			ClothingPicker.setPackItems(state.items);
			ClothingPicker.setEditPose(state.editPose);
			const binding = item.cotBindings && item.cotBindings[0];
			ClothingPicker.setSelectedBinding(binding || "");
		}
		if (cfg.showMakeupBindings && MakeupPicker)
		{
			MakeupPicker.setPackItems(state.items);
			MakeupPicker.setEditPose(state.editPose);
			const binding = item.cotBindings && item.cotBindings[0];
			MakeupPicker.setSelectedBinding(binding || "");
		}
		if (els.itemRecolor) els.itemRecolor.checked = !!item.recolor;
		if (els.previewTintColor) els.previewTintColor.value = state.previewTintColor || "red";
		if (els.exposureDisplacements)
		{
			const map = item.exposureDisplacements || {};
			els.exposureDisplacements.value = Object.keys(map).length
				? JSON.stringify(map, null, 2) : "";
		}

		if (state.editorMode === "clothing")
		{
			renderClothingFlagsUi(item);
			clampDisplacementSelection(item);
			renderEnabledDisplacementChecks(item);
			refreshDisplacementUi(item);
			if (item.gameClothing && item.gameClothing.itemId)
			{
				// Keep binding in sync with game item id
				if (!item.cotBindings || item.cotBindings[0] !== item.gameClothing.itemId)
					item.cotBindings = [item.gameClothing.itemId];
			}
			updateSkinDesignStatus(item);
		}
		else if (els.skinDesignStatus)
			els.skinDesignStatus.textContent = "";
		if (isBasePosesMode())
			renderBodySizeMenu();

		// Prefer a size that already has art so the single slot is not empty.
		const poseDef = ensurePoseEntry(item, state.editPose);
		const sources = (poseDef && poseDef.sources) || {};
		if (!sources[currentEditLod()])
		{
			const preferred = (IO.LOD_TIERS || []).find((t) => sources[t]);
			if (preferred) setEditLod(preferred);
		}
		if (els.editLod) els.editLod.value = String(currentEditLod());

		renderLodGrid(item);
		renderColorMaskGrid(item);
		if (state.editorMode !== "clothing")
			renderDisplacementGrids(item);
		renderTransformPanel(item);
	}

	function syncPackMetaFromInputs()
	{
		syncPackTypeFromMode();
		state.packId = els.packId.value.trim() || IO.slugify(state.packName);
		state.packName = els.packName.value.trim() || state.packId;
		state.packDescription = els.packDesc.value.trim();
	}

	function preparePackForOutput()
	{
		syncPackMetaFromInputs();
		applyLayerMeta();
		if (isBasePosesMode()) collapseBasePoseItems();
		const hasAnyImage = state.items.some((item) =>
			Object.values(item.poses || {}).some((p) => p && p.sources && Object.keys(p.sources).length));
		if (!hasAnyImage)
		{
			setStatus("Add at least one image before saving or exporting");
			return null;
		}
		if (!state.packId.trim() && !state.packName.trim())
		{
			const first = state.items[0];
			state.packName = (first && (first.name || first.id)) || "my-clothing-mod";
			state.packId = IO.slugify(state.packName);
			els.packId.value = state.packId;
			els.packName.value = state.packName;
		}
		return IO.slugify(state.packId || state.packName);
	}

	async function newPack()
	{
		clearClothingAddMode();
		syncPackTypeFromMode();
		const cfg = modeConfig();
		if (state.editorMode === "base-poses")
		{
			state.packId = "base";
			state.packName = "Exhibition Base Doll";
			state.packDescription = "";
			state.items = [await loadBasePosesForEditor()];
		}
		else
		{
			state.packId = (PackModes && PackModes.DEFAULT_APPEARANCE_PACK_ID) || "appearance-mod";
			state.packName = "Appearance mod";
			state.packDescription = "";
			const fromDisk = await loadModPackForEditor(state.packId);
			if (fromDisk && fromDisk.items && fromDisk.items.length)
			{
				state.packId = fromDisk.packId || state.packId;
				state.packName = fromDisk.packName || state.packName;
				state.packDescription = fromDisk.packDescription || "";
				state.items = fromDisk.items;
				if (fromDisk.poses) state.poses = fromDisk.poses;
				if (fromDisk.poseMeta) state.poseMeta = fromDisk.poseMeta;
			}
			else
				state.items = [IO.defaultBlankForMode(state.editorMode, 0, makeupPackOptions())];
			if (fromDisk && fromDisk.items && fromDisk.items.length)
				await preloadEditorImages(state.items);
		}
		applyPosesToEditor(state.poses, state.poseMeta);
		state.selectedIndex = 0;
		state._dirty = false;
		state._pendingInstall = false;
		state._importedFrom = "";
		els.packId.value = state.packId;
		els.packName.value = state.packName;
		els.packDesc.value = "";
		applyModeUi();
		updateImportBanner();
		updateDropHint();
		renderLayerList();
		renderProps();
		if (ClothingPicker) ClothingPicker.setPackItems(state.items);
		mergeCustomClothesIntoCatalog();
		scheduleRender();
		setStatus("Ready — " + cfg.label);
	}

	function openCreateClothingModal()
	{
		if (!CustomClothing)
		{
			setStatus("Create clothing module not loaded");
			return;
		}
		if (state.editorMode !== "clothing")
		{
			setStatus("Switch to Clothing workflow to create game clothes");
			return;
		}
		fillCreateClothingFormDefaults();
		showCcTab("basic");
		if (els.createClothingModal) els.createClothingModal.classList.remove("hidden");
	}

	function closeCreateClothingModal()
	{
		if (els.createClothingModal) els.createClothingModal.classList.add("hidden");
	}

	function showCcTab(tabId)
	{
		document.querySelectorAll("[data-cc-panel]").forEach((panel) =>
		{
			panel.classList.toggle("hidden", panel.getAttribute("data-cc-panel") !== tabId);
		});
		if (els.ccTabs)
		{
			els.ccTabs.querySelectorAll("button").forEach((btn) =>
			{
				btn.classList.toggle("active", btn.getAttribute("data-cc-tab") === tabId);
			});
		}
	}

	function fillCheckGrid(container, options, opts)
	{
		if (!container || container.childElementCount) return;
		opts = opts || {};
		for (const value of options || [])
		{
			const lab = document.createElement("label");
			const cb = document.createElement("input");
			cb.type = "checkbox";
			cb.value = value;
			if (opts.name) cb.name = opts.name;
			lab.appendChild(cb);
			lab.appendChild(document.createTextNode(value));
			container.appendChild(lab);
		}
	}

	function setCheckedInGrid(container, values)
	{
		if (!container) return;
		const set = new Set(values || []);
		container.querySelectorAll("input[type=checkbox]").forEach((cb) =>
		{
			cb.checked = set.has(cb.value);
		});
	}

	function readCheckedGrid(container)
	{
		const out = [];
		if (!container) return out;
		container.querySelectorAll("input[type=checkbox]:checked").forEach((cb) => out.push(cb.value));
		return out;
	}

	function ensureCreateClothingFormBuilt()
	{
		if (!CustomClothing || state._ccFormBuilt) return;
		state._ccFormBuilt = true;
		if (els.ccCategory)
		{
			for (const cat of CustomClothing.CATEGORIES)
			{
				const opt = document.createElement("option");
				opt.value = cat;
				opt.textContent = cat;
				els.ccCategory.appendChild(opt);
			}
		}
		fillCheckGrid(els.ccCovers, CustomClothing.COVER_OPTIONS);
		fillCheckGrid(els.ccSheer, CustomClothing.COVER_OPTIONS);
		fillCheckGrid(els.ccSkintightEx, CustomClothing.COVER_OPTIONS);
		fillCheckGrid(els.ccStorage, CustomClothing.STORAGE_OPTIONS);
		fillCheckGrid(els.ccBoolFlags, CustomClothing.BOOLEAN_FLAG_OPTIONS);
		fillCheckGrid(els.ccDialogue, CustomClothing.DIALOGUE_TAG_OPTIONS);
		fillCheckGrid(els.ccStyles, CustomClothing.COMMON_SUB_STYLES);
		fillCheckGrid(els.ccShops, CustomClothing.CLOTHING_SHOPS);

		if (els.ccStyleFactor)
		{
			for (const key of CustomClothing.STYLE_KEYS)
			{
				const lab = document.createElement("label");
				lab.textContent = key;
				const input = document.createElement("input");
				input.type = "number";
				input.min = "0";
				input.max = "10";
				input.step = "1";
				input.value = "0";
				input.dataset.styleKey = key;
				lab.appendChild(input);
				els.ccStyleFactor.appendChild(lab);
			}
		}

		if (els.ccChanceFlags && EP && EP.CLOTHING_FLAG_GROUPS)
		{
			for (const group of EP.CLOTHING_FLAG_GROUPS)
			{
				if (group.kind !== "chance") continue;
				const row = document.createElement("div");
				row.className = "clothing-flag-row";
				row.dataset.chanceFamily = group.id;
				const title = document.createElement("div");
				title.className = "flag-label";
				title.textContent = group.label;
				row.appendChild(title);
				const levels = document.createElement("div");
				levels.className = "flag-levels";
				const levelsList = (EP.levelsForGroup && EP.levelsForGroup(group))
					|| ["low", "medium", "high", "certain"];
				const none = document.createElement("label");
				const noneR = document.createElement("input");
				noneR.type = "radio";
				noneR.name = "cc-chance-" + group.id;
				noneR.value = "";
				noneR.checked = true;
				none.appendChild(noneR);
				none.appendChild(document.createTextNode("off"));
				levels.appendChild(none);
				for (const level of levelsList)
				{
					const lab = document.createElement("label");
					const r = document.createElement("input");
					r.type = "radio";
					r.name = "cc-chance-" + group.id;
					r.value = level;
					lab.appendChild(r);
					lab.appendChild(document.createTextNode(level));
					levels.appendChild(lab);
				}
				row.appendChild(levels);
				els.ccChanceFlags.appendChild(row);
			}
		}

		if (els.ccDisplace)
		{
			for (const verb of CustomClothing.DISPLACE_VERBS)
			{
				const row = document.createElement("div");
				row.className = "cc-displace-row";
				row.dataset.verb = verb;
				const enable = document.createElement("label");
				enable.className = "disp-enable";
				const cb = document.createElement("input");
				cb.type = "checkbox";
				cb.className = "disp-verb-on";
				enable.appendChild(cb);
				enable.appendChild(document.createTextNode("displace " + verb));
				row.appendChild(enable);
				const parts = document.createElement("div");
				parts.className = "cc-check-grid disp-parts";
				for (const part of CustomClothing.COVER_OPTIONS)
				{
					const lab = document.createElement("label");
					const pcb = document.createElement("input");
					pcb.type = "checkbox";
					pcb.value = part;
					lab.appendChild(pcb);
					lab.appendChild(document.createTextNode(part));
					parts.appendChild(lab);
				}
				row.appendChild(parts);
				els.ccDisplace.appendChild(row);
			}
		}
	}

	function fillCreateClothingFormDefaults()
	{
		if (!CustomClothing) return;
		ensureCreateClothingFormBuilt();
		if (els.ccItemId) els.ccItemId.value = "";
		if (els.ccShortname) { els.ccShortname.value = ""; delete els.ccShortname.dataset.touched; }
		if (els.ccNameTemplate) { els.ccNameTemplate.value = ""; delete els.ccNameTemplate.dataset.touched; }
		if (els.ccCategory) els.ccCategory.value = "tops";
		if (els.ccPrice) els.ccPrice.value = "20";
		if (els.ccAuthor) els.ccAuthor.value = "";
		if (els.ccDescShop) els.ccDescShop.value = "";
		if (els.ccDescWardrobe) els.ccDescWardrobe.value = "";
		if (els.ccDescThrift) els.ccDescThrift.value = "";
		if (els.ccNpcWear) els.ccNpcWear.checked = true;
		if (els.ccPcWear) els.ccPcWear.checked = true;
		if (els.ccUseColor) els.ccUseColor.checked = true;
		if (els.ccUseColor2) els.ccUseColor2.checked = false;
		if (els.ccStyleFactorMods) els.ccStyleFactorMods.value = "";
		if (els.ccFlagsMods) els.ccFlagsMods.value = "";
		if (els.ccCoversMods) els.ccCoversMods.value = "";
		if (els.ccConfigurations) els.ccConfigurations.value = "";
		if (els.ccCostumeFactor) els.ccCostumeFactor.value = "";
		setCheckedInGrid(els.ccSheer, []);
		setCheckedInGrid(els.ccSkintightEx, []);
		setCheckedInGrid(els.ccStorage, []);
		setCheckedInGrid(els.ccBoolFlags, []);
		setCheckedInGrid(els.ccDialogue, []);
		setCheckedInGrid(els.ccShops, []);
		if (els.ccChanceFlags)
		{
			els.ccChanceFlags.querySelectorAll("input[type=radio][value='']").forEach((r) =>
			{
				r.checked = true;
			});
		}
		if (els.ccStyleFactor)
		{
			els.ccStyleFactor.querySelectorAll("input").forEach((inp) => { inp.value = "0"; });
		}
		if (els.ccDisplace)
		{
			els.ccDisplace.querySelectorAll(".cc-displace-row").forEach((row) =>
			{
				const on = row.querySelector(".disp-verb-on");
				if (on) on.checked = false;
				row.querySelectorAll(".disp-parts input").forEach((cb) => { cb.checked = false; });
			});
		}
		applyCategoryDefaultsToForm("tops");
	}

	function applyCategoryDefaultsToForm(category)
	{
		if (!CustomClothing) return;
		const def = CustomClothing.categoryDefaults(category);
		if (els.ccLayer) els.ccLayer.value = String(def.layer || 20);
		setCheckedInGrid(els.ccCovers, def.covers || []);
		setCheckedInGrid(els.ccStyles, def.styles || []);
		setCheckedInGrid(els.ccDialogue, def.dialogueTags || []);
		if (els.ccStyleFactor)
		{
			els.ccStyleFactor.querySelectorAll("input").forEach((inp) =>
			{
				const key = inp.dataset.styleKey;
				inp.value = String((def.styleFactor && def.styleFactor[key]) || 0);
			});
		}
		if (els.ccDisplace)
		{
			const disp = def.displace || {};
			els.ccDisplace.querySelectorAll(".cc-displace-row").forEach((row) =>
			{
				const verb = row.dataset.verb;
				const parts = disp[verb] || [];
				const on = row.querySelector(".disp-verb-on");
				if (on) on.checked = parts.length > 0;
				setCheckedInGrid(row.querySelector(".disp-parts"), parts);
			});
		}
	}

	function readCreateClothingForm()
	{
		const styleFactor = {};
		if (els.ccStyleFactor)
		{
			els.ccStyleFactor.querySelectorAll("input").forEach((inp) =>
			{
				const n = Number(inp.value);
				if (n) styleFactor[inp.dataset.styleKey] = n;
			});
		}
		const displace = {};
		if (els.ccDisplace)
		{
			els.ccDisplace.querySelectorAll(".cc-displace-row").forEach((row) =>
			{
				const on = row.querySelector(".disp-verb-on");
				if (!on || !on.checked) return;
				const verb = row.dataset.verb;
				const parts = readCheckedGrid(row.querySelector(".disp-parts"));
				if (parts.length) displace[verb] = parts;
			});
		}
		const clothingFlags = [];
		if (els.ccChanceFlags)
		{
			els.ccChanceFlags.querySelectorAll(".clothing-flag-row").forEach((row) =>
			{
				const family = row.dataset.chanceFamily;
				const sel = row.querySelector("input[type=radio]:checked");
				if (family && sel && sel.value)
					clothingFlags.push(family + " chance " + sel.value);
			});
		}
		const flags = readCheckedGrid(els.ccBoolFlags).concat(clothingFlags);
		return {
			itemId: els.ccItemId ? els.ccItemId.value.trim() : "",
			shortname: els.ccShortname ? els.ccShortname.value.trim() : "",
			nameTemplate: els.ccNameTemplate ? els.ccNameTemplate.value.trim() : "",
			category: els.ccCategory ? els.ccCategory.value : "tops",
			layer: els.ccLayer ? Number(els.ccLayer.value) : 20,
			price: els.ccPrice ? Number(els.ccPrice.value) : 20,
			author: els.ccAuthor ? els.ccAuthor.value.trim() : "",
			descriptionShop: els.ccDescShop ? els.ccDescShop.value : "",
			descriptionWardrobe: els.ccDescWardrobe ? els.ccDescWardrobe.value : "",
			descriptionThrift: els.ccDescThrift ? els.ccDescThrift.value : "",
			covers: readCheckedGrid(els.ccCovers),
			sheer: readCheckedGrid(els.ccSheer),
			skintightException: readCheckedGrid(els.ccSkintightEx),
			storage: readCheckedGrid(els.ccStorage),
			dialogueTags: readCheckedGrid(els.ccDialogue),
			styles: readCheckedGrid(els.ccStyles),
			styleFactor: styleFactor,
			styleFactorMods: els.ccStyleFactorMods ? els.ccStyleFactorMods.value : "",
			flagsMods: els.ccFlagsMods ? els.ccFlagsMods.value : "",
			coversMods: els.ccCoversMods ? els.ccCoversMods.value : "",
			configurations: els.ccConfigurations ? els.ccConfigurations.value : "",
			costumeFactor: els.ccCostumeFactor ? els.ccCostumeFactor.value : "",
			displace: displace,
			shops: readCheckedGrid(els.ccShops),
			npcCanWear: !!(els.ccNpcWear && els.ccNpcWear.checked),
			pcCanWear: !!(els.ccPcWear && els.ccPcWear.checked),
			useColorSubs: !!(els.ccUseColor && els.ccUseColor.checked),
			useColor2: !!(els.ccUseColor2 && els.ccUseColor2.checked),
			flags: flags,
			clothingFlags: clothingFlags,
		};
	}

	function mergeCustomClothesIntoCatalog()
	{
		if (!ClothingPicker || !CustomClothing) return;
		const defs = CustomClothing.collectFromState(state);
		if (!defs.length) return;
		const extra = CustomClothing.catalogRowsFromDefs(defs);
		const existing = ClothingPicker._catalog || [];
		const byId = new Map(existing.map((r) => [r.id, r]));
		for (const row of extra)
			byId.set(row.id, Object.assign({}, byId.get(row.id) || {}, row));
		ClothingPicker.setCatalog(Array.from(byId.values()));
	}

	function createClothingFromForm()
	{
		if (!CustomClothing)
		{
			setStatus("Create clothing module not loaded");
			return;
		}
		const form = readCreateClothingForm();
		if (!form.itemId)
		{
			setStatus("Enter a game item name");
			if (els.ccItemId) els.ccItemId.focus();
			return;
		}
		const gameClothing = CustomClothing.buildGameClothingFromForm(form);
		const itemId = gameClothing.itemId;

		const existingIdx = state.items.findIndex((it) =>
			(it.cotBindings && it.cotBindings.includes(itemId))
			|| (it.gameClothing && it.gameClothing.itemId === itemId)
			|| it.id === IO.slugify(itemId)
		);
		if (existingIdx >= 0)
		{
			if (!confirm("A layer for \"" + itemId + "\" already exists. Select it instead?"))
				return;
			state.selectedIndex = existingIdx;
			closeCreateClothingModal();
			renderLayerList();
			renderProps();
			setStatus("Selected existing layer for " + itemId);
			return;
		}

		clearClothingAddMode();
		const item = IO.blankItem(state.items.length);
		item.id = IO.slugify(itemId);
		item.name = itemId;
		item.zIndex = CustomClothing.paperdollZFromLayer(gameClothing.layer, gameClothing.category);
		item.cotBindings = [itemId];
		item.gameClothing = gameClothing;
		item.clothingFlags = (gameClothing.flags || []).filter((f) =>
			f.includes("chance") || f === "cleavage" || f === "shows nipples" || f === "skintight"
		);

		state.items.push(item);
		state.selectedIndex = state.items.length - 1;
		state._dirty = true;
		mergeCustomClothesIntoCatalog();
		if (ClothingPicker)
		{
			ClothingPicker.setPackItems(state.items);
			ClothingPicker.setSelectedBinding(itemId);
		}
		closeCreateClothingModal();
		renderLayerList();
		renderProps();
		scheduleRender();
		setStatus(
			"Created full clothing \"" + itemId + "\" (" + gameClothing.category + "). "
			+ "Add art, Export to share, or Save to game to inject setup.clothes"
			+ (gameClothing.shops.length ? " + " + gameClothing.shops.length + " shop(s)" : " (NoShops)")
			+ "."
		);
	}

	function addLayer()
	{
		// Clothing workflow: New Skin wizard (graphic designs from game)
		if (state.editorMode === "clothing")
		{
			openNewSkinModal();
			return;
		}
		clearClothingAddMode();
		const item = IO.defaultBlankForMode(state.editorMode, state.items.length, makeupPackOptions());
		state.items.push(item);
		state.selectedIndex = state.items.length - 1;
		state._dirty = true;
		renderLayerList();
		renderProps();
		scheduleRender();
		setStatus("Added blank layer — pick a clothing piece or drop images");
	}

	function updateSkinDesignStatus(item)
	{
		if (!els.skinDesignStatus) return;
		if (!item || state.editorMode !== "clothing")
		{
			els.skinDesignStatus.textContent = "";
			return;
		}
		const bind = (item.cotBindings && item.cotBindings[0]) || "";
		const design = item.skinSubValue;
		const key = item.skinSubKey || "design";
		if (design && design !== "_default")
		{
			els.skinDesignStatus.textContent = "New Skin · "
				+ (bind || item.id) + " · " + key + " \"" + design + "\""
				+ " — shows in game when that design is worn.";
		}
		else if (bind)
		{
			els.skinDesignStatus.textContent = "Base skin · "
				+ bind
				+ " — used when the worn piece has no design-specific art (or plain item).";
		}
		else
			els.skinDesignStatus.textContent = "";
	}

	function openNewSkinModal()
	{
		if (state.editorMode !== "clothing")
		{
			setStatus("Switch to Clothing workflow for skins");
			return;
		}
		if (els.nsLayerName)
		{
			els.nsLayerName.value = "";
			delete els.nsLayerName.dataset.touched;
		}
		if (els.nsClothingSearch) els.nsClothingSearch.value = "";
		if (els.nsDesignSearch) els.nsDesignSearch.value = "";
		refreshNewSkinClothingList();
		// Prefer Graphic T-shirt when catalog has it (common first skin)
		if (els.nsClothingSelect)
		{
			const preferred = "Graphic T-shirt";
			const hasPreferred = Array.from(els.nsClothingSelect.options)
				.some((o) => o.value === preferred);
			if (hasPreferred) els.nsClothingSelect.value = preferred;
		}
		syncNewSkinSubKeyFromClothing();
		refreshNewSkinDesignList();
		if (els.newSkinModal) els.newSkinModal.classList.remove("hidden");
	}

	function closeNewSkinModal()
	{
		if (els.newSkinModal) els.newSkinModal.classList.add("hidden");
	}

	function getDesignCatalogItems()
	{
		return (state.designCatalog && state.designCatalog.items) || [];
	}

	function findDesignCatalogItem(clothingId)
	{
		return getDesignCatalogItems().find((it) => it.id === clothingId) || null;
	}

	function countDesignOptions(subs)
	{
		return Object.values(subs || {}).reduce((n, a) => n + ((a && a.length) || 0), 0);
	}

	function preferredSubKeyForCatalogItem(d)
	{
		if (!d || !d.subs) return "design";
		const order = ["design", "print", "team", "text"];
		for (const k of order)
		{
			if (d.subs[k] && d.subs[k].length) return k;
		}
		const keys = Object.keys(d.subs);
		return keys[0] || "design";
	}

	function syncNewSkinSubKeyFromClothing()
	{
		if (!els.nsSubKey || !els.nsClothingSelect) return;
		const d = findDesignCatalogItem(els.nsClothingSelect.value);
		const key = preferredSubKeyForCatalogItem(d);
		if (Array.from(els.nsSubKey.options).some((o) => o.value === key))
			els.nsSubKey.value = key;
	}

	function refreshNewSkinClothingList()
	{
		if (!els.nsClothingSelect) return;
		const q = ((els.nsClothingSearch && els.nsClothingSearch.value) || "").toLowerCase().trim();
		const designItems = getDesignCatalogItems();
		const designIds = new Set(designItems.map((it) => it.id));
		// Prefer graphic items; still allow any clothing from picker catalog
		const catalog = (ClothingPicker && ClothingPicker._catalog) || [];
		const rows = [];
		const seen = new Set();
		// Graphic/design items first
		for (const it of designItems)
		{
			if (q && it.id.toLowerCase().indexOf(q) < 0 && (it.category || "").toLowerCase().indexOf(q) < 0)
				continue;
			rows.push({
				id: it.id,
				category: it.category,
				graphic: true,
				designCount: countDesignOptions(it.subs),
			});
			seen.add(it.id);
		}
		for (const row of catalog)
		{
			if (!row || !row.id || seen.has(row.id)) continue;
			if (q && row.id.toLowerCase().indexOf(q) < 0 && String(row.name || "").toLowerCase().indexOf(q) < 0)
				continue;
			rows.push({ id: row.id, category: row.category || "", graphic: designIds.has(row.id), designCount: 0 });
		}
		rows.sort((a, b) =>
		{
			if (a.graphic !== b.graphic) return a.graphic ? -1 : 1;
			return a.id.localeCompare(b.id);
		});
		const prev = els.nsClothingSelect.value;
		els.nsClothingSelect.innerHTML = "";
		for (const row of rows)
		{
			const opt = document.createElement("option");
			opt.value = row.id;
			opt.textContent = row.id
				+ (row.graphic ? " · " + (row.designCount || "?") + " designs" : " · plain");
			els.nsClothingSelect.appendChild(opt);
		}
		if (prev && Array.from(els.nsClothingSelect.options).some((o) => o.value === prev))
			els.nsClothingSelect.value = prev;
		else if (els.nsClothingSelect.options.length)
			els.nsClothingSelect.selectedIndex = 0;
		updateNewSkinHint();
		refreshNewSkinDesignList();
	}

	function updateNewSkinHint()
	{
		if (!els.nsClothingHint) return;
		const id = els.nsClothingSelect && els.nsClothingSelect.value;
		const d = findDesignCatalogItem(id);
		if (!id)
		{
			els.nsClothingHint.textContent = "Select a clothing item.";
			return;
		}
		if (d)
		{
			const keys = Object.keys(d.subs || {});
			const n = keys.reduce((sum, k) => sum + (d.subs[k] || []).length, 0);
			els.nsClothingHint.textContent = id + " has " + n + " game text option(s) on: "
				+ keys.join(", ") + ". Pick one below to match shop text.";
		}
		else
			els.nsClothingHint.textContent = id + " has no sub design list in the catalog — use Base / plain skin only.";
	}

	function refreshNewSkinDesignList()
	{
		if (!els.nsDesignSelect) return;
		const clothingId = els.nsClothingSelect && els.nsClothingSelect.value;
		const subKey = (els.nsSubKey && els.nsSubKey.value) || "design";
		const q = ((els.nsDesignSearch && els.nsDesignSearch.value) || "").toLowerCase().trim();
		const d = findDesignCatalogItem(clothingId);
		const designs = (d && d.subs && d.subs[subKey]) ? d.subs[subKey].slice() : [];
		// Prefer matching sub key; if empty try any available sub list
		let list = designs;
		if (!list.length && d && d.subs)
		{
			for (const k of Object.keys(d.subs))
			{
				if (d.subs[k] && d.subs[k].length) { list = d.subs[k]; break; }
			}
		}
		const prev = els.nsDesignSelect.value;
		els.nsDesignSelect.innerHTML = "";
		const base = document.createElement("option");
		base.value = "_default";
		base.textContent = "— Base / plain (no design text) —";
		els.nsDesignSelect.appendChild(base);
		for (const name of list)
		{
			if (q && name.toLowerCase().indexOf(q) < 0) continue;
			const opt = document.createElement("option");
			opt.value = name;
			opt.textContent = name;
			els.nsDesignSelect.appendChild(opt);
		}
		if (prev && Array.from(els.nsDesignSelect.options).some((o) => o.value === prev))
			els.nsDesignSelect.value = prev;
		else
			els.nsDesignSelect.value = "_default";
		suggestNewSkinLayerName();
	}

	function suggestNewSkinLayerName()
	{
		if (!els.nsLayerName || els.nsLayerName.dataset.touched) return;
		const clothingId = els.nsClothingSelect && els.nsClothingSelect.value;
		const design = els.nsDesignSelect && els.nsDesignSelect.value;
		if (!clothingId) return;
		if (!design || design === "_default")
			els.nsLayerName.value = clothingId + " (base)";
		else
			els.nsLayerName.value = clothingId + " — " + design;
	}

	function createNewSkinFromForm()
	{
		const clothingId = els.nsClothingSelect && els.nsClothingSelect.value;
		if (!clothingId)
		{
			setStatus("Select a game clothing item");
			return;
		}
		const subKey = (els.nsSubKey && els.nsSubKey.value) || "design";
		let design = els.nsDesignSelect && els.nsDesignSelect.value;
		if (design === "_default") design = "";
		const layerName = (els.nsLayerName && els.nsLayerName.value.trim())
			|| (design ? clothingId + " — " + design : clothingId + " (base)");
		const slugExtra = design
			? ((ClothingSkins && ClothingSkins.designSlug)
				? ClothingSkins.designSlug(design) : IO.slugify(design))
			: "base";

		clearClothingAddMode();
		const item = IO.blankItem(state.items.length);
		let idBase = IO.slugify(clothingId) + "-" + slugExtra;
		let uniqueId = idBase;
		let n = 2;
		while (state.items.some((it) => it && it.id === uniqueId))
		{
			uniqueId = idBase + "-" + n;
			n++;
		}
		item.id = uniqueId;
		item.name = layerName;
		item.zIndex = 40 + state.items.length;
		item.cotBindings = [clothingId];
		item.skinSubKey = design ? subKey : "";
		item.skinSubValue = design || "";
		state.items.push(item);
		state.selectedIndex = state.items.length - 1;
		state._dirty = true;
		if (ClothingPicker)
		{
			ClothingPicker.setPackItems(state.items);
			ClothingPicker.setSelectedBinding(clothingId);
		}
		closeNewSkinModal();
		renderLayerList();
		renderProps();
		scheduleRender();
		setStatus(
			design
				? "Skin for " + clothingId + " · design \"" + design + "\". Add art, then Save. In game, buy/wear that design to see it."
				: "Base skin for " + clothingId + " (used when no design-specific skin matches). Add art, then Save."
		);
	}

	async function removeLayer()
	{
		if (state.items.length <= 1) return;
		clearClothingAddMode();
		const removed = state.items[state.selectedIndex];
		if (removed) revokeEditorItemBlobs([removed]);
		state.items.splice(state.selectedIndex, 1);
		state.selectedIndex = Math.max(0, state.selectedIndex - 1);
		state._dirty = true;
		if (ClothingPicker) ClothingPicker.setPackItems(state.items);
		if (MakeupPicker) MakeupPicker.setPackItems(state.items);
		renderLayerList();
		renderProps();
		await preloadEditorImages(state.items);
		await renderPreview();
		setStatus("Removed layer — " + state.items.length + " piece(s) in preview");
	}

	function applyLayerMeta()
	{
		const item = selectedItem();
		if (!item) return;
		if (!isBasePosesMode())
		{
			item.id = IO.slugify(els.layerId.value.trim() || item.id);
			item.name = els.layerName.value.trim() || item.name;
			if (els.itemRecolor) item.recolor = !!els.itemRecolor.checked;
			if (els.exposureDisplacements)
			{
				const raw = els.exposureDisplacements.value.trim();
				if (!raw) item.exposureDisplacements = {};
				else
				{
					try
					{
						const parsed = JSON.parse(raw);
						item.exposureDisplacements = parsed && typeof parsed === "object" ? parsed : {};
					}
					catch (e)
					{
						setStatus("Exposure displacement map must be valid JSON");
						return;
					}
				}
			}
			if (state.editorMode === "skin") item.layer = "skin";
			if (state.editorMode === "wet") item.layer = "wet";
		}
		item.zIndex = Number(els.layerZ.value) || item.zIndex;
		state._dirty = true;
		renderLayerList();
		scheduleRender();
	}

	function wireTransformChecks()
	{
		["flipH", "flipV"].forEach((key) =>
		{
			const el = document.getElementById("tf-" + key);
			if (!el) return;
			el.addEventListener("change", () =>
			{
				const item = selectedItem();
				if (!item) return;
				const poseDef = ensurePoseEntry(item, state.editPose);
				poseDef.transform[key] = el.checked;
				state._dirty = true;
				scheduleRender();
			});
		});
	}

	function bindClick(el, handler)
	{
		if (!el) return;
		el.addEventListener("click", handler);
	}

	function wireUi()
	{
		if (state._uiWired) return;
		state._uiWired = true;

		["packId", "packName", "packDesc"].forEach((id) =>
		{
			const el = document.getElementById(id);
			if (el) el.addEventListener("change", () => { syncPackMetaFromInputs(); state._dirty = true; });
		});

		bindClick(els.btnNew, () =>
		{
			if (state._dirty && !confirm("Clear all clothing pieces and start over?")) return;
			newPack();
		});
		bindClick(els.btnAddLayer, addLayer);
		bindClick(els.btnCreateClothing, openCreateClothingModal);
		bindClick(els.btnAddExisting, armAddExistingClothing);
		bindClick(els.btnRemoveLayer, removeLayer);
		bindClick(els.createClothingClose, closeCreateClothingModal);
		bindClick(els.createClothingCancel, closeCreateClothingModal);
		bindClick(els.createClothingSubmit, createClothingFromForm);
		bindClick(els.newSkinClose, closeNewSkinModal);
		bindClick(els.newSkinCancel, closeNewSkinModal);
		bindClick(els.newSkinSubmit, createNewSkinFromForm);
		if (els.newSkinModal) els.newSkinModal.addEventListener("click", (e) =>
		{
			if (e.target === els.newSkinModal) closeNewSkinModal();
		});
		if (els.nsClothingSearch) els.nsClothingSearch.addEventListener("input", () =>
		{
			refreshNewSkinClothingList();
		});
		if (els.nsClothingSelect) els.nsClothingSelect.addEventListener("change", () =>
		{
			syncNewSkinSubKeyFromClothing();
			updateNewSkinHint();
			if (els.nsLayerName) delete els.nsLayerName.dataset.touched;
			refreshNewSkinDesignList();
		});
		if (els.nsSubKey) els.nsSubKey.addEventListener("change", () =>
		{
			if (els.nsLayerName) delete els.nsLayerName.dataset.touched;
			refreshNewSkinDesignList();
		});
		if (els.nsDesignSearch) els.nsDesignSearch.addEventListener("input", () =>
		{
			refreshNewSkinDesignList();
		});
		if (els.nsDesignSelect) els.nsDesignSelect.addEventListener("change", () =>
		{
			if (els.nsLayerName) delete els.nsLayerName.dataset.touched;
			suggestNewSkinLayerName();
		});
		if (els.nsLayerName) els.nsLayerName.addEventListener("input", () =>
		{
			els.nsLayerName.dataset.touched = "1";
		});
		if (els.ccTabs) els.ccTabs.addEventListener("click", (e) =>
		{
			const btn = e.target.closest("button[data-cc-tab]");
			if (btn) showCcTab(btn.getAttribute("data-cc-tab"));
		});
		if (els.ccCategory) els.ccCategory.addEventListener("change", () =>
		{
			applyCategoryDefaultsToForm(els.ccCategory.value);
		});
		if (els.ccItemId) els.ccItemId.addEventListener("input", () =>
		{
			if (!CustomClothing || !els.ccItemId) return;
			const id = els.ccItemId.value.trim();
			if (!id) return;
			if (els.ccShortname && !els.ccShortname.dataset.touched)
				els.ccShortname.value = CustomClothing.shortnameFromName(id);
			if (els.ccNameTemplate && !els.ccNameTemplate.dataset.touched)
				els.ccNameTemplate.value = "%style %color " + CustomClothing.shortnameFromName(id);
		});
		if (els.ccShortname) els.ccShortname.addEventListener("input", () =>
		{
			els.ccShortname.dataset.touched = "1";
		});
		if (els.ccNameTemplate) els.ccNameTemplate.addEventListener("input", () =>
		{
			els.ccNameTemplate.dataset.touched = "1";
		});
		if (els.createClothingModal) els.createClothingModal.addEventListener("click", (e) =>
		{
			if (e.target === els.createClothingModal) closeCreateClothingModal();
		});

		if (els.fileImage)
		{
			els.fileImage.addEventListener("change", () =>
			{
				const file = els.fileImage.files && els.fileImage.files[0];
				els.fileImage.value = "";
				if (file) assignImageFile(file).catch(console.error);
			});
		}
		if (els.fileImport)
		{
			els.fileImport.addEventListener("change", () =>
			{
				const file = els.fileImport.files && els.fileImport.files[0];
				els.fileImport.value = "";
				if (file) importPackFile(file);
			});
		}
		if (els.fileBgImage)
		{
			els.fileBgImage.addEventListener("change", () =>
			{
				const file = els.fileBgImage.files && els.fileBgImage.files[0];
				els.fileBgImage.value = "";
				if (file) addCustomBackgroundFile(file);
			});
		}

		wireDropZone();
		["layerId", "layerName", "layerZ", "preview-tint-color", "exposure-displacements"].forEach((id) =>
		{
			const el = document.getElementById(id);
			if (el) el.addEventListener("change", applyLayerMeta);
		});

		if (els.previewLod) els.previewLod.addEventListener("change", () =>
		{
			state.previewLod = Number(els.previewLod.value) || 512;
			scheduleRender();
		});

		if (els.editPose) els.editPose.addEventListener("change", () =>
		{
			state.editPose = els.editPose.value;
			state.previewPose = state.editPose;
			if (ClothingPicker) ClothingPicker.setEditPose(state.editPose);
			if (MakeupPicker) MakeupPicker.setEditPose(state.editPose);
			refreshPoseControls();
			renderProps();
			scheduleRender();
		});

		bindClick(els.btnAddPosePreset, () =>
		{
			const id = els.posePresetSelect && els.posePresetSelect.value;
			if (!id)
			{
				setStatus("Choose a pose preset first");
				return;
			}
			const preset = Core && Core.POSE_PRESETS && Core.POSE_PRESETS[id];
			addPoseToEditor(id, preset && preset.label);
		});
		bindClick(els.btnAddPoseCustom, () =>
		{
			const id = els.poseCustomId && els.poseCustomId.value.trim();
			const label = els.poseCustomLabel && els.poseCustomLabel.value.trim();
			if (!id)
			{
				setStatus("Enter a pose id (e.g. side_left)");
				return;
			}
			addPoseToEditor(id, label);
			if (els.poseCustomId) els.poseCustomId.value = "";
			if (els.poseCustomLabel) els.poseCustomLabel.value = "";
		});



		if (els.editLod) els.editLod.addEventListener("change", () =>
		{
			setEditLod(els.editLod.value);
			const item = selectedItem();
			if (item)
			{
				renderLodGrid(item);
				renderColorMaskGrid(item);
				renderDisplacementGrids(item);
			}
		});

		if (els.itemRecolor) els.itemRecolor.addEventListener("change", () =>
		{
			const item = selectedItem();
			if (!item) return;
			item.recolor = !!els.itemRecolor.checked;
			state._dirty = true;
			scheduleRender();
		});
		if (els.previewTintColor) els.previewTintColor.addEventListener("input", () =>
		{
			state.previewTintColor = els.previewTintColor.value.trim() || "red";
			scheduleRender();
		});

		fillDisplacementSelect(els.previewDisplacement, true, null);
		fillDisplacementSelect(els.editDisplacement, false, null);
		if (els.previewDisplacement) els.previewDisplacement.value = state.previewDisplacement;
		if (els.editDisplacement) els.editDisplacement.value = state.editDisplacement;

		if (els.previewDisplacement) els.previewDisplacement.addEventListener("change", () =>
		{
			state.previewDisplacement = els.previewDisplacement.value || "normal";
			scheduleRender();
		});
		if (els.editDisplacement) els.editDisplacement.addEventListener("change", () =>
		{
			state.editDisplacement = els.editDisplacement.value || "";
			const item = selectedItem();
			if (item) renderDisplacementGrids(item);
		});

		const onDispFilterChange = () =>
		{
			const item = selectedItem();
			if (item) renderEnabledDisplacementChecks(item);
		};
		if (els.enabledDispOnlyOn) els.enabledDispOnlyOn.addEventListener("change", onDispFilterChange);
		if (els.enabledDispNeedArt) els.enabledDispNeedArt.addEventListener("change", onDispFilterChange);

		bindTransformInput("tf-x", "x", Number);
		bindTransformInput("tf-y", "y", Number);
		bindTransformInput("tf-sx", "scaleX", Number);
		bindTransformInput("tf-sy", "scaleY", Number);
		bindTransformInput("tf-rot", "rotation", Number);
		bindTransformInput("tf-op", "opacity", Number);
		wireTransformChecks();

		bindClick(els.btnSave, async () =>
		{
			const slug = preparePackForOutput();
			if (!slug) return;
			if (!IO.canSaveToFolder())
			{
				setStatus("Save to game needs Chrome or Edge. Use Export to share a ZIP.");
				return;
			}
			if (!(await IO.isGameSetupComplete()))
			{
				showSetupOverlay(true);
				setStatus("Connect your game folder first (one-time setup).");
				return;
			}
			if (els.btnSave)
			{
				els.btnSave.classList.add("is-saving");
				els.btnSave.classList.remove("is-saved");
			}
			try
			{
				setStatus(state.editorMode === "base-poses"
					? "Saving base poses to base-pack/…"
					: "Saving clothing pack to mods/…");
				const saved = await IO.saveToGame(state);
				const where = saved.saveTarget === "base-pack"
					? IO.pathHints.basePackSave
					: IO.pathHints.modsSave.replace("<pack-id>", saved.result.modSlug);
				let diskVerify = null;
				const bg = saved.backgrounds || {};
				const bgNote = bg.error
					? " Background save failed: " + bg.error
					: (bg.written
						? " Saved " + bg.written + " mirror background(s)."
						: "");
				if (bg.written) state.pendingBgUploads = [];

				if (saved.saveTarget === "mods")
				{
					diskVerify = await IO.verifyModPackOnDisk(saved.access.epRoot, saved.result.modSlug);
					await reloadModPackFromGame(saved.result.modSlug);
					const cc = saved.customClothes || {};
					const ccNote = cc.error
						? " Custom clothes inject failed: " + cc.error
						: (cc.injected
							? " Injected " + cc.injected + " custom clothing item(s) into game HTML."
							: "");
					setStatus(
						diskVerify.ok
							? "Verified " + diskVerify.imageCount + " image(s) in " + where
							+ " — runtime-packs.js updated." + ccNote + bgNote
							+ " Hard-refresh the game (Ctrl+Shift+R)."
							: "Saved pack.json but " + diskVerify.missing.length + " image(s) missing on disk — retry Save."
					);
				}
				else
				{
					await reloadBasePosesFromGame();
					diskVerify = { ok: true, imageCount: saved.saveStats.imageCount || 0, packPath: where };
					setStatus(
						"Saved " + saved.result.fileCount + " files to " + where
						+ " — editor preview updated (" + (saved.saveStats.imageCount || 0) + " images). "
						+ "Hard-refresh the game (Ctrl+Shift+R) to load new base poses."
					);
				}

				state._dirty = false;
				state._pendingInstall = false;
				updateImportBanner();
				const verify = await IO.verifyGameConnection(saved.access);
				showConnectionStatus(verify);
				await refreshGameFolderLabel(verify);
				showSaveSuccessBanner(diskVerify, saved);

				if (els.btnSave)
				{
					els.btnSave.classList.remove("is-saving");
					els.btnSave.classList.add("is-saved");
					setTimeout(() =>
					{
						if (els.btnSave) els.btnSave.classList.remove("is-saved");
					}, 700);
				}
			}
			catch (e)
			{
				if (els.btnSave) els.btnSave.classList.remove("is-saving", "is-saved");
				if (e && e.name === "AbortError") { setStatus("Save cancelled"); return; }
				console.error(e);
				setStatus("Save failed: " + e.message);
				if (els.saveSuccessBanner)
				{
					els.saveSuccessBanner.classList.remove("hidden");
					els.saveSuccessBanner.classList.add("is-error");
					if (els.saveSuccessIcon) els.saveSuccessIcon.textContent = "✗";
					if (els.saveSuccessText) els.saveSuccessText.textContent = "Save failed: " + e.message;
				}
			}
		});

		bindClick(els.setupBtnConnect, () => { runGameSetup(true, { forceRepick: true }); });
		bindClick(els.setupBtnReconnect, () => { runGameReconnect(true); });
		bindClick(els.setupBtnVerify, async () =>
		{
			const access = await IO.reconnectStoredGameAccess();
			await runConnectionVerify(access, els.setupStatus, els.setupVerifyList);
		});
		bindClick(els.btnGameFolder, async () =>
		{
			if (await IO.hasStoredGameSetup())
			{
				showSetupOverlay(true, { reconnect: true });
				if (els.setupStatus) els.setupStatus.textContent = "Reconnect or choose a different folder.";
			}
			else
				runGameSetup(true, { forceRepick: true });
		});
		if (els.connectionStatusDismiss) els.connectionStatusDismiss.addEventListener("click", () =>
		{
			setConnectionNoticeDismissed(true);
			if (els.connectionStatusWrap) els.connectionStatusWrap.classList.add("hidden");
			els.connectionStatusDismiss.hidden = true;
		});
		wireCollapsibleUi();
		initClothingPicker();
		initMakeupPicker();
		initMakeupSubBar();
		if (els.btnGameFolder) els.btnGameFolder.style.display = IO.canSaveToFolder() ? "" : "none";

		bindClick(els.btnExport, async () =>
		{
			const slug = preparePackForOutput();
			if (!slug) return;
			try
			{
				setStatus("Building export ZIP…");
				const blob = await IO.exportZip(state);
				const a = document.createElement("a");
				a.href = URL.createObjectURL(blob);
				a.download = slug + ".zip";
				a.click();
				URL.revokeObjectURL(a.href);
				state._dirty = false;
				setStatus("Exported " + slug + ".zip — share this ZIP with other players");
			}
			catch (e)
			{
				console.error(e);
				setStatus("Export failed: " + e.message);
			}
		});
	}

	function refreshPoseControls()
	{
		renderViewButtons();
		renderPoseButtons(els.poseBar, state.previewPose, onPosePick);
		fillEditPoseSelect();
		renderPoseManager();
	}

	async function bootEditor()
	{
		await EP.loadBasePack();
		// Default active poses: front + back only (custom poses added by player)
		if (Core && Core.resetPosesToDefault) Core.resetPosesToDefault();
		if (EP._basePack && Array.isArray(EP._basePack.poses) && EP._basePack.poses.length)
		{
			// Prefer base pack pose list if present, but strip to defaults unless base has only front/back
			const basePoses = EP._basePack.poses.filter((p) => p === "front" || p === "back");
			applyPosesToEditor(basePoses.length ? basePoses : ["front", "back"], EP._basePack.poseMeta || {});
		}
		else
			applyPosesToEditor(["front", "back"], {});
		if (!state.items.length)
			state.items = [IO.defaultBlankForMode(state.editorMode, 0, makeupPackOptions())];
		applyModeUi();
		await newPack();
		refreshPoseControls();
		await initPreviewBackgrounds();
		await renderPreview();
		state._editorBooted = true;
	}

	async function boot()
	{
		requireDeps();
		EP = Engine.EP;
		Core = Engine.Core;
		fillPathHints();
		wireUi();

		if (!IO.canSaveToFolder())
		{
			showSetupOverlay(false);
			await loadDesignCatalogForEditor(null);
			await bootEditor();
			setStatus("Export works in any browser. Save to game needs Chrome or Edge.");
			return;
		}

		await refreshGameFolderLabel();
		const hasStored = await IO.hasStoredGameSetup();
		const access = await IO.resolveStoredGameAccess({ silent: true });
		if (!access)
		{
			showSetupOverlay(true, { reconnect: hasStored });
			if (hasStored)
				setStatus("Click Reconnect to grant folder access (browser security).");
			else
				setStatus("Connect your game folder to unlock Save to game.");
			// JSON catalog still available for + New Skin without FS access
			await loadDesignCatalogForEditor(null);
			await bootEditor();
			return;
		}

		showSetupOverlay(false);
		const verify = await IO.verifyGameConnection(access);
		showConnectionStatus(verify);
		await refreshGameFolderLabel(verify);
		await loadClothingCatalogForEditor(access);
		const designCount = await loadDesignCatalogForEditor(access);
		await loadMakeupCatalogForEditor(access);
		await bootEditor();
		setStatus(verify.ok
			? "Save to game writes to exhibition-paperdoll/ — connection verified."
				+ (designCount ? " " + designCount + " graphic items for + New Skin." : "")
			: "Folder connected with warnings — review checks in the banner.");
	}

	if (document.readyState === "loading")
		document.addEventListener("DOMContentLoaded", () => { boot().catch(onBootError); });
	else
		boot().catch(onBootError);

	function onBootError(e)
	{
		console.error(e);
		try { wireUi(); } catch (wireErr) { console.error(wireErr); }
		setStatus("Boot failed: " + (e && e.message ? e.message : String(e)));
	}
})();