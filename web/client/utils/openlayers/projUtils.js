/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {addProjection, Projection} from 'ol/proj';
import { register as registerProj4 } from 'ol/proj/proj4';
// import ConfigUtils from '../ConfigUtils';

import proj4 from 'proj4';
import ProjectionRegistry from '../ProjectionRegistry';
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

// OLD CODE
// /**
//  * @returns {string} the default projection EPSG:3857 if no custom projectionDefs are defined
//  */
// export const fallbackToSupportedProjectionOld = (projectionDefs = ConfigUtils.getConfigProp("projectionDefs") || [], projection) => {
//     const codes = (projectionDefs.length && projectionDefs.map(({code})  => code) || []).concat(["EPSG:4326", "EPSG:3857", "EPSG:900913"]);
//     return codes.filter(c => c === projection).length ? projection : "EPSG:3857";
// };

/**
 * fallbackToSupportedProjection - replace getConfigProp read with ProjectionRegistry
 * @param {string} projection the projection code to check for support
 * @returns {string} the default projection EPSG:3857 if no custom projectionDefs are defined
 */
export const fallbackToSupportedProjection = (projection) => {
    // getAll() include also old static projectionDefs defined in localConfig
    const codes = ProjectionRegistry.getAll().map(({ code }) => code).concat(['EPSG:4326', 'EPSG:3857', 'EPSG:900913']);
    if (codes.includes(projection)) {
        return projection;
    }
    return 'EPSG:3857';
};

/**
 * Called once when the OL map library is initialized.
 * @returns {function} Returns an unsubscribe function.
 */
export function initOLProjectionAdapter() {
    return ProjectionRegistry.onRegister(({ code, extent, worldExtent, axisOrientation, units, supported }) => {
        if (!supported) {
            return;
        }
        addProjection(new Projection({ code, extent, worldExtent, axisOrientation: axisOrientation || 'enu', units: units || 'm' }));
        // re-sync the entire proj4 namespace into OL - idempotent and cheap
        registerProj4(proj4);
    });
}


export default {
    addProjections,
    fallbackToSupportedProjection,
    initOLProjectionAdapter
};
