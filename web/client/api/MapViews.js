/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { getFeature } from './WFS';
import { createInverseMaskFromPolygonFeatureCollection } from '../utils/MapViewsUtils';

const getLayerRequestKey = (layer, { inverse, offset }) => `${layer.id};inverse:${inverse};offset:${offset}`;

export const getResourceFromLayer = ({ resourceId: existingResourceId, layer, resources, inverse = false, offset = 0 } = {}) => {
    const resourceId = existingResourceId ?? getLayerRequestKey(layer, { inverse, offset });
    const resource = resources?.find(res => res.id === resourceId);
    if (!resource?.data?.collection) {
        const request = {
            wfs: () => getFeature(layer.url, layer.name, {
                outputFormat: 'application/json',
                srsname: 'EPSG:4326'
            }).then(({ data: collection }) => collection),
            vector: () => Promise.resolve({ type: 'FeatureCollection', features: layer.features ?? [] })
        };
        return request[layer.type]()
            .then((collection) => inverse
                ? createInverseMaskFromPolygonFeatureCollection(collection, { offset })
                : collection
            )
            .then((collection) => {
                return {
                    id: resourceId,
                    updated: true,
                    data: {
                        type: layer.type,
                        name: layer.name,
                        title: layer.title,
                        url: layer.url,
                        id: layer.id,
                        collection
                    }
                };
            });
    }
    return Promise.resolve(resource);
};
