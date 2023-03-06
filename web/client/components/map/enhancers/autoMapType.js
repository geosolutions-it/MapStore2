/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { getMapLibraryFromVisualizationMode, VisualizationModes } from '../../../utils/MapTypeUtils';

const autoMapType = (Component) => props => (
    <Component
        mapType={getMapLibraryFromVisualizationMode(props?.map?.visualizationMode || VisualizationModes._2D)}
        {...props}
    />
);
export default autoMapType;
