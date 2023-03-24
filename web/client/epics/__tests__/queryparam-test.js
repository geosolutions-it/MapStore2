/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { addTimeoutEpic, testEpic, TEST_TIMEOUT } from './epicTestUtils';
import {
    disableGFIForShareEpic,
    onMapClickForShareEpic,
    readQueryParamsOnMapEpic
} from '../queryparams';
import { changeMapView, ZOOM_TO_EXTENT, CHANGE_MAP_VIEW, clickOnMap } from '../../actions/map';
import { configureMap } from '../../actions/config';
import { VISUALIZATION_MODE_CHANGED } from '../../actions/maptype';
import { SHOW_NOTIFICATION } from '../../actions/notifications';
import { onLocationChanged } from 'connected-react-router';
import {toggleControl} from "../../actions/controls";
import {layerLoad} from "../../actions/layers";
import {FEATURE_INFO_CLICK} from "../../actions/mapInfo";
import {
    SCHEDULE_SEARCH_LAYER_WITH_FILTER,
    SEARCH_LAYER_WITH_FILTER
} from "../../actions/search";
import {ADD_LAYERS_FROM_CATALOGS} from "../../actions/catalog";
import {SYNC_CURRENT_BACKGROUND_LAYER} from "../../actions/backgroundselector";
import { VisualizationModes } from '../../utils/MapTypeUtils';

const center = {
    x: -74.2,
    y: 40.7,
    crs: "EPSG:4326"
};
const zoom = 16;
const bbox = {
    bounds: {
        minx: -180,
        miny: -90,
        maxx: 180,
        maxy: 90
    },
    crs: "EPSG:4326",
    rotation: 0
};
const size = {
    height: 8717,
    width: 8717
};

const mapStateSource = 'map';
const projection = "EPSG:900913";

const viewerOptions = {
    orientation: {
        heading: 0,
        pitch: 0,
        roll: 0
    }
};

describe('queryparam epics', () => {
    it('test readQueryParamsOnMapEpic without params in url search', (done) => {
        const state = {
            router: {
                location: {
                    search: ''
                }
            }
        };
        const NUMBER_OF_ACTIONS = 1;

        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 10),
            NUMBER_OF_ACTIONS, [
                onLocationChanged({}),
                changeMapView()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                actions.map((action) => {
                    switch (action.type) {
                    case TEST_TIMEOUT:
                        done();
                        break;
                    default:
                        done(new Error("Action not recognized"));
                    }
                });
                done();
            }, state);
    });

    it('test readQueryParamsOnMapEpic with bbox param in url search', (done) => {
        const state = {
            router: {
                location: {
                    search: '?bbox=9,45,10,46'
                }
            }
        };
        const NUMBER_OF_ACTIONS = 1;

        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 10),
            NUMBER_OF_ACTIONS, [
                onLocationChanged({}),
                layerLoad()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe(ZOOM_TO_EXTENT);
                    expect(Math.floor(actions[0].extent[0])).toBe(9);
                    expect(Math.floor(actions[0].extent[1])).toBe(45);
                    expect(Math.floor(actions[0].extent[2])).toBe(10);
                    expect(Math.floor(actions[0].extent[3])).toBe(46);
                    expect(actions[0].crs).toBe('EPSG:4326');
                    expect(actions[0].options.nearest).toBe(true);
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });

    it('test onMapClickForShareEpic', (done)=>{

        const point = {latlng: {lat: 39.01, lng: -89.97}};
        const layer = "layer01";
        const NUMBER_OF_ACTIONS = 2;
        const state = {
            controls: {
                share: {
                    settings: {
                        centerAndZoomEnabled: true
                    }
                }
            }
        };

        testEpic(
            addTimeoutEpic(onMapClickForShareEpic, 10),
            NUMBER_OF_ACTIONS, [
                clickOnMap(point, layer)
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe("TEXT_SEARCH_RESET");
                    expect(actions[1].type).toBe("TEXT_SEARCH_ADD_MARKER");
                    expect(actions[1].markerPosition).toEqual(point);
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });

    it('test disableGFIForShareEpic, on share panel open with mapInfo enabled', (done)=>{

        const NUMBER_OF_ACTIONS = 1;
        const state = {controls: {share: {enabled: true}}, mapInfo: {enabled: true}};

        testEpic(
            addTimeoutEpic(disableGFIForShareEpic, 10),
            NUMBER_OF_ACTIONS, [
                toggleControl('share', null)
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe("TOGGLE_MAPINFO_STATE");
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });
    it('test disableGFIForShareEpic, on share panel open with mapInfo enabled and mapInfo open', (done)=>{

        const NUMBER_OF_ACTIONS = 2;
        const state = {controls: {share: {enabled: true}}, mapInfo: {enabled: true, clickPoint: {latlng: {lat: 40, lng: -80}}, requests: ["test"]}};

        testEpic(
            addTimeoutEpic(disableGFIForShareEpic, 10),
            NUMBER_OF_ACTIONS, [
                toggleControl('share', null)
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe("TOGGLE_MAPINFO_STATE");
                    expect(actions[1].type).toBe("TEXT_SEARCH_ADD_MARKER");
                    expect(actions[1].markerPosition).toEqual({"latlng": {"lat": 40, "lng": -80}});
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });
    it('test disableGFIForShareEpic, on share panel close', (done)=>{
        const state = {controls: {share: { enabled: false }}};
        const NUMBER_OF_ACTIONS = 4;
        testEpic(
            addTimeoutEpic(disableGFIForShareEpic, 10),
            NUMBER_OF_ACTIONS, [
                toggleControl('share', null)
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe("HIDE_MAPINFO_MARKER");
                    expect(actions[1].type).toBe("PURGE_MAPINFO_RESULTS");
                    expect(actions[2].type).toBe("TOGGLE_MAPINFO_STATE");
                    expect(actions[3].type).toBe("SET_CONTROL_PROPERTY");
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });

    it('test readQueryParamsOnMapEpic with wrong bbox param in url search', (done) => {
        const state = {
            router: {
                location: {
                    search: '?bbox=a,46,10,45'
                }
            }
        };
        const NUMBER_OF_ACTIONS = 1;

        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 10),
            NUMBER_OF_ACTIONS, [
                onLocationChanged({}),
                layerLoad()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe(SHOW_NOTIFICATION);
                    expect(actions[0].level).toBe( 'warning');
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });

    it('test readQueryParamsOnMapEpic with center and zoom param in url search', (done) => {
        const state = {
            router: {
                location: {
                    search: '?center=-90,38&zoom=4'
                }
            },
            map: {
                size: {height: 726, width: 1536},
                projection: "EPSG:900913"
            }
        };
        const NUMBER_OF_ACTIONS = 1;

        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 10),
            NUMBER_OF_ACTIONS, [
                onLocationChanged({}),
                layerLoad()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe(CHANGE_MAP_VIEW);
                    expect(actions[0].center).toExist();
                    expect(actions[0].center.x).toBe(-90);
                    expect(actions[0].center.y).toBe(38);
                    expect(actions[0].zoom).toBe(4);
                    expect(actions[0].size.height).toBe(726);
                    expect(actions[0].size.width).toBe(1536);
                    expect(actions[0].projection).toBe("EPSG:900913");
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });

    it('test readQueryParamsOnMapEpic with marker and zoom param in url search', (done) => {
        const state = {
            router: {
                location: {
                    search: '?marker=-90,38&zoom=4'
                }
            },
            map: {
                size: {height: 726, width: 1536},
                projection: "EPSG:900913"
            }
        };
        const NUMBER_OF_ACTIONS = 2;

        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 10),
            NUMBER_OF_ACTIONS, [
                onLocationChanged({}),
                layerLoad()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe(CHANGE_MAP_VIEW);
                    expect(actions[0].center).toExist();
                    expect(actions[0].center.x).toBe(-90);
                    expect(actions[0].center.y).toBe(38);
                    expect(actions[0].zoom).toBe(4);
                    expect(actions[1].type).toContain("ADD_MARKER");
                    expect(actions[1].markerPosition).toExist();
                    expect(actions[1].markerPosition.lat).toBe(38);
                    expect(actions[1].markerPosition.lng).toBe(-90);
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });

    it('test readQueryParamsOnMapEpic with wrong center and zoom param in url search', (done) => {
        const state = {
            router: {
                location: {
                    search: '?center=-190,46&zoom=5'
                }
            },
            map: {
                size: {width: 100, height: 100},
                projection: "EPSG:4326"
            }
        };
        const NUMBER_OF_ACTIONS = 1;

        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 10),
            NUMBER_OF_ACTIONS, [
                onLocationChanged({}),
                layerLoad()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe(SHOW_NOTIFICATION);
                    expect(actions[0].level).toBe( 'warning');
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });

    it('test readQueryParamsOnMapEpic with wrong marker and zoom param in url search', (done) => {
        const state = {
            router: {
                location: {
                    search: '?marker=-90,120&zoom=5'
                }
            },
            map: {
                size: {width: 100, height: 100},
                projection: "EPSG:4326"
            }
        };
        const NUMBER_OF_ACTIONS = 1;

        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 10),
            NUMBER_OF_ACTIONS, [
                onLocationChanged({}),
                layerLoad()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe(SHOW_NOTIFICATION);
                    expect(actions[0].level).toBe( 'warning');
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });

    it('test readQueryParamsOnMapEpic with featureinfo and zoom in url search', (done) => {
        const state = {
            router: {
                location: {
                    search: '?featureinfo={%22lat%22:%200,%20%22lng%22:%200}&zoom=5'
                }
            },
            map: {
                size: {width: 100, height: 100},
                projection: "EPSG:4326"
            }
        };
        const NUMBER_OF_ACTIONS = 1;

        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 10),
            NUMBER_OF_ACTIONS, [
                onLocationChanged({}),
                layerLoad()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe(FEATURE_INFO_CLICK);
                    expect(actions[0].point.latlng).toEqual({lat: 0, lng: 0});
                    expect(actions[0].point.pixel).toBe(undefined);
                    expect(actions[0].point.geometricFilter).toExist();
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });
    it('test readQueryParamsOnMapEpic with featureinfo in sessionStorage', (done) => {
        sessionStorage.setItem('queryParams', JSON.stringify({featureinfo: {lat: 0, lng: 0, filterNameList: []}}));
        const state = {
            router: {
                location: {
                    search: ''
                }
            },
            map: {
                size: {width: 100, height: 100},
                projection: "EPSG:4326"
            }
        };
        const NUMBER_OF_ACTIONS = 1;

        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 10),
            NUMBER_OF_ACTIONS, [
                onLocationChanged({}),
                layerLoad()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe(FEATURE_INFO_CLICK);
                    expect(actions[0].point.latlng).toEqual({lat: 0, lng: 0});
                    expect(actions[0].point.pixel).toBe(undefined);
                    expect(actions[0].point.geometricFilter).toExist();
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });
    it('test readQueryParamsOnMapEpic with cesium (3d map) params', (done) => {
        const state = {
            router: {
                location: {
                    search: "?center=-74.2,40.7&zoom=16.5&heading=0.1&pitch=-0.7&roll=6.2"
                }
            },
            mode: "embedded",
            mapType: "leaflet"
        };
        const NUMBER_OF_ACTIONS = 2;
        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 10),
            NUMBER_OF_ACTIONS, [
                onLocationChanged({}),
                layerLoad()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe(CHANGE_MAP_VIEW);
                    expect(actions[0].center).toExist();
                    expect(actions[0].center.x).toBe(-74.2);
                    expect(actions[0].center.y).toBe(40.7);
                    expect(actions[0].zoom).toBe(16.5);
                    expect(actions[0].viewerOptions.heading).toBe(0.1);
                    expect(actions[0].viewerOptions.pitch).toBe(-0.7);
                    expect(actions[0].viewerOptions.roll).toBe(6.2);
                    done();
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });
    it('Test readQueryParamsOnMapEpic / actions dispatched on Change View', (done)=>{
        const state = {
            maptype: {
                mapType: 'cesium'
            },
            router: {
                location: {
                    search: "?center=-74.2,40.7&zoom=16.5&heading=0.1&pitch=-0.7&roll=6.2"
                }
            }
        };
        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 1000),
            1, [
                onLocationChanged({}),
                changeMapView(center, zoom, bbox, size, mapStateSource, projection, viewerOptions, '')
            ], actions => {
                expect(actions.length).toBe(1);
                try {
                    expect(actions[0].type).toBe("MAP:ORIENTATION");
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });
    it('Test readQueryParamsOnMapEpic / actions dispatched on Change View with POST parameters', (done)=>{
        const state = {
            maptype: {
                mapType: 'cesium'
            },
            router: {
                location: {
                    search: ""
                }
            }
        };
        sessionStorage.setItem('queryParams', JSON.stringify({
            center: '-74.2,40.7',
            zoom: '16.5',
            heading: '0.1',
            pitch: '-0.7',
            roll: '6.2'
        }));

        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 1000),
            1, [
                onLocationChanged({}),
                changeMapView(center, zoom, bbox, size, mapStateSource, projection, viewerOptions, '')
            ], actions => {
                expect(actions.length).toBe(1);
                try {
                    expect(actions[0].type).toBe("MAP:ORIENTATION");
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });
    //
    it('Test readQueryParamsOnMapEpic / changeMapView does not trigger orientateMap if map type is not cesium', (done)=>{
        const state = {
            maptype: {
                mapType: 'openlayer'
            },
            router: {
                location: {
                    search: "?center=-74.2,40.7&zoom=16.5&heading=0.1&pitch=-0.7&roll=6.2"
                }
            }
        };

        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 100),
            1, [
                onLocationChanged({}),
                changeMapView(center, zoom, bbox, size, mapStateSource, projection, viewerOptions, '')
            ], actions => {
                expect(actions.length).toBe(2);
                try {
                    expect(actions[0].type).toBe(TEST_TIMEOUT);
                    expect(actions[1].type).toBe("EPIC_COMPLETED");
                } catch (e) {
                    done(e);
                }
                done();
            }, state, false, true);
    });
    it('changeMapView does not trigger orientateMap if any of the viewerOptions values are undefined', (done)=>{
        const state = {
            maptype: {
                mapType: 'cesium'
            },
            router: {
                location: {
                    search: "?center=-74.2,40.7&zoom=16.5&pitch=-0.7&roll=6.2"
                }
            }
        };
        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 100),
            1, [
                onLocationChanged({}),
                changeMapView(center, zoom, bbox, size, mapStateSource, projection, viewerOptions, '')
            ], actions => {
                expect(actions.length).toBe(2);
                try {
                    expect(actions[0].type).toBe(TEST_TIMEOUT);
                    expect(actions[1].type).toBe("EPIC_COMPLETED");
                } catch (e) {
                    done(e);
                }
                done();
            }, state, false, true);
    });
    it('switch map type to 3D if cesium viewer options are found', (done) => {
        const state = {
            maptype: {
                mapType: 'openlayers'
            },
            router: {
                location: {
                    search: "?center=-74.2,40.7&zoom=16.5&heading=0.1&pitch=-0.7&roll=6.2"
                }
            }
        };
        const NUMBER_OF_ACTIONS = 2;
        testEpic(addTimeoutEpic(readQueryParamsOnMapEpic, 10), NUMBER_OF_ACTIONS, [
            onLocationChanged({}),
            configureMap()
        ], (actions) => {
            expect(actions.length).toBe(NUMBER_OF_ACTIONS);
            try {
                expect(actions[0].type).toBe(VISUALIZATION_MODE_CHANGED);
                expect(actions[0].visualizationMode).toBe(VisualizationModes._3D);
                done();
            } catch (e) {
                done(e);
            }
        }, state);
    });
    it('switch map type to 3D if actions param includes 3d tiles service', (done) => {
        const state = {
            maptype: {
                mapType: 'openlayers'
            },
            router: {
                location: {
                    search: '?actions=[{"type":"CATALOG:ADD_LAYERS_FROM_CATALOGS","layers":["Layer"],"sources":[{"type":"3dtiles","url":"https://tileset.org/tileset.json"}]}]'
                }
            }
        };
        const NUMBER_OF_ACTIONS = 2;
        testEpic(addTimeoutEpic(readQueryParamsOnMapEpic, 10), NUMBER_OF_ACTIONS, [
            onLocationChanged({}),
            configureMap()
        ], (actions) => {
            expect(actions.length).toBe(NUMBER_OF_ACTIONS);
            try {
                expect(actions[0].type).toBe(VISUALIZATION_MODE_CHANGED);
                expect(actions[0].visualizationMode).toBe(VisualizationModes._3D);
                done();
            } catch (e) {
                done(e);
            }
        }, state);
    });
    it('switch map type to 3D if addLayers param includes 3d tiles service', (done) => {
        const state = {
            maptype: {
                mapType: 'openlayers'
            },
            router: {
                location: {
                    search: '?addLayers=Layer;serviceId3DTiles'
                }
            },
            catalog: {
                services: {
                    serviceId3DTiles: {
                        type: "3dtiles",
                        url: "https://tileset.org/tileset.json"
                    }
                }
            }
        };
        const NUMBER_OF_ACTIONS = 2;
        testEpic(addTimeoutEpic(readQueryParamsOnMapEpic, 10), NUMBER_OF_ACTIONS, [
            onLocationChanged({}),
            configureMap()
        ], (actions) => {
            expect(actions.length).toBe(NUMBER_OF_ACTIONS);
            try {
                expect(actions[0].type).toBe(VISUALIZATION_MODE_CHANGED);
                expect(actions[0].visualizationMode).toBe(VisualizationModes._3D);
                done();
            } catch (e) {
                done(e);
            }
        }, state);
    });
    it('switch map type to cesium if cesium viewer options are found in sessionStorage', (done) => {
        const state = {
            maptype: {
                mapType: 'openlayers'
            },
            router: {
                location: {
                    search: ""
                }
            }
        };
        sessionStorage.setItem('queryParams', JSON.stringify({
            center: '-74.2,40.7',
            zoom: '16.5',
            heading: '0.1',
            pitch: '-0.7',
            roll: '6.2'
        }));
        const NUMBER_OF_ACTIONS = 2;
        testEpic(addTimeoutEpic(readQueryParamsOnMapEpic, 10), NUMBER_OF_ACTIONS, [
            onLocationChanged({}),
            configureMap()
        ], (actions) => {
            expect(actions.length).toBe(NUMBER_OF_ACTIONS);
            try {
                expect(actions[0].type).toBe(VISUALIZATION_MODE_CHANGED);
                expect(actions[0].visualizationMode).toBe(VisualizationModes._3D);
                done();
            } catch (e) {
                done(e);
            }
        }, state);
    });
    it('do not switch map type to cesium if cesium viewer options are present only in map state', (done) => {
        const state = {
            maptype: {
                mapType: 'openlayers'
            },
            router: {
                location: {
                    search: "?center=-74.2,40.7&zoom=16.5"
                }
            },
            map: {
                present: {
                    viewerOptions: {
                        heading: '0.1',
                        pitch: '-0.7',
                        roll: '6.2'
                    }
                }
            }
        };
        const NUMBER_OF_ACTIONS = 1;
        testEpic(addTimeoutEpic(readQueryParamsOnMapEpic, 10), NUMBER_OF_ACTIONS, [
            onLocationChanged({}),
            configureMap()
        ], (actions) => {
            expect(actions.length).toBe(NUMBER_OF_ACTIONS);
            try {
                expect(actions[0].type).toBe(TEST_TIMEOUT);
                done();
            } catch (e) {
                done(e);
            }
        }, state);
    });
    it('retain map type if cesium viewer options is not present query params', (done) => {
        const state = {
            maptype: {
                mapType: 'cesium'
            },
            router: {
                location: {
                    search: "?center=-74.2,40.7&zoom=16.5"
                }
            }
        };
        const NUMBER_OF_ACTIONS = 1;
        testEpic(addTimeoutEpic(readQueryParamsOnMapEpic, 10), NUMBER_OF_ACTIONS, [
            onLocationChanged({}),
            configureMap()
        ], (actions) => {
            expect(actions.length).toBe(NUMBER_OF_ACTIONS);
            try {
                expect(actions[0].type).toBe(TEST_TIMEOUT);
                done();
            } catch (e) {
                done(e);
            }
        }, state);
    });
    it('do nothing if cesium viewer options are not found', (done) => {
        const state = {
            maptype: {
                mapType: 'openlayers'
            },
            router: {
                location: {
                    search: "?center=-74.2,40.7&zoom=16.5&pitch=-0.7"
                }
            }
        };
        const NUMBER_OF_ACTIONS = 1;
        testEpic(addTimeoutEpic(readQueryParamsOnMapEpic, 10), NUMBER_OF_ACTIONS, [
            onLocationChanged({}),
            configureMap()
        ], (actions) => {
            expect(actions.length).toBe(NUMBER_OF_ACTIONS);
            try {
                expect(actions[0].type).toBe(TEST_TIMEOUT);
                done();
            } catch (e) {
                done(e);
            }
        }, state);
    });
    it('simplified featureinfo request', (done) => {
        const NUMBER_OF_ACTIONS = 1;
        const state = {
            maptype: {
                mapType: 'openlayers'
            },
            router: {
                location: {
                    search: "?featureInfo=-95.625,38.72"
                }
            }
        };
        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 10),
            NUMBER_OF_ACTIONS, [
                onLocationChanged({}),
                layerLoad()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe(FEATURE_INFO_CLICK);
                    expect(actions[0].point.latlng).toEqual({lng: '-95.625', lat: '38.72'});
                    expect(actions[0].point.pixel).toBe(undefined);
                    expect(actions[0].point.geometricFilter).toExist();
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });
    it('simplified mapInfo request', (done) => {
        const NUMBER_OF_ACTIONS = 1;
        const state = {
            maptype: {
                mapType: 'openlayers'
            },
            router: {
                location: {
                    search: "?mapinfo=tiger:poly_landmarks&mapInfoFilter=CFCC='H41'"
                }
            }
        };
        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 10),
            NUMBER_OF_ACTIONS, [
                onLocationChanged({}),
                layerLoad()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe(SEARCH_LAYER_WITH_FILTER);
                    expect(actions[0].layer).toBe("tiger:poly_landmarks");
                    expect(actions[0].cql_filter).toBe("CFCC='H41'");
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });
    it('simplified addLayers request', (done) => {
        const NUMBER_OF_ACTIONS = 1;
        const state = {
            maptype: {
                mapType: 'openlayers'
            },
            router: {
                location: {
                    search: "?addLayers=tiger:poly_landmarks;gs_stable_wms,anotherLayer&layerFilters=CFCC='H41'"
                }
            },
            catalog: {
                selectedService: 'service'
            }
        };
        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 10),
            NUMBER_OF_ACTIONS, [
                onLocationChanged({}),
                layerLoad()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe(ADD_LAYERS_FROM_CATALOGS);
                    expect(actions[0].layers[0]).toBe("tiger:poly_landmarks");
                    expect(actions[0].sources[0]).toBe("gs_stable_wms");
                    expect(actions[0].layers[1]).toBe("anotherLayer");
                    expect(actions[0].sources[1]).toBe("service");
                    expect(actions[0].options[0].params.CQL_FILTER).toBe("CFCC='H41'");
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });
    it('add background', (done) => {
        const NUMBER_OF_ACTIONS = 2;
        const state = {
            maptype: {
                mapType: 'openlayers'
            },
            router: {
                location: {
                    search: "?background=Sentinel"
                }
            },
            catalog: {
                selectedService: 'service',
                "staticServices": {
                    "default_map_backgrounds": {
                        "type": "backgrounds",
                        "title": "Default Backgrounds",
                        "titleMsgId": "defaultMapBackgroundsServiceTitle",
                        "autoload": true,
                        "backgrounds": [{
                            "type": "osm",
                            "title": "Open Street Map",
                            "name": "mapnik",
                            "source": "osm",
                            "group": "background"
                        }, {
                            "type": "tileprovider",
                            "title": "NASAGIBS Night 2012",
                            "provider": "NASAGIBS.ViirsEarthAtNight2012",
                            "name": "Night2012",
                            "source": "nasagibs",
                            "group": "background"
                        }, {
                            "type": "tileprovider",
                            "title": "OpenTopoMap",
                            "provider": "OpenTopoMap",
                            "name": "OpenTopoMap",
                            "source": "OpenTopoMap",
                            "group": "background"
                        }, {
                            "format": "image/jpeg",
                            "group": "background",
                            "name": "s2cloudless:s2cloudless",
                            "opacity": 1,
                            "title": "Sentinel 2 Cloudless",
                            "type": "wms",
                            "url": "https://1maps.geo-solutions.it/geoserver/wms",
                            "source": "s2cloudless",
                            "singleTile": false
                        }, {
                            "source": "ol",
                            "group": "background",
                            "title": "Empty Background",
                            "fixed": true,
                            "type": "empty"
                        }]
                    }
                }
            }
        };
        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 10),
            NUMBER_OF_ACTIONS, [
                onLocationChanged({}),
                layerLoad()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe(ADD_LAYERS_FROM_CATALOGS);
                    expect(actions[0].layers[0]).toBe("Sentinel");
                    expect(actions[0].sources[0]).toBe("service");
                    expect(actions[0].options[0].group).toBe("background");
                    expect(actions[0].options[0].visibility).toBe(true);
                    expect(actions[1].type).toBe(SYNC_CURRENT_BACKGROUND_LAYER);
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });
    it('Test readQueryParamsOnMapEpic / Cesium viewer - bbox', (done) => {
        const state = {
            maptype: {
                mapType: 'cesium'
            },
            router: {
                location: {
                    search: "?bbox=1,1,1,1"
                }
            }
        };
        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 1000),
            1, [
                onLocationChanged({}),
                changeMapView(center, zoom, bbox, size, mapStateSource, projection, viewerOptions, '')
            ], actions => {
                expect(actions.length).toBe(1);
                try {
                    expect(actions[0].type).toBe(ZOOM_TO_EXTENT);
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });
    it('Test readQueryParamsOnMapEpic / Cesium viewer - marker/zoom', (done) => {
        const state = {
            maptype: {
                mapType: 'cesium'
            },
            router: {
                location: {
                    search: "?marker=5,5&zoom=5"
                }
            }
        };
        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 1000),
            2, [
                onLocationChanged({}),
                changeMapView(center, zoom, bbox, size, mapStateSource, projection, viewerOptions, '')
            ], actions => {
                expect(actions.length).toBe(2);
                try {
                    expect(actions[0].type).toBe(CHANGE_MAP_VIEW);
                    expect(actions[0].center).toExist();
                    expect(actions[0].center.x).toBe(5);
                    expect(actions[0].center.y).toBe(5);
                    expect(actions[0].zoom).toBe(5);
                    expect(actions[1].type).toContain("ADD_MARKER");
                    expect(actions[1].markerPosition).toExist();
                    expect(actions[1].markerPosition.lat).toBe(5);
                    expect(actions[1].markerPosition.lng).toBe(5);
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });
    it('Test readQueryParamsOnMapEpic / Cesium viewer - mapInfo', (done) => {
        const state = {
            maptype: {
                mapType: 'cesium'
            },
            router: {
                location: {
                    search: "?addLayers=unesco:Unesco_point&mapInfo=unesco:Unesco_point&mapInfoFilter=cod_unesco='IT_830'"
                }
            }
        };
        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 1000),
            1, [
                onLocationChanged({}),
                changeMapView(center, zoom, bbox, size, mapStateSource, projection, viewerOptions, '')
            ], actions => {
                expect(actions.length).toBe(1);
                try {
                    expect(actions[0].type).toBe(SCHEDULE_SEARCH_LAYER_WITH_FILTER);
                    expect(actions[0].layer).toBe("unesco:Unesco_point");
                    expect(actions[0].cql_filter).toBe("cod_unesco='IT_830'");
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });
    it('Test readQueryParamsOnMapEpic / Cesium viewer - simplified featureinfo request', (done) => {
        const NUMBER_OF_ACTIONS = 1;
        const state = {
            maptype: {
                mapType: 'cesium'
            },
            router: {
                location: {
                    search: "?featureInfo=-95.625,38.72"
                }
            }
        };
        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 10),
            NUMBER_OF_ACTIONS, [
                onLocationChanged({}),
                changeMapView(center, zoom, bbox, size, mapStateSource, projection, viewerOptions, '')
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe(FEATURE_INFO_CLICK);
                    expect(actions[0].point.latlng).toEqual({lng: '-95.625', lat: '38.72'});
                    expect(actions[0].point.pixel).toBe(undefined);
                    expect(actions[0].point.geometricFilter).toExist();
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });
    it('Test readQueryParamsOnMapEpic / Cesium viewer - simplified addLayers request', (done) => {
        const NUMBER_OF_ACTIONS = 1;
        const state = {
            maptype: {
                mapType: 'cesium'
            },
            router: {
                location: {
                    search: "?addLayers=tiger:poly_landmarks;gs_stable_wms,anotherLayer&layerFilters=CFCC='H41'"
                }
            },
            catalog: {
                selectedService: 'service'
            }
        };
        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 10),
            NUMBER_OF_ACTIONS, [
                onLocationChanged({}),
                changeMapView(center, zoom, bbox, size, mapStateSource, projection, viewerOptions, '')
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe(ADD_LAYERS_FROM_CATALOGS);
                    expect(actions[0].layers[0]).toBe("tiger:poly_landmarks");
                    expect(actions[0].sources[0]).toBe("gs_stable_wms");
                    expect(actions[0].layers[1]).toBe("anotherLayer");
                    expect(actions[0].sources[1]).toBe("service");
                    expect(actions[0].options[0].params.CQL_FILTER).toBe("CFCC='H41'");
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });
    it('Test readQueryParamsOnMapEpic / Cesium viewer - add background', (done) => {
        const NUMBER_OF_ACTIONS = 2;
        const state = {
            maptype: {
                mapType: 'cesium'
            },
            router: {
                location: {
                    search: "?background=Sentinel"
                }
            },
            catalog: {
                selectedService: 'service',
                "staticServices": {
                    "default_map_backgrounds": {
                        "type": "backgrounds",
                        "title": "Default Backgrounds",
                        "titleMsgId": "defaultMapBackgroundsServiceTitle",
                        "autoload": true,
                        "backgrounds": [{
                            "type": "osm",
                            "title": "Open Street Map",
                            "name": "mapnik",
                            "source": "osm",
                            "group": "background"
                        }, {
                            "type": "tileprovider",
                            "title": "NASAGIBS Night 2012",
                            "provider": "NASAGIBS.ViirsEarthAtNight2012",
                            "name": "Night2012",
                            "source": "nasagibs",
                            "group": "background"
                        }, {
                            "type": "tileprovider",
                            "title": "OpenTopoMap",
                            "provider": "OpenTopoMap",
                            "name": "OpenTopoMap",
                            "source": "OpenTopoMap",
                            "group": "background"
                        }, {
                            "format": "image/jpeg",
                            "group": "background",
                            "name": "s2cloudless:s2cloudless",
                            "opacity": 1,
                            "title": "Sentinel 2 Cloudless",
                            "type": "wms",
                            "url": "https://1maps.geo-solutions.it/geoserver/wms",
                            "source": "s2cloudless",
                            "singleTile": false
                        }, {
                            "source": "ol",
                            "group": "background",
                            "title": "Empty Background",
                            "fixed": true,
                            "type": "empty"
                        }]
                    }
                }
            }
        };
        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 10),
            NUMBER_OF_ACTIONS, [
                onLocationChanged({}),
                changeMapView(center, zoom, bbox, size, mapStateSource, projection, viewerOptions, '')
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe(ADD_LAYERS_FROM_CATALOGS);
                    expect(actions[0].layers[0]).toBe("Sentinel");
                    expect(actions[0].sources[0]).toBe("service");
                    expect(actions[0].options[0].group).toBe("background");
                    expect(actions[0].options[0].visibility).toBe(true);
                    expect(actions[1].type).toBe(SYNC_CURRENT_BACKGROUND_LAYER);
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });
});
