/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isNil, isEqual } from 'lodash';
import L from 'leaflet';

import CoordinatesUtils from '../../../../utils/CoordinatesUtils';
import Layers from '../../../../utils/leaflet/Layers';
import { optionsToVendorParams } from '../../../../utils/VendorParamsUtils';

import { getFeature } from '../../../../api/WFS';
import { needsReload } from '../../../../utils/WFSLayerUtils';


const loadFeatures = (layer, options) => {
    const params = optionsToVendorParams(options);
    const onError = () => {
        // // TODO: notify error
    };
    return getFeature(options.url, options.name, {
        // bbox: extent.join(',') + ',' + proj,
        outputFormat: "application/json",
        srsname: CoordinatesUtils.normalizeSRS( 'EPSG:4326'),
        ...params
    }).then(response => {
        if (response.status === 200) {
            layer.clearLayers();
            layer.addData(response.data);
        } else {
            console.error(response);// eslint-disable-line
            onError(new Error("status code of response:" + response.status));
        }
        return layer;
    }).catch(e => {
        onError(e);
    });

};

const setStyle = (layer, options) => {
    layer.setStyle(options.style);
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

const getStyle = options => {
    const style = options.style && options.style[0] || options.style;
    return style;

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
    layer.styleName = options.styleName;
    layer.setOpacity = function(opacity) {
        const opacityStyle = {
            ...(layer.options.style || {}),
            opacity: opacity,
            fillOpacity: opacity
        };
        layer.setStyle(opacityStyle);
        setOpacity(layer, opacity);
    };
    layer.on('layeradd', () => {
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
    },
    render: () => {
        return null;
    }
});
