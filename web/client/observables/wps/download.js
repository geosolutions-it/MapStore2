/**
  * Copyright 2020, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import {Observable} from 'rxjs';
import {keys, omit, toPairs} from 'lodash';

import {
    cdata,
    complexData,
    downloadParameter,
    literalData,
    processData,
    processOutput,
    processParameter,
    processReference,
    rawDataOutput,
    responseDocument,
    responseForm,
    writingParametersData
} from './common';
import {executeProcess, executeProcessXML, literalDataOutputExtractor, makeOutputsExtractor} from './execute';

/**
 * Contains routines to work with GeoServer WPS download community module processes
 * @name observables.wps.download
 */

export const roiOrFilterToXML = ({type, data}) => type === 'TEXT' ?
    processData(complexData(cdata(data.data), data.mimeType)) :
    processReference(data.mimeType, data.href, data.method, cdata(data.requestBodyData));

/**
 * Construct gs:DownloadEstimator XML payload
 * @memberof observables.wps.download
 * @param {string} downloadOptions options object
 * @param {string} downloadOptions.layerName target layer name
 * @param {object} [downloadOptions.dataFilter] object to use as filter (For more info see {@link api/framework#observables.wps.download.exports.downloadXML|downloadXML})
 * @param {string} [downloadOptions.targetCRS] CRS to project output coordinates in(e.g. EPSG:4326)
 * @param {object} [downloadOptions.ROI] object that specifies Region of Interest. Has the same structure as downloadOptions.dataFilter
 * @param {string} [downloadOptions.roiCRS] CRS of coordinates of geometry data specified in downloadOptions.ROI
 */
export const downloadEstimatorXML = ({layerName, ROI, roiCRS, dataFilter, targetCRS}) => executeProcessXML(
    'gs:DownloadEstimator',
    [
        processParameter('layerName', processData(literalData(layerName))),
        ...(ROI ? [processParameter('ROI', roiOrFilterToXML(ROI))] : []),
        ...(roiCRS ? [processParameter('RoiCRS', processData(literalData(roiCRS)))] : []),
        ...(dataFilter ? [processParameter('filter', roiOrFilterToXML(dataFilter))] : []),
        ...(targetCRS ? [processParameter('targetCRS', processData(literalData(targetCRS)))] : [])
    ]
);

/**
 * Construct gs:Download XML payload
 * @memberof observables.wps.download
 * @param {string} downloadOptions options object
 * @param {string} downloadOptions.layerName target layer name
 * @param {string} downloadOptions.outputFormat MIME type of the output file that shall be returned as the result of the process
 * @param {string} [downloadOptions.targetCRS] CRS to project output coordinates in(e.g. EPSG:4326)
 * @param {object} [downloadOptions.dataFilter] object to use as filter
 * @param {string} [downloadOptions.dataFilter.type] 'TEXT' or 'REFERENCE'
 * @param {object} [downloadOptions.dataFilter.data] filter data object
 * @param {string} [downloadOptions.dataFilter.data.mimeType] mime type of the filter data
 * @param {string} [downloadOptions.dataFilter.data.data] if downloadOptions.dataFilter.type is 'TEXT' this shall contain textual contents of the filter
 * @param {string} [downloadOptions.dataFilter.data.href] if downloadOptions.dataFilter.type is 'REFERENCE' use this as 'href' attribute value
 * @param {string} [downloadOptions.dataFilter.data.method] if downloadOptions.dataFilter.type is 'REFERENCE' use this as 'method' attribute value
 * @param {string} [downloadOptions.dataFilter.data.requestBodyData] if downloadOptions.dataFilter.type is 'REFERENCE' use this as contents of requestBodyData
 * @param {object} [downloadOptions.ROI] object that specifies Region of Interest. Has the same structure as downloadOptions.dataFilter
 * @param {boolean} [downloadOptions.cropToROI] if true gs:Download shall use object specified in downloadOptions.ROI to crop output data
 * @param {string} [downloadOptions.roiCRS] CRS of coordinates of geometry data specified in downloadOptions.ROI
 * @param {boolean} [downloadOptions.asynchronous] if true gs:Download will run asynchronously
 * @param {boolean} [downloadOptions.outputAsReference] instructs gs:Download process to return a link where output file can be downloaded instead of the file itself
 * @param {string} [downloadOptions.resultOutput] MIME type of the output (application/zip by default)
 * @param {object} [downloadOptions.writeParameters] object that describes write parameters to be added in 'writeParameters' Input (For more info see {@link https://docs.geoserver.org/stable/en/user/community/wps-download/rawDownload.html#writing-parameters|GeoServer documentation})
 */
export const downloadXML = ({layerName, dataFilter, outputFormat, targetCRS, roiCRS, ROI, cropToROI, asynchronous, outputAsReference, resultOutput, writeParameters}) => executeProcessXML(
    'gs:Download',
    [
        processParameter('layerName', processData(literalData(layerName))),
        processParameter('outputFormat', processData(literalData(outputFormat))),
        ...(ROI ? [processParameter('ROI', roiOrFilterToXML(ROI))] : []),
        ...(dataFilter ? [processParameter('filter', roiOrFilterToXML(dataFilter))] : []),
        ...(targetCRS ? [processParameter('targetCRS', processData(literalData(targetCRS)))] : []),
        ...(roiCRS ? [processParameter('RoiCRS', processData(literalData(roiCRS)))] : []),
        processParameter('cropToROI', processData(literalData(cropToROI ? 'true' : 'false'))),
        ...(writeParameters && keys(writeParameters).length > 0 ? [writingParametersData(toPairs(writeParameters).map(([key, value]) => downloadParameter(key, value)).join(''))] : [])
    ],
    responseForm(!asynchronous ?
        rawDataOutput('result', resultOutput) :
        responseDocument(true, true, outputAsReference ?
            processOutput(resultOutput, true, 'result') :
            rawDataOutput('result', resultOutput)
        )
    )
);

/**
 * Construct gs:Query XML payload
 * @memberof observables.wps.download
 * @param {string} downloadOptions options object
 * @param {string} downloadOptions.input WPS process reference object
 * @param {string} downloadOptions.attribute comma-separated list of attributes to include in output
 * @param {object} [downloadOptions.filter] object to use as filter
 * @param {boolean} [downloadOptions.asynchronous] if true gs:Download will run asynchronously
 * @param {boolean} [downloadOptions.outputAsReference] instructs process to return a link where output file can be downloaded instead of the file itself
 * @param {string} [downloadOptions.resultOutput] MIME type of the output
 */
export const queryXML = ({input, attribute, filter, asynchronous, outputAsReference, resultOutput}) => executeProcessXML(
    'vec:Query',
    [
        processParameter('features', processReference(input.mimeType, input.href.replace(/&/g, "&amp;"), 'GET')),
        ...(attribute ? attribute.map(attr => processParameter('attribute', processData(literalData(attr)))) : []),
        ...(filter ? [processParameter('filter', roiOrFilterToXML(filter))] : [])
    ],
    responseForm(!asynchronous ?
        rawDataOutput('result', resultOutput) :
        responseDocument(true, true, outputAsReference ?
            processOutput(resultOutput, true, 'result') :
            rawDataOutput('result', resultOutput)
        )
    )
);

/**
 * Execute gs:Download process, running gs:DownloadEstimator first
 * @memberof observables.wps.download
 * @param {string} url target url
 * @param {object} downloadOptions options to use to construct payload xml for DownloadEstimator and Download processes(except notifyDownloadEstimatorSuccess). See {@link api/framework#observables.wps.download.exports.downloadXML|downloadXML}
 * @param {boolean} downloadOptions.notifyDownloadEstimatorSuccess if true, the returned observable emits 'DownloadEstimatorSuccess' string after successful gs:DownloadEstimator run
 * @param {object} executeOptions options to pass to executeProcess. See {@link api/framework#observables.wps.execute.exports.executeProcess|executeProcess}
 */
export const download = (url, downloadOptions, executeOptions) => {
    if (url && downloadOptions) {
        const downloadEstimator$ = executeProcess(url, downloadEstimatorXML({
            layerName: downloadOptions.layerName,
            ROI: downloadOptions.ROI,
            roiCRS: downloadOptions.roiCRS,
            dataFilter: downloadOptions.dataFilter,
            targetCRS: downloadOptions.targetCRS
        }), {outputsExtractor: makeOutputsExtractor(literalDataOutputExtractor)});

        // use the same format of outputFormat for result
        // if resultOutput param is undefined
        const resultOutput = downloadOptions.resultOutput || downloadOptions.outputFormat || 'application/zip';

        const executeProcess$ = executeProcess(url, downloadXML({
            ...omit(downloadOptions, 'notifyDownloadEstimatorSuccess', 'attribute'),
            outputAsReference: downloadOptions.asynchronous ? downloadOptions.outputAsReference : false,
            resultOutput
        }), executeOptions, {headers: {'Content-Type': 'application/xml', 'Accept': `application/xml, ${resultOutput}`}});

        return downloadEstimator$
            .catch(() => {
                throw new Error('DownloadEstimatorException');
            })
            .mergeMap((estimatorResult = []) => {
                if (estimatorResult.length > 0 && estimatorResult[0].identifier === 'result' && estimatorResult[0].data === 'true') {
                    if (downloadOptions.notifyDownloadEstimatorSuccess) {
                        return Observable.of('DownloadEstimatorSuccess').concat(executeProcess$);
                    }
                    return executeProcess$;
                }

                throw new Error('DownloadEstimatorFailed');
            });
    }

    return Observable.empty();
};
