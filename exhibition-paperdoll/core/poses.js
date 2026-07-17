/* Exhibition paperdoll — pose registry (defaults + player-added poses) */
(function()
{
	"use strict";
	setup.ExhibitionPaperdoll = setup.ExhibitionPaperdoll || {};
	const EP = setup.ExhibitionPaperdoll;
	const Core = EP.Core = EP.Core || {};

	/** Always available. */
	Core.BUILTIN_POSES = {
		front: {
			id: "front",
			label: "Front",
			contexts: ["sidebar", "mirror", "shop", "elkbook", "library", "generic", "tanning", "capture"],
			builtin: true,
			locked: true,
		},
		back: {
			id: "back",
			label: "Back",
			contexts: ["sidebar", "mirror", "shop", "generic", "tanning", "capture"],
			builtin: true,
			locked: true,
		},
	};

	/**
	 * Optional presets players can add (not active until registered).
	 * Kept so tanning / elkbook can still map when re-enabled.
	 */
	Core.POSE_PRESETS = {
		on_back: {
			id: "on_back",
			label: "On back",
			contexts: ["tanning", "elkbook", "capture", "generic", "mirror"],
			tanpose: "back",
			builtin: true,
		},
		on_stomach: {
			id: "on_stomach",
			label: "On stomach",
			contexts: ["tanning", "elkbook", "capture", "generic", "mirror"],
			tanpose: "stomach",
			builtin: true,
		},
		side_left: {
			id: "side_left",
			label: "Side (left)",
			contexts: ["mirror", "generic", "capture"],
		},
		side_right: {
			id: "side_right",
			label: "Side (right)",
			contexts: ["mirror", "generic", "capture"],
		},
		kneeling: {
			id: "kneeling",
			label: "Kneeling",
			contexts: ["mirror", "generic", "capture"],
		},
		sitting: {
			id: "sitting",
			label: "Sitting",
			contexts: ["mirror", "generic", "capture"],
		},
	};

	Core.DEFAULT_POSE = "front";
	Core.DEFAULT_POSE_IDS = ["front", "back"];

	/** Active pose registry (starts as builtins only). */
	Core.POSES = Object.assign({}, Core.BUILTIN_POSES);

	function slugPoseId(text)
	{
		return String(text || "pose")
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "_")
			.replace(/^_+|_+$/g, "")
			.replace(/_+/g, "_") || "pose";
	}

	Core.slugPoseId = slugPoseId;

	Core.poseIds = function()
	{
		return Object.keys(Core.POSES);
	};

	Core.poseList = function()
	{
		return Core.poseIds().map((id) => Core.POSES[id]);
	};

	Core.poseLabel = function(poseId)
	{
		const p = Core.POSES[poseId] || Core.POSE_PRESETS[poseId];
		return (p && p.label) || poseId || "";
	};

	Core.isPoseLocked = function(poseId)
	{
		const p = Core.POSES[poseId];
		return !!(p && p.locked);
	};

	Core.normalizePose = function(pose)
	{
		if (!pose) return Core.DEFAULT_POSE;
		if (Core.POSES[pose]) return pose;
		// Accept known presets / any art key so packs with extra poses still compose
		if (Core.POSE_PRESETS[pose]) return pose;
		// Unknown id: still return as-is if non-empty so custom pack poses render
		// when registered late; fall back only for falsy/garbage
		if (typeof pose === "string" && /^[a-z0-9_]+$/i.test(pose)) return pose;
		return Core.DEFAULT_POSE;
	};

	/**
	 * Register or update a pose. Works for presets and fully custom ids.
	 * @returns {object|null} pose entry
	 */
	Core.registerPose = function(id, info)
	{
		info = info || {};
		const poseId = slugPoseId(id || info.id);
		if (!poseId) return null;
		if (Core.BUILTIN_POSES[poseId] && Core.BUILTIN_POSES[poseId].locked)
		{
			// Allow label/context refresh but keep locked
			const prev = Core.POSES[poseId] || Core.BUILTIN_POSES[poseId];
			Core.POSES[poseId] = Object.assign({}, prev, info, {
				id: poseId,
				locked: true,
				builtin: true,
				label: info.label || prev.label,
			});
			return Core.POSES[poseId];
		}
		const preset = Core.POSE_PRESETS[poseId] || {};
		Core.POSES[poseId] = Object.assign({}, preset, info, {
			id: poseId,
			label: info.label || preset.label || poseId.replace(/_/g, " "),
			contexts: info.contexts || preset.contexts || ["generic", "mirror"],
			custom: !preset.builtin,
			builtin: !!preset.builtin,
		});
		return Core.POSES[poseId];
	};

	/** Remove a non-locked pose from the active registry. */
	Core.unregisterPose = function(poseId)
	{
		if (!poseId || Core.isPoseLocked(poseId)) return false;
		if (!Core.POSES[poseId]) return false;
		delete Core.POSES[poseId];
		return true;
	};

	/** Reset to front/back only. */
	Core.resetPosesToDefault = function()
	{
		Core.POSES = Object.assign({}, Core.BUILTIN_POSES);
	};

	/**
	 * Apply a pack's poses + poseMeta (from pack.json).
	 * Does not remove locked builtins.
	 */
	Core.applyPackPoses = function(poseIds, poseMeta)
	{
		poseMeta = poseMeta || {};
		const ids = Array.isArray(poseIds) && poseIds.length
			? poseIds.slice()
			: Core.DEFAULT_POSE_IDS.slice();
		// Always keep locked builtins available
		for (const id of Core.DEFAULT_POSE_IDS)
		{
			if (!ids.includes(id)) ids.unshift(id);
		}
		// Register each
		const next = Object.assign({}, Core.BUILTIN_POSES);
		for (const id of ids)
		{
			const meta = poseMeta[id] || Core.POSE_PRESETS[id] || {};
			if (Core.BUILTIN_POSES[id])
			{
				next[id] = Object.assign({}, Core.BUILTIN_POSES[id], meta, { id: id, locked: true, builtin: true });
			}
			else
			{
				next[id] = Object.assign({}, Core.POSE_PRESETS[id] || {}, meta, {
					id: id,
					label: (meta && meta.label) || (Core.POSE_PRESETS[id] && Core.POSE_PRESETS[id].label) || id.replace(/_/g, " "),
					contexts: (meta && meta.contexts) || (Core.POSE_PRESETS[id] && Core.POSE_PRESETS[id].contexts) || ["generic", "mirror"],
					custom: !(Core.POSE_PRESETS[id] && Core.POSE_PRESETS[id].builtin),
				});
			}
		}
		Core.POSES = next;
		return Core.poseIds();
	};

	/** Serialize active non-default poses for pack.json */
	Core.exportPoseMeta = function()
	{
		const meta = {};
		for (const [id, pose] of Object.entries(Core.POSES))
		{
			if (Core.BUILTIN_POSES[id] && Core.BUILTIN_POSES[id].locked) continue;
			meta[id] = {
				label: pose.label,
				contexts: pose.contexts || ["generic", "mirror"],
			};
			if (pose.tanpose) meta[id].tanpose = pose.tanpose;
		}
		return meta;
	};

	Core.posesForContext = function(context)
	{
		const source = (context && context.source) || "generic";
		const out = [];
		for (const pose of Object.values(Core.POSES))
		{
			if (!pose.contexts || pose.contexts.includes(source) || pose.contexts.includes("generic"))
				out.push(pose);
		}
		return out.length ? out : [Core.POSES.front];
	};

	Core.poseFromTanpose = function(tanpose)
	{
		// Prefer registered matching poses
		for (const pose of Object.values(Core.POSES))
		{
			if (pose.tanpose === tanpose) return pose.id;
		}
		if (tanpose === "stomach" && Core.POSES.on_stomach) return "on_stomach";
		if (tanpose === "back" && Core.POSES.on_back) return "on_back";
		return Core.DEFAULT_POSE;
	};

	/** Available presets not yet registered. */
	Core.availablePosePresets = function()
	{
		const out = [];
		for (const [id, pose] of Object.entries(Core.POSE_PRESETS))
		{
			if (!Core.POSES[id]) out.push(Object.assign({ id: id }, pose));
		}
		return out;
	};
})();
