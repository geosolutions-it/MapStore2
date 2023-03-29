/**
 * Copyright 2012, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { getConfigProp, cleanDuplicatedQuestionMarks } from '../../utils/ConfigUtils';
import { castArray, isObject, isArray, isNil } from 'lodash';
import { getEPSGCode } from '../../utils/CoordinatesUtils';

import {
    getTileMatrixSet,
    getGetTileURL,
    getCapabilitiesURL,
    parseTileMatrixSetOption
} from '../../utils/WMTSUtils';

import {
    extractOGCServicesReferences,
    toURLArray,
    removeParameters,
    buildSRSMap,
    getRecordLinks
} from '../../utils/CatalogUtils';
import {
    validate as commonValidate,
    testService as commonTestService,
    preprocess as commonPreprocess
} from './common';
import WMTS from '../WMTS';

const getWMTSBBox = (record) => {
    let layer = record;
    let bbox = (layer["ows:WGS84BoundingBox"]);
    if (!bbox) {
        bbox = {
            "ows:LowerCorner": "-180.0 -90.0",
            "ows:UpperCorner": "180.0 90.0"
        };
    }
    return bbox;
};

const getNodeText = (node) => {
    return isObject(node) && node._ || node;
};

const filterOnMatrix = (SRS, matrixIds) => {
    return SRS.filter(srs => getTileMatrixSet(matrixIds, srs, SRS, matrixIds, null));
};

const recordToLayer = (record, {
    removeParams = [],
    service,
    catalogURL,
    url,
    layerBaseConfig
} = {}) => {
    if (!record || !record.references) {
        // we don't have a valid record so no buttons to add
        return null;
    }
    // let's extract the references we need
    const { wmts: ogcServiceReference } = extractOGCServicesReferences(record);

    // typically you should remove authkey parameters
    const cleanURL = URL => removeParameters(cleanDuplicatedQuestionMarks(URL), ["request", "layer", "layers", "service", "version"].concat(removeParams));
    let originalUrl;
    let params;
    const urls = toURLArray(ogcServiceReference.url);

    // extract additional parameters and alternative URLs.
    if (urls && isArray(urls)) {
        originalUrl = urls.map( u => cleanURL(u)).map( ({url: u}) => u);
        params = urls.map(u => cleanURL(u)).map(({params: p}) => p).reduce( (prev, cur) => ({...prev, ...cur}), {});
    } else {
        const { url: uu, params: pp } = cleanURL(urls || catalogURL);
        originalUrl = uu;
        params = pp;
    }

    // calculate and normalize URL
    // if array of 1 element, take simply the string
    const toLayerURL = u => isArray(u) && u.length === 1 ? u[0] : u;
    const layerURL = toLayerURL(url || originalUrl);

    const {
        format: serviceFormat,
        localizedLayerStyles
    } = service || {};

    const allowedSRS = buildSRSMap(ogcServiceReference.SRS);
    const defaultFormat = record.format || serviceFormat;
    const format = record.formats
        ? record.formats.find(value => value === defaultFormat) || record.format
        : defaultFormat;

    return {
        type: 'wmts',
        requestEncoding: record.requestEncoding, // WMTS KVP vs REST, KVP by default
        style: record.style,
        format,
        url: layerURL,
        capabilitiesURL: record.capabilitiesURL,
        queryable: record.queryable,
        visibility: true,
        dimensions: record.dimensions || [],
        name: ogcServiceReference.params && ogcServiceReference.params.name,
        title: record.title || ogcServiceReference.params && ogcServiceReference.params.name,
        description: record.description || "",
        availableTileMatrixSets: record.availableTileMatrixSets || [],
        credits: !getConfigProp("noCreditsFromCatalog") && record.credits,
        bbox: {
            crs: record.boundingBox.crs,
            bounds: {
                minx: record.boundingBox.extent[0],
                miny: record.boundingBox.extent[1],
                maxx: record.boundingBox.extent[2],
                maxy: record.boundingBox.extent[3]
            }
        },
        links: getRecordLinks(record),
        params: params,
        allowedSRS: allowedSRS,
        catalogURL,
        ...layerBaseConfig,
        ...record.layerOptions,
        localizedLayerStyles: !isNil(localizedLayerStyles) ? localizedLayerStyles : undefined
    };
};

export const textSearch = WMTS.textSearch;
export const preprocess = commonPreprocess;
export const validate = commonValidate;
export const testService = commonTestService({ parseUrl: WMTS.parseUrl });
export const getCatalogRecords = (records, options) => {
    if (records && records.records) {
        return records.records.map((record) => {
            let urls = castArray(getGetTileURL(record) || (options && options.url));
            if (urls.length === 1) {
                urls = urls[0];
            }

            const capabilitiesURL = getCapabilitiesURL(record);
            const availableTileMatrixSets = castArray(record?.TileMatrixSetLink || [])
                .reduce((acc, tileMatrixSetLink) => {
                    const tileMatrix = castArray(record?.TileMatrixSet || [])
                        .find((matrix) => matrix['ows:Identifier'] === tileMatrixSetLink.TileMatrixSet);
                    const tileMatrixSRS = tileMatrix && getEPSGCode(tileMatrix['ows:SupportedCRS']);
                    const limits = tileMatrixSetLink?.TileMatrixSetLimits
                        ? castArray(tileMatrixSetLink?.TileMatrixSetLimits?.TileMatrixLimits || [])
                            .map((limit) => ({
                                identifier: limit.TileMatrix,
                                ranges: {
                                    cols: {
                                        min: limit.MinTileCol,
                                        max: limit.MaxTileCol
                                    },
                                    rows: {
                                        min: limit.MinTileRow,
                                        max: limit.MaxTileRow
                                    }
                                }
                            }))
                        : null;
                    return {
                        ...acc,
                        [tileMatrix['ows:Identifier']]: {
                            crs: tileMatrixSRS,
                            ...(limits && { limits }),
                            tileMatrixSet: tileMatrix
                        }
                    };
                }, {});

            const { matrixIds } = parseTileMatrixSetOption({ availableTileMatrixSets });

            const bbox = getWMTSBBox(record);
            const references = [{
                type: "OGC:WMTS",
                url: urls,
                SRS: filterOnMatrix(record.SRS || [], matrixIds),
                params: {
                    name: record["ows:Identifier"]
                }
            }];
            const { wmts: ogcReferences } = extractOGCServicesReferences({ references });
            return {
                serviceType: 'wmts',
                isValid: !!ogcReferences,
                title: getNodeText(record["ows:Title"] || record["ows:Identifier"]),
                description: getNodeText(record["ows:Abstract"] || record["ows:Title"] || record["ows:Identifier"]),
                identifier: getNodeText(record["ows:Identifier"]),
                tags: "",
                layerOptions: options && options.layerOptions || {},
                style: record.style,
                capabilitiesURL: capabilitiesURL,
                queryable: record.queryable,
                requestEncoding: record.requestEncoding,
                availableTileMatrixSets,
                format: record.format,
                formats: record.formats,
                TileMatrixSetLink: castArray(record.TileMatrixSetLink),
                boundingBox: {
                    extent: [
                        bbox["ows:LowerCorner"].split(" ")[0],
                        bbox["ows:LowerCorner"].split(" ")[1],
                        bbox["ows:UpperCorner"].split(" ")[0],
                        bbox["ows:UpperCorner"].split(" ")[1]
                    ],
                    crs: "EPSG:4326"
                },
                references,
                ogcReferences
            };
        });
    }
    return null;
};
export const getLayerFromRecord = (record, options, asPromise) => {
    const layer = recordToLayer(record, options);
    return asPromise ? Promise.resolve(layer) : layer;
};
