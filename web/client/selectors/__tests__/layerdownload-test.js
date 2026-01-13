/**
* Copyright 2025, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';

import {
    downloadLayerSelector,
    wfsFilterSelector
} from '../layerdownload';


describe('Test layers selectors', () => {
    it('test downloadLayerSelector', () => {
        let layer = downloadLayerSelector({layerdownload: {downloadLayer: {id: "ws:layer_1"}}});
        expect(layer).toExist();
        expect(layer).toEqual({id: "ws:layer_1"});
    });
    const filterObj = {featureTypeName: "test"};
    describe('test wfsFilterSelector', () => {
        it('featureGridOpen true, wfsFilter valid', () => {
            let result = wfsFilterSelector({
                featuregrid: {open: true},
                query: {filterObj}
            });
            expect(result).toExist();
            expect(result).toEqual(filterObj);
        });
        it('featureGridOpen true, wfsFilter not valid', () => {
            let result = wfsFilterSelector({
                featuregrid: {open: true},
                layerdownload: {downloadLayer: {widgetId: "id", name: "name"}},
                widgets: {containers: {floating: {widgets: [{id: "id", widgetType: "table", filter: filterObj}]}}}
            });
            expect(result).toExist();
            expect(result).toEqual(filterObj);
        });
        it('featureGridOpen false, downloadLayer', () => {
            let result = wfsFilterSelector({
                featuregrid: {open: false},
                layerdownload: {downloadLayer: {widgetId: "id", name: "name"}},
                widgets: {containers: {floating: {widgets: [{id: "id", widgetType: "table", filter: filterObj}]}}}
            });
            expect(result).toExist();
            expect(result).toEqual(filterObj);
        });
        it('featureGridOpen false, no filter added using default filterObj', () => {
            let result = wfsFilterSelector({
                featuregrid: {open: false},
                layerdownload: {downloadLayer: {widgetId: "id", name: "name"}},
                widgets: {containers: {floating: {widgets: [{id: "id", widgetType: "table"}]}}}
            });
            expect(result).toExist();
            expect(result).toEqual({
                featureTypeName: "name",
                filterType: 'OGC',
                ogcVersion: '1.1.0'
            });
        });
        it('featureGridOpen false, quickFilter added along with default filterObj', () => {
            let filter = {
                featureTypeName: "name",
                filterType: 'OGC',
                ogcVersion: '1.1.0',
                filterFields: []
            };
            let quickFilters = {
                "states": {
                    attribute: "states",
                    operator: "ilike",
                    rawValue: "a",
                    type: "string",
                    value: "a"
                }
            };
            let options = {
                propertyName: ["states"]
            };
            let result = wfsFilterSelector({
                featuregrid: {open: false},
                layerdownload: {downloadLayer: {widgetId: "id", name: "name"}},
                widgets: {containers: {floating: {widgets: [{id: "id", widgetType: "table", quickFilters, filter, options}]}}}
            });
            expect(result).toExist();
            expect(result.filterFields.length).toBe(1);
            expect(result.filterFields[0].value).toBe('a');
            expect(result.filterFields[0].operator).toBe('ilike');
            expect(result.filterFields[0].attribute).toBe('states');
        });
    });

});
