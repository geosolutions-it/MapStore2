/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

// revise_me, simplified moved everything to ./catalog. use for utils.
import axios from '../libs/ajax';
import { reprojectBbox } from '../utils/CoordinatesUtils';


// revise_me - Surely use a different approach to caching.
let _cache = {};

export const getLayerMetadata = (layerUrl, layerName) => {
    return axios.get(`${layerUrl}/${layerName}`, { params: { f: 'json' }}).then(({data}) => data);
};

export const searchAndPaginate = (records, params) => {
    const { startPosition, maxRecords, text } = params;
    const filteredLayers = records?.filter(layer => !text || layer?.name.toLowerCase().indexOf(text.toLowerCase()) !== -1);
    return {
        numberOfRecordsMatched: filteredLayers.length,
        numberOfRecordsReturned: Math.min(maxRecords, filteredLayers.length),
        records: filteredLayers.filter((layer, index) => index >= startPosition - 1 && index < startPosition - 1 + maxRecords)
    };
};

const getData = (url, params = {}) => {
    const request = _cache[url]
        ? () => Promise.resolve(_cache[url])
        : () => axios.get(url, {
            params: {
                f: 'json'
                // add bounding box
            }
        }).then(({ data }) => {
            _cache[url] = data;
            return data;
        });
    return request()
        .then((data) => {
            // console.log(data);
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

            /* {
                     "currentVersion": 10.04,
                     "serviceDescription": "Carta IGM scala 25.000",
                     "mapName": "Layers",
                     "description": "",
                     "copyrightText": "",
                     "layers": [],
                     "tables": [],
                     "spatialReference": {"wkid": 32633},
                     "singleFusedMapCache": true,
                     "tileInfo": {
                      "rows": 512,
                      "cols": 512,
                      "dpi": 96,
                      "format": "PNG24",
                      "compressionQuality": 0,
                      "origin": {
                       "x": -5120900,
                       "y": 9998100
                      },
                      "spatialReference": {"wkid": 32633},
                      "lods": [
                       {
                        "level": 0,
                        "resolution": 1587.50317500635,
                        "scale": 6000000
                       },
                       {
                        "level": 1,
                        "resolution": 793.751587503175,
                        "scale": 3000000
                       },
                       {
                        "level": 2,
                        "resolution": 264.583862501058,
                        "scale": 1000000
                       },
                       {
                        "level": 3,
                        "resolution": 132.291931250529,
                        "scale": 500000
                       },
                       {
                        "level": 4,
                        "resolution": 66.1459656252646,
                        "scale": 250000
                       },
                       {
                        "level": 5,
                        "resolution": 26.4583862501058,
                        "scale": 100000
                       },
                       {
                        "level": 6,
                        "resolution": 19.8437896875794,
                        "scale": 75000
                       },
                       {
                        "level": 7,
                        "resolution": 13.2291931250529,
                        "scale": 50000
                       },
                       {
                        "level": 8,
                        "resolution": 10.5833545000423,
                        "scale": 40000
                       },
                       {
                        "level": 9,
                        "resolution": 6.61459656252646,
                        "scale": 25000
                       },
                       {
                        "level": 10,
                        "resolution": 5.29167725002117,
                        "scale": 20000
                       },
                       {
                        "level": 11,
                        "resolution": 3.96875793751588,
                        "scale": 15000
                       },
                       {
                        "level": 12,
                        "resolution": 2.64583862501058,
                        "scale": 10000
                       },
                       {
                        "level": 13,
                        "resolution": 1.98437896875794,
                        "scale": 7500
                       },
                       {
                        "level": 14,
                        "resolution": 1.32291931250529,
                        "scale": 5000
                       },
                       {
                        "level": 15,
                        "resolution": 1.05833545000423,
                        "scale": 4000
                       },
                       {
                        "level": 16,
                        "resolution": 0.793751587503175,
                        "scale": 3000
                       },
                       {
                        "level": 17,
                        "resolution": 0.529167725002117,
                        "scale": 2000
                       }
                      ]
                     },
                     "initialExtent": {
                      "xmin": -967483.1867719172,
                      "ymin": 3851943.6690355986,
                      "xmax": 1566171.8805382177,
                      "ymax": 5340227.895604052,
                      "spatialReference": {"wkid": 32633}
                     },
                     "fullExtent": {
                      "xmin": -5682838.576370971,
                      "ymin": -495950.6507318651,
                      "xmax": 6682839.531886056,
                      "ymax": 1.0414963676800095E7,
                      "spatialReference": {"wkid": 32633}
                     },
                     "units": "esriMeters",
                     "supportedImageFormatTypes": "PNG24,PNG,JPG,DIB,TIFF,EMF,PS,PDF,GIF,SVG,SVGZ,AI,BMP",
                     "documentInfo": {
                      "Title": "IGM_25000",
                      "Author": "agserver",
                      "Comments": "",
                      "Subject": "",
                      "Category": "",
                      "Keywords": "",
                      "Credits": ""
                     },
                     "capabilities": "Map"
                    }
                    */

            // The issue with the raster set above is that we should disable identify feature for it.
            // One way to distinguish the data is by checking capabilities property and passing that info to the record.
            // Afterwards, if the query capability property is absent on the layer identify features will not be available.

            // initial extent refers to the default viewable area when you open a map or scene, largely irrelevant for our case.
            // Full Extent represents the entire spatial extent covered by all features in all layers. By default it auto updates when these assets are changed.
            // Generate bbox from fullExtent.
            // spatial reference can either be a well known id (wkid) or well known text (wkt)

            // Modify the next line to allow raster sets where layers property is empty.
            const records = (data?.layers || []).map((layer) => {
                // const { version, bbox, format, properties } = record;
                const { xmin, ymin, xmax, ymax, spatialReference } = data?.fullExtent;
                return {
                    ...layer,
                    url,
                    version: data?.currentVersion,
                    // map.getView().getProjection().getCode() is one way to get current projection.
                    // where to get map object from?
                    // revise_me hardcoded destination srs, bbox is null
                    // learn how to convert wkid and what proj4js demands.
                    bbox: reprojectBbox([xmin, ymin, xmax, ymax], String(spatialReference?.wkid), 'EPSG:4326'),
                    // revise_me format should eventually default to a single thing.
                    format: data.supportedImageFormatTypes,
                    properties: {
                        // this is the place to add all the data we would need further on.
                        capabilities: data.capabilities
                    }
                };
            });
            return searchAndPaginate(records, params);
        });
};

export const getCapabilities = (url, startPosition, maxRecords, text, info) => {
    // Geoportale Nazionale ArcGIS open access server found at url:
    // http://www.pcn.minambiente.it/arcgis/rest/services

    // FEMA hazard public arcgis services found at:
    // https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer
    // https://hazards.fema.gov/arcgis/rest/services/Studies/StudiesTracking/MapServer
    // https://hazards.fema.gov/arcgis/rest/services/AFHI/Draft_FIRM_DB/MapServer
    // https://hazards.fema.gov/arcgis/rest/services/CSLF/Prelim_CSLF/MapServer

    // use for testing, good service, sample layer url
    // http://www.pcn.minambiente.it/arcgis/rest/services/ADB/MapServer
    // https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/NFHL Availability
    return getData(url, { startPosition, maxRecords, text, info })
        .then(({ numberOfRecordsMatched, numberOfRecordsReturned, records }) => {
            // do Post Processing here. revise and slowly re-add the previous mess.
            return { numberOfRecordsMatched, numberOfRecordsReturned, records };
        });
};
