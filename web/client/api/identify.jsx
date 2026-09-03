/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { isString, isNil } from 'lodash';
import { Observable } from 'rxjs';

import {buildIdentifyRequest, buildIdentifyRequestPlan, getIdentifyFlow, isDataFormat} from '../utils/MapInfoUtils';
import axios from '../libs/ajax';
import {parseURN} from '../utils/CoordinatesUtils';
import { GEOJSON_MIME_TYPE, JSON_MIME_TYPE } from '../utils/FeatureInfoUtils';


/**
 * Sends a GetFeatureInfo request and dispatches the right action
 * in case of success, error or exceptions.
 *
 * @param {string} basePath base path to the service
 * @param {object} param object map of params for a getFeatureInfo request.
 * @param {object} layer the layer object.
 * @param {object} options. object of other options for the request.
 *  - `attachJSON` do, if needed, an additional request to get data in JSON format, that can be parsed and used to add functionalities (zoom to feature, highlight)
 *  - `itemId` if present, data will be filtered to get only the specific itemID. Useful to create a unique response (only JSON format is supported)
 */
export const getFeatureInfo = (basePath, param, layer, {attachJSON, itemId = null} = {}) => {
    const defaultIdentifyFlow = (params) => Observable.defer(() => axios.get(basePath, { params }));
    const specificIdentifyFlow = (params) => getIdentifyFlow(layer, basePath, params);
    const retrieveFlow = getIdentifyFlow(layer, basePath, param)
        ? specificIdentifyFlow
        : defaultIdentifyFlow;
    // TODO: We should move MapInfoUtils parts of the API here, with specific implementations.
    return (
        // default identify flow, valid for WMS/WMTS. It attach json data, if missing, for advanced features. TODO: make this specific by service, using layer info.
        (attachJSON && !isDataFormat(param))
        // add to the flow data in JSON format for highlight/zoom to feature
            ? Observable.forkJoin(
                retrieveFlow(param),
                retrieveFlow({ ...param, info_format: layer?.infoFormats?.includes(GEOJSON_MIME_TYPE) ? GEOJSON_MIME_TYPE : JSON_MIME_TYPE })
                    .map(res => res.data)
                    .catch(() => Observable.of({})) // errors on geometry retrieval are ignored
            ).map(([response, data]) => ({
                ...response,
                features: data && data.features && data.features.filter(f => !isNil(itemId) ? f.id === itemId : true),
                featuresCrs: data && data.crs && parseURN(data.crs)
            }))
            // simply get the feature info, geometry is already there
            : retrieveFlow(param)
                .map(res => res.data)
                .map((data = {}) => ({
                    data: isString(data) ? data : {
                        ...data,
                        features: data.features && data.features.filter(f => itemId ? f.id === itemId : true)
                    },
                    features: data.features && data.features.filter(f => itemId ? f.id === itemId : true),
                    featuresCrs: data && data.crs && parseURN(data.crs)
                }))
    );
};

const associateResponsesToViews = (responses) => responses.reduce((viewResponses, { response, requestParams, viewIds = [] }) => {
    viewIds.forEach((viewId) => {
        viewResponses[viewId] = {
            response: response.data,
            queryParams: requestParams
        };
    });
    return viewResponses;
}, {});

/**
 * Runs the identify requests needed by the views configured on a layer, grouping the responses by view id.
 * @param {object} layer the layer object
 * @param {object} identifyOptions options used to build the requests (map, point, format, env)
 * @param {object} options
 * @param {object} options.params params applied to every request
 * @param {object} options.requestOptions options forwarded to `getFeatureInfo`
 * @param {function} options.mapRequestParams overrides the params of every request
 * @return {Observable|null} null when the layer has no request to perform
 */
export const getFeatureInfoForViews = (layer, identifyOptions, {
    params = {},
    requestOptions = {},
    mapRequestParams = (requestParams) => requestParams
} = {}) => {
    const { views, requests } = buildIdentifyRequestPlan(layer, identifyOptions);
    if (!requests.length) {
        return null;
    }
    // metadata belongs to the layer, not to one of its view requests
    const { metadata: layerMetadata = {} } = buildIdentifyRequest(layer, identifyOptions);
    return Observable.forkJoin(requests.map(({ url, request, viewIds }) => {
        const requestParams = mapRequestParams(request);
        return getFeatureInfo(url, { ...params, ...requestParams }, layer, requestOptions)
            // vector/3dtiles responses are synchronous, the delay lets the panel render its spinner
            // and avoids freezing the app when many layers are queried at once
            .delay(0)
            .map((response) => ({ response, requestParams, viewIds }))
            .catch((error) => Observable.of({ error, requestParams, viewIds }));
    })).map((results) => {
        const responses = results.filter(({ error }) => !error);
        if (!responses.length) {
            return { views, layerMetadata, error: results.find(({ error }) => error)?.error };
        }
        const featureResponse = responses.find(({ response }) => response.features?.length)
            || responses.find(({ response }) => response.features)
            || responses[0];
        return {
            views,
            layerMetadata,
            viewResponses: associateResponsesToViews(responses),
            features: featureResponse.response.features,
            featuresCrs: featureResponse.response.featuresCrs,
            primaryResponse: {
                response: featureResponse.response.data,
                queryParams: featureResponse.requestParams
            }
        };
    });
};
