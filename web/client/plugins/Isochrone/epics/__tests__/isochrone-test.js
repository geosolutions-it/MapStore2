/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { testEpic, addTimeoutEpic, TEST_TIMEOUT } from '../../../../epics/__tests__/epicTestUtils';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../../../libs/ajax';
import {
    isochroneMapLayoutEpic,
    isochroneSearchByLocationNameEpic,
    onOpenIsochroneEpic,
    isochroneSelectLocationFromMapEpic,
    isochroneUpdateLocationMapEpic,
    onIsochroneRunEpic,
    onCloseIsochroneEpic,
    isochroneAddAsLayerEpic
} from '../isochrone';
import {
    searchByLocationName,
    selectLocationFromMap,
    triggerIsochroneRun,
    addAsLayer,
    resetIsochrone,
    SEARCH_RESULTS_LOADED,
    SEARCH_LOADING,
    SET_ISOCHRONE_DATA,
    UPDATE_LOCATION,
    updateLocation
} from '../../actions/isochrone';
import { UPDATE_MAP_LAYOUT, updateMapLayout } from '../../../../actions/maplayout';
import { toggleControl, setControlProperty } from '../../../../actions/controls';
import { CONTROL_NAME, DEFAULT_SEARCH_CONFIG, ISOCHRONE_ROUTE_LAYER } from '../../constants';
import { REMOVE_ADDITIONAL_LAYER, REMOVE_ALL_ADDITIONAL_LAYERS, UPDATE_ADDITIONAL_LAYER } from '../../../../actions/additionallayers';
import { ZOOM_TO_EXTENT, ZOOM_TO_POINT } from '../../../../actions/map';
import { getMarkerLayerIdentifier } from '../../utils/IsochroneUtils';

let mockAxios;
describe('Isochrone Epics', () => {
    const mockStore = {
        getState: () => ({
            controls: {
                [CONTROL_NAME]: {
                    enabled: true
                }
            },
            isochrone: {
                searchConfig: {
                    services: DEFAULT_SEARCH_CONFIG,
                    maxResults: 15
                },
                location: [12.5, 41.9]
            },
            additionallayers: [],
            layers: {
                flat: []
            }
        })
    };

    const mockStoreDisabled = {
        getState: () => ({
            controls: {
                [CONTROL_NAME]: {
                    enabled: false
                }
            }
        })
    };

    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });

    describe('isochroneMapLayoutEpic', () => {
        it('should update map layout when isochrone is enabled and source is not isochrone', (done) => {
            const layout = {
                right: 300,
                boundingSidebarRect: { right: 200 },
                boundingMapRect: { left: 0, top: 0 }
            };

            testEpic(
                addTimeoutEpic(isochroneMapLayoutEpic, 10),
                1,
                updateMapLayout(layout),
                actions => {
                    expect(actions[0].type).toBe(UPDATE_MAP_LAYOUT);
                    expect(actions[0].source).toBe(CONTROL_NAME);
                    expect(actions[0].layout.right).toBe(620);
                    expect(actions[0].layout.rightPanel).toBe(true);
                    expect(actions[0].layout.boundingMapRect.right).toBe(620);
                    expect(actions[0].layout.boundingSidebarRect.right).toBe(200);
                    done();
                },
                mockStore.getState()
            );
        });

        it('should not update map layout when isochrone is disabled', (done) => {
            const NUMBER_OF_ACTIONS = 1;
            const layout = { right: 300 };

            testEpic(
                addTimeoutEpic(isochroneMapLayoutEpic, 10),
                NUMBER_OF_ACTIONS,
                updateMapLayout(layout),
                actions => {
                    expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                    expect(actions[0].type).toBe(TEST_TIMEOUT);
                    done();
                },
                mockStoreDisabled.getState()
            );
        });

        it('should not update map layout when source is isochrone', (done) => {
            const NUMBER_OF_ACTIONS = 1;
            const layout = { right: 300 };

            testEpic(
                addTimeoutEpic(isochroneMapLayoutEpic, 10),
                NUMBER_OF_ACTIONS,
                { ...updateMapLayout(layout), source: CONTROL_NAME },
                actions => {
                    expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                    expect(actions[0].type).toBe(TEST_TIMEOUT);
                    done();
                },
                mockStore.getState()
            );
        });
    });

    describe('isochroneSearchByLocationNameEpic', () => {
        it('should handle empty location name with debouncing', (done) => {
            const action = searchByLocationName('');

            testEpic(isochroneSearchByLocationNameEpic, 1, action, (actions) => {
                expect(actions[0].type).toBe(SEARCH_RESULTS_LOADED);
                expect(actions[0].results).toEqual([]);
                done();
            }, {});
        });

        it('should handle whitespace location name with debouncing', (done) => {
            const action = searchByLocationName('');

            testEpic(isochroneSearchByLocationNameEpic, 1, action, (actions) => {
                expect(actions[0].type).toBe(SEARCH_RESULTS_LOADED);
                expect(actions[0].results).toEqual([]);
                done();
            }, {});
        });

        it('should handle valid location name with debouncing', (done) => {
            const action = searchByLocationName('Paris');
            mockAxios.onGet().reply(200, [{
                osm_id: 62422,
                lat: "52.5108850",
                lon: "13.3989367",
                display_name: "Berlin, Germany",
                boundingbox: [
                    "52.3382448",
                    "52.6755087",
                    "13.0883450",
                    "13.7611609"
                ],
                geojson: {}
            }]);
            testEpic(isochroneSearchByLocationNameEpic, 3, action, (actions) => {
                expect(actions[0].type).toBe(SEARCH_LOADING);
                expect(actions[0].loading).toBe(true);
                expect(actions[1].type).toBe(SEARCH_RESULTS_LOADED);
                expect(Array.isArray(actions[1].results)).toBe(true);
                expect(actions[2].type).toBe(SEARCH_LOADING);
                expect(actions[2].loading).toBe(false);
                done();
            }, {});
        });

        it('should handle non-string location name', (done) => {
            const action = searchByLocationName(123);

            testEpic(isochroneSearchByLocationNameEpic, 0, action, (actions) => {
                expect(actions.length).toBe(0);
            }, {}, done);
        });

        it('should handle null location name', (done) => {
            const action = searchByLocationName(null);

            testEpic(isochroneSearchByLocationNameEpic, 0, action, (actions) => {
                expect(actions.length).toBe(0);
            }, {}, done);
        });

        it('should handle undefined location name', (done) => {
            const action = searchByLocationName(undefined);

            testEpic(isochroneSearchByLocationNameEpic, 0, action, (actions) => {
                expect(actions.length).toBe(0);
            }, {}, done);
        });
        it('should add marker feature', (done) => {
            const action = searchByLocationName({ original: {properties: {lat: 10, lon: 10}} });

            testEpic(isochroneSearchByLocationNameEpic, 1, action, (actions) => {
                expect(actions[0].type).toBe(UPDATE_ADDITIONAL_LAYER);
                expect(actions[0].id).toBe(ISOCHRONE_ROUTE_LAYER + `_marker_temp`);
                expect(actions[0].owner).toBe(CONTROL_NAME + '_marker');
                expect(actions[0].actionType).toBe('overlay');
                expect(actions[0].options.type).toEqual("vector");
            }, {}, done);
        });
    });

    describe('onOpenIsochroneEpic', () => {
        it('should purge map info results when isochrone control is toggled', (done) => {
            const NUMBER_OF_ACTIONS = 2;

            testEpic(
                addTimeoutEpic(onOpenIsochroneEpic, 10),
                NUMBER_OF_ACTIONS,
                toggleControl(CONTROL_NAME),
                actions => {
                    expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                    expect(actions[0].type).toBe('PURGE_MAPINFO_RESULTS');
                    expect(actions[1].type).toBe('CHANGE_MAPINFO_STATE');
                    expect(actions[1].enabled).toBe(false);
                    done();
                },
                mockStore.getState()
            );
        });

        it('should not trigger when different control is toggled', (done) => {
            const NUMBER_OF_ACTIONS = 1;

            testEpic(
                addTimeoutEpic(onOpenIsochroneEpic, 10),
                NUMBER_OF_ACTIONS,
                toggleControl('otherControl'),
                actions => {
                    expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                    expect(actions[0].type).toBe(TEST_TIMEOUT);
                    done();
                },
                mockStore.getState()
            );
        });

        it('should not trigger when isochrone is disabled', (done) => {
            const NUMBER_OF_ACTIONS = 1;

            testEpic(
                addTimeoutEpic(onOpenIsochroneEpic, 10),
                NUMBER_OF_ACTIONS,
                toggleControl(CONTROL_NAME),
                actions => {
                    expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                    expect(actions[0].type).toBe(TEST_TIMEOUT);
                    done();
                },
                mockStoreDisabled.getState()
            );
        });
    });

    describe('isochroneSelectLocationFromMapEpic', () => {
        it('should handle map click and update location', (done) => {

            testEpic(
                addTimeoutEpic(isochroneSelectLocationFromMapEpic, 10),
                1,
                selectLocationFromMap(),
                actions => {
                    expect(actions[0].type).toBe('CHANGE_MOUSE_POINTER');
                    expect(actions[0].pointer).toBe('pointer');
                    done();
                },
                mockStore.getState()
            );
        });
    });

    describe('onIsochroneRunEpic', () => {
        it('should handle isochrone run with valid data', (done) => {
            const NUMBER_OF_ACTIONS = 4;
            const isochroneData = {
                bbox: [12.0, 41.0, 13.0, 42.0],
                layer: {
                    type: 'vector',
                    features: [{ type: 'Feature', geometry: { type: 'Polygon' } }]
                },
                data: { isochrones: [] }
            };
            testEpic(
                onIsochroneRunEpic,
                NUMBER_OF_ACTIONS,
                triggerIsochroneRun(isochroneData),
                actions => {
                    expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                    expect(actions[0].type).toBe(REMOVE_ADDITIONAL_LAYER);
                    expect(actions[0].id).toBe(ISOCHRONE_ROUTE_LAYER + `_marker_temp`);
                    expect(actions[1].type).toBe(UPDATE_ADDITIONAL_LAYER);
                    expect(actions[1].id).toContain(ISOCHRONE_ROUTE_LAYER + `_run`);
                    expect(actions[1].owner).toBe(CONTROL_NAME + '_run');
                    expect(actions[2].type).toBe(ZOOM_TO_EXTENT);
                    expect(actions[2].extent).toEqual([12, 41, 13, 42]);
                    expect(actions[3].type).toBe(SET_ISOCHRONE_DATA);
                    expect(actions[3].data).toBeTruthy();
                    expect(actions[3].data.isochrones).toBeTruthy();
                    expect(actions[3].data.id).toBeTruthy();
                    done();
                },
                mockStore.getState()
            );
        });

        it('should handle isochrone run with existing marker layer', (done) => {
            const NUMBER_OF_ACTIONS = 4;
            const isochroneData = {
                bbox: [12.0, 41.0, 13.0, 42.0],
                layer: { type: 'vector', features: [] },
                data: { isochrones: [] }
            };
            const storeWithMarker = {
                getState: () => ({
                    ...mockStore.getState(),
                    additionallayers: [{
                        id: getMarkerLayerIdentifier(1),
                        options: { type: 'vector' }
                    }]
                })
            };
            testEpic(
                onIsochroneRunEpic,
                NUMBER_OF_ACTIONS,
                triggerIsochroneRun(isochroneData),
                actions => {
                    expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                    expect(actions[0].type).toBe(REMOVE_ADDITIONAL_LAYER);
                    expect(actions[0].id).toContain(ISOCHRONE_ROUTE_LAYER + `_marker_temp`);
                    expect(actions[1].type).toBe(UPDATE_ADDITIONAL_LAYER);
                    expect(actions[1].id).toContain(ISOCHRONE_ROUTE_LAYER + `_run`);
                    expect(actions[1].owner).toBe(CONTROL_NAME + '_run');
                    expect(actions[2].type).toBe(ZOOM_TO_EXTENT);
                    expect(actions[3].type).toBe(SET_ISOCHRONE_DATA);
                    done();
                },
                storeWithMarker.getState()
            );
        });
    });

    describe('onCloseIsochroneEpic', () => {
        it('should reset isochrone when control is disabled', (done) => {
            const NUMBER_OF_ACTIONS = 3;
            const index = 0;
            const storeWithLayers = {
                getState: () => ({
                    ...mockStore.getState(),
                    additionallayers: [
                        { owner: CONTROL_NAME + '_run_' + index },
                        { owner: CONTROL_NAME + '_marker_' + index }
                    ]
                })
            };

            testEpic(
                onCloseIsochroneEpic,
                NUMBER_OF_ACTIONS,
                setControlProperty(CONTROL_NAME, 'enabled', false),
                actions => {
                    expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                    expect(actions[0].type).toBe(SET_ISOCHRONE_DATA);
                    expect(actions[0].data).toBe(null);
                    expect(actions[1].type).toBe(UPDATE_LOCATION);
                    expect(actions[1].location).toBe(null);
                    expect(actions[2].type).toBe(REMOVE_ALL_ADDITIONAL_LAYERS);
                    expect(actions[2].owner).toBe(CONTROL_NAME + '_run_' + index);
                    done();
                },
                storeWithLayers.getState()
            );
        });

        it('should reset isochrone when reset action is dispatched', (done) => {
            const NUMBER_OF_ACTIONS = 2;

            testEpic(
                onCloseIsochroneEpic,
                NUMBER_OF_ACTIONS,
                resetIsochrone(),
                actions => {
                    expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                    expect(actions[0].type).toBe(SET_ISOCHRONE_DATA);
                    expect(actions[0].data).toBe(null);
                    expect(actions[1].type).toBe(UPDATE_LOCATION);
                    expect(actions[1].location).toBe(null);
                    done();
                },
                mockStore.getState()
            );
        });

        it('should not trigger when control is enabled', (done) => {
            const NUMBER_OF_ACTIONS = 1;

            testEpic(
                addTimeoutEpic(onCloseIsochroneEpic, 10),
                NUMBER_OF_ACTIONS,
                setControlProperty(CONTROL_NAME, 'enabled', true),
                actions => {
                    expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                    expect(actions[0].type).toBe(TEST_TIMEOUT);
                    done();
                },
                mockStore.getState()
            );
        });
    });

    describe('isochroneAddAsLayerEpic', () => {
        it('should add route as layer with valid features', (done) => {
            const NUMBER_OF_ACTIONS = 3;
            const features = [
                {
                    type: 'Feature',
                    geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] }
                }
            ];
            const style = { color: 'blue' };

            const storeWithDrawerClosed = {
                getState: () => ({
                    ...mockStore.getState(),
                    controls: {
                        drawer: { enabled: false }
                    }
                })
            };

            testEpic(
                addTimeoutEpic(isochroneAddAsLayerEpic, 50),
                NUMBER_OF_ACTIONS,
                addAsLayer({ features, style }),
                actions => {
                    expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                    expect(actions[0].type).toBe('ADD_LAYER');
                    expect(actions[0].layer.type).toBe('vector');
                    expect(actions[0].layer.features).toEqual(features);
                    expect(actions[0].layer.style).toEqual(style);
                    expect(actions[0].layer.bbox.crs).toBe('EPSG:4326');
                    expect(actions[1].type).toBe('SHOW_NOTIFICATION');
                    expect(actions[1].title).toBe('isochrone.title');
                    expect(actions[2].type).toBe('SET_CONTROL_PROPERTY');
                    expect(actions[2].control).toBe('drawer');
                    expect(actions[2].property).toBe('enabled');
                    expect(actions[2].value).toBe(true);
                    done();
                },
                storeWithDrawerClosed.getState()
            );
        });

        it('should add route as layer without opening drawer when drawer is already open', (done) => {
            const NUMBER_OF_ACTIONS = 2;
            const features = [
                {
                    type: 'Feature',
                    geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] }
                }
            ];

            const storeWithDrawerOpen = {
                getState: () => ({
                    ...mockStore.getState(),
                    controls: {
                        drawer: { enabled: true }
                    }
                })
            };

            testEpic(
                addTimeoutEpic(isochroneAddAsLayerEpic, 50),
                NUMBER_OF_ACTIONS,
                addAsLayer({ features }),
                actions => {
                    expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                    expect(actions[0].type).toBe('ADD_LAYER');
                    expect(actions[1].type).toBe('SHOW_NOTIFICATION');
                    done();
                },
                storeWithDrawerOpen.getState()
            );
        });

        it('should handle empty features array', (done) => {
            const NUMBER_OF_ACTIONS = 2;
            const features = [];

            testEpic(
                addTimeoutEpic(isochroneAddAsLayerEpic, 50),
                NUMBER_OF_ACTIONS,
                addAsLayer({ features }),
                actions => {
                    expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                    expect(actions[0].type).toBe('ADD_LAYER');
                    expect(actions[0].layer.features).toEqual([]);
                    expect(actions[1].type).toBe('SHOW_NOTIFICATION');
                    done();
                },
                mockStore.getState()
            );
        });
    });

    describe('isochroneUpdateLocationMapEpic', () => {
        it('should update location map with valid location', (done) => {
            const NUMBER_OF_ACTIONS = 3;
            const location = [12.345, 67.890];

            testEpic(
                isochroneUpdateLocationMapEpic,
                NUMBER_OF_ACTIONS,
                updateLocation(location),
                actions => {
                    expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                    expect(actions[0].type).toBe(REMOVE_ADDITIONAL_LAYER);
                    expect(actions[0].id).toBe(getMarkerLayerIdentifier("temp"));
                    expect(actions[1].type).toBe(UPDATE_ADDITIONAL_LAYER);
                    expect(actions[1].id).toBe(getMarkerLayerIdentifier("temp"));
                    expect(actions[1].owner).toBe(CONTROL_NAME + '_marker');
                    expect(actions[2].type).toBe(ZOOM_TO_POINT);
                    expect(actions[2].pos).toEqual(location);
                    expect(actions[2].zoom).toBe(12);
                    expect(actions[2].crs).toBe("EPSG:4326");
                    done();
                },
                mockStore.getState()
            );
        });

        it('should not trigger actions with empty location', (done) => {
            const NUMBER_OF_ACTIONS = 1;
            const location = null;

            testEpic(
                addTimeoutEpic(isochroneUpdateLocationMapEpic, 50),
                NUMBER_OF_ACTIONS,
                updateLocation(location),
                actions => {
                    expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                    done();
                },
                mockStore.getState()
            );
        });

        it('should not trigger actions with undefined location', (done) => {
            const NUMBER_OF_ACTIONS = 1;

            testEpic(
                addTimeoutEpic(isochroneUpdateLocationMapEpic, 50),
                NUMBER_OF_ACTIONS,
                updateLocation(undefined),
                actions => {
                    expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                    done();
                },
                mockStore.getState()
            );
        });
    });
});
