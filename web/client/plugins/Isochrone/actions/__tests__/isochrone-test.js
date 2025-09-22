/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import omit from 'lodash/omit';
import {
    searchByLocationName,
    setSearchLoading,
    searchResultsLoaded,
    searchError,
    selectLocationFromMap,
    updateLocation,
    triggerIsochroneRun,
    setIsochrone,
    setIsochroneLoading,
    setIsochroneError,
    addAsLayer,
    resetIsochrone,
    initPlugin,
    SEARCH_BY_LOCATION_NAME,
    SEARCH_LOADING,
    SEARCH_RESULTS_LOADED,
    SEARCH_ERROR,
    SELECT_LOCATION_FROM_MAP,
    UPDATE_LOCATION,
    TRIGGER_ISOCHRONE_RUN,
    SET_ISOCHRONE_DATA,
    SET_ISOCHRONE_LOADING,
    ADD_AS_LAYER,
    RESET_ISOCHRONE,
    INIT_PLUGIN,
    deleteIsochroneData,
    setCurrentRunParameters,
    DELETE_ISOCHRONE_DATA,
    SET_CURRENT_RUN_PARAMETERS
} from '../isochrone';
import { SHOW_NOTIFICATION } from '../../../../actions/notifications';

describe('Isochrone Actions', () => {
    describe('searchByLocationName', () => {
        it('should create action with correct type and location', () => {
            const location = 'Berlin, Germany';
            const action = searchByLocationName(location);

            expect(action).toEqual({
                type: SEARCH_BY_LOCATION_NAME,
                location
            });
        });

        it('should handle empty location', () => {
            const action = searchByLocationName('');

            expect(action).toEqual({
                type: SEARCH_BY_LOCATION_NAME,
                location: ''
            });
        });

        it('should handle null location', () => {
            const action = searchByLocationName(null);

            expect(action).toEqual({
                type: SEARCH_BY_LOCATION_NAME,
                location: null
            });
        });
    });

    describe('setSearchLoading', () => {
        it('should create action with correct type and loading state', () => {
            const loading = true;
            const action = setSearchLoading(loading);

            expect(action).toEqual({
                type: SEARCH_LOADING,
                loading
            });
        });

        it('should handle false loading state', () => {
            const action = setSearchLoading(false);

            expect(action).toEqual({
                type: SEARCH_LOADING,
                loading: false
            });
        });
    });

    describe('searchResultsLoaded', () => {
        it('should create action with correct type and results', () => {
            const results = [
                { id: 1, name: 'Berlin', lat: 52.5200, lon: 13.4050 },
                { id: 2, name: 'Munich', lat: 48.1351, lon: 11.5820 }
            ];
            const action = searchResultsLoaded(results);

            expect(action).toEqual({
                type: SEARCH_RESULTS_LOADED,
                results
            });
        });

        it('should handle empty results array', () => {
            const action = searchResultsLoaded([]);

            expect(action).toEqual({
                type: SEARCH_RESULTS_LOADED,
                results: []
            });
        });

        it('should handle null results', () => {
            const action = searchResultsLoaded(null);

            expect(action).toEqual({
                type: SEARCH_RESULTS_LOADED,
                results: null
            });
        });
    });

    describe('searchError', () => {
        it('should create action with correct type and error', () => {
            const error = new Error('Search failed');
            const action = searchError(error);

            expect(action).toEqual({
                type: SEARCH_ERROR,
                error
            });
        });

        it('should handle string error', () => {
            const error = 'Network error';
            const action = searchError(error);

            expect(action).toEqual({
                type: SEARCH_ERROR,
                error
            });
        });
    });

    describe('selectLocationFromMap', () => {
        it('should create action with correct type', () => {
            const action = selectLocationFromMap();

            expect(action).toEqual({
                type: SELECT_LOCATION_FROM_MAP
            });
        });
    });

    describe('updateLocation', () => {
        it('should create action with correct type and location', () => {
            const location = { lat: 52.5200, lon: 13.4050, name: 'Berlin' };
            const action = updateLocation(location);

            expect(action).toEqual({
                type: UPDATE_LOCATION,
                location
            });
        });

        it('should handle location with coordinates only', () => {
            const location = { lat: 52.5200, lon: 13.4050 };
            const action = updateLocation(location);

            expect(action).toEqual({
                type: UPDATE_LOCATION,
                location
            });
        });

        it('should handle null location', () => {
            const action = updateLocation(null);

            expect(action).toEqual({
                type: UPDATE_LOCATION,
                location: null
            });
        });
    });

    describe('triggerIsochroneRun', () => {
        it('should create action with correct type and isochrone data', () => {
            const isochrone = {
                location: { lat: 52.5200, lon: 13.4050 },
                config: { profile: 'car', time_limit: 4000, buckets: 4 }
            };
            const action = triggerIsochroneRun(isochrone);

            expect(action).toEqual({
                type: TRIGGER_ISOCHRONE_RUN,
                isochrone
            });
        });

        it('should handle empty isochrone object', () => {
            const action = triggerIsochroneRun({});

            expect(action).toEqual({
                type: TRIGGER_ISOCHRONE_RUN,
                isochrone: {}
            });
        });
    });

    describe('setIsochrone', () => {
        it('should create action with correct type and data', () => {
            const data = {
                layer: { id: 'test-layer', features: [] },
                bbox: [13.0, 52.0, 14.0, 53.0],
                config: { profile: 'car' }
            };
            const action = setIsochrone(data);

            expect(action).toEqual({
                type: SET_ISOCHRONE_DATA,
                data
            });
        });

        it('should handle isochrone data with features', () => {
            const data = {
                layer: {
                    id: 'isochrone-layer',
                    features: [
                        {
                            type: 'Feature',
                            geometry: { type: 'Polygon', coordinates: [] },
                            properties: { id: 'isochrone-1' }
                        }
                    ]
                },
                bbox: [13.0, 52.0, 14.0, 53.0]
            };
            const action = setIsochrone(data);

            expect(action).toEqual({
                type: SET_ISOCHRONE_DATA,
                data
            });
        });
    });

    describe('setIsochroneLoading', () => {
        it('should create action with correct type and loading state', () => {
            const loading = true;
            const action = setIsochroneLoading(loading);

            expect(action).toEqual({
                type: SET_ISOCHRONE_LOADING,
                loading
            });
        });

        it('should handle false loading state', () => {
            const action = setIsochroneLoading(false);

            expect(action).toEqual({
                type: SET_ISOCHRONE_LOADING,
                loading: false
            });
        });
    });

    describe('setIsochroneError', () => {
        it('should create error notification action with error message from data.message', () => {
            const error = {
                data: {
                    message: 'Isochrone calculation failed'
                }
            };
            const action = setIsochroneError(error);

            expect(omit(action, 'uid')).toEqual({
                type: SHOW_NOTIFICATION,
                title: 'isochrone.notification.error',
                message: 'Isochrone calculation failed',
                autoDismiss: 6,
                position: 'tc',
                level: 'error'
            });
        });

        it('should use default message when data.message is not available', () => {
            const error = {
                data: {}
            };
            const action = setIsochroneError(error);

            expect(omit(action, 'uid')).toEqual({
                type: SHOW_NOTIFICATION,
                title: 'isochrone.notification.error',
                message: 'isochrone.notification.errorIsochroneError',
                autoDismiss: 6,
                position: 'tc',
                level: 'error'
            });
        });

        it('should handle null error', () => {
            const action = setIsochroneError(null);

            expect(omit(action, 'uid')).toEqual({
                type: SHOW_NOTIFICATION,
                title: 'isochrone.notification.error',
                message: 'isochrone.notification.errorIsochroneError',
                autoDismiss: 6,
                position: 'tc',
                level: 'error'
            });
        });
    });

    describe('addAsLayer', () => {
        it('should create action with correct type, features, and style', () => {
            const features = [
                {
                    type: 'Feature',
                    geometry: { type: 'Polygon', coordinates: [] },
                    properties: { id: 'feature-1' }
                }
            ];
            const style = {
                format: 'geostyler',
                body: { rules: [] }
            };
            const layer = { features, style };
            const action = addAsLayer(layer);

            expect(action).toEqual({
                type: ADD_AS_LAYER,
                layer
            });
        });

        it('should handle empty features array', () => {
            const layer = { features: [], style: {} };
            const action = addAsLayer(layer);

            expect(action).toEqual({
                type: ADD_AS_LAYER,
                layer
            });
        });

        it('should handle null features', () => {
            const layer = { features: null, style: {} };
            const action = addAsLayer(layer);

            expect(action).toEqual({
                type: ADD_AS_LAYER,
                layer
            });
        });
    });

    describe('resetIsochrone', () => {
        it('should create action with correct type', () => {
            const action = resetIsochrone();

            expect(action).toEqual({
                type: RESET_ISOCHRONE
            });
        });
    });

    describe('initPlugin', () => {
        it('should create action with correct type and config', () => {
            const config = {
                searchConfig: [{ type: 'nominatim' }],
                providerApiConfig: { key: 'test-key' }
            };
            const action = initPlugin(config);

            expect(action).toEqual({
                type: INIT_PLUGIN,
                config
            });
        });

        it('should handle empty config', () => {
            const action = initPlugin({});

            expect(action).toEqual({
                type: INIT_PLUGIN,
                config: {}
            });
        });

        it('should handle null config', () => {
            const action = initPlugin(null);

            expect(action).toEqual({
                type: INIT_PLUGIN,
                config: null
            });
        });
    });
    describe('deleteIsochroneData', () => {
        it('should create action with correct type and id', () => {
            const id = '123';
            const action = deleteIsochroneData(id);

            expect(action).toEqual({
                type: DELETE_ISOCHRONE_DATA,
                id
            });
        });
    });
    describe('setCurrentRunParameters', () => {
        it('should create action with correct type and parameters', () => {
            const parameters = { profile: 'car', time_limit: 4000, buckets: 4 };
            const action = setCurrentRunParameters(parameters);

            expect(action).toEqual({
                type: SET_CURRENT_RUN_PARAMETERS,
                parameters
            });
        });
    });
});
