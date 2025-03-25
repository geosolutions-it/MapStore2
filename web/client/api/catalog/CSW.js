/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { head, isString, includes, castArray, sortBy, uniq, isEmpty } from 'lodash';
import { getLayerFromRecord as getLayerFromWMSRecord } from './WMS';
import { getMessageById } from '../../utils/LocaleUtils';
import { transformExtentToObj} from '../../utils/CoordinatesUtils';
import { extractEsriReferences, extractOGCServicesReferences } from '../../utils/CatalogUtils';
import CSW, { getLayerReferenceFromDc } from '../CSW';
import {
    validate as commonValidate,
    testService as commonTestService,
    preprocess as commonPreprocess
} from './common';
import { THREE_D_TILES } from '../ThreeDTiles';
import { MODEL } from '../Model';
const getBaseCatalogUrl = (url) => {
    return url && url.replace(/\/csw$/, "/");
};

// Try to find thumb from dc documents works both with geonode pycsw and geosolutions-csw
const getThumb = (dc) => head(castArray(dc.references).filter((ref) => {
    return ref.scheme === "WWW:LINK-1.0-http--image-thumbnail" || ref.scheme === "thumbnail" || (ref.scheme === "WWW:DOWNLOAD-1.0-http--download" && (ref.value || "").indexOf(`${dc.identifier || ""}-thumb`) !== -1) || (ref.scheme === "WWW:DOWNLOAD-REST_MAP" && (ref.value || "").indexOf(`${dc.identifier || ""}-thumb`) !== -1);
}));

const getMetaDataDownloadFormat = (protocol) => {
    const formatsMap = [
        {
            protocol: 'https://registry.geodati.gov.it/metadata-codelist/ProtocolValue/www-download',
            displayValue: 'Download'
        },
        {
            protocol: 'http://www.opengis.net/def/serviceType/ogc/wms',
            displayValue: 'WMS'
        },
        {
            protocol: 'http://www.opengis.net/def/serviceType/ogc/wfs',
            displayValue: 'WFS'
        }
    ];
    return head(formatsMap.filter(item => item.protocol === protocol))?.displayValue ?? "Link";
};

const getURILinks = (metadata, locales, uriItem) => {
    let itemName = uriItem.name;
    if (itemName === undefined) {
        itemName = metadata.title ? metadata.title.join(' ') : getMessageById(locales, "catalog.notAvailable");
        const downloadFormat = getMetaDataDownloadFormat(uriItem.protocol, uriItem.value);
        itemName = `${downloadFormat ? `${itemName} - ${downloadFormat}` : itemName}`;
    }
    return (`<li><a target="_blank" href="${uriItem.value}">${itemName}</a></li>`);
};

const esriToLayer = (record, { layerBaseConfig = {} } = {}) => {
    if (!record || !record.references) {
        // we don't have a valid record so no buttons to add
        return null;
    }
    // let's extract the references we need
    const {esri} = extractEsriReferences(record);
    return {
        type: esri.type,
        url: esri.url,
        visibility: true,
        dimensions: record.dimensions || [],
        name: esri.params && esri.params.name,
        bbox: {
            crs: record.boundingBox.crs,
            bounds: {
                minx: record.boundingBox.extent[0],
                miny: record.boundingBox.extent[1],
                maxx: record.boundingBox.extent[2],
                maxy: record.boundingBox.extent[3]
            }
        },
        ...layerBaseConfig
    };

};

function getThumbnailFromDc(dc, options) {
    const URI = dc?.URI && castArray(dc.URI);
    let thumbURL;
    if (URI) {
        const thumb = head(URI.filter(uri => uri.name === 'thumbnail')) || head(URI.filter(uri => !uri.name && uri.protocol?.indexOf('image/') > -1));
        thumbURL = thumb ? thumb.value : null;
    }
    if (!thumbURL && dc && dc.references) {
        const thumb = getThumb(dc);
        if (thumb) {
            thumbURL = thumb.value;
        }
    }
    if (thumbURL) {
        const absolute = (thumbURL.indexOf("http") === 0);
        if (!absolute) {
            thumbURL = (getBaseCatalogUrl(options && options.url) || "") + thumbURL;
        }
    }
    return thumbURL;
}

/**
 * Extract bounding box object from the record
 * @param {Object} record from OGC service
 */
function getBoundingBox(record) {
    if (isEmpty(record.boundingBox?.crs) || isEmpty(record.boundingBox?.extent)) {
        return null;
    }
    return {
        crs: record.boundingBox?.crs,
        bounds: transformExtentToObj(record.boundingBox?.extent)
    };
}
function getCatalogRecord3DTiles(record, metadata) {
    const dc = record.dc;
    // dc?.URI can be an array
    let dcURIs = castArray(dc?.URI);
    const firstValidURI = dcURIs?.find(uri => uri?.value?.endsWith('.json'));
    const url = firstValidURI?.value || "";
    return {
        serviceType: '3dtiles',
        isValid: true,
        description: dc && isString(dc.abstract) && dc.abstract || '',
        title: dc && isString(dc.title) && dc.title || '',
        identifier: dc && isString(dc.identifier) && dc.identifier || '',
        url,
        thumbnail: null,
        bbox: getBoundingBox(record),
        format: dc && dc.format || "",
        references: [],
        catalogType: 'csw',
        metadata
    };
}

const recordToLayer = (record, options) => {
    switch (record.layerType) {
    case 'wms':
        return getLayerFromWMSRecord(record, options);
    case 'esri':
        return esriToLayer(record, options);
    default:
        return null;
    }
};
const ADDITIONAL_OGC_SERVICES = ['wfs']; // Add services when support is provided
const getAdditionalOGCService = (record, references, parsedReferences = {}) => {
    const hasAdditionalService = ADDITIONAL_OGC_SERVICES.some(serviceType => !isEmpty(parsedReferences[serviceType]));
    if (hasAdditionalService) {
        return {
            additionalOGCServices: {
                ...ADDITIONAL_OGC_SERVICES
                    .map(serviceType => {
                        const ogcReferences = parsedReferences[serviceType] ?? {};
                        const {url, params: {name} = {}} = ogcReferences;
                        return {[serviceType]: {
                            url, name, references, ogcReferences, fetchCapabilities: true,
                            boundingBox: getBoundingBox(record)
                        }};
                    })
                    .flat()
                    .reduce((a, c) => ({...c, ...a}), {})
            }
        };
    }
    return null;
};

export const preprocess = commonPreprocess;
export const validate = commonValidate;
export const testService = commonTestService({ parseUrl: CSW.parseUrl });
export const textSearch = CSW.textSearch;
export const getCatalogRecords = (records, options, locales) => {
    let result = records;
    // let searchOptions = catalog.searchOptions;
    if (result && result.records) {
        return result.records.map((record) => {
            const dc = record.dc;
            let references = [];

            // extract get capabilities references and add them to the final references
            if (dc && dc.references) {
                // make sure we have an array of references
                let rawReferences = Array.isArray(dc.references) ? dc.references : [dc.references];
                rawReferences.filter((reference) => {
                    // filter all references that correspond to a get capabilities reference
                    return reference.scheme.indexOf("http-get-capabilities") > -1;
                }).forEach((reference) => {
                    // a get capabilities reference should be absolute and filter by the layer name
                    let referenceUrl = reference.value.indexOf("http") === 0 ? reference.value
                        : (options && options.catalogURL || "") + "/" + reference.value;
                    // add the references to the final list
                    references.push({
                        type: reference.scheme,
                        url: referenceUrl
                    });
                });
            }

            const layerReferences = ['wms', ...ADDITIONAL_OGC_SERVICES].map(serviceType => {
                return getLayerReferenceFromDc(dc, {...options, type: serviceType});
            }).filter(ref => ref);
            if (!isEmpty(layerReferences)) {
                references = references.concat(layerReferences);
            }

            // create the references array (now only wms is supported)
            let metadata = {boundingBox: record.boundingBox && record.boundingBox.extent && castArray(record.boundingBox.extent.join(","))};
            if (dc) {
                // parsing all it comes from the csw service
                metadata = {...metadata, ...sortBy(Object.keys(dc)).reduce((p, c) => ({...p, [c]: uniq(castArray(dc[c]))}), {})};
            }
            // parsing URI
            if (dc && dc.URI && castArray(dc.URI) && castArray(dc.URI).length) {
                metadata = {...metadata, uri: ["<ul>" + castArray(dc.URI).map(getURILinks.bind(this, metadata, locales)).join("") + "</ul>"]};
            }
            if (dc && dc.subject && castArray(dc.subject) && castArray(dc.subject).length) {
                metadata = {...metadata, subject: ["<ul>" + castArray(dc.subject).map(s => `<li>${s}</li>`).join("") + "</ul>"]};
            }
            if (references && castArray(references).length ) {
                metadata = {...metadata, references: ["<ul>" + castArray(references).map(ref => `<li><a target="_blank" href="${ref.url}">${ref.params && ref.params.name || ref.url}</a></li>`).join("") + "</ul>"]
                };
            } else {
                // in order to use a default value
                // we need to not push undefined/empty matadata
                delete metadata.references;
            }

            if (dc && dc.temporal) {
                let elements = isString(dc.temporal) ? dc.temporal.split("; ") : [];
                if (elements.length) {
                    // finding scheme or using default
                    let scheme = elements.filter(e => e.indexOf("scheme=") !== -1).map(e => {
                        const equalIndex = e.indexOf("=");
                        const value = e.substr(equalIndex + 1, e.length - 1);
                        return value;
                    });
                    scheme = scheme.length ? scheme[0] : "W3C-DTF";
                    let temporal = elements
                        .filter(e => e.indexOf("start=") !== -1 || e.indexOf("end=") !== -1)
                        .map(e => {
                            const equalIndex = e.indexOf("=");
                            const prop = e.substr(0, equalIndex);
                            const value = e.substr(equalIndex + 1, e.length - 1);
                            const isOnlyDateFormat = e.length - equalIndex - 1 <= 10;
                            if (includes(["start", "end"], prop) && scheme === "W3C-DTF" && !isOnlyDateFormat) {
                                return getMessageById(locales, `catalog.${prop}`) + new Date(value).toLocaleString();
                            }
                            if (includes(["start", "end"], prop)) {
                                return getMessageById(locales, `catalog.${prop}`) + value;
                            }
                            return "";
                        });
                    metadata = {...metadata, temporal: ["<ul>" + temporal.map(date => `<li>${date}</li>`).join("") + "</ul>"]};
                }
            }

            const parsedReferences = {
                ...extractOGCServicesReferences({ references }),
                ...extractEsriReferences({ references })
            };

            let catRecord;
            if (dc && dc.format === THREE_D_TILES) {
                catRecord = getCatalogRecord3DTiles(record, metadata);
            } else if (dc && dc.format === MODEL) {
                // todo: handle get catalog record for ifc
            } else {
                const layerType = Object.keys(parsedReferences).filter(key => !ADDITIONAL_OGC_SERVICES.includes(key)).find(key => parsedReferences[key]);
                const ogcReferences = layerType && layerType !== 'esri'
                    ? parsedReferences[layerType]
                    : undefined;
                catRecord = {
                    serviceType: 'csw',
                    layerType,
                    isValid: !!layerType,
                    boundingBox: record.boundingBox,
                    description: dc && isString(dc.abstract) && dc.abstract || '',
                    layerOptions: options && options.layerOptions || {},
                    identifier: dc && isString(dc.identifier) && dc.identifier || '',
                    references: references,
                    thumbnail: getThumbnailFromDc(dc, options),
                    title: dc && isString(dc.title) && dc.title || '',
                    tags: dc && dc.tags || '',
                    metadata,
                    capabilities: record.capabilities,
                    ogcReferences,
                    ...getAdditionalOGCService(record, references, parsedReferences)
                };
            }
            return catRecord;
        });
    }
    return null;
};

export const getLayerFromRecord = (record, options, asPromise) => {
    const layer = recordToLayer(record, options);
    return asPromise ? Promise.resolve(layer) : layer;
};
