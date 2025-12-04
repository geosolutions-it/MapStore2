/**
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../../../libs/ajax';
import { testEpic, addTimeoutEpic, TEST_TIMEOUT } from '../../../../epics/__tests__/epicTestUtils';
import {
    itinerarySearchByLocationNameEpic,
    itineraryMapLayoutEpic,
    onOpenItineraryEpic,
    itinerarySelectLocationFromMapEpic,
    onItineraryRunEpic,
    onCloseItineraryEpic,
    onToggleControlItineraryEpic,
    itineraryAddRouteAsLayerEpic,
    itineraryUpdateLocationEpic,
    onItineraryErrorEpic
} from '../itinerary';
import {
    SEARCH_BY_LOCATION_NAME,
    SEARCH_LOADING,
    SEARCH_RESULTS_LOADED,
    SELECT_LOCATION_FROM_MAP,
    TRIGGER_ITINERARY_RUN,
    ADD_AS_LAYER,
    RESET_ITINERARY,
    SET_ITINERARY_DATA,
    UPDATE_LOCATIONS,
    SET_ITINERARY_ERROR
} from '../../actions/itinerary';
import {
    UPDATE_MAP_LAYOUT
} from '../../../../actions/maplayout';
import {
    TOGGLE_CONTROL,
    SET_CONTROL_PROPERTY,
    toggleControl
} from '../../../../actions/controls';
import { CONTROL_NAME, ITINERARY_ROUTE_LAYER } from '../../constants';
import { ADD_LAYER } from '../../../../actions/layers';
import { REMOVE_ADDITIONAL_LAYER, REMOVE_ALL_ADDITIONAL_LAYERS, UPDATE_ADDITIONAL_LAYER } from '../../../../actions/additionallayers';
import { CHANGE_MOUSE_POINTER, ZOOM_TO_EXTENT } from '../../../../actions/map';
import { CHANGE_MAPINFO_STATE, PURGE_MAPINFO_RESULTS } from '../../../../actions/mapInfo';
import { SHOW_NOTIFICATION } from '../../../../actions/notifications';

let mockAxios;
describe('Itinerary Epics', () => {
    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });
    describe('itinerarySearchByLocationNameEpic', () => {
        it('should handle empty location name with debouncing', (done) => {
            const action = { type: SEARCH_BY_LOCATION_NAME, location: '', index: 0 };

            testEpic(itinerarySearchByLocationNameEpic, 1, action, (actions) => {
                expect(actions[0].type).toBe(SEARCH_RESULTS_LOADED);
                expect(actions[0].results).toEqual([]);
                done();
            }, {});
        });

        it('should handle whitespace location name with debouncing', (done) => {
            const action = { type: SEARCH_BY_LOCATION_NAME, location: '   ', index: 1 };

            testEpic(itinerarySearchByLocationNameEpic, 1, action, (actions) => {
                expect(actions[0].type).toBe(SEARCH_RESULTS_LOADED);
                expect(actions[0].results).toEqual([]);
                done();
            }, {});
        });

        it('should handle valid location name with debouncing', (done) => {
            const action = { type: SEARCH_BY_LOCATION_NAME, location: 'Paris', index: 2 };
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
            testEpic(itinerarySearchByLocationNameEpic, 3, action, (actions) => {
                expect(actions[0].type).toBe(SEARCH_LOADING);
                expect(actions[0].loading).toBe(true);
                expect(actions[0].index).toBe(2);
                expect(actions[1].type).toBe(SEARCH_RESULTS_LOADED);
                expect(Array.isArray(actions[1].results)).toBe(true);
                expect(actions[2].type).toBe(SEARCH_LOADING);
                expect(actions[2].loading).toBe(false);
                expect(actions[2].index).toBe(2);
                done();
            }, {});
        });

        it('should handle non-string location name', (done) => {
            const action = { type: SEARCH_BY_LOCATION_NAME, location: 123, index: 0 };

            testEpic(itinerarySearchByLocationNameEpic, 0, action, (actions) => {
                expect(actions.length).toBe(0);
            }, {}, done);
        });

        it('should handle null location name', (done) => {
            const action = { type: SEARCH_BY_LOCATION_NAME, location: null, index: 0 };

            testEpic(itinerarySearchByLocationNameEpic, 0, action, (actions) => {
                expect(actions.length).toBe(0);
            }, {}, done);
        });

        it('should handle undefined location name', (done) => {
            const action = { type: SEARCH_BY_LOCATION_NAME, location: undefined, index: 0 };

            testEpic(itinerarySearchByLocationNameEpic, 0, action, (actions) => {
                expect(actions.length).toBe(0);
            }, {}, done);
        });
        it('should add marker feature', (done) => {
            const action = { type: SEARCH_BY_LOCATION_NAME, location: { original: {properties: {lat: 10, lon: 10}} }, index: 0 };

            testEpic(itinerarySearchByLocationNameEpic, 1, action, (actions) => {
                expect(actions[0].type).toBe(UPDATE_ADDITIONAL_LAYER);
                expect(actions[0].id).toBe(ITINERARY_ROUTE_LAYER + `_waypoint_marker_${0}`);
                expect(actions[0].owner).toBe(CONTROL_NAME + '_waypoint_marker');
                expect(actions[0].actionType).toBe('overlay');
                expect(actions[0].options.type).toEqual("vector");
            }, {}, done);
        });
    });

    describe('itineraryMapLayoutEpic', () => {
        it('should update map layout when itinerary is enabled', (done) => {
            const action = {
                type: UPDATE_MAP_LAYOUT,
                layout: {
                    right: 300,
                    boundingSidebarRect: { right: 50 },
                    boundingMapRect: { right: 300 }
                }
            };

            const state = {
                controls: {
                    [CONTROL_NAME]: {
                        enabled: true
                    }
                }
            };

            testEpic(itineraryMapLayoutEpic, 1, action, (actions) => {
                expect(actions[0].type).toBe(UPDATE_MAP_LAYOUT);
                expect(actions[0].source).toBe(CONTROL_NAME);
                expect(actions[0].layout.right).toBe(470);
                expect(actions[0].layout.rightPanel).toBe(true);
            }, state, done);
        });

        it('should not update map layout when itinerary is disabled', (done) => {
            const action = {
                type: UPDATE_MAP_LAYOUT,
                layout: { right: 300 }
            };

            const state = {
                controls: {
                    [CONTROL_NAME]: {
                        enabled: false
                    }
                }
            };

            testEpic(itineraryMapLayoutEpic, 0, action, (actions) => {
                expect(actions.length).toBe(0);
            }, state, done);
        });

        it('should not update map layout when source is itinerary', (done) => {
            const action = {
                type: UPDATE_MAP_LAYOUT,
                source: CONTROL_NAME,
                layout: { right: 300 }
            };

            const state = {
                controls: {
                    [CONTROL_NAME]: {
                        enabled: true
                    }
                }
            };

            testEpic(itineraryMapLayoutEpic, 0, action, (actions) => {
                expect(actions.length).toBe(0);
            }, state, done);
        });

        it('should handle layout without boundingSidebarRect', (done) => {
            const action = {
                type: UPDATE_MAP_LAYOUT,
                layout: {
                    right: 300,
                    boundingMapRect: { right: 300 }
                }
            };

            const state = {
                controls: {
                    [CONTROL_NAME]: {
                        enabled: true
                    }
                }
            };

            testEpic(itineraryMapLayoutEpic, 1, action, (actions) => {
                expect(actions[0].type).toBe(UPDATE_MAP_LAYOUT);
                expect(actions[0].layout.right).toBe(420);
            }, state, done);
        });

        it('should handle layout without boundingMapRect', (done) => {
            const action = {
                type: UPDATE_MAP_LAYOUT,
                layout: {
                    right: 300,
                    boundingSidebarRect: { right: 50 }
                }
            };

            const state = {
                controls: {
                    [CONTROL_NAME]: {
                        enabled: true
                    }
                }
            };

            testEpic(itineraryMapLayoutEpic, 1, action, (actions) => {
                expect(actions[0].type).toBe(UPDATE_MAP_LAYOUT);
                expect(actions[0].layout.boundingMapRect).toBeTruthy();
            }, state, done);
        });
    });

    describe('onOpenItineraryEpic', () => {
        it('should purge map info and change map info state when itinerary is opened', (done) => {
            const action = { type: TOGGLE_CONTROL, control: CONTROL_NAME };

            const state = {
                controls: {
                    [CONTROL_NAME]: {
                        enabled: true
                    }
                }
            };

            testEpic(onOpenItineraryEpic, 2, action, (actions) => {
                expect(actions[0].type).toBe(PURGE_MAPINFO_RESULTS);
                expect(actions[1].type).toBe(CHANGE_MAPINFO_STATE);
                expect(actions[1].enabled).toBe(false);
            }, state, done);
        });

        it('should not trigger when control is not itinerary', (done) => {
            const action = { type: TOGGLE_CONTROL, control: 'other' };

            const state = {
                controls: {
                    [CONTROL_NAME]: {
                        enabled: true
                    }
                }
            };

            testEpic(onOpenItineraryEpic, 0, action, (actions) => {
                expect(actions.length).toBe(0);
            }, state, done);
        });

        it('should not trigger when itinerary is disabled', (done) => {
            const action = { type: TOGGLE_CONTROL, control: CONTROL_NAME };

            const state = {
                controls: {
                    [CONTROL_NAME]: {
                        enabled: false
                    }
                }
            };

            testEpic(onOpenItineraryEpic, 0, action, (actions) => {
                expect(actions.length).toBe(0);
            }, state, done);
        });
    });

    describe('itinerarySelectLocationFromMapEpic', () => {
        it('should change mouse pointer and wait for map click', (done) => {
            const action = { type: SELECT_LOCATION_FROM_MAP, index: 0 };

            const state = {
                itinerary: {
                    locations: [[2.3522, 48.8566], [4.8320, 45.7578]]
                }
            };

            testEpic(itinerarySelectLocationFromMapEpic, 1, action, (actions) => {
                expect(actions[0].type).toBe(CHANGE_MOUSE_POINTER);
                expect(actions[0].pointer).toBe('pointer');
            }, state, done);
        });

        it('should handle map click and update location', (done) => {
            const action = { type: SELECT_LOCATION_FROM_MAP, index: 1 };

            const state = {
                itinerary: {
                    locations: [[2.3522, 48.8566], [4.8320, 45.7578]]
                }
            };

            testEpic(itinerarySelectLocationFromMapEpic, 1, action, (actions) => {
                expect(actions[0].type).toBe(CHANGE_MOUSE_POINTER);
                expect(actions[0].pointer).toBe('pointer');
            }, state, done);
        });

        it('should handle missing point data gracefully', (done) => {
            const action = { type: SELECT_LOCATION_FROM_MAP, index: 0 };

            const state = {
                itinerary: {
                    locations: [[2.3522, 48.8566]]
                }
            };

            testEpic(itinerarySelectLocationFromMapEpic, 1, action, (actions) => {
                expect(actions[0].type).toBe(CHANGE_MOUSE_POINTER);
                expect(actions[0].pointer).toBe('pointer');
            }, state, done);
        });
    });

    describe('onItineraryRunEpic', () => {
        it('should handle itinerary run with valid data', (done) => {
            const action = {
                type: TRIGGER_ITINERARY_RUN,
                itinerary: {
                    bbox: [2.3522, 45.7578, 4.8320, 48.8566],
                    layer: { type: 'vector', features: [] },
                    data: {}
                }
            };

            testEpic(onItineraryRunEpic, 5, action, (actions) => {
                expect(actions[0].type).toBe(SET_ITINERARY_DATA);
                expect(actions[0].data).toBe(null);
                expect(actions[1].type).toBe(REMOVE_ALL_ADDITIONAL_LAYERS);
                expect(actions[1].owner).toBe(CONTROL_NAME + '_waypoint_marker');
                expect(actions[2].type).toBe(UPDATE_ADDITIONAL_LAYER);
                expect(actions[2].id).toBe(ITINERARY_ROUTE_LAYER);
                expect(actions[2].owner).toBe(CONTROL_NAME);
                expect(actions[3].type).toBe(ZOOM_TO_EXTENT);
                expect(actions[3].extent).toEqual([2.3522, 45.7578, 4.8320, 48.8566]);
                expect(actions[4].type).toBe(SET_ITINERARY_DATA);
                expect(actions[4].data).toEqual(action.itinerary.data);
            }, {}, done);
        });

        it('should handle itinerary run with missing data', (done) => {
            const action = { type: TRIGGER_ITINERARY_RUN };

            testEpic(onItineraryRunEpic, 5, action, (actions) => {
                expect(actions[0].type).toBe(SET_ITINERARY_DATA);
                expect(actions[1].type).toBe(REMOVE_ALL_ADDITIONAL_LAYERS);
                expect(actions[2].type).toBe(UPDATE_ADDITIONAL_LAYER);
                expect(actions[3].type).toBe(ZOOM_TO_EXTENT);
                expect(actions[4].type).toBe(SET_ITINERARY_DATA);
            }, {}, done);
        });

        it('should handle itinerary run with null itinerary', (done) => {
            const action = { type: TRIGGER_ITINERARY_RUN, itinerary: null };

            testEpic(onItineraryRunEpic, 5, action, (actions) => {
                expect(actions[0].type).toBe(SET_ITINERARY_DATA);
                expect(actions[1].type).toBe(REMOVE_ALL_ADDITIONAL_LAYERS);
                expect(actions[2].type).toBe(UPDATE_ADDITIONAL_LAYER);
                expect(actions[3].type).toBe(ZOOM_TO_EXTENT);
                expect(actions[4].type).toBe(SET_ITINERARY_DATA);
            }, {}, done);
        });
    });

    describe('onCloseItineraryEpic', () => {
        it('should close itinerary when control property is set to false', (done) => {
            const action = {
                type: SET_CONTROL_PROPERTY,
                control: CONTROL_NAME,
                value: false
            };

            const state = {
                controls: {
                    [CONTROL_NAME]: {
                        enabled: true
                    }
                }
            };

            testEpic(onCloseItineraryEpic, 5, action, (actions) => {
                expect(actions[0].type).toBe(SET_ITINERARY_DATA);
                expect(actions[0].data).toBeFalsy();
                expect(actions[1].type).toBe(REMOVE_ADDITIONAL_LAYER);
                expect(actions[1].id).toBe(ITINERARY_ROUTE_LAYER);
                expect(actions[1].owner).toBe(CONTROL_NAME);
                expect(actions[2].type).toBe(REMOVE_ALL_ADDITIONAL_LAYERS);
                expect(actions[2].owner).toBe(CONTROL_NAME + '_waypoint_marker');
                expect(actions[3].type).toBe(CHANGE_MAPINFO_STATE);
                expect(actions[3].enabled).toBe(true);
                expect(actions[4].type).toBe(UPDATE_LOCATIONS);
                expect(actions[4].locations).toEqual([]);
                done();
            }, state, done);
        });

        it('should close itinerary when RESET_ITINERARY is dispatched', (done) => {
            const action = { type: RESET_ITINERARY };

            testEpic(onCloseItineraryEpic, 4, action, (actions) => {
                expect(actions[0].type).toBe(SET_ITINERARY_DATA);
                expect(actions[0].data).toBeFalsy();
                expect(actions[1].type).toBe(REMOVE_ADDITIONAL_LAYER);
                expect(actions[1].id).toBe(ITINERARY_ROUTE_LAYER);
                expect(actions[1].owner).toBe(CONTROL_NAME);
                expect(actions[2].type).toBe(REMOVE_ALL_ADDITIONAL_LAYERS);
                expect(actions[2].owner).toBe(CONTROL_NAME + '_waypoint_marker');
                expect(actions[3].type).toBe(UPDATE_LOCATIONS);
                expect(actions[3].locations).toEqual([]);
            }, {}, done);
        });

        it('test when UPDATE_LOCATIONS is dispatched', (done) => {
            const action = { type: UPDATE_LOCATIONS, locations: [[2.3522, 48.8566], [4.8320, 45.7578]] };

            testEpic(onCloseItineraryEpic, 5, action, (actions) => {
                expect(actions[0].type).toBe(SET_ITINERARY_DATA);
                expect(actions[0].data).toBeFalsy();
                expect(actions[1].type).toBe(REMOVE_ADDITIONAL_LAYER);
                expect(actions[1].id).toBe(ITINERARY_ROUTE_LAYER);
                expect(actions[1].owner).toBe(CONTROL_NAME);
                expect(actions[2].type).toBe(REMOVE_ALL_ADDITIONAL_LAYERS);
                expect(actions[2].owner).toBe(CONTROL_NAME + '_waypoint_marker');
                expect(actions[3].type).toBe(UPDATE_ADDITIONAL_LAYER);
                expect(actions[3].id).toEqual(ITINERARY_ROUTE_LAYER + '_waypoint_marker_0');
                expect(actions[4].type).toBe(UPDATE_ADDITIONAL_LAYER);
                expect(actions[4].id).toEqual(ITINERARY_ROUTE_LAYER + '_waypoint_marker_1');
            }, {}, done);
        });
        it('test when SET_ITINERARY_ERROR is dispatched', (done) => {
            const action = { type: SET_ITINERARY_ERROR, error: { message: 'test error' } };

            testEpic(onCloseItineraryEpic, 3, action, (actions) => {
                expect(actions[0].type).toBe(SET_ITINERARY_DATA);
                expect(actions[0].data).toBeFalsy();
                expect(actions[1].type).toBe(REMOVE_ADDITIONAL_LAYER);
                expect(actions[1].id).toBe(ITINERARY_ROUTE_LAYER);
                expect(actions[1].owner).toBe(CONTROL_NAME);
                expect(actions[2].type).toBe(REMOVE_ALL_ADDITIONAL_LAYERS);
                expect(actions[2].owner).toBe(CONTROL_NAME + '_waypoint_marker');
            }, {}, done);
        });

        it('should not close itinerary when control is not itinerary', (done) => {
            const action = {
                type: SET_CONTROL_PROPERTY,
                control: 'other',
                value: false
            };

            testEpic(onCloseItineraryEpic, 0, action, (actions) => {
                expect(actions.length).toBe(0);
            }, {}, done);
        });

        it('should not close itinerary when control property is true', (done) => {
            const action = {
                type: SET_CONTROL_PROPERTY,
                control: CONTROL_NAME,
                value: true
            };

            testEpic(onCloseItineraryEpic, 0, action, (actions) => {
                expect(actions.length).toBe(0);
            }, {}, done);
        });
    });

    describe('itineraryAddRouteAsLayerEpic', () => {
        it('should add route as layer with valid features', (done) => {
            const action = {
                type: ADD_AS_LAYER,
                features: [
                    {
                        type: 'Feature',
                        geometry: {
                            type: 'LineString',
                            coordinates: [[2.3522, 48.8566], [4.8320, 45.7578]]
                        },
                        properties: { name: 'Route 1' }
                    }
                ]
            };

            testEpic(itineraryAddRouteAsLayerEpic, 2, action, (actions) => {
                expect(actions[0].type).toBe(ADD_LAYER);
                expect(actions[0].layer.type).toBe('vector');
                expect(actions[0].layer.name).toBe(ITINERARY_ROUTE_LAYER);
                expect(actions[0].layer.title).toBe(CONTROL_NAME);
                expect(actions[0].layer.hideLoading).toBe(true);
                expect(actions[0].layer.visibility).toBe(true);
                expect(actions[0].layer.features).toEqual(action.features);
                expect(actions[0].layer.bbox.crs).toBe('EPSG:4326');
                expect(actions[0].layer.bbox.bounds).toBeTruthy();
                expect(actions[1].type).toBe(SHOW_NOTIFICATION);
                expect(actions[1].level).toBe('info');
            }, {}, done);
        });

        it('should add route as layer with empty features', (done) => {
            const action = {
                type: ADD_AS_LAYER,
                features: []
            };

            testEpic(itineraryAddRouteAsLayerEpic, 1, action, (actions) => {
                expect(actions[0].type).toBe(ADD_LAYER);
                expect(actions[0].layer.features).toEqual([]);
            }, {}, done);
        });

        it('should handle features with missing properties', (done) => {
            const action = {
                type: ADD_AS_LAYER,
                features: [
                    {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [2.3522, 48.8566]
                        }
                    }
                ]
            };

            testEpic(itineraryAddRouteAsLayerEpic, 1, action, (actions) => {
                expect(actions[0].type).toBe(ADD_LAYER);
                expect(actions[0].layer.features).toEqual(action.features);
            }, {}, done);
        });

        it('should generate unique layer ID', (done) => {
            const action = {
                type: ADD_AS_LAYER,
                features: []
            };

            testEpic(itineraryAddRouteAsLayerEpic, 1, action, (actions) => {
                expect(actions[0].type).toBe(ADD_LAYER);
                expect(actions[0].layer.id).toBeTruthy();
                expect(typeof actions[0].layer.id).toBe('string');
            }, {}, done);
        });

        it('should handle bbox calculation failure gracefully', (done) => {
            const action = {
                type: ADD_AS_LAYER,
                features: []
            };

            testEpic(itineraryAddRouteAsLayerEpic, 1, action, (actions) => {
                expect(actions[0].type).toBe(ADD_LAYER);
                expect(actions[0].layer.bbox.bounds).toEqual({
                    minx: Infinity, miny: Infinity, maxx: -Infinity, maxy: -Infinity });
            }, {}, done);
        });
    });

    describe('itineraryUpdateLocationEpic', () => {
        it('should handle single location update', (done) => {
            const action = {
                type: UPDATE_LOCATIONS,
                locations: [[2.3522, 48.8566]]
            };

            testEpic(itineraryUpdateLocationEpic, 1, action, (actions) => {
                expect(actions[0].type).toBe(UPDATE_ADDITIONAL_LAYER);
                expect(actions[0].options.features.length).toBe(1);
                expect(actions[0].options.features[0].geometry.coordinates).toEqual([2.3522, 48.8566]);
            }, {}, done);
        });

        it('should handle multiple locations update', (done) => {
            const action = {
                type: UPDATE_LOCATIONS,
                locations: [
                    [2.3522, 48.8566],
                    [4.8320, 45.7578],
                    [3.0000, 47.0000]
                ]
            };

            testEpic(itineraryUpdateLocationEpic, 4, action, (actions) => {
                expect(actions.length).toBe(4);

                // Check marker features
                actions.forEach((_action, index) => {
                    if (index < 3) {
                        expect(_action.type).toBe(UPDATE_ADDITIONAL_LAYER);
                    }
                });

                // Check zoom action
                expect(actions[3].type).toBe(ZOOM_TO_EXTENT);
                expect(actions[3].extent).toBeTruthy();
                expect(actions[3].crs).toBe('EPSG:4326');
            }, {}, done);
        });

        it('should handle empty locations array', (done) => {
            const action = {
                type: UPDATE_LOCATIONS,
                locations: []
            };

            testEpic(itineraryUpdateLocationEpic, 0, action, (actions) => {
                expect(actions.length).toBe(0);
            }, {}, done);
        });

        it('should handle single location without zoom action', (done) => {
            const action = {
                type: UPDATE_LOCATIONS,
                locations: [[2.3522, 48.8566]]
            };

            testEpic(itineraryUpdateLocationEpic, 1, action, (actions) => {
                expect(actions.length).toBe(1);
                expect(actions[0].type).toBe(UPDATE_ADDITIONAL_LAYER);
                expect(actions.find(_action => _action.type === ZOOM_TO_EXTENT)).toBeFalsy();
            }, {}, done);
        });

        it('should generate unique IDs for marker features', (done) => {
            const action = {
                type: UPDATE_LOCATIONS,
                locations: [
                    [2.3522, 48.8566],
                    [4.8320, 45.7578]
                ]
            };

            testEpic(itineraryUpdateLocationEpic, 3, action, (actions) => {
                expect(actions.length).toBe(3);

                // Check that each marker has a unique ID
                const markerIds = actions
                    .filter(_action => _action.type === UPDATE_ADDITIONAL_LAYER)
                    .map(_action => _action.options.id);
                expect(markerIds.length).toBe(2);
                expect(new Set(markerIds).size).toBe(2);
            }, {}, done);
        });
    });
    it('onItineraryErrorEpic', (done) => {
        const action = { type: SET_ITINERARY_ERROR, error: { message: 'test error' } };

        testEpic(onItineraryErrorEpic, 1, action, (actions) => {
            expect(actions[0].type).toBe(SHOW_NOTIFICATION);
            expect(actions[0].title).toBe('itinerary.notification.error');
            expect(actions[0].message).toBe('itinerary.notification.errorItineraryError');
            expect(actions[0].autoDismiss).toBe(8);
            expect(actions[0].position).toBe('tc');
            expect(actions[0].level).toBe('error');
        }, {}, done);
    });

    describe('onToggleControlItineraryEpic', () => {
        it('should disable itinerary when a different control is toggled and itinerary is enabled', (done) => {
            const NUMBER_OF_ACTIONS = 1;
            const state = {
                controls: {
                    [CONTROL_NAME]: {
                        enabled: true
                    }
                }
            };

            testEpic(
                addTimeoutEpic(onToggleControlItineraryEpic, 10),
                NUMBER_OF_ACTIONS,
                toggleControl('otherControl'),
                actions => {
                    expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                    expect(actions[0].type).toBe(SET_CONTROL_PROPERTY);
                    expect(actions[0].control).toBe(CONTROL_NAME);
                    expect(actions[0].property).toBe('enabled');
                    expect(actions[0].value).toBe(false);
                    done();
                },
                state
            );
        });

        it('should not trigger when the itinerary control itself is toggled', (done) => {
            const NUMBER_OF_ACTIONS = 1;
            const state = {
                controls: {
                    [CONTROL_NAME]: {
                        enabled: true
                    }
                }
            };

            testEpic(
                addTimeoutEpic(onToggleControlItineraryEpic, 10),
                NUMBER_OF_ACTIONS,
                toggleControl(CONTROL_NAME),
                actions => {
                    expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                    expect(actions[0].type).toBe(TEST_TIMEOUT);
                    done();
                },
                state
            );
        });

        it('should not trigger when itinerary is disabled', (done) => {
            const NUMBER_OF_ACTIONS = 1;
            const state = {
                controls: {
                    [CONTROL_NAME]: {
                        enabled: false
                    }
                }
            };

            testEpic(
                addTimeoutEpic(onToggleControlItineraryEpic, 10),
                NUMBER_OF_ACTIONS,
                toggleControl('otherControl'),
                actions => {
                    expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                    expect(actions[0].type).toBe(TEST_TIMEOUT);
                    done();
                },
                state
            );
        });
    });
});
