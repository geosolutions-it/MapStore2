/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import xml2js from 'xml2js';
import axios from '../libs/ajax';

/**
 * Common requests to TMS services.
 * @module api.TMS
 */

/**
 * get and Parse XML from TileMap Resource. See TMS 1.0.0 Specification https://wiki.osgeo.org/wiki/Tile_Map_Service_Specification
 * @param {string} url URL of the TileMap (usually from TileMap Service)
 * @
 */
export const getTileMap = (url) => axios.get(url)
    .then(response => {
        return new Promise((resolve) => {
            xml2js.parseString(response.data, { explicitArray: false }, (ignore, result) => resolve(result));
        });
    });
