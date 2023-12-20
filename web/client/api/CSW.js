/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import urlUtil from 'url';

import { get, head, last, template, isNil, castArray, isEmpty } from 'lodash';
import assign from 'object-assign';

import axios from '../libs/ajax';
import { cleanDuplicatedQuestionMarks } from '../utils/ConfigUtils';
import { extractCrsFromURN, makeBboxFromOWS, makeNumericEPSG, getExtentFromNormalized } from '../utils/CoordinatesUtils';
import WMS from "../api/WMS";
import { THREE_D_TILES, getCapabilities } from './ThreeDTiles';

const parseUrl = (url) => {
    const parsed = urlUtil.parse(url, true);
    return urlUtil.format(assign({}, parsed, { search: null }, {
        query: assign({
            service: "CSW",
            version: "2.0.2"
        }, parsed.query, { request: undefined })
    }));
};

const defaultStaticFilter =
    `<ogc:Or>
            <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>dc:type</ogc:PropertyName>
                <ogc:Literal>dataset</ogc:Literal>
            </ogc:PropertyIsEqualTo>
            <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>dc:type</ogc:PropertyName>
                <ogc:Literal>http://purl.org/dc/dcmitype/Dataset</ogc:Literal>
            </ogc:PropertyIsEqualTo>
       </ogc:Or>`;

const defaultDynamicFilter = "<ogc:PropertyIsLike wildCard='%' singleChar='_' escapeChar='\\'>" +
    "<ogc:PropertyName>csw:AnyText</ogc:PropertyName> " +
    "<ogc:Literal>%${searchText}%</ogc:Literal> " +
    "</ogc:PropertyIsLike> ";

export const cswGetRecordsXml = '<csw:GetRecords xmlns:csw="http://www.opengis.net/cat/csw/2.0.2" ' +
    'xmlns:ogc="http://www.opengis.net/ogc" ' +
    'xmlns:gml="http://www.opengis.net/gml" ' +
    'xmlns:dc="http://purl.org/dc/elements/1.1/" ' +
    'xmlns:dct="http://purl.org/dc/terms/" ' +
    'xmlns:gmd="http://www.isotc211.org/2005/gmd" ' +
    'xmlns:gco="http://www.isotc211.org/2005/gco" ' +
    'xmlns:gmi="http://www.isotc211.org/2005/gmi" ' +
    'xmlns:ows="http://www.opengis.net/ows" service="CSW" version="2.0.2" resultType="results" startPosition="${startPosition}" maxRecords="${maxRecords}"> ' +
    '<csw:Query typeNames="csw:Record"> ' +
    '<csw:ElementSetName>full</csw:ElementSetName> ' +
    '<csw:Constraint version="1.1.0"> ' +
    '<ogc:Filter> ' +
    '${filterXml} ' +
    '</ogc:Filter> ' +
    '</csw:Constraint> ' +
    '</csw:Query> ' +
    '</csw:GetRecords>';

/**
 * Construct XML body to get records from the CSW service
 * @param {object} [options] the options to pass to withIntersectionObserver enhancer.
 * @param {number} startPosition
 * @param {number} maxRecords
 * @param {string} searchText
 * @param {object} filter object holds static and dynamic filter configured for the CSW service
 * @param {object} filter.staticFilter filter to fetch all record applied always i.e even when no search text is present
 * @param {object} filter.dynamicFilter filter when search text is present and is applied in conjunction with static filter
 * @return {string} constructed xml string
 */
export const constructXMLBody = (startPosition, maxRecords, searchText, { filter } = {}) => {
    const staticFilter = filter?.staticFilter || defaultStaticFilter;
    const dynamicFilter = `<ogc:And>
        ${template(filter?.dynamicFilter || defaultDynamicFilter)({ searchText })}
        ${staticFilter}
    </ogc:And>`;
    return template(cswGetRecordsXml)({ filterXml: !searchText ? staticFilter : dynamicFilter, startPosition, maxRecords });
};

// Extract the relevant information from the wms URL for (RNDT / INSPIRE)
const extractWMSParamsFromURL = wms => {
    const lowerCaseParams = new Map(Array.from(new URLSearchParams(wms.value)).map(([key, value]) => [key.toLowerCase(), value]));
    const layerName = lowerCaseParams.get('layers');
    const wmsVersion = lowerCaseParams.get('version');
    if (layerName) {
        return {
            ...wms,
            protocol: 'OGC:WMS',
            name: layerName,
            value: `${wms.value.match(/[^\?]+[\?]+/g)}SERVICE=WMS${wmsVersion && `&VERSION=${wmsVersion}`}`
        };
    }
    return false;
};

const toReference = (layerType, data, options) => {
    if (!data.name) {
        return null;
    }
    switch (layerType) {
    case 'wms':
        const urlValue = !(data.value.indexOf("http") === 0)
            ? (options && options.catalogURL || "") + "/" + data.value
            : data.value;
        return {
            type: data.protocol || data.scheme,
            url: urlValue,
            SRS: [],
            params: {
                name: data.name
            }
        };
    case 'arcgis':
        return {
            type: 'arcgis',
            url: data.value,
            SRS: [],
            params: {
                name: data.name
            }
        };
    default:
        return null;
    }
};

const REGEX_WMS_EXPLICIT = [/^OGC:WMS-(.*)-http-get-map/g, /^OGC:WMS/g];
const REGEX_WMS_EXTRACT = /serviceType\/ogc\/wms/g;
const REGEX_WMS_ALL = REGEX_WMS_EXPLICIT.concat(REGEX_WMS_EXTRACT);

export const getLayerReferenceFromDc = (dc, options, checkEsri = true) => {
    const URI = dc?.URI && castArray(dc.URI);
    // look in URI objects for wms and thumbnail
    if (URI) {
        const wms = head(URI.map(uri => {
            if (uri.protocol) {
                if (REGEX_WMS_EXPLICIT.some(regex => uri.protocol.match(regex))) {
                    /** wms protocol params are explicitly defined as attributes (INSPIRE)*/
                    return uri;
                }
                if (uri.protocol.match(REGEX_WMS_EXTRACT)) {
                    /** wms protocol params must be extracted from the element text (RNDT / INSPIRE) */
                    return extractWMSParamsFromURL(uri);
                }
            }
            return false;
        }).filter(item => item));
        if (wms) {
            return toReference('wms', wms, options);
        }
    }
    // look in references objects
    if (dc?.references?.length) {
        const refs = castArray(dc.references);
        const wms = head(refs.filter((ref) => { return ref.scheme && REGEX_WMS_EXPLICIT.some(regex => ref.scheme.match(regex)); }));
        if (wms) {
            let urlObj = urlUtil.parse(wms.value, true);
            let layerName = urlObj.query && urlObj.query.layers || dc.alternative;
            return toReference('wms', { ...wms, name: layerName }, options);
        }
        if (checkEsri) {
            // checks for esri arcgis in geonode csw
            const esri = head(refs.filter((ref) => {
                return ref.scheme && ref.scheme === "WWW:DOWNLOAD-REST_MAP";
            }));
            if (esri) {
                return toReference('arcgis', { ...esri, name: dc.alternative }, options);
            }
        }
    }
    return null;
};

let capabilitiesCache = {};

/**
 * Add capabilities data to CSW records
 * if corresponding capability flag is enabled and WMS url is found
 * Currently limited to only scale denominators (visibility limits)
 * @param {object[]} _dcRef dc.reference or dc.URI
 * @param {object} result csw results object
 * @param {object} options csw service options
 * @return {object} csw records
 */
const addCapabilitiesToRecords = (_dcRef, result, options) => {
    // Currently, visibility limits is the only capability info added to the records
    // hence `autoSetVisibilityLimits` flag is used to determine if `getCapabilities` is required
    // This should be modified when additional capability info is required
    const invokeCapabilities = get(options, "options.service.autoSetVisibilityLimits", false);

    if (!invokeCapabilities) {
        return result;
    }
    const { value: _url } = _dcRef?.find(t =>
        REGEX_WMS_ALL.some(regex => t?.scheme?.match(regex) || t?.protocol?.match(regex))) || {}; // Get WMS URL from references
    const [parsedUrl] = _url && _url.split('?') || [];
    if (!parsedUrl) return { ...result }; // Return record when no url found

    const cached = capabilitiesCache[parsedUrl];
    const isCached = !isEmpty(cached);
    return Promise.resolve(
        isCached
            ? cached
            : WMS.getCapabilities(parsedUrl + '?version=')
                .then((caps) => WMS.flatLayers(caps.Capability))
                .catch(() => []))
        .then((layers) => {
            if (!isCached) {
                capabilitiesCache[parsedUrl] = layers;
            }
            // Add visibility limits scale data of the layer to the record
            return {
                ...result,
                records: result?.records?.map(record => {
                    const name = get(getLayerReferenceFromDc(record?.dc, null, false), 'params.name', '');
                    const {
                        MinScaleDenominator,
                        MaxScaleDenominator
                    } = layers.find(l => l.Name === name) || {};
                    return {
                        ...record,
                        ...((!isNil(MinScaleDenominator) || !isNil(MaxScaleDenominator))
                            && { capabilities: { MaxScaleDenominator, MinScaleDenominator } })
                    };
                })
            };
        });
};
/**
 * handle getting bbox from capabilities in case of 3D tile layer for CSW records
 * @param {object} result csw results object
 * @return {object} csw records
 */
const getBboxFor3DLayersToRecords = async(result)=> {
    if (!result) return result;
    let { records } = result;
    if (records?.length) {
        let records3DPromisesForCapabilities = records.map((rec)=>{
            if (rec?.dc?.format === THREE_D_TILES) {
                let tilesetJsonURL = rec.dc?.URI?.value;
                return getCapabilities(tilesetJsonURL);
            }
            return Promise.resolve(null);
        });
        let allPromises = await Promise.all(records3DPromisesForCapabilities);

        const newRecords = records.map(
            (record, idx) => {
                const capabilityResult = allPromises[idx];
                if (!capabilityResult || !capabilityResult?.bbox?.bounds || !capabilityResult?.bbox?.crs) {
                    return record;
                }
                let bbox = getExtentFromNormalized(capabilityResult.bbox.bounds, capabilityResult.bbox.crs);
                return {
                    ...record,
                    boundingBox: {
                        extent: bbox.extent,
                        crs: capabilityResult.bbox.crs
                    }
                };
            });
        return {
            ...result,
            records: newRecords
        };
    }
    return result;
};
/**
 * API for local config
 */
const Api = {
    parseUrl,
    getRecordById: function(catalogURL) {
        return new Promise((resolve) => {
            require.ensure(['../utils/ogc/CSW'], () => {
                resolve(axios.get(catalogURL)
                    .then((response) => {
                        if (response) {
                            const { unmarshaller } = require('../utils/ogc/CSW');
                            const json = unmarshaller.unmarshalString(response.data);
                            if (json && json.name && json.name.localPart === "GetRecordByIdResponse" && json.value && json.value.abstractRecord) {
                                let dcElement = json.value.abstractRecord[0].value.dcElement;
                                if (dcElement) {
                                    let dc = {
                                        references: []
                                    };
                                    for (let j = 0; j < dcElement.length; j++) {
                                        let dcel = dcElement[j];
                                        let elName = dcel.name.localPart;
                                        let finalEl = {};
                                        /* Some services (e.g. GeoServer) support http://schemas.opengis.net/csw/2.0.2/record.xsd only
                                        * Usually they publish the WMS URL at dct:"references" with scheme=OGC:WMS
                                        * So we place references as they are.
                                        */
                                        if (elName === "references" && dcel.value) {
                                            let urlString = dcel.value.content && cleanDuplicatedQuestionMarks(dcel.value.content[0]) || dcel.value.content || dcel.value;
                                            finalEl = {
                                                value: urlString,
                                                scheme: dcel.value.scheme
                                            };
                                        } else {
                                            finalEl = dcel.value.content && dcel.value.content[0] || dcel.value.content || dcel.value;
                                        }
                                        if (dc[elName] && Array.isArray(dc[elName])) {
                                            dc[elName].push(finalEl);
                                        } else if (dc[elName]) {
                                            dc[elName] = [dc[elName], finalEl];
                                        } else {
                                            dc[elName] = finalEl;
                                        }
                                    }
                                    return { dc };
                                }
                            } else if (json && json.name && json.name.localPart === "ExceptionReport") {
                                return {
                                    error: json.value.exception && json.value.exception.length && json.value.exception[0].exceptionText || 'GenericError'
                                };
                            }
                            return null;
                        }
                        return null;
                    }));
            });
        });
    },
    getRecords: function(url, startPosition, maxRecords, filter, options) {
        return new Promise((resolve) => {
            require.ensure(['../utils/ogc/CSW', '../utils/ogc/Filter'], () => {
                const { CSW, marshaller, unmarshaller } = require('../utils/ogc/CSW');
                let body = marshaller.marshalString({
                    name: "csw:GetRecords",
                    value: CSW.getRecords(startPosition, maxRecords, typeof filter !== "string" && filter)
                });
                if (!filter || typeof filter === "string") {
                    body = constructXMLBody(startPosition, maxRecords, filter, options);
                }
                resolve(axios.post(parseUrl(url), body, {
                    headers: {
                        'Content-Type': 'application/xml'
                    }
                }).then((response) => {
                    if (response) {
                        let json = unmarshaller.unmarshalString(response.data);
                        if (json && json.name && json.name.localPart === "GetRecordsResponse" && json.value && json.value.searchResults) {
                            let rawResult = json.value;
                            let rawRecords = rawResult.searchResults.abstractRecord || rawResult.searchResults.any;
                            let result = {
                                numberOfRecordsMatched: rawResult.searchResults.numberOfRecordsMatched,
                                numberOfRecordsReturned: rawResult.searchResults.numberOfRecordsReturned,
                                nextRecord: rawResult.searchResults.nextRecord
                                // searchStatus: rawResult.searchStatus
                            };
                            let records = [];
                            let _dcRef;
                            if (rawRecords) {
                                for (let i = 0; i < rawRecords.length; i++) {
                                    let rawRec = rawRecords[i].value;
                                    let obj = {
                                        dateStamp: rawRec.dateStamp && rawRec.dateStamp.date,
                                        fileIdentifier: rawRec.fileIdentifier && rawRec.fileIdentifier.characterString && rawRec.fileIdentifier.characterString.value,
                                        identificationInfo: rawRec.abstractMDIdentification && rawRec.abstractMDIdentification.value
                                    };
                                    if (rawRec.boundingBox) {
                                        let bbox;
                                        let crs;
                                        let el;
                                        if (Array.isArray(rawRec.boundingBox)) {
                                            el = head(rawRec.boundingBox);
                                        } else {
                                            el = rawRec.boundingBox;
                                        }
                                        if (el && el.value) {
                                            const crsValue = el.value?.crs ?? '';
                                            const urn = crsValue.match(/[\w-]*:[\w-]*:[\w-]*:[\w-]*:[\w-]*:[^:]*:(([\w-]+\s[\w-]+)|[\w-]*)/)?.[0];
                                            const epsg = makeNumericEPSG(crsValue.match(/EPSG:[0-9]+/)?.[0]);

                                            let lc = el.value.lowerCorner;
                                            let uc = el.value.upperCorner;

                                            const extractedCrs = epsg || (extractCrsFromURN(urn) || last(crsValue.split(':')));

                                            if (!extractedCrs) {
                                                crs = 'EPSG:4326';
                                            } else if (extractedCrs.slice(0, 5) === 'EPSG:') {
                                                crs = makeNumericEPSG(extractedCrs);
                                            } else {
                                                crs = makeNumericEPSG(`EPSG:${extractedCrs}`);
                                            }

                                            // Usually switched, GeoServer sometimes doesn't. See https://docs.geoserver.org/latest/en/user/services/wfs/axis_order.html#axis-ordering
                                            if (crs === 'EPSG:4326' && extractedCrs !== 'CRS84' && extractedCrs !== 'OGC:CRS84') {
                                                lc = [lc[1], lc[0]];
                                                uc = [uc[1], uc[0]];
                                            }
                                            bbox = makeBboxFromOWS(lc, uc);
                                        }
                                        obj.boundingBox = {
                                            extent: bbox,
                                            crs: 'EPSG:4326'
                                        };
                                    }
                                    // dcElement is an array of objects, each item is a dc tag in the XML
                                    let dcElement = rawRec.dcElement;
                                    if (dcElement) {
                                        let dc = {
                                            references: []
                                        };
                                        for (let j = 0; j < dcElement.length; j++) {
                                            let dcel = dcElement[j];
                                            // here the element name is taken (i.e. "URI", "title", "description", etc)
                                            let elName = dcel.name.localPart;
                                            let finalEl = {};
                                            /* Some services (e.g. GeoServer) support http://schemas.opengis.net/csw/2.0.2/record.xsd only
                                            * Usually they publish the WMS URL at dct:"references" with scheme=OGC:WMS
                                            * So we place references as they are.
                                            */
                                            if (elName === "references" && dcel.value) {
                                                let urlString = dcel.value.content && cleanDuplicatedQuestionMarks(dcel.value.content[0]) || dcel.value.content || dcel.value;
                                                finalEl = {
                                                    value: urlString,
                                                    scheme: dcel.value.scheme
                                                };
                                            } else {
                                                finalEl = dcel.value.content && dcel.value.content[0] || dcel.value.content || dcel.value;
                                            }
                                            /**
                                                grouping all tags with same property together (i.e <dc:subject>mobilità</dc:subject> <dc:subject>traffico</dc:subject>)
                                                will become { subject: ["mobilità", "traffico"] }
                                            **/
                                            if (dc[elName] && Array.isArray(dc[elName])) {
                                                dc[elName].push(finalEl);
                                            } else if (dc[elName]) {
                                                dc[elName] = [dc[elName], finalEl];
                                            } else {
                                                dc[elName] = finalEl;
                                            }
                                        }
                                        const URIs = castArray(dc.references.length > 0 ? dc.references : dc.URI);
                                        if (!_dcRef) {
                                            _dcRef = URIs;
                                        } else {
                                            _dcRef = _dcRef.concat(URIs);
                                        }
                                        obj.dc = dc;
                                    }
                                    records.push(obj);
                                }
                            }
                            result.records = records;
                            return addCapabilitiesToRecords(_dcRef, result, options);
                        } else if (json && json.name && json.name.localPart === "ExceptionReport") {
                            return {
                                error: json.value.exception && json.value.exception.length && json.value.exception[0].exceptionText || 'GenericError'
                            };
                        }
                    }
                    return null;
                }).then(results => getBboxFor3DLayersToRecords(results)));         // handle getting bbox from capabilities in case of 3D tile layer
            });
        });
    },
    textSearch: function(url, startPosition, maxRecords, text, options) {
        return new Promise((resolve) => {
            resolve(Api.getRecords(url, startPosition, maxRecords, text, options));
        });
    },
    workspaceSearch: function(url, startPosition, maxRecords, text, workspace) {
        return new Promise((resolve) => {
            require.ensure(['../utils/ogc/CSW', '../utils/ogc/Filter'], () => {
                const { Filter } = require('../utils/ogc/Filter');
                const workspaceTerm = workspace || "%";
                const layerNameTerm = text && "%" + text + "%" || "%";
                const ops = Filter.propertyIsLike("dc:identifier", workspaceTerm + ":" + layerNameTerm);
                const filter = Filter.filter(ops);
                resolve(Api.getRecords(url, startPosition, maxRecords, filter));
            });
        });
    },
    reset: () => { }
};

export default Api;
