/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {isNil} from 'lodash';
import L from 'leaflet';

import CoordinatesUtils from '../../../../utils/CoordinatesUtils';
import Layers from '../../../../utils/leaflet/Layers';
import { optionsToVendorParams } from '../../../../utils/VendorParamsUtils';

import { getFeature } from '../../../../api/WFS';
import { needsReload } from '../../../../utils/WFSLayerUtils';
const defaultStyle = {
    radius: 5,
    color: "red",
    weight: 1,
    opacity: 1,
    fillOpacity: 1
};

const loadFeatures = (layer, options) => {
    const params = optionsToVendorParams(options);
    const onError = () => {
        // // TODO: notify error
    };
    return getFeature(options.url, options.name, {
        // bbox: extent.join(',') + ',' + proj,
        outputFormat: "application/json",
        srsname: CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS),
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
    const layer = new L.GeoJSON([{
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [125.6, 10.1]
        },
        "properties": {
            "name": "Dinagat Islands"
        }
    }], {
        // hideLoading: hideLoading,
        style: options.nativeStyle || options.style || defaultStyle // TODO: ol nativeStyle should not be taken from the store
    });
    layer.setOpacity = (opacity) => {
        const style = {
            ...(layer.options.style || defaultStyle),
            opacity: opacity,
            fillOpacity: opacity
        };
        layer.setStyle(style);
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
    },
    render: () => {
        return null;
    }
});
