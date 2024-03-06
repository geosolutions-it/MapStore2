/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/cesium/Layers';
import isEqual from 'lodash/isEqual';
import axios from 'axios';
import {
    getStyle,
    layerToGeoStylerStyle,
    flattenFeatures
} from '../../../../utils/VectorStyleUtils';
import { applyDefaultStyleToVectorLayer } from '../../../../utils/StyleUtils';
import GeoJSONStyledFeatures from  '../../../../utils/cesium/GeoJSONStyledFeatures';

const setStyleToFeats = (options, styledFeatures, appendedFeatures = []) => {
    layerToGeoStylerStyle(options)
        .then((style) => {
            let getStyleOptions = { ...options, style };
            if (appendedFeatures.length) getStyleOptions.features = appendedFeatures;
            getStyle(applyDefaultStyleToVectorLayer(getStyleOptions), 'cesium')
                .then((styleFunc) => {
                    styledFeatures.setStyleFunction(styleFunc);
                });
        });
};

const createLayer = (options, map) => {
    var styledFeatures;
    if (!options.visibility) {
        return {
            detached: true,
            styledFeatures: undefined,
            remove: () => {}
        };
    }

    const features = flattenFeatures(options?.features || [], ({ style, ...feature }) => feature);

    styledFeatures = new GeoJSONStyledFeatures({
        features,
        id: options?.id,
        map: map,
        opacity: options.opacity,
        queryable: options.queryable === undefined || options.queryable
    });
    if (options?.isGeojson && options?.url) {
        axios(options?.url)
            .then(res => res.data)
            .then(collection => {
                styledFeatures.setFeatures(collection.features);
                setStyleToFeats(options, styledFeatures, collection.features);
            });
    } else {
        setStyleToFeats(options, styledFeatures);
    }
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

Layers.registerType('vector', {
    create: createLayer,
    update: (layer, newOptions, oldOptions, map) => {
        if (!isEqual(newOptions.features, oldOptions.features)) {
            return createLayer(newOptions, map);
        }

        if (layer?.styledFeatures && !isEqual(newOptions.style, oldOptions.style)) {
            layerToGeoStylerStyle(newOptions)
                .then((style) => {
                    getStyle(applyDefaultStyleToVectorLayer({ ...newOptions, style }), 'cesium')
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
