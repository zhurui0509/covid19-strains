
const info = (s_ppl) => {
	let a_ppl = s_ppl.trim().replace(/\.\s*$/, '').split(/\s*\|\s*/g);

	// let a_last = a_ppl.pop().split(/(^|\s+)and\s+/);

	// a_ppl.push(...a_last);

	let a_persons = [];

	for(let s_person of a_ppl) {
		let m_person = /^\s*(?:\*([^([@<]*?)\*|([^([@<]*?))\s*(?:<([^>]*?)>)?\s*(?:\[([^\]]*?)\])?\s*$/.exec(s_person);
		if(!m_person) {
			throw new Error(`failed to parse person from "${s_person}"`);
		}

		let [, s_presenter, s_name, p_uri, s_affiliations] = m_person;

		let g_person = {
			presenter: false,
		};

		if(s_presenter) {
			g_person.presenter = true;
			s_name = s_presenter;
		}

		g_person.name = s_name;

		// same as uri
		if(p_uri) g_person.uri = p_uri;

		let a_names = s_name.split(/\s+/g);
		if(a_names.length < 2) {
			throw new Error(`invalid name "${s_name}"`);
		}
		// simple
		else if(2 === a_names.length) {
			[g_person.first, g_person.last] = a_names;
		}
		// middle initial
		else if(/^.\.$/.test(a_names[1])) {
			g_person.first = a_names[0]+' '+a_names[1];
			g_person.last = a_names.slice(2).join(' ');
		}
		// last-name prefix
		else if(/^(d[eiu])$/i.test(a_names[1])) {
			g_person.first = a_names[0];
			g_person.last = a_names.slice(2).join(' ');
		}
		// inherit to first name
		else {
			g_person.first = a_names[0]+' '+a_names[1];
			g_person.last = a_names.slice(2).join(' ');
		}

		// affiliation
		if(s_affiliations && s_affiliations.length) {
			let a_affiliations = s_affiliations.split(/,\s+and\s+/g);

			if(a_affiliations.length) g_person.affiliations = a_affiliations;
		}

		a_persons.push(g_person);
	}

	return a_persons;
};

module.exports = {
	info,
};
