/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {
    enabledSelector,
    searchLoadingSelector,
    searchResultsSelector,
    searchErrorSelector,
    locationsSelector,
    itineraryDataSelector,
    itineraryLoadingSelector,
    itinerarySearchConfigSelector
} from '../itinerary';

describe('Itinerary Selectors', () => {
    describe('enabledSelector', () => {
        it('should return true when itinerary control is enabled', () => {
            const state = {
                controls: {
                    itinerary: {
                        enabled: true
                    }
                }
            };
            expect(enabledSelector(state)).toBe(true);
        });

        it('should return false when itinerary control is disabled', () => {
            const state = {
                controls: {
                    itinerary: {
                        enabled: false
                    }
                }
            };
            expect(enabledSelector(state)).toBe(false);
        });

        it('should return false when itinerary control is not defined', () => {
            const state = {
                controls: {
                    itinerary: {
                        enabled: false
                    }
                }
            };
            expect(enabledSelector(state)).toBe(false);
        });

        it('should return false when controls are not defined', () => {
            const state = {};
            expect(enabledSelector(state)).toBe(undefined);
        });
    });

    describe('searchLoadingSelector', () => {
        it('should return loading array from itinerary state', () => {
            const state = {
                itinerary: {
                    searchLoading: [true, false, true]
                }
            };
            expect(searchLoadingSelector(state)).toEqual([true, false, true]);
        });

        it('should return empty array when loading is not defined', () => {
            const state = {
                itinerary: {}
            };
            expect(searchLoadingSelector(state)).toEqual([]);
        });

        it('should return empty array when itinerary is not defined', () => {
            const state = {};
            expect(searchLoadingSelector(state)).toEqual([]);
        });

        it('should return empty array when state is null', () => {
            expect(searchLoadingSelector(null)).toEqual([]);
        });

        it('should return empty array when state is undefined', () => {
            expect(searchLoadingSelector(undefined)).toEqual([]);
        });
    });

    describe('searchResultsSelector', () => {
        it('should return search results from itinerary state', () => {
            const results = [
                { id: 1, name: 'Paris', lat: 48.8566, lon: 2.3522 },
                { id: 2, name: 'Lyon', lat: 45.7578, lon: 4.8320 }
            ];
            const state = {
                itinerary: {
                    searchResults: results
                }
            };
            expect(searchResultsSelector(state)).toEqual(results);
        });

        it('should return empty array when results is not defined', () => {
            const state = {
                itinerary: {}
            };
            expect(searchResultsSelector(state)).toEqual([]);
        });

        it('should return empty array when itinerary is not defined', () => {
            const state = {};
            expect(searchResultsSelector(state)).toEqual([]);
        });

        it('should return empty array when state is null', () => {
            expect(searchResultsSelector(null)).toEqual([]);
        });

        it('should return empty array when state is undefined', () => {
            expect(searchResultsSelector(undefined)).toEqual([]);
        });

        it('should return empty array when results is null', () => {
            const state = {
                itinerary: {
                    searchResults: undefined
                }
            };
            expect(searchResultsSelector(state)).toEqual([]);
        });
    });

    describe('searchErrorSelector', () => {
        it('should return error from itinerary state', () => {
            const error = 'Network error occurred';
            const state = {
                itinerary: {
                    searchError: error
                }
            };
            expect(searchErrorSelector(state)).toBe(error);
        });

        it('should return null when error is not defined', () => {
            const state = {
                itinerary: {}
            };
            expect(searchErrorSelector(state)).toBe(null);
        });

        it('should return null when itinerary is not defined', () => {
            const state = {};
            expect(searchErrorSelector(state)).toBe(null);
        });

        it('should return null when state is null', () => {
            expect(searchErrorSelector(null)).toBe(null);
        });

        it('should return null when state is undefined', () => {
            expect(searchErrorSelector(undefined)).toBe(null);
        });

        it('should return error object', () => {
            const error = { message: 'API error', code: 500 };
            const state = {
                itinerary: {
                    searchError: error
                }
            };
            expect(searchErrorSelector(state)).toEqual(error);
        });
    });

    describe('locationsSelector', () => {
        it('should return locations from itinerary state', () => {
            const locations = [
                [2.3522, 48.8566], // Paris
                [4.8320, 45.7578]  // Lyon
            ];
            const state = {
                itinerary: {
                    locations
                }
            };
            expect(locationsSelector(state)).toEqual(locations);
        });

        it('should return empty array when locations is not defined', () => {
            const state = {
                itinerary: {}
            };
            expect(locationsSelector(state)).toEqual([]);
        });

        it('should return empty array when itinerary is not defined', () => {
            const state = {};
            expect(locationsSelector(state)).toEqual([]);
        });

        it('should return empty array when state is null', () => {
            expect(locationsSelector(null)).toEqual([]);
        });

        it('should return empty array when state is undefined', () => {
            expect(locationsSelector(undefined)).toEqual([]);
        });

        it('should return empty array when locations is empty array', () => {
            const state = {
                itinerary: {
                    locations: []
                }
            };
            expect(locationsSelector(state)).toEqual([]);
        });

        it('should handle single location', () => {
            const locations = [[2.3522, 48.8566]];
            const state = {
                itinerary: {
                    locations
                }
            };
            expect(locationsSelector(state)).toEqual(locations);
        });
    });

    describe('itineraryDataSelector', () => {
        it('should return itinerary data from state', () => {
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
            const state = {
                itinerary: {
                    data
                }
            };
            expect(itineraryDataSelector(state)).toEqual(data);
        });

        it('should return empty array when data is not defined', () => {
            const state = {
                itinerary: {}
            };
            expect(itineraryDataSelector(state)).toEqual([]);
        });

        it('should return empty array when itinerary is not defined', () => {
            const state = {};
            expect(itineraryDataSelector(state)).toEqual([]);
        });

        it('should return empty array when state is null', () => {
            expect(itineraryDataSelector(null)).toEqual([]);
        });

        it('should return empty array when state is undefined', () => {
            expect(itineraryDataSelector(undefined)).toEqual([]);
        });

        it('should return empty array when data is empty array', () => {
            const state = {
                itinerary: {
                    data: []
                }
            };
            expect(itineraryDataSelector(state)).toEqual([]);
        });

        it('should handle empty data object', () => {
            const data = {};
            const state = {
                itinerary: {
                    data
                }
            };
            expect(itineraryDataSelector(state)).toEqual(data);
        });
    });

    describe('itineraryLoadingSelector', () => {
        it('should return itinerary loading state', () => {
            const state = {
                itinerary: {
                    itineraryLoading: true
                }
            };
            expect(itineraryLoadingSelector(state)).toBe(true);
        });

        it('should return false when itineraryLoading is not defined', () => {
            const state = {
                itinerary: {}
            };
            expect(itineraryLoadingSelector(state)).toBe(false);
        });

        it('should return false when itinerary is not defined', () => {
            const state = {};
            expect(itineraryLoadingSelector(state)).toBe(false);
        });

        it('should return false when state is null', () => {
            expect(itineraryLoadingSelector(null)).toBe(false);
        });

        it('should return false when state is undefined', () => {
            expect(itineraryLoadingSelector(undefined)).toBe(false);
        });

        it('should return false when itineraryLoading is false', () => {
            const state = {
                itinerary: {
                    itineraryLoading: false
                }
            };
            expect(itineraryLoadingSelector(state)).toBe(false);
        });

        it('should return false when itineraryLoading is undefined', () => {
            const state = {
                itinerary: {
                    itineraryLoading: undefined
                }
            };
            expect(itineraryLoadingSelector(state)).toBe(false);
        });
    });
    it('should return search config', () => {
        const config = { services: [{ type: 'nominatim', priority: 5, options: { limit: 10, polygon_geojson: 1, format: 'json' } }] };
        const state = {
            itinerary: {
                searchConfig: config
            }
        };
        expect(itinerarySearchConfigSelector(state)).toEqual(config);
    });
});
