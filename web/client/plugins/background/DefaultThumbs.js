/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ROADMAP from './assets/img/ROADMAP.jpg';

import TERRAIN from './assets/img/TERRAIN.jpg';
import SATELLITE from './assets/img/SATELLITE.jpg';
import mapnik from './assets/img/mapnik.jpg';
import s2cloodless from './assets/img/s2cloudless.jpg';
import empty from './assets/img/none.jpg';
import unknown from './assets/img/dafault.jpg';
import Night2012 from './assets/img/NASA_NIGHT.jpg';
import OpenTopoMap from './assets/img/OpenTopoMap.jpg';

// TODO REMOVE these once they are removed from all maps see issue #3304
import HYBRID from './assets/img/HYBRID.jpg';

import mapquestOsm from './assets/img/mapquest-osm.jpg';

const thumbs = {
    google: {
        HYBRID,
        ROADMAP,
        TERRAIN,
        SATELLITE
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

export default thumbs;
