/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {Observable} = require('rxjs');
const bbox = require('@turf/bbox');

const {changeDrawingStatus} = require('../actions/draw');
const {zoomToExtent} = require('../actions/map');
const {CHANGE_SPATIAL_FILTER_VALUE} = require('../actions/queryform');

module.exports = {
    updateSpatialFilterValue: action$ =>
        action$.ofType(CHANGE_SPATIAL_FILTER_VALUE)
            .switchMap( ({feature, srsName, style, options}) => Observable.of(
            // draw the filter on map
                changeDrawingStatus('drawOrEdit', feature.geometry.type, "queryform", [feature],
                    {
                        editEnabled: false,
                        stopAfterDrawing: true,
                        featureProjection: srsName
                    }, style)
            // set proper filter based on options
            ).concat((feature && options && options.autoZoom)
                ? [zoomToExtent(bbox(feature), srsName)]
                : []))
};
