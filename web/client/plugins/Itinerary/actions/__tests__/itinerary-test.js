/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import pick from 'lodash/pick';
import {
    SEARCH_BY_LOCATION_NAME,
    SEARCH_LOADING,
    SEARCH_RESULTS_LOADED,
    SEARCH_ERROR,
    SELECT_LOCATION_FROM_MAP,
    UPDATE_LOCATIONS,
    TRIGGER_ITINERARY_RUN,
    SET_ITINERARY_DATA,
    SET_ITINERARY_LOADING,
    ADD_AS_LAYER,
    RESET_ITINERARY,
    searchByLocationNameByIndex,
    setSearchLoadingByIndex,
    searchResultsLoaded,
    searchError,
    selectLocationFromMap,
    updateLocations,
    triggerItineraryRun,
    setItinerary,
    setItineraryLoading,
    setItineraryError,
    addAsLayer,
    resetItinerary,
    INIT_PLUGIN,
    initPlugin,
    SET_ITINERARY_ERROR
} from '../itinerary';

describe('Itinerary Actions', () => {
    describe('SEARCH_BY_LOCATION_NAME', () => {
        it('should create searchByLocationNameByIndex action', () => {
            const index = 0;
            const location = 'Paris';
            const expectedAction = {
                type: SEARCH_BY_LOCATION_NAME,
                location,
                index
            };

            expect(searchByLocationNameByIndex(location, index)).toEqual(expectedAction);
        });

        it('should handle empty location name', () => {
            const index = 1;
            const location = '';
            const expectedAction = {
                type: SEARCH_BY_LOCATION_NAME,
                location: '',
                index: 1
            };

            expect(searchByLocationNameByIndex(location, index)).toEqual(expectedAction);
        });
    });

    describe('SEARCH_LOADING', () => {
        it('should create setSearchLoadingByIndex action with loading true', () => {
            const index = 0;
            const loading = true;
            const expectedAction = {
                type: SEARCH_LOADING,
                index,
                loading
            };

            expect(setSearchLoadingByIndex(loading, index)).toEqual(expectedAction);
        });

        it('should create setSearchLoadingByIndex action with loading false', () => {
            const index = 1;
            const loading = false;
            const expectedAction = {
                type: SEARCH_LOADING,
                index,
                loading
            };

            expect(setSearchLoadingByIndex(loading, index)).toEqual(expectedAction);
        });
    });

    describe('SEARCH_RESULTS_LOADED', () => {
        it('should create searchResultsLoaded action', () => {
            const results = [
                { id: 1, name: 'Paris', lat: 48.8566, lon: 2.3522 },
                { id: 2, name: 'Lyon', lat: 45.7578, lon: 4.8320 }
            ];
            const expectedAction = {
                type: SEARCH_RESULTS_LOADED,
                results
            };

            expect(searchResultsLoaded(results)).toEqual(expectedAction);
        });

        it('should handle empty results array', () => {
            const results = [];
            const expectedAction = {
                type: SEARCH_RESULTS_LOADED,
                results: []
            };

            expect(searchResultsLoaded(results)).toEqual(expectedAction);
        });
    });

    describe('SEARCH_ERROR', () => {
        it('should create searchError action', () => {
            const error = 'Network error occurred';
            const expectedAction = {
                type: SEARCH_ERROR,
                error
            };

            expect(searchError(error)).toEqual(expectedAction);
        });

        it('should handle error object', () => {
            const error = { message: 'API error', code: 500 };
            const expectedAction = {
                type: SEARCH_ERROR,
                error
            };

            expect(searchError(error)).toEqual(expectedAction);
        });
    });

    describe('SELECT_LOCATION_FROM_MAP', () => {
        it('should create selectLocationFromMap action', () => {
            const index = 0;
            const expectedAction = {
                type: SELECT_LOCATION_FROM_MAP,
                index
            };

            expect(selectLocationFromMap(index)).toEqual(expectedAction);
        });

        it('should handle different index values', () => {
            const index = 2;
            const expectedAction = {
                type: SELECT_LOCATION_FROM_MAP,
                index: 2
            };

            expect(selectLocationFromMap(index)).toEqual(expectedAction);
        });
    });

    describe('UPDATE_LOCATIONS', () => {
        it('should create updateLocations action', () => {
            const locations = [
                [2.3522, 48.8566], // Paris
                [4.8320, 45.7578]  // Lyon
            ];
            const expectedAction = {
                type: UPDATE_LOCATIONS,
                locations
            };

            expect(updateLocations(locations)).toEqual(expectedAction);
        });

        it('should handle single location', () => {
            const locations = [[2.3522, 48.8566]];
            const expectedAction = {
                type: UPDATE_LOCATIONS,
                locations: [[2.3522, 48.8566]]
            };

            expect(updateLocations(locations)).toEqual(expectedAction);
        });

        it('should handle empty locations array', () => {
            const locations = [];
            const expectedAction = {
                type: UPDATE_LOCATIONS,
                locations: []
            };

            expect(updateLocations(locations)).toEqual(expectedAction);
        });
    });

    describe('TRIGGER_ITINERARY_RUN', () => {
        it('should create triggerItineraryRun action with itinerary data', () => {
            const itinerary = {
                routes: [
                    {
                        distance: 5000,
                        duration: 1800,
                        geometry: [[2.3522, 48.8566], [4.8320, 45.7578]]
                    }
                ],
                bbox: [2.3522, 45.7578, 4.8320, 48.8566]
            };
            const expectedAction = {
                type: TRIGGER_ITINERARY_RUN,
                itinerary
            };

            expect(triggerItineraryRun(itinerary)).toEqual(expectedAction);
        });

        it('should handle null itinerary', () => {
            const itinerary = null;
            const expectedAction = {
                type: TRIGGER_ITINERARY_RUN,
                itinerary: null
            };

            expect(triggerItineraryRun(itinerary)).toEqual(expectedAction);
        });

        it('should handle undefined itinerary', () => {
            const itinerary = undefined;
            const expectedAction = {
                type: TRIGGER_ITINERARY_RUN,
                itinerary: undefined
            };

            expect(triggerItineraryRun(itinerary)).toEqual(expectedAction);
        });
    });

    describe('SET_ITINERARY_DATA', () => {
        it('should create setItinerary action', () => {
            const data = {
                routes: [
                    {
                        distance: 5000,
                        duration: 1800,
                        instructions: [
                            { text: 'Turn right', distance: 100, time: 60 }
                        ]
                    }
                ]
            };
            const expectedAction = {
                type: SET_ITINERARY_DATA,
                data
            };

            expect(setItinerary(data)).toEqual(expectedAction);
        });

        it('should handle empty data object', () => {
            const data = {};
            const expectedAction = {
                type: SET_ITINERARY_DATA,
                data: {}
            };

            expect(setItinerary(data)).toEqual(expectedAction);
        });
    });

    describe('SET_ITINERARY_LOADING', () => {
        it('should create setItineraryLoading action with loading true', () => {
            const loading = true;
            const expectedAction = {
                type: SET_ITINERARY_LOADING,
                loading
            };

            expect(setItineraryLoading(loading)).toEqual(expectedAction);
        });

        it('should create setItineraryLoading action with loading false', () => {
            const loading = false;
            const expectedAction = {
                type: SET_ITINERARY_LOADING,
                loading
            };

            expect(setItineraryLoading(loading)).toEqual(expectedAction);
        });
    });

    describe('SET_ITINERARY_ERROR', () => {
        it('should create setItineraryError action', () => {
            const error = 'Failed to calculate route';
            const expectedAction = {
                type: SET_ITINERARY_ERROR,
                error
            };
            const expected = setItineraryError(error);
            expect(pick(expected, ['type', 'error'])).toEqual(expectedAction);
        });
    });

    describe('ADD_AS_LAYER', () => {
        it('addAsLayer action', () => {
            const features = [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [[2.3522, 48.8566], [4.8320, 45.7578]]
                    },
                    properties: {
                        name: 'Route 1',
                        distance: 5000
                    }
                }
            ];
            const expectedAction = {
                type: ADD_AS_LAYER,
                features,
                style: undefined
            };

            expect(addAsLayer({features})).toEqual(expectedAction);
        });

        it('should handle empty features array', () => {
            const features = [];
            const expectedAction = {
                type: ADD_AS_LAYER,
                features: [],
                style: {}
            };

            expect(addAsLayer({features, style: {}})).toEqual(expectedAction);
        });
    });

    describe('RESET_ITINERARY', () => {
        it('should create resetItinerary action', () => {
            const expectedAction = {
                type: RESET_ITINERARY
            };
            expect(resetItinerary()).toEqual(expectedAction);
        });
    });
    describe('INIT_PLUGIN', () => {
        it('should create initPlugin action', () => {
            const config = { services: [{ type: 'nominatim', priority: 5, options: { limit: 10, polygon_geojson: 1, format: 'json' } }] };
            const expectedAction = {
                type: INIT_PLUGIN,
                config
            };
            expect(initPlugin(config)).toEqual(expectedAction);
        });
    });
});
