/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import urlUtil from 'url';

import { get, head, last, template, isNil, castArray, isEmpty } from 'lodash';
import xml2js from 'xml2js';
import axios from '../libs/ajax';
import { cleanDuplicatedQuestionMarks } from '../utils/ConfigUtils';
import { extractCrsFromURN, makeBboxFromOWS, makeNumericEPSG, getExtentFromNormalized } from '../utils/CoordinatesUtils';
import WMS from "../api/WMS";
import { THREE_D_TILES, getCapabilities } from './ThreeDTiles';
import { getDefaultUrl } from '../utils/URLUtils';
import { getAuthorizationBasic } from '../utils/SecurityUtils';

export const parseUrl = (url) => {
    const parsed = urlUtil.parse(getDefaultUrl(url), true);
    return urlUtil.format(Object.assign({}, parsed, { search: null }, {
        query: Object.assign({
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
/**
 * Create the SortProperty xml definition
 * @param {options}
 * @param {string} options.name property name to order
 * @param {string} options.order order type
 * @returns {string} sort by definition in xml format
 */
const sortByXml = ({ name, order }) => "<ogc:SortBy>" +
"<ogc:SortProperty>" +
  `<ogc:PropertyName>${name}</ogc:PropertyName>` +
  `<ogc:SortOrder>${order}</ogc:SortOrder>` +
"</ogc:SortProperty>" +
"</ogc:SortBy>";
/**
 * Create the GetRecords xml body
 * @param {options}
 * @param {number} options.startPosition staring index of record in catalog
 * @param {number} options.maxRecords maximum number of records returned
 * @param {number} options.filterXml a filter definition in xml format
 * @param {number} options.sortBy sort by definition in xml format
 * @returns {string} get record xml body
 */
export const cswGetRecordsXml = (options) => '<csw:GetRecords xmlns:csw="http://www.opengis.net/cat/csw/2.0.2" ' +
    'xmlns:ogc="http://www.opengis.net/ogc" ' +
    'xmlns:gml="http://www.opengis.net/gml" ' +
    'xmlns:dc="http://purl.org/dc/elements/1.1/" ' +
    'xmlns:dct="http://purl.org/dc/terms/" ' +
    'xmlns:gmd="http://www.isotc211.org/2005/gmd" ' +
    'xmlns:gco="http://www.isotc211.org/2005/gco" ' +
    'xmlns:gmi="http://www.isotc211.org/2005/gmi" ' +
    `xmlns:ows="http://www.opengis.net/ows" service="CSW" version="2.0.2" resultType="results" startPosition="${options.startPosition}" maxRecords="${options.maxRecords}">` +
    '<csw:Query typeNames="csw:Record">' +
    '<csw:ElementSetName>full</csw:ElementSetName>' +
    '<csw:Constraint version="1.1.0">' +
    '<ogc:Filter>' +
    (options.filterXml || '') +
    '</ogc:Filter>' +
    '</csw:Constraint>' +
    (options.sortBy || '') +
    '</csw:Query>' +
    '</csw:GetRecords>';
/**
 * Get crs information given a CSW record bounding box
 * @param {object} boundingBox CSW bounding box in json format
 * @returns {object} { crs, extractedCrs }
 */
const getCRSFromCSWBoundingBox = (boundingBox) => {
    const crsValue = boundingBox?.$?.crs ?? '';
    const urn = crsValue.match(/[\w-]*:[\w-]*:[\w-]*:[\w-]*:[\w-]*:[^:]*:(([\w-]+\s[\w-]+)|[\w-]*)/)?.[0];
    const epsg = makeNumericEPSG(crsValue.match(/EPSG:[0-9]+/)?.[0]);
    const extractedCrs = epsg || (extractCrsFromURN(urn) || last(crsValue.split(':')));
    if (!extractedCrs) {
        return { crs: 'EPSG:4326', extractedCrs };
    }
    if (extractedCrs.slice(0, 5) === 'EPSG:') {
        return { crs: makeNumericEPSG(extractedCrs), extractedCrs };
    }
    return { crs: makeNumericEPSG(`EPSG:${extractedCrs}`), extractedCrs };
};
/**
 * Get bounding box information given a CSW record
 * @param {object} cswRecord CSW record in json format
 * @returns {object} { crs, extent }
 */
const getBoundingBoxFromCSWRecord = (cswRecord) => {
    if (cswRecord?.['ows:BoundingBox']) {
        const boundingBox = castArray(cswRecord['ows:BoundingBox'])[0];
        const { crs, extractedCrs } = getCRSFromCSWBoundingBox(boundingBox);
        let lc = (boundingBox?.['ows:LowerCorner'] || '-180 -90').split(' ').map(parseFloat);
        let uc = (boundingBox?.['ows:UpperCorner'] || '180 90').split(' ').map(parseFloat);
        // Usually switched, GeoServer sometimes doesn't.
        // See https://docs.geoserver.org/latest/en/user/services/wfs/axis_order.html#axis-ordering
        if (crs === 'EPSG:4326' && extractedCrs !== 'CRS84' && extractedCrs !== 'OGC:CRS84') {
            lc = [lc[1], lc[0]];
            uc = [uc[1], uc[0]];
        }
        return {
            extent: makeBboxFromOWS(lc, uc),
            crs: 'EPSG:4326'
        };
    }
    return null;
};
/**
 * Get dc properties given a CSW record
 * @param {object} cswRecord CSW record in json format
 * @returns {object} dc
 */
const getDCFromCSWRecord = (cswRecord) => {
    // extract each dc or dct tag item in the XML
    const dc = Object.keys(cswRecord || {}).reduce((acc, key) => {
        const isDCElement = key.indexOf('dc:') === 0;
        const isDCTElement = key.indexOf('dct:') === 0;
        if (isDCElement || isDCTElement) {
            const name = isDCElement ? key.replace('dc:', '') :  key.replace('dct:', '');
            let value = cswRecord[key];
            if (name === 'references') {
                value = castArray(cswRecord[key]).map((reference) => {
                    return {
                        value: cleanDuplicatedQuestionMarks(reference?._),
                        scheme: reference?.$?.scheme
                    };
                });
            }
            if (name === 'URI') {
                value = castArray(cswRecord[key]).map((uri) => {
                    return {
                        description: uri?.$?.description,
                        name: uri?.$?.name,
                        protocol: uri?.$?.protocol,
                        value: uri?._
                    };
                });
            }
            return {
                ...acc,
                [name]: value
            };
        }
        return acc;
    }, {});
    return isEmpty(dc) ? null : dc;
};
/**
 * Get error message given the parsed response from a CSW request
 * @param {object} cswResponse CSW response in json format
 * @returns {string} error message
 */
const getCSWError = (cswResponse) => {
    const exceptionReport = cswResponse?.['ows:ExceptionReport'];
    if (exceptionReport) {
        const exceptionText = exceptionReport?.['ows:Exception']?.['ows:ExceptionText'];
        return exceptionText || 'GenericError';
    }
    return '';
};
/**
 * Parse a CSW axios response
 * @param {object} response axios response
 * @returns {object} it could return the parsed result, an error or null
 */
const parseCSWResponse = (response) => {
    if (!response) {
        return null;
    }
    let json;
    xml2js.parseString(response.data, { explicitArray: false }, (ignore, result) => {
        json = result;
    });
    const searchResults = json?.['csw:GetRecordsResponse']?.['csw:SearchResults'];
    if (searchResults) {
        const cswRecords = searchResults?.['csw:Record'] || searchResults?.['gmd:MD_Metadata'];
        const records = !cswRecords ? null : castArray(cswRecords).map((cswRecord) => {
            const boundingBox = getBoundingBoxFromCSWRecord(cswRecord);
            const dc = getDCFromCSWRecord(cswRecord);
            return {
                dateStamp: cswRecord?.['gmd:dateStamp']?.['gco:Date'],
                fileIdentifier: cswRecord?.['gmd:fileIdentifier']?.['gco:CharacterString'],
                identificationInfo: cswRecord?.['gmd:identificationInfo']?.['gmd:AbstractMD_Identification'],
                ...(boundingBox && { boundingBox }),
                ...(dc && { dc })
            };
        });
        const _dcRef = records ? records.map(({ dc = {} }) => {
            const URIs = castArray(dc?.references?.length > 0 ? dc.references : dc.URI);
            return URIs;
        }).flat() : undefined;
        return {
            result: {
                numberOfRecordsMatched: parseFloat(searchResults?.$?.numberOfRecordsMatched),
                numberOfRecordsReturned: parseFloat(searchResults?.$?.numberOfRecordsReturned),
                nextRecord: parseFloat(searchResults?.$?.nextRecord),
                ...(records && { records })
            },
            _dcRef
        };
    }
    const error = getCSWError(json);
    if (error) {
        return { error };
    }
    return null;
};
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
export const constructXMLBody = (startPosition, maxRecords, searchText, { options: { service } = {} } = {}) => {
    const { filter, sortBy: sortObj } = service ?? {};
    const staticFilter = filter?.staticFilter || defaultStaticFilter;
    const dynamicFilter = `<ogc:And>
        ${template(filter?.dynamicFilter || defaultDynamicFilter)({ searchText })}
        ${staticFilter}
    </ogc:And>`;
    const sortExp = sortObj?.name ? sortByXml({ name: sortObj?.name, order: sortObj?.order ?? "ASC"}) : '';
    return cswGetRecordsXml({ filterXml: !searchText ? staticFilter : dynamicFilter, startPosition, maxRecords, sortBy: sortExp});
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

// Extract the relevant information from the wfs URL for (RNDT / INSPIRE)
const extractWFSParamsFromURL = wfs => {
    const lowerCaseParams = new Map(Array.from(new URLSearchParams(wfs.value)).map(([key, value]) => [key.toLowerCase(), value]));
    const layerName = lowerCaseParams.get('typename');
    if (layerName) {
        return {
            ...wfs,
            protocol: 'OGC:WFS',
            name: layerName,
            value: `${wfs.value.match(/[^\?]+[\?]+/g)}service=WFS`
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
    case 'wfs':
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
const REGEX_WFS_EXPLICIT = [/^OGC:WFS-(.*)-http-get-(capabilities|feature)/g, /^OGC:WFS/g];
const REGEX_WMS_EXTRACT = /serviceType\/ogc\/wms/g;
const REGEX_WFS_EXTRACT = /serviceType\/ogc\/wfs/g;
const REGEX_WMS_ALL = REGEX_WMS_EXPLICIT.concat(REGEX_WMS_EXTRACT);

export const getLayerReferenceFromDc = (dc, options, checkEsri = true) => {
    const URI = dc?.URI && castArray(dc.URI);
    const isWMS = isNil(options?.type) || options?.type === "wms";
    const isWFS = options?.type === "wfs";
    // look in URI objects for wms and thumbnail
    if (URI) {
        if (isWMS) {
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
        if (isWFS) {
            const wfs = head(URI.map(uri => {
                if (uri.protocol) {
                    if (REGEX_WFS_EXPLICIT.some(regex => uri.protocol.match(regex))) {
                    /** wfs protocol params are explicitly defined as attributes (INSPIRE)*/
                        return uri;
                    }
                    if (uri.protocol.match(REGEX_WFS_EXTRACT)) {
                    /** wfs protocol params must be extracted from the element text (RNDT / INSPIRE) */
                        return extractWFSParamsFromURL(uri);
                    }
                }
                return false;
            }).filter(item => item));
            if (wfs) {
                return toReference('wfs', wfs, options);
            }
        }
    }
    // look in references objects
    if (dc?.references?.length) {
        const refs = castArray(dc.references);
        const wms = head(refs.filter((ref) => { return ref.scheme && REGEX_WMS_EXPLICIT.some(regex => ref.scheme.match(regex)); }));
        const wfs = head(refs.filter((ref) => { return ref.scheme && REGEX_WFS_EXPLICIT.some(regex => ref.scheme.match(regex)); }));
        if (isWMS && wms) {
            let urlObj = urlUtil.parse(getDefaultUrl(wms.value), true);
            let layerName = urlObj.query && urlObj.query.layers || dc.alternative;
            return toReference('wms', { ...wms, value: urlUtil.format(urlObj), name: layerName }, options);
        }
        if (isWFS && wfs) {
            let urlObj = urlUtil.parse(getDefaultUrl(wfs.value), true);
            let layerName = urlObj.query && urlObj.query.layers || dc.alternative;
            return toReference('wfs', { ...wfs, value: urlUtil.format(urlObj), name: layerName }, options);
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
        return axios.get(catalogURL)
            .then((response) => {
                if (response) {
                    let json;
                    xml2js.parseString(response.data, { explicitArray: false }, (ignore, result) => {
                        json = result;
                    });
                    const record = json?.['csw:GetRecordByIdResponse']?.['csw:Record'];
                    const dc = getDCFromCSWRecord(record);
                    if (dc) {
                        return { dc };
                    }
                    const error = getCSWError(json);
                    if (error) {
                        return { error };
                    }
                }
                return null;
            });
    },
    getRecords: function(url, startPosition, maxRecords, text, options) {
        const body = constructXMLBody(startPosition, maxRecords, text, options);
        const protectedId = options?.options?.service?.protectedId;
        let headers = getAuthorizationBasic(protectedId);
        return axios.post(parseUrl(url), body, {
            headers: {
                'Content-Type': 'application/xml',
                ...headers
            }
        }).then((response) => {
            const { error, _dcRef, result } = parseCSWResponse(response) || {};
            if (result) {
                return addCapabilitiesToRecords(_dcRef, result, options);
            }
            if (error) {
                return { error };
            }
            return null;
        }).then(results => getBboxFor3DLayersToRecords(results)); // handle getting bbox from capabilities in case of 3D tile layer
    },
    textSearch: function(url, startPosition, maxRecords, text, options) {
        return new Promise((resolve) => {
            resolve(Api.getRecords(url, startPosition, maxRecords, text, options));
        });
    },
    workspaceSearch: function(url, startPosition, maxRecords, text, workspace) {
        const workspaceTerm = workspace || "%";
        const layerNameTerm = text && "%" + text + "%" || "%";
        return Api.getRecords(url, startPosition, maxRecords, '', {
            options: {
                service: {
                    filter: {
                        staticFilter: "<ogc:PropertyIsLike wildCard=\"%\" singleChar=\"_\" escapeChar=\"\\\\\">" +
                            "<ogc:PropertyName>dc:identifier</ogc:PropertyName>" +
                            `<ogc:Literal>${workspaceTerm + ":" + layerNameTerm}</ogc:Literal>` +
                        "</ogc:PropertyIsLike>"
                    }
                }
            }
        });
    },
    reset: () => { }
};

export default Api;
