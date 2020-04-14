const stream = require('stream');
const csv_parse = require('csv-parse');

//const geocode = require('../util/geocode.js');
const factory = require('@graphy/core.data.factory');
const ttl_write = require('@graphy/content.ttl.write');

const H_PREFIXES = require('../common/prefixes.js');


let {
	strain_suffix,
	org_suffix,
	person_suffix,
	project_id,
	clade_suffix,
	epiisl_suffix,
} = require('../common/share.js');


{
	//let a_affiliations = [];
	let a_clades =[]

	stream.pipeline(...[
		process.stdin,

		csv_parse({
			delimiter: ';',
			columns: true,
		}),

		new stream.Transform({
			objectMode: true,

			transform(g_row, s_encoding, fk_transform) {
				let {
					Strain: s_strain_name,
					Clade: s_clade,
					gisaid_epi_isl: s_gisaid_epi_isl,
					Host: s_host,
					Location: s_location,  // the location is not clean 
					OriginatingLab: s_originating_lab,
					SubmittingLab: s_submitting_lab,
					CollectionDate: s_collection_date,
					FromLocation: s_from_location,  // location is not a place but a strain
					Author: s_author,
					genbank_accession: s_genbank_accession,
				} = g_row;

				let sc1_strain = `gisaid-strain:${strain_suffix(s_strain_name)}`;

				// //let a_researchers = H_PERSONS[sc1_person];
				let a_strains=[]
				a_strains.push(sc1_strain)

				if(!a_strains) {
					throw new Error(`no strain defined: ${sc1_strain}`);
				}

				for(let sc1_strain of a_strains) {
					let hc2_strain = {};
					let hc3_row = {
						[sc1_strain]: hc2_strain, //hc2_strain is defined as empty dic, value will be assigned later? 
					};

					// hc2_strain = {
					// 	a: 'gisaid:Strain',
					// 	'rdfs:label': '@en"'+s_strain_name,	
					// }

					hc2_strain['a'] = 'gisaid:Strain';
					hc2_strain['rdf:label'] = '@en"'+s_strain_name;

					if(clade_suffix(s_clade)) {
						let sc1_clade = `gisaid-clade:${clade_suffix(s_clade)}`;

						hc2_strain['gisaid:strainClade'] = sc1_clade;


						// hc3_row[sc1_clade] = {
						// 	a: 'gisaid:Clade',
						// 	'gisaid:label': '@en"'+s_clade,
						// };

					}


					if(s_gisaid_epi_isl) {
						let sc1_epi_isl = `gisaid:EPI_ISL.${epiisl_suffix(s_gisaid_epi_isl)}`;
						hc2_strain['gisaid:strainEPIISL'] = sc1_epi_isl;
						// hc3_row[sc1_epi_isl] = {
						// 	a: 'gisaid:EPI_ISL',
						// 	'rdfs:label': '@en"'+s_gisaid_epi_isl,
						// };
					}

					if(s_host) {
						let sc1_host = `gisaid-host:${strain_suffix(s_strain_name)}.${s_host}`;
						let sc1_hosttype = `gisaid-host:Type.${s_host}`;
						hc2_strain['gisaid:strainHost'] = sc1_host;
						// hc3_row[sc1_host] = {
						// 	a: 'gisaid:Host',
						// 	'gisaid:HostType': sc1_hosttype,
						// };
					}

					if(s_originating_lab) {
						let sc1_originating_lab = `gisaid-lab:${org_suffix(s_originating_lab)}`;
						hc2_strain['gisaid:strainOriginatingLab'] = sc1_originating_lab;
						// hc3_row[sc1_originating_lab] = {
						// 	a: 'gisaid:Lab',
						// 	'rdfs:label': '@en"'+s_originating_lab,
						// };
					}

					if(s_submitting_lab) {
						let sc1_submitting_lab = `gisaid-lab:${org_suffix(s_submitting_lab)}`;
						hc2_strain['gisaid:strainSubmittingLab'] = sc1_submitting_lab;
						// hc3_row[sc1_submitting_lab] = {
						// 	a: 'gisaid:Lab',
						// 	'rdfs:label': '@en"'+s_originating_lab,
						// };
					}


					if(s_collection_date) {
						// process the time format:
						let s_date =  new Date(s_collection_date);
						let s_date_formatted = s_date.toISOString();


						let sc1_collection_date = `covid19-instant:${(s_date_formatted)}`;  // used the same namingspace with covid19
						hc2_strain['gisaid:strainCollectedTime'] = sc1_collection_date;
						// hc3_row[sc1_collection_date] = {
						// 	a: 'time:Instant',
						// 	'time:inXSDDate': 'xsd:dateTime'+s_date,
						// };
					}

					if(s_from_location) {

						let sc1_from_location = `gisaid-strain:${strain_suffix(s_from_location)}`;
						hc2_strain['gisaid:strainFrom'] = sc1_from_location;

					    // shall we include the code below?
					 //    hc3_row[sc1_from_location] = {
						// 	a: 'gisaid:Strain',
						// 	'rdfs:label': '@en"'+s_from_location,	
						// };
					}

					
					if(s_author) {
						let sc1_author = `gisaid-author:${org_suffix(s_author)}`;
						hc2_strain['gisaid:strainAuthor'] = sc1_author;

						// hc3_row[sc1_author] = {
						// 	a: 'gisaid:Author',
						// 	'rdfs:label': '@en"'+s_author,
						// };
					}


					if(s_genbank_accession) {
						let sc1_genbank_accession = `gisaid-genbankAccession:${s_genbank_accession}`;
						hc2_strain['gisaid:strainGenbankAccession'] = sc1_genbank_accession;
						// hc3_row[sc1_genbank_accession] = {
						// 	a: 'gisaid:GenbankAccession',
						// 	'rdfs:label': '@en"'+s_genbank_accession,
						// };
					}


					// serialize row
					this.push({
						type: 'c3',
						value: hc3_row,
					});
				}

				// done with transform
				fk_transform();
			},

			// flush() {   // what does this flush() do?
			// 	geocode(a_affiliations);
			// },
		}),

		ttl_write({
			prefixes: H_PREFIXES,
		}),

		process.stdout,
	], (e_pipeline) => {
		throw e_pipeline;
	});
}