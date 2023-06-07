/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/


import expect from 'expect';

import moment from 'moment';
import { testEpic, addTimeoutEpic, TEST_TIMEOUT } from './epicTestUtils';

import {
    setTimelineCurrentTime,
    updateRangeDataOnRangeChange,
    settingInitialOffsetValue,
    syncTimelineGuideLayer,
    snapTimeGuideLayer,
    setRangeOnInit,
    rangeOnInitSelectLayer,
    updateTimelineDataOnMapLoad,
    onUpdateLayerDimensionData,
    onInitTimeLine,
    resetTimeline as resetTimelineEpic,
    setTimeLayersSetting
} from '../timeline';

import { changeMapView } from '../../actions/map';
import { set, compose } from '../../utils/ImmutableUtils';
import {
    selectTime,
    LOADING,
    RANGE_DATA_LOADED,
    RANGE_CHANGED,
    enableOffset,
    SELECT_LAYER,
    autoselect,
    selectLayer,
    initializeSelectLayer,
    initTimeline,
    INIT_SELECT_LAYER,
    resetTimeline,
    SET_RANGE_INIT,
    initializeRange,
    SET_END_VALUES_SUPPORT,
    SET_SNAP_RADIO_BUTTON_ENABLED,
    AUTOSELECT,
    SELECT_TIME,
    SET_TIME_LAYERS,
    setMapSync
} from '../../actions/timeline';
import { changeLayerProperties, removeNode } from '../../actions/layers';
import { SET_CURRENT_TIME, SET_OFFSET_TIME, updateLayerDimensionData } from '../../actions/dimension';
import { configureMap } from "../../actions/config";


describe('timeline Epics', () => {
    it('setTimelineCurrentTime without selected layer', done => {
        const t = new Date().toISOString();
        testEpic(setTimelineCurrentTime, 1, selectTime(t), ([action]) => {
            const { time, type } = action;
            // no layer is clicked is selected, so no snapping operation is performed
            expect(time).toBe(t);
            expect(type).toBe(SET_CURRENT_TIME);
            done();
        });
    });
    it('setTimelineCurrentTime with selected layer (with time in range)', done => {
        const t = "2010-01-01T00:00:00.000Z";
        testEpic(setTimelineCurrentTime, 3, selectTime(t, "TEST_LAYER"), ([action1, action2, action3]) => {
            const { type: loadingStartType } = action1;
            const { time, type } = action2;
            const { type: loadingEndType } = action3;
            expect(loadingStartType).toBe(LOADING);
            expect(loadingEndType).toBe(LOADING);
            // this time the current time will be set snapping to the data from DomainValues request
            expect(time).toBe("2016-09-01T00:00:00.000Z");
            expect(type).toBe(SET_CURRENT_TIME);
            done();
        }, {
            timeline: {
                selectedLayer: "TEST_LAYER",
                range: {
                    start: "2000-01-01T00:00:00.000Z",
                    end: "2020-12-31T00:00:00.000Z"
                }
            },
            layers: {
                flat: [{
                    id: 'TEST_LAYER',
                    name: 'TEST_LAYER',
                    type: 'wms',
                    url: 'base/web/client/test-resources/wmts/DomainValues.xml',
                    dimensions: [
                        {
                            source: {
                                type: 'multidim-extension',
                                // this forces to load fixed values from the test file, ignoring parameters
                                url: 'base/web/client/test-resources/wmts/DomainValues.xml'
                            },
                            name: 'time'
                        }
                    ],
                    params: {
                        time: '2000-06-08T00:00:00.000Z'
                    }
                }]
            }
        });
    });
    it('setTimelineCurrentTime with selected layer (with time in range) - time as intervals - snap to start', done => {
        const t = "2021-10-07T00:00:00.000Z";
        testEpic(setTimelineCurrentTime, 3, selectTime(t, "TEST_LAYER"), ([action1, action2, action3]) => {
            const { type: loadingStartType } = action1;
            const { time, type } = action2;
            const { type: loadingEndType } = action3;
            expect(loadingStartType).toBe(LOADING);
            expect(loadingEndType).toBe(LOADING);
            // this time the current time will be set snapping to the data from DomainValues request
            expect(time).toBe("2021-09-08T22:00:00.000Z");
            expect(type).toBe(SET_CURRENT_TIME);
            done();
        }, {
            timeline: {
                selectedLayer: "TEST_LAYER",
                settings: {
                    snapType: "start",
                    endValuesSupport: true
                },
                range: {
                    start: "2000-01-01T00:00:00.000Z",
                    end: "2023-12-31T00:00:00.000Z"
                }
            },
            layers: {
                flat: [{
                    id: 'TEST_LAYER',
                    name: 'TEST_LAYER',
                    type: 'wms',
                    url: 'base/web/client/test-resources/wmts/DomainIntervalValues.xml',
                    dimensions: [
                        {
                            source: {
                                type: 'multidim-extension',
                                // this forces to load fixed values from the test file, ignoring parameters
                                url: 'base/web/client/test-resources/wmts/DomainIntervalValues.xml'
                            },
                            name: 'time'
                        }
                    ],
                    params: {
                        time: '2000-06-08T00:00:00.000Z'
                    }
                }]
            }
        });
    });
    it('setTimelineCurrentTime with selected layer (with time in range) - time as intervals - snap to end', done => {
        const t = "2021-10-07T00:00:00.000Z";
        testEpic(setTimelineCurrentTime, 3, selectTime(t, "TEST_LAYER"), ([action1, action2, action3]) => {
            const { type: loadingStartType } = action1;
            const { time, type } = action2;
            const { type: loadingEndType } = action3;
            expect(loadingStartType).toBe(LOADING);
            expect(loadingEndType).toBe(LOADING);
            // this time the current time will be set snapping to the data from DomainValues request
            expect(time).toBe("2021-10-21T22:00:00.000Z");
            expect(type).toBe(SET_CURRENT_TIME);
            done();
        }, {
            timeline: {
                selectedLayer: "TEST_LAYER",
                settings: {
                    snapType: "end",
                    endValuesSupport: true
                },
                range: {
                    start: "2000-01-01T00:00:00.000Z",
                    end: "2023-12-31T00:00:00.000Z"
                }
            },
            layers: {
                flat: [{
                    id: 'TEST_LAYER',
                    name: 'TEST_LAYER',
                    type: 'wms',
                    url: 'base/web/client/test-resources/wmts/DomainIntervalValues.xml',
                    dimensions: [
                        {
                            source: {
                                type: 'multidim-extension',
                                // this forces to load fixed values from the test file, ignoring parameters
                                url: 'base/web/client/test-resources/wmts/DomainIntervalValues.xml'
                            },
                            name: 'time'
                        }
                    ],
                    params: {
                        time: '2000-06-08T00:00:00.000Z'
                    }
                }]
            }
        });
    });
    it('setTimelineCurrentTime with selected layer time out of range', done => {
        const t = "2001-01-01T00:00:00.000Z";
        const EXPECTED_TIME_DOMAIN = "2016-09-01T00:00:00.000Z";
        testEpic(setTimelineCurrentTime, 4, selectTime(t, "TEST_LAYER"), ([action1, action2, action3, action4]) => {
            const { type: loadingStartType} = action1;
            const { start, end } = action2;
            const { time, type } = action3;
            const { type: loadingStartEnd } = action4;
            expect(loadingStartType).toBe(LOADING);
            expect(loadingStartEnd).toBe(LOADING);
            // first action moves the current timeline view to center the current time
            expect(moment(start).isBefore(time)).toBe(true);
            expect(moment(end).isAfter(time)).toBe(true);
            // the second action is the usual snap action
            expect(time).toBe(EXPECTED_TIME_DOMAIN);
            expect(type).toBe(SET_CURRENT_TIME);
            done();
        }, {
            timeline: {
                selectedLayer: "TEST_LAYER",
                range: {
                    start: "2000-01-01T00:00:00.000Z",
                    end: "2001-12-31T00:00:00.000Z" // this range do not contains  EXPECTED_TIME_DOMAIN
                }
            },
            layers: {
                flat: [{
                    id: 'TEST_LAYER',
                    name: 'TEST_LAYER',
                    type: 'wms',
                    url: 'base/web/client/test-resources/wmts/DomainValues.xml',
                    dimensions: [
                        {
                            source: {
                                type: 'multidim-extension',
                                url: 'base/web/client/test-resources/wmts/DomainValues.xml'
                            },
                            name: 'time'
                        }
                    ],
                    params: {
                        time: '2000-06-08T00:00:00.000Z'
                    }
                }]
            }
        });
    });
    it('settingInitialOffsetValue enable range', done => {
        testEpic(settingInitialOffsetValue, 3, enableOffset(true), ([action1, action2, action3]) => {
            const { time, type } = action1;
            const { offsetTime, type: typeOff} = action2;
            const { start, end, type: typeRange } = action3;
            expect(time).toExist();
            expect(type).toBe(SET_CURRENT_TIME);
            expect(typeOff).toBe(SET_OFFSET_TIME);
            expect(typeRange).toBe(RANGE_CHANGED);
            // start and end of the new range must contain the current range
            expect(moment(start).isSameOrBefore(time)).toBe(true);
            expect(moment(end).isSameOrAfter(offsetTime)).toBe(true);
            expect(moment(offsetTime).diff(time)).toBe(3600 * 1000 * 24); // offset time must be greater than current time, 1 day by default
            done();
        });
    });
    it('settingInitialOffsetValue disable range', done => {
        testEpic(settingInitialOffsetValue, 1, enableOffset(false), ([action]) => {
            const { time, type } = action;
            expect(type).toBe(SET_OFFSET_TIME);
            expect(time).toNotExist();
            done();
        });
    });
    it('rangeOnInitSelectLayer', done => {
        testEpic(rangeOnInitSelectLayer, 1, initializeSelectLayer('TEST_LAYER'), ([action]) => {
            expect(action.type).toBe(SET_RANGE_INIT);
            expect(action.value).toBe("now");
            done();
        }, {
            timeline: {
                selectedLayer: "TEST_LAYER",
                settings: {
                    initialMode: 'range',
                    initialSnap: 'fullRange'
                },
                range: {
                    start: "2000-01-01T00:00:00.000Z",
                    end: "2001-12-31T00:00:00.000Z"
                }
            }
        });
    });
    it('rangeOnInitSelectLayer with range enabled', done => {
        testEpic(rangeOnInitSelectLayer, 1, initializeSelectLayer('TEST_LAYER', false), ([action]) => {
            expect(action.type).toBe(SET_RANGE_INIT);
            expect(action.value).toBe("fullRange");
            done();
        }, {
            dimension: {
                offsetTime: "2001-05-31T00:00:00.000Z"
            },
            timeline: {
                selectedLayer: "TEST_LAYER",
                range: {
                    start: "2000-01-01T00:00:00.000Z",
                    end: "2001-12-31T00:00:00.000Z"
                }
            }
        });
    });
    describe("onInitTimeLine", () => {
        it('onInitTimeLine on single mode', done => {
            testEpic(addTimeoutEpic(onInitTimeLine, 500), 2, initTimeline({initialSnap: 'now', initialMode: 'single'}), ([, action]) => {
                const { type, layerId } = action;
                expect(type).toBe(INIT_SELECT_LAYER);
                expect(layerId).toBe('TEST_LAYER');
                done();
            }, {
                timeline: {
                    settings: {
                        initialMode: 'single',
                        initialSnap: 'now'
                    },
                    range: {
                        start: "2000-01-01T00:00:00.000Z",
                        end: "2001-12-31T00:00:00.000Z"
                    }
                },
                layers: {
                    flat: [{
                        id: 'TEST_LAYER',
                        name: 'TEST_LAYER',
                        type: 'wms',
                        visibility: true,
                        url: 'base/web/client/test-resources/wmts/DomainValues.xml',
                        dimensions: [
                            {
                                source: {
                                    type: 'multidim-extension',
                                    url: 'base/web/client/test-resources/wmts/DomainValues.xml'
                                },
                                name: 'time'
                            }
                        ],
                        params: {
                            time: '2000-06-08T00:00:00.000Z'
                        }
                    }]
                }
            });
        });
        it('onInitTimeLine on range mode', done => {
            testEpic(addTimeoutEpic(onInitTimeLine, 500), 2, initTimeline({initialSnap: 'fullRange', initialMode: 'range'}), ([, action]) => {
                expect(action.type).toBe(SET_RANGE_INIT);
                done();
            }, {
                timeline: {
                    selectedLayer: "TEST_LAYER",
                    settings: {
                        initialMode: 'range',
                        initialSnap: 'fullRange'
                    },
                    range: {
                        start: "2000-01-01T00:00:00.000Z",
                        end: "2001-12-31T00:00:00.000Z"
                    }
                },
                layers: {
                    flat: [{
                        id: 'TEST_LAYER',
                        name: 'TEST_LAYER',
                        type: 'wms',
                        visibility: true,
                        url: 'base/web/client/test-resources/wmts/DomainValues.xml',
                        dimensions: [
                            {
                                source: {
                                    type: 'multidim-extension',
                                    url: 'base/web/client/test-resources/wmts/DomainValues.xml'
                                },
                                name: 'time'
                            }
                        ],
                        params: {
                            time: '2000-06-08T00:00:00.000Z'
                        }
                    }]
                }
            });
        });
        it('Reset timeline on single mode with no layer selected', done => {
            testEpic(resetTimelineEpic, 1, resetTimeline(), ([action1]) => {
                expect(action1.type).toBe(SELECT_TIME);
                expect(action1.time).toBeTruthy();
                done();
            }, {
                timeline: {
                    range: {
                        start: "2000-01-01T00:00:00.000Z",
                        end: "2001-12-31T00:00:00.000Z"
                    }
                }
            });
        });
        it('Reset timeline on single mode when no in view range', done => {
            testEpic(resetTimelineEpic, 2, resetTimeline(), ([action1, action2]) => {
                expect(action1.type).toBe(SELECT_TIME);
                expect(action1.time).toBeTruthy();
                expect(action2.type).toBe(RANGE_CHANGED);
                done();
            }, {
                timeline: {
                    range: {
                        start: "2000-01-01T00:00:00.000Z",
                        end: "2001-12-31T00:00:00.000Z"
                    }
                }
            });
        });
        it('Reset timeline on single mode with layer selected', done => {
            testEpic(resetTimelineEpic, 1, resetTimeline(), ([action1]) => {
                expect(action1.type).toBe(SELECT_TIME);
                expect(action1.time).toBeTruthy();
                expect(action1.group).toBe('TEST_LAYER');
                done();
            }, {
                timeline: {
                    selectedLayer: "TEST_LAYER",
                    settings: {
                        initialMode: 'single',
                        initialSnap: 'now'
                    },
                    range: {
                        start: "2000-01-01T00:00:00.000Z",
                        end: "2001-12-31T00:00:00.000Z"
                    }
                }
            });
        });
        it('Reset timeline on range mode with no layer selected', done => {
            testEpic(resetTimelineEpic, 1, resetTimeline(), ([action]) => {
                expect(action.type).toBe(INIT_SELECT_LAYER);
                expect(action.snap).toBe(false);
                done();
            }, {
                dimension: {
                    offsetTime: "2001-05-31T00:00:00.000Z"
                },
                timeline: {
                    range: {
                        start: "2000-01-01T00:00:00.000Z",
                        end: "2001-12-31T00:00:00.000Z"
                    }
                }
            });
        });
        it('Reset timeline on range mode with layer selected', done => {
            testEpic(resetTimelineEpic, 1, resetTimeline(), ([action]) => {
                expect(action.type).toBe(SET_RANGE_INIT);
                expect(action.value).toBe('fullRange');
                done();
            }, {
                dimension: {
                    offsetTime: "2001-05-31T00:00:00.000Z"
                },
                timeline: {
                    selectedLayer: "TEST_LAYER"
                }
            });
        });
    });
    describe("setRangeOnInit", () => {
        it("setRangeOnInit on domain and current time", (done) => {
            testEpic(setRangeOnInit, 3, initializeRange(), ([action1, action2, action3]) => {
                const { time, type } = action1;
                const { offsetTime, type: typeOff} = action2;
                const { type: typeRange } = action3;
                expect(time).toBeTruthy();
                expect(offsetTime).toBeTruthy();
                expect(type).toBe(SET_CURRENT_TIME);
                expect(typeOff).toBe(SET_OFFSET_TIME);
                expect(typeRange).toBe(RANGE_CHANGED);
                done();
            }, {
                timeline: {
                    selectedLayer: "TEST_LAYER",
                    settings: {
                        initialMode: 'range',
                        initialSnap: 'fullRange'
                    }
                },
                dimension: {
                    currentTime: "2000-01-01T00:00:00.000Z",
                    offsetTime: "2001-12-31T00:00:00.000Z",
                    data: {
                        time: {
                            TEST_LAYER: {
                                name: "time",
                                domain: "2000-01-01T00:00:00.000Z--2001-12-31T00:00:00.000Z"
                            }
                        }
                    }
                },
                layers: {
                    flat: [{
                        id: 'TEST_LAYER',
                        name: 'TEST_LAYER',
                        type: 'wms',
                        visibility: true,
                        url: 'base/web/client/test-resources/wmts/DomainValues.xml',
                        dimensions: [
                            {
                                source: {
                                    type: 'multidim-extension',
                                    url: 'base/web/client/test-resources/wmts/DomainValues.xml'
                                },
                                name: 'time'
                            }
                        ],
                        params: {
                            time: '2000-06-08T00:00:00.000Z'
                        }
                    }]
                }
            });
        });
        it("setRangeOnInit on empty domain and current time", (done) => {
            testEpic(setRangeOnInit, 3, initializeRange(), ([action1, action2, action3]) => {
                const { time, type } = action1;
                const { offsetTime, type: typeOff} = action2;
                const { type: typeRange } = action3;
                expect(time).toBeTruthy();
                expect(offsetTime).toBeTruthy();
                expect(type).toBe(SET_CURRENT_TIME);
                expect(typeOff).toBe(SET_OFFSET_TIME);
                expect(typeRange).toBe(RANGE_CHANGED);
                done();
            }, {
                timeline: {
                    selectedLayer: "TEST_LAYER",
                    settings: {
                        initialMode: 'range',
                        initialSnap: 'fullRange'
                    }
                },
                dimension: {
                    currentTime: "2000-01-01T00:00:00.000Z",
                    offsetTime: "2001-12-31T00:00:00.000Z"
                },
                layers: {
                    flat: [{
                        id: 'TEST_LAYER',
                        name: 'TEST_LAYER',
                        type: 'wms',
                        visibility: true,
                        url: 'base/web/client/test-resources/wmts/DomainValues.xml',
                        dimensions: [
                            {
                                source: {
                                    type: 'multidim-extension',
                                    url: 'base/web/client/test-resources/wmts/DomainValues.xml'
                                },
                                name: 'time'
                            }
                        ],
                        params: {
                            time: '2000-06-08T00:00:00.000Z'
                        }
                    }]
                }
            });
        });
        it("setRangeOnInit on empty domain and empty current time", (done) => {
            testEpic(setRangeOnInit, 3, initializeRange(), ([action1, action2, action3]) => {
                const { time, type } = action1;
                const { offsetTime, type: typeOff} = action2;
                const { type: typeRange } = action3;
                expect(time).toBeTruthy();
                expect(offsetTime).toBeTruthy();
                expect(type).toBe(SET_CURRENT_TIME);
                expect(time).toBe("2016-09-01T00:00:00.000Z");
                expect(typeOff).toBe(SET_OFFSET_TIME);
                expect(typeRange).toBe(RANGE_CHANGED);
                done();
            }, {
                timeline: {
                    selectedLayer: "TEST_LAYER",
                    settings: {
                        initialMode: 'range',
                        initialSnap: 'now'
                    }
                },
                dimension: {},
                layers: {
                    flat: [{
                        id: 'TEST_LAYER',
                        name: 'TEST_LAYER',
                        type: 'wms',
                        visibility: true,
                        url: 'base/web/client/test-resources/wmts/DomainValues.xml',
                        dimensions: [
                            {
                                source: {
                                    type: 'multidim-extension',
                                    url: 'base/web/client/test-resources/wmts/DomainValues.xml'
                                },
                                name: 'time'
                            }
                        ],
                        params: {
                            time: '2000-06-08T00:00:00.000Z'
                        }
                    }]
                }
            });
        });
        it("setRangeOnInit on domain returned as list", (done) => {
            testEpic(setRangeOnInit, 3, initializeRange(), ([action1, action2, action3]) => {
                const { time, type } = action1;
                const { offsetTime, type: typeOff} = action2;
                const { type: typeRange } = action3;
                expect(time).toEqual("2000-01-01T00:00:00.000Z");
                expect(offsetTime).toBeTruthy();
                expect(type).toBe(SET_CURRENT_TIME);
                expect(typeOff).toBe(SET_OFFSET_TIME);
                expect(typeRange).toBe(RANGE_CHANGED);
                done();
            }, {
                timeline: {
                    selectedLayer: "TEST_LAYER",
                    settings: {
                        initialMode: 'range',
                        initialSnap: 'fullRange'
                    }
                },
                dimension: {
                    currentTime: "2000-01-01T00:00:00.000Z",
                    offsetTime: "2001-12-31T00:00:00.000Z",
                    data: {
                        time: {
                            TEST_LAYER: {
                                name: "time",
                                domain: "2000-01-01T00:00:00.000Z,2001-12-31T00:00:00.000Z"
                            }
                        }
                    }
                },
                layers: {
                    flat: [{
                        id: 'TEST_LAYER',
                        name: 'TEST_LAYER',
                        type: 'wms',
                        visibility: true,
                        url: 'base/web/client/test-resources/wmts/DomainValues.xml',
                        dimensions: [
                            {
                                source: {
                                    type: 'multidim-extension',
                                    url: 'base/web/client/test-resources/wmts/DomainValues.xml'
                                },
                                name: 'time'
                            }
                        ],
                        params: {
                            time: '2000-06-08T00:00:00.000Z'
                        }
                    }]
                }
            });
        });
        it("setRangeOnInit on domain returned as single time", (done) => {
            testEpic(setRangeOnInit, 3, initializeRange(), ([action1, action2, action3]) => {
                const { time, type } = action1;
                const { offsetTime, type: typeOff} = action2;
                const { type: typeRange } = action3;
                expect(time).toBeTruthy();
                expect(offsetTime).toBeTruthy();
                expect(time).toBe("2000-01-01T00:00:00.000Z");
                expect(type).toBe(SET_CURRENT_TIME);
                expect(typeOff).toBe(SET_OFFSET_TIME);
                expect(typeRange).toBe(RANGE_CHANGED);
                done();
            }, {
                timeline: {
                    selectedLayer: "TEST_LAYER",
                    settings: {
                        initialMode: 'range',
                        initialSnap: 'fullRange'
                    }
                },
                dimension: {
                    currentTime: "2000-01-01T00:00:00.000Z",
                    offsetTime: "2001-12-31T00:00:00.000Z",
                    data: {
                        time: {
                            TEST_LAYER: {
                                name: "time",
                                domain: "2000-01-01T00:00:00.000Z"
                            }
                        }
                    }
                },
                layers: {
                    flat: [{
                        id: 'TEST_LAYER',
                        name: 'TEST_LAYER',
                        type: 'wms',
                        visibility: true,
                        url: 'base/web/client/test-resources/wmts/DomainValues.xml',
                        dimensions: [
                            {
                                source: {
                                    type: 'multidim-extension',
                                    url: 'base/web/client/test-resources/wmts/DomainValues.xml'
                                },
                                name: 'time'
                            }
                        ],
                        params: {
                            time: '2000-06-08T00:00:00.000Z'
                        }
                    }]
                }
            });
        });
        it("setRangeOnInit on domain returned empty", (done) => {
            testEpic(setRangeOnInit, 3, initializeRange(), ([action1, action2, action3]) => {
                const { time, type } = action1;
                const { offsetTime, type: typeOff} = action2;
                const { type: typeRange } = action3;
                expect(time).toBeTruthy();
                expect(offsetTime).toBeTruthy();
                expect(type).toBe(SET_CURRENT_TIME);
                expect(typeOff).toBe(SET_OFFSET_TIME);
                expect(typeRange).toBe(RANGE_CHANGED);
                done();
            }, {
                timeline: {
                    selectedLayer: "TEST_LAYER",
                    settings: {
                        initialMode: 'range',
                        initialSnap: 'fullRange'
                    }
                },
                dimension: {
                    currentTime: "2000-01-01T00:00:00.000Z",
                    offsetTime: "2001-12-31T00:00:00.000Z",
                    data: {
                        time: {
                            TEST_LAYER: {
                                name: "time",
                                domain: ""
                            }
                        }
                    }
                },
                layers: {
                    flat: [{
                        id: 'TEST_LAYER',
                        name: 'TEST_LAYER',
                        type: 'wms',
                        visibility: true,
                        url: 'base/web/client/test-resources/wmts/DomainValues.xml',
                        dimensions: [
                            {
                                source: {
                                    type: 'multidim-extension',
                                    url: 'base/web/client/test-resources/wmts/DomainValues.xml'
                                },
                                name: 'time'
                            }
                        ],
                        params: {
                            time: '2000-06-08T00:00:00.000Z'
                        }
                    }]
                }
            });
        });
    });
    it("setRangeOnInit when the values stored are intervals", (done) => {
        testEpic(setRangeOnInit, 3, initializeRange(), ([action1, action2, action3]) => {
            try {
                const { time, type } = action1;
                const { offsetTime, type: typeOff} = action2;
                const { type: typeRange, start, end } = action3;
                expect(time).toBeTruthy();
                expect(offsetTime).toBeTruthy();
                expect(type).toBe(SET_CURRENT_TIME);
                expect(typeOff).toBe(SET_OFFSET_TIME);
                expect(typeRange).toBe(RANGE_CHANGED);
                expect(start).toBe("2001-01-01T00:00:00.000Z");
                expect(end).toBe("2001-12-31T00:00:00.000Z");
                done();
            } catch (e) {
                done(e);
            }
        }, {
            timeline: {
                selectedLayer: "TEST_LAYER",
                settings: {
                    initialMode: 'range',
                    initialSnap: 'fullRange'
                }
            },
            dimension: {
                currentTime: "2000-01-01T00:00:00.000Z",
                offsetTime: "2001-12-31T00:00:00.000Z",
                data: {
                    time: {
                        TEST_LAYER: {
                            name: "time",
                            domain: "2001-01-01T00:00:00.000Z/2001-12-31T00:00:00.000Z"
                        }
                    }
                }
            },
            layers: {
                flat: [{
                    id: 'TEST_LAYER',
                    name: 'TEST_LAYER',
                    type: 'wms',
                    visibility: true,
                    url: 'base/web/client/test-resources/wmts/DomainIntervalValues.xml',
                    dimensions: [
                        {
                            source: {
                                type: 'multidim-extension',
                                url: 'base/web/client/test-resources/wmts/DomainIntervalValues.xml'
                            },
                            name: 'time'
                        }
                    ],
                    params: {
                        time: '2000-06-08T00:00:00.000Z'
                    }
                }]
            }
        });
    });

    it("updateTimelineDataOnMapLoad", (done) =>{
        const config = {
            timelineData: {
                selectedLayer: "TEST_LAYER",
                endValuesSupport: true,
                snapRadioButtonEnabled: false
            },
            dimensionData: {
                currentTime: "2016-09-01T00:00:00.000Z"
            }
        };
        testEpic(updateTimelineDataOnMapLoad, 3, configureMap(config), ([action1, action2, action3]) => {
            expect(action1.type).toBe(INIT_SELECT_LAYER);
            expect(action1.layerId).toBe("TEST_LAYER");
            expect(action2.type).toBe(SET_END_VALUES_SUPPORT);
            expect(action2.endValuesSupport).toBe(true);
            expect(action3.type).toBe(SET_SNAP_RADIO_BUTTON_ENABLED);
            expect(action3.snapRadioButtonEnabled).toBe(false);
            done();
        }, {});
    });
    it("updateTimelineDataOnMapLoad with no dimension data", (done) =>{
        const config = {
            timelineData: {
                selectedLayer: "TEST_LAYER",
                endValuesSupport: true,
                snapRadioButtonEnabled: false
            }
        };
        testEpic(updateTimelineDataOnMapLoad, 4, configureMap(config), ([action1, action2, action3, action4]) => {
            expect(action1.type).toBe(INIT_SELECT_LAYER);
            expect(action1.layerId).toBe("TEST_LAYER");
            expect(action2.type).toBe(SET_END_VALUES_SUPPORT);
            expect(action2.endValuesSupport).toBe(true);
            expect(action3.type).toBe(SET_SNAP_RADIO_BUTTON_ENABLED);
            expect(action3.snapRadioButtonEnabled).toBe(false);
            expect(action4.type).toBe(AUTOSELECT);
            done();
        }, {});
    });
    it("onUpdateLayerDimensionData", (done) => {
        testEpic(onUpdateLayerDimensionData, 2, updateLayerDimensionData("TEST", {}, {name: "time"}), ([action1, action2]) => {
            expect(action1.type).toBe(AUTOSELECT);
            expect(action2.type).toBe(SET_END_VALUES_SUPPORT);
            expect(action2.endValuesSupport).toBe(false);
            done();
        }, {
            timeline: {}
        });
    });
    it("onUpdateLayerDimensionData on time layer selected", (done) => {
        testEpic(addTimeoutEpic(onUpdateLayerDimensionData, 10), 1, updateLayerDimensionData("TEST", {}, {name: "time"}), ([action1]) => {
            expect(action1.type).toBe('EPICTEST:TIMEOUT');
            done();
        }, {
            timeline: {
                selectedLayer: "TEST_LAYER"
            }
        });
    });
    it("onUpdateLayerDimensionData with endValuesSupport", (done) => {
        testEpic(onUpdateLayerDimensionData, 1, updateLayerDimensionData("TEST", {}, {name: "time"}), ([action1]) => {
            expect(action1.type).toBe(AUTOSELECT);
            done();
        }, {
            timeline: {
                settings: {
                    endValuesSupport: true
                }
            }
        });
    });
    describe('Timeline GuideLayer', () => {
        const doAssertion = (NUM_ACTIONS, actions, layerId) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map(action=>{
                switch (action.type) {
                case SELECT_LAYER:
                    expect(action.layerId).toBe(layerId);
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
        };
        const NUM_ACTIONS = 1;
        const STATE_TIMELINE = {
            timeline: { settings: {autoSelect: true}},
            layers: { flat: [
                {
                    id: 'TEST_LAYER',
                    name: 'TEST_LAYER',
                    type: 'wms',
                    url: 'some url',
                    dimensions: [{ source: { type: 'multidim-extension', url: 'some url'}, name: 'time'}],
                    params: { time: '2000-06-08T00:00:00.000Z' },
                    visibility: false
                },
                {
                    id: 'TEST_LAYER1',
                    name: 'TEST_LAYER1',
                    type: 'wms',
                    url: 'some url',
                    dimensions: [{ source: { type: 'multidim-extension', url: 'some url'}, name: 'time'}],
                    params: { time: '2000-06-08T00:00:00.000Z' },
                    visibility: true
                }
            ]}
        };
        it('syncTimelineGuideLayer on timeline initializes', done => {

            testEpic(syncTimelineGuideLayer, NUM_ACTIONS, [autoselect()], (actions) => {
                doAssertion(NUM_ACTIONS, actions, 'TEST_LAYER');
                done();
            }, {...STATE_TIMELINE, layers: { ...STATE_TIMELINE.layers,
                flat: [{...STATE_TIMELINE.layers.flat[0], visibility: true}]
            }});
        });
        it('syncTimelineGuideLayer on showHiddenLayers', done => {
            testEpic(syncTimelineGuideLayer, NUM_ACTIONS, [selectLayer('TEST_LAYER2'), removeNode('TEST_LAYER1', 'layers') ], (actions) => {
                doAssertion(NUM_ACTIONS, actions, 'TEST_LAYER');
                done();
            }, {...STATE_TIMELINE, timeline: { settings: {autoSelect: true, showHiddenLayers: true}}});
        });
        it('syncTimelineGuideLayer retain selection', done => {
            testEpic(addTimeoutEpic(syncTimelineGuideLayer, 500), NUM_ACTIONS, [selectLayer('TEST_LAYER1'), removeNode('TEST_LAYER1', 'layers') ], ([action]) => {
                expect(action.type).toBe(TEST_TIMEOUT); // Don't update selection when selected layer in timeline present
                done();
            }, {...STATE_TIMELINE, timeline: { settings: {autoSelect: true, showHiddenLayers: true}}});
        });
        it('snapTimeGuideLayer', done => {
            testEpic(snapTimeGuideLayer, NUM_ACTIONS, [selectLayer('TEST_LAYER')], ([action]) => {
                expect(action.type).toBe(SET_CURRENT_TIME);
                done();
            }, {...STATE_TIMELINE, timeline: { settings: {autoSelect: true, showHiddenLayers: true}}});
        });
        it('snapTimeGuideLayer when autoselect disabled', done => {
            testEpic(addTimeoutEpic(snapTimeGuideLayer, 500), NUM_ACTIONS, [selectLayer('TEST_LAYER')], ([action]) => {
                expect(action.type).toBe(TEST_TIMEOUT); // Don't trigger a snap time when snap to guide layer settings is turned off
                done();
            }, {...STATE_TIMELINE, timeline: { settings: {autoSelect: false}}});
        });
        it('snapTimeGuideLayer when initialize select layer', done => {
            testEpic(snapTimeGuideLayer, NUM_ACTIONS, [initializeSelectLayer('TEST_LAYER')], ([action]) => {
                expect(action.type).toBe(SET_CURRENT_TIME);
                done();
            }, {...STATE_TIMELINE, timeline: { settings: {autoSelect: true, showHiddenLayers: true}}});
        });
    });
    describe('updateRangeDataOnRangeChange', () => {
        const DOMAIN_VALUES_URL = 'base/web/client/test-resources/wmts/DomainValues.xml';
        // sample initial state to test data range update
        const STATE_UPDATE_DATA_RANGE = {
            timeline: {
                selectedLayer: "TEST_LAYER",
                range: {
                    start: "2000-01-01T00:00:00.000Z",
                    end: "2001-12-31T00:00:00.000Z"
                }
            },
            dimension: {
                data: {
                    time: {
                        TEST_LAYER: {
                            source: {
                                type: 'multidim-extension',
                                url: DOMAIN_VALUES_URL
                            },
                            name: "time",
                            domain: "2000-03-01T00:00:00.000Z--2000-06-08T00:00:00.000Z"

                        }
                    }
                }
            },
            layers: {
                flat: [{
                    id: 'TEST_LAYER',
                    name: 'TEST_LAYER',
                    type: 'wms',
                    url: DOMAIN_VALUES_URL,
                    dimensions: [
                        {
                            source: {
                                type: 'multidim-extension',
                                url: DOMAIN_VALUES_URL
                            },
                            name: 'time'
                        }
                    ],
                    params: {
                        time: '2000-06-08T00:00:00.000Z'
                    }
                }]
            }
        };
        const MAP_STATE = {
            present: {
                bbox: {
                    bounds: {
                        minx: -20,
                        miny: -20,
                        maxx: 20,
                        maxy: 20
                    },
                    crs: "EPSG:4326"
                }
            }
        };
        const TIME_MAP_STATE = set('map', MAP_STATE, STATE_UPDATE_DATA_RANGE);
        const MAPSYNC_ON_1_0_STATE = compose(
            set('timeline.settings.mapSync', true),
            set('dimension.data.time.TEST_LAYER.space.domain.CRS', "EPSG:4326")
        )(TIME_MAP_STATE);
        const MAPSYNC_1_1_STATE = set('dimension.data.time.TEST_LAYER.source.version', "1.1", TIME_MAP_STATE);
        const MAPSYNC_ON_STATE = set('timeline.settings.mapSync', true, MAPSYNC_1_1_STATE);
        const MAPSYNC_OFF_STATE = set('timeline.settings.mapSync', false, MAPSYNC_1_1_STATE);

        it('updateRangeDataOnRangeChange', done => {
            testEpic(updateRangeDataOnRangeChange, 4, updateLayerDimensionData(), ([action1, action2, action3, action4]) => {
                const { type: startType } = action1;
                const { type: range1Type, range } = action2;
                const { type: range2Type } = action3;
                const { type: endType } = action4;
                // first action moves the current timeline view to center the current time
                expect(startType).toBe(LOADING);
                expect(endType).toBe(LOADING);
                // in this case loading fixed file of domain values causes double trigger of range data loaded with domain
                // in real world the 2nd response is histogram. TODO: test also histogram
                expect(range1Type).toBe(RANGE_DATA_LOADED);
                expect(range2Type).toBe(RANGE_DATA_LOADED);
                expect(range.start).toBe("2000-01-01T00:00:00.000Z");
                expect(range.end).toBe("2001-12-31T00:00:00.000Z");
                done();
            }, STATE_UPDATE_DATA_RANGE);
        });
        it('mapSync on WMTS Multidim 1.0 version', done => {
            testEpic(updateRangeDataOnRangeChange, 4, changeMapView(), ([action1, action2, action3, action4]) => {
                const { type: startType } = action1;
                const { type: range1Type, range } = action2;
                const { type: range2Type } = action3;
                const { type: endType } = action4;
                // first action moves the current timeline view to center the current time
                expect(startType).toBe(LOADING);
                expect(endType).toBe(LOADING);
                // in this case loading fixed file of domain values causes double trigger of range data loaded with domain
                // in real world the 2nd response is histogram. TODO: test also histogram
                expect(range1Type).toBe(RANGE_DATA_LOADED);
                expect(range2Type).toBe(RANGE_DATA_LOADED);
                expect(range.start).toBe("2000-01-01T00:00:00.000Z");
                expect(range.end).toBe("2001-12-31T00:00:00.000Z");
                done();
            }, MAPSYNC_ON_1_0_STATE);
        });
        it('mapSync on WMTS Multidim 1.1 version', done => {
            testEpic(updateRangeDataOnRangeChange, 4, changeMapView(), ([action1, action2, action3, action4]) => {
                const { type: startType } = action1;
                const { type: range1Type, range } = action2;
                const { type: range2Type } = action3;
                const { type: endType } = action4;
                // first action moves the current timeline view to center the current time
                expect(startType).toBe(LOADING);
                expect(endType).toBe(LOADING);
                // in this case loading fixed file of domain values causes double trigger of range data loaded with domain
                // in real world the 2nd response is histogram. TODO: test also histogram
                expect(range1Type).toBe(RANGE_DATA_LOADED);
                expect(range2Type).toBe(RANGE_DATA_LOADED);
                expect(range.start).toBe("2000-01-01T00:00:00.000Z");
                expect(range.end).toBe("2001-12-31T00:00:00.000Z");
                done();
            }, MAPSYNC_ON_STATE);
        });
        it('mapSync off', done => {
            // tests with mapsync on take around 400 ms to run, so this have to be set with a bigger time
            // TODO: use mock-axios or other tools to speed up these tests
            testEpic(addTimeoutEpic(updateRangeDataOnRangeChange, 500), 1, changeMapView(), ([action1]) => {
                // when off, it should not update
                expect(action1.type).toBe(TEST_TIMEOUT);
                done();
            }, MAPSYNC_OFF_STATE);
        });
        it('mapSync off via action should trigger update range', done => {
            // tests with mapsync on take around 400 ms to run, so this have to be set with a bigger time
            // TODO: use mock-axios or other tools to speed up these tests
            testEpic(addTimeoutEpic(updateRangeDataOnRangeChange, 500), 4, setMapSync(false), ([action1, action2, action3, action4]) => {
                const { type: startType } = action1;
                const { type: range1Type, range } = action2;
                const { type: range2Type } = action3;
                const { type: endType } = action4;
                // first action moves the current timeline view to center the current time
                expect(startType).toBe(LOADING);
                expect(endType).toBe(LOADING);
                // in this case loading fixed file of domain values causes double trigger of range data loaded with domain
                // in real world the 2nd response is histogram. TODO: test also histogram
                expect(range1Type).toBe(RANGE_DATA_LOADED);
                expect(range2Type).toBe(RANGE_DATA_LOADED);
                expect(range.start).toBe("2000-01-01T00:00:00.000Z");
                expect(range.end).toBe("2001-12-31T00:00:00.000Z");
                done();
            }, MAPSYNC_OFF_STATE);
        });
        describe('fixed domain values', () => {
            const MAPSYNC_ON_DOMAIN_VALUES_STATE = set('dimension.data.time.TEST_LAYER.domain',
                "2000-03-01T00:00:00.000Z,2000-06-08T00:00:00.000Z"
                , MAPSYNC_ON_STATE);
            const MAPSYNC_OFF_DOMAIN_VALUES_STATE = set('timeline.settings.mapSync', false, MAPSYNC_ON_DOMAIN_VALUES_STATE);
            it('mapSync on downloaded domain values', done => {
                testEpic(updateRangeDataOnRangeChange, 4, changeMapView(), ([action1, action2, action3, action4]) => {
                    const { type: startType } = action1;
                    const { type: range1Type, range } = action2;
                    const { type: range2Type } = action3;
                    const { type: endType } = action4;
                    // first action moves the current timeline view to center the current time
                    expect(startType).toBe(LOADING);
                    expect(endType).toBe(LOADING);
                    // in this case loading fixed file of domain values causes double trigger of range data loaded with domain
                    // in real world the 2nd response is histogram. TODO: test also histogram
                    expect(range1Type).toBe(RANGE_DATA_LOADED);
                    expect(range2Type).toBe(RANGE_DATA_LOADED);
                    expect(range.start).toBe("2000-01-01T00:00:00.000Z");
                    expect(range.end).toBe("2001-12-31T00:00:00.000Z");
                    done();
                }, MAPSYNC_ON_DOMAIN_VALUES_STATE);
            });
            it('mapSync off downloaded domain values', done => {
                testEpic(addTimeoutEpic(updateRangeDataOnRangeChange, 500), 1, changeMapView(), ([action1]) => {
                    expect(action1.type).toBe(TEST_TIMEOUT);
                    done();
                }, MAPSYNC_OFF_DOMAIN_VALUES_STATE);
            });
        });
    });
    describe('setTimeLayersSetting', () => {
        const NUM_ACTION = 1;
        const STATE_TIMELINE = {
            timeline: { settings: {autoSelect: true}},
            layers: {
                flat: [
                    {
                        id: 'TEST_LAYER',
                        name: 'TEST_LAYER',
                        type: 'wms',
                        url: 'some url',
                        dimensions: [{ source: { type: 'multidim-extension', url: 'some url'}, name: 'time'}],
                        params: { time: '2000-06-08T00:00:00.000Z' },
                        visibility: true
                    },
                    {
                        id: 'TEST_LAYER1',
                        name: 'TEST_LAYER1',
                        type: 'wms',
                        url: 'some url',
                        dimensions: [{ source: { type: 'multidim-extension', url: 'some url'}, name: 'time'}],
                        params: { time: '2000-06-08T00:00:00.000Z' },
                        visibility: true
                    }
                ]
            }
        };
        it('setTimeLayersSetting on initialize timeline', done => {
            testEpic(setTimeLayersSetting, NUM_ACTION, initTimeline({showHiddenLayers: false}), ([action]) => {
                expect(action.type).toBe(SET_TIME_LAYERS);
                expect(action.layers).toBeTruthy();
                expect(action.layers.length).toBe(2);
                done();
            }, {...STATE_TIMELINE});
        });
        it('setTimeLayersSetting on map config load', done => {
            testEpic(addTimeoutEpic(setTimeLayersSetting), NUM_ACTION, initTimeline({showHiddenLayers: false}), ([action]) => {
                expect(action.type).toBe(TEST_TIMEOUT);
                done();
            }, {...STATE_TIMELINE, timeline: {...STATE_TIMELINE.timeline, layers: [{id: "TEST_1", title: "TEST_1", checked: true}]}});
        });
        it('setTimeLayersSetting on layer remove', done => {
            testEpic(setTimeLayersSetting, NUM_ACTION, removeNode('TEST_LAYER1', 'layers'), ([action]) => {
                expect(action.type).toBe(SET_TIME_LAYERS);
                expect(action.layers).toBeTruthy();
                expect(action.layers.length).toBe(1);
                done();
            }, {...STATE_TIMELINE, layers: {flat: [STATE_TIMELINE.layers.flat[0]]} });
        });
        it('setTimeLayersSetting on change layer property', done => {
            testEpic(setTimeLayersSetting, NUM_ACTION, changeLayerProperties('TEST_LAYER1', {visibility: false}), ([action]) => {
                expect(action.type).toBe(SET_TIME_LAYERS);
                expect(action.layers).toBeTruthy();
                expect(action.layers.length).toBe(1);
                done();
            }, {...STATE_TIMELINE, layers: {flat: [STATE_TIMELINE.layers.flat[0], {
                ...STATE_TIMELINE.layers.flat[1],
                visibility: false
            }]} });
        });
        it('setTimeLayersSetting on update layer setting', done => {
            const LAYER_ID = 'TEST_LAYER';
            testEpic(setTimeLayersSetting, NUM_ACTION, removeNode('TEST_LAYER1', 'layers'), ([action]) => {
                expect(action.type).toBe(SET_TIME_LAYERS);
                expect(action.layers).toBeTruthy();
                expect(action.layers.length).toBe(1);
                expect(action.layers[0][LAYER_ID]).toBeTruthy();
                expect(action.layers[0][LAYER_ID].hideInTimeline).toBe(false);
                done();
            }, {...STATE_TIMELINE, layers: {
                flat: [STATE_TIMELINE.layers.flat[0]]},
            timeline: { ...STATE_TIMELINE.timeline, layers: [{[LAYER_ID]: { hideInTimeline: true}}]}
            });
        });
    });

});
