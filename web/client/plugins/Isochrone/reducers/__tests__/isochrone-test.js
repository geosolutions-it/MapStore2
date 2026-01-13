/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import isochrone from '../isochrone';
import {
    initPlugin,
    setSearchLoading,
    searchResultsLoaded,
    searchError,
    updateLocation,
    setIsochrone,
    setIsochroneLoading,
    deleteIsochroneData,
    setCurrentRunParameters,
    resetIsochrone
} from '../../actions/isochrone';

describe('Isochrone Reducer', () => {
    const initialState = {
        searchLoading: false,
        searchResults: [],
        searchError: null,
        location: null,
        searchConfig: {}
    };

    describe('Initial State', () => {
        it('should return initial state when state is undefined', () => {
            const state = isochrone(undefined, { type: 'UNKNOWN_ACTION' });
            expect(state).toEqual(initialState);
        });

        it('should return original state for unknown action', () => {
            const existingState = {
                searchLoading: true,
                searchResults: ['result1'],
                searchError: null,
                location: [12.5, 41.9],
                searchConfig: { services: [] }
            };
            const state = isochrone(existingState, { type: 'UNKNOWN_ACTION' });
            expect(state).toBe(existingState);
        });
    });

    describe('INIT_PLUGIN', () => {
        it('should initialize plugin with config', () => {
            const config = {
                searchConfig: {
                    services: [{ type: 'nominatim', priority: 5 }],
                    maxResults: 10
                },
                customProperty: 'test'
            };
            const state = isochrone(initialState, initPlugin(config));

            expect(state).toEqual({
                ...initialState,
                ...config
            });
        });

        it('should merge config with existing state', () => {
            const existingState = {
                ...initialState,
                searchLoading: true,
                location: [12.5, 41.9]
            };
            const config = {
                searchConfig: {
                    services: [{ type: 'nominatim' }]
                }
            };
            const state = isochrone(existingState, initPlugin(config));

            expect(state).toEqual({
                ...existingState,
                ...config
            });
        });

        it('should handle empty config', () => {
            const state = isochrone(initialState, initPlugin({}));
            expect(state).toEqual(initialState);
        });

        it('should handle null config', () => {
            const state = isochrone(initialState, initPlugin(null));
            expect(state).toEqual(initialState);
        });
    });

    describe('SEARCH_LOADING', () => {
        it('should set search loading to true', () => {
            const state = isochrone(initialState, setSearchLoading(true));
            expect(state.searchLoading).toBe(true);
        });

        it('should set search loading to false', () => {
            const existingState = {
                ...initialState,
                searchLoading: true
            };
            const state = isochrone(existingState, setSearchLoading(false));
            expect(state.searchLoading).toBe(false);
        });

        it('should clear error when starting new search', () => {
            const existingState = {
                ...initialState,
                searchError: { message: 'Previous error' }
            };
            const state = isochrone(existingState, setSearchLoading(true));
            expect(state.searchLoading).toBe(true);
            expect(state.searchError).toBe(null);
        });

        it('should not clear error when stopping search', () => {
            const existingState = {
                ...initialState,
                searchError: { message: 'Previous error' }
            };
            const state = isochrone(existingState, setSearchLoading(false));
            expect(state.searchLoading).toBe(false);
            expect(state.searchError).toEqual({ message: 'Previous error' });
        });
    });

    describe('SEARCH_RESULTS_LOADED', () => {
        it('should set search results and clear error', () => {
            const results = [
                { id: 1, name: 'Location 1', lat: 41.9, lon: 12.5 },
                { id: 2, name: 'Location 2', lat: 42.0, lon: 12.6 }
            ];
            const existingState = {
                ...initialState,
                searchError: { message: 'Previous error' }
            };
            const state = isochrone(existingState, searchResultsLoaded(results));

            expect(state.searchResults).toEqual(results);
            expect(state.searchError).toBe(null);
        });

        it('should handle empty results array', () => {
            const state = isochrone(initialState, searchResultsLoaded([]));
            expect(state.searchResults).toEqual([]);
            expect(state.searchError).toBe(null);
        });

        it('should handle null results', () => {
            const state = isochrone(initialState, searchResultsLoaded(null));
            expect(state.searchResults).toBe(null);
            expect(state.searchError).toBe(null);
        });

        it('should replace existing results', () => {
            const existingState = {
                ...initialState,
                searchResults: ['old result']
            };
            const newResults = ['new result 1', 'new result 2'];
            const state = isochrone(existingState, searchResultsLoaded(newResults));

            expect(state.searchResults).toEqual(newResults);
        });
    });

    describe('SEARCH_ERROR', () => {
        it('should set error and clear results', () => {
            const error = { message: 'Search failed', code: 500 };
            const existingState = {
                ...initialState,
                searchResults: ['result1', 'result2']
            };
            const state = isochrone(existingState, searchError(error));

            expect(state.searchError).toEqual(error);
            expect(state.searchResults).toEqual([]);
        });

        it('should handle string error', () => {
            const error = 'Simple error message';
            const state = isochrone(initialState, searchError(error));
            expect(state.searchError).toBe(error);
        });

        it('should handle null error', () => {
            const state = isochrone(initialState, searchError(null));
            expect(state.searchError).toBe(null);
        });

        it('should clear existing results when error occurs', () => {
            const existingState = {
                ...initialState,
                searchResults: ['result1', 'result2', 'result3']
            };
            const error = { message: 'Network error' };
            const state = isochrone(existingState, searchError(error));

            expect(state.searchError).toEqual(error);
            expect(state.searchResults).toEqual([]);
        });
    });

    describe('UPDATE_LOCATION', () => {
        it('should update location with coordinates', () => {
            const location = [12.5, 41.9];
            const state = isochrone(initialState, updateLocation(location));
            expect(state.location).toEqual(location);
        });

        it('should handle null location', () => {
            const existingState = {
                ...initialState,
                location: [12.5, 41.9]
            };
            const state = isochrone(existingState, updateLocation(null));
            expect(state.location).toBe(null);
        });

        it('should handle undefined location', () => {
            const state = isochrone(initialState, updateLocation(undefined));
            expect(state.location).toBe(undefined);
        });

        it('should replace existing location', () => {
            const existingState = {
                ...initialState,
                location: [10.0, 40.0]
            };
            const newLocation = [15.0, 45.0];
            const state = isochrone(existingState, updateLocation(newLocation));
            expect(state.location).toEqual(newLocation);
        });
    });

    describe('SET_ISOCHRONE_DATA', () => {
        it('should add new isochrone data to existing data', () => {
            const existingState = {
                ...initialState,
                data: [{ id: 1, type: 'isochrone1' }]
            };
            const newData = { id: 2, type: 'isochrone2' };
            const state = isochrone(existingState, setIsochrone(newData));

            expect(state.data).toEqual([
                { id: 1, type: 'isochrone1' },
                { id: 2, type: 'isochrone2' }
            ]);
        });

        it('should create new data array when none exists', () => {
            const newData = { id: 1, type: 'isochrone1' };
            const state = isochrone(initialState, setIsochrone(newData));

            expect(state.data).toEqual([newData]);
        });

        it('should handle null data to reset data array', () => {
            const existingState = {
                ...initialState,
                data: [{ id: 1, type: 'isochrone1' }, { id: 2, type: 'isochrone2' }]
            };
            const state = isochrone(existingState, setIsochrone(null));

            expect(state.data).toEqual([]);
        });

        it('should handle undefined data', () => {
            const existingState = {
                ...initialState,
                data: [{ id: 1, type: 'isochrone1' }]
            };
            const state = isochrone(existingState, setIsochrone(undefined));

            expect(state.data).toEqual([]);
        });

        it('should handle empty data array in existing state', () => {
            const existingState = {
                ...initialState,
                data: []
            };
            const newData = { id: 1, type: 'isochrone1' };
            const state = isochrone(existingState, setIsochrone(newData));

            expect(state.data).toEqual([newData]);
        });

        it('should handle complex isochrone data', () => {
            const complexData = {
                id: 'isochrone-123',
                type: 'isochrone',
                features: [
                    {
                        type: 'Feature',
                        geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] },
                        properties: { distance: 1000, time: 300 }
                    }
                ],
                metadata: {
                    profile: 'car',
                    distance_limit: 500,
                    buckets: 2
                }
            };
            const state = isochrone(initialState, setIsochrone(complexData));

            expect(state.data).toEqual([complexData]);
        });
    });

    describe('SET_ISOCHRONE_LOADING', () => {
        it('should set isochrone loading to true', () => {
            const state = isochrone(initialState, setIsochroneLoading(true));
            expect(state.loading).toBe(true);
        });

        it('should set isochrone loading to false', () => {
            const existingState = {
                ...initialState,
                loading: true
            };
            const state = isochrone(existingState, setIsochroneLoading(false));
            expect(state.loading).toBe(false);
        });

        it('should not affect other state properties', () => {
            const existingState = {
                ...initialState,
                searchLoading: true,
                searchResults: ['result1'],
                location: [12.5, 41.9]
            };
            const state = isochrone(existingState, setIsochroneLoading(true));

            expect(state.loading).toBe(true);
            expect(state.searchLoading).toBe(true);
            expect(state.searchResults).toEqual(['result1']);
            expect(state.location).toEqual([12.5, 41.9]);
        });
    });
    describe('DELETE_ISOCHRONE_DATA', () => {
        it('should delete isochrone data by id', () => {
            const existingState = {
                ...initialState,
                data: [{ id: 1, type: 'isochrone1' }]
            };
            const state = isochrone(existingState, deleteIsochroneData(1));
            expect(state.data).toEqual([]);
        });
        it('should handle null id', () => {
            const existingState = {
                ...initialState,
                data: [{ id: 1, type: 'isochrone1' }]
            };
            const state = isochrone(existingState, deleteIsochroneData(null));
            expect(state.data).toEqual(existingState.data);
        });
        it('should handle undefined id', () => {
            const existingState = {
                ...initialState,
                data: [{ id: 1, type: 'isochrone1' }]
            };
            const state = isochrone(existingState, deleteIsochroneData(undefined));
            expect(state.data).toEqual(existingState.data);
        });
        it('should handle empty id', () => {
            const existingState = {
                ...initialState,
                data: [{ id: 1, type: 'isochrone1' }]
            };
            const state = isochrone(existingState, deleteIsochroneData(''));
            expect(state.data).toEqual(existingState.data);
        });
        it('should handle invalid id', () => {
            const existingState = {
                ...initialState,
                data: [{ id: 1, type: 'isochrone1' }]
            };
            const state = isochrone(existingState, deleteIsochroneData('invalid'));
            expect(state.data).toEqual(existingState.data);
        });
    });
    describe('SET_CURRENT_RUN_PARAMETERS', () => {
        it('should set current run parameters', () => {
            const existingState = {
                ...initialState,
                currentRunParameters: { profile: 'car', time_limit: 4000, buckets: 4 }
            };
            const state = isochrone(existingState, setCurrentRunParameters({ profile: 'car', time_limit: 4000, buckets: 4 }));
            expect(state.currentRunParameters).toEqual(existingState.currentRunParameters);
        });
        it('should handle null parameters', () => {
            const existingState = {
                ...initialState,
                currentRunParameters: { profile: 'car', time_limit: 4000, buckets: 4 }
            };
            const state = isochrone(existingState, setCurrentRunParameters(null));
            expect(state.currentRunParameters).toEqual(null);
        });
        it('should handle undefined parameters', () => {
            const existingState = {
                ...initialState,
                currentRunParameters: { profile: 'car', time_limit: 4000, buckets: 4 }
            };
            const state = isochrone(existingState, setCurrentRunParameters(undefined));
            expect(state.currentRunParameters).toEqual(undefined);
        });
        it('should handle empty parameters', () => {
            const existingState = {
                ...initialState,
                currentRunParameters: { profile: 'car', time_limit: 4000, buckets: 4 }
            };
            const state = isochrone(existingState, setCurrentRunParameters({}));
            expect(state.currentRunParameters).toEqual({});
        });
    });

    describe('RESET_ISOCHRONE', () => {
        it('should clear searchError only', () => {
            const existingState = {
                ...initialState,
                searchLoading: true,
                searchResults: [{ id: 1, name: 'Location 1' }],
                searchError: { message: 'Error occurred' },
                location: [12.5, 41.9]
            };
            const state = isochrone(existingState, resetIsochrone());

            expect(state.searchError).toBe(null);
            expect(state.searchResults).toEqual(existingState.searchResults);
            expect(state.searchLoading).toBe(existingState.searchLoading);
            expect(state.location).toEqual(existingState.location);
        });

        it('should preserve searchConfig when resetting', () => {
            const existingState = {
                ...initialState,
                searchConfig: {
                    services: [{ type: 'nominatim', priority: 5 }],
                    maxResults: 10
                },
                searchResults: ['result1'],
                searchError: { message: 'Error' },
                location: [12.5, 41.9]
            };
            const state = isochrone(existingState, resetIsochrone());

            expect(state.searchConfig).toEqual(existingState.searchConfig);
            expect(state.searchResults).toEqual(existingState.searchResults);
            expect(state.location).toEqual(existingState.location);
            expect(state.searchError).toBe(null);
        });

        it('should preserve data when resetting', () => {
            const existingState = {
                ...initialState,
                data: [{ id: 1, type: 'isochrone1' }],
                searchResults: ['result1'],
                searchError: { message: 'Error' },
                location: [12.5, 41.9]
            };
            const state = isochrone(existingState, resetIsochrone());

            expect(state.data).toEqual(existingState.data);
            expect(state.searchResults).toEqual(existingState.searchResults);
            expect(state.location).toEqual(existingState.location);
            expect(state.searchError).toBe(null);
        });

        it('should preserve currentRunParameters when resetting', () => {
            const existingState = {
                ...initialState,
                currentRunParameters: { profile: 'car', time_limit: 4000, buckets: 4 },
                searchResults: ['result1'],
                searchError: { message: 'Error' },
                location: [12.5, 41.9]
            };
            const state = isochrone(existingState, resetIsochrone());

            expect(state.currentRunParameters).toEqual(existingState.currentRunParameters);
            expect(state.searchResults).toEqual(existingState.searchResults);
            expect(state.location).toEqual(existingState.location);
            expect(state.searchError).toBe(null);
        });

        it('should clear searchError from initial state', () => {
            const stateWithError = {
                ...initialState,
                searchError: { message: 'Error' }
            };
            const state = isochrone(stateWithError, resetIsochrone());

            expect(state.searchError).toBe(null);
            expect(state.searchResults).toEqual([]);
            expect(state.searchLoading).toBe(false);
            expect(state.location).toBe(null);
            expect(state.searchConfig).toEqual({});
        });
    });
});
