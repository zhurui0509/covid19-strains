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
			delimiter: ',',
			columns: true,
		}),

		new stream.Transform({
			objectMode: true,

			transform(g_row, s_encoding, fk_transform) {
				let {
					Author: s_author
				} = g_row;

				if (s_author){
					let sc1_author = `gisaid-author:${org_suffix(s_author)}`;

					let hc2_author = {};
					let hc3_row = {
						[sc1_author]: hc2_author, //hc2_strain is defined as empty dic, value will be assigned later? 
					};

					hc2_author['a'] = 'gisaid:Author';
					hc2_author['rdfs:label'] = '@en"'+s_author;

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