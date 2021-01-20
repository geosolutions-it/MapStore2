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

export default {
    mode: "embedded",
    pages: [{
        name: "geostory-embedded",
        path: "/:gid",
        component: require('./pages/GeoStory').default,
        pageConfig: {
            name: 'geostory-embedded'
        }
    }],
    pluginsDef: require('./pluginsGeostoryEmbedded').default,
    initialState: {
        defaultState: {
            mode: "embedded",
            mousePosition: {enabled: false}
        }
    },
    baseReducers: {
        mode: (state = 'embedded') => state,
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
