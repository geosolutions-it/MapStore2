/*
* Copyright 2019, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {
    isCollapsed,
    hasLayers,
    isVisible,
    isAutoSelectEnabled,
    currentTimeRangeSelector,
    itemsSelector,
    rangeDataSelector,
    multidimOptionsSelectorCreator
} = require('../timeline');
const { set, compose } = require('../../utils/ImmutableUtils');

const timeline = require('../../reducers/timeline');
const { rangeDataLoaded } = require('../../actions/timeline');
const dimension = require('../../reducers/dimension');
const { updateLayerDimensionData } = require('../../actions/dimension');

const T1 = '2016-01-01T00:00:00.000Z';
const T2 = '2016-02-01T00:00:00.000Z';
const T3 = '2016-03-01T00:00:00.000Z';
const TEST_LAYER_ID = "TEST_LAYER";

const DIMENSION_SINGLE = {
    currentTime: T1
};
const DIMENSION_RANGE = {
    ...DIMENSION_SINGLE,
    offsetTime: T2
};

const SAMPLE_RANGE = {
    start: DIMENSION_SINGLE.currentTime,
    end: DIMENSION_RANGE.offsetTime
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
const TIMELINE_STATE_HISTOGRAM = timeline(undefined, rangeDataLoaded(
    TEST_LAYER_ID,
    SAMPLE_RANGE,
    {
        values: Array(31).fill().map((x, i) => i),
        domain: `${DIMENSION_RANGE.offsetTime}/${DIMENSION_RANGE.currentTime}/1D`
    },
    undefined
));
// sample timeline state with histogram
const TIMELINE_STATE_VALUES = timeline(undefined, rangeDataLoaded(
    TEST_LAYER_ID,
    SAMPLE_RANGE,
    // sample with daily histogram of values 1,2,3,..., 31
    {
        values: Array(31).fill().map((x, i) => i),
        domain: `${DIMENSION_RANGE.offsetTime}/${DIMENSION_RANGE.currentTime}/1D`
    },
    { values: [T1, T2, T3] }
));

// sample dimension state for TEST_LAYER
const DIMENSION_STATE = dimension(undefined, updateLayerDimensionData(TEST_LAYER_ID, "time", TIME_DIMENSION_DATA));

const LAYERS_STATE = {
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
const SAMPLE_STATE_HISTOGRAM = {
    layers: LAYERS_STATE,
    dimension: DIMENSION_STATE,
    timeline: TIMELINE_STATE_HISTOGRAM
};

const SAMPLE_STATE_DOMAIN_VALUES = {
    layers: LAYERS_STATE,
    dimension: DIMENSION_STATE,
    timeline: TIMELINE_STATE_VALUES
};

describe('timeline selector', () => {
    it('isCollapsed', () => {
        expect(isCollapsed({})).toBeFalsy();
        expect(isCollapsed({ timeline: { settings: {} } })).toBeFalsy();
        expect(isCollapsed({ timeline: { settings: { collapsed: true } } })).toBe(true);
    });
    it('hasLayers', () => {
        expect(hasLayers({})).toBe(false);
        expect(hasLayers({ timeline: TIMELINE_STATE_VALUES, layers: LAYERS_WITH_TIME, dimension: DIMENSION_STATE })).toBe(true);
    });
    it('isVisible', () => {
        expect(isVisible({})).toBe(false);
        expect(isVisible({ timeline: { settings: {} } })).toBe(false);
        // collapsed, no time data
        expect(isVisible({ timeline: { settings: { collapsed: true } } })).toBe(false);
        // not collapsed, with time data
        expect(isVisible({ timeline: { ...TIMELINE_STATE_VALUES, settings: { collapsed: false }}, layers: LAYERS_WITH_TIME })).toBe(true);
        // collapsed with time data
        expect(isVisible({ timeline: { ...TIMELINE_STATE_VALUES, settings: { collapsed: true }}, layers: LAYERS_WITH_TIME })).toBe(false);
    });
    it('isAutoSelectEnabled', () => {
        expect(isAutoSelectEnabled({})).toBeFalsy();
        expect(isAutoSelectEnabled({ timeline: { settings: {} } })).toBeFalsy();
        expect(isAutoSelectEnabled({ timeline: { settings: { autoSelect: true } } })).toBe(true);
    });
    it('currentTimeRangeSelector', () => {
        expect(currentTimeRangeSelector({
            dimension: DIMENSION_RANGE
        })).toEqual(SAMPLE_RANGE);
    });
    it('rangeSelector', () => {
        expect(rangeDataSelector(SAMPLE_STATE_HISTOGRAM)[TEST_LAYER_ID]).toExist();
    });
    it('itemsSelector', () => {
        const histogramItems = itemsSelector(SAMPLE_STATE_HISTOGRAM);
        expect(histogramItems.length).toBe(31);
        // test histogram items generation
        histogramItems.map( (item, index) => {
            expect(item.type).toBe("range");
            expect(item.count).toBe(index);
            expect(item.group).toBe(TEST_LAYER_ID);
            expect(item.className).toBe('histogram-item');
            // create a div with height as value % of max, with value written inside it.
            expect(item.content).toEqual(`<div><div class="histogram-box" style="height: ${(100 * item.count / 30)}%"></div> <span class="histogram-count">${item.count}</span></div>`);
        });
        const domainValuesItems = itemsSelector(SAMPLE_STATE_DOMAIN_VALUES);
        expect(domainValuesItems.length).toBe(3);
        // test domain values items generation
        domainValuesItems.map((item) => {
            expect(item.type).toBe("point");
            expect(item.group).toBe(TEST_LAYER_ID);
            expect(item.start).toExist();
            expect(item.end).toEqual(item.start);
            expect(item.count).toNotExist();
            expect(item.className).toNotExist();
            expect(item.content).toBe(" ");
        });
        // TODO: test items from static time values inside layer, not fully supported yet.
    });
    describe('multidimOptionsSelectorCreator', () => {
        const STATE_WITH_MAP = {
            ...SAMPLE_STATE_DOMAIN_VALUES,
            map: {

                present: {
                    projection: "EPSG:4326",
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
            }
        };

        it('mapSync on, v 1.0 - no space dimension', () => {
            const opts = multidimOptionsSelectorCreator(TEST_LAYER_ID)(set(
                'timeline.settings.mapSync', true
            )(STATE_WITH_MAP));
            expect(opts).toEqual({});
        });
        it('mapSync on v 1.0 - with space dimension', () => {
            const opts = multidimOptionsSelectorCreator(TEST_LAYER_ID)(
                compose(
                    set('timeline.settings.mapSync', true),
                    set(`dimension.data.space.${TEST_LAYER_ID}.domain.CRS`, "EPSG:4326")
                )(STATE_WITH_MAP));
            // CRS may be ignored, bbox referred to tileMatrixSet
            expect(opts).toEqual({ bbox: '-20,-20,20,20', crs: 'EPSG:4326' });
        });
        it('mapSync on v 1.1', () => {
            const opts = multidimOptionsSelectorCreator(TEST_LAYER_ID)(
                compose(
                    set('timeline.settings.mapSync', true),
                    set(`dimension.data.time.${TEST_LAYER_ID}.source.version`, "1.1")
                )(STATE_WITH_MAP));
            expect(opts).toEqual({ bbox: '-20,-20,20,20,EPSG:4326' });
        });
        it('mapSync off', () => {
            const opts = multidimOptionsSelectorCreator(TEST_LAYER_ID)(STATE_WITH_MAP);
            expect(opts).toEqual({});
        });
    });

});
