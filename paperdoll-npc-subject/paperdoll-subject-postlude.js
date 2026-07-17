/* === Paperdoll subject postlude (after paperdoll.js) === */
(function()
{
	const PD = setup.Paperdoll;
	if (!PD) return;

	if (PD.cache && PD.cache.generateKey && !PD._subjectCachePatched)
	{
		const origGenerateKey = PD.cache.generateKey.bind(PD.cache);
		PD.cache.generateKey = function(clothes, pc)
		{
			const key = origGenerateKey(clothes, pc);
			try
			{
				const parsed = JSON.parse(key);
				parsed.subjectId = PD._subjectCacheId(pc);
				return JSON.stringify(parsed);
			}
			catch (error)
			{
				return key + ":" + PD._subjectCacheId(pc);
			}
		};
		PD._subjectCachePatched = true;
	}

	PD._paperdollRender = async function(canvas, subject, options = {})
	{
		if (!canvas || !subject) return null;
		subject = PD._prepareRenderSubject(subject);

		window.cacheKey = PD.cache.generateKey(subject.clothes, subject);
		const cachedCanvas = PD.cache.get(cacheKey);
		if (cachedCanvas && !options.bypassCache)
		{
			const ctx = canvas.getContext("2d");
			canvas.width = cachedCanvas.width;
			canvas.height = cachedCanvas.height;
			ctx.drawImage(cachedCanvas, 0, 0);

			const scalebase = canvas.height > canvas.width ? canvas.height : canvas.width;
			PD.applyCanvasScale(canvas, scalebase);
			if (scalebase <= 256)
			{
				canvas.style.imageRendering = "pixelated";
				canvas.style.imageRendering = "crisp-edges";
				canvas.style.msInterpolationMode = "nearest-neighbor";
			}
			return cachedCanvas;
		}

		window.breastType = null;
		window.hoodState = "";

		const p = new PaperDollSystem(canvas);
		const baseURL = "res/paperdoll/";
		const baseBody = await PD.resolveViewPath(`${baseURL}body/basenoarms.png`);
		await p.loadBaseModel(baseBody);

		const clothes = subject.clothes || [];
		let leftHandClothes = [];
		let rightHandClothes = [];
		let bodyClothes = [];
		let backClothes = [];
		let content = { p, baseURL, backClothes, leftHandClothes, rightHandClothes, bodyClothes };
		[p, bodyClothes, leftHandClothes, rightHandClothes, backClothes] =
			await PD.clotheLayers(p, clothes, bodyClothes, leftHandClothes, rightHandClothes, backClothes, content);
		Object.assign(content, { p, baseURL, backClothes, leftHandClothes, rightHandClothes, bodyClothes });

		const PCLayers = PD.getActiveModel().layer;

		for (const [tag, def] of Object.entries(PD.tagSlots))
		{
			const queueKey = `_tag_${tag}`;
			if (content[queueKey] && def.z != null)
			{
				PCLayers[`tagClothes_${tag}`] = {
					layer: def.z,
					load: async function(ctx)
					{
						const items = ctx[queueKey];
						if (!items) return;
						for (const q of ["bodyClothes", "leftHandClothes", "rightHandClothes", "backClothes"])
						{
							for (const item of (items[q] || []))
							{
								if (item.color) await ctx.p.loadLayer(item.path, item.color, "clothes");
								else await ctx.p.loadLayer(item.path);
							}
						}
					},
				};
			}
		}

		const sortedLightingLayers = Object.entries(PD.models.lighting.layer)
			.sort(([, a], [, b]) => a.layer - b.layer);
		for (const [name, layerDef] of sortedLightingLayers)
			await layerDef.load(content);

		const layers = Object.keys(PCLayers).sort((a, b) => PCLayers[a].layer - PCLayers[b].layer);
		for (const layer of layers)
			await PCLayers[layer].load(content);

		return new Promise((resolve) =>
		{
			setTimeout(() =>
			{
				p.draw();
				const scalebase = p.canvas.height > p.canvas.width ? p.canvas.height : p.canvas.width;
				PD.applyCanvasScale(canvas, scalebase);
				if (scalebase <= 256)
				{
					canvas.style.imageRendering = "pixelated";
					canvas.style.imageRendering = "crisp-edges";
					canvas.style.msInterpolationMode = "nearest-neighbor";
				}
				PD.cache.set(cacheKey, p.canvas);
				resolve(p);
			}, 50);
		});
	};

	PD.paperdollSubject = async function(canvas, person, options = {})
	{
		if (!canvas || !person) return null;
		if (person.is_pc || (V.pc && person.equals && person.equals(V.pc)))
			return PD.paperdollPC(canvas);

		person = PD._prepareRenderSubject(person);
		try
		{
			return await PD.withRenderSubject(person, () => PD._paperdollRender(canvas, person, options));
		}
		catch (error)
		{
			console.warn("[Paperdoll] paperdollSubject failed:", error);
			if (options.fallbackSilhouette !== false &&
				setup.NpcAppearance &&
				setup.NpcAppearance.renderSilhouetteFallback)
				setup.NpcAppearance.renderSilhouetteFallback(canvas, person);
			return null;
		}
	};

	PD.paperdollPC = async function(canvas)
	{
		if (!V.pc) return null;
		return PD._paperdollRender(canvas, V.pc, {});
	};
})();