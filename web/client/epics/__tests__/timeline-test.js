/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/


const expect = require('expect');
const moment = require('moment');
const { testEpic } = require('./epicTestUtils');
const { setTimelineCurrentTime, updateRangeDataOnRangeChange, settingInitialOffsetValue } = require('../timeline');
const { selectTime, LOADING, RANGE_DATA_LOADED, RANGE_CHANGED, enableOffset} = require('../../actions/timeline');
const { SET_CURRENT_TIME, SET_OFFSET_TIME, updateLayerDimensionData } = require('../../actions/dimension');

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
        }, {
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
                                    url: 'base/web/client/test-resources/wmts/DomainValues.xml'
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
