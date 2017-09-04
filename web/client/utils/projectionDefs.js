/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * add a projection definition as many as you want.
 * source of definitions: https://epsg.io/
 * example
        [{
            "code": "EPSG:3003",
            "def": "+proj=tmerc +lat_0=0 +lon_0=9 +k=0.9996 +x_0=1500000 +y_0=0 +ellps=intl +towgs84=-104.1,-49.1,-9.9,0.971,-2.917,0.714,-11.68 +units=m +no_defs",
            "extent": [1241482.0019, 973563.1609, 1830078.9331, 5215189.0853],
            "worldExtent": [6.6500, 8.8000, 12.0000, 47.0500]
        },{...},{...}]
};
*/
module.exports = function() {
    return [];
};
