/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import itinerary from '../itinerary';
import {
    SEARCH_LOADING,
    SEARCH_RESULTS_LOADED,
    SEARCH_ERROR,
    UPDATE_LOCATIONS,
    SET_ITINERARY_DATA,
    SELECT_LOCATION_FROM_MAP,
    SET_ITINERARY_LOADING,
    INIT_PLUGIN
} from '../../actions/itinerary';

describe('Itinerary Reducer', () => {
    const initialState = {
        searchLoading: [],
        searchResults: [],
        searchError: null,
        searchConfig: {}
    };

    it('should return initialized config', () => {
        const config = { searchConfig: { services: [{ type: 'nominatim', priority: 5, options: { limit: 10, polygon_geojson: 1, format: 'json' } }] } };
        expect(itinerary(initialState, {
            type: INIT_PLUGIN,
            config
        })).toEqual({ ...initialState, ...config });
    });

    describe('default state', () => {
        it('should return initial state when no action is provided', () => {
            expect(itinerary(undefined, {})).toEqual(initialState);
        });

        it('should return initial state for unknown action type', () => {
            const unknownAction = { type: 'UNKNOWN_ACTION' };
            expect(itinerary(initialState, unknownAction)).toEqual(initialState);
        });
    });

    describe('SEARCH_LOADING', () => {
        it('should set loading state for specific index', () => {
            const state = {
                searchLoading: [false, false, false],
                searchResults: [],
                searchError: null
            };
            const action = {
                type: SEARCH_LOADING,
                index: 1,
                loading: true
            };
            const expectedState = {
                searchLoading: [false, true, false],
                searchResults: [],
                searchError: null
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should clear error when loading starts', () => {
            const state = {
                searchLoading: [false],
                searchResults: [],
                searchError: 'Previous error'
            };
            const action = {
                type: SEARCH_LOADING,
                index: 0,
                loading: true
            };
            const expectedState = {
                searchLoading: [true],
                searchResults: [],
                searchError: null
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should not clear error when loading stops', () => {
            const state = {
                searchLoading: [true],
                searchResults: [],
                searchError: 'Some error'
            };
            const action = {
                type: SEARCH_LOADING,
                index: 0,
                loading: false
            };
            const expectedState = {
                searchLoading: [false],
                searchResults: [],
                searchError: 'Some error'
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should handle loading state for new index', () => {
            const state = {
                searchLoading: [false],
                searchResults: [],
                searchError: null
            };
            const action = {
                type: SEARCH_LOADING,
                index: 1,
                loading: true
            };
            const expectedState = {
                searchLoading: [false, true],
                searchResults: [],
                searchError: null
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should preserve existing loading states', () => {
            const state = {
                searchLoading: [true, false, true],
                searchResults: [],
                searchError: null
            };
            const action = {
                type: SEARCH_LOADING,
                index: 1,
                loading: true
            };
            const expectedState = {
                searchLoading: [true, true, true],
                searchResults: [],
                searchError: null
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });
    });

    describe('SEARCH_RESULTS_LOADED', () => {
        it('should update results and clear error', () => {
            const state = {
                searchLoading: [false],
                searchResults: [],
                searchError: 'Previous error'
            };
            const results = [
                { id: 1, name: 'Paris', lat: 48.8566, lon: 2.3522 },
                { id: 2, name: 'Lyon', lat: 45.7578, lon: 4.8320 }
            ];
            const action = {
                type: SEARCH_RESULTS_LOADED,
                results
            };
            const expectedState = {
                searchLoading: [false],
                searchResults: results,
                searchError: null
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should handle empty results array', () => {
            const state = {
                searchLoading: [false],
                searchResults: [{ id: 1, name: 'Paris' }],
                searchError: null
            };
            const action = {
                type: SEARCH_RESULTS_LOADED,
                results: []
            };
            const expectedState = {
                searchLoading: [false],
                searchResults: [],
                searchError: null
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });
    });

    describe('SEARCH_ERROR', () => {
        it('should set error and clear results', () => {
            const state = {
                searchLoading: [false],
                searchResults: [{ id: 1, name: 'Paris' }],
                searchError: null
            };
            const error = 'Network error occurred';
            const action = {
                type: SEARCH_ERROR,
                error
            };
            const expectedState = {
                searchLoading: [false],
                searchResults: [],
                searchError: error
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should handle error object', () => {
            const state = {
                searchLoading: [false],
                searchResults: [],
                searchError: null
            };
            const error = { message: 'API error', code: 500 };
            const action = {
                type: SEARCH_ERROR,
                error
            };
            const expectedState = {
                searchLoading: [false],
                searchResults: [],
                searchError: error
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });
    });

    describe('UPDATE_LOCATIONS', () => {
        it('should update locations', () => {
            const state = {
                searchLoading: [false],
                searchResults: [],
                searchError: null
            };
            const locations = [
                [2.3522, 48.8566], // Paris
                [4.8320, 45.7578]  // Lyon
            ];
            const action = {
                type: UPDATE_LOCATIONS,
                locations
            };
            const expectedState = {
                searchLoading: [false],
                searchResults: [],
                searchError: null,
                locations,
                data: null
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should handle empty locations array', () => {
            const state = {
                searchLoading: [false],
                searchResults: [],
                searchError: null,
                data: { routes: [] },
                locations: [[2.3522, 48.8566]]
            };
            const action = {
                type: UPDATE_LOCATIONS,
                locations: []
            };
            const expectedState = {
                searchLoading: [false],
                searchResults: [],
                searchError: null,
                locations: [],
                data: null
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should preserve other state properties', () => {
            const state = {
                searchLoading: [true],
                searchResults: [{ id: 1, name: 'Paris' }],
                data: { routes: [] },
                searchError: null
            };
            const action = {
                type: UPDATE_LOCATIONS,
                locations: [[2.3522, 48.8566]]
            };
            const expectedState = {
                searchLoading: [true],
                searchResults: [{ id: 1, name: 'Paris' }],
                searchError: null,
                locations: [[2.3522, 48.8566]],
                data: null
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });
    });

    describe('SET_ITINERARY_DATA', () => {
        it('should set itinerary data', () => {
            const state = {
                searchLoading: [false],
                searchResults: [],
                searchError: null
            };
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
            const action = {
                type: SET_ITINERARY_DATA,
                data
            };
            const expectedState = {
                searchLoading: [false],
                searchResults: [],
                searchError: null,
                data
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should handle empty data object', () => {
            const state = {
                searchLoading: [false],
                searchResults: [],
                searchError: null,
                data: { routes: [] }
            };
            const action = {
                type: SET_ITINERARY_DATA,
                data: {}
            };
            const expectedState = {
                searchLoading: [false],
                searchResults: [],
                searchError: null,
                data: {}
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should preserve other state properties', () => {
            const state = {
                searchLoading: [true],
                searchResults: [{ id: 1, name: 'Paris' }],
                searchError: null
            };
            const action = {
                type: SET_ITINERARY_DATA,
                data: { routes: [] }
            };
            const expectedState = {
                searchLoading: [true],
                searchResults: [{ id: 1, name: 'Paris' }],
                searchError: null,
                data: { routes: [] }
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });
    });

    describe('SELECT_LOCATION_FROM_MAP', () => {
        it('should set active click location index', () => {
            const state = {
                searchLoading: [false],
                searchResults: [],
                searchError: null
            };
            const action = {
                type: SELECT_LOCATION_FROM_MAP,
                index: 2
            };
            const expectedState = {
                searchLoading: [false],
                searchResults: [],
                searchError: null,
                activeClickLocationIndex: 2
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should update existing active click location index', () => {
            const state = {
                searchLoading: [false],
                searchResults: [],
                searchError: null,
                activeClickLocationIndex: 0
            };
            const action = {
                type: SELECT_LOCATION_FROM_MAP,
                index: 1
            };
            const expectedState = {
                searchLoading: [false],
                searchResults: [],
                searchError: null,
                activeClickLocationIndex: 1
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should preserve other state properties', () => {
            const state = {
                searchLoading: [true],
                searchResults: [{ id: 1, name: 'Paris' }],
                searchError: null
            };
            const action = {
                type: SELECT_LOCATION_FROM_MAP,
                index: 0
            };
            const expectedState = {
                searchLoading: [true],
                searchResults: [{ id: 1, name: 'Paris' }],
                searchError: null,
                activeClickLocationIndex: 0
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });
    });

    describe('SET_ITINERARY_LOADING', () => {
        it('should set itinerary loading state', () => {
            const state = {
                searchLoading: [false],
                searchResults: [],
                searchError: null
            };
            const action = {
                type: SET_ITINERARY_LOADING,
                loading: true
            };
            const expectedState = {
                searchLoading: [false],
                searchResults: [],
                searchError: null,
                itineraryLoading: true
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should update existing itinerary loading state', () => {
            const state = {
                searchLoading: [false],
                searchResults: [],
                searchError: null,
                itineraryLoading: true
            };
            const action = {
                type: SET_ITINERARY_LOADING,
                loading: false
            };
            const expectedState = {
                searchLoading: [false],
                searchResults: [],
                searchError: null,
                itineraryLoading: false
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should preserve other state properties', () => {
            const state = {
                searchLoading: [true],
                searchResults: [{ id: 1, name: 'Paris' }],
                searchError: null
            };
            const action = {
                type: SET_ITINERARY_LOADING,
                loading: true
            };
            const expectedState = {
                searchLoading: [true],
                searchResults: [{ id: 1, name: 'Paris' }],
                searchError: null,
                itineraryLoading: true
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });
    });
});
