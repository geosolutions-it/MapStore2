/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const axios = require('../libs/ajax');

const _ = require('lodash');

const urlUtil = require('url');
const ConfigUtils = require('../utils/ConfigUtils');
const CoordinatesUtils = require('../utils/CoordinatesUtils');
const assign = require('object-assign');

const parseUrl = (url) => {
    const parsed = urlUtil.parse(url, true);
    return urlUtil.format(assign({}, parsed, {search: null}, {
        query: assign({
            service: "CSW",
            version: "2.0.2"
        }, parsed.query, {request: undefined})
    }));
};

/**
 * API for local config
 */
var Api = {
    parseUrl,
    getRecordById: function(catalogURL) {
        return new Promise((resolve) => {
            require.ensure(['../utils/ogc/CSW'], () => {
                resolve(axios.get(catalogURL)
                    .then((response) => {
                        if (response) {
                            const {unmarshaller} = require('../utils/ogc/CSW');
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
                                            let urlString = dcel.value.content && ConfigUtils.cleanDuplicatedQuestionMarks(dcel.value.content[0]) || dcel.value.content || dcel.value;
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
                                    return {dc};
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
    getRecords: function(url, startPosition, maxRecords, filter) {
        return new Promise((resolve) => {
            require.ensure(['../utils/ogc/CSW', '../utils/ogc/Filter'], () => {
                const {CSW, marshaller, unmarshaller} = require('../utils/ogc/CSW');
                let body = marshaller.marshalString({
                    name: "csw:GetRecords",
                    value: CSW.getRecords(startPosition, maxRecords, filter)
                });
                resolve(axios.post(parseUrl(url), body, { headers: {
                    'Content-Type': 'application/xml'
                }}).then(
                    (response) => {
                        if (response ) {
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
                                                el = _.head(rawRec.boundingBox);
                                            } else {
                                                el = rawRec.boundingBox;
                                            }
                                            if (el && el.value) {
                                                // EPSG:4326 is defined as (lat,lon) but mapping frameworks usually expect (lon,lat) as it is
                                                // more natural (because (lon,lat) is basically (x,y))
                                                // so internally EPSG:4326 is assumed to be (lon,lat) but when we import from external services
                                                // we assume that EPSG:4326 is (lat,lon) and CRS84 is (lon,lat) as by their definition
                                                // after conversion to (lon,lat) we set crs to EPSG:4326

                                                const crsValue = el.value?.crs ?? '';
                                                const urn = crsValue.match(/[\w-]*:[\w-]*:[\w-]*:[\w-]*:[\w-]*:[^:]*:(([\w-]+\s[\w-]+)|[\w-]*)/)?.[0];
                                                const epsg = CoordinatesUtils.makeNumericEPSG(crsValue.match(/EPSG:[0-9]+/)?.[0]);

                                                let lc = el.value.lowerCorner;
                                                let uc = el.value.upperCorner;

                                                const extractedCrs = epsg || (CoordinatesUtils.extractCrsFromURN(urn) || _.last(crsValue.split(':')));

                                                if (!extractedCrs) {
                                                    crs = 'EPSG:4326';
                                                } else if (extractedCrs.slice(0, 5) === 'EPSG:') {
                                                    crs = CoordinatesUtils.makeNumericEPSG(extractedCrs);
                                                    if (!crs) {
                                                        throw new Error(`No suitable EPSG numeric conversion found for "${extractedCrs}"`);
                                                    }
                                                } else {
                                                    crs = CoordinatesUtils.makeNumericEPSG(`EPSG:${extractedCrs}`);
                                                    if (!crs) {
                                                        throw new Error(`No suitable EPSG numeric conversion found for "${extractedCrs}"`);
                                                    }
                                                }

                                                if (crs === 'EPSG:4326' && extractedCrs !== 'CRS84' && extractedCrs !== 'OGC:CRS84') {
                                                    lc = [lc[1], lc[0]];
                                                    uc = [uc[1], uc[0]];
                                                }
                                                bbox = CoordinatesUtils.makeBboxFromOWS(lc, uc);
                                            }
                                            obj.boundingBox = {
                                                extent: bbox,
                                                crs
                                            };
                                        }
                                        let dcElement = rawRec.dcElement;
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
                                                    let urlString = dcel.value.content && ConfigUtils.cleanDuplicatedQuestionMarks(dcel.value.content[0]) || dcel.value.content || dcel.value;
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
                                            obj.dc = dc;
                                        }
                                        records.push(obj);
                                    }
                                }
                                result.records = records;
                                return result;
                            } else if (json && json.name && json.name.localPart === "ExceptionReport") {
                                return {
                                    error: json.value.exception && json.value.exception.length && json.value.exception[0].exceptionText || 'GenericError'
                                };
                            }
                        }
                        return null;
                    }));
            });
        });
    },
    textSearch: function(url, startPosition, maxRecords, text) {
        return new Promise((resolve) => {
            require.ensure(['../utils/ogc/CSW', '../utils/ogc/Filter'], () => {
                const {Filter} = require('../utils/ogc/Filter');
                // creates a request like this:
                // <ogc:PropertyName>apiso:AnyText</ogc:PropertyName><ogc:Literal>%a%</ogc:Literal></ogc:PropertyIsLike>
                let filter = null;
                if (text) {
                    let ops = Filter.propertyIsLike("csw:AnyText", "%" + text + "%");
                    filter = Filter.filter(ops);
                }
                resolve(Api.getRecords(url, startPosition, maxRecords, filter));
            });
        });
    },
    workspaceSearch: function(url, startPosition, maxRecords, text, workspace) {
        return new Promise((resolve) => {
            require.ensure(['../utils/ogc/CSW', '../utils/ogc/Filter'], () => {
                const {Filter} = require('../utils/ogc/Filter');
                const workspaceTerm = workspace || "%";
                const layerNameTerm = text && "%" + text + "%" || "%";
                const ops = Filter.propertyIsLike("identifier", workspaceTerm + ":" + layerNameTerm);
                const filter = Filter.filter(ops);
                resolve(Api.getRecords(url, startPosition, maxRecords, filter));
            });
        });
    },
    reset: () => {}
};

module.exports = Api;
