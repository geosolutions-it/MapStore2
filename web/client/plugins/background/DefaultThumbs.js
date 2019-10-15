/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const ROADMAP = require('./assets/img/ROADMAP.jpg');
const TERRAIN = require('./assets/img/TERRAIN.jpg');
const SATELLITE = require('./assets/img/SATELLITE.jpg');
const Aerial = require('./assets/img/Aerial.jpg');
const mapnik = require('./assets/img/mapnik.jpg');
const s2cloodless = require('./assets/img/s2cloudless.jpg');
const empty = require('./assets/img/none.jpg');
const unknown = require('./assets/img/dafault.jpg');
const Night2012 = require('./assets/img/NASA_NIGHT.jpg');
const AerialWithLabels = require('./assets/img/AerialWithLabels.jpg');
const OpenTopoMap = require('./assets/img/OpenTopoMap.jpg');

// TODO REMOVE these once they are removed from all maps see issue #3304
const HYBRID = require('./assets/img/HYBRID.jpg');
const mapquestOsm = require('./assets/img/mapquest-osm.jpg');

const thumbs = {
    google: {
        HYBRID,
        ROADMAP,
        TERRAIN,
        SATELLITE
    },
    bing: {
        Aerial,
        AerialWithLabels
    },
    osm: {
        mapnik
    },
    mapquest: {
        osm: mapquestOsm
    },
    ol: {
        "undefined": empty
    },
    nasagibs: {
        Night2012
    },
    OpenTopoMap: {
        OpenTopoMap
    },
    unknown,
    s2cloudless: {
        "s2cloudless:s2cloudless": s2cloodless
    }
};

module.exports = thumbs;
