/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {compose, withProps} = require('recompose');
const dependenciesToWidget = require('./dependenciesToWidget');
const {get} = require('lodash');
const {getScales} = require('../../../utils/MapUtils');

module.exports = compose(
    dependenciesToWidget,
    withProps(({ dependencies = {} }) => ({
        layers: dependencies.layers || [],
        scales: getScales(
            // TODO: this is a fallback that checks the viewport if projection is not defined. We should use only projection
            dependencies.projection || dependencies.viewport && dependencies.viewport.crs || 'EPSG:3857',
            get( dependencies, "mapOptions.view.DPI")
        ),
        currentZoomLvl: dependencies.zoom
    })),
    // filter backgrounds
    withProps(
        ({ layers = [] }) => ({ layers: layers.filter((l = {}) => l.group !== "background" && l.visibility !== false && l.type !== "vector")})
    ),
);
