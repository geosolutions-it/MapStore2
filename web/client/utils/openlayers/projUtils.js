/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {addProjection, Projection} from 'ol/proj';
import ConfigUtils from '../ConfigUtils';

/**
 * function needed in openlayers for adding new projection
 */
export const addProjections = function(code, extent, worldExtent, axisOrientation, units) {
    addProjection(new Projection({
        code,
        extent,
        worldExtent,
        axisOrientation,
        units
    })
    );
};
/**
 * @returns {string} the default projection EPSG:3857 if no custom projectionDefs are defined
 */
export const fallbackToSupportedProjection = (projectionDefs = ConfigUtils.getConfigProp("projectionDefs") || [], projection) => {
    const codes = (projectionDefs.length && projectionDefs.map(({code})  => code) || []).concat(["EPSG:4326", "EPSG:3857", "EPSG:900913"]);
    return codes.filter(c => c === projection).length ? projection : "EPSG:3857";
};


export default {
    addProjections,
    fallbackToSupportedProjection
};
