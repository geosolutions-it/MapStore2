/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';
import {addTimeoutEpic, TEST_TIMEOUT, testEpic} from './epicTestUtils';
import {
    UPDATE_METADATA,
    STOP,
    play,
    stop,
    FRAMES_LOADING,
    SET_FRAMES,
    SET_INTERVAL_DATA,
    TOGGLE_ANIMATION_MODE,
    toggleAnimationMode,
    INIT
} from '../../actions/playback';

import {
    retrieveFramesForPlayback,
    playbackStopWhenDeleteLayer,
    playbackCacheNextPreviousTimes,
    setIsIntervalData,
    switchOffSnapToLayer,
    playbackToggleGuideLayerToFixedStep,
    updatePlaybackDataOnMapLoad
} from '../playback';

import DOMAIN_VALUES_RESPONSE from 'raw-loader!../../test-resources/wmts/DomainValues.xml';
import DOMAIN_INTERVAL_VALUES_RESPONSE from 'raw-loader!../../test-resources/wmts/DomainIntervalValues.xml';
import { removeNode, CHANGE_LAYER_PROPERTIES, changeLayerProperties } from '../../actions/layers';
import { setCurrentTime, moveTime } from '../../actions/dimension';
import { selectLayer, LOADING, setMapSync, SELECT_LAYER, initializeSelectLayer } from '../../actions/timeline';
import { configureMap } from '../../actions/config';
import axios from '../../libs/ajax';
import MockAdapter from 'axios-mock-adapter';
const ANIMATION_MOCK_STATE = {
    dimension: {
        currentTime: '2016-09-05T00:00:00.000Z'
    },
    layers: {
        flat: [
            {
                id: 'playback:selected_layer',
                name: 'playback_layer',
                dimensions: [
                    {
                        name: 'time',
                        source: {
                            type: 'multidim-extension',
                            url: 'MOCK_DOMAIN_VALUES'
                        }
                    }
                ],
                visibility: true
            }
        ]
    },
    timeline: {
        selectedLayer: 'playback:selected_layer'
    }
};

const ANIMATION_MOCK_STATE_WITH_END_SNAPPING = {
    dimension: {
        currentTime: '2016-09-05T00:00:00.000Z'
    },
    layers: {
        flat: [
            {
                id: 'playback:selected_layer',
                name: 'playback_layer',
                dimensions: [
                    {
                        name: 'time',
                        source: {
                            type: 'multidim-extension',
                            url: 'MOCK_DOMAIN_VALUES'
                        }
                    }
                ],
                visibility: true
            }
        ]
    },
    timeline: {
        selectedLayer: 'playback:selected_layer',
        settings: {
            snapType: "end",
            endValuesSupport: true
        }
    }
};

describe('playback Epics', () => {
    let mock;
    beforeEach(() => {
        mock = new MockAdapter(axios);
    });
    afterEach(() => {
        mock.restore();
    });
    it('retrieveFramesForPlayback', done => {
        mock.onGet('MOCK_DOMAIN_VALUES').reply(200, DOMAIN_VALUES_RESPONSE);
        testEpic(retrieveFramesForPlayback, 6, play(), ([a0, a1, a2, a3, a4, a5]) => {
            // set single tile
            expect(a0.type).toBe(CHANGE_LAYER_PROPERTIES);
            expect(a0.newProperties.singleTile).toBe(true);
            // loading events
            expect(a1.type).toBe(LOADING);
            expect(a2.type).toBe(FRAMES_LOADING);
            expect(a3.type).toBe(SET_FRAMES);
            expect(a4.type).toBe(FRAMES_LOADING);
            expect(a5.type).toBe(LOADING);

            // check request parameters
            expect(mock.history.get.length).toBe(1);
            expect(mock.history.get[0].params.domain).toBe("time");
            // if animation range is not active, animation should start from current time
            expect(mock.history.get[0].params.fromValue).toBe(ANIMATION_MOCK_STATE.dimension.currentTime);
            expect(mock.history.get[0].params.layer).toBe(ANIMATION_MOCK_STATE.layers.flat[0].name);
            expect(mock.history.get[0].params.limit).toBe(20);
            expect(mock.history.get[0].params.request).toBe("GetDomainValues");
            expect(mock.history.get[0].params.service).toBe("WMTS");
            expect(mock.history.get[0].params.sort).toBe("asc");
            expect(mock.history.get[0].params.version).toBe("1.0.0");
            expect(mock.history.get.length).toBe(1);

            done();
        }, ANIMATION_MOCK_STATE);
    });
    it('retrieveFramesForPlayback with time interval values', done => {
        mock.onGet('MOCK_DOMAIN_VALUES').reply(200, DOMAIN_INTERVAL_VALUES_RESPONSE);
        testEpic(retrieveFramesForPlayback, 6, play(), ([a0, a1, a2, a3, a4, a5]) => {
            // set single tile
            expect(a0.type).toBe(CHANGE_LAYER_PROPERTIES);
            expect(a0.newProperties.singleTile).toBe(true);
            // loading events
            expect(a1.type).toBe(LOADING);
            expect(a2.type).toBe(FRAMES_LOADING);
            expect(a3.type).toBe(SET_FRAMES);
            expect(a4.type).toBe(FRAMES_LOADING);
            expect(a5.type).toBe(LOADING);

            // check request parameters
            expect(mock.history.get.length).toBe(1);
            expect(mock.history.get[0].params.domain).toBe("time");
            // if animation range is not active, animation should start from current time
            expect(mock.history.get[0].params.fromValue).toBe(ANIMATION_MOCK_STATE_WITH_END_SNAPPING.dimension.currentTime);
            expect(mock.history.get[0].params.layer).toBe(ANIMATION_MOCK_STATE_WITH_END_SNAPPING.layers.flat[0].name);
            expect(mock.history.get[0].params.limit).toBe(20);
            expect(mock.history.get[0].params.request).toBe("GetDomainValues");
            expect(mock.history.get[0].params.service).toBe("WMTS");
            expect(mock.history.get[0].params.sort).toBe("asc");
            expect(mock.history.get[0].params.version).toBe("1.0.0");
            expect(mock.history.get.length).toBe(1);

            done();
        }, ANIMATION_MOCK_STATE_WITH_END_SNAPPING);
    });
    it('retrieveFramesForPlayback with animation range', done => {
        mock.onGet('MOCK_DOMAIN_VALUES').reply(200, DOMAIN_VALUES_RESPONSE);
        testEpic(retrieveFramesForPlayback, 6, play(), ([a0, a1, a2, a3, a4, a5]) => {
            // set single tile
            expect(a0.type).toBe(CHANGE_LAYER_PROPERTIES);
            expect(a0.newProperties.singleTile).toBe(true);
            // loading events
            expect(a1.type).toBe(LOADING);
            expect(a2.type).toBe(FRAMES_LOADING);
            expect(a3.type).toBe(SET_FRAMES);
            expect(a4.type).toBe(FRAMES_LOADING);
            expect(a5.type).toBe(LOADING);

            // check request parameters
            expect(mock.history.get.length).toBe(1);
            expect(mock.history.get[0].params.domain).toBe("time");
            // if animation range active, animation fromValue at the beginning should not be set
            expect(mock.history.get[0].params.fromValue).toNotExist();
            done();
        }, {
            ...ANIMATION_MOCK_STATE,
            playback: {
                playbackRange: {
                    startPlaybackTime: '2016-09-04T00:00:00.000Z',
                    endPlaybackTime: '2016-09-04T00:00:00.000Z'
                }
            }
        });
    });
    it('retrieveFramesForPlayback with animation range and interval values', done => {
        mock.onGet('MOCK_DOMAIN_VALUES').reply(200, DOMAIN_INTERVAL_VALUES_RESPONSE);
        testEpic(retrieveFramesForPlayback, 6, play(), ([a0, a1, a2, a3, a4, a5]) => {
            // set single tile
            expect(a0.type).toBe(CHANGE_LAYER_PROPERTIES);
            expect(a0.newProperties.singleTile).toBe(true);
            // loading events
            expect(a1.type).toBe(LOADING);
            expect(a2.type).toBe(FRAMES_LOADING);
            expect(a3.type).toBe(SET_FRAMES);
            expect(a4.type).toBe(FRAMES_LOADING);
            expect(a5.type).toBe(LOADING);

            // check request parameters
            expect(mock.history.get.length).toBe(1);
            expect(mock.history.get[0].params.domain).toBe("time");
            // if animation range active, animation fromValue at the beginning should not be set
            expect(mock.history.get[0].params.fromValue).toNotExist();
            done();
        }, {
            ...ANIMATION_MOCK_STATE_WITH_END_SNAPPING,
            playback: {
                playbackRange: {
                    startPlaybackTime: '2021-09-08T22:00:00.000Z',
                    endPlaybackTime: '2021-10-08T22:00:00.000Z'
                }
            }
        });
    });
    it('playbackCacheNextPreviousTimes with time arg setCurrentTime() action', done => {
        const time = '2016-09-04T00:00:00.000Z';
        mock.onGet('MOCK_DOMAIN_VALUES').reply(200, DOMAIN_VALUES_RESPONSE);
        testEpic(playbackCacheNextPreviousTimes, 1, setCurrentTime(time), ([ action ]) => {
            try {
                expect(action.type).toBe(UPDATE_METADATA);
                expect(action.forTime).toBe(time);
            } catch (e) {
                done(e);
            }
            done();
        }, ANIMATION_MOCK_STATE);
    });
    it('playbackCacheNextPreviousTimes with time arg setMapSync() action', done => {
        mock.onGet('MOCK_DOMAIN_VALUES').reply(200, DOMAIN_VALUES_RESPONSE);
        testEpic(playbackCacheNextPreviousTimes, 1, setMapSync(true), ([action]) => {
            try {
                expect(action.type).toBe(UPDATE_METADATA);
            } catch (e) {
                done(e);
            }
            done();
        }, ANIMATION_MOCK_STATE);
    });
    it('playbackCacheNextPreviousTimes with time arg moveTime() action', done => {
        const time = '2016-09-04T00:00:00.000Z';
        mock.onGet('MOCK_DOMAIN_VALUES').reply(200, DOMAIN_VALUES_RESPONSE);
        testEpic(playbackCacheNextPreviousTimes, 1, moveTime(time), ([ action ]) => {
            try {
                expect(action.type).toBe(UPDATE_METADATA);
                expect(action.forTime).toBe(time);
            } catch (e) {
                done(e);
            }
            done();
        }, ANIMATION_MOCK_STATE);
    });
    it('playbackCacheNextPreviousTimes without time arg selectLayer() action', done => {
        const currentTime = '2016-09-04T00:00:00.000Z';
        mock.onGet('MOCK_DOMAIN_VALUES').reply(200, DOMAIN_VALUES_RESPONSE);
        testEpic(playbackCacheNextPreviousTimes, 1, selectLayer(), ([ action ]) => {
            try {
                expect(action.type).toBe(UPDATE_METADATA);
                expect(action.forTime).toBe(currentTime);
            } catch (e) {
                done(e);
            }
            done();
        }, {
            ...ANIMATION_MOCK_STATE,
            dimension: {
                currentTime
            }
        });
    });
    it('playbackCacheNextPreviousTimes without time arg stop() action', done => {
        const currentTime = '2016-09-04T00:00:00.000Z';
        mock.onGet('MOCK_DOMAIN_VALUES').reply(200, DOMAIN_VALUES_RESPONSE);
        testEpic(playbackCacheNextPreviousTimes, 1, stop(), ([ action ]) => {
            try {
                expect(action.type).toBe(UPDATE_METADATA);
                expect(action.forTime).toBe(currentTime);
            } catch (e) {
                done(e);
            }
            done();
        }, {
            ...ANIMATION_MOCK_STATE,
            dimension: {
                currentTime
            }
        });
    });
    it('playbackCacheNextPreviousTimes without time arg initializeSelectLayer() action', done => {
        const currentTime = '2016-09-04T00:00:00.000Z';
        mock.onGet('MOCK_DOMAIN_VALUES').reply(200, DOMAIN_VALUES_RESPONSE);
        testEpic(playbackCacheNextPreviousTimes, 1, initializeSelectLayer(), ([ action ]) => {
            try {
                expect(action.type).toBe(UPDATE_METADATA);
                expect(action.forTime).toBe(currentTime);
            } catch (e) {
                done(e);
            }
            done();
        }, {
            ...ANIMATION_MOCK_STATE,
            dimension: {
                currentTime
            }
        });
    });
    it('playbackStopWhenDeleteLayer', done => {
        testEpic(playbackStopWhenDeleteLayer, 1, removeNode(), ([action]) => {
            const { type } = action;
            expect(type).toBe(STOP);
            done();
        }, {
            playback: {
                status: 'PLAY'
            }
        });
    });
    it('setIsIntervalData on layer select', done => {
        mock.onGet('MOCK_DOMAIN_VALUES').reply(200, DOMAIN_INTERVAL_VALUES_RESPONSE);
        testEpic(setIsIntervalData, 1, selectLayer("playback:selected_layer"), ([action]) => {
            try {
                const { type, timeIntervalData } = action;
                expect(type).toBe(SET_INTERVAL_DATA);
                expect(timeIntervalData).toBe(true);
                done();
            } catch (e) {
                done(e);
            }
        }, ANIMATION_MOCK_STATE);
    });
    it('setIsIntervalData on current time', done => {
        mock.onGet('MOCK_DOMAIN_VALUES').reply(200, DOMAIN_INTERVAL_VALUES_RESPONSE);
        testEpic(setIsIntervalData, 1, setCurrentTime("2016-09-04T00:00:00.000Z"), ([action]) => {
            try {
                const { type, timeIntervalData } = action;
                expect(type).toBe(SET_INTERVAL_DATA);
                expect(timeIntervalData).toBe(true);
                done();
            } catch (e) {
                done(e);
            }
        }, ANIMATION_MOCK_STATE);
    });
    it('setIsIntervalData when no time layer selected', done => {
        testEpic(addTimeoutEpic(setIsIntervalData, 100), 1, setCurrentTime("2016-09-04T00:00:00.000Z"), ([action]) => {
            try {
                expect(action.type).toBe(TEST_TIMEOUT);
                done();
            } catch (e) {
                done(e);
            }
        }, {dimension: ANIMATION_MOCK_STATE.dimension, layers: ANIMATION_MOCK_STATE.layers});
    });
    it('switchOffSnapToLayer - layer selected visibility false', done => {
        testEpic(switchOffSnapToLayer, 1, changeLayerProperties("playback:selected_layer", {visibility: false}), ([action]) => {
            try {
                const {type} = action;
                expect(type).toBe(TOGGLE_ANIMATION_MODE);
                done();
            } catch (e) {
                done(e);
            }
        }, ANIMATION_MOCK_STATE);
    });

    it('switchOffSnapToLayer - skip toggle animation mode when timeline is not visible (collapsed)', done => {
        const state = {...ANIMATION_MOCK_STATE,
            timeline: {
                selectedLayer: 'playback:selected_layer',
                settings: {
                    collapsed: true
                }
            }};
        testEpic(addTimeoutEpic(switchOffSnapToLayer, 1000), 1, changeLayerProperties("playback:selected_layer", {visibility: false}), (actions) => {
            try {
                expect(actions.length).toBe(2);
                expect(actions[0].type).toBe(TEST_TIMEOUT);
                expect(actions[1].type).toBe('EPIC_COMPLETED');
                done();
            } catch (e) {
                done(e);
            }
        }, state, false, true);
    });

    it('switchOffSnapToLayer - skip toggle animation / different layer / visible timeline', done => {
        const state = {...ANIMATION_MOCK_STATE,
            layers: {
                flat: [
                    {
                        id: 'playback:selected_layer',
                        name: 'playback_layer',
                        dimensions: [
                            {
                                name: 'time',
                                source: {
                                    type: 'multidim-extension',
                                    url: 'MOCK_DOMAIN_VALUES'
                                }
                            }
                        ],
                        visibility: true
                    },
                    {
                        id: 'playback:not_selected_layer',
                        name: 'playback_layer_not_selected',
                        dimensions: [
                            {
                                name: 'time',
                                source: {
                                    type: 'multidim-extension',
                                    url: 'MOCK_DOMAIN_VALUES'
                                }
                            }
                        ],
                        visibility: true
                    }
                ]
            },
            timeline: {
                selectedLayer: 'playback:selected_layer',
                settings: {
                    collapsed: false
                }
            }};
        testEpic(addTimeoutEpic(switchOffSnapToLayer, 1000), 1, changeLayerProperties("playback:not_selected_layer", {filterObj: undefined}), (actions) => {
            try {
                expect(actions.length).toBe(2);
                expect(actions[0].type).toBe(TEST_TIMEOUT);
                expect(actions[1].type).toBe('EPIC_COMPLETED');
                done();
            } catch (e) {
                done(e);
            }
        }, state, false, true);
    });

    it('switchOffSnapToLayer - skip toggle animation / different layer / collapsed timeline', done => {
        const state = {...ANIMATION_MOCK_STATE,
            layers: {
                flat: [
                    {
                        id: 'playback:selected_layer',
                        name: 'playback_layer',
                        dimensions: [
                            {
                                name: 'time',
                                source: {
                                    type: 'multidim-extension',
                                    url: 'MOCK_DOMAIN_VALUES'
                                }
                            }
                        ],
                        visibility: true
                    },
                    {
                        id: 'playback:not_selected_layer',
                        name: 'playback_layer_not_selected',
                        dimensions: [
                            {
                                name: 'time',
                                source: {
                                    type: 'multidim-extension',
                                    url: 'MOCK_DOMAIN_VALUES'
                                }
                            }
                        ],
                        visibility: true
                    }
                ]
            },
            timeline: {
                selectedLayer: 'playback:selected_layer',
                settings: {
                    collapsed: true
                }
            }};
        testEpic(addTimeoutEpic(switchOffSnapToLayer, 1000), 1, changeLayerProperties("playback:not_selected_layer", {filterObj: undefined}), (actions) => {
            try {
                expect(actions.length).toBe(2);
                expect(actions[0].type).toBe(TEST_TIMEOUT);
                expect(actions[1].type).toBe('EPIC_COMPLETED');
                done();
            } catch (e) {
                done(e);
            }
        }, state, false, true);
    });
    it('playbackToggleGuideLayerToFixedStep with layer selected', done => {
        const state = {...ANIMATION_MOCK_STATE,
            layers: {
                flat: [
                    {
                        id: 'playback:selected_layer',
                        name: 'playback_layer',
                        dimensions: [
                            {
                                name: 'time',
                                source: {
                                    type: 'multidim-extension',
                                    url: 'MOCK_DOMAIN_VALUES'
                                }
                            }
                        ],
                        visibility: true
                    },
                    {
                        id: 'playback:not_selected_layer',
                        name: 'playback_layer_not_selected',
                        dimensions: [
                            {
                                name: 'time',
                                source: {
                                    type: 'multidim-extension',
                                    url: 'MOCK_DOMAIN_VALUES'
                                }
                            }
                        ],
                        visibility: true
                    }
                ]
            },
            timeline: {
                selectedLayer: 'playback:selected_layer'
            }};
        testEpic(playbackToggleGuideLayerToFixedStep, 1, toggleAnimationMode(), (actions) => {
            try {
                expect(actions.length).toBe(1);
                expect(actions[0].type).toBe(SELECT_LAYER);
                expect(actions[0].layerId).toBe(undefined);
                done();
            } catch (e) {
                done(e);
            }
        }, state);
    });
    it('playbackToggleGuideLayerToFixedStep with no layer selected', done => {
        const state = {...ANIMATION_MOCK_STATE,
            layers: {
                flat: [
                    {
                        id: 'playback:selected_layer',
                        name: 'playback_layer',
                        dimensions: [
                            {
                                name: 'time',
                                source: {
                                    type: 'multidim-extension',
                                    url: 'MOCK_DOMAIN_VALUES'
                                }
                            }
                        ],
                        visibility: true
                    },
                    {
                        id: 'playback:not_selected_layer',
                        name: 'playback_layer_not_selected',
                        dimensions: [
                            {
                                name: 'time',
                                source: {
                                    type: 'multidim-extension',
                                    url: 'MOCK_DOMAIN_VALUES'
                                }
                            }
                        ],
                        visibility: true
                    }
                ]
            },
            timeline: {}};
        testEpic(playbackToggleGuideLayerToFixedStep, 1, toggleAnimationMode(), (actions) => {
            try {
                expect(actions.length).toBe(1);
                expect(actions[0].type).toBe(SELECT_LAYER);
                expect(actions[0].layerId).toBe('playback:selected_layer');
                done();
            } catch (e) {
                done(e);
            }
        }, state);
    });
    it('updatePlaybackDataOnMapLoad on config load', done => {
        const _payload = {playback: {metadata: {timeIntervalData: false}, settings: "2"}};
        testEpic(updatePlaybackDataOnMapLoad, 1, configureMap(_payload), ([action]) => {
            try {
                const { type, payload } = action;
                expect(type).toBe(INIT);
                expect(payload.metadata.timeIntervalData).toBe(false);
                expect(payload.settings).toBe("2");
                done();
            } catch (e) {
                done(e);
            }
        }, ANIMATION_MOCK_STATE);
    });
    it('updatePlaybackDataOnMapLoad on no playback config data', done => {
        const _payload = {map: {}};
        testEpic(addTimeoutEpic(updatePlaybackDataOnMapLoad, 500), 1, configureMap(_payload), ([action]) => {
            try {
                expect(action.type).toBe(TEST_TIMEOUT);
                done();
            } catch (e) {
                done(e);
            }
        }, ANIMATION_MOCK_STATE);
    });
});
