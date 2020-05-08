
import { isString, isNil } from 'lodash';
import { Observable } from 'rxjs';

import MapInfoUtils from '../utils/MapInfoUtils';
import axios from '../libs/ajax';
import {parseURN} from '../utils/CoordinatesUtils';


/**
 * Sends a GetFeatureInfo request and dispatches the right action
 * in case of success, error or exceptions.
 *
 * @param basePath {string} base path to the service
 * @param requestParams {object} map of params for a getfeatureinfo request.
 */
export const getFeatureInfo = (basePath, param, attachJSON, itemId = null, layer) => {
    const retrieveFlow = (params) => Observable.defer(() => axios.get(basePath, { params }));
    // TODO: move getRetrieveFlow in specific a
    return MapInfoUtils.getIdentifyFlow(layer, basePath, param) ||
        (
        // default identify flow, valid for WMS/WMTS. It attach json data, if missing, for advanced features. TODO: make this specific by service, using layer info.
            (attachJSON && param.info_format !== "application/json")
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
