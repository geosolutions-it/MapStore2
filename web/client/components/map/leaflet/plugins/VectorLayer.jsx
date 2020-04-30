/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Layers = require('../../../../utils/leaflet/Layers');
const { isNil } = require('lodash');
const L = require('leaflet');

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

var createVectorLayer = function(options) {
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

Layers.registerType('vector', {
    create: (options) => {
        const layer = createVectorLayer(options);
        // layer.opacity will store the opacity value
        layer.opacity = !isNil(options.opacity) ? options.opacity : 1.0;
        return layer;
    },
    update: (layer, newOptions, oldOptions) => {
        if (newOptions.opacity !== oldOptions.opacity) {
            layer.opacity = newOptions.opacity;
        }
    },
    render: () => {
        return null;
    }
});
