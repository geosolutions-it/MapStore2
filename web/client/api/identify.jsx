/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { isString, isNil } from 'lodash';
import { Observable } from 'rxjs';

import MapInfoUtils from '../utils/MapInfoUtils';
import axios from '../libs/ajax';
import {parseURN} from '../utils/CoordinatesUtils';


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
    const specificIdentifyFlow = (params) => MapInfoUtils.getIdentifyFlow(layer, basePath, params);
    const retrieveFlow = MapInfoUtils.getIdentifyFlow(layer, basePath, param)
        ? specificIdentifyFlow
        : defaultIdentifyFlow;
    // TODO: We should move MapInfoUtils parts of the API here, with specific implementations.
    return (
        // default identify flow, valid for WMS/WMTS. It attach json data, if missing, for advanced features. TODO: make this specific by service, using layer info.
        (attachJSON && param.info_format !== "application/json" && param.outputFormat !== "application/json")
        // add to the flow data in JSON format for highlight/zoom to feature
            ? Observable.forkJoin(
                retrieveFlow(param),
                retrieveFlow({ ...param, info_format: "application/json" })
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
