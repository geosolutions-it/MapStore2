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
    SET_ITINERARY_LOADING
} from '../../actions/itinerary';

describe('Itinerary Reducer', () => {
    const initialState = {
        loading: [],
        results: [],
        error: null
    };

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
                loading: [false, false, false],
                results: [],
                error: null
            };
            const action = {
                type: SEARCH_LOADING,
                index: 1,
                loading: true
            };
            const expectedState = {
                loading: [false, true, false],
                results: [],
                error: null
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should clear error when loading starts', () => {
            const state = {
                loading: [false],
                results: [],
                error: 'Previous error'
            };
            const action = {
                type: SEARCH_LOADING,
                index: 0,
                loading: true
            };
            const expectedState = {
                loading: [true],
                results: [],
                error: null
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should not clear error when loading stops', () => {
            const state = {
                loading: [true],
                results: [],
                error: 'Some error'
            };
            const action = {
                type: SEARCH_LOADING,
                index: 0,
                loading: false
            };
            const expectedState = {
                loading: [false],
                results: [],
                error: 'Some error'
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should handle loading state for new index', () => {
            const state = {
                loading: [false],
                results: [],
                error: null
            };
            const action = {
                type: SEARCH_LOADING,
                index: 1,
                loading: true
            };
            const expectedState = {
                loading: [false, true],
                results: [],
                error: null
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should preserve existing loading states', () => {
            const state = {
                loading: [true, false, true],
                results: [],
                error: null
            };
            const action = {
                type: SEARCH_LOADING,
                index: 1,
                loading: true
            };
            const expectedState = {
                loading: [true, true, true],
                results: [],
                error: null
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });
    });

    describe('SEARCH_RESULTS_LOADED', () => {
        it('should update results and clear error', () => {
            const state = {
                loading: [false],
                results: [],
                error: 'Previous error'
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
                loading: [false],
                results,
                error: null
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should handle empty results array', () => {
            const state = {
                loading: [false],
                results: [{ id: 1, name: 'Paris' }],
                error: null
            };
            const action = {
                type: SEARCH_RESULTS_LOADED,
                results: []
            };
            const expectedState = {
                loading: [false],
                results: [],
                error: null
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should preserve loading state', () => {
            const state = {
                loading: [true, false],
                results: [],
                error: null
            };
            const action = {
                type: SEARCH_RESULTS_LOADED,
                results: [{ id: 1, name: 'Paris' }]
            };
            const expectedState = {
                loading: [true, false],
                results: [{ id: 1, name: 'Paris' }],
                error: null
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });
    });

    describe('SEARCH_ERROR', () => {
        it('should set error and clear results', () => {
            const state = {
                loading: [false],
                results: [{ id: 1, name: 'Paris' }],
                error: null
            };
            const error = 'Network error occurred';
            const action = {
                type: SEARCH_ERROR,
                error
            };
            const expectedState = {
                loading: [false],
                results: [],
                error
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should handle error object', () => {
            const state = {
                loading: [false],
                results: [],
                error: null
            };
            const error = { message: 'API error', code: 500 };
            const action = {
                type: SEARCH_ERROR,
                error
            };
            const expectedState = {
                loading: [false],
                results: [],
                error
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should preserve loading state', () => {
            const state = {
                loading: [true, false],
                results: [{ id: 1, name: 'Paris' }],
                error: null
            };
            const action = {
                type: SEARCH_ERROR,
                error: 'Some error'
            };
            const expectedState = {
                loading: [true, false],
                results: [],
                error: 'Some error'
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });
    });

    describe('UPDATE_LOCATIONS', () => {
        it('should update locations', () => {
            const state = {
                loading: [false],
                results: [],
                error: null
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
                loading: [false],
                results: [],
                error: null,
                locations
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should handle empty locations array', () => {
            const state = {
                loading: [false],
                results: [],
                error: null,
                locations: [[2.3522, 48.8566]]
            };
            const action = {
                type: UPDATE_LOCATIONS,
                locations: []
            };
            const expectedState = {
                loading: [false],
                results: [],
                error: null,
                locations: []
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should preserve other state properties', () => {
            const state = {
                loading: [true],
                results: [{ id: 1, name: 'Paris' }],
                error: null
            };
            const action = {
                type: UPDATE_LOCATIONS,
                locations: [[2.3522, 48.8566]]
            };
            const expectedState = {
                loading: [true],
                results: [{ id: 1, name: 'Paris' }],
                error: null,
                locations: [[2.3522, 48.8566]]
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });
    });

    describe('SET_ITINERARY_DATA', () => {
        it('should set itinerary data', () => {
            const state = {
                loading: [false],
                results: [],
                error: null
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
                loading: [false],
                results: [],
                error: null,
                data
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should handle empty data object', () => {
            const state = {
                loading: [false],
                results: [],
                error: null,
                data: { routes: [] }
            };
            const action = {
                type: SET_ITINERARY_DATA,
                data: {}
            };
            const expectedState = {
                loading: [false],
                results: [],
                error: null,
                data: {}
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should preserve other state properties', () => {
            const state = {
                loading: [true],
                results: [{ id: 1, name: 'Paris' }],
                error: null
            };
            const action = {
                type: SET_ITINERARY_DATA,
                data: { routes: [] }
            };
            const expectedState = {
                loading: [true],
                results: [{ id: 1, name: 'Paris' }],
                error: null,
                data: { routes: [] }
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });
    });

    describe('SELECT_LOCATION_FROM_MAP', () => {
        it('should set active click location index', () => {
            const state = {
                loading: [false],
                results: [],
                error: null
            };
            const action = {
                type: SELECT_LOCATION_FROM_MAP,
                index: 2
            };
            const expectedState = {
                loading: [false],
                results: [],
                error: null,
                activeClickLocationIndex: 2
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should update existing active click location index', () => {
            const state = {
                loading: [false],
                results: [],
                error: null,
                activeClickLocationIndex: 0
            };
            const action = {
                type: SELECT_LOCATION_FROM_MAP,
                index: 1
            };
            const expectedState = {
                loading: [false],
                results: [],
                error: null,
                activeClickLocationIndex: 1
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should preserve other state properties', () => {
            const state = {
                loading: [true],
                results: [{ id: 1, name: 'Paris' }],
                error: null
            };
            const action = {
                type: SELECT_LOCATION_FROM_MAP,
                index: 0
            };
            const expectedState = {
                loading: [true],
                results: [{ id: 1, name: 'Paris' }],
                error: null,
                activeClickLocationIndex: 0
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });
    });

    describe('SET_ITINERARY_LOADING', () => {
        it('should set itinerary loading state', () => {
            const state = {
                loading: [false],
                results: [],
                error: null
            };
            const action = {
                type: SET_ITINERARY_LOADING,
                loading: true
            };
            const expectedState = {
                loading: [false],
                results: [],
                error: null,
                itineraryLoading: true
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should update existing itinerary loading state', () => {
            const state = {
                loading: [false],
                results: [],
                error: null,
                itineraryLoading: true
            };
            const action = {
                type: SET_ITINERARY_LOADING,
                loading: false
            };
            const expectedState = {
                loading: [false],
                results: [],
                error: null,
                itineraryLoading: false
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });

        it('should preserve other state properties', () => {
            const state = {
                loading: [true],
                results: [{ id: 1, name: 'Paris' }],
                error: null
            };
            const action = {
                type: SET_ITINERARY_LOADING,
                loading: true
            };
            const expectedState = {
                loading: [true],
                results: [{ id: 1, name: 'Paris' }],
                error: null,
                itineraryLoading: true
            };

            expect(itinerary(state, action)).toEqual(expectedState);
        });
    });
});
