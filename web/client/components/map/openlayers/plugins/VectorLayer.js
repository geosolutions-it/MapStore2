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

Layers.registerType('vector', {
    create: (options) => {
        let features = [];

        const source = new VectorSource({
            features: features
        });

        const style = getStyle(options);

        return new VectorLayer({
            msId: options.id,
            source: source,
            visible: options.visibility !== false,
            zIndex: options.zIndex,
            style,
            opacity: options.opacity
        });
    },
    update: (layer, newOptions, oldOptions) => {
        const oldCrs = oldOptions.crs || oldOptions.srs || 'EPSG:3857';
        const newCrs = newOptions.crs || newOptions.srs || 'EPSG:3857';
        if (newCrs !== oldCrs) {
            layer.getSource().forEachFeature((f) => {
                f.getGeometry().transform(oldCrs, newCrs);
            });
        }

        if (!isEqual(oldOptions.style, newOptions.style) || oldOptions.styleName !== newOptions.styleName) {
            layer.setStyle(getStyle(newOptions));
        }
    },
    render: () => {
        return null;
    }
});

