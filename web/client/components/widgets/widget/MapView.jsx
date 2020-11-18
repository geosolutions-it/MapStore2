import { compose } from 'recompose';

import BaseMap from '../../map/BaseMap';
/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import autoMapType from '../../map/enhancers/autoMapType';
import autoResize from '../../map/enhancers/autoResize';
import getProjectionDefs from '../../map/enhancers/getProjectionDefs';
import { handlingUnsupportedProjection } from '../../map/enhancers/handlingUnsupportedProjection';
import mapType from '../../map/enhancers/mapType';
import onMapViewChanges from '../../map/enhancers/onMapViewChanges';

export default compose(
    onMapViewChanges,
    autoResize(0),
    autoMapType,
    mapType,
    getProjectionDefs,
    handlingUnsupportedProjection
)(BaseMap);

