const fs = require('fs');
const request = require('request');
const json_stream = require('JSONStream');
const async = require('async');
const ttl_write = require('@graphy/content.ttl.write');
const progress = require('progress');

const H_PREFIXES = require('../common/prefixes.js');

let a_google_api_keys = [
	'AIzaSyDfteA9rGCCD6N0y-7wnbcUEkXto7ZKVpk',
	'AIzaSyA1dDxTo3thzfFFlJ4Zv1rAQrwodo81sZM',
	'AIzaSyBhM9NcREwK9mEfYdgJXYTitw9ge7D2ENY',
	'AIzaSyCJlZPwnVBfPZEaeSrITMoHAIKg4aVIwXo',
	'AIzaSyCVBC-zJw04HohUo3aA3ilsiaMX3VBIo_o',
];


let nl_keys = a_google_api_keys.length;
let c_requests = 0;
let y_bar;

let h_cache = {
	hits: 0,
	miss: 0,
};

let h_locs = {};

let ds_geocode = ttl_write({
	prefixes: H_PREFIXES,
});

const H_COMPONENT_TYPES = {
	country: 'country',
	postal_code: 'postalCode',
	administrative_area_level_1: 'region',
	administrative_area_level_2: 'zone',
	postal_town: 'city',
	locality: 'city',
};

const serialize = (s_input, a_subjects, a_results, fk_serialize) => {
	if(!a_results.length) return fk_serialize();

	let g_res = a_results[0];
	let g_loc = g_res.geometry && g_res.geometry.location;

	let sc1_geometry = `spex:Geometry.PlaceID:${g_res.place_id}`;  // uuid_v4().replace(/-/g, '_')
	let sc1_output = `spex:GeocodedLocation.PlaceID:${g_res.place_id}`;

	let hc2_output = {
		a: 'spex:GeocodedLocation',
		'ageo:geometry': sc1_geometry,
	};

	let a_components = g_res.address_components;
	for(let g_component of a_components) {
		let s_lead_type = g_component.types[0];
		if(s_lead_type in H_COMPONENT_TYPES) {
			hc2_output[`spex-geocode:${H_COMPONENT_TYPES[s_lead_type]}`] = '@en"'+g_component.long_name;
		}
	}

	ds_geocode.write({
		type: 'c3',
		value: {
			[sc1_geometry]: {
				a: 'ageom:Point',
				'geosparql:asWKT': `^geosparql:wktLiteral"<http://www.opengis.net/def/crs/EPSG/0/4326>POINT(${g_loc.lng} ${g_loc.lat})`,
			},
			[sc1_output]: hc2_output,
			...a_subjects.reduce((h_out, p_subject) => ({
				...h_out,
				[`>${p_subject}`]: {
					'spex:geocodingOutput': sc1_output,
				},
			}), {}),
		},
	});

	h_cache.hits += 1;
	y_bar.tick(h_cache);
	fk_serialize();
};

let y_queue = async.queue((g_task, fk_task) => {
	let s_input = g_task.input;

	// input already cached
	if(h_locs[s_input]) {
		return serialize(s_input, g_task.subjects, h_locs[s_input], fk_task);
	}

	// next api key
	let s_api_key = a_google_api_keys[(c_requests++)%nl_keys];

	// make geocoding request
	request('https://maps.googleapis.com/maps/api/geocode/json', {
		json: true,
		qs: {
			address: s_input,
			key: s_api_key,
		},
	}, (e_req, d_res, g_body) => {
		if(e_req) {
			console.warn(`\nquery timeout for ${s_api_key}; burning key`);

			// remove key semi-permanently
			a_google_api_keys.splice(a_google_api_keys.indexOf(s_api_key), 1);
			nl_keys = a_google_api_keys.length;

			// wait 2 seconds
			setTimeout(() => {
				// push task back onto queue
				y_queue.push(g_task);

				// resolve
				fk_task();
			}, 2000);

			// exit sync
			return;
		}

		if('OK' !== g_body.status) {
			if('OVER_QUERY_LIMIT' === g_body.status) {
				console.warn(`\nover query limit ${s_api_key}`);

				// remove key temporarily
				a_google_api_keys.splice(a_google_api_keys.indexOf(s_api_key), 1);
				nl_keys = a_google_api_keys.length;

				// wait 2 seconds
				setTimeout(() => {
					// push task back onto queue
					y_queue.push(g_task);

					// restore key
					a_google_api_keys.push(s_api_key);
					nl_keys = a_google_api_keys.length;

					// resolve
					fk_task();
				}, 2000);

				// exit sync
				return;
			}

			// progress
			h_cache.miss += 1;
			y_bar.tick(h_cache);

			if('ZERO_RESULTS' === g_body.status) {
				ds_geocode.write({
					type: 'c3',
					value: g_task.subjects.reduce((h_out, p_subject) => ({
						...h_out,
						[`>${p_subject}`]: {
							'spex:geocodingOutput': 'spex:NoResult',
						},
					}), {}),
				});
				return fk_task();
			}
			else {
				debugger;
				console.warn('\n'+g_body);
				return fk_task();
			}
		}

		let a_results = g_body.results;

		serialize(s_input, g_task.subjects, a_results, fk_task);
	});
}, a_google_api_keys.length*2);


y_bar = {
	tick() {},
};

ds_geocode.pipe(fs.createWriteStream('', {
	fd: 3,
}));


module.exports = function geocode(a_tasks) {
	for(let g_task of a_tasks) {
		y_queue.push(g_task);
	}
};
