/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import assign from 'object-assign';

import {
    head,
    isArray,
    isString,
    castArray,
    isObject,
    sortBy,
    uniq,
    includes,
    get,
    isNil,
    isEmpty
} from 'lodash';

import urlUtil from 'url';
import CoordinatesUtils from './CoordinatesUtils';
import ConfigUtils from './ConfigUtils';
import {getLayerTitleTranslations} from './LayersUtils';
import {getMessageById} from './LocaleUtils';
import * as WMTSUtils from './WMTSUtils';
import { cleanAuthParamsFromURL } from './SecurityUtils';
import WMS from '../api/WMS';
import { getAvailableInfoFormat } from "./MapInfoUtils";

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
        return ref.scheme === "WWW:LINK-1.0-http--image-thumbnail" || ref.scheme === "thumbnail" || (ref.scheme === "WWW:DOWNLOAD-1.0-http--download" && (ref.value || "").indexOf(`${dc.identifier || ""}-thumb`) !== -1) || (ref.scheme === "WWW:DOWNLOAD-REST_MAP" && (ref.value || "").indexOf(`${dc.identifier || ""}-thumb`) !== -1);
    }));
};

const converters = {
    csw: (records, options, locales = {}) => {
        let result = records;
        // let searchOptions = catalog.searchOptions;
        if (result && result.records) {
            return result.records.map((record) => {
                let dc = record.dc;
                let thumbURL;
                let wms;
                let esri;
                // look in URI objects for wms and thumbnail
                if (dc && dc.URI) {
                    const URI = isArray(dc.URI) ? dc.URI : (dc.URI && [dc.URI] || []);
                    let thumb = head([].filter.call(URI, (uri) => {return uri.name === "thumbnail"; }) ) || head([].filter.call(URI, (uri) => !uri.name && uri.protocol?.indexOf('image/') > -1));
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
                }// checks for esri arcgis in geonode csw
                if (!wms && dc && dc.references && dc.references.length) {
                    let refs = Array.isArray(dc.references) ? dc.references : [dc.references];
                    esri = head([].filter.call(refs, (ref) => { return ref.scheme && ref.scheme === "WWW:DOWNLOAD-REST_MAP"; }));
                    if (esri) {
                        let layerName = dc.alternative;
                        esri = assign({}, esri, {name: layerName} );
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
                if (esri && esri.name) {
                    let esriReference = {
                        type: 'arcgis',
                        url: esri.value,
                        SRS: [],
                        params: {
                            name: esri.name
                        }
                    };
                    references.push(esriReference);
                }

                if (thumbURL) {
                    let absolute = (thumbURL.indexOf("http") === 0);
                    if (!absolute) {
                        thumbURL = (getBaseCatalogUrl(options && options.url) || "") + thumbURL;
                    }
                }
                // create the references array (now only wms is supported)
                let metadata = {boundingBox: record.boundingBox && record.boundingBox.extent && castArray(record.boundingBox.extent.join(","))};
                if (dc) {
                    // parsing all it comes from the csw service
                    metadata = {...metadata, ...sortBy(Object.keys(dc)).reduce((p, c) => ({...p, [c]: uniq(castArray(dc[c]))}), {})};
                }
                // parsing URI
                if (dc && dc.URI && castArray(dc.URI) && castArray(dc.URI).length) {
                    metadata = {...metadata, uri: ["<ul>" + castArray(dc.URI).map(u => `<li><a target="_blank" href="${u.value}">${u.name}</a></li>`).join("") + "</ul>"]};
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
                    let elements = dc.temporal.split("; ");
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
                // setup the final record object
                return {
                    boundingBox: record.boundingBox,
                    description: dc && isString(dc.abstract) && dc.abstract || '',
                    layerOptions: options && options.layerOptions || {},
                    identifier: dc && isString(dc.identifier) && dc.identifier || '',
                    references: references,
                    thumbnail: thumbURL,
                    title: dc && isString(dc.title) && dc.title || '',
                    tags: dc && dc.tags || '',
                    metadata
                };
            });
        }
        return null;
    },
    wms: (records, options = {}) => {
        if (records && records.records) {
            return records.records.map((record) => {
                return {
                    capabilities: record,
                    credits: record.credits,
                    boundingBox: WMS.getBBox(record),
                    description: record.Abstract || record.Title || record.Name,
                    identifier: record.Name,
                    service: records.service,
                    tags: "",
                    layerOptions: {
                        ...(options?.layerOptions || {}),
                        ...(records?.layerOptions || {})
                    },
                    title: getLayerTitleTranslations(record) || record.Name,
                    formats: castArray(record.formats || []),
                    dimensions: (record.Dimension && castArray(record.Dimension) || []).map((dim) => assign({}, {
                        values: dim._ && dim._.split(',') || []
                    }, dim.$ || {}))
                    // TODO: re-enable when support to inline values is full (now timeline miss snap, auto-select and forward-backward buttons enabled/disabled for this kind of values)
                    // TODO: replace with capabilities URL service. something like this:
                        /*
                        .map(dim => dim && dim.name !== "time" ? dim : {
                            ...dim,
                            values: undefined, <-- remove values (they can be removed from dimension's epic instead, using them as initial value)
                            source: { <-- add the source
                                type: "wms-capabilities",
                                url: options.url
                            }
                        })
                        */
                        // excludes time from dimensions. TODO: remove when time from WMS capabilities is supported
                        .filter(dim => dim && dim.name !== "time"),

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
        return null;
    },
    wmts: (records, options) => {
        if (records && records.records) {
            return records.records.map((record) => {
                let urls = castArray(WMTSUtils.getGetTileURL(record) || (options && options.url));
                if (urls.length === 1) {
                    urls = urls[0];
                }
                const capabilitiesURL = WMTSUtils.getCapabilitiesURL(record);
                const matrixIds = castArray(record.TileMatrixSetLink || []).reduce((previous, current) => {
                    const tileMatrix = head((record.TileMatrixSet && castArray(record.TileMatrixSet) || []).filter((matrix) => matrix["ows:Identifier"] === current.TileMatrixSet));
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
                    layerOptions: options && options.layerOptions || {},
                    style: record.style,
                    capabilitiesURL: capabilitiesURL,
                    queryable: record.queryable,
                    requestEncoding: record.requestEncoding,
                    tileMatrixSet: record.TileMatrixSet,
                    matrixIds,
                    format: record.format,
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
                        url: urls,
                        SRS: filterOnMatrix(record.SRS || [], matrixIds),
                        params: {
                            name: record["ows:Identifier"]
                        }
                    }]
                };
            });
        }
        return null;
    },
    tms: (data, options = {}) => {
        if (data && data.records) {
            const isTMS100 = options.service && options.service.provider === "tms";
            if (isTMS100) {
                return data.records.map(record => ({
                    title: record.title,
                    tileMapUrl: record.href,
                    description: `${record.srs}${record.format ? ", " + record.format : ""}`,
                    tmsUrl: options.tmsUrl,
                    references: [{
                        type: "OGC:TMS",
                        version: "1.0.0",
                        url: options.url
                    }]
                }));
            }
            // custom or static tile provider
            return data.records.map(record => {
                return {
                    title: record.title || record.provider,
                    url: record.url,
                    attribution: record.attribution,
                    options: record.options,
                    provider: record.provider, // "ProviderName.VariantName"
                    type: "tileprovider",
                    references: []
                };
            });
        }
        return null;
    },
    wfs: ({records} = {}) => {
        if (records) {
            return records.map(r => ({
                ...r,
                references: [{
                    type: "OGC:WFS-1.1.0-http-get-capabilities",
                    url: r.url
                },
                {
                    type: "OGC:WFS-1.1.0-http-get-feature",
                    url: r.url
                }]
            }));
        }
        return null;
    },
    backgrounds: (records) => {
        if (records && records.records) {
            return records.records.map(record => {
                return {
                    description: record.title,
                    title: record.title,
                    identifier: record.name,
                    thumbnail: record.thumbURL,
                    references: [],
                    background: record
                };
            });
        }
        return null;
    }
};
export const buildSRSMap = (srs) => {
    return srs.filter(s => CoordinatesUtils.isSRSAllowed(s)).reduce((previous, current) => {
        return assign(previous, {[current]: true});
    }, {});
};

export const removeParameters = (url, skip) => {
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
export const extractOGCServicesReferences = ({ references = [] } = {}) => ({
    wfs: head(references.filter(reference => reference.type && (reference.type === "OGC:WFS"
        || reference.type.indexOf("OGC:WFS") > -1 && reference.type.indexOf("http-get-feature") > -1))),
    wms: head(references.filter(reference => reference.type && (reference.type === "OGC:WMS"
        || reference.type.indexOf("OGC:WMS") > -1 && reference.type.indexOf("http-get-map") > -1))),
    wmts: head(references.filter(reference => reference.type && (reference.type === "OGC:WMTS"
        || reference.type.indexOf("OGC:WMTS") > -1 && reference.type.indexOf("http-get-map") > -1))),
    tms: head(references.filter(reference => reference.type && (reference.type === "OGC:TMS"
        || reference.type.indexOf("OGC:TMS") > -1)))
});
export const extractEsriReferences = (record = { references: [] }) => ({
    esri: head(record.references.filter(reference => reference.type && (reference.type === "ESRI:SERVER"
        || reference.type === "arcgis" )))
});
export const getRecordLinks = ({ references = [] } = {}) => {
    let wmsGetCap = head(references.filter(reference => reference.type &&
        reference.type.indexOf("OGC:WMS") > -1 && reference.type.indexOf("http-get-capabilities") > -1));
    let wfsGetCap = head(references.filter(reference => reference.type &&
        reference.type.indexOf("OGC:WFS") > -1 && reference.type.indexOf("http-get-capabilities") > -1));
    let wmtsGetCap = head(references.filter(reference => reference.type &&
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

const toURLArray = (url) => {
    if (url && !isArray(url) && url.indexOf(",") !== -1) {
        return url.split(',').map(u => u.trim());
    }
    return url;
};


/**
 * Creates a map of SRS based on the record's srs object
 * @type {String}
 */
/**
 * Convert a record into a MS2 layer
 * @param  {Object} record            The record
 * @param  {String} [type="wms"]      The layer type
 * @param  {Object} options an object with additional options.
 *  - `catalogURL` to attach to the layer
 *  - `removeParameters` if you didn't provided an `url` option and you want to use record's one, you can remove some params (typically authkey params) using this.
 *  - `url`, if you already have the correct service URL (typically when you want to use you URL already stripped from some parameters, e.g. authkey params)
 */
export const recordToLayer = (record, type = "wms", {removeParams = [], format, catalogURL, url, formats = {}} = {}, baseConfig = {}, localizedLayerStyles) => {
    if (!record || !record.references) {
        // we don't have a valid record so no buttons to add
        return null;
    }
    // let's extract the references we need
    const {wms, wmts} = extractOGCServicesReferences(record);
    const ogcServiceReference = wms || wmts;

    // typically you should remove authkey parameters
    const cleanURL = URL => removeParameters(ConfigUtils.cleanDuplicatedQuestionMarks(URL), ["request", "layer", "layers", "service", "version"].concat(removeParams));
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

    const allowedSRS = buildSRSMap(ogcServiceReference.SRS);
    return {
        type: type,
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
        matrixIds: type === "wmts" ? record.matrixIds || [] : undefined,
        description: record.description || "",
        tileMatrixSet: type === "wmts" ? record.tileMatrixSet || [] : undefined,
        credits: !ConfigUtils.getConfigProp("noCreditsFromCatalog") && record.credits,
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
        ...baseConfig,
        ...record.layerOptions,
        localizedLayerStyles: !isNil(localizedLayerStyles) ? localizedLayerStyles : undefined,
        ...(type === 'wms' && !isEmpty(formats) && {imageFormats: formats.imageFormats, infoFormats: formats.infoFormats})
    };
};
export const getCatalogRecords = (format, records, options, locales) => {
    return converters[format] && converters[format](records, options, locales) || null;
};
export const esriToLayer = (record, baseConfig = {}) => {
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
        ...baseConfig
    };

};
/**
 * tmsToLayer convert Catalog record into a TMS layer for MapStore.
 * @param {object} record the catalog record
 * @param object TileMapService a JSON representation of TileMapService resource, see https://wiki.osgeo.org/wiki/Tile_Map_Service_Specification
 * @param service the original catalog service
 */
export const tmsToLayer = ({ tileMapUrl }, { TileMap = {} }, { forceDefaultTileGrid }) => {
    const { Title, Abstract, SRS, BoundingBox = {}, Origin, TileFormat = {}, TileSets } = TileMap;
    const { version, tilemapservice } = TileMap.$;
    const { minx, miny, maxx, maxy } = get(BoundingBox, '$', {});
    const {x, y} = get(Origin, "$");
    const { width: tileWidth, height: tileHeight, "mime-type": format, extension} = get(TileFormat, "$", {});
    const tileSize = [parseFloat(tileWidth), parseFloat(tileHeight, 10)];
    const tileSets = castArray(get(TileSets, "TileSet", []).map(({ $ }) => $)).map(({ href, order, "units-per-pixel": resolution}) => ({
        href: cleanAuthParamsFromURL(href),
        order: parseFloat(order),
        resolution: parseFloat(resolution)
    }));
    const profile = get(TileSets, "profile");
    return {
        title: Title,
        visibility: true,
        hideErrors: true, // TMS can rise a lot of errors of tile not found
        name: Title,
        allowedSRS: {[SRS]: true},
        description: Abstract,
        srs: SRS,
        version,
        tileMapService: tilemapservice ? cleanAuthParamsFromURL(tilemapservice) : undefined,
        type: 'tms',
        profile,
        tileMapUrl,
        // option to force to use the TileGrid of the projection, instead of the one provided by the service. Userful for some GeoServer instances that use default GridSet but provide wrong origin and resolution
        forceDefaultTileGrid,
        bbox: BoundingBox && {crs: SRS, bounds: {minx: parseFloat(minx), miny: parseFloat(miny), maxx: parseFloat(maxx), maxy: parseFloat(maxy)}},
        tileSets,
        origin: {x: parseFloat(x), y: parseFloat(y)},
        format,
        tileSize,
        extension
    };
};
export const wfsToLayer = (record) => {
    const DEFAULT_VECTOR_STYLE = {
        "weight": 1,
        "color": "rgba(0, 0, 255, 1)",
        "opacity": 1,
        "fillColor": "rgba(0, 0, 255, 0.1)",
        "fillOpacity": 0.1,
        radius: 10
    };
    return {
        type: record.type || "wfs",
        search: {
            url: record.url,
            type: "wfs"
        },
        url: record.url,
        queryable: record.queryable,
        visibility: true,
        name: record.name,
        title: record.title || record.name,
        description: record.description || "",
        bbox: record.boundingBox,
        links: getRecordLinks(record),
        style: DEFAULT_VECTOR_STYLE,
        ...record.layerOptions
    };
};

/**
 * Converts a record into a layer
 */
export const tileProviderToLayer = (record) => {
    return {
        type: "tileprovider",
        visibility: true,
        url: record.url,
        title: record.title,
        attribution: record.attribution,
        options: record.options,
        provider: record.provider, // "ProviderName.VariantName"
        name: record.provider
    };
};

export const DEFAULT_FORMAT_WMS = [{
    label: 'image/png',
    value: 'image/png'
}, {
    label: 'image/png8',
    value: 'image/png8'
}, {
    label: 'image/jpeg',
    value: 'image/jpeg'
}, {
    label: 'image/vnd.jpeg-png',
    value: 'image/vnd.jpeg-png'
}, {
    label: 'image/vnd.jpeg-png8',
    value: 'image/vnd.jpeg-png8'
}, {
    label: 'image/gif',
    value: 'image/gif'
}];

/**
 * Get unique array of supported info formats
 * @return {array} info formats
 */
export const getUniqueInfoFormats = () => {
    return uniq(Object.values(getAvailableInfoFormat()));
};

/**
 * Fetch the supported formats of the WMS service
 * @param url
 * @param includeGFIFormats
 * @return {object|string} formats
 */
export const getSupportedFormat = (url, includeGFIFormats = false) => {
    return WMS.getCapabilities(url).then((caps) => {
        let getMapFormats = get(caps, 'capability.request.getMap.format', []);
        let imageFormats;
        if (!isEmpty(getMapFormats)) {
            const defaultFormats = DEFAULT_FORMAT_WMS.map(({value}) => value);
            getMapFormats = getMapFormats.map(({value})=> ({label: value, value}));
            imageFormats = getMapFormats.filter(({value})=> includes(defaultFormats, value)) || [];
        } else {
            imageFormats = DEFAULT_FORMAT_WMS;
        }

        let infoFormats;
        if (includeGFIFormats) {
            let getFeatureInfoFormats = get(caps, 'capability.request.getFeatureInfo.format', []);
            const defaultFormats = getUniqueInfoFormats();
            if (!isEmpty(getFeatureInfoFormats)) {
                getFeatureInfoFormats = getFeatureInfoFormats.map(({value})=> value);
                infoFormats = uniq(getFeatureInfoFormats.filter((value)=> includes(defaultFormats, value))) || [];
            } else {
                infoFormats = defaultFormats;
            }
        }
        return includeGFIFormats ? {imageFormats, infoFormats} : imageFormats;
    }).catch(()=>
        // Fallback to default formats on exception
        includeGFIFormats ? {imageFormats: DEFAULT_FORMAT_WMS, infoFormats: getUniqueInfoFormats()} : DEFAULT_FORMAT_WMS);
};
