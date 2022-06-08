/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios from '../../libs/ajax';
import { getFeatureURL } from '../../api/WFS';
import { setConfigProp } from '../../utils/ConfigUtils';

let cache = {};

self.onmessage = ({ data: { id, location, localConfig, params: workerParams } }) => {

    self.window = { location };

    Object.keys(localConfig).forEach(key => {
        setConfigProp(key, localConfig[key]);
    });

    const { url, typeName, params, config } = workerParams || {};

    const featureUrl = getFeatureURL(url, typeName, params);

    if (cache[featureUrl]) {
        return self.postMessage(cache[featureUrl]);
    }

    return axios.get(featureUrl, config)
        .then((response) => {
            cache[featureUrl] = {
                id,
                payload: {
                    data: response.data
                }
            };
            self.postMessage(cache[featureUrl]);
        })
        .catch(() => {
            self.postMessage({
                id,
                error: true
            });
        });
};
