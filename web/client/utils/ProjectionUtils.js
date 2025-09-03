/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Proj4js from 'proj4';
import { getConfigProp } from './ConfigUtils';
import axios from '../libs/ajax';

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
 * Registers grid files for coordinate transformations
 * @param {object} gridFiles - Object containing grid file definitions
 * @param {object} proj4Instance - Proj4 instance
 * @return {Promise} Promise that resolves when all grids are registered
 */
export const registerGridFiles = (gridFiles, proj4Instance) => {
    const gridPromises = Object.entries(gridFiles).map(([gridName, gridInfo]) => {
        return new Promise((resolve) => {
            if (gridInfo.type === 'gsb') {
                // GSB files: Load as ArrayBuffer and register directly
                axios.get(gridInfo.path, { responseType: 'arraybuffer' })
                    .then(response => {
                        proj4Instance.nadgrid(gridName, response.data, {includeErrorFields: false});
                        resolve();
                    })
                    .catch(error => {
                        console.error(`Failed to register grid ${gridName}:`, error);
                        resolve(); // Continue with other grids even if one fails
                    });

            } else if (gridInfo.type === 'geotiff') {
                // GeoTIFF files: Use GeoTIFF.js library
                import('geotiff').then(({ fromUrl }) => {
                    return fromUrl(gridInfo.path);
                }).then(tiff => {
                    return proj4Instance.nadgrid(gridName, tiff).ready;
                }).then(() => {
                    // eslint-disable-next-line no-console
                    console.log("Successfully registered");
                    resolve();
                }).catch(error => {
                    console.error(`Failed to register grid ${gridName}:`, error);
                    resolve(); // Continue with other grids even if one fails
                });
            } else {
                console.warn(`Unknown grid type for ${gridName}: ${gridInfo.type}`);
                resolve(); // Unknown grid type, skip
            }
        });
    });

    return Promise.all(gridPromises);
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
