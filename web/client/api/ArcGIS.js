/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

// revise_me, simplified moved everything to ./catalog. use for utils.
import axios from '../libs/ajax';


// revise_me - Surely use a different approach to caching.
let _cache = {};
const getData = (url, params = {}) => {
    const request = _cache[url]
        ? () => Promise.resolve(_cache[url])
        : () => axios.get(url, {
            params: {
                f: 'pjson',
                ...params
            }
        }).then(({ data }) => {
            _cache[url] = data;
            return data;
        });
    return request()
        .then((data) => {
            console.log(data);
            /*
            // Data Example
            {
                "currentVersion": 10.04,
                "serviceDescription": "Autorità di Bacino",
                "mapName": "Layers",
                "description": "",
                "copyrightText": "",
                "layers": [
                 {
                  "id": 0,
                  "name": "Autorità di Bacino",
                  "parentLayerId": -1,
                  "defaultVisibility": true,
                  "subLayerIds": null,
                  "minScale": 0,
                  "maxScale": 0
                 }
                ],
                "tables": [],
                "spatialReference": {"wkid": 32633},
                "singleFusedMapCache": false,
                "initialExtent": {
                 "xmin": -478226.0219813172,
                 "ymin": 4112562.4580201367,
                 "xmax": 1030097.3592465072,
                 "ymax": 5064611.79901279,
                 "spatialReference": {"wkid": 32633}
                },
                "fullExtent": {
                 "xmin": -267537.52989849926,
                 "ymin": 3927027.24159838,
                 "xmax": 819408.8671156233,
                 "ymax": 5250147.015366322,
                 "spatialReference": {"wkid": 32633}
                },
                "units": "esriMeters",
                "supportedImageFormatTypes": "PNG32,PNG24,PNG,JPG,DIB,TIFF,EMF,PS,PDF,GIF,SVG,SVGZ,BMP",
                "documentInfo": {
                 "Title": "ADB",
                 "Author": "paci",
                 "Comments": "",
                 "Subject": "",
                 "Category": "",
                 "Keywords": "",
                 "AntialiasingMode": "None",
                 "TextAntialiasingMode": "Force"
                },
                "capabilities": "Map,Query,Data"
                }
                */

            const records = (data?.layers || []).map((layer) => {
                return {
                    ...layer,
                    url
                };
            });
            return {
                // remove these properties on the return object
                // getData should only return pure data
                // separate search functionality from the fetch (hook into fetch)
                // search functionality should return number of records
                numberOfRecordsMatched: data?.layers?.length || 0,
                numberOfRecordsReturned: data?.layers?.length,
                records
            };
        });
};

export const getCapabilities = (url) => {
    // Geoportale Nazionale ArcGIS open access server found at url:
    // http://www.pcn.minambiente.it/arcgis/rest/services
    // https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer
    // https://hazards.fema.gov/arcgis/rest/services/Studies/StudiesTracking/MapServer
    // https://hazards.fema.gov/arcgis/rest/services/AFHI/Draft_FIRM_DB/MapServer
    // https://hazards.fema.gov/arcgis/rest/services/CSLF/Prelim_CSLF/MapServer

    // use for testing, good service, sample layer url
    // http://www.pcn.minambiente.it/arcgis/rest/services/ADB/MapServer
    // https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/NFHL Availability
    return getData(url)
        .then(({ numberOfRecordsMatched, numberOfRecordsReturned, records }) => {
            // do Post Processing here. revise and slowly re-add the previous mess.
            return { numberOfRecordsMatched, numberOfRecordsReturned, records};
        });
};
