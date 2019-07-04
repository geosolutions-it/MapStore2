/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { parse, format } from 'url';
import { get } from 'lodash';
import {timeSyncActive, selectedLayerIdSelector} from '../selectors/featuregrid';
import { getLayerFromId } from '../selectors/layers';
import { layerDimensionSelectorCreator } from '../selectors/dimension';


/**
 * Add the time parameter to the URL.
 * TODO: this have to be refactored as well as GeoServer supports time parameter for WFS 1 and 2
 * To add it as options in WFS request body instead of making it as a KVP
 */
export const addTimeParameter = (url, options, state) => {
    // TODO: Options are included for two purposes
    // - could be parsed to replace selectors with time value from options
    // - should be modified to add time
    const id = selectedLayerIdSelector(state);
    const hasTimeDim = layerDimensionSelectorCreator({id}, "time")(state);
    const layer = getLayerFromId(state, id) || {};
    const time = get(layer, 'params["time"]');
    if (timeSyncActive(state) && hasTimeDim && time) {
        const parsed = parse(url) || {};
        return {
            url: format({
                ...parsed,
                query: {
                    ...parsed.query,
                    time
                }
            }),
            options
        };
    }
    return {url, options};
};

