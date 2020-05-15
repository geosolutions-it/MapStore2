/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isNil, isEqual } from 'lodash';
import L from 'leaflet';
import { colorToRgbaStr } from '../../../../utils/ColorUtils';

import CoordinatesUtils from '../../../../utils/CoordinatesUtils';
import Layers from '../../../../utils/leaflet/Layers';
import { optionsToVendorParams } from '../../../../utils/VendorParamsUtils';

import { getFeature } from '../../../../api/WFS';
import { needsReload } from '../../../../utils/WFSLayerUtils';


const loadFeatures = (layer, options) => {
    layer.fireEvent('loading');
    const params = optionsToVendorParams(options);
    const onError = () => {
        layer.fireEvent('loadError');
        // // TODO: notify error
    };
    return getFeature(options.url, options.name, {
        // bbox: extent.join(',') + ',' + proj,
        outputFormat: "application/json",
        maxFeatures: 1000,
        srsname: CoordinatesUtils.normalizeSRS( 'EPSG:4326'),
        ...params
    }).then(response => {
        if (response.status === 200) {
            layer.clearLayers();
            layer.addData(response.data);
            layer.fireEvent('load');
        } else {
            console.error(response);// eslint-disable-line
            onError(new Error("status code of response:" + response.status));
        }
        return layer;
    }).catch(e => {
        onError(e);
    });

};

const toSingleOpacityStyle = style => {
    const {
        color,
        fillColor,
        ...other
    } = style || {};
    return {
        ...other,
        color: colorToRgbaStr(color, 1),
        fillColor: colorToRgbaStr(fillColor, 1)
    };
};
const getStyle = (options = {}) => {
    const style = options.style && options.style[0] || options.style;
    return toSingleOpacityStyle(style);

};
const setStyle = (layer, options) => {
    const style = getStyle(options);
    layer.setStyle(style);
    layer.options.style = (style);
    layer.styleName = options.styleName;
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

var createVectorLayer = function(options, features = []) {
    const style = getStyle(options);
    const pointToLayer = function(feature, latlng) {
        if (options.styleName === "marker") {
            return L.marker(latlng, style);
        }
        return L.circleMarker(latlng, style);
    };
    const layer = new L.GeoJSON(features, {
        pointToLayer,
        // hideLoading: hideLoading,
        style: style // TODO: ol nativeStyle should not be taken from the store
    });
    layer.setOpacity = function(layerOpacity = 1) {
        const originalStyle = { ...layer.options.style || {}};
        const {fillOpacity = 1, opacity = 1 } = originalStyle;
        const opacityStyle = {
            ...originalStyle,
            opacity: opacity * layerOpacity,
            fillOpacity: fillOpacity * layerOpacity
        };
        layer.setStyle(toSingleOpacityStyle(opacityStyle));
        setOpacity(layer, layerOpacity);
    };
    layer.on('layeradd', () => {
        setStyle(layer, options);
        layer.setOpacity(!isNil(layer.opacity) ? layer.opacity : options.opacity);
    });
    return layer;
};

Layers.registerType('wfs', {
    create: (options) => {
        const layer = createVectorLayer(options);
        loadFeatures(layer, options);
        // layer.opacity will store the opacity value
        // to be applied to layer style once the layer is ready
        layer.opacity = !isNil(options.opacity) ? options.opacity : 1.0;
        return layer;
    },
    update: (layer, newOptions, oldOptions) => {
        if (newOptions.opacity !== oldOptions.opacity) {
            layer.opacity = newOptions.opacity;
        }
        if (needsReload(oldOptions, newOptions)) {
            loadFeatures(layer, newOptions);
        }
        if (!isEqual(newOptions.style, oldOptions.style) ) {
            setStyle(layer, newOptions);
        }
        if (newOptions.styleName !== oldOptions.styleName) {
            const {features} = layer.toGeoJSON();
            return createVectorLayer(newOptions, features);
        }
        return null;
    },
    render: () => {
        return null;
    }
});
