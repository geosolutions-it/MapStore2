/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Layers = require('../../../../utils/leaflet/Layers');
var L = require('leaflet');

var defaultStyle = {
    radius: 5,
    color: "red",
    weight: 1,
    opacity: 1,
    fillOpacity: 0
};

const assign = require('object-assign');

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
            return L.circleMarker(latlng, options.style || defaultStyle);
        } : null,
        hideLoading: hideLoading,
        style: options.nativeStyle || options.style || defaultStyle // TODO ol nativeStyle should not be taken from the store
    });
    layer.setOpacity = (opacity) => {
        const style = assign({}, layer.options.style || defaultStyle, { opacity: opacity, fillOpacity: opacity });
        layer.setStyle(style);
        setOpacity(layer, opacity);
    };
    layer.on('layeradd', () => {
        layer.setOpacity(layer.opacity || options.opacity);
    });
    return layer;
};

Layers.registerType('vector', {
    create: (options) => {
        const layer = createVectorLayer(options);
        // layer.opacity will store the opacity value
        // to be applied to layer style once the layer is ready
        layer.opacity = options.opacity || 1.0;
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
