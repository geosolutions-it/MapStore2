/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import mapType from '../../map/enhancers/mapType';
import autoResize from '../../map/enhancers/autoResize';
import getProjectionDefs from '../../map/enhancers/getProjectionDefs';
import onMapViewChanges from '../../map/enhancers/onMapViewChanges';
import {compose} from 'recompose';
import { handlingUnsupportedProjection } from '../../map/enhancers/handlingUnsupportedProjection';
import {withOnClick, withPopupSupport} from './enhancers/withIdentifyPopup';
import BaseMap from '../../map/BaseMap';

export default compose(
    onMapViewChanges,
    autoResize(0),
    mapType,
    withPopupSupport,
    withOnClick,
    getProjectionDefs,
    handlingUnsupportedProjection
)(BaseMap);
