/**
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import {
    updateCrsSelectorConfigEpic,
    updateMapResolutionsOnCrsChangeEpic
} from '../crsselector';
import { configureMap } from '../../../../actions/config';
import { SET_PROJECTIONS_CONFIG } from '../../actions/crsselector';
import {
    CHANGE_MAP_CRS,
    SET_MAP_RESOLUTIONS,
    UPDATE_MAP_OPTIONS,
    changeCRS
} from '../../../../actions/map';
import { testEpic, addTimeoutEpic } from '../../../../epics/__tests__/epicTestUtils';

describe('crsselector epics', () => {
    describe('updateCrsSelectorConfigEpic', () => {
        it('should dispatch setProjectionsConfig when MAP_CONFIG_LOADED has crsSelector config', (done) => {
            const action = configureMap({
                crsSelector: {
                    projectionList: [
                        { value: 'EPSG:4326', label: 'EPSG:4326' },
                        { value: 'EPSG:3857', label: 'EPSG:3857' }
                    ]
                }
            });
            testEpic(
                updateCrsSelectorConfigEpic,
                1,
                action,
                (actions) => {
                    expect(actions.length).toBe(1);
                    expect(actions[0].type).toBe(SET_PROJECTIONS_CONFIG);
                    expect(actions[0].config.projectionList).toEqual([
                        { value: 'EPSG:4326', label: 'EPSG:4326' },
                        { value: 'EPSG:3857', label: 'EPSG:3857' }
                    ]);
                },
                {},
                done
            );
        });

        it('should dispatch setProjectionsConfig(undefined) when MAP_CONFIG_LOADED has no crsSelector config', (done) => {
            const action = configureMap({});
            testEpic(
                addTimeoutEpic(updateCrsSelectorConfigEpic),
                1,
                action,
                (actions) => {
                    expect(actions.length).toBe(1);
                    expect(actions[0].type).toBe(SET_PROJECTIONS_CONFIG);
                    // The undefined payload is the explicit "no persisted list" signal
                    expect(actions[0].config).toBe(undefined);
                },
                {},
                done
            );
        });

        it('should also restore customResolutions when present in the persisted crsSelector config', (done) => {
            const action = configureMap({
                crsSelector: {
                    projectionList: [{ value: 'EPSG:4326', label: 'EPSG:4326' }],
                    customResolutions: {
                        'EPSG:4326': [1, 0.5, 0.25]
                    }
                },
                map: {
                    projection: 'EPSG:4326',
                    mapOptions: { view: { projection: 'EPSG:4326', resolutions: [1, 0.5, 0.25] } }
                }
            });
            testEpic(
                updateCrsSelectorConfigEpic,
                1,
                action,
                (actions) => {
                    expect(actions.length).toBe(1);
                    expect(actions[0].type).toBe(SET_PROJECTIONS_CONFIG);
                    expect(actions[0].config.customResolutions).toEqual({
                        'EPSG:4326': [1, 0.5, 0.25]
                    });
                },
                {},
                done
            );
        });

        it('should hydrate map.mapOptions.view + map.resolutions for legacy maps where customResolutions[map.projection] exists but mapOptions.view.resolutions is missing', (done) => {
            const action = configureMap({
                crsSelector: {
                    customResolutions: {
                        'EPSG:4326': [1, 0.5, 0.25]
                    }
                },
                map: {
                    projection: 'EPSG:4326'
                }
            });
            testEpic(
                updateCrsSelectorConfigEpic,
                3,
                action,
                (actions) => {
                    expect(actions.length).toBe(3);
                    expect(actions[0].type).toBe(SET_PROJECTIONS_CONFIG);
                    expect(actions[1].type).toBe(UPDATE_MAP_OPTIONS);
                    expect(actions[1].configUpdate.view.projection).toBe('EPSG:4326');
                    expect(actions[1].configUpdate.view.resolutions).toEqual([1, 0.5, 0.25]);
                    expect(actions[2].type).toBe(SET_MAP_RESOLUTIONS);
                    expect(actions[2].resolutions).toEqual([1, 0.5, 0.25]);
                },
                {},
                done
            );
        });

        it('should NOT hydrate when mapOptions.view.resolutions is already aligned to the current CRS', (done) => {
            const action = configureMap({
                crsSelector: {
                    customResolutions: {
                        'EPSG:4326': [1, 0.5, 0.25]
                    }
                },
                map: {
                    projection: 'EPSG:4326',
                    mapOptions: {
                        view: { projection: 'EPSG:4326', resolutions: [9, 8, 7] }
                    }
                }
            });
            testEpic(
                addTimeoutEpic(updateCrsSelectorConfigEpic),
                1,
                action,
                (actions) => {
                    expect(actions.length).toBe(1);
                    expect(actions[0].type).toBe(SET_PROJECTIONS_CONFIG);
                },
                {},
                done
            );
        });

        it('should hydrate when mapOptions.view.projection is set but points to a different CRS than map.projection', (done) => {
            const action = configureMap({
                crsSelector: {
                    customResolutions: {
                        'EPSG:4326': [1, 0.5, 0.25]
                    }
                },
                map: {
                    projection: 'EPSG:4326',
                    mapOptions: {
                        view: { projection: 'EPSG:3857', resolutions: [200, 100, 50] }
                    }
                }
            });
            testEpic(
                updateCrsSelectorConfigEpic,
                3,
                action,
                (actions) => {
                    expect(actions.length).toBe(3);
                    expect(actions[1].type).toBe(UPDATE_MAP_OPTIONS);
                    expect(actions[1].configUpdate.view.projection).toBe('EPSG:4326');
                    expect(actions[1].configUpdate.view.resolutions).toEqual([1, 0.5, 0.25]);
                    expect(actions[2].type).toBe(SET_MAP_RESOLUTIONS);
                },
                {},
                done
            );
        });
    });

    describe('updateMapResolutionsOnCrsChangeEpic', () => {
        it('should push customResolutions[newCrs] into the map state when the CRSSelector cfg has an entry for the new CRS', (done) => {
            const state = {
                crsselector: {
                    config: {
                        customResolutions: {
                            'EPSG:4326': [10, 5, 2.5, 1.25]
                        }
                    }
                },
                map: {
                    present: {
                        projection: 'EPSG:3857',
                        mapOptions: { view: { projection: 'EPSG:3857', rotation: 0.5, resolutions: [100, 50] } }
                    }
                }
            };
            testEpic(
                updateMapResolutionsOnCrsChangeEpic,
                2,
                changeCRS('EPSG:4326'),
                (actions) => {
                    expect(actions.length).toBe(2);
                    expect(actions[0].type).toBe(UPDATE_MAP_OPTIONS);
                    expect(actions[0].configUpdate.view.projection).toBe('EPSG:4326');
                    expect(actions[0].configUpdate.view.resolutions).toEqual([10, 5, 2.5, 1.25]);
                    // preserves unrelated view options (rotation, ...)
                    expect(actions[0].configUpdate.view.rotation).toBe(0.5);
                    expect(actions[1].type).toBe(SET_MAP_RESOLUTIONS);
                    expect(actions[1].resolutions).toEqual([10, 5, 2.5, 1.25]);
                },
                state,
                done
            );
        });

        it('should recompute resolutions from the projection extent when no customResolutions entry exists for the new CRS', (done) => {
            const state = {
                crsselector: { config: { customResolutions: {} } },
                map: { present: { projection: 'EPSG:3857' } }
            };
            testEpic(
                updateMapResolutionsOnCrsChangeEpic,
                2,
                changeCRS('EPSG:4326'),
                (actions) => {
                    expect(actions.length).toBe(2);
                    expect(actions[0].type).toBe(UPDATE_MAP_OPTIONS);
                    expect(actions[0].configUpdate.view.projection).toBe('EPSG:4326');
                    expect(Array.isArray(actions[0].configUpdate.view.resolutions)).toBe(true);
                    expect(actions[0].configUpdate.view.resolutions.length).toBeGreaterThan(0);
                    expect(actions[1].type).toBe(SET_MAP_RESOLUTIONS);
                    expect(actions[1].resolutions).toEqual(actions[0].configUpdate.view.resolutions);
                },
                state,
                done
            );
        });

        it('should not emit any action when the action carries no crs', (done) => {
            testEpic(
                addTimeoutEpic(updateMapResolutionsOnCrsChangeEpic),
                1,
                { type: CHANGE_MAP_CRS },
                (actions) => {
                    expect(actions.length).toBe(1);
                    expect(actions[0].type).toBe('EPICTEST:TIMEOUT');
                },
                {},
                done
            );
        });
    });
});
