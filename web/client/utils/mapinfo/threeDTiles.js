/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import isObject from 'lodash/isObject';

export default {
    buildRequest: (layer, { point, currentLocale } = {}) => {
        const { features = [] } = point?.intersectedFeatures?.find(({ id }) => id === layer.id) || {};
        return {
            request: {
                features: [...features],
                outputFormat: 'application/json'
            },
            metadata: {
                title: isObject(layer.title)
                    ? layer.title[currentLocale] || layer.title.default
                    : layer.title
            },
            url: 'client'
        };
    },
    getIdentifyFlow: (layer, baseURL, { features = [] } = {}) => {
        return Observable.of({
            data: {
                features
            }
        });
    }
};
