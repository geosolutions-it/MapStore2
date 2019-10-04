/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const axios = require('../libs/ajax');
const LRUCache = require('lrucache');
const {Promise} = require('es6-promise');
const DEFAULT_SIZE = 100;
let elevationTiles = new LRUCache(DEFAULT_SIZE);

const addElevationTile = (data, coords, key) => {
    elevationTiles.set(key, {
        data: data,
        dataView: new DataView(data),
        coords: coords,
        current: true,
        status: "success"
    });
};

const addErroredElevationTile = (error, coords, key) => {
    elevationTiles.set(key, {
        coords: coords,
        current: true,
        status: "error: " + error
    });
};

const getValueAtXY = (ncols, tile, x, y, nodata = -9999) => {
    const index = (y * ncols) + x;
    try {
        const result = tile.dataView.getInt16(index * 2, false);
        if (result !== nodata && result !== 32767 && result !== -32768) {
            return result;
        }
    } catch (e) {
        //
    }

    return null;
};

module.exports = {
    /**
     * Loads and stores an elevation tile in application/bil16 format from the given url.
     * The original (x, y ,z) coordinates and a tile key are stored together with the tile.
     * The key can be used to get back tile information.
     *
     * @param url tile url
     * @param coords coordinates object (x, y , z)
     * @param key tile key identifier (e.g. z:x:y)
     */
    loadTile: (url, coords, key) => {
        if (!elevationTiles.has(key)) {
            return new Promise((resolve, reject) => {
                axios.get(url, {
                    responseType: 'arraybuffer'
                }).then((response) => {
                    addElevationTile(response.data, coords, key);
                    resolve();
                }).catch(e => {
                    addErroredElevationTile(e.message, coords, key);
                    reject(e);
                });
            });
        }
        return null;
    },
    /**
     * Returns the elevation for:
     * @param key a given tile key (e-g. 15:10:20, z:x:y)
     * @param tilePixelPosition a pixel position inside the tile (x, y)
     * @param tileSize in pixels (e.g. 256)
     * @param nodata value to be used for nodata (no elevation available)
     * @returns an object with the following properties:
     *   * available: true / false
     *   * value: elevation value if available is true
     *   * message: an error message if available is false
     */
    getElevation: (key, tilePixelPosition, tileSize, nodata = -9999) => {
        const tile = elevationTiles.get(key);
        if (tile && tile.status === "success") {
            return {
                available: true,
                value: getValueAtXY(tileSize, tile, tilePixelPosition.x, tilePixelPosition.y, nodata)
            };
        } else if (tile && tile.status === "loading") {
            return {
                available: false,
                message: "elevationLoading"
            };
        } else if (tile && tile.status === "error") {
            return {
                available: false,
                message: "elevationLoadingError"
            };
        }
        return {
            available: false,
            message: "elevationNotAvailable"
        };
    },
    reset: (options = {}) => {
        elevationTiles = new LRUCache(options.max || DEFAULT_SIZE);
    }
};
