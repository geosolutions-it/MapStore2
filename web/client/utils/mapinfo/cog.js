/**
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import isObject from 'lodash/isObject';

export default {
    buildRequest: (layer, { point, currentLocale } = {}) => {  // executed for each COG layer in TOC

        const pickValues = Object.values(point?.intersectedPixels);
        const arrayValues = pickValues ? Array.from(pickValues) : [];

        const filteredValues = arrayValues.filter(({ id }) => id === layer.id);

        const features = filteredValues.map((value) => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [point.latlng.lng, point.latlng.lat]
            },
            properties: {
                bands: value?.bands
            }
        }));

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
            url: layer.url
        };
    },
    getIdentifyFlow: (layer, basePath, {features = []} = {}) => {

        return Observable.of({
            data: {
                features: [...features]
            }
        });
    }
};
