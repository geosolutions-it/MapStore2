/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {updateMapLayoutEpic} from '../epics/maplayout';
import {readQueryParamsOnMapEpic} from '../epics/queryparams';
import maplayout from '../reducers/maplayout';
import searchconfig from '../reducers/searchconfig';
import version from '../reducers/version';

export default {
    mode: "embedded",
    pages: [{
        name: "mapviewer",
        path: "/:mapId",
        component: require('./pages/MapViewer').default
    }],
    pluginsDef: require('./apiPlugins.js').default,
    initialState: {
        defaultState: {
            mode: "embedded",
            mousePosition: {enabled: false},
            controls: {
                help: {
                    enabled: false
                },
                print: {
                    enabled: false
                },
                toolbar: {
                    active: null,
                    expanded: false
                },
                drawer: {
                    enabled: false,
                    menu: "1"
                }
            },
            mapInfo: {enabled: true, infoFormat: 'text/html' }
        },
        mobile: {
        }
    },
    baseReducers: {
        mode: (state = 'embedded') => state,
        version,
        maplayout,
        searchconfig
    },
    baseEpics: {
        updateMapLayoutEpic,
        readQueryParamsOnMapEpic
    },
    storeOpts: {
        persist: {
            whitelist: ['security']
        }
    }
};
