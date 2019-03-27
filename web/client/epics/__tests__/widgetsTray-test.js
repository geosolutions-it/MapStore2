/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const { testEpic, TEST_TIMEOUT, addTimeoutEpic } = require('./epicTestUtils');
const { configureMap } = require('../../actions/config');

const { updateLayerDimensionData } = require('../../actions/dimension');
const { changeLayerProperties } = require('../../actions/layers');
const { SHOW_NOTIFICATION } = require('../../actions/notifications');
const { rangeDataLoaded, setCollapsed, SET_COLLAPSED } = require('../../actions/timeline');
const { deleteWidget, insertWidget, toggleCollapseAll, updateWidgetProperty, TOGGLE_COLLAPSE_ALL } = require('../../actions/widgets');

const timeline = require('../../reducers/timeline');
const dimension = require('../../reducers/dimension');
const widgets = require('../../reducers/widgets');
// TEST DATA
const T1 = '2016-01-01T00:00:00.000Z';
const T2 = '2016-02-01T00:00:00.000Z';
const TEST_LAYER_ID = "TEST_LAYER";
const SAMPLE_RANGE = {
    start: T1,
    end: T2
};

const TIME_DIMENSION_DATA = {
    source: {
        type: "multidim-extension",
        url: "FAKE"
    },
    name: "time",
    dimension: `${T1}--${T2}`
};

// sample timeline state with histogram
const TIMELINE_STATE_VALUES = timeline(undefined, rangeDataLoaded(
    TEST_LAYER_ID,
    SAMPLE_RANGE,
    // sample with daily histogram of values 1,2,3,..., 31
    {
        values: Array(31).fill().map((x, i) => i),
        domain: `${T1}/${T2}/1D`
    },
    { values: [T1] }
));

// sample dimension state for TEST_LAYER
const DIMENSION_STATE = dimension(undefined, updateLayerDimensionData(TEST_LAYER_ID, "time", TIME_DIMENSION_DATA));

const LAYERS_NO_TIME_STATE = {
    flat: [{
        id: TEST_LAYER_ID
    }]
};

const LAYERS_WITH_TIME = {
    flat: [{
        id: TEST_LAYER_ID,
        dimensions: [TIME_DIMENSION_DATA]
    }]
};

// SAMPLE STATE WITH TIMELINE SHOWING
const SAMPLE_TIMELINE_STATE = {
    layers: LAYERS_WITH_TIME,
    dimension: DIMENSION_STATE,
    timeline: TIMELINE_STATE_VALUES
};
// SAMPLE STATE WITH TIMELINE COLLAPSED
const SAMPLE_COLLAPSED_TIMELINE_STATE = {
    ...SAMPLE_TIMELINE_STATE,
    timeline: timeline(SAMPLE_TIMELINE_STATE, setCollapsed(true))
};
// SAMPLE STATE WITH NO TIMELINE (NO TIME DATA)
const NO_TIMELINE_STATE = {
    layers: LAYERS_NO_TIME_STATE,
    dimension: DIMENSION_STATE,
    timeline: TIMELINE_STATE_VALUES
};
const WIDGETS_STATE = {
    widgets: widgets(undefined, insertWidget({id: "TEST"}))
};
const NO_WIDGETS_STATE = {
    widgets: widgets(undefined, { type: "DUMMY" })
};

// EPICS TO TEST
const {
    collapseTimelineOnWidgetsEvents,
    collapseWidgetsOnTimelineEvents,
    expandTimelineIfCollapsedOnTrayUnmount
} = require('../widgetsTray');


describe('widgetsTray epics', () => {
    describe('collapseTimelineOnWidgetsEvents', () => {
        it('collapse timeline on widget add', done => {
            testEpic(collapseTimelineOnWidgetsEvents, 2, [insertWidget({ id: "TEST" })], ([a0, a1]) => {
                expect(a0.type).toBe(SHOW_NOTIFICATION);
                expect(a1.type).toBe(SET_COLLAPSED);
                expect(a1.collapsed).toBe(true);
                done();
            }, {
                ...SAMPLE_TIMELINE_STATE,
                ...WIDGETS_STATE
            });
        });
        it('collapse timeline on expand', done => {
            testEpic(collapseTimelineOnWidgetsEvents, 2, [toggleCollapseAll()], ([a0, a1]) => {
                expect(a0.type).toBe(SHOW_NOTIFICATION);
                expect(a1.type).toBe(SET_COLLAPSED);
                expect(a1.collapsed).toBe(true);
                done();
            }, {
                ...SAMPLE_TIMELINE_STATE,
                ...WIDGETS_STATE
            });
        });
        it('notification triggered once', done => {
            testEpic(addTimeoutEpic(collapseTimelineOnWidgetsEvents, 10), 4, [toggleCollapseAll(), toggleCollapseAll()], ([a0, a1, a2, a3]) => {
                expect(a0.type).toBe(SHOW_NOTIFICATION);
                expect(a1.type).toBe(SET_COLLAPSED);
                expect(a1.collapsed).toBe(true);
                expect(a2.type).toBe(SET_COLLAPSED);
                expect(a2.collapsed).toBe(true);
                expect(a3.type).toBe(TEST_TIMEOUT);
                done();
            }, {
                ...SAMPLE_TIMELINE_STATE,
                ...WIDGETS_STATE
            });
        });
        it('timeline not collapsed if widgets are not on map', done => {
            testEpic(addTimeoutEpic(collapseTimelineOnWidgetsEvents, 10), 1, [toggleCollapseAll()], ([a0]) => {
                expect(a0.type).toBe(TEST_TIMEOUT);
                done();
            }, {
                ...SAMPLE_TIMELINE_STATE,
                ...NO_WIDGETS_STATE
            });
        });
        it('timeline if not collapsed if are all static (pinned)', done => {
            testEpic(addTimeoutEpic(collapseTimelineOnWidgetsEvents, 10), 1, [updateWidgetProperty("TEST", "dataGrid.static", true)], ([a0]) => {
                expect(a0.type).toBe(TEST_TIMEOUT);
                done();
            }, {
                ...SAMPLE_TIMELINE_STATE,
                widgets: widgets(WIDGETS_STATE.widgets, updateWidgetProperty("TEST", "dataGrid.static", true))
            });
        });
    });
    describe('collapseWidgetsOnTimelineEvents', () => {
        it('collapse widgets on timeline expand', done => {
            testEpic(collapseWidgetsOnTimelineEvents, 2, [setCollapsed(false)], ([a0, a1]) => {
                expect(a0.type).toBe(SHOW_NOTIFICATION);
                expect(a1.type).toBe(TOGGLE_COLLAPSE_ALL);
                done();
            }, {
                ...SAMPLE_TIMELINE_STATE,
                ...WIDGETS_STATE
            });
        });
        it('collapse widgets on timeline layer dimension set', done => { // AKA new layer with time dimension
            testEpic(collapseWidgetsOnTimelineEvents, 2, [changeLayerProperties("TEST", {dimensions: [{name: "time"}]})], ([a0, a1]) => {
                expect(a0.type).toBe(SHOW_NOTIFICATION);
                expect(a1.type).toBe(TOGGLE_COLLAPSE_ALL);
                done();
            }, {
                ...SAMPLE_TIMELINE_STATE,
                ...WIDGETS_STATE
            });
        });
        it('notification triggered once', done => {
            testEpic(addTimeoutEpic(collapseWidgetsOnTimelineEvents, 10), 4, [setCollapsed(false), setCollapsed(false)], ([a0, a1, a2, a3]) => {
                expect(a0.type).toBe(SHOW_NOTIFICATION);
                expect(a1.type).toBe(TOGGLE_COLLAPSE_ALL);
                expect(a2.type).toBe(TOGGLE_COLLAPSE_ALL);
                expect(a3.type).toBe(TEST_TIMEOUT);
                done();
            }, {
                ...SAMPLE_TIMELINE_STATE,
                ...WIDGETS_STATE
            });
        });

        it('check widgets not collapsed if timeline is not present', done => {
            testEpic(addTimeoutEpic(collapseWidgetsOnTimelineEvents, 10), 1, [setCollapsed(false)], ([a0]) => {
                expect(a0.type).toBe(TEST_TIMEOUT);
                done();
            }, {
                ...NO_TIMELINE_STATE,
                ...WIDGETS_STATE
            });
        });
        it('check not trigger collapse if only pinned widgets', done => {
            testEpic(addTimeoutEpic(collapseWidgetsOnTimelineEvents, 10), 1, [setCollapsed(false)], ([a0]) => {
                expect(a0.type).toBe(TEST_TIMEOUT);
                done();
            }, {
                ...SAMPLE_TIMELINE_STATE,
                widgets: widgets(WIDGETS_STATE.widgets, updateWidgetProperty("TEST", "dataGrid.static", true))
            });
        });
    });
    describe('expandTimelineIfCollapsedOnTrayUnmount', () => {
        /*
         * when widgets are not present or all static, the WidgetsTray is not visible anymore.
         * So the timeline have to be expanded or it will not be visible anymore
         */
        it('timeline expanded if are widgets become are static', done => {
            testEpic(expandTimelineIfCollapsedOnTrayUnmount, 1, [updateWidgetProperty("TEST", "dataGrid.static", true)], ([a0]) => {
                expect(a0.type).toBe(SET_COLLAPSED);
                expect(a0.collapsed).toBe(false);
                done();
            }, {
                ...SAMPLE_COLLAPSED_TIMELINE_STATE,
                widgets: widgets(WIDGETS_STATE.widgets, updateWidgetProperty("TEST", "dataGrid.static", true))
            });
        });
        it('timeline expanded if no widgets anymore', done => {
            testEpic(expandTimelineIfCollapsedOnTrayUnmount, 1, [deleteWidget("TEST")], ([a0]) => {
                expect(a0.type).toBe(SET_COLLAPSED);
                expect(a0.collapsed).toBe(false);
                done();
            }, {
                ...SAMPLE_COLLAPSED_TIMELINE_STATE,
                NO_WIDGETS_STATE
            });
        });
        it('timeline expanded on map config loaded, if collapsed but it should be present and no widgets are on map', done => {
            testEpic(expandTimelineIfCollapsedOnTrayUnmount, 1, [configureMap("TEST")], ([a0]) => {
                expect(a0.type).toBe(SET_COLLAPSED);
                expect(a0.collapsed).toBe(false);
                done();
            }, {
                ...SAMPLE_COLLAPSED_TIMELINE_STATE,
                NO_WIDGETS_STATE
            });
        });
        it('no effect if timeline is not collapsed', done => {
            testEpic(addTimeoutEpic(expandTimelineIfCollapsedOnTrayUnmount, 10), 1, [configureMap("TEST")], ([a0]) => {
                expect(a0.type).toBe(TEST_TIMEOUT);
                done();
            }, {
                ...SAMPLE_TIMELINE_STATE, // collapsed: false
                NO_WIDGETS_STATE
            });
        });

    });
});
