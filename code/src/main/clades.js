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
					Clade: s_clade
				} = g_row;

				if (s_clade){
					let sc1_clade = `gisaid-clade:${clade_suffix(s_clade)}`;

					let hc2_clade = {};
					let hc3_row = {
						[sc1_clade]: hc2_clade, //hc2_strain is defined as empty dic, value will be assigned later? 
					};

					hc2_clade['a'] = 'gisaid:Clade';
					hc2_clade['rdfs:label'] = '@en"'+s_clade
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