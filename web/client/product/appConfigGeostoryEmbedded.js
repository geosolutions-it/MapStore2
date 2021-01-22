/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {loadGeostoryEpic} from '../epics/geostory';
import geostory from '../reducers/geostory';
import version from '../reducers/version';
import GeoStory from './pages/GeoStory';

export default {
    pages: [{
        name: "geostory-embedded",
        path: "/:gid",
        component: GeoStory,
        pageConfig: {
            name: 'geostory-embedded'
        }
    }],
    initialState: { defaultState: {} },
    baseReducers: {
        version,
        geostory
    },
    baseEpics: {
        loadGeostoryEpic
    },
    storeOpts: {
        persist: {
            whitelist: ['security']
        }
    }
};
