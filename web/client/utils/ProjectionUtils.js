/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Proj4js from 'proj4';
import { getConfigProp } from './ConfigUtils';

const proj4 = Proj4js;

const DEFAULT_PROJECTIONS = {
    'EPSG:3857': {
        def: '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs',
        extent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
        worldExtent: [-180.0, -85.06, 180.0, 85.06]
    },
    'EPSG:4326': {
        def: '+proj=longlat +datum=WGS84 +no_defs +type=crs',
        extent: [-180.0, -90.0, 180.0, 90.0],
        worldExtent: [-180.0, -90.0, 180.0, 90.0]
    }
};

/**
 * Returns an object of projections where the key represents the code
 * @return {object} projection definitions
 */
export const getProjections = () => {
    return (getConfigProp('projectionDefs') || [])
        .reduce((acc, { code, ...options }) => ({
            ...acc,
            [code]: {
                ...options,
                proj4Def: { ...proj4.defs(code) }
            }
        }),
        { ...DEFAULT_PROJECTIONS });
};

/**
 * Return a projection given a code
 * @param {string} code for the projection, default 'EPSG:3857'
 * @return {object} projection definition, fallback to default 'EPSG:3857' definition
 */
export const getProjection = (code = 'EPSG:3857') => {
    const projections = getProjections();
    return projections[code] || projections['EPSG:3857'];
};

/**
 * Check if a projection is available
 * @param {string} code for the projection
 * @return {boolean} true if the projection is available
 */
export const isProjectionAvailable = (code) => !!getProjections()[code];
