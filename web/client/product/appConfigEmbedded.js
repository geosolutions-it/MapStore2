/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
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
    storeOpts: {
        persist: {
            whitelist: ['security']
        }
    }
};
