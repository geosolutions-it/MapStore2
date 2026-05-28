/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose } from 'recompose';
import onMapViewChanges from '../../../components/map/enhancers/onMapViewChanges';
import autoResize from '../../../components/map/enhancers/autoResize';
import autoMapType from '../../../components/map/enhancers/autoMapType';
import withScalesDenominators from '../../../components/map/enhancers/withScalesDenominators';
import mapType from '../../../components/map/enhancers/mapType';
import getProjectionDefs from '../../../components/map/enhancers/getProjectionDefs';
import BaseMap from '../../../components/map/BaseMap';
import { handlingUnsupportedProjection } from '../../../components/map/enhancers/handlingUnsupportedProjection';

export default compose(
    onMapViewChanges,
    autoResize(0),
    autoMapType,
    withScalesDenominators,
    mapType,
    getProjectionDefs,
    handlingUnsupportedProjection
)(BaseMap);
