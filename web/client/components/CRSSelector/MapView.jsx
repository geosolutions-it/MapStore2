/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose } from 'recompose';
import onMapViewChanges from '../map/enhancers/onMapViewChanges';
import autoResize from '../map/enhancers/autoResize';
import autoMapType from '../map/enhancers/autoMapType';
import withScalesDenominators from '../map/enhancers/withScalesDenominators';
import mapType from '../map/enhancers/mapType';
import getProjectionDefs from '../map/enhancers/getProjectionDefs';
import BaseMap from '../map/BaseMap';
import { handlingUnsupportedProjection } from '../map/enhancers/handlingUnsupportedProjection';

export default compose(
    onMapViewChanges,
    autoResize(0),
    autoMapType,
    withScalesDenominators,
    mapType,
    getProjectionDefs,
    handlingUnsupportedProjection
)(BaseMap);
