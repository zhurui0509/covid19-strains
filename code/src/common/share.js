
const strain_suffix = s_strain => s_strain.replace(/\//g, '_');

const org_suffix = s_org => s_org.trim().replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '_').replace(/ /g, '_').replace(/\;/g, '.');
const person_suffix = s_full_name => s_full_name.replace(/ /g, '_');

const clade_suffix = s_clade => s_clade.replace("null", '');  //have to check how to represent None in JS
const epiisl_suffix = s_gisaid_epi_isl => s_gisaid_epi_isl.replace(/EPI_ISL_/g, '');

const place_suffix = s_location => s_location.replace(/ /g, '_')

const project_id = p => /AWD_ID=(.*)$/.exec(p)[1];

module.exports = {
	strain_suffix,
	org_suffix,
	person_suffix,
	project_id,
	clade_suffix,
	epiisl_suffix,
	place_suffix,
};
