/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const {updateMapLayoutEpic} = require('../epics/maplayout');
const {readQueryParamsOnMapEpic} = require('../epics/queryparams');

module.exports = {
    mode: "embedded",
    pages: [{
        name: "mapviewer",
        path: "/:mapId",
        component: require('./pages/MapViewer')
    }],
    pluginsDef: require('./apiPlugins.js'),
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
        version: require('../reducers/version'),
        maplayout: require('../reducers/maplayout'),
        searchconfig: require('../reducers/searchconfig')
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
