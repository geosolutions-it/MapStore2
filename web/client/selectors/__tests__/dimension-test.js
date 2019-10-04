/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const dimension = require('../../reducers/dimension');
const { updateLayerDimensionData } = require('../../actions/dimension');

const { layerDimensionRangeSelector, layerDimensionSelectorCreator, layerTimeSequenceSelectorCreator } = require('../dimension');

describe('Test dimension selectors', () => {
    it('currentTimeRangeSelector', () => {
        const state = {
            dimension: {
                data: {
                    time: {
                        'TEST_LAYER': {
                            source: { // describes the source of dimension
                                type: 'multidim-extension',
                                url: 'http://domain.com:80/geoserver/wms'
                            },
                            name: 'time',
                            domain: '2016-09-01T00:00:00.000Z--2017-04-11T00:00:00.000Z'
                        }
                    }
                }
            }
        };
        const layerDim = layerDimensionRangeSelector(state, "TEST_LAYER");
        expect(layerDim.start).toBe('2016-09-01T00:00:00.000Z');
        expect(layerDim.end).toBe('2017-04-11T00:00:00.000Z');
    });
    it('layerDimensionSelectorCreator', () => {
        const TEST_DATA = {
            source: { // describes the source of dimension
                type: 'multidim-extension',
                url: 'http://domain.com:80/geoserver/wms'
            },
            name: 'time',
            domain: '2016-09-01T00:00:00.000Z--2017-04-11T00:00:00.000Z'
        };
        const state = {
            dimension: dimension({}, updateLayerDimensionData("TEST_LAYER", "time", TEST_DATA ))
        };
        const layerDim = layerDimensionSelectorCreator({id: 'TEST_LAYER'}, "time")(state);
        expect(layerDim).toBe(TEST_DATA);
    });
    it('currentTimeRangeSelector with list', () => {
        const state = {
            dimension: {
                data: {
                    time: {
                        'TEST_LAYER': {
                            source: { // describes the source of dimension
                                type: 'multidim-extension',
                                url: 'http://domain.com:80/geoserver/wms'
                            },
                            name: 'time',
                            domain: '2016-09-01T00:00:00.000Z,2017-04-11T00:00:00.000Z'
                        }
                    }
                }
            }
        };
        const layerDim = layerDimensionRangeSelector(state, "TEST_LAYER");
        expect(layerDim.start).toBe('2016-09-01T00:00:00.000Z');
        expect(layerDim.end).toBe('2017-04-11T00:00:00.000Z');
    });
    it('currentTimeRangeSelector with single value', () => {
        const state = {
            dimension: {
                data: {
                    time: {
                        'TEST_LAYER': {
                            source: { // describes the source of dimension
                                type: 'multidim-extension',
                                url: 'http://domain.com:80/geoserver/wms'
                            },
                            name: 'time',
                            domain: '2016-09-01T00:00:00.000Z'
                        }
                    }
                }
            }
        };
        const layerDim = layerDimensionRangeSelector(state, "TEST_LAYER");
        expect(layerDim.start).toBe('2016-09-01T00:00:00.000Z');
        expect(layerDim.end).toBe('2016-09-01T00:00:00.000Z');
    });

    it('layerTimeSequenceSelectorCreator local values', () => {
        const state = {

        };
        const layerDim = layerTimeSequenceSelectorCreator({
            id: "TEST_LAYER",
            dimensions: [{
                name: "time",
                values: ['2016-09-01T00:00:00.000Z']
            }]
        })(state);
        expect(layerDim.length).toBe(1);
        expect(layerDim[0]).toBe('2016-09-01T00:00:00.000Z');
    });
});
