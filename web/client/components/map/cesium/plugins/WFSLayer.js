/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/cesium/Layers';
import isEqual from 'lodash/isEqual';
import axios from '../../../../libs/ajax';
import { getFeature } from '../../../../api/WFS';
import { needsReload } from '../../../../utils/WFSLayerUtils';
import { optionsToVendorParams } from '../../../../utils/VendorParamsUtils';
import {
    getStyle,
    layerToGeoStylerStyle
} from '../../../../utils/VectorStyleUtils';
import { applyDefaultStyleToVectorLayer } from '../../../../utils/StyleUtils';
import GeoJSONStyledFeatures from  '../../../../utils/cesium/GeoJSONStyledFeatures';

const requestFeatures = (options, params, cancelToken) => {
    return getFeature(options.url, options.name, {
        // ...(!params?.CQL_FILTER && { bbox: [minx, miny, maxx, maxy, projection].join(',') }),
        outputFormat: 'application/json',
        srsname: 'EPSG:4326',
        ...params
    }, {
        cancelToken
    });
};

const createLayer = (options, map) => {

    if (!options.visibility) {
        return {
            detached: true,
            styledFeatures: undefined,
            remove: () => {}
        };
    }

    let styledFeatures = new GeoJSONStyledFeatures({
        features: [],
        id: options?.id,
        map: map,
        opacity: options.opacity,
        queryable: options.queryable === undefined || options.queryable
    });
    const params = optionsToVendorParams(options);

    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();
    requestFeatures(options, params, source.token)
        .then(({ data: collection }) => {
            styledFeatures.setFeatures(collection.features);
            layerToGeoStylerStyle(options)
                .then((style) => {
                    getStyle(applyDefaultStyleToVectorLayer({
                        ...options,
                        features: collection.features,
                        style
                    }), 'cesium')
                        .then((styleFunc) => {
                            styledFeatures.setStyleFunction(styleFunc);
                        });
                });
        });

    return {
        detached: true,
        styledFeatures,
        remove: () => {
            if (styledFeatures) {
                styledFeatures.destroy();
                styledFeatures = undefined;
            }
        }
    };
};

Layers.registerType('wfs', {
    create: createLayer,
    update: (layer, newOptions, oldOptions, map) => {
        if (needsReload(oldOptions, newOptions)) {
            return createLayer(newOptions, map);
        }
        if (layer?.styledFeatures && !isEqual(newOptions.style, oldOptions.style)) {
            layerToGeoStylerStyle(newOptions)
                .then((style) => {
                    getStyle(applyDefaultStyleToVectorLayer({
                        ...newOptions,
                        features: layer?.styledFeatures?._originalFeatures,
                        style
                    }), 'cesium')
                        .then((styleFunc) => {
                            layer.styledFeatures.setStyleFunction(styleFunc);
                        });
                });
        }
        if (layer?.styledFeatures && newOptions.opacity !== oldOptions.opacity) {
            layer.styledFeatures.setOpacity(newOptions.opacity);
        }
        return null;
    }
});
