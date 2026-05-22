/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/leaflet/Layers';
import { isEqual, isNil } from 'lodash';
import L from 'leaflet';
import {
    getStyle
} from '../../../../utils/VectorStyleUtils';
import { applyDefaultStyleToVectorLayer } from '../../../../utils/StyleUtils';
import { createVectorFeatureFilter } from '../../../../utils/FilterUtils';
import { DEFAULT_SCREEN_DPI, getScale } from '../../../../utils/MapUtils';
import { geoStylerScaleDenominatorFilter } from '../../../../utils/styleparser/StyleParserUtils';

/**
 * Check if layer should be visible at current scale
 */
const checkScaleVisibility = (options) => {
    const styleRules = options?.style?.body?.rules || [];
    if (styleRules.length === 0) {
        return true; // No scale rules means always visible
    }

    const scale = getScale(options.srs, DEFAULT_SCREEN_DPI, options?.resolution) || 0;
    if (!scale || isNaN(scale)) return true;
    const validRules = styleRules.filter(rule =>
        geoStylerScaleDenominatorFilter(rule, Math.round(scale))
    );

    return validRules.length > 0;
};

const setOpacity = (layer, opacity) => {
    if (layer.eachLayer) {
        layer.eachLayer(l => {
            if (l.setOpacity) {
                l.setOpacity(opacity);
            }
            setOpacity(l, opacity);
        });
    }
};

const createVectorLayer = function(options) {
    const { hideLoading } = options;
    const layer = L.geoJson([]/* options.features */, {
        pointToLayer: options.styleName !== "marker" ? function(feature, latlng) {
            return L.circleMarker(latlng, feature.style || options.style);
        } : null,
        hideLoading: hideLoading
    });
    layer.setOpacity = (opacity) => {
        setOpacity(layer, opacity);
    };
    layer.on('layeradd', ({layer: featureLayer}) => {
        layer.setOpacity(!isNil(layer.opacity) ? layer.opacity : options.opacity, featureLayer);
    });
    return layer;
};

const isNewStyle = (options) => (options?.style?.body && options?.style?.format);

const createLayerLegacy = (options) => {
    const layer = createVectorLayer(options);
    // layer.opacity will store the opacity value
    layer.opacity = !isNil(options.opacity) ? options.opacity : 1.0;
    layer._msLegacyGeoJSON = true;
    return layer;
};

const createLayer = (options) => {
    const { hideLoading } = options;
    const vectorFeatureFilter = createVectorFeatureFilter(options);
    const isScaleVisible = checkScaleVisibility(options);
    let featuresToRender = isScaleVisible
        ? options.features.filter(vectorFeatureFilter)
        : [];
    const layer = L.geoJson(featuresToRender, {
        hideLoading: hideLoading
    });
    if (!isScaleVisible) {
        layer._filteredWithScaleLimits = true;
    }
    getStyle(applyDefaultStyleToVectorLayer(options), 'leaflet')
        .then((styleUtils) => {
            styleUtils({ opacity: options.opacity, layer, features: featuresToRender })
                .then(({
                    style: styleFunc,
                    pointToLayer = () => null,
                    filter: filterFunc = () => true
                } = {}) => {
                    layer.clearLayers();
                    layer.options.pointToLayer = pointToLayer;
                    layer.options.filter = filterFunc;
                    layer.addData(featuresToRender);
                    layer.setStyle(styleFunc);
                });
        });
    return layer;
};

const updateLayerLegacy = (layer, newOptions, oldOptions) => {
    if (newOptions.opacity !== oldOptions.opacity) {
        layer.opacity = newOptions.opacity;
    }
    if (!isEqual(newOptions.style, oldOptions.style) || !isEqual(oldOptions.security, newOptions.security)) {
        return isNewStyle(newOptions)
            ? createLayer(newOptions)
            : createLayerLegacy(newOptions);
    }
    return null;
};

const updateLayer = (layer, newOptions, oldOptions) => {
    if (!isEqual(oldOptions.layerFilter, newOptions.layerFilter) || !isEqual(oldOptions.security, newOptions.security)) {
        layer.remove();
        return createLayer(newOptions);
    }
    const isScaleVisible = checkScaleVisibility(newOptions);
    if (!isScaleVisible) {
        if (!layer._filteredWithScaleLimits) {
            layer.clearLayers();
            layer._filteredWithScaleLimits = true;
        }
        return null;
    }

    if (!isEqual(oldOptions.style, newOptions.style)
    || newOptions.opacity !== oldOptions.opacity || layer._filteredWithScaleLimits) {
        layer._filteredWithScaleLimits = false;
        getStyle(applyDefaultStyleToVectorLayer(newOptions), 'leaflet')
            .then((styleUtils) => {
                styleUtils({ opacity: newOptions.opacity, layer, features: newOptions.features })
                    .then(({
                        style: styleFunc,
                        pointToLayer = () => null,
                        filter: filterFunc = () => true
                    } = {}) => {
                        layer.clearLayers();
                        layer.options.pointToLayer = pointToLayer;
                        layer.options.filter = filterFunc;
                        layer.addData(newOptions.features);
                        layer.setStyle(styleFunc);
                    });
            });
    }
    return null;
};

Layers.registerType('vector', {
    create: (options) => {
        return !isNewStyle(options)
            ? createLayerLegacy(options)
            : createLayer(options);
    },
    update: (layer, newOptions, oldOptions) => layer._msLegacyGeoJSON
        ? updateLayerLegacy(layer, newOptions, oldOptions)
        : updateLayer(layer, newOptions, oldOptions),
    render: () => {
        return null;
    }
});
