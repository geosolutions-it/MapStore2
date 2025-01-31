/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import { dashboardHasPendingChangesSelector } from '../dashboardsave';

describe('dashboardsave selectors', () => {
    it('dashboardHasPendingChanges selector with no changes', () => {
        const state = {
            dashboard: {
                resource: {
                    canEdit: true
                },
                originalData: {
                    layouts: {
                        lg: {
                            w: 1,
                            x: 0,
                            y: 0,
                            h: 1,
                            i: "252bb010-49f7-11e8-9f59-630c9298622e"
                        }
                    },
                    widgets: [{
                        id: 'widget1',
                        dataGrid: {y: 0, x: 0, w: 1, h: 1},
                        layer: false,
                        legend: false,
                        mapSync: false,
                        text: "Dashboard",
                        title: "Dashboard",
                        url: false,
                        widgetType: "text"
                    }, {
                        id: 'widget2',
                        dataGrid: {y: 0, x: 0, w: 1, h: 1},
                        layer: false,
                        legend: false,
                        map: {
                            bbox: {
                                bounds: {minx: -16505099.28586463, miny: 1173433.3176468946, maxx: -5194865.084563671, maxy: 8041758.9312396925},
                                crs: "EPSG:3857",
                                rotation: 0
                            },
                            groups: {id: "Default", expanded: true},
                            layers: [{
                                group: "background",
                                id: "mapnik__0",
                                name: "mapnik",
                                source: "osm",
                                title: "Open Street Map",
                                type: "osm",
                                visibility: true
                            }, {
                                apiKey: "__API_KEY_MAPQUEST__",
                                group: "background",
                                id: "osm__2",
                                name: "osm",
                                source: "mapquest",
                                title: "MapQuest OSM",
                                type: "mapquest",
                                visibility: false
                            }, {
                                group: "background",
                                id: "Night2012__3",
                                name: "Night2012",
                                provider: "NASAGIBS.ViirsEarthAtNight2012",
                                source: "nasagibs",
                                title: "NASAGIBS Night 2012",
                                type: "tileprovider",
                                visibility: false
                            }, {
                                group: "background",
                                id: "OpenTopoMap__4",
                                name: "OpenTopoMap",
                                provider: "OpenTopoMap",
                                source: "OpenTopoMap",
                                title: "OpenTopoMap",
                                type: "tileprovider",
                                visibility: false
                            }, {
                                group: "background",
                                id: "undefined__5",
                                source: "ol",
                                title: "Empty Background",
                                type: "empty",
                                visibility: false
                            }, {
                                allowedSRS: {},
                                bbox: {crs: "EPSG:4326", bounds: {
                                    maxx: -66.969849,
                                    maxy: 49.371735,
                                    minx: -124.73142200000001,
                                    miny: 24.955967
                                }},
                                description: "This is some census data on the states.",
                                dimensions: [],
                                id: "topp:states__xbiwklaqww",
                                links: [],
                                name: "topp:states",
                                params: {},
                                search: {type: "wfs", url: "https://demo.geo-solutions.it:443/geoserver/wfs"},
                                title: "USA Population",
                                type: "wms",
                                url: "https://demo.geo-solutions.it:443/geoserver/wms",
                                visibility: true
                            }],
                            maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                            size: {width: 578, height: 351},
                            projection: "EPSG:900913",
                            units: "m",
                            center: {x: -97.46704829402395, y: 38.19914131811602, crs: "EPSG:4326"},
                            zoom: 3
                        },
                        mapStateSource: "__base_map__",
                        mapSync: false,
                        title: "Map of united states",
                        url: false,
                        widgetType: "map"
                    }, {
                        id: 'widget3',
                        dataGrid: {y: 0, x: 0, w: 1, h: 1},
                        dependenciesMap: {layers: "widgets[widget3].map.layers", zoom: "widgets[widget3].map.zoom", viewport: "widgets[widget3].map.viewport"},
                        layer: false,
                        legend: false,
                        mapSync: true,
                        title: "Legend",
                        url: false,
                        widgetType: "legend"
                    }]
                }
            },
            widgets: {
                containers: {
                    floating: {
                        layouts: {
                            lg: {
                                w: 1,
                                x: 0,
                                y: 0,
                                h: 1,
                                i: "252bb010-49f7-11e8-9f59-630c9298622e"
                            }
                        },
                        widgets: [{
                            id: 'widget1',
                            dataGrid: {y: 0, x: 0, w: 1, h: 1},
                            layer: false,
                            legend: false,
                            mapSync: false,
                            text: "Dashboard",
                            title: "Dashboard",
                            url: false,
                            widgetType: "text"
                        }, {
                            id: 'widget2',
                            dataGrid: {y: 0, x: 0, w: 1, h: 1},
                            layer: false,
                            legend: false,
                            map: {
                                bbox: {
                                    bounds: {minx: -16505099.28586463, miny: 1173433.3176468946, maxx: -5194865.084563671, maxy: 8041758.9312396925},
                                    crs: "EPSG:3857",
                                    rotation: 0
                                },
                                groups: {id: "Default", expanded: true},
                                layers: [{
                                    group: "background",
                                    id: "mapnik__0",
                                    name: "mapnik",
                                    source: "osm",
                                    title: "Open Street Map",
                                    type: "osm",
                                    visibility: true
                                }, {
                                    apiKey: "__API_KEY_MAPQUEST__",
                                    group: "background",
                                    id: "osm__2",
                                    name: "osm",
                                    source: "mapquest",
                                    title: "MapQuest OSM",
                                    type: "mapquest",
                                    visibility: false
                                }, {
                                    group: "background",
                                    id: "Night2012__3",
                                    name: "Night2012",
                                    provider: "NASAGIBS.ViirsEarthAtNight2012",
                                    source: "nasagibs",
                                    title: "NASAGIBS Night 2012",
                                    type: "tileprovider",
                                    visibility: false
                                }, {
                                    group: "background",
                                    id: "OpenTopoMap__4",
                                    name: "OpenTopoMap",
                                    provider: "OpenTopoMap",
                                    source: "OpenTopoMap",
                                    title: "OpenTopoMap",
                                    type: "tileprovider",
                                    visibility: false
                                }, {
                                    group: "background",
                                    id: "undefined__5",
                                    source: "ol",
                                    title: "Empty Background",
                                    type: "empty",
                                    visibility: false
                                }, {
                                    allowedSRS: {},
                                    bbox: {crs: "EPSG:4326", bounds: {
                                        maxx: -66.969849,
                                        maxy: 49.371735,
                                        minx: -124.73142200000001,
                                        miny: 24.955967
                                    }},
                                    description: "This is some census data on the states.",
                                    dimensions: [],
                                    id: "topp:states__xbiwklaqww",
                                    links: [],
                                    name: "topp:states",
                                    params: {},
                                    search: {type: "wfs", url: "https://demo.geo-solutions.it:443/geoserver/wfs"},
                                    title: "USA Population",
                                    type: "wms",
                                    url: "https://demo.geo-solutions.it:443/geoserver/wms",
                                    visibility: true
                                }],
                                maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                                size: {width: 578, height: 351},
                                projection: "EPSG:900913",
                                units: "m",
                                center: {x: -97.46704829402395, y: 38.19914131811602, crs: "EPSG:4326"},
                                zoom: 3
                            },
                            mapStateSource: "__base_map__",
                            mapSync: false,
                            title: "Map of united states",
                            url: false,
                            widgetType: "map"
                        }, {
                            id: 'widget3',
                            dataGrid: {y: 0, x: 0, w: 1, h: 1},
                            dependenciesMap: {layers: "widgets[widget3].map.layers", zoom: "widgets[widget3].map.zoom", viewport: "widgets[widget3].map.viewport"},
                            layer: false,
                            legend: false,
                            mapSync: true,
                            title: "Legend",
                            url: false,
                            widgetType: "legend"
                        }]
                    }
                }
            }
        };
        expect(dashboardHasPendingChangesSelector(state)).toBe(false);
    });
    it('dashboardHasPendingChanges selector with new widget', () => {
        const state = {
            dashboard: {
                resource: {
                    canEdit: true
                },
                originalData: {
                    layouts: {
                        lg: {
                            w: 1,
                            x: 0,
                            y: 0,
                            h: 1,
                            i: "252bb010-49f7-11e8-9f59-630c9298622e"
                        }
                    },
                    widgets: [{
                        id: 'widget1',
                        dataGrid: {y: 0, x: 0, w: 1, h: 1},
                        layer: false,
                        legend: false,
                        mapSync: false,
                        text: "Dashboard",
                        title: "Dashboard",
                        url: false,
                        widgetType: "text"
                    }, {
                        id: 'widget2',
                        dataGrid: {y: 0, x: 0, w: 1, h: 1},
                        layer: false,
                        legend: false,
                        map: {
                            bbox: {
                                bounds: {minx: -16505099.28586463, miny: 1173433.3176468946, maxx: -5194865.084563671, maxy: 8041758.9312396925},
                                crs: "EPSG:3857",
                                rotation: 0
                            },
                            groups: {id: "Default", expanded: true},
                            layers: [{
                                group: "background",
                                id: "mapnik__0",
                                name: "mapnik",
                                source: "osm",
                                title: "Open Street Map",
                                type: "osm",
                                visibility: true
                            }, {
                                apiKey: "__API_KEY_MAPQUEST__",
                                group: "background",
                                id: "osm__2",
                                name: "osm",
                                source: "mapquest",
                                title: "MapQuest OSM",
                                type: "mapquest",
                                visibility: false
                            }, {
                                group: "background",
                                id: "Night2012__3",
                                name: "Night2012",
                                provider: "NASAGIBS.ViirsEarthAtNight2012",
                                source: "nasagibs",
                                title: "NASAGIBS Night 2012",
                                type: "tileprovider",
                                visibility: false
                            }, {
                                group: "background",
                                id: "OpenTopoMap__4",
                                name: "OpenTopoMap",
                                provider: "OpenTopoMap",
                                source: "OpenTopoMap",
                                title: "OpenTopoMap",
                                type: "tileprovider",
                                visibility: false
                            }, {
                                group: "background",
                                id: "undefined__5",
                                source: "ol",
                                title: "Empty Background",
                                type: "empty",
                                visibility: false
                            }, {
                                allowedSRS: {},
                                bbox: {crs: "EPSG:4326", bounds: {
                                    maxx: -66.969849,
                                    maxy: 49.371735,
                                    minx: -124.73142200000001,
                                    miny: 24.955967
                                }},
                                description: "This is some census data on the states.",
                                dimensions: [],
                                id: "topp:states__xbiwklaqww",
                                links: [],
                                name: "topp:states",
                                params: {},
                                search: {type: "wfs", url: "https://demo.geo-solutions.it:443/geoserver/wfs"},
                                title: "USA Population",
                                type: "wms",
                                url: "https://demo.geo-solutions.it:443/geoserver/wms",
                                visibility: true
                            }],
                            maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                            size: {width: 578, height: 351},
                            projection: "EPSG:900913",
                            units: "m",
                            center: {x: -97.46704829402395, y: 38.19914131811602, crs: "EPSG:4326"},
                            zoom: 3
                        },
                        mapStateSource: "__base_map__",
                        mapSync: false,
                        title: "Map of united states",
                        url: false,
                        widgetType: "map"
                    }, {
                        id: 'widget3',
                        dataGrid: {y: 0, x: 0, w: 1, h: 1},
                        dependenciesMap: {layers: "widgets[widget3].map.layers", zoom: "widgets[widget3].map.zoom", viewport: "widgets[widget3].map.viewport"},
                        layer: false,
                        legend: false,
                        mapSync: true,
                        title: "Legend",
                        url: false,
                        widgetType: "legend"
                    }]
                }
            },
            widgets: {
                containers: {
                    floating: {
                        layouts: {
                            lg: {
                                w: 1,
                                x: 0,
                                y: 0,
                                h: 1,
                                i: "252bb010-49f7-11e8-9f59-630c9298622e"
                            }
                        },
                        widgets: [{
                            id: 'widget1',
                            dataGrid: {y: 0, x: 0, w: 1, h: 1},
                            layer: false,
                            legend: false,
                            mapSync: false,
                            text: "Dashboard",
                            title: "Dashboard",
                            url: false,
                            widgetType: "text"
                        }, {
                            id: 'widget2',
                            dataGrid: {y: 0, x: 0, w: 1, h: 1},
                            layer: false,
                            legend: false,
                            map: {
                                bbox: {
                                    bounds: {minx: -16505099.28586463, miny: 1173433.3176468946, maxx: -5194865.084563671, maxy: 8041758.9312396925},
                                    crs: "EPSG:3857",
                                    rotation: 0
                                },
                                groups: {id: "Default", expanded: true},
                                layers: [{
                                    group: "background",
                                    id: "mapnik__0",
                                    name: "mapnik",
                                    source: "osm",
                                    title: "Open Street Map",
                                    type: "osm",
                                    visibility: true
                                }, {
                                    apiKey: "__API_KEY_MAPQUEST__",
                                    group: "background",
                                    id: "osm__2",
                                    name: "osm",
                                    source: "mapquest",
                                    title: "MapQuest OSM",
                                    type: "mapquest",
                                    visibility: false
                                }, {
                                    group: "background",
                                    id: "Night2012__3",
                                    name: "Night2012",
                                    provider: "NASAGIBS.ViirsEarthAtNight2012",
                                    source: "nasagibs",
                                    title: "NASAGIBS Night 2012",
                                    type: "tileprovider",
                                    visibility: false
                                }, {
                                    group: "background",
                                    id: "OpenTopoMap__4",
                                    name: "OpenTopoMap",
                                    provider: "OpenTopoMap",
                                    source: "OpenTopoMap",
                                    title: "OpenTopoMap",
                                    type: "tileprovider",
                                    visibility: false
                                }, {
                                    group: "background",
                                    id: "undefined__5",
                                    source: "ol",
                                    title: "Empty Background",
                                    type: "empty",
                                    visibility: false
                                }, {
                                    allowedSRS: {},
                                    bbox: {crs: "EPSG:4326", bounds: {
                                        maxx: -66.969849,
                                        maxy: 49.371735,
                                        minx: -124.73142200000001,
                                        miny: 24.955967
                                    }},
                                    description: "This is some census data on the states.",
                                    dimensions: [],
                                    id: "topp:states__xbiwklaqww",
                                    links: [],
                                    name: "topp:states",
                                    params: {},
                                    search: {type: "wfs", url: "https://demo.geo-solutions.it:443/geoserver/wfs"},
                                    title: "USA Population",
                                    type: "wms",
                                    url: "https://demo.geo-solutions.it:443/geoserver/wms",
                                    visibility: true
                                }],
                                maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                                size: {width: 578, height: 351},
                                projection: "EPSG:900913",
                                units: "m",
                                center: {x: -97.46704829402395, y: 38.19914131811602, crs: "EPSG:4326"},
                                zoom: 3
                            },
                            mapStateSource: "__base_map__",
                            mapSync: false,
                            title: "Map of united states",
                            url: false,
                            widgetType: "map"
                        }, {
                            id: 'widget3',
                            dataGrid: {y: 0, x: 0, w: 1, h: 1},
                            dependenciesMap: {layers: "widgets[widget3].map.layers", zoom: "widgets[widget3].map.zoom", viewport: "widgets[widget3].map.viewport"},
                            layer: false,
                            legend: false,
                            mapSync: true,
                            title: "Legend",
                            url: false,
                            widgetType: "legend"
                        }, {
                            id: 'widget4',
                            mapSync: true,
                            widgetType: 'text',
                            text: 'new widget',
                            title: 'new widget'
                        }]
                    }
                }
            }
        };
        expect(dashboardHasPendingChangesSelector(state)).toBe(true);
    });
    it('dashboardHasPendingChanges selector with map change in widget', () => {
        const state = {
            dashboard: {
                resource: {
                    canEdit: true
                },
                originalData: {
                    layouts: {
                        lg: {
                            w: 1,
                            x: 0,
                            y: 0,
                            h: 1,
                            i: "252bb010-49f7-11e8-9f59-630c9298622e"
                        }
                    },
                    widgets: [{
                        id: 'widget1',
                        dataGrid: {y: 0, x: 0, w: 1, h: 1},
                        layer: false,
                        legend: false,
                        mapSync: false,
                        text: "Dashboard",
                        title: "Dashboard",
                        url: false,
                        widgetType: "text"
                    }, {
                        id: 'widget2',
                        dataGrid: {y: 0, x: 0, w: 1, h: 1},
                        layer: false,
                        legend: false,
                        map: {
                            bbox: {
                                bounds: {minx: -16505099.28586463, miny: 1173433.3176468946, maxx: -5194865.084563671, maxy: 8041758.9312396925},
                                crs: "EPSG:3857",
                                rotation: 0
                            },
                            groups: {id: "Default", expanded: true},
                            layers: [{
                                group: "background",
                                id: "mapnik__0",
                                name: "mapnik",
                                source: "osm",
                                title: "Open Street Map",
                                type: "osm",
                                visibility: true
                            }, {
                                apiKey: "__API_KEY_MAPQUEST__",
                                group: "background",
                                id: "osm__2",
                                name: "osm",
                                source: "mapquest",
                                title: "MapQuest OSM",
                                type: "mapquest",
                                visibility: false
                            }, {
                                group: "background",
                                id: "Night2012__3",
                                name: "Night2012",
                                provider: "NASAGIBS.ViirsEarthAtNight2012",
                                source: "nasagibs",
                                title: "NASAGIBS Night 2012",
                                type: "tileprovider",
                                visibility: false
                            }, {
                                group: "background",
                                id: "OpenTopoMap__4",
                                name: "OpenTopoMap",
                                provider: "OpenTopoMap",
                                source: "OpenTopoMap",
                                title: "OpenTopoMap",
                                type: "tileprovider",
                                visibility: false
                            }, {
                                group: "background",
                                id: "undefined__5",
                                source: "ol",
                                title: "Empty Background",
                                type: "empty",
                                visibility: false
                            }, {
                                allowedSRS: {},
                                bbox: {crs: "EPSG:4326", bounds: {
                                    maxx: -66.969849,
                                    maxy: 49.371735,
                                    minx: -124.73142200000001,
                                    miny: 24.955967
                                }},
                                description: "This is some census data on the states.",
                                dimensions: [],
                                id: "topp:states__xbiwklaqww",
                                links: [],
                                name: "topp:states",
                                params: {},
                                search: {type: "wfs", url: "https://demo.geo-solutions.it:443/geoserver/wfs"},
                                title: "USA Population",
                                type: "wms",
                                url: "https://demo.geo-solutions.it:443/geoserver/wms",
                                visibility: true
                            }],
                            maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                            size: {width: 578, height: 351},
                            projection: "EPSG:900913",
                            units: "m",
                            center: {x: -97.46704829402395, y: 38.19914131811602, crs: "EPSG:4326"},
                            zoom: 3
                        },
                        mapStateSource: "__base_map__",
                        mapSync: false,
                        title: "Map of united states",
                        url: false,
                        widgetType: "map"
                    }, {
                        id: 'widget3',
                        dataGrid: {y: 0, x: 0, w: 1, h: 1},
                        dependenciesMap: {layers: "widgets[widget3].map.layers", zoom: "widgets[widget3].map.zoom", viewport: "widgets[widget3].map.viewport"},
                        layer: false,
                        legend: false,
                        mapSync: true,
                        title: "Legend",
                        url: false,
                        widgetType: "legend"
                    }]
                }
            },
            widgets: {
                containers: {
                    floating: {
                        layouts: {
                            lg: {
                                w: 1,
                                x: 0,
                                y: 0,
                                h: 1,
                                i: "252bb010-49f7-11e8-9f59-630c9298622e"
                            }
                        },
                        widgets: [{
                            id: 'widget1',
                            dataGrid: {y: 0, x: 0, w: 1, h: 1},
                            layer: false,
                            legend: false,
                            mapSync: false,
                            text: "Dashboard Change",
                            title: "Dashboard",
                            url: false,
                            widgetType: "text"
                        }, {
                            id: 'widget2',
                            dataGrid: {y: 0, x: 0, w: 1, h: 1},
                            layer: false,
                            legend: false,
                            map: {
                                bbox: {
                                    bounds: {minx: -16505099.28586463, miny: 1173433.3176468946, maxx: -5194865.084563671, maxy: 8041758.9312396925},
                                    crs: "EPSG:3857",
                                    rotation: 0
                                },
                                groups: {id: "Default", expanded: true},
                                layers: [{
                                    group: "background",
                                    id: "mapnik__0",
                                    name: "mapnik",
                                    source: "osm",
                                    title: "Open Street Map",
                                    type: "osm",
                                    visibility: true
                                }, {
                                    apiKey: "__API_KEY_MAPQUEST__",
                                    group: "background",
                                    id: "osm__2",
                                    name: "osm",
                                    source: "mapquest",
                                    title: "MapQuest OSM",
                                    type: "mapquest",
                                    visibility: false
                                }, {
                                    group: "background",
                                    id: "Night2012__3",
                                    name: "Night2012",
                                    provider: "NASAGIBS.ViirsEarthAtNight2012",
                                    source: "nasagibs",
                                    title: "NASAGIBS Night 2012",
                                    type: "tileprovider",
                                    visibility: false
                                }, {
                                    group: "background",
                                    id: "OpenTopoMap__4",
                                    name: "OpenTopoMap",
                                    provider: "OpenTopoMap",
                                    source: "OpenTopoMap",
                                    title: "OpenTopoMap",
                                    type: "tileprovider",
                                    visibility: false
                                }, {
                                    group: "background",
                                    id: "undefined__5",
                                    source: "ol",
                                    title: "Empty Background",
                                    type: "empty",
                                    visibility: false
                                }],
                                maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                                size: {width: 578, height: 351},
                                projection: "EPSG:900913",
                                units: "m",
                                center: {x: -97.46704829402395, y: 38.19914131811602, crs: "EPSG:4326"},
                                zoom: 3
                            },
                            mapStateSource: "__base_map__",
                            mapSync: false,
                            title: "Map of united states",
                            url: false,
                            widgetType: "map"
                        }, {
                            id: 'widget3',
                            dataGrid: {y: 0, x: 0, w: 1, h: 1},
                            dependenciesMap: {layers: "widgets[widget3].map.layers", zoom: "widgets[widget3].map.zoom", viewport: "widgets[widget3].map.viewport"},
                            layer: false,
                            legend: false,
                            mapSync: true,
                            title: "Legend",
                            url: false,
                            widgetType: "legend"
                        }]
                    }
                }
            }
        };
        expect(dashboardHasPendingChangesSelector(state)).toBe(true);
    });
    it('dashboardHasPendingChanges selector with map center change in widget for more than 1e-12', () => {
        const state = {
            dashboard: {
                resource: {
                    canEdit: true
                },
                originalData: {
                    layouts: {
                        lg: {
                            w: 1,
                            x: 0,
                            y: 0,
                            h: 1,
                            i: "252bb010-49f7-11e8-9f59-630c9298622e"
                        }
                    },
                    widgets: [{
                        id: 'widget1',
                        dataGrid: {y: 0, x: 0, w: 1, h: 1},
                        layer: false,
                        legend: false,
                        mapSync: false,
                        text: "Dashboard",
                        title: "Dashboard",
                        url: false,
                        widgetType: "text"
                    }, {
                        id: 'widget2',
                        dataGrid: {y: 0, x: 0, w: 1, h: 1},
                        layer: false,
                        legend: false,
                        map: {
                            bbox: {
                                bounds: {minx: -16505099.28586463, miny: 1173433.3176468946, maxx: -5194865.084563671, maxy: 8041758.9312396925},
                                crs: "EPSG:3857",
                                rotation: 0
                            },
                            groups: {id: "Default", expanded: true},
                            layers: [{
                                group: "background",
                                id: "mapnik__0",
                                name: "mapnik",
                                source: "osm",
                                title: "Open Street Map",
                                type: "osm",
                                visibility: true
                            }, {
                                apiKey: "__API_KEY_MAPQUEST__",
                                group: "background",
                                id: "osm__2",
                                name: "osm",
                                source: "mapquest",
                                title: "MapQuest OSM",
                                type: "mapquest",
                                visibility: false
                            }, {
                                group: "background",
                                id: "Night2012__3",
                                name: "Night2012",
                                provider: "NASAGIBS.ViirsEarthAtNight2012",
                                source: "nasagibs",
                                title: "NASAGIBS Night 2012",
                                type: "tileprovider",
                                visibility: false
                            }, {
                                group: "background",
                                id: "OpenTopoMap__4",
                                name: "OpenTopoMap",
                                provider: "OpenTopoMap",
                                source: "OpenTopoMap",
                                title: "OpenTopoMap",
                                type: "tileprovider",
                                visibility: false
                            }, {
                                group: "background",
                                id: "undefined__5",
                                source: "ol",
                                title: "Empty Background",
                                type: "empty",
                                visibility: false
                            }, {
                                allowedSRS: {},
                                bbox: {crs: "EPSG:4326", bounds: {
                                    maxx: -66.969849,
                                    maxy: 49.371735,
                                    minx: -124.73142200000001,
                                    miny: 24.955967
                                }},
                                description: "This is some census data on the states.",
                                dimensions: [],
                                id: "topp:states__xbiwklaqww",
                                links: [],
                                name: "topp:states",
                                params: {},
                                search: {type: "wfs", url: "https://demo.geo-solutions.it:443/geoserver/wfs"},
                                title: "USA Population",
                                type: "wms",
                                url: "https://demo.geo-solutions.it:443/geoserver/wms",
                                visibility: true
                            }],
                            maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                            size: {width: 578, height: 351},
                            projection: "EPSG:900913",
                            units: "m",
                            center: {x: -97.46704829402395, y: 38.19914131811602, crs: "EPSG:4326"},
                            zoom: 3
                        },
                        mapStateSource: "__base_map__",
                        mapSync: false,
                        title: "Map of united states",
                        url: false,
                        widgetType: "map"
                    }, {
                        id: 'widget3',
                        dataGrid: {y: 0, x: 0, w: 1, h: 1},
                        dependenciesMap: {layers: "widgets[widget3].map.layers", zoom: "widgets[widget3].map.zoom", viewport: "widgets[widget3].map.viewport"},
                        layer: false,
                        legend: false,
                        mapSync: true,
                        title: "Legend",
                        url: false,
                        widgetType: "legend"
                    }]
                }
            },
            widgets: {
                containers: {
                    floating: {
                        layouts: {
                            lg: {
                                w: 1,
                                x: 0,
                                y: 0,
                                h: 1,
                                i: "252bb010-49f7-11e8-9f59-630c9298622e"
                            }
                        },
                        widgets: [{
                            id: 'widget1',
                            dataGrid: {y: 0, x: 0, w: 1, h: 1},
                            layer: false,
                            legend: false,
                            mapSync: false,
                            text: "Dashboard",
                            title: "Dashboard",
                            url: false,
                            widgetType: "text"
                        }, {
                            id: 'widget2',
                            dataGrid: {y: 0, x: 0, w: 1, h: 1},
                            layer: false,
                            legend: false,
                            map: {
                                bbox: {
                                    bounds: {minx: -16505099.28586463, miny: 1173433.3176468946, maxx: -5194865.084563671, maxy: 8041758.9312396925},
                                    crs: "EPSG:3857",
                                    rotation: 0
                                },
                                groups: {id: "Default", expanded: true},
                                layers: [{
                                    group: "background",
                                    id: "mapnik__0",
                                    name: "mapnik",
                                    source: "osm",
                                    title: "Open Street Map",
                                    type: "osm",
                                    visibility: true
                                }, {
                                    apiKey: "__API_KEY_MAPQUEST__",
                                    group: "background",
                                    id: "osm__2",
                                    name: "osm",
                                    source: "mapquest",
                                    title: "MapQuest OSM",
                                    type: "mapquest",
                                    visibility: false
                                }, {
                                    group: "background",
                                    id: "Night2012__3",
                                    name: "Night2012",
                                    provider: "NASAGIBS.ViirsEarthAtNight2012",
                                    source: "nasagibs",
                                    title: "NASAGIBS Night 2012",
                                    type: "tileprovider",
                                    visibility: false
                                }, {
                                    group: "background",
                                    id: "OpenTopoMap__4",
                                    name: "OpenTopoMap",
                                    provider: "OpenTopoMap",
                                    source: "OpenTopoMap",
                                    title: "OpenTopoMap",
                                    type: "tileprovider",
                                    visibility: false
                                }, {
                                    group: "background",
                                    id: "undefined__5",
                                    source: "ol",
                                    title: "Empty Background",
                                    type: "empty",
                                    visibility: false
                                }, {
                                    allowedSRS: {},
                                    bbox: {crs: "EPSG:4326", bounds: {
                                        maxx: -66.969849,
                                        maxy: 49.371735,
                                        minx: -124.73142200000001,
                                        miny: 24.955967
                                    }},
                                    description: "This is some census data on the states.",
                                    dimensions: [],
                                    id: "topp:states__xbiwklaqww",
                                    links: [],
                                    name: "topp:states",
                                    params: {},
                                    search: {type: "wfs", url: "https://demo.geo-solutions.it:443/geoserver/wfs"},
                                    title: "USA Population",
                                    type: "wms",
                                    url: "https://demo.geo-solutions.it:443/geoserver/wms",
                                    visibility: true
                                }],
                                maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                                size: {width: 578, height: 351},
                                projection: "EPSG:900913",
                                units: "m",
                                center: {x: -98.46704829402395, y: 38.19914131811602, crs: "EPSG:4326"},
                                zoom: 3
                            },
                            mapStateSource: "__base_map__",
                            mapSync: false,
                            title: "Map of united states",
                            url: false,
                            widgetType: "map"
                        }, {
                            id: 'widget3',
                            dataGrid: {y: 0, x: 0, w: 1, h: 1},
                            dependenciesMap: {layers: "widgets[widget3].map.layers", zoom: "widgets[widget3].map.zoom", viewport: "widgets[widget3].map.viewport"},
                            layer: false,
                            legend: false,
                            mapSync: true,
                            title: "Legend",
                            url: false,
                            widgetType: "legend"
                        }]
                    }
                }
            }
        };
        expect(dashboardHasPendingChangesSelector(state)).toBe(true);
    });
    it('dashboardHasPendingChanges selector with map center change in widget for less than 1e-12', () => {
        const state = {
            dashboard: {
                resource: {
                    canEdit: true
                },
                originalData: {
                    layouts: {
                        lg: {
                            w: 1,
                            x: 0,
                            y: 0,
                            h: 1,
                            i: "252bb010-49f7-11e8-9f59-630c9298622e"
                        }
                    },
                    widgets: [{
                        id: 'widget1',
                        dataGrid: {y: 0, x: 0, w: 1, h: 1},
                        layer: false,
                        legend: false,
                        mapSync: false,
                        text: "Dashboard",
                        title: "Dashboard",
                        url: false,
                        widgetType: "text"
                    }, {
                        id: 'widget2',
                        dataGrid: {y: 0, x: 0, w: 1, h: 1},
                        layer: false,
                        legend: false,
                        map: {
                            bbox: {
                                bounds: {minx: -16505099.28586463, miny: 1173433.3176468946, maxx: -5194865.084563671, maxy: 8041758.9312396925},
                                crs: "EPSG:3857",
                                rotation: 0
                            },
                            groups: {id: "Default", expanded: true},
                            layers: [{
                                group: "background",
                                id: "mapnik__0",
                                name: "mapnik",
                                source: "osm",
                                title: "Open Street Map",
                                type: "osm",
                                visibility: true
                            }, {
                                apiKey: "__API_KEY_MAPQUEST__",
                                group: "background",
                                id: "osm__2",
                                name: "osm",
                                source: "mapquest",
                                title: "MapQuest OSM",
                                type: "mapquest",
                                visibility: false
                            }, {
                                group: "background",
                                id: "Night2012__3",
                                name: "Night2012",
                                provider: "NASAGIBS.ViirsEarthAtNight2012",
                                source: "nasagibs",
                                title: "NASAGIBS Night 2012",
                                type: "tileprovider",
                                visibility: false
                            }, {
                                group: "background",
                                id: "OpenTopoMap__4",
                                name: "OpenTopoMap",
                                provider: "OpenTopoMap",
                                source: "OpenTopoMap",
                                title: "OpenTopoMap",
                                type: "tileprovider",
                                visibility: false
                            }, {
                                group: "background",
                                id: "undefined__5",
                                source: "ol",
                                title: "Empty Background",
                                type: "empty",
                                visibility: false
                            }, {
                                allowedSRS: {},
                                bbox: {crs: "EPSG:4326", bounds: {
                                    maxx: -66.969849,
                                    maxy: 49.371735,
                                    minx: -124.73142200000001,
                                    miny: 24.955967
                                }},
                                description: "This is some census data on the states.",
                                dimensions: [],
                                id: "topp:states__xbiwklaqww",
                                links: [],
                                name: "topp:states",
                                params: {},
                                search: {type: "wfs", url: "https://demo.geo-solutions.it:443/geoserver/wfs"},
                                title: "USA Population",
                                type: "wms",
                                url: "https://demo.geo-solutions.it:443/geoserver/wms",
                                visibility: true
                            }],
                            maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                            size: {width: 578, height: 351},
                            projection: "EPSG:900913",
                            units: "m",
                            center: {x: -97.46704829402395, y: 38.19914131811602, crs: "EPSG:4326"},
                            zoom: 3
                        },
                        mapStateSource: "__base_map__",
                        mapSync: false,
                        title: "Map of united states",
                        url: false,
                        widgetType: "map"
                    }, {
                        id: 'widget3',
                        dataGrid: {y: 0, x: 0, w: 1, h: 1},
                        dependenciesMap: {layers: "widgets[widget3].map.layers", zoom: "widgets[widget3].map.zoom", viewport: "widgets[widget3].map.viewport"},
                        layer: false,
                        legend: false,
                        mapSync: true,
                        title: "Legend",
                        url: false,
                        widgetType: "legend"
                    }]
                }
            },
            widgets: {
                containers: {
                    floating: {
                        layouts: {
                            lg: {
                                w: 1,
                                x: 0,
                                y: 0,
                                h: 1,
                                i: "252bb010-49f7-11e8-9f59-630c9298622e"
                            }
                        },
                        widgets: [{
                            id: 'widget1',
                            dataGrid: {y: 0, x: 0, w: 1, h: 1},
                            layer: false,
                            legend: false,
                            mapSync: false,
                            text: "Dashboard",
                            title: "Dashboard",
                            url: false,
                            widgetType: "text"
                        }, {
                            id: 'widget2',
                            dataGrid: {y: 0, x: 0, w: 1, h: 1},
                            layer: false,
                            legend: false,
                            map: {
                                bbox: {
                                    bounds: {minx: -16505099.28586463, miny: 1173433.3176468946, maxx: -5194865.084563671, maxy: 8041758.9312396925},
                                    crs: "EPSG:3857",
                                    rotation: 0
                                },
                                groups: {id: "Default", expanded: true},
                                layers: [{
                                    group: "background",
                                    id: "mapnik__0",
                                    name: "mapnik",
                                    source: "osm",
                                    title: "Open Street Map",
                                    type: "osm",
                                    visibility: true
                                }, {
                                    apiKey: "__API_KEY_MAPQUEST__",
                                    group: "background",
                                    id: "osm__2",
                                    name: "osm",
                                    source: "mapquest",
                                    title: "MapQuest OSM",
                                    type: "mapquest",
                                    visibility: false
                                }, {
                                    group: "background",
                                    id: "Night2012__3",
                                    name: "Night2012",
                                    provider: "NASAGIBS.ViirsEarthAtNight2012",
                                    source: "nasagibs",
                                    title: "NASAGIBS Night 2012",
                                    type: "tileprovider",
                                    visibility: false
                                }, {
                                    group: "background",
                                    id: "OpenTopoMap__4",
                                    name: "OpenTopoMap",
                                    provider: "OpenTopoMap",
                                    source: "OpenTopoMap",
                                    title: "OpenTopoMap",
                                    type: "tileprovider",
                                    visibility: false
                                }, {
                                    group: "background",
                                    id: "undefined__5",
                                    source: "ol",
                                    title: "Empty Background",
                                    type: "empty",
                                    visibility: false
                                }, {
                                    allowedSRS: {},
                                    bbox: {crs: "EPSG:4326", bounds: {
                                        maxx: -66.969849,
                                        maxy: 49.371735,
                                        minx: -124.73142200000001,
                                        miny: 24.955967
                                    }},
                                    description: "This is some census data on the states.",
                                    dimensions: [],
                                    id: "topp:states__xbiwklaqww",
                                    links: [],
                                    name: "topp:states",
                                    params: {},
                                    search: {type: "wfs", url: "https://demo.geo-solutions.it:443/geoserver/wfs"},
                                    title: "USA Population",
                                    type: "wms",
                                    url: "https://demo.geo-solutions.it:443/geoserver/wms",
                                    visibility: true
                                }],
                                maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                                size: {width: 578, height: 351},
                                projection: "EPSG:900913",
                                units: "m",
                                center: {x: -97.46704829402385, y: 38.199141318116, crs: "EPSG:4326"},
                                zoom: 3
                            },
                            mapStateSource: "__base_map__",
                            mapSync: false,
                            title: "Map of united states",
                            url: false,
                            widgetType: "map"
                        }, {
                            id: 'widget3',
                            dataGrid: {y: 0, x: 0, w: 1, h: 1},
                            dependenciesMap: {layers: "widgets[widget3].map.layers", zoom: "widgets[widget3].map.zoom", viewport: "widgets[widget3].map.viewport"},
                            layer: false,
                            legend: false,
                            mapSync: true,
                            title: "Legend",
                            url: false,
                            widgetType: "legend"
                        }]
                    }
                }
            }
        };
        expect(dashboardHasPendingChangesSelector(state)).toBe(false);
    });
    it('dashboardHasPendingChanges selector with map bbox change returns false', () => {
        const state = {
            dashboard: {
                resource: {
                    canEdit: true
                },
                originalData: {
                    layouts: {
                        lg: {
                            w: 1,
                            x: 0,
                            y: 0,
                            h: 1,
                            i: "252bb010-49f7-11e8-9f59-630c9298622e"
                        }
                    },
                    widgets: [{
                        id: 'widget1',
                        dataGrid: {y: 0, x: 0, w: 1, h: 1},
                        layer: false,
                        legend: false,
                        mapSync: false,
                        text: "Dashboard",
                        title: "Dashboard",
                        url: false,
                        widgetType: "text"
                    }, {
                        id: 'widget2',
                        dataGrid: {y: 0, x: 0, w: 1, h: 1},
                        layer: false,
                        legend: false,
                        map: {
                            bbox: {
                                bounds: {minx: -16505099.28586463, miny: 1173433.3176468946, maxx: -5194865.084563671, maxy: 8041758.9312396925},
                                crs: "EPSG:3857",
                                rotation: 0
                            },
                            groups: {id: "Default", expanded: true},
                            layers: [{
                                group: "background",
                                id: "mapnik__0",
                                name: "mapnik",
                                source: "osm",
                                title: "Open Street Map",
                                type: "osm",
                                visibility: true
                            }, {
                                apiKey: "__API_KEY_MAPQUEST__",
                                group: "background",
                                id: "osm__2",
                                name: "osm",
                                source: "mapquest",
                                title: "MapQuest OSM",
                                type: "mapquest",
                                visibility: false
                            }, {
                                group: "background",
                                id: "Night2012__3",
                                name: "Night2012",
                                provider: "NASAGIBS.ViirsEarthAtNight2012",
                                source: "nasagibs",
                                title: "NASAGIBS Night 2012",
                                type: "tileprovider",
                                visibility: false
                            }, {
                                group: "background",
                                id: "OpenTopoMap__4",
                                name: "OpenTopoMap",
                                provider: "OpenTopoMap",
                                source: "OpenTopoMap",
                                title: "OpenTopoMap",
                                type: "tileprovider",
                                visibility: false
                            }, {
                                group: "background",
                                id: "undefined__5",
                                source: "ol",
                                title: "Empty Background",
                                type: "empty",
                                visibility: false
                            }, {
                                allowedSRS: {},
                                bbox: {crs: "EPSG:4326", bounds: {
                                    maxx: -66.969849,
                                    maxy: 49.371735,
                                    minx: -124.73142200000001,
                                    miny: 24.955967
                                }},
                                description: "This is some census data on the states.",
                                dimensions: [],
                                id: "topp:states__xbiwklaqww",
                                links: [],
                                name: "topp:states",
                                params: {},
                                search: {type: "wfs", url: "https://demo.geo-solutions.it:443/geoserver/wfs"},
                                title: "USA Population",
                                type: "wms",
                                url: "https://demo.geo-solutions.it:443/geoserver/wms",
                                visibility: true
                            }],
                            maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                            size: {width: 578, height: 351},
                            projection: "EPSG:900913",
                            units: "m",
                            center: {x: -97.46704829402395, y: 38.19914131811602, crs: "EPSG:4326"},
                            zoom: 3
                        },
                        mapStateSource: "__base_map__",
                        mapSync: false,
                        title: "Map of united states",
                        url: false,
                        widgetType: "map"
                    }, {
                        id: 'widget3',
                        dataGrid: {y: 0, x: 0, w: 1, h: 1},
                        dependenciesMap: {layers: "widgets[widget3].map.layers", zoom: "widgets[widget3].map.zoom", viewport: "widgets[widget3].map.viewport"},
                        layer: false,
                        legend: false,
                        mapSync: true,
                        title: "Legend",
                        url: false,
                        widgetType: "legend"
                    }]
                }
            },
            widgets: {
                containers: {
                    floating: {
                        layouts: {
                            lg: {
                                w: 1,
                                x: 0,
                                y: 0,
                                h: 1,
                                i: "252bb010-49f7-11e8-9f59-630c9298622e"
                            }
                        },
                        widgets: [{
                            id: 'widget1',
                            dataGrid: {y: 0, x: 0, w: 1, h: 1},
                            layer: false,
                            legend: false,
                            mapSync: false,
                            text: "Dashboard",
                            title: "Dashboard",
                            url: false,
                            widgetType: "text"
                        }, {
                            id: 'widget2',
                            dataGrid: {y: 0, x: 0, w: 1, h: 1},
                            layer: false,
                            legend: false,
                            map: {
                                bbox: {
                                    bounds: {minx: -16505099.28586463, miny: 1173433.3176468946, maxx: -5194865.084563671, maxy: 8041758.9312396925},
                                    crs: "EPSG:3857",
                                    rotation: 0
                                },
                                groups: {id: "Default", expanded: true},
                                layers: [{
                                    group: "background",
                                    id: "mapnik__0",
                                    name: "mapnik",
                                    source: "osm",
                                    title: "Open Street Map",
                                    type: "osm",
                                    visibility: true
                                }, {
                                    apiKey: "__API_KEY_MAPQUEST__",
                                    group: "background",
                                    id: "osm__2",
                                    name: "osm",
                                    source: "mapquest",
                                    title: "MapQuest OSM",
                                    type: "mapquest",
                                    visibility: false
                                }, {
                                    group: "background",
                                    id: "Night2012__3",
                                    name: "Night2012",
                                    provider: "NASAGIBS.ViirsEarthAtNight2012",
                                    source: "nasagibs",
                                    title: "NASAGIBS Night 2012",
                                    type: "tileprovider",
                                    visibility: false
                                }, {
                                    group: "background",
                                    id: "OpenTopoMap__4",
                                    name: "OpenTopoMap",
                                    provider: "OpenTopoMap",
                                    source: "OpenTopoMap",
                                    title: "OpenTopoMap",
                                    type: "tileprovider",
                                    visibility: false
                                }, {
                                    group: "background",
                                    id: "undefined__5",
                                    source: "ol",
                                    title: "Empty Background",
                                    type: "empty",
                                    visibility: false
                                }, {
                                    allowedSRS: {},
                                    bbox: {crs: "EPSG:4326", bounds: {
                                        maxx: -66.969849,
                                        maxy: 49.371735,
                                        minx: -124.73142200000001,
                                        miny: 24.955967
                                    }},
                                    description: "This is some census data on the states.",
                                    dimensions: [],
                                    id: "topp:states__xbiwklaqww",
                                    links: [],
                                    name: "topp:states",
                                    params: {},
                                    search: {type: "wfs", url: "https://demo.geo-solutions.it:443/geoserver/wfs"},
                                    title: "USA Population",
                                    type: "wms",
                                    url: "https://demo.geo-solutions.it:443/geoserver/wms",
                                    visibility: true
                                }],
                                maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                                size: {width: 578, height: 351},
                                projection: "EPSG:900913",
                                units: "m",
                                center: {x: -97.46704829402395, y: 38.19914131811602, crs: "EPSG:4326"},
                                zoom: 3
                            },
                            mapStateSource: "__base_map__",
                            mapSync: false,
                            title: "Map of united states",
                            url: false,
                            widgetType: "map"
                        }, {
                            id: 'widget3',
                            dataGrid: {y: 0, x: 0, w: 1, h: 1},
                            dependenciesMap: {layers: "widgets[widget3].map.layers", zoom: "widgets[widget3].map.zoom", viewport: "widgets[widget3].map.viewport"},
                            layer: false,
                            legend: false,
                            mapSync: true,
                            title: "Legend",
                            url: false,
                            widgetType: "legend"
                        }]
                    }
                }
            }
        };
        expect(dashboardHasPendingChangesSelector(state)).toBe(false);
    });
    it('dashboardHasPendingChanges selector with map size change returns false', () => {
        const state = {
            dashboard: {
                resource: {
                    canEdit: true
                },
                originalData: {
                    layouts: {
                        lg: {
                            w: 1,
                            x: 0,
                            y: 0,
                            h: 1,
                            i: "252bb010-49f7-11e8-9f59-630c9298622e"
                        }
                    },
                    widgets: [{
                        id: 'widget1',
                        dataGrid: {y: 0, x: 0, w: 1, h: 1},
                        layer: false,
                        legend: false,
                        mapSync: false,
                        text: "Dashboard",
                        title: "Dashboard",
                        url: false,
                        widgetType: "text"
                    }, {
                        id: 'widget2',
                        dataGrid: {y: 0, x: 0, w: 1, h: 1},
                        layer: false,
                        legend: false,
                        map: {
                            bbox: {
                                bounds: {minx: -16505099.28586463, miny: 1173433.3176468946, maxx: -5194865.084563671, maxy: 8041758.9312396925},
                                crs: "EPSG:3857",
                                rotation: 0
                            },
                            groups: {id: "Default", expanded: true},
                            layers: [{
                                group: "background",
                                id: "mapnik__0",
                                name: "mapnik",
                                source: "osm",
                                title: "Open Street Map",
                                type: "osm",
                                visibility: true
                            }, {
                                apiKey: "__API_KEY_MAPQUEST__",
                                group: "background",
                                id: "osm__2",
                                name: "osm",
                                source: "mapquest",
                                title: "MapQuest OSM",
                                type: "mapquest",
                                visibility: false
                            }, {
                                group: "background",
                                id: "Night2012__3",
                                name: "Night2012",
                                provider: "NASAGIBS.ViirsEarthAtNight2012",
                                source: "nasagibs",
                                title: "NASAGIBS Night 2012",
                                type: "tileprovider",
                                visibility: false
                            }, {
                                group: "background",
                                id: "OpenTopoMap__4",
                                name: "OpenTopoMap",
                                provider: "OpenTopoMap",
                                source: "OpenTopoMap",
                                title: "OpenTopoMap",
                                type: "tileprovider",
                                visibility: false
                            }, {
                                group: "background",
                                id: "undefined__5",
                                source: "ol",
                                title: "Empty Background",
                                type: "empty",
                                visibility: false
                            }, {
                                allowedSRS: {},
                                bbox: {crs: "EPSG:4326", bounds: {
                                    maxx: -66.969849,
                                    maxy: 49.371735,
                                    minx: -124.73142200000001,
                                    miny: 24.955967
                                }},
                                description: "This is some census data on the states.",
                                dimensions: [],
                                id: "topp:states__xbiwklaqww",
                                links: [],
                                name: "topp:states",
                                params: {},
                                search: {type: "wfs", url: "https://demo.geo-solutions.it:443/geoserver/wfs"},
                                title: "USA Population",
                                type: "wms",
                                url: "https://demo.geo-solutions.it:443/geoserver/wms",
                                visibility: true
                            }],
                            maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                            size: {width: 578, height: 351},
                            projection: "EPSG:900913",
                            units: "m",
                            center: {x: -97.46704829402395, y: 38.19914131811602, crs: "EPSG:4326"},
                            zoom: 3
                        },
                        mapStateSource: "__base_map__",
                        mapSync: false,
                        title: "Map of united states",
                        url: false,
                        widgetType: "map"
                    }, {
                        id: 'widget3',
                        dataGrid: {y: 0, x: 0, w: 1, h: 1},
                        dependenciesMap: {layers: "widgets[widget3].map.layers", zoom: "widgets[widget3].map.zoom", viewport: "widgets[widget3].map.viewport"},
                        layer: false,
                        legend: false,
                        mapSync: true,
                        title: "Legend",
                        url: false,
                        widgetType: "legend"
                    }]
                }
            },
            widgets: {
                containers: {
                    floating: {
                        layouts: {
                            lg: {
                                w: 1,
                                x: 0,
                                y: 0,
                                h: 1,
                                i: "252bb010-49f7-11e8-9f59-630c9298622e"
                            }
                        },
                        widgets: [{
                            id: 'widget1',
                            dataGrid: {y: 0, x: 0, w: 1, h: 1},
                            layer: false,
                            legend: false,
                            mapSync: false,
                            text: "Dashboard",
                            title: "Dashboard",
                            url: false,
                            widgetType: "text"
                        }, {
                            id: 'widget2',
                            dataGrid: {y: 0, x: 0, w: 1, h: 1},
                            layer: false,
                            legend: false,
                            map: {
                                bbox: {
                                    bounds: {minx: -16505099.28586463, miny: 1173433.3176468946, maxx: -5194865.084563671, maxy: 8041758.9312396925},
                                    crs: "EPSG:3857",
                                    rotation: 0
                                },
                                groups: {id: "Default", expanded: true},
                                layers: [{
                                    group: "background",
                                    id: "mapnik__0",
                                    name: "mapnik",
                                    source: "osm",
                                    title: "Open Street Map",
                                    type: "osm",
                                    visibility: true
                                }, {
                                    apiKey: "__API_KEY_MAPQUEST__",
                                    group: "background",
                                    id: "osm__2",
                                    name: "osm",
                                    source: "mapquest",
                                    title: "MapQuest OSM",
                                    type: "mapquest",
                                    visibility: false
                                }, {
                                    group: "background",
                                    id: "Night2012__3",
                                    name: "Night2012",
                                    provider: "NASAGIBS.ViirsEarthAtNight2012",
                                    source: "nasagibs",
                                    title: "NASAGIBS Night 2012",
                                    type: "tileprovider",
                                    visibility: false
                                }, {
                                    group: "background",
                                    id: "OpenTopoMap__4",
                                    name: "OpenTopoMap",
                                    provider: "OpenTopoMap",
                                    source: "OpenTopoMap",
                                    title: "OpenTopoMap",
                                    type: "tileprovider",
                                    visibility: false
                                }, {
                                    group: "background",
                                    id: "undefined__5",
                                    source: "ol",
                                    title: "Empty Background",
                                    type: "empty",
                                    visibility: false
                                }, {
                                    allowedSRS: {},
                                    bbox: {crs: "EPSG:4326", bounds: {
                                        maxx: -66.969849,
                                        maxy: 49.371735,
                                        minx: -124.73142200000001,
                                        miny: 24.955967
                                    }},
                                    description: "This is some census data on the states.",
                                    dimensions: [],
                                    id: "topp:states__xbiwklaqww",
                                    links: [],
                                    name: "topp:states",
                                    params: {},
                                    search: {type: "wfs", url: "https://demo.geo-solutions.it:443/geoserver/wfs"},
                                    title: "USA Population",
                                    type: "wms",
                                    url: "https://demo.geo-solutions.it:443/geoserver/wms",
                                    visibility: true
                                }],
                                maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                                size: {width: 478, height: 351},
                                projection: "EPSG:900913",
                                units: "m",
                                center: {x: -97.46704829402395, y: 38.19914131811602, crs: "EPSG:4326"},
                                zoom: 3
                            },
                            mapStateSource: "__base_map__",
                            mapSync: false,
                            title: "Map of united states",
                            url: false,
                            widgetType: "map"
                        }, {
                            id: 'widget3',
                            dataGrid: {y: 0, x: 0, w: 1, h: 1},
                            dependenciesMap: {layers: "widgets[widget3].map.layers", zoom: "widgets[widget3].map.zoom", viewport: "widgets[widget3].map.viewport"},
                            layer: false,
                            legend: false,
                            mapSync: true,
                            title: "Legend",
                            url: false,
                            widgetType: "legend"
                        }]
                    }
                }
            }
        };
        expect(dashboardHasPendingChangesSelector(state)).toBe(false);
    });
});
