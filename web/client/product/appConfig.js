/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
    pages: [{
        name: "home",
        path: "/",
        component: require('./pages/Maps')
    }, {
        name: "maps",
        path: "/maps",
        component: require('./pages/Maps')
    }, {
        name: "mapviewer",
        path: "/viewer/:mapType/:mapId",
        component: require('./pages/MapViewer')
    }, {
        name: "mapviewer",
        path: "/viewer/:mapType/:mapId/context/:contextId",
        component: require('./pages/MapViewer')
    }, {
        name: "mapviewer",
        path: "/viewer/:mapId",
        component: require('./pages/MapViewer')
    }, {
        name: 'context',
        path: "/context/:contextName",
        component: require('./pages/Context').default
    }, {
        name: 'context',
        path: "/context/:contextName/:mapId",
        component: require('./pages/Context').default
    }, {
        name: 'context-creator',
        path: "/context-creator/:contextId",
        component: require('./pages/ContextCreator').default
    }, {
        name: "manager",
        path: "/manager",
        component: require('./pages/Manager')
    }, {
        name: "manager",
        path: "/manager/:tool",
        component: require('./pages/Manager')
    }, {
        name: "context-manager",
        path: "/context-manager",
        component: require('./pages/ContextManager').default
    }, {
        name: "dashboard",
        path: "/dashboard",
        component: require('./pages/Dashboard')
    }, {
        name: "dashboard",
        path: "/dashboard/:did",
        component: require('./pages/Dashboard')
    }, {
        name: "rulesmanager",
        path: "/rules-manager",
        component: require('./pages/RulesManager')
    }, {
        name: "geostory",
        path: "/geostory/:gid",
        component: require('./pages/GeoStory').default
    }, {
        name: "geostory",
        path: "/geostory/:gid/section/:sectionId",
        component: require('./pages/GeoStory').default
    }, {
        name: "geostory",
        path: "/geostory/:gid/section/:sectionId/column/:columnId",
        component: require('./pages/GeoStory').default
    }, {
        name: "geostory",
        path: "/geostory/shared/:gid",
        component: require('./pages/GeoStory').default
    },
    {
        name: "geostory",
        path: "/geostory/shared/:gid/section/:sectionId",
        component: require('./pages/GeoStory').default
    },
    {
        name: "geostory",
        path: "/geostory/shared/:gid/section/:sectionId/column/:columnId",
        component: require('./pages/GeoStory').default
    }],
    initialState: {
        defaultState: {
            mousePosition: {enabled: false},
            controls: {
                help: {
                    enabled: false
                },
                details: {
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
                },
                RefreshLayers: {
                    enabled: false,
                    options: {
                        bbox: true,
                        search: true,
                        title: false,
                        dimensions: false
                    }
                },
                cookie: {
                    enabled: false,
                    seeMore: false
                }
            }
        },
        mobile: {
            mapInfo: {enabled: true, infoFormat: 'application/json' },
            mousePosition: {enabled: true, crs: "EPSG:4326", showCenter: true}
        }
    },
    appEpics: {},
    storeOpts: {
        persist: {
            whitelist: ['security']
        }
    }
};
