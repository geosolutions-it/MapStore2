/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';

import bbox from '@turf/bbox';
import { changeDrawingStatus } from '../actions/draw';
import { zoomToExtent } from '../actions/map';
import { CHANGE_SPATIAL_FILTER_VALUE } from '../actions/queryform';

export default {
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
