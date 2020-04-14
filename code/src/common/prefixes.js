const P_NAMESPACE = 'https://stko-gisaid.geog.ucsb.edu/lod/';
const gisaid = a_ns => a_ns.reduce((h_out, s_ns) => ({
	...h_out,
	[`gisaid-${s_ns}`]: `${P_NAMESPACE}${s_ns}/`,
}), {});


const P_NAMESPACE2 = 'https://covid.geog.ucsb.edu/lod/';
const covid19 = a_ns => a_ns.reduce((h_out, s_ns) => ({
	...h_out,
	[`covid19-${s_ns}`]: `${P_NAMESPACE2}${s_ns}/`,
}), {});

module.exports = {
	rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
	rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
	xsd: 'http://www.w3.org/2001/XMLSchema#',
	owl: 'http://www.w3.org/2002/07/owl#',
	dct: 'http://purl.org/dc/terms/',
	foaf: 'http://xmlns.com/foaf/0.1/',
	time: 'http://www.w3.org/2006/time#',
	timezone: 'https://www.timeanddate.com/worldclock/results.html?query=',
	geosparql: 'http://www.opengis.net/ont/geosparql#',
	gisaid: `${P_NAMESPACE}ontology/`,
	...gisaid([
		'strain',
		'host',
		'author',
		'lab',
		'genbankAccession',
	//	'instant',
		'clade',
	]),	

	covid19: `${P_NAMESPACE2}ontology/`,
	...covid19([
		'instant',
		'city',
		'region',
	]),	

	geo: 'http://www.w3.org/2003/01/geo/wgs84_pos#',
};
