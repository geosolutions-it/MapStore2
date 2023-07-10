/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import castArray from 'lodash/castArray';
import findIndex from 'lodash/findIndex';
import head from 'lodash/head';
import isNil from 'lodash/isNil';
import Rx from 'rxjs';
import { parseString } from 'xml2js';
import { stripPrefix } from 'xml2js/lib/processors';

import {
    CHECK_WPS_AVAILABILITY,
    GET_FEATURES,
    checkingWPSAvailability,
    checkedWPSAvailability,
    errorLoadingDFT,
    getFeatures,
    setFeatures,
    setWPSAvailability,
    setFeatureSourceLoading
} from '../actions/geoProcessingTools';
import { getDescribeLayer, DESCRIBE_FEATURE_TYPE_LOADED } from '../actions/layerCapabilities';
import { getLayerJSONFeature } from '../observables/wfs';
// import { error } from '../actions/notifications';
// import { getLayerWFSCapabilities, getXMLFeature } from '../observables/wfs';
import { describeProcess } from '../observables/wps/describe';
import { getLayerFromId as getLayerFromIdSelector } from '../selectors/layers';

import { extractFirstNonGeometryProp } from '../utils/WFSLayerUtils';

// const { getFeature: getFilterFeature, query, sortBy, propertyName } = requestBuilder({ wfsVersion: "1.1.0" });
// [ ] reuse this or part of this, generalized it in WPSUtils (see where is used, like layerdownload)?
/*
const wpsExecuteErrorToMessage = e => {
    switch (e.code) {
    case 'ProcessFailed': {
        return {
            msgId: 'layerdownload.wpsExecuteError.processFailed',
            msgParams: {
                exceptionReport: e.message
            }
        };
    }
    case 'NoStatusLocation':
    case 'NoExecutionId':
    case 'UnexpectedProcessStatus': {
        return {
            msgId: 'layerdownload.wpsExecuteError.badResponse',
            msgParams: {
                eCode: e.code
            }
        };
    }
    case 'ExecuteProcessXHRFailed': {
        return {
            msgId: 'layerdownload.wpsExecuteError.executeProcessXhrFailed'
        };
    }
    case 'GetExecutionStatusXHRFailed': {
        return {
            msgId: 'layerdonwload.wpsExecuteError.getExecutionStatusXhrFailed'
        };
    }
    default: {
        return {
            msgId: 'layerdownload.wpsExecuteError.unexpectedError'
        };
    }
    }
};*/
export const checkWPSAvailabilityGPTEpic = (action$, store) => action$
    .ofType(CHECK_WPS_AVAILABILITY)
    .switchMap(({layerId, source}) => {
        const state = store.getState();
        const layer = getLayerFromIdSelector(state, layerId);
        const layerUrl = head(castArray(layer.url));
        return describeProcess(layerUrl, "geo:buffer,gs:IntersectionFeatureCollection,gs:CollectGeometries")
            .switchMap(response => Rx.Observable.defer(() => new Promise((resolve, reject) => parseString(response.data, {tagNameProcessors: [stripPrefix]}, (err, res) => err ? reject(err) : resolve(res)))))
            .flatMap(xmlObj => {
                const ids = [
                    xmlObj?.ProcessDescriptions?.ProcessDescription?.[0]?.Identifier?.[0],
                    xmlObj?.ProcessDescriptions?.ProcessDescription?.[1]?.Identifier?.[0],
                    xmlObj?.ProcessDescriptions?.ProcessDescription?.[2]?.Identifier?.[0]
                ];
                const areAllWpsAvailable = ["geo:buffer", "gs:IntersectionFeatureCollection", "gs:CollectGeometries"].reduce((status, process) => {
                    return status && findIndex(ids, x => x === process) > -1;
                }, true);

                const actions = [
                    setWPSAvailability(layerId, areAllWpsAvailable),
                    checkingWPSAvailability(false),
                    checkedWPSAvailability(true)
                ];
                if (areAllWpsAvailable) {
                    actions.push(getDescribeLayer(layerUrl, layer, {}, source));
                }
                return Rx.Observable.from(actions);
            })
            .catch((e) => {
                console.error(e);
                return Rx.Observable.of(setWPSAvailability(layerId, false), checkingWPSAvailability(false), checkedWPSAvailability(true));
            })
            .startWith(checkingWPSAvailability(true));
    });

export const triggerGetFeaturesGPTEpic = (action$) => action$
    .ofType(DESCRIBE_FEATURE_TYPE_LOADED)
    .switchMap(({layerId, source}) => {
        return Rx.Observable.of(getFeatures(layerId, source));
    });

export const getFeaturesGPTEpic = (action$, store) => action$
    .ofType(GET_FEATURES)
    .switchMap(({layerId, source}) => {
        const state = store.getState();
        const layer = getLayerFromIdSelector(state, layerId);
        const filterObj = null;
        if (isNil(layer.describeFeatureType)) {
            // throw error and notify user that a failure has happened
            return Rx.Observable.of(errorLoadingDFT(layerId));
        }
        const options = {
            propertyName: extractFirstNonGeometryProp(layer.describeFeatureType)
        };
        return Rx.Observable.merge(
            getLayerJSONFeature({
                ...layer,
                name: layer?.name,
                search: {
                    ...(layer?.search ?? {}),
                    url: layer.url
                }
            }, filterObj, options)
                .map(data => setFeatures(layerId, source, data))
                .catch(error => {
                    console.error(error);
                    return Rx.Observable.of(setFeatures(layerId, source, error));
                })
                .startWith(setFeatureSourceLoading(true))
                .concat(Rx.Observable.of(setFeatureSourceLoading(false))));

    });
