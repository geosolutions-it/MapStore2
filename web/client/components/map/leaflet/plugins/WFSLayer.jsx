/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isEqual } from 'lodash';
import L from 'leaflet';

import {normalizeSRS} from '../../../../utils/CoordinatesUtils';
import Layers from '../../../../utils/leaflet/Layers';
import { optionsToVendorParams } from '../../../../utils/VendorParamsUtils';

import { getFeature } from '../../../../api/WFS';
import { needsReload } from '../../../../utils/WFSLayerUtils';
import {
    getStyle,
    layerToGeoStylerStyle
} from '../../../../utils/VectorStyleUtils';
import { applyDefaultStyleToVectorLayer } from '../../../../utils/StyleUtils';

const setStyle = (layer, options) => {
    layerToGeoStylerStyle(options)
        .then((style) => {
            getStyle(applyDefaultStyleToVectorLayer({ ...options, style }), 'leaflet')
                .then((styleUtils) => {
                    const {
                        style: styleFunc,
                        pointToLayer = () => null,
                        filter: filterFunc = () => true
                    } = styleUtils && styleUtils({ opacity: options.opacity, layer }) || {};
                    layer.clearLayers();
                    layer.options.pointToLayer = pointToLayer;
                    layer.options.filter = filterFunc;
                    layer.addData(layer._msFeatures);
                    layer.setStyle(styleFunc);
                });
        });
};

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
        srsname: normalizeSRS( 'EPSG:4326'),
        ...params
    }).then(response => {
        if (response.status === 200) {
            layer.clearLayers();
            // store features in a custom property
            // to avoid issue due to style filtering
            // where `const { features } = layer.toGeoJSON();` could return a partial collection
            layer._msFeatures = {...response.data};
            layer.addData(response.data);
            layer.fireEvent('load');
            setStyle(layer, options);
        } else {
            console.error(response);// eslint-disable-line
            onError(new Error("status code of response:" + response.status));
        }
        return layer;
    }).catch(e => {
        onError(e);
    });

};

Layers.registerType('wfs', {
    create: (options) => {
        const layer = new L.GeoJSON([], {});
        loadFeatures(layer, options);
        return layer;
    },
    update: (layer, newOptions, oldOptions) => {
        if (needsReload(oldOptions, newOptions)) {
            loadFeatures(layer, newOptions);
        }
        if (!isEqual(newOptions.style, oldOptions.style)
        || newOptions.styleName !== oldOptions.styleName
        || newOptions.opacity !== oldOptions.opacity) {
            setStyle(layer, newOptions);
        }
        return null;
    },
    render: () => {
        return null;
    }
});
