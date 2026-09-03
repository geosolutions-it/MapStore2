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

        return {
            request: {
                features: [],
                outputFormat: 'application/json',
                intersectedPixelsPromise: point?.intersectedPixelsPromise,
                point: {
                    latlng: point?.latlng
                }
            },
            metadata: {
                title: isObject(layer.title)
                    ? layer.title[currentLocale] || layer.title.default
                    : layer.title
            },
            url: layer.url || layer?.sources?.[0]?.url
        };
    },
    getIdentifyFlow: (layer, _, {features = [], intersectedPixelsPromise, point} = {}) => {

        if (intersectedPixelsPromise && point) {
            return Observable.fromPromise(intersectedPixelsPromise)
                .map((intersectedPixels = []) => {
                    const pickValues = Object.values(intersectedPixels);
                    const arrayValues = pickValues ? Array.from(pickValues) : [];
                    const filteredValues = arrayValues.filter(({ id }) => id === layer.id);
                    return {
                        data: {
                            features: filteredValues.map((value) => ({
                                type: 'Feature',
                                geometry: {
                                    type: 'Point',
                                    coordinates: [point.latlng.lng, point.latlng.lat]
                                },
                                properties: value?.bands ?
                                    Object.entries(value.bands).reduce((acc, [key, val]) => {
                                        acc[`band ${key}`] = val;
                                        return acc;
                                    }, {})
                                    : {}
                            }))
                        }
                    };
                })
                .catch(() => Observable.of({
                    data: {
                        features: []
                    }
                }));
        }

        return Observable.of({
            data: {
                features
            }
        });
    }
};
