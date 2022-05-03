/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

class GeoStylerStyleParser {
    readStyle(geoStylerStyle) {
        return new Promise((resolve, reject) => {
            try {
                resolve(geoStylerStyle);
            } catch (error) {
                reject(error);
            }
        });
    }

    writeStyle(geoStylerStyle) {
        return new Promise((resolve, reject) => {
            try {
                resolve(geoStylerStyle);
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default GeoStylerStyleParser;
