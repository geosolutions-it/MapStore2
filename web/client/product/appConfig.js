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
        component: require('./pages/Maps'),
        plugins: (resolve) => {
            return require.ensure([], () => {
                resolve({
                    MapsPlugin: require('../plugins/Maps'),
                    MapSearchPlugin: require('../plugins/MapSearch'),
                    HomeDescriptionPlugin: require('./plugins/HomeDescription'),
                    ExamplesPlugin: require('./plugins/Examples'),
                    MapTypePlugin: require('./plugins/MapType'),
                    ForkPlugin: require('./plugins/Fork'),
                    ManagerPlugin: require('../plugins/manager/Manager'),
                    CreateNewMapPlugin: require('../plugins/CreateNewMap')
                });
            });
        }
    }, {
        name: "mapviewer",
        path: "/viewer/:mapType/:mapId",
        component: require('./pages/MapViewer'),
        plugins: (resolve) => {
            return require.ensure([], () => {
                resolve({
                    MousePositionPlugin: require('../plugins/MousePosition'),
                    PrintPlugin: require('../plugins/Print'),
                    IdentifyPlugin: require('../plugins/Identify'),
                    TOCPlugin: require('../plugins/TOC'),
                    BackgroundSwitcherPlugin: require('../plugins/BackgroundSwitcher'),
                    MeasurePlugin: require('../plugins/Measure'),
                    MeasureResultsPlugin: require('../plugins/MeasureResults'),
                    MapPlugin: require('../plugins/Map'),
                    ToolbarPlugin: require('../plugins/Toolbar'),
                    DrawerMenuPlugin: require('../plugins/DrawerMenu'),
                    ShapeFilePlugin: require('../plugins/ShapeFile'),
                    SnapshotPlugin: require('../plugins/Snapshot'),
                    SettingsPlugin: require('../plugins/Settings'),
                    ExpanderPlugin: require('../plugins/Expander'),
                    SearchPlugin: require('../plugins/Search'),
                    ScaleBoxPlugin: require('../plugins/ScaleBox'),
                    LocatePlugin: require('../plugins/Locate'),
                    ZoomInPlugin: require('../plugins/ZoomIn'),
                    ZoomOutPlugin: require('../plugins/ZoomOut'),
                    ZoomAllPlugin: require('../plugins/ZoomAll'),
                    MapLoadingPlugin: require('../plugins/MapLoading'),
                    AboutPlugin: require('./plugins/About'),
                    HelpPlugin: require('../plugins/Help'),
                    MadeWithLovePlugin: require('./plugins/MadeWithLove'),
                    MetadataExplorerPlugin: require('../plugins/MetadataExplorer'),
                    BurgerMenuPlugin: require('../plugins/BurgerMenu'),
                    UndoPlugin: require('../plugins/History'),
                    RedoPlugin: require('../plugins/History'),
                    SavePlugin: require('../plugins/Save'),
                    SaveAsPlugin: require('../plugins/SaveAs'),
                    SharePlugin: require('../plugins/Share')
                });
            });
        }
    }, {
        name: "manager",
        path: "/manager(/:tool)",
        component: require('./pages/Manager'),
        plugins: (resolve) => {
            return require.ensure([], () => {
                resolve({
                    UserManagerPlugin: require('../plugins/manager/UserManager'),
                    RulesManagerPlugin: require('../plugins/manager/RulesManager'),
                    ManagerPlugin: require('../plugins/manager/Manager')
                });
            });
        }
    }],
    pluginsDef: require('./plugins.js'),
    initialState: {
        defaultState: {
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
            }
        },
        mobile: {
            mapInfo: {enabled: true, infoFormat: 'text/html' },
            mousePosition: {enabled: true, crs: "EPSG:4326", showCenter: true}
        }
    },
    storeOpts: {
        persist: {
            whitelist: ['security']
        }
    }
};
