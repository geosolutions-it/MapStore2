/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {withProps} from "recompose";
import ConfigUtils from '../../../utils/ConfigUtils';
import {isArray} from 'lodash';


/**
 * Fetches the projectionDefs from the configuration if they are not present
 */
export const getProjectionDefs = withProps(
    ({projectionDefs}) => ({
        projectionDefs: isArray(projectionDefs) && projectionDefs.length ?
            projectionDefs :
            ConfigUtils.getConfigProp("projectionDefs") || []
    })
);

export default getProjectionDefs;
