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
	place_suffix,
} = require('../common/share.js');


{
	//let a_affiliations = [];

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
					genbank_accession: s_genbank_accession
				} = g_row;

				if (s_genbank_accession){
					let sc1_genbank = `gisaid-genbankAccession:${s_genbank_accession}`;

					let hc2_genbank = {};
					let hc3_row = {
						[sc1_genbank]: hc2_genbank, //hc2_strain is defined as empty dic, value will be assigned later? 
					};

					hc2_genbank['a'] = 'gisaid:GenbankAccession';
					hc2_genbank['rdfs:label'] = '@en"'+s_genbank_accession;

				    // serialize row
					this.push({
						type: 'c3',
						value: hc3_row,
					});
				}
				

				// done with transform
				fk_transform();
			}

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