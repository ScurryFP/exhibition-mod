/* === Paperdoll subject prelude (before paperdollModel.js) === */
(function()
{
	if (!setup.Paperdoll) setup.Paperdoll = {};

	const PD = setup.Paperdoll;

	PD.getRenderSubject = function()
	{
		return PD._renderSubject || V.pc;
	};

	PD.withRenderSubject = async function(person, fn)
	{
		const prev = PD._renderSubject;
		PD._renderSubject = person;
		try
		{
			return await fn();
		}
		finally
		{
			PD._renderSubject = prev;
		}
	};

	PD._prepareRenderSubject = function(person)
	{
		if (!person) return person;
		if (!person.distinguishing_marks)
			person.distinguishing_marks = [];
		if (!person["hair style"]) person["hair style"] = "unstyled";
		if (!person["hair length"]) person["hair length"] = "shoulder-length";
		if (!person["hair color"]) person["hair color"] = "brown";
		if (!person["skin color"]) person["skin color"] = "beige";
		if (!person["eye color"]) person["eye color"] = "brown";
		if (typeof person.get_clothingItems_classes === "function")
			person.get_clothingItems_classes();
		return person;
	};

	PD._subjectCacheId = function(person)
	{
		if (!person) return "unknown";
		if (person.is_pc || (V.pc && person.equals && person.equals(V.pc))) return "PC";
		return String(person.person || person.name || "subject");
	};
})();