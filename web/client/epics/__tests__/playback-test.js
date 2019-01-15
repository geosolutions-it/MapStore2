/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const { testEpic } = require('./epicTestUtils');
const { UPDATE_METADATA } = require('../../actions/playback');
const { retrieveFramesForPlayback, playbackStopWhenDeleteLayer, playbackCacheNextPreviousTimes } = require('../playback');
const { removeNode, CHANGE_LAYER_PROPERTIES } = require('../../actions/layers');
const { STOP, play, stop, FRAMES_LOADING, SET_FRAMES } = require('../../actions/playback');
const { setCurrentTime, moveTime } = require('../../actions/dimension');
const { selectLayer, LOADING } = require('../../actions/timeline');
describe('playback Epics', () => {
    it('retrieveFramesForPlayback', done => {
        const time = '2016-09-04T00:00:00.000Z';
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
            done();
        }, {
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
                                        url: 'base/web/client/test-resources/wmts/DomainValues.xml'
                                    }
                                }
                            ]
                        }
                    ]
                },
                timeline: {
                    selectedLayer: 'playback:selected_layer'
                }
            });
    });
    it('playbackCacheNextPreviousTimes with time arg setCurrentTime() action', done => {
        const time = '2016-09-04T00:00:00.000Z';
        testEpic(playbackCacheNextPreviousTimes, 1, setCurrentTime(time), ([ action ]) => {
            try {
                expect(action.type).toBe(UPDATE_METADATA);
                expect(action.forTime).toBe(time);
            } catch(e) {
                done(e);
            }
            done();
        }, {
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
                                    url: 'base/web/client/test-resources/wmts/DomainValues.xml'
                                }
                            }
                        ]
                    }
                ]
            },
            timeline: {
                selectedLayer: 'playback:selected_layer'
            }
        });
    });
    it('playbackCacheNextPreviousTimes with time arg moveTime() action', done => {
        const time = '2016-09-04T00:00:00.000Z';
        testEpic(playbackCacheNextPreviousTimes, 1, moveTime(time), ([ action ]) => {
            try {
                expect(action.type).toBe(UPDATE_METADATA);
                expect(action.forTime).toBe(time);
            } catch(e) {
                done(e);
            }
            done();
        }, {
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
                                    url: 'base/web/client/test-resources/wmts/DomainValues.xml'
                                }
                            }
                        ]
                    }
                ]
            },
            timeline: {
                selectedLayer: 'playback:selected_layer'
            }
        });
    });
    it('playbackCacheNextPreviousTimes without time arg selectLayer() action', done => {
        const currentTime = '2016-09-04T00:00:00.000Z';
        testEpic(playbackCacheNextPreviousTimes, 1, selectLayer(), ([ action ]) => {
            try {
                expect(action.type).toBe(UPDATE_METADATA);
                expect(action.forTime).toBe(currentTime);
            } catch(e) {
                done(e);
            }
            done();
        }, {
            dimension: {
                currentTime
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
                                    url: 'base/web/client/test-resources/wmts/DomainValues.xml'
                                }
                            }
                        ]
                    }
                ]
            },
            timeline: {
                selectedLayer: 'playback:selected_layer'
            }
        });
    });
    it('playbackCacheNextPreviousTimes without time arg stop() action', done => {
        const currentTime = '2016-09-04T00:00:00.000Z';
        testEpic(playbackCacheNextPreviousTimes, 1, stop(), ([ action ]) => {
            try {
                expect(action.type).toBe(UPDATE_METADATA);
                expect(action.forTime).toBe(currentTime);
            } catch(e) {
                done(e);
            }
            done();
        }, {
            dimension: {
                currentTime
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
                                    url: 'base/web/client/test-resources/wmts/DomainValues.xml'
                                }
                            }
                        ]
                    }
                ]
            },
            timeline: {
                selectedLayer: 'playback:selected_layer'
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
});
