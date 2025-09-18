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
    isochroneLocationSelector,
    isochroneLoadingSelector,
    isochroneDataSelector,
    isochroneLayersSelector,
    isochroneLayersOwnerSelector,
    isochroneSearchConfigSelector,
    isochroneCurrentRunParametersSelector
} from '../isochrone';
import { CONTROL_NAME, DEFAULT_PROVIDER_CONFIG, ISOCHRONE_ROUTE_LAYER } from '../../constants';

describe('Isochrone Selectors', () => {
    const mockState = {
        controls: {
            [CONTROL_NAME]: {
                enabled: true
            }
        },
        isochrone: {
            searchLoading: false,
            searchResults: [
                { id: 1, name: 'Location 1', lat: 41.9, lon: 12.5 },
                { id: 2, name: 'Location 2', lat: 42.0, lon: 12.6 }
            ],
            searchError: null,
            location: [12.5, 41.9],
            loading: false,
            data: [
                { id: 'isochrone-1', type: 'isochrone', features: [] },
                { id: 'isochrone-2', type: 'isochrone', features: [] }
            ],
            searchConfig: {
                services: [{ type: 'nominatim', priority: 5 }],
                maxResults: 15
            }
        },
        additionallayers: [
            {
                id: ISOCHRONE_ROUTE_LAYER + '_run_isochrone-1',
                owner: CONTROL_NAME + '_run',
                options: { type: 'vector', features: [] }
            },
            {
                id: ISOCHRONE_ROUTE_LAYER + '_run_isochrone-2',
                owner: CONTROL_NAME + '_run',
                options: { type: 'vector', features: ['feature1', 'feature2'] }
            },
            {
                id: ISOCHRONE_ROUTE_LAYER + '_marker_0',
                owner: CONTROL_NAME + '_marker',
                options: { type: 'vector', features: [] }
            },
            {
                id: 'other-layer',
                owner: 'other_plugin',
                options: { type: 'wms' }
            }
        ]
    };

    const emptyState = {};

    describe('enabledSelector', () => {
        it('should return true when isochrone control is enabled', () => {
            const result = enabledSelector(mockState);
            expect(result).toBe(true);
        });

        it('should return false when isochrone control is disabled', () => {
            const state = {
                ...mockState,
                controls: {
                    [CONTROL_NAME]: {
                        enabled: false
                    }
                }
            };
            const result = enabledSelector(state);
            expect(result).toBe(false);
        });

        it('should return false when control state is undefined', () => {
            const state = {
                controls: {}
            };
            const result = enabledSelector(state);
            expect(!!result).toBe(false);
        });

        it('should return false when controls state is undefined', () => {
            const result = enabledSelector(emptyState);
            expect(!!result).toBe(false);
        });

        it('should return false when state is undefined', () => {
            const result = enabledSelector(undefined);
            expect(!!result).toBe(false);
        });
    });

    describe('searchLoadingSelector', () => {
        it('should return search loading state', () => {
            const result = searchLoadingSelector(mockState);
            expect(result).toBe(false);
        });

        it('should return true when search is loading', () => {
            const state = {
                ...mockState,
                isochrone: {
                    ...mockState.isochrone,
                    searchLoading: true
                }
            };
            const result = searchLoadingSelector(state);
            expect(result).toBe(true);
        });

        it('should return false when isochrone state is undefined', () => {
            const result = searchLoadingSelector(emptyState);
            expect(result).toBe(false);
        });

        it('should return false when state is undefined', () => {
            const result = searchLoadingSelector(undefined);
            expect(result).toBe(false);
        });
    });

    describe('searchResultsSelector', () => {
        it('should return search results', () => {
            const result = searchResultsSelector(mockState);
            expect(result).toEqual(mockState.isochrone.searchResults);
            expect(result.length).toBe(2);
            expect(result[0].name).toBe('Location 1');
        });

        it('should return empty array when no results', () => {
            const state = {
                ...mockState,
                isochrone: {
                    ...mockState.isochrone,
                    searchResults: []
                }
            };
            const result = searchResultsSelector(state);
            expect(result).toEqual([]);
        });

        it('should return empty array when isochrone state is undefined', () => {
            const result = searchResultsSelector(emptyState);
            expect(result).toEqual([]);
        });

        it('should return empty array when state is undefined', () => {
            const result = searchResultsSelector(undefined);
            expect(result).toEqual([]);
        });
    });

    describe('searchErrorSelector', () => {
        it('should return search error', () => {
            const error = { message: 'Search failed', code: 500 };
            const state = {
                ...mockState,
                isochrone: {
                    ...mockState.isochrone,
                    searchError: error
                }
            };
            const result = searchErrorSelector(state);
            expect(result).toEqual(error);
        });

        it('should return null when no error', () => {
            const result = searchErrorSelector(mockState);
            expect(result).toBe(null);
        });

        it('should return null when isochrone state is undefined', () => {
            const result = searchErrorSelector(emptyState);
            expect(result).toBe(null);
        });

        it('should return null when state is undefined', () => {
            const result = searchErrorSelector(undefined);
            expect(result).toBe(null);
        });
    });

    describe('isochroneLocationSelector', () => {
        it('should return isochrone location', () => {
            const result = isochroneLocationSelector(mockState);
            expect(result).toEqual([12.5, 41.9]);
        });

        it('should return null when no location', () => {
            const state = {
                ...mockState,
                isochrone: {
                    ...mockState.isochrone,
                    location: null
                }
            };
            const result = isochroneLocationSelector(state);
            expect(result).toBe(null);
        });

        it('should return null when isochrone state is undefined', () => {
            const result = isochroneLocationSelector(emptyState);
            expect(result).toBe(null);
        });

        it('should return null when state is undefined', () => {
            const result = isochroneLocationSelector(undefined);
            expect(result).toBe(null);
        });
    });

    describe('isochroneLoadingSelector', () => {
        it('should return isochrone loading state', () => {
            const result = isochroneLoadingSelector(mockState);
            expect(result).toBe(false);
        });

        it('should return true when isochrone is loading', () => {
            const state = {
                ...mockState,
                isochrone: {
                    ...mockState.isochrone,
                    loading: true
                }
            };
            const result = isochroneLoadingSelector(state);
            expect(result).toBe(true);
        });

        it('should return false when isochrone state is undefined', () => {
            const result = isochroneLoadingSelector(emptyState);
            expect(result).toBe(false);
        });

        it('should return false when state is undefined', () => {
            const result = isochroneLoadingSelector(undefined);
            expect(result).toBe(false);
        });
    });

    describe('isochroneDataSelector', () => {
        it('should return isochrone data with layer information', () => {
            const result = isochroneDataSelector(mockState);
            expect(result.length).toBe(2);
            expect(result[0]).toEqual({
                id: 'isochrone-1',
                type: 'isochrone',
                features: [],
                layer: { type: 'vector', features: [] }
            });
            expect(result[1]).toEqual({
                id: 'isochrone-2',
                type: 'isochrone',
                features: [],
                layer: { type: 'vector', features: ['feature1', 'feature2'] }
            });
        });

        it('should return empty array when no data', () => {
            const state = {
                ...mockState,
                isochrone: {
                    ...mockState.isochrone,
                    data: []
                }
            };
            const result = isochroneDataSelector(state);
            expect(result).toEqual([]);
        });

        it('should handle missing additional layers', () => {
            const state = {
                ...mockState,
                additionallayers: []
            };
            const result = isochroneDataSelector(state);
            expect(result.length).toBe(2);
            expect(result[0].layer).toEqual({});
            expect(result[1].layer).toEqual({});
        });

        it('should handle undefined additional layers', () => {
            const state = {
                ...mockState,
                additionallayers: undefined
            };
            const result = isochroneDataSelector(state);
            expect(result.length).toBe(2);
            expect(result[0].layer).toEqual({});
        });

        it('should return empty array when isochrone state is undefined', () => {
            const result = isochroneDataSelector(emptyState);
            expect(result).toEqual([]);
        });

        it('should return empty array when state is undefined', () => {
            const result = isochroneDataSelector(undefined);
            expect(result).toEqual([]);
        });

        it('should filter only isochrone run layers', () => {
            const state = {
                ...mockState,
                additionallayers: [
                    {
                        id: ISOCHRONE_ROUTE_LAYER + '_run_isochrone-1',
                        owner: CONTROL_NAME + '_run',
                        options: { type: 'vector', features: [] }
                    },
                    {
                        id: ISOCHRONE_ROUTE_LAYER + '_marker_0',
                        owner: CONTROL_NAME + '_marker',
                        options: { type: 'vector', features: [] }
                    },
                    {
                        id: 'other-layer',
                        owner: 'other_plugin_run_0',
                        options: { type: 'wms' }
                    }
                ]
            };
            const result = isochroneDataSelector(state);
            expect(result[0].layer).toEqual({ type: 'vector', features: [] });
            expect(result[1].layer).toEqual({});
        });

        it('should handle isochrone items with no matching run layers', () => {
            const state = {
                ...mockState,
                isochrone: {
                    ...mockState.isochrone,
                    data: [
                        { id: 'isochrone-1', type: 'isochrone', features: [] },
                        { id: 'isochrone-2', type: 'isochrone', features: [] },
                        { id: 'isochrone-3', type: 'isochrone', features: [] }
                    ]
                },
                additionallayers: [
                    {
                        id: ISOCHRONE_ROUTE_LAYER + '_run_isochrone-1',
                        owner: CONTROL_NAME + '_run',
                        options: { type: 'vector', features: [] }
                    }
                ]
            };
            const result = isochroneDataSelector(state);
            expect(result.length).toBe(3);
            expect(result[0].layer).toEqual({ type: 'vector', features: [] });
            expect(result[1].layer).toEqual({});
            expect(result[2].layer).toEqual({});
        });
    });

    describe('isochroneLayersSelector', () => {
        it('should return all isochrone layers', () => {
            const result = isochroneLayersSelector(mockState);
            expect(result.length).toBe(3);
            expect(result[0].owner).toBe(CONTROL_NAME + '_run');
            expect(result[1].owner).toBe(CONTROL_NAME + '_run');
            expect(result[2].owner).toBe(CONTROL_NAME + '_marker');
        });

        it('should return empty array when no isochrone layers', () => {
            const state = {
                ...mockState,
                additionallayers: [
                    {
                        id: 'other-layer',
                        owner: 'other_plugin',
                        options: { type: 'wms' }
                    }
                ]
            };
            const result = isochroneLayersSelector(state);
            expect(result).toEqual([]);
        });

        it('should return empty array when additional layers is undefined', () => {
            const state = {
                ...mockState,
                additionallayers: undefined
            };
            const result = isochroneLayersSelector(state);
            expect(result).toEqual([]);
        });

        it('should return empty array when additional layers is null', () => {
            const state = {
                ...mockState,
                additionallayers: null
            };
            const result = isochroneLayersSelector(state);
            expect(result).toEqual([]);
        });

        it('should return empty array when state is undefined', () => {
            const result = isochroneLayersSelector(undefined);
            expect(result).toEqual([]);
        });

        it('should filter layers by control name', () => {
            const state = {
                ...mockState,
                additionallayers: [
                    {
                        id: 'isochrone-route0',
                        owner: 'isochrone_run_0',
                        options: { type: 'vector' }
                    },
                    {
                        id: 'isochrone-marker0',
                        owner: 'isochrone_marker_0',
                        options: { type: 'vector' }
                    },
                    {
                        id: 'other-layer',
                        owner: 'other_plugin',
                        options: { type: 'wms' }
                    },
                    {
                        id: 'isochrone-other',
                        owner: 'isochrone_other_0',
                        options: { type: 'vector' }
                    }
                ]
            };
            const result = isochroneLayersSelector(state);
            expect(result.length).toBe(3);
            expect(result.every(layer => layer.owner.includes(CONTROL_NAME))).toBe(true);
        });
    });

    describe('isochroneLayersOwnerSelector', () => {
        it('should return owner names of isochrone layers', () => {
            const result = isochroneLayersOwnerSelector(mockState);
            expect(result).toEqual([CONTROL_NAME + '_run', CONTROL_NAME + '_run', CONTROL_NAME + '_marker']);
        });

        it('should return empty array when no isochrone layers', () => {
            const state = {
                ...mockState,
                additionallayers: []
            };
            const result = isochroneLayersOwnerSelector(state);
            expect(result).toEqual([]);
        });

        it('should return empty array when isochrone layers selector returns undefined', () => {
            const state = {
                ...mockState,
                additionallayers: undefined
            };
            const result = isochroneLayersOwnerSelector(state);
            expect(result).toEqual([]);
        });

        it('should return empty array when state is undefined', () => {
            const result = isochroneLayersOwnerSelector(undefined);
            expect(result).toEqual([]);
        });

        it('should handle layers without owner property', () => {
            const state = {
                ...mockState,
                additionallayers: [
                    {
                        id: 'isochrone-route0',
                        options: { type: 'vector' }
                    }
                ]
            };
            const result = isochroneLayersOwnerSelector(state);
            expect(result).toEqual([]);
        });
    });

    describe('isochroneSearchConfigSelector', () => {
        it('should return search configuration', () => {
            const result = isochroneSearchConfigSelector(mockState);
            expect(result).toEqual(mockState.isochrone.searchConfig);
            expect(result.services.length).toBe(1);
            expect(result.services[0].type).toBe('nominatim');
            expect(result.maxResults).toBe(15);
        });

        it('should return empty object when no search config', () => {
            const state = {
                ...mockState,
                isochrone: {
                    ...mockState.isochrone,
                    searchConfig: {}
                }
            };
            const result = isochroneSearchConfigSelector(state);
            expect(result).toEqual({});
        });

        it('should return empty object when isochrone state is undefined', () => {
            const result = isochroneSearchConfigSelector(emptyState);
            expect(result).toEqual({});
        });

        it('should return empty object when state is undefined', () => {
            const result = isochroneSearchConfigSelector(undefined);
            expect(result).toEqual({});
        });

        it('should handle complex search configuration', () => {
            const complexConfig = {
                services: [
                    { type: 'nominatim', priority: 5, options: { limit: 10 } },
                    { type: 'wfs', priority: 3, options: { url: 'test' } }
                ],
                maxResults: 20,
                customProperty: 'test'
            };
            const state = {
                ...mockState,
                isochrone: {
                    ...mockState.isochrone,
                    searchConfig: complexConfig
                }
            };
            const result = isochroneSearchConfigSelector(state);
            expect(result).toEqual(complexConfig);
        });
    });
    describe('isochroneCurrentRunParametersSelector', () => {
        it('should return current run parameters', () => {
            const currentRunParameters = { profile: 'car1', time_limit: 4000, buckets: 4 };
            const result = isochroneCurrentRunParametersSelector({
                ...mockState,
                isochrone: { ...mockState.isochrone,
                    currentRunParameters: currentRunParameters }
            });
            expect(result).toEqual(currentRunParameters);
        });

        it('should return default provider config when no current run parameters', () => {
            const state = {
                ...mockState,
                isochrone: { ...mockState.isochrone, currentRunParameters: undefined }
            };
            const result = isochroneCurrentRunParametersSelector(state);
            expect(result).toEqual(DEFAULT_PROVIDER_CONFIG);
        });
    });
});
