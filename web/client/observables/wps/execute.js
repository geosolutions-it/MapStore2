/**
  * Copyright 2020, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import { identity } from 'lodash';
import { Observable } from 'rxjs';
import { parseString } from 'xml2js';
import { stripPrefix } from 'xml2js/lib/processors';

import axios from '../../libs/ajax';
import { getWPSURL } from './common';

/**
 * Contains routines pertaining to Execute WPS operation.
 * @name observables.wps.execute
 */

class WPSExecuteError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'WPSExecuteError';
        this.code = code || message;
    }
}

/**
 * Construct XML payload of WPS Execute operation
 * @memberof observables.wps.execute
 * @param {string} processIdentifier WPS process idenitifier
 * @param {string[]} [dataInputsXML] array of XML string of each individual Input
 * @param {string} [responseFormXML] response form XML contents
 * @returns {string} XML payload
 */
export const executeProcessXML = (processIdentifier, dataInputsXML, responseFormXML) =>
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<wps:Execute version="1.0.0" service="WPS"` +
    ` xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"` +
    ` xmlns="http://www.opengis.net/wps/1.0.0"` +
    ` xmlns:wfs="http://www.opengis.net/wfs"` +
    ` xmlns:wps="http://www.opengis.net/wps/1.0.0"` +
    ` xmlns:ows="http://www.opengis.net/ows/1.1"` +
    ` xmlns:gml="http://www.opengis.net/gml"` +
    ` xmlns:ogc="http://www.opengis.net/ogc"` +
    ` xmlns:wcs="http://www.opengis.net/wcs/1.1.1"` +
    ` xmlns:dwn="http://geoserver.org/wps/download"` +
    ` xmlns:xlink="http://www.w3.org/1999/xlink"` +
    ` xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">` +
    `<ows:Identifier>${processIdentifier}</ows:Identifier>` +
    `<wps:DataInputs>` +
    (dataInputsXML || []).join('') +
    `</wps:DataInputs>` +
    (responseFormXML || '') +
    `</wps:Execute>`;

/**
 * Send GetExecutionStatus request
 * @memberof observables.wps.execute
 * @param {string} url target url
 * @param {string} execId executionId returned in ExecuteResponse of Execute process request
 * @param {object} [requestOptions] request options to pass to axios.get
 * @returns {Observable} observable that emits axios response object
 */
export const getExecutionStatus = (url, execId, requestOptions = {}) => Observable.defer(() =>
    axios.get(getWPSURL(url, {"version": "1.0.0", "REQUEST": "GetExecutionStatus", "executionId": execId}), {
        headers: {'Accept': 'application/xml'},
        ...requestOptions
    })
);

const extractExecutionStatusFromXMLObject = (xmlObj, outputsExtractor = identity) => {
    const status = xmlObj?.ExecuteResponse?.Status?.[0];

    if (status?.ProcessAccepted) {
        return {status: 'ProcessAccepted'};
    }
    if (status?.ProcessStarted) {
        return {status: 'ProcessStarted'};
    }
    if (status?.ProcessSucceeded) {
        return {status: 'ProcessSucceeded', data: outputsExtractor(xmlObj.ExecuteResponse.ProcessOutputs?.[0]?.Output)};
    }
    if (status?.ProcessFailed) {
        return {status: 'ProcessFailed', exceptionReport: status?.ProcessFailed?.[0]?.ExceptionReport?.[0]?.Exception?.[0]?.ExceptionText?.[0]};
    }
    if (status?.ProcessPaused) {
        return {status: 'ProcessPaused'};
    }

    return {status: 'UnexpectedStatus'};
};

const handleExecuteResponseXMLObject = (xmlObj, outputsExtractor, result) => {
    const statusObj = extractExecutionStatusFromXMLObject(xmlObj, outputsExtractor);
    if (statusObj.status === 'ProcessFailed') {
        throw new WPSExecuteError(statusObj.exceptionReport, 'ProcessFailed');
    }
    if (statusObj.status === 'UnexpectedStatus') {
        throw new WPSExecuteError('UnexpectedProcessStatus');
    }
    if (statusObj.status === 'ProcessSucceeded') {
        return {succeeded: true, data: statusObj.data};
    }
    let statusLocation = xmlObj?.ExecuteResponse?.$?.statusLocation;
    if (!statusLocation) {
        statusLocation = result?.config?.url;
    }
    if (!statusLocation) {
        throw new WPSExecuteError('NoStatusLocation');
    }
    const executionIdLocation = statusLocation.indexOf('executionId=');
    if (executionIdLocation === -1) {
        throw new WPSExecuteError('NoExecutionId');
    }

    const executionIdCut = statusLocation.slice(executionIdLocation + 12 );
    const ampersandLocation = executionIdCut.indexOf('&');
    const executionId = ampersandLocation === -1 ? executionIdCut : executionIdCut.slice(0, ampersandLocation);

    return {succeeded: false, executionId};
};

/**
 * Extracts identifier from Output
 * @memberof observables.wps.execute
 * @param {object} output xml2js object
 * @returns {object}
 */
export const identifierOutputExtractor = output => {
    if (!output?.Identifier?.[0]) {
        return null;
    }

    return {
        identifier: output?.Identifier?.[0]
    };
};
/**
 * Extracts LiteralData contents from Output
 * @memberof observables.wps.execute
 * @param {object} output xml2js object
 * @returns {object}
 */
export const literalDataOutputExtractor = output => {
    if (!output?.Data?.[0]?.LiteralData) {
        return null;
    }

    return {
        data: output?.Data?.[0]?.LiteralData?.[0]
    };
};
/**
 * Extracts href and mimeType from Reference from Output
 * @memberof observables.wps.execute
 * @param {object} output xml2js object
 * @returns {object}
 */
export const referenceOutputExtractor = output => {
    if (!output?.Reference) {
        return null;
    }

    return {
        href: output?.Reference?.[0]?.$?.href,
        mimeType: output?.Reference?.[0]?.$?.mimeType
    };
};
/**
 * Make outputs extractor function from primitive ones.
 * The returned value of the result outputs extractor function is an array of objects items of which
 * correspond to Output tags in ExecuteResponse. Each object is constructed by merging the results
 * of calling each extractor on the Output tag.
 * @memberof observables.wps.execute
 * @param  {...function} extractors primitive extractor functions
 * @returns {function} outputs extractor function to be passed as outputsExtractor option to executeProcess
 */
export const makeOutputsExtractor = (...extractors) =>
    (outputs = []) => outputs
        .map(output => [identifierOutputExtractor, ...(extractors || [])]
            .map(extractor => extractor(output))
            .reduce((result, extracted) => extracted ? {...result, ...extracted} : result, {}));

/**
 * Send WPS Execute request
 * @memberof observables.wps.execute
 * @param {string} url target url
 * @param {string} payload xml payload
 * @param {object} [requestOptions] request options to pass to axios.post
 * @returns {Observable} observable that emits result from axios.post
 */
export const executeProcessRequest = (url, payload, requestOptions = {}) => Observable.defer(() =>
    axios.post(getWPSURL(url, {"version": "1.0.0", "REQUEST": "Execute"}), payload, {
        headers: {'Content-Type': 'application/xml'},
        ...requestOptions
    })
);

/**
 * Run WPS Execute operation.
 * @memberof observables.wps.execute
 * @param {string} url url of the server
 * @param {string} payload xml payload
 * @param {object} executeOptions options object
 * @param {number} [executeOptions.executeStatusUpdateInterval=2000] time interval in ms between consecutive status checks if process is asynchronous
 * @param {function} [executeOptions.outputsExtractor=identity] function to apply to outputs array of ExecuteResponse and use it's return value as
 * a result. If not specified array of xml2js objects with parsed Output tags will be returned
 * @param {object} [requestOptions] request options to pass to axios.post
 * @returns {Observable} observable that emits ExecuteResponse outputs processed by outputsExtractor or data returned by the server if the initial response
 * was not ExecuteResponse(for example if RawDataOutput is specified without ResponseDocument in the payload)
 */
export const executeProcess = (url, payload, executeOptions = {}, requestOptions = {}) => {
    const {executeStatusUpdateInterval = 2000, outputsExtractor} = executeOptions;

    const parseXML = (xml) =>
        Observable.defer(() => new Promise((resolve, reject) => parseString(xml, {tagNameProcessors: [stripPrefix]}, (err, xmlObj) => err ? reject(err) : resolve(xmlObj))));

    return executeProcessRequest(url, payload, requestOptions)
        .catch((error) => {
            if (error.__CANCEL__) {
                throw error;
            }
            throw new WPSExecuteError('ExecuteProcessXHRFailed');
        })
        .switchMap(result => {
            if (result.headers['content-type'] === 'application/xml' || result.headers['content-type'] === 'text/xml') {
                return parseXML(result.data).map(xmlObj => ({data: xmlObj, type: 'application/xml', originalData: result.data}));
            }
            return Observable.of({data: result.data, type: result.headers['content-type']});
        })
        .flatMap(parsedResult => {
            const {data: xmlObj, type, originalData} = parsedResult;

            if (type !== 'application/xml') {
                return Observable.of(xmlObj);
            }
            if (!xmlObj?.ExecuteResponse) {
                return Observable.of(originalData);
            }

            const {succeeded, data, executionId} = handleExecuteResponseXMLObject(xmlObj, outputsExtractor);
            if (succeeded) {
                return Observable.of(data);
            }

            const executeStatusUpdate$ = Observable.interval(executeStatusUpdateInterval)
                .take(1)
                .flatMap(() =>
                    getExecutionStatus(url, executionId)
                        .catch(() => {
                            throw new WPSExecuteError('GetExecutionStatusXHRFailed');
                        })
                        .flatMap(result => parseXML(result.data).flatMap(newXmlObj => {
                            // note: handleExecuteResponseXMLObject is used to parse both status and response
                            // this is because they are in similar format (ExecuteResponse)
                            // Anyway this causes troubles (e.g. statusLocation is not available to extract executionId)
                            // so we need to pass the original result to parse the original URL (this is a workaround)
                            // We should refactor this to have a separate function to handle ExecutionStatusResponse
                            const executeResponse = handleExecuteResponseXMLObject(newXmlObj, outputsExtractor, result);
                            if (executeResponse.succeeded) {
                                return Observable.of(executeResponse.data);
                            }
                            return executeStatusUpdate$;
                        }))
                );
            return executeStatusUpdate$;
        });
};

export default executeProcess;
