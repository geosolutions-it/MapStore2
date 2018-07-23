/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const assign = require('object-assign');
const {head, isArray, isString, castArray, isObject} = require('lodash');
const urlUtil = require('url');
const CoordinatesUtils = require('./CoordinatesUtils');
const ConfigUtils = require('./ConfigUtils');
const LayersUtils = require('./LayersUtils');
const WMTSUtils = require('./WMTSUtils');

const WMS = require('../api/WMS');

const getBaseCatalogUrl = (url) => {
    return url && url.replace(/\/csw$/, "/");
};

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
    return SRS.filter(srs => WMTSUtils.getTileMatrixSet(matrixIds, srs, SRS, matrixIds, null));
};

// Try to find thumb from dc documents works both with geonode pycsw and geosolutions-csw
const getThumb = (dc) => {
    let refs = Array.isArray(dc.references) ? dc.references : [dc.references];
    return head([].filter.call( refs, (ref) => {
        return ref.scheme === "WWW:LINK-1.0-http--image-thumbnail" || ref.scheme === "thumbnail" || (ref.scheme === "WWW:DOWNLOAD-1.0-http--download" && (ref.value || "").indexOf(`${dc.identifier || ""}-thumb`) !== -1);
    }));
};

const converters = {
    csw: (records, options) => {
        let result = records;
        // let searchOptions = catalog.searchOptions;
        if (result && result.records) {
            return result.records.map((record) => {
                let dc = record.dc;
                let thumbURL;
                let wms;
                // look in URI objects for wms and thumbnail
                if (dc && dc.URI) {
                    const URI = isArray(dc.URI) ? dc.URI : (dc.URI && [dc.URI] || []);
                    let thumb = head([].filter.call(URI, (uri) => {return uri.name === "thumbnail"; }) );
                    thumbURL = thumb ? thumb.value : null;
                    wms = head([].filter.call(URI, (uri) => { return uri.protocol && (uri.protocol.match(/^OGC:WMS-(.*)-http-get-map/g) || uri.protocol.match(/^OGC:WMS/g)); }));
                }
                // look in references objects
                if (!wms && dc && dc.references && dc.references.length) {
                    let refs = Array.isArray(dc.references) ? dc.references : [dc.references];
                    wms = head([].filter.call(refs, (ref) => { return ref.scheme && (ref.scheme.match(/^OGC:WMS-(.*)-http-get-map/g) || ref.scheme === "OGC:WMS"); }));
                    if (wms) {
                        let urlObj = urlUtil.parse(wms.value, true);
                        let layerName = urlObj.query && urlObj.query.layers || dc.alternative;
                        wms = assign({}, wms, {name: layerName} );
                    }
                }
                if (!thumbURL && dc && dc.references) {
                    let thumb = getThumb(dc);
                    if (thumb) {
                        thumbURL = thumb.value;
                    }
                }

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

                if (wms && wms.name) {
                    let absolute = (wms.value.indexOf("http") === 0);
                    if (!absolute) {
                        assign({}, wms, {value: (options && options.catalogURL || "") + "/" + wms.value} );
                    }
                    let wmsReference = {
                        type: wms.protocol || wms.scheme,
                        url: wms.value,
                        SRS: [],
                        params: {
                            name: wms.name
                        }
                    };
                    references.push(wmsReference);
                }
                if (thumbURL) {
                    let absolute = (thumbURL.indexOf("http") === 0);
                    if (!absolute) {
                        thumbURL = (getBaseCatalogUrl(options && options.url) || "") + thumbURL;
                    }
                }
                // create the references array (now only wms is supported)

                // setup the final record object
                return {
                    title: dc && isString(dc.title) && dc.title || '',
                    description: dc && isString(dc.abstract) && dc.abstract || '',
                    identifier: dc && isString(dc.identifier) && dc.identifier || '',
                    thumbnail: thumbURL,
                    tags: dc && isString(dc.subject) && dc.subject || '',
                    boundingBox: record.boundingBox,
                    references: references
                };
            });
        }
    },
    wms: (records, options = {}) => {
        if (records && records.records) {
            return records.records.map((record) => {
                return {
                title: LayersUtils.getLayerTitleTranslations(record) || record.Name,
                description: record.Abstract || record.Title || record.Name,
                identifier: record.Name,
                tags: "",
                capabilities: record,
                service: records.service,
                boundingBox: WMS.getBBox(record),
                dimensions: (record.Dimension && castArray(record.Dimension) || []).map((dim) => assign({}, {
                    values: dim._ && dim._.split(',') || []
                }, dim.$ || {})),
                references: [{
                    type: "OGC:WMS",
                    url: options && options.url,
                    SRS: (record.SRS && (isArray(record.SRS) ? record.SRS : [record.SRS])) || [],
                    params: {
                        name: record.Name
                    }
                }]
                };
            });
        }
    },
    wmts: (records, options) => {
        if (records && records.records) {
            return records.records.map((record) => {
                const matrixIds = castArray(record.TileMatrixSetLink || []).reduce((previous, current) => {
                    const tileMatrix = head((record.TileMatrixSet || []).filter((matrix) => matrix["ows:Identifier"] === current.TileMatrixSet));
                    const tileMatrixSRS = tileMatrix && CoordinatesUtils.getEPSGCode(tileMatrix["ows:SupportedCRS"]);
                    const levels = current.TileMatrixSetLimits && (current.TileMatrixSetLimits.TileMatrixLimits || []).map((limit) => ({
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
                    })) || tileMatrix.TileMatrix.map((matrix) => ({
                        identifier: matrix["ows:Identifier"]
                    }));
                    return assign(previous, {
                        [tileMatrix["ows:Identifier"]]: levels,
                        [tileMatrixSRS]: levels
                    });
                }, {});

                const bbox = getWMTSBBox(record);
                return {
                title: getNodeText(record["ows:Title"] || record["ows:Identifier"]),
                description: getNodeText(record["ows:Abstract"] || record["ows:Title"] || record["ows:Identifier"]),
                identifier: getNodeText(record["ows:Identifier"]),
                tags: "",
                tileMatrixSet: record.TileMatrixSet,
                matrixIds,
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
                references: [{
                    type: "OGC:WMTS",
                    url: record.GetTileUrl || (options && options.url),
                    SRS: filterOnMatrix(record.SRS || [], matrixIds),
                    params: {
                        name: record["ows:Identifier"]
                    }
                }]
                };
            });
        }
    }
};
const buildSRSMap = (srs) => {
    return srs.filter(s => CoordinatesUtils.isSRSAllowed(s)).reduce((previous, current) => {
        return assign(previous, {[current]: true});
    }, {});
};

const removeParameters = (url, skip) => {
    const urlparts = url.split('?');
    const params = {};
    if (urlparts.length >= 2 && urlparts[1]) {
        const pars = urlparts[1].split(/[&;]/g);
        pars.forEach((par) => {
            const param = par.split('=');
            if (skip.indexOf(param[0].toLowerCase()) === -1) {
                params[param[0]] = param[1];
            }
        });
    }
    return {url: urlparts[0], params};
};
const extractOGCServicesReferences = (record = { references: [] }) => ({
    wms: head(record.references.filter(reference => reference.type && (reference.type === "OGC:WMS"
        || reference.type.indexOf("OGC:WMS") > -1 && reference.type.indexOf("http-get-map") > -1))),
    wmts: head(record.references.filter(reference => reference.type && (reference.type === "OGC:WMTS"
        || reference.type.indexOf("OGC:WMTS") > -1 && reference.type.indexOf("http-get-map") > -1)))
});
const getRecordLinks = (record) => {
    let wmsGetCap = head(record.references.filter(reference => reference.type &&
        reference.type.indexOf("OGC:WMS") > -1 && reference.type.indexOf("http-get-capabilities") > -1));
    let wfsGetCap = head(record.references.filter(reference => reference.type &&
        reference.type.indexOf("OGC:WFS") > -1 && reference.type.indexOf("http-get-capabilities") > -1));
    let wmtsGetCap = head(record.references.filter(reference => reference.type &&
        reference.type.indexOf("OGC:WMTS") > -1 && reference.type.indexOf("http-get-capabilities") > -1));
    let links = [];
    if (wmsGetCap) {
        links.push({
            type: "WMS_GET_CAPABILITIES",
            url: wmsGetCap.url,
            labelId: 'catalog.wmsGetCapLink'
        });
    }
    if (wmtsGetCap) {
        links.push({
            type: "WMTS_GET_CAPABILITIES",
            url: wmtsGetCap.url,
            labelId: 'catalog.wmtsGetCapLink'
        });
    }
    if (wfsGetCap) {
        links.push({
            type: "WFS_GET_CAPABILITIES",
            url: wfsGetCap.url,
            labelId: 'catalog.wfsGetCapLink'
        });
    }
    return links;
};
const CatalogUtils = {
    /**
     * Creates a map of SRS based on the record's srs object
     * @type {String}
     */
    buildSRSMap,
    removeParameters,
    getRecordLinks,
    extractOGCServicesReferences,
    /**
     * Convert a record into a MS2 layer
     * @param  {Object} record            The record
     * @param  {String} [type="wms"]      The layer type
     * @param  {Object} options an object with additinal options.
     *  - `catalogURL` to attach to the layer
     *  - `removeParameters` if you didn't provided an `url` option and you want to use record's one, you can remove some params (typically authkey params) using this.
     *  - `url`, if you already have the correct service URL (typically when you want to use you URL already stripped from some parameters, e.g. authkey params)
     */
    recordToLayer: (record, type = "wms", {removeParams = [], catalogURL, url} = {}) => {
        if (!record || !record.references) {
            // we don't have a valid record so no buttons to add
            return null;
        }
        // let's extract the references we need
        const {wms, wmts} = extractOGCServicesReferences(record);
        const ogcServiceReference = wms || wmts;
        // typically you should remove authkey parameters
        const {url: originalUrl, params} = removeParameters(ConfigUtils.cleanDuplicatedQuestionMarks(ogcServiceReference.url), ["request", "layer", "service", "version"].concat(removeParams));
        const allowedSRS = buildSRSMap(ogcServiceReference.SRS);
        return {
            type: type,
            url: url || originalUrl,
            visibility: true,
            dimensions: record.dimensions || [],
            name: ogcServiceReference.params && ogcServiceReference.params.name,
            title: record.title || ogcServiceReference.params && ogcServiceReference.params.name,
            matrixIds: type === "wmts" ? record.matrixIds || [] : undefined,
            description: record.description || "",
            tileMatrixSet: type === "wmts" ? record.tileMatrixSet || [] : undefined,
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
            catalogURL
        };
    },
    getCatalogRecords: (format, records, options) => {
        return converters[format] && converters[format](records, options) || null;
    }
};
module.exports = CatalogUtils;
