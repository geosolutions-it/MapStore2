/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import MapWithDraw from './MapWithDraw';
import {
    getWidgetLayer,
    getMapConfigSelector
} from '../../selectors/widgets';

const MapComp = connect(
    createSelector([
        getWidgetLayer,
        getMapConfigSelector
    ], (layer, map) => {
        return {
            layer,
            map,
            mapStateSource: "wizardMap",
            containerSelector: ".mapstore-query-map"
        };
    }
    ), {} )(MapWithDraw);

export default MapComp;
