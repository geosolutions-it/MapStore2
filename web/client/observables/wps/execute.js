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

class WPSExecuteError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'WPSExecuteError';
        this.code = code || message;
    }
}

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
    (dataInputsXML || '').join('') +
    `</wps:DataInputs>` +
    (responseFormXML || '') +
    `</wps:Execute>`;

export const getExecutionStatus = (url, execId, requestOptions = {}) => Observable.defer(() =>
    axios.get(getWPSURL(url, {"version": "1.0.0", "REQUEST": "GetExecutionStatus", "executionId": execId}), {
        headers: {'Accept': 'application/xml'},
        ...requestOptions
    })
);

export const extractExecutionStatusFromXMLObject = (xmlObj, outputsExtractor = identity) => {
    const status = xmlObj?.ExecuteResponse?.Status?.[0];

    if (status?.ProcessAccepted) {
        return {status: 'ProcessAccepted'};
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

export const handleExecuteResponseXMLObject = (xmlObj, outputsExtractor) => {
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
    const statusLocation = xmlObj?.ExecuteResponse?.$?.statusLocation;
    if (!statusLocation) {
        throw new WPSExecuteError('NoStatusLocation');
    }
    const executionIdLocation = statusLocation.indexOf('executionId=');
    if (executionIdLocation === -1) {
        throw new WPSExecuteError('NoExecutionId');
    }

    const executionIdCut = statusLocation.slice(executionIdLocation + 12, );
    const ampersandLocation = executionIdCut.indexOf('&');
    const executionId = ampersandLocation === -1 ? executionIdCut : executionIdCut.slice(0, ampersandLocation);

    return {succeeded: false, executionId};
};

export const literalDataOutputExtractor = output => {
    return {
        identifier: output?.Identifier?.[0],
        data: output?.Data?.[0]?.LiteralData?.[0]
    };
};

export const executeProcessRequest = (url, payload, requestOptions = {}) => Observable.defer(() =>
    axios.post(getWPSURL(url, {"version": "1.0.0", "REQUEST": "Execute"}), payload, {
        headers: {'Content-Type': 'application/xml'},
        ...requestOptions
    })
);

export const executeProcess = (url, payload, executeOptions = {}, requestOptions = {}) => {
    const {executeStatusUpdateInterval = 2000, outputsExtractor} = executeOptions;

    const parseXML = (xml) =>
        Observable.defer(() => new Promise((resolve, reject) => parseString(xml, {tagNameProcessors: [stripPrefix]}, (err, xmlObj) => err ? reject(err) : resolve(xmlObj))));

    return executeProcessRequest(url, payload, requestOptions)
        .catch(() => {
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
                            const executeResponse = handleExecuteResponseXMLObject(newXmlObj);
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
