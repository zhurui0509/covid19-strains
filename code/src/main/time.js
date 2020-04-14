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
					CollectionDate: s_collection_date
				} = g_row;

				if (s_collection_date){
						let s_date =  new Date(s_collection_date);
						let s_date_formatted = s_date.toISOString();
					

						let sc1_collection_date = `covid19-instant:${(s_date_formatted)}`;  // used the same namingspace with covid19
					
						let hc2_date = {};
						let hc3_row = {
							[sc1_collection_date]: hc2_date, //hc2_strain is defined as empty dic, value will be assigned later? 
						};

						hc2_date['a'] = 'covid19:Instant';
						//hc2_date['time:inXSDDateTime'] = 'xsd:dateTime'+s_date_formatted;
						hc2_date['time:inXSDDateTime'] = `^xsd:dateTime"`+s_date_formatted;


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