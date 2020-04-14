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
                    Strain: s_strain_name,
                    Country: s_country,
                    AdminDivision: s_admindivision,
                    Location: s_location,
                    Lat: s_lat,
                    Lng: s_lng,
                    Region: s_region,
                } = g_row;
                
                let sc1_strain = `gisaid-strain:${strain_suffix(s_strain_name)}`;
                
                let hc2_strain = {};
                let hc3_row = {
                    [sc1_strain]: hc2_strain, //hc2_strain is defined as empty dic, value will be assigned later? 
                };


                if (s_location){
                    let sc1_location = `covid19-city:${org_suffix(s_location)}`;
                    hc2_strain['covid19:city'] = sc1_location
                }
                else if (s_admindivision){
                    let sc1_region = `covid19-region:${org_suffix(s_admindivision)}`;   
                    hc2_strain['covid19:region'] = sc1_region           
                };


                    // serialize row
                    this.push({
                        type: 'c3',
                        value: hc3_row,
                    });
                
                // done with transform
                fk_transform();
            }

            // flush() {   // what does this flush() do?
            //  geocode(a_affiliations);
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