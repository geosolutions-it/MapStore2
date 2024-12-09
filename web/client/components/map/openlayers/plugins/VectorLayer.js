/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/openlayers/Layers';

import {getStyle} from '../VectorStyle';
import isEqual from 'lodash/isEqual';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { applyDefaultStyleToVectorLayer } from '../../../../utils/StyleUtils';

Layers.registerType('vector', {
    create: (options, map) => {
        let features = [];

        const source = new VectorSource({
            features: features,
            // spatial index is removing feature that are not currently in view
            // usually vector layer has a low count of features (eg annotation)
            // so we could disable it (doc states it improve performance at false with low count of features)
            // this helps also to make the circle style visible even if the center is out of the view
            // when the spatial index is active the renderBuffer of vector layer is used to filter features
            // we could implement a different loading strategy to visualize correctly the Circle style and Geodesic lines
            useSpatialIndex: false
        });

        const layer = new VectorLayer({
            msId: options.id,
            source: source,
            visible: options.visibility !== false,
            zIndex: options.zIndex,
            opacity: options.opacity,
            minResolution: options.minResolution,
            maxResolution: options.maxResolution
        });

        getStyle(applyDefaultStyleToVectorLayer({ ...options, asPromise: true }))
            .then((style) => {
                if (style) {
                    if (style.__geoStylerStyle) {
                        style({ map, features: options.features })
                            .then((olStyle) => {
                                layer.setStyle(olStyle);
                            });
                    } else {
                        layer.setStyle(style);
                    }
                }
            });

        return layer;
    },
    update: (layer, newOptions, oldOptions, map) => {
        const oldCrs = oldOptions.crs || oldOptions.srs || 'EPSG:3857';
        const newCrs = newOptions.crs || newOptions.srs || 'EPSG:3857';
        if (newCrs !== oldCrs) {
            layer.getSource().forEachFeature((f) => {
                f.getGeometry().transform(oldCrs, newCrs);
            });
        }

        /**
         * we need to also check when features changes because there could be styles depending of features
         * so when the latter changes we have to redraw to redo the checks and apply correct style based on new feature props
        */
        const areFeaturesChanged = !isEqual(oldOptions.features, newOptions.features);

        const isStyleChanged = !isEqual(oldOptions.style, newOptions.style);
        const isStyleNameChanged = oldOptions.styleName !== newOptions.styleName;
        if (
            isStyleChanged ||
            isStyleNameChanged ||
            areFeaturesChanged
        ) {
            getStyle(applyDefaultStyleToVectorLayer({ ...newOptions, asPromise: true }))
                .then((style) => {
                    if (style) {
                        if (style.__geoStylerStyle) {
                            style({ map, features: newOptions.features })
                                .then((olStyle) => {
                                    layer.setStyle(olStyle);
                                });
                        } else {
                            layer.setStyle(style);
                        }
                    }
                });
        }

        if (oldOptions.minResolution !== newOptions.minResolution) {
            layer.setMinResolution(newOptions.minResolution === undefined ? 0 : newOptions.minResolution);
        }
        if (oldOptions.maxResolution !== newOptions.maxResolution) {
            layer.setMaxResolution(newOptions.maxResolution === undefined ? Infinity : newOptions.maxResolution);
        }
    },
    render: () => {
        return null;
    }
});

