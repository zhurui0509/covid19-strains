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
					Strain:s_strain_name,
					Host: s_host,
					Location: s_location,  // mostly in the level of city  
					Sex: s_sex,
					Age: s_age,
					ExposureHistory: s_exposure_history,  // mostly in the level of region

				} = g_row;

				if (s_host){
					let sc1_host = `gisaid-host:${strain_suffix(s_strain_name)}.${s_host}`;

					let hc2_host = {};
					let hc3_row = {
						[sc1_host]: hc2_host, //hc2_strain is defined as empty dic, value will be assigned later? 
					};

					hc2_host['a'] = 'gisaid:Host';
					//let sc1_hosttype = `gisaid-host:Type.${s_host}`;
					let sc1_hosttype = `gisaid:Species.${s_host}`;
					hc2_host['gisaid:hostSpecies'] = sc1_hosttype;


					if(s_sex) {
						// let sc1_hostsex = `gisaid-host:Sex.${s_sex}`;
						let sc1_hostsex = `gisaid:Sex.${s_sex}`;
						hc2_host['gisaid:sex'] = sc1_hostsex;
					}

					if(s_location){
						let sc1_location = `gisaid:City.${place_suffix(s_location)}`;
						// hc2_host['gisaid:hostLocation'] = sc1_location;
						hc2_host['covid19:city'] = sc1_location;

					}

					if(s_age) {
						//let sc1_hostage = `gisaid-host:Age.${s_age}`;
						sc1_hostage = `^gisaid:ageInYears"`+s_age;
						hc2_host['gisaid:age'] = sc1_hostage;
					}
					if(s_exposure_history) {
						let sc1_exposure_history = `gisaid:Region.${place_suffix(s_exposure_history)}`;  // maybe we should use the same predicate as COVID19
						hc2_host['gisaid:exposureHistory'] = sc1_exposure_history;
					}
				

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