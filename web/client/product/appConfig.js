/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Maps from "./pages/Maps";
import MapViewer from "./pages/MapViewer";
import Context from "./pages/Context";
import ContextCreator from "./pages/ContextCreator";
import Manager from "./pages/Manager";
import Dashboard from "./pages/Dashboard";
import RulesManager from "./pages/RulesManager";
import GeoStory from "./pages/GeoStory";
import Permalink from "./pages/Permalink";


export default {
    pages: [{
        name: "home",
        path: "/",
        component: Maps
    }, {
        name: "maps",
        path: "/maps",
        component: Maps
    }, {
        name: "mapviewer",
        path: "/viewer/:mapType/:mapId",
        component: MapViewer
    }, {
        name: "mapviewer",
        path: "/viewer/:mapType/:mapId/context/:contextId",
        component: MapViewer
    }, {
        name: "mapviewer",
        path: "/viewer/:mapId/context/:contextId",
        component: MapViewer
    }, {
        name: "mapviewer",
        path: "/viewer/:mapId",
        component: MapViewer
    }, {
        name: 'context',
        path: "/context/:contextName",
        component: Context
    }, {
        name: 'context',
        path: "/context/:contextName/:mapId",
        component: Context
    }, {
        name: 'context-creator',
        path: "/context-creator/:contextId",
        component: ContextCreator
    }, {
        name: "manager",
        path: "/manager",
        component: Manager
    }, {
        name: "manager",
        path: "/manager/:tool",
        component: Manager
    }, {
        name: "dashboard",
        path: "/dashboard",
        component: Dashboard
    }, {
        name: "dashboard",
        path: "/dashboard/:did",
        component: Dashboard
    }, {
        name: "rulesmanager",
        path: "/rules-manager",
        component: RulesManager
    }, {
        name: "geostory",
        path: "/geostory/:gid",
        component: GeoStory
    }, {
        name: "geostory",
        path: "/geostory/:gid/section/:sectionId",
        component: GeoStory
    }, {
        name: "geostory",
        path: "/geostory/:gid/section/:sectionId/column/:columnId",
        component: GeoStory
    }, {
        name: "geostory",
        path: "/geostory/shared/:gid",
        component: GeoStory
    },
    {
        name: "geostory",
        path: "/geostory/shared/:gid/section/:sectionId",
        component: GeoStory
    },
    {
        name: "geostory",
        path: "/geostory/shared/:gid/section/:sectionId/column/:columnId",
        component: GeoStory
    },
    {
        name: "permalink",
        path: "/permalink/:pid",
        component: Permalink
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
