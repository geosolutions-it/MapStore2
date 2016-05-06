/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const axios = require('../libs/ajax');

const {CSW, marshaller, unmarshaller} = require('../utils/ogc/CSW');
const {Filter} = require('../utils/ogc/Filter');
const _ = require('lodash');


/**
 * API for local config
 */
var Api = {
    getRecords: function(url, startPosition, maxRecords, filter) {
        let body = marshaller.marshalString({
            name: "csw:GetRecords",
            value: CSW.getRecords(startPosition, maxRecords, filter)
        });
        return axios.post(url, body, { headers: {
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
                                        let lc = el.value.lowerCorner;
                                        let uc = el.value.upperCorner;
                                        bbox = [uc[0], lc[1], uc[1], lc[0]];
                                        // TODO parse the extent's crs
                                        let crsCode = el.value.crs.split(":::")[1];
                                        if (crsCode === "WGS 1984") {
                                            crs = "EPSG:4326";
                                        } else if (crsCode) {
                                            // TODO check is valid EPSG code
                                            crs = "EPSG:" + crsCode;
                                        } else {
                                            crs = "EPSG:4326";
                                        }
                                    }
                                    obj.boundingBox = {
                                        extent: bbox,
                                        crs: crs
                                    };

                                }
                                let dcElement = rawRec.dcElement;
                                if (dcElement) {
                                    let dc = {
                                    };
                                    for (let j = 0; j < dcElement.length; j++) {
                                        let el = dcElement[j];
                                        let elName = el.name.localPart;
                                        if (dc[elName] && Array.isArray(dc[elName])) {
                                            dc[elName].push(el.value.content && el.value.content[0] || el.value.content || el.value);
                                        } else if (dc[elName]) {
                                            dc[elName] = [dc[elName], el.value.content && el.value.content[0] || el.value.content || el.value];
                                        } else {
                                            dc[elName] = el.value.content && el.value.content[0] || el.value.content || el.value;
                                        }
                                    }
                                    obj.dc = dc;
                                }
                                records.push(obj);

                            }
                        }
                        result.records = records;
                        return result;
                    }
                }
                return null;

            });
    },
    textSearch: function(url, startPosition, maxRecords, text) {
        // creates a request like this:
        // <ogc:PropertyName>apiso:AnyText</ogc:PropertyName><ogc:Literal>a</ogc:Literal></ogc:PropertyIsLike>
        let filter = null;
        if (text) {
            let ops = Filter.propertyIsLike("apiso:AnyText", text);
            filter = Filter.filter(ops);
        }
        return Api.getRecords(url, startPosition, maxRecords, filter);
    }
};

module.exports = Api;
