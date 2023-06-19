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
            features: features
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
                    const olStyle = style.__geoStylerStyle
                        ? style({ map })
                        : style;
                    layer.setStyle(olStyle);
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

        if (!isEqual(oldOptions.style, newOptions.style) || oldOptions.styleName !== newOptions.styleName) {
            getStyle(applyDefaultStyleToVectorLayer({ ...newOptions, asPromise: true }))
                .then((style) => {
                    if (style) {
                        const olStyle = style.__geoStylerStyle
                            ? style({ map })
                            : style;
                        layer.setStyle(olStyle);
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

