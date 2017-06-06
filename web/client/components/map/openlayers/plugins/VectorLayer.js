/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Layers = require('../../../../utils/openlayers/Layers');
const {getStyle} = require('../VectorStyle');
var ol = require('openlayers');
const {isEqual} = require('lodash');

Layers.registerType('vector', {
    create: (options) => {
        let features = [];

        const source = new ol.source.Vector({
            features: features
        });

        const style = getStyle(options);

        return new ol.layer.Vector({
            msId: options.id,
            source: source,
            visible: options.visibility !== false,
            zIndex: options.zIndex,
            style
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

        if (!isEqual(oldOptions.style, newOptions.style)) {
            layer.setStyle(getStyle(newOptions));
        }
    },
    render: () => {
        return null;
    }
});
