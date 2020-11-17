/**
  * Copyright 2020, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import { Observable } from 'rxjs';
import { toPairs, keys, omit } from 'lodash';

import {
    processParameter,
    processData,
    literalData,
    complexData,
    cdata,
    processReference,
    processOutput,
    responseForm,
    responseDocument,
    rawDataOutput,
    writingParametersData,
    downloadParameter
} from './common';
import { literalDataOutputExtractor, makeOutputsExtractor, executeProcess, executeProcessXML } from './execute';

export const roiOrFilterToXML = ({type, data}) => type === 'TEXT' ?
    processData(complexData(cdata(data.data), data.mimeType)) :
    processReference(data.mimeType, data.href, data.method, cdata(data.requestBodyData));

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

export const download = (layerUrl, downloadOptions, executeOptions) => {
    if (layerUrl && downloadOptions) {
        const downloadEstimator$ = executeProcess(layerUrl, downloadEstimatorXML({
            layerName: downloadOptions.layerName,
            ROI: downloadOptions.ROI,
            roiCRS: downloadOptions.roiCRS,
            dataFilter: downloadOptions.dataFilter,
            targetCRS: downloadOptions.targetCRS
        }), {outputsExtractor: makeOutputsExtractor(literalDataOutputExtractor)});
        const executeProcess$ = executeProcess(layerUrl, downloadXML({
            ...omit(downloadOptions, 'notifyDownloadEstimatorSuccess'),
            outputAsReference: downloadOptions.asynchronous ? downloadOptions.outputAsReference : false
        }), executeOptions, {headers: {'Content-Type': 'application/xml', 'Accept': `application/xml, ${downloadOptions.resultOutput || 'application/zip'}`}});

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
