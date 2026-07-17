/* Exhibition paperdoll — image loader */
(function()
{
	"use strict";
	setup.ExhibitionPaperdoll = setup.ExhibitionPaperdoll || {};
	const EP = setup.ExhibitionPaperdoll;
	const Core = EP.Core = EP.Core || {};
	Core._imageCache = new Map();
	Core.resolveAssetPath = function(relativePath)
	{
		if (!relativePath || typeof relativePath !== "string") return "";
		if (/^(data:|blob:|https?:)/i.test(relativePath)) return relativePath;
		const base = EP._assetRoot || "exhibition-paperdoll/";
		if (relativePath.startsWith("exhibition-paperdoll/")) return relativePath;
		return base + relativePath.replace(/^\//, "");
	};
	Core.pruneImageCache = function(src)
	{
		if (!src || !Core._imageCache) return;
		const path = Core.resolveAssetPath(src);
		if (path) Core._imageCache.delete(path);
		Core._imageCache.delete(src);
	};

	Core.poseHasSources = function(poseDef)
	{
		if (!poseDef) return false;
		const sources = Core.normalizeSources(poseDef);
		return Object.keys(sources).some((tier) => !!sources[tier]);
	};

	Core.packEntryHasArt = function(entry)
	{
		if (!entry || !entry.poses) return false;
		for (const poseDef of Object.values(entry.poses))
		{
			if (Core.poseHasSources(poseDef)) return true;
		}
		return false;
	};

	Core.loadImage = async function(src, options)
	{
		options = options || {};
		const path = Core.resolveAssetPath(src);
		if (!path) return null;
		if (Core._imageCache.has(path))
		{
			const cached = Core._imageCache.get(path);
			return cached === false ? null : cached;
		}
		return new Promise((resolve) =>
		{
			const img = new Image();
			img.onload = () => { Core._imageCache.set(path, img); resolve(img); };
			img.onerror = () =>
			{
				Core._imageCache.set(path, false);
				if (!options.silent) console.warn("[ExhibitionPaperdoll] Missing:", path);
				resolve(null);
			};
			img.src = path;
		});
	};
	Core.resolvePoseAsset = function(poseDef, requestedLod)
	{
		const sources = Core.normalizeSources(poseDef);
		const lod = Core.pickLod(requestedLod, sources);
		if (!lod) return { lod: null, path: null, sources: sources };
		return { lod: lod, path: sources[lod], sources: sources };
	};
	Core.loadPoseImage = async function(poseDef, requestedLod, options)
	{
		options = options || {};
		const resolved = Core.resolvePoseAsset(poseDef, requestedLod);
		if (!resolved.path) return { img: null, lod: null, sources: resolved.sources };
		const img = await Core.loadImage(resolved.path, options);
		return { img: img, lod: resolved.lod, sources: resolved.sources };
	};
	Core.prunePackEntry = function(entry)
	{
		if (!entry || !entry.poses) return null;
		const poses = {};
		for (const [poseId, poseDef] of Object.entries(entry.poses))
		{
			if (Core.poseHasSources(poseDef)) poses[poseId] = poseDef;
		}
		if (!Object.keys(poses).length) return null;
		return Object.assign({}, entry, { poses });
	};
})();