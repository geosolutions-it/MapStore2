/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {
    convertDependenciesMappingForCompatibility, editorChange, editorChangeProps,
    getConnectionList, getDependantWidget,
    getMapDependencyPath, getSelectedWidgetData, getWidgetDependency,
    getWidgetsGroups,
    shortenLabel, updateDependenciesMapOfMapList,
    defaultChartStyle,
    getAggregationAttributeDataKey,
    generateNewTrace,
    legacyChartToChartWithTraces,
    extractTraceData,
    generateClassifiedData,
    parsePieNoAggregationFunctionData,
    isChartOptionsValid,
    enableBarChartStack,
    getWidgetLayersNames,
    isChartCompatibleWithTableWidget,
    canTableWidgetBeDependency,
    checkMapSyncWithWidgetOfMapType,
    addCurrentTimeShapes,
    getWidgetByDependencyPath,
    getNextAvailableName,
    updateDependenciesForMultiViewCompatibility,
    getDefaultNullPlaceholderForDataType
} from '../WidgetsUtils';
import * as simpleStatistics from 'simple-statistics';
import { createClassifyGeoJSONSync } from '../../api/GeoJSONClassification';
import SAMPLE_1 from '../../test-resources/widgets/widgets1.json';
const widgets = SAMPLE_1.widgets;
import SAMPLE_2 from '../../test-resources/widgets/complex_graph.json';
const complexGraphWidgets = SAMPLE_2.widgets;
const dataWidgets = {
    widgets: [
        {id: 'w_1', maps: [{mapId: 'm_1', center: {x: 0, y: 0, crs: "EPSG:4326"}, mapInfoControl: true, layers: [{id: 'layer1'}], size: {width: 400, height: 400}, zoom: 3 }], widgetType: 'map', mapSync: true},
        {id: 'w_2', dependenciesMap: {layers: "widgets[w_1].maps[m_1].layers", zoom: "widgets[w_1].maps[m_1].zoom", viewport: "widgets[w_1].maps[m_1].viewport", dependenciesMap: "widgets[w_1].dependenciesMap", mapSync: "widgets[w_1].mapSync"}, layer: false, legend: false, mapSync: true, url: false, widgetType: "legend", yAxis: true}
    ]
};
const classifyGeoJSONSync = createClassifyGeoJSONSync(simpleStatistics);
describe('Test WidgetsUtils', () => {
    it('test getConnectionList', () => {
        const pairs = getConnectionList(widgets);
        expect(pairs).toExist();
        expect(pairs.length).toBe(2);
        pairs.map(p => {
            expect(p.length).toBe(2);
            if (p[0] === "ec974c50-37ef-11e8-a12b-f182297314df" ) {
                expect(p[1]).toBe("e448d550-37ef-11e8-a12b-f182297314df");
            }
            if (p[0] === "1ac5f5e0-37f0-11e8-a12b-f182297314df") {
                expect(p[1]).toBe("132746e0-37f0-11e8-a12b-f182297314df");
            }
        });
        const complexGraphPairs = getConnectionList(complexGraphWidgets);
        // verify that connections without mapSync=true are not taken into account
        expect(complexGraphPairs.length).toBe(4);
    });
    it('test getWidgetsGroups', () => {
        const groups = getWidgetsGroups(widgets);
        expect(groups[0].widgets[0]).toBe("ec974c50-37ef-11e8-a12b-f182297314df");
        expect(groups[0].widgets[1]).toBe("e448d550-37ef-11e8-a12b-f182297314df");
        expect(groups[0].color !== groups[1].color).toBe(true);
        expect(groups[1].widgets[0]).toBe("1ac5f5e0-37f0-11e8-a12b-f182297314df");
        expect(groups[1].widgets[1]).toBe("132746e0-37f0-11e8-a12b-f182297314df");
        expect(groups.length).toBe(2);
        expect(groups[0].color !== groups[1].color).toBe(true);
        groups.map(g => expect(g.widgets.length).toBe(2));
        const complexChartGroups = getWidgetsGroups(complexGraphWidgets);
        // verify that connections without mapSync=true are not taken into account
        expect(complexChartGroups.length).toBe(2);
        expect(complexChartGroups[0].widgets.length).toBe(3);
        expect(complexChartGroups[1].widgets.length).toBe(2);
    });

    it('shortenLabel with 2500000000 and threshold=1000', () => {
        const num = 2500000000;
        const threshold = 1000;
        const label = shortenLabel(num, threshold);
        expect(label).toEqual("2.5 B");
    });
    it('shortenLabel with 123456789 and threshold=1000', () => {
        const num = 123456789;
        const threshold = 1000;
        const label = shortenLabel(num, threshold);
        expect(label).toEqual("123.5 M");
    });
    it('shortenLabel with 2500 and threshold=1000', () => {
        const num = 2500;
        const threshold = 1000;
        const label = shortenLabel(num, threshold);
        expect(label).toEqual("2.5 K");
    });
    it('shortenLabel with 2500 and threshold=10000', () => {
        const num = 2500;
        const threshold = 10000;
        const label = shortenLabel(num, threshold);
        expect(label).toEqual(2500);
    });
    it('shortenLabel with a string', () => {
        const num = "state names";
        const label = shortenLabel(num);
        expect(label).toEqual("state names");
    });
    it('getMapDependencyPath', () => {
        const _widgets = [{id: 'w_1', maps: [{mapId: 'm_1'}, {mapId: 'm_2'}]}];
        const modified = getMapDependencyPath('maps[m_1]', 'w_1', _widgets);
        expect(modified).toEqual('maps[0]');
    });
    it('getMapDependencyPath when no match', () => {
        const _widgets = [{id: 'w_1', maps: [{mapId: 'm_1'}, {mapId: 'm_2'}]}];
        const modified = getMapDependencyPath('maps[m_3]', 'w_2', _widgets);
        expect(modified).toEqual('maps[m_3]');
    });
    it('getWidgetDependency', () => {
        const _widgets = [
            {id: 'w_1', maps: [{mapId: 'm_1'}, {mapId: 'm_2', zoom: 1}]},
            {id: 'w_2', type: 'legend'}
        ];
        const maps = [_widgets[0]];
        const modified = getWidgetDependency('widgets[w_1].maps[m_2].zoom', _widgets, maps);
        expect(modified).toEqual(1);
    });
    it('getWidgetDependency when no match', () => {
        const _widgets = [
            {id: 'w_1', maps: [{mapId: 'm_1'}, {mapId: 'm_2', zoom: 1}]},
            {id: 'w_2', type: 'legend'}
        ];
        const maps = [_widgets[0]];
        const modified = getWidgetDependency('widgets[w_2]', _widgets, maps);
        expect(modified).toEqual(_widgets[1]);
    });
    it('convertDependenciesMappingForCompatibility', () => {
        const data = {widgets: [{id: 'w_1', map: {center: {x: 0, y: 0, crs: "EPSG:4326"}, mapInfoControl: true, layers: [{id: 'layer1'}], size: {width: 400, height: 400}, zoom: 3 }, widgetType: 'map', mapSync: true},
            {id: 'w_2', dependenciesMap: {layers: "widgets[w_1].map.layers", zoom: "widgets[w_1].map.zoom", viewport: "widgets[w_1].map.viewport", dependenciesMap: "widgets[w_1].dependenciesMap", mapSync: "widgets[w_1].mapSync"}, layer: false, legend: false, mapSync: true, url: false, widgetType: "legend", yAxis: true}]};
        const modified = convertDependenciesMappingForCompatibility(data);
        expect(modified.widgets[0].maps).toBeTruthy();
        [
            modified.widgets[1].dependenciesMap.layers,
            modified.widgets[1].dependenciesMap.viewport,
            modified.widgets[1].dependenciesMap.zoom
        ].forEach(match => expect(match).toContain('maps'));
    });
    it('convertDependenciesMappingForCompatibility when no conversion needed', () => {
        const modified = convertDependenciesMappingForCompatibility(dataWidgets);
        expect(modified).toEqual(dataWidgets);
    });
    it('convertDependenciesMappingForCompatibility for chart', () => {
        const data = {widgets: [{id: 'w_2', widgetType: "chart", layer: {name: "Test1"}, mapSync: true, geomProp: "the_geom", yAxis: true, cartesian: false, legend: false, options: {}, autoColorOptions: {}, url: "some_url"}]};
        const { widgets: _widgets } = convertDependenciesMappingForCompatibility(data);
        expect(_widgets[0].id).toBe("w_2");
        expect(_widgets[0].mapSync).toBeTruthy();
        expect(_widgets[0].selectedChartId).toBeTruthy();
        expect(_widgets[0].charts).toBeTruthy();
        expect(_widgets[0].charts[0].chartId).toBe(_widgets[0].selectedChartId);
        expect(_widgets[0].charts[0].yAxisOpts).toBeTruthy();
        expect(_widgets[0].charts[0].cartesian).toBe(false);
        expect(_widgets[0].charts[0].legend).toBe(false);
        expect(_widgets[0].charts[0].name).toBe('Chart-1');
        expect(_widgets[0].charts[0].traces.length).toBe(1);
        expect(_widgets[0].charts[0].traces[0].layer).toBeTruthy();
        expect(_widgets[0].charts[0].traces[0].options).toBeTruthy();
        expect(_widgets[0].charts[0].traces[0].style).toBeTruthy();
    });
    it('updateDependenciesMapOfMapList', () => {
        const modified = updateDependenciesMapOfMapList(dataWidgets.widgets, 'w_1', 'm_2');
        [
            modified[1].dependenciesMap.layers,
            modified[1].dependenciesMap.zoom,
            modified[1].dependenciesMap.viewport
        ].forEach(match => expect(match).toContain('maps[m_2]'));
    });
    it('updateDependenciesMapOfMapList when no updated needed', () => {
        const modified = updateDependenciesMapOfMapList(dataWidgets.widgets, 'w_1', 'm_1');
        expect(modified).toEqual(dataWidgets.widgets);
    });
    describe('Test editor change', () => {
        it('editorChangeProps', () =>{
            const props = editorChangeProps({key: 'layer', value: "test"});
            expect(props.path).toBe("builder.editor.layer");
            expect(props.key).toBe("layer");
            expect(props.regex).toBe('');
            expect(props.identifier).toBe("");
            expect(props.value).toBe("test");
        });
        it('editorChangeProps maps', () =>{
            const props = editorChangeProps({key: 'maps'});
            expect(props.path).toBe("builder.editor.maps");
            expect(props.key).toBe("maps");
            expect(props.regex).toBeTruthy();
            expect(props.identifier).toBe("mapId");
        });
        it('editorChangeProps maps with value', () =>{
            const value = [{mapId: 1}];
            const props = editorChangeProps({key: 'maps', value });
            expect(props.path).toBe("builder.editor.maps");
            expect(props.key).toBe("maps");
            expect(props.identifier).toBe("mapId");
            expect(props.value).toEqual(value);
        });
        it('editorChangeProps maps key with mapId ', () =>{
            const value = "test-value";
            const props = editorChangeProps({key: 'maps[1].test', value });
            expect(props.path).toBe("builder.editor.maps");
            expect(props.key).toBe('maps[1].test');
            expect(props.identifier).toBe("mapId");
            expect(props.value).toEqual(value);
        });
        it('editorChangeProps charts', () =>{
            const props = editorChangeProps({key: 'charts'});
            expect(props.path).toBe("builder.editor.charts");
            expect(props.key).toBe("charts");
            expect(props.regex).toBeTruthy();
            expect(props.identifier).toBe("chartId");
        });
        it('editorChangeProps charts with value', () =>{
            const value = [{chartId: 1}];
            const props = editorChangeProps({key: 'charts', value });
            expect(props.path).toBe("builder.editor.charts");
            expect(props.identifier).toBe("chartId");
            expect(props.value).toEqual(value);
        });
        it('editorChangeProps charts key with chartId ', () =>{
            const value = "test-value";
            const props = editorChangeProps({key: 'charts[1].test', value });
            expect(props.path).toBe("builder.editor.charts");
            expect(props.key).toBe('charts[1].test');
            expect(props.identifier).toBe("chartId");
            expect(props.value).toEqual(value);
        });
        const state = {builder: {editor: {}}};
        it('editorChange', () =>{
            const props = editorChange({key: 'layer', value: "test"}, state);
            expect(props.builder.editor).toEqual({layer: "test"});
        });
        it('editorChange maps', () =>{
            const props = editorChange({key: 'maps', value: [{mapId: 1}]}, state);
            expect(props.builder.editor).toBeTruthy();
            const {maps} = props.builder.editor;
            expect(maps).toBeTruthy();
            expect(maps).toEqual([{mapId: 1}]);
        });
        it('editorChange maps with mapId', () =>{
            const _state = {...state, maps: [{mapId: 1, layer: {name: "Test1"}}]};
            const props = editorChange({key: 'maps[1].layer', value: {name: "Test2"}}, _state);
            expect(props.builder.editor).toBeTruthy();
            const {maps} = props.builder.editor;
            expect(maps).toBeTruthy();
            expect(maps.length).toBe(1);
            expect(maps[0].layer.name).toBe('Test2');
        });
        it('editorChange charts', () =>{
            const props = editorChange({key: 'charts', value: [{chartId: 1}]}, state);
            expect(props.builder.editor).toBeTruthy();
            const {charts} = props.builder.editor;
            expect(charts).toBeTruthy();
            expect(charts).toEqual([{chartId: 1}]);
        });
        it('editorChange charts with chartId', () =>{
            const _state = {...state, charts: [{chartId: 1, layer: {name: "Test1"}}]};
            const props = editorChange({key: 'charts[1].layer', value: {name: "Test2"}}, _state);
            expect(props.builder.editor).toBeTruthy();
            const {charts} = props.builder.editor;
            expect(charts).toBeTruthy();
            expect(charts.length).toBe(1);
            expect(charts[0].layer.name).toBe('Test2');
        });
        it('editorChange charts add new layers', () => {
            const _state = {builder: {editor: {selectedChartId: 1, charts: [{chartId: 1, layer: {name: "Test1"}}, {chartId: 2, layer: {name: "Test2"}}] }} };
            const props = editorChange({key: 'chart-layers', value: [{name: "NewTest"}, {name: "NewTest1"}]}, _state);
            expect(props.builder.editor).toBeTruthy();
            const {charts, selectedChartId} = props.builder.editor;
            expect(charts).toBeTruthy();
            expect(charts.length).toBe(2);
            expect(charts[0].name).toBe(undefined);
            expect(charts[0].chartId).toBeTruthy();
            expect(charts[0].traces.length).toBe(1);
            expect(charts[0].traces[0].type).toBe('bar');
            expect(charts[0].traces[0].layer.name).toBe('NewTest');
            expect(selectedChartId).toBeTruthy();
        });
        it('editorChange delete a chart', () =>{
            const _state = {builder: {editor: {selectedChartId: 2, charts: [{chartId: 1, layer: {name: "Test1"}}, {chartId: 2, layer: {name: "Test2"}}] }} };
            const props = editorChange({key: 'chart-delete', value: [{chartId: 2, layer: {name: "Test2"}}]}, _state);
            expect(props.builder.editor).toBeTruthy();
            const {charts, selectedChartId} = props.builder.editor;
            expect(charts).toBeTruthy();
            expect(selectedChartId).toBe(2);
            expect(charts.length).toBe(1);
            expect(charts[0].chartId).toBe(2);
            expect(charts[0].layer.name).toBe('Test2');
        });
        it('editorChange add a new chart to existing', () => {
            const _state = {builder: {editor: {selectedChartId: 2, charts: [{chartId: 1, layer: {name: "Test1"}}, {chartId: 2, layer: {name: "Test2"}}] }} };
            const props = editorChange({key: 'chart-add', value: [{name: "Test1"}, {name: "Test2"}, {name: "Test3"}]}, _state);
            expect(props.builder.editor).toBeTruthy();
            const {charts} = props.builder.editor;
            expect(charts).toBeTruthy();
            expect(charts.length).toBe(5);
            expect(charts[4].chartId).toBeTruthy();
            expect(charts[4].name).toBe(undefined);
            expect(charts[4].traces.length).toBe(1);
            expect(charts[4].traces[0].layer.name).toBe('Test3');
            expect(charts[4].traces[0].type).toBe('bar');
        });
    });
    it("getDependantWidget", () => {
        const widget = getDependantWidget({
            widgets: [{id: "1", layer: {name: "test"}}, {id: 2, layer: {name: "test1"}}],
            dependenciesMap: {layer: 'widgets[1].layer'}}
        );
        expect(widget).toBeTruthy();
        expect(widget.layer.name).toBe("test");
    });
    it("getDependantWidget when not matching", () => {
        const widget = getDependantWidget({
            widgets: [{id: "1", layer: {name: "test"}}, {id: 2, layer: {name: "test1"}}],
            dependenciesMap: {layer: 'widgets[3].layer'}}
        );
        expect(widget).toEqual({});
    });
    it("getSelectedWidgetData for charts", () => {
        const widget = getSelectedWidgetData({id: "1", selectedChartId: "1", widgetType: "chart", charts: [{chartId: "1", traces: [{ layer: "test" }]}]});
        expect(widget).toBeTruthy();
        expect(widget.layer).toBe("test");
    });
    it("getSelectedWidgetData for maps", () => {
        const widget = getSelectedWidgetData({id: "1", selectedMapId: "1", widgetType: "map", maps: [{layer: "test", mapId: "1"}]});
        expect(widget).toBeTruthy();
        expect(widget.layer).toBe("test");
    });
    it("getSelectedWidgetData other widget type", () => {
        const widget = getSelectedWidgetData({id: "1", widgetType: "table", layer: {name: "test"}});
        expect(widget).toBeTruthy();
        expect(widget.layer.name).toBe("test");
    });
    it('defaultChartStyle',  () => {
        expect(defaultChartStyle()).toEqual({ line: { color: '#0888A1', width: 2 }, marker: { color: '#0888A1', size: 6 } });
        expect(defaultChartStyle('line', { color: '#ff0000' })).toEqual({ line: { color: '#ff0000', width: 2 }, marker: { color: '#ff0000', size: 6 } });
        expect(defaultChartStyle('bar')).toEqual({ marker: { color: '#0888A1' }, msMode: 'simple', line: { color: 'rgb(0, 0, 0)', width: 0 } });
        expect(defaultChartStyle('bar', { color: '#ff0000' })).toEqual({ marker: { color: '#ff0000' }, msMode: 'simple', line: { color: 'rgb(0, 0, 0)', width: 0 } });
        expect(defaultChartStyle('pie')).toEqual({ msClassification: { method: 'uniqueInterval', intervals: 5, reverse: false, ramp: 'blues' } });
        expect(defaultChartStyle('pie', { ramp: 'viridis' })).toEqual({ msClassification: { method: 'uniqueInterval', intervals: 5, reverse: false, ramp: 'viridis' } });
    });
    it('getAggregationAttributeDataKey',  () => {
        expect(getAggregationAttributeDataKey()).toBe('');
        expect(getAggregationAttributeDataKey({ aggregateFunction: 'None', aggregationAttribute: 'STATE_NAME' })).toBe('STATE_NAME');
        expect(getAggregationAttributeDataKey({ aggregationAttribute: 'STATE_NAME' })).toBe('STATE_NAME');
        expect(getAggregationAttributeDataKey({ aggregateFunction: 'Sum', aggregationAttribute: 'STATE_NAME' })).toBe('Sum(STATE_NAME)');
    });
    it('generateNewTrace',  () => {
        const { id, ...newTrace } = generateNewTrace({
            color: '#ff0000',
            type: 'bar',
            geomProp: 'the_geom',
            filter: {},
            layer: {
                type: 'wms',
                url: '/geoserver/wms',
                search: {
                    type: 'wfs',
                    url: '/geoserver/wfs'
                }
            }
        });
        expect(id).toBeTruthy();
        expect(newTrace).toEqual({
            type: 'bar',
            layer: {
                type: 'wms',
                url: '/geoserver/wms',
                search: {
                    type: 'wfs',
                    url: '/geoserver/wfs'
                }
            },
            options: {},
            filter: {},
            geomProp: 'the_geom',
            style: { msMode: 'simple', line: { color: 'rgb(0, 0, 0)', width: 0 }, marker: { color: '#ff0000' } }
        });
    });
    it('extractTraceData',  () => {
        expect(extractTraceData()).toBe(undefined);
        expect(extractTraceData({
            selectedChartId: 'chart-01',
            selectedTraceId: 'trace-01',
            charts: [{
                chartId: 'chart-01',
                traces: [{
                    id: 'trace-01',
                    layer: {}
                }]
            }]
        })).toEqual({ id: 'trace-01', layer: {} });
        expect(extractTraceData({
            selectedChartId: 'chart-01',
            charts: [{
                chartId: 'chart-01',
                traces: [{
                    id: 'trace-01',
                    layer: {}
                }]
            }]
        })).toEqual({ id: 'trace-01', layer: {} });
        expect(extractTraceData({
            selectedChartId: 'chart-01',
            selectedTraceId: 'trace-02',
            charts: [{
                chartId: 'chart-01',
                traces: [{
                    id: 'trace-01',
                    layer: {}
                }]
            }]
        })).toEqual({ id: 'trace-01', layer: {} });
    });
    it('parsePieNoAggregationFunctionData',  () => {
        expect(parsePieNoAggregationFunctionData()).toBe(undefined);
        expect(parsePieNoAggregationFunctionData(
            [
                { value: 5, label: 'A' },
                { value: 2, label: 'A' },
                { value: 1, label: 'B' },
                { value: 7, label: 'B' },
                { value: 6, label: 'C' },
                { value: 8, label: 'C' },
                { value: 1, label: 'C' },
                { value: 9, label: 'C' }
            ],
            {
                groupByAttributes: 'label',
                aggregationAttribute: 'value'
            }
        )).toEqual([ { label: 'A', value: 7 }, { label: 'B', value: 8 }, { label: 'C', value: 24 } ]);
    });
    it('legacyChartToChartWithTraces',  () => {
        expect(legacyChartToChartWithTraces({
            yAxis: false,
            xAxisAngle: 45,
            type: 'bar',
            options: {
                groupByAttributes: 'label',
                aggregationAttribute: 'value',
                classificationAttribute: 'class',
                classificationAttributeType: 'string'
            },
            autoColorOptions: {
                name: 'global.colors.custom',
                classification: [{ id: 'class-01', title: 'Class 01', unique: 'A' }],
                defaultCustomColor: '#0033aa',
                defaultClassLabel: 'Default label'
            },
            legend: false,
            cartesian: true,
            chartId: 'chart-01',
            xAxisOpts: {
                type: '-'
            },
            yAxisOpts: {
                type: '-',
                textinfo: true,
                includeLegendPercent: true
            },
            yAxisLabel: 'Trace name',
            tickPrefix: '~',
            format: '.2s',
            tickSuffix: ' W',
            formula: 'value / 100',
            name: 'Chart-1',
            geomProp: 'the_geom',
            layer: {
                type: 'wms',
                url: '/geoserver/wms',
                search: {
                    type: 'wfs',
                    url: '/geoserver/wfs'
                }
            },
            barChartType: 'group'
        })).toEqual({
            name: 'Chart-1',
            legend: false,
            cartesian: true,
            chartId: 'chart-01',
            barChartType: 'group',
            xAxisOpts: [
                { type: '-', angle: 45, id: 0 }
            ],
            yAxisOpts: [
                { type: '-', hide: true, id: 0 }
            ],
            traces: [
                {
                    id: 'trace-chart-01',
                    name: 'Trace name',
                    type: 'bar',
                    options: {
                        groupByAttributes: 'label',
                        aggregationAttribute: 'value',
                        classificationAttribute: 'class'
                    },
                    style: {
                        msMode: 'classification',
                        msClassification: {
                            method: 'uniqueInterval',
                            intervals: 5,
                            reverse: false,
                            ramp: 'viridis',
                            defaultColor: '#0033aa',
                            defaultLabel: 'Default label',
                            classes: [{ id: 'class-01', title: 'Class 01', unique: 'A' }]
                        }
                    },
                    textinfo: true,
                    tickPrefix: '~',
                    format: '.2s',
                    tickSuffix: ' W',
                    formula: 'value / 100',
                    geomProp: 'the_geom',
                    layer: { type: 'wms', url: '/geoserver/wms', search: { type: 'wfs', url: '/geoserver/wfs' } },
                    includeLegendPercent: true
                }
            ]
        });
    });
    it('generateClassifiedData pie unique interval sorted by aggregate',  () => {
        const data = [
            { value: 5, label: 'A' },
            { value: 2, label: 'A' },
            { value: 1, label: 'B' },
            { value: 7, label: 'B' },
            { value: 6, label: 'C' },
            { value: 8, label: 'C' },
            { value: 1, label: 'C' },
            { value: 9, label: 'C' }
        ];
        const { classes } = generateClassifiedData({
            type: 'pie',
            data,
            sortBy: 'aggregate',
            options: {
                groupByAttributes: 'label',
                aggregationAttribute: 'value'
            },
            msClassification: {
                method: 'uniqueInterval',
                ramp: 'spectral',
                reverse: true
            },
            classifyGeoJSON: classifyGeoJSONSync
        });
        expect(classes.map(({ insideClass, ...entry }) => entry)).toEqual([
            { color: '#5e4fa2', unique: 'C', index: 0, label: 'C' },
            { color: '#ffffbf', unique: 'B', index: 1, label: 'B' },
            { color: '#9e0142', unique: 'A', index: 2, label: 'A' },
            { color: '#ffff00', label: 'Others', index: 3 }
        ]);
    });
    it('generateClassifiedData pie unique interval sorted by groupBy',  () => {
        const data = [
            { value: 5, label: 'A' },
            { value: 2, label: 'A' },
            { value: 1, label: 'B' },
            { value: 7, label: 'B' },
            { value: 6, label: 'C' },
            { value: 8, label: 'C' },
            { value: 1, label: 'C' },
            { value: 9, label: 'C' }
        ];
        const { classes } = generateClassifiedData({
            type: 'pie',
            data,
            sortBy: 'groupBy',
            options: {
                groupByAttributes: 'label',
                aggregationAttribute: 'value'
            },
            msClassification: {
                method: 'uniqueInterval',
                ramp: 'spectral',
                reverse: true
            },
            classifyGeoJSON: classifyGeoJSONSync
        });
        expect(classes.map(({ insideClass, ...entry }) => entry)).toEqual([
            { color: '#5e4fa2', unique: 'A', index: 0, label: 'A' },
            { color: '#ffffbf', unique: 'B', index: 1, label: 'B' },
            { color: '#9e0142', unique: 'C', index: 2, label: 'C' },
            { color: '#ffff00', label: 'Others', index: 3 }
        ]);
    });
    it('generateClassifiedData bar jenks sorted by groupBy',  () => {
        const data = [
            { value: 5, label: 'A' },
            { value: 2, label: 'A' },
            { value: 1, label: 'B' },
            { value: 7, label: 'B' },
            { value: 6, label: 'C' },
            { value: 8, label: 'C' },
            { value: 1, label: 'C' },
            { value: 9, label: 'C' }
        ];
        const { sortByKey, classes, classifiedData } = generateClassifiedData({
            type: 'bar',
            data,
            sortBy: 'groupBy',
            options: {
                groupByAttributes: 'label',
                aggregationAttribute: 'value',
                classificationAttribute: 'value'
            },
            msClassification: {
                method: 'jenks',
                ramp: 'spectral',
                reverse: true,
                intervals: 3
            },
            classifyGeoJSON: classifyGeoJSONSync
        });
        expect(classes.map(({ insideClass, ...entry }) => entry)).toEqual([
            { color: '#5e4fa2', min: 1, max: 5, index: 0, label: '>= 1<br>< 5' },
            { color: '#ffffbf', min: 5, max: 7, index: 1, label: '>= 5<br>< 7' },
            { color: '#9e0142', min: 7, max: 9, index: 2, label: '>= 7<br><= 9' },
            { color: '#ffff00', label: 'Others', index: 3 }
        ]);
        expect(classifiedData.map(({ insideClass, ...entry }) => entry)).toEqual([
            { color: '#5e4fa2', min: 1, max: 5, index: 0, label: '>= 1<br>< 5', properties: { value: 1, label: 'C' } },
            { color: '#5e4fa2', min: 1, max: 5, index: 0, label: '>= 1<br>< 5', properties: { value: 1, label: 'B' } },
            { color: '#5e4fa2', min: 1, max: 5, index: 0, label: '>= 1<br>< 5', properties: { value: 2, label: 'A' } },
            { color: '#ffffbf', min: 5, max: 7, index: 1, label: '>= 5<br>< 7', properties: { value: 5, label: 'A' } },
            { color: '#ffffbf', min: 5, max: 7, index: 1, label: '>= 5<br>< 7', properties: { value: 6, label: 'C' } },
            { color: '#9e0142', min: 7, max: 9, index: 2, label: '>= 7<br><= 9', properties: { value: 7, label: 'B' } },
            { color: '#9e0142', min: 7, max: 9, index: 2, label: '>= 7<br><= 9', properties: { value: 8, label: 'C' } },
            { color: '#9e0142', min: 7, max: 9, index: 2, label: '>= 7<br><= 9', properties: { value: 9, label: 'C' } }
        ]);
        expect(sortByKey).toBe('label');
    });
    it('generateClassifiedData bar jenks sorted by aggregation',  () => {
        const data = [
            { value: 5, label: 'A' },
            { value: 2, label: 'A' },
            { value: 1, label: 'B' },
            { value: 7, label: 'B' },
            { value: 6, label: 'C' },
            { value: 8, label: 'C' },
            { value: 1, label: 'C' },
            { value: 9, label: 'C' }
        ];
        const { sortByKey, classes } = generateClassifiedData({
            type: 'bar',
            data,
            sortBy: 'aggregation',
            options: {
                groupByAttributes: 'label',
                aggregationAttribute: 'value',
                classificationAttribute: 'value'
            },
            msClassification: {
                method: 'jenks',
                ramp: 'spectral',
                reverse: true,
                intervals: 3
            },
            classifyGeoJSON: classifyGeoJSONSync
        });
        expect(classes.map(({ insideClass, ...entry }) => entry)).toEqual([
            { color: '#5e4fa2', min: 1, max: 5, index: 0, label: '>= 1<br>< 5' },
            { color: '#ffffbf', min: 5, max: 7, index: 1, label: '>= 5<br>< 7' },
            { color: '#9e0142', min: 7, max: 9, index: 2, label: '>= 7<br><= 9' },
            { color: '#ffff00', label: 'Others', index: 3 }
        ]);
        expect(sortByKey).toBe('value');
    });
    describe('isChartOptionsValid', () => {
        it('mandatory operation if process present', () => {
            expect(isChartOptionsValid({
                aggregationAttribute: "A",
                groupByAttributes: "B"
            }, { hasAggregateProcess: true })).toBeFalsy();
            expect(isChartOptionsValid({
                aggregationAttribute: "A",
                groupByAttributes: "B",
                aggregateFunction: "SUM"
            }, { hasAggregateProcess: true })).toBeTruthy();
        });
        it('operation not needed if WPS not present', () => {
            expect(isChartOptionsValid({
                aggregationAttribute: "A",
                groupByAttributes: "B"
            }, { hasAggregateProcess: false })).toBeTruthy();
        });
        it('only classification attribute present ', () => {
            expect(isChartOptionsValid({
                aggregationAttribute: "A",
                groupByAttributes: "B",
                classificationAttribute: "C"
            }, {hasAggregateProcess: false})).toBeTruthy();
        });
    });
    it('enableBarChartStack', () => {
        expect(enableBarChartStack()).toBe(false);
        expect(enableBarChartStack({ traces: [{ type: 'bar' }] })).toBe(false);
        expect(enableBarChartStack({ traces: [{ type: 'bar', style: { msMode: 'classification' } }] })).toBe(true);
        expect(enableBarChartStack({ traces: [{ type: 'bar' }, { type: 'bar' }] })).toBe(true);
        expect(enableBarChartStack({ traces: [{ type: 'bar' }, { type: 'bar' }], xAxisOpts: [{ id: 0 }, { id: 'axis-1' }] })).toBe(false);
        expect(enableBarChartStack({ traces: [{ type: 'bar' }, { type: 'bar' }], yAxisOpts: [{ id: 0 }, { id: 'axis-1' }] })).toBe(false);
        expect(enableBarChartStack({ traces: [{ type: 'bar' }, { type: 'bar' }], xAxisOpts: [{ id: 0 }, { id: 'axis-1' }], yAxisOpts: [{ id: 0 }, { id: 'axis-1' }] })).toBe(false);
        expect(enableBarChartStack({ traces: [{ type: 'bar' }, { type: 'bar' }], xAxisOpts: [{ id: 0 }], yAxisOpts: [{ id: 0 }] })).toBe(true);
    });
    it('getWidgetLayersNames', () => {
        expect(getWidgetLayersNames()).toEqual([]);
        expect(getWidgetLayersNames({})).toEqual([]);
        expect(getWidgetLayersNames({widgetType: 'map'})).toEqual([]);
        expect(getWidgetLayersNames({widgetType: 'map', maps: [{layers: [{name: "test"}]}]})).toEqual(["test"]);
        expect(getWidgetLayersNames({widgetType: 'legend', layer: {name: "test"}})).toEqual(["test"]);
        expect(getWidgetLayersNames({widgetType: 'counter', layer: {name: "test"}})).toEqual(["test"]);
        expect(getWidgetLayersNames({widgetType: 'table', layer: {name: "test"}})).toEqual(["test"]);
        expect(getWidgetLayersNames({widgetType: 'chart'})).toEqual([]);
        expect(getWidgetLayersNames({widgetType: 'chart', charts: [{chartId: "1"}]})).toEqual([]);
        expect(getWidgetLayersNames({widgetType: 'chart', charts: [{chartId: "1", traces: []}]})).toEqual([]);
        expect(getWidgetLayersNames({widgetType: 'chart', charts: [{chartId: "1", traces: [{layer: {name: "layer_1"}}, {layer: {name: ""}}]}]})).toEqual(["layer_1"]);
        expect(getWidgetLayersNames({widgetType: 'chart', charts: [{chartId: "1", traces: [{layer: {name: "layer_1"}}, {layer: {name: "layer_1"}}]}]})).toEqual(["layer_1"]);
        expect(getWidgetLayersNames({widgetType: 'chart', charts: [{chartId: "1", traces: [{layer: {name: "layer_1"}}, {layer: {name: "layer_1"}}]},
            {chartId: "2", traces: [{layer: {name: "layer_1"}}]}]})).toEqual(["layer_1"]);
        expect(getWidgetLayersNames({widgetType: 'chart', charts: [{chartId: "1", traces: [{layer: {name: "layer_1"}}, {layer: {name: "layer_1"}}]},
            {chartId: "2", traces: [{layer: {name: "layer_2"}}]}]})).toEqual(["layer_1", "layer_2"]);
    });
    it('isChartCompatibleWithTableWidget', () => {
        expect(isChartCompatibleWithTableWidget()).toBeFalsy();
        expect(isChartCompatibleWithTableWidget({widgetType: 'map'})).toBeFalsy();
        expect(isChartCompatibleWithTableWidget({widgetType: 'chart', charts: [{chartId: "1"}]})).toBeFalsy();
        expect(isChartCompatibleWithTableWidget({widgetType: 'chart', charts: [{chartId: "1", traces: []}]})).toBeFalsy();
        expect(isChartCompatibleWithTableWidget({widgetType: 'chart', charts: [{chartId: "1", traces: [{layer: {name: "layer_1"}}]}]}, {layer: {name: "layer_1"}})).toBeTruthy();
        expect(isChartCompatibleWithTableWidget({widgetType: 'chart', charts: [{chartId: "1", traces: [{layer: {name: "layer_1"}}, {layer: {name: "layer_2"}}]}]}, {layer: {name: "layer_1"}})).toBeFalsy();
        expect(isChartCompatibleWithTableWidget({widgetType: 'chart', charts: [{chartId: "1", traces: [{layer: {name: "layer_1"}}, {layer: {name: "layer_1"}}]},
            {chartId: "1", traces: [{layer: {name: "layer_1"}}, {layer: {name: "layer_1"}}]}]}, {layer: {name: "layer_1"}})).toBeTruthy();
        expect(isChartCompatibleWithTableWidget({widgetType: 'chart', charts: [{chartId: "1", traces: [{layer: {name: "layer_2"}}, {layer: {name: "layer_1"}}]},
            {chartId: "1", traces: [{layer: {name: "layer_1"}}, {layer: {name: "layer_1"}}]}]}, {layer: {name: "layer_1"}})).toBeFalsy();
        expect(isChartCompatibleWithTableWidget({widgetType: 'chart', charts: [{chartId: "1", traces: [{layer: {name: "layer_1"}}, {layer: {name: "layer_1"}}]},
            {chartId: "1", traces: [{layer: {name: "layer_1"}}, {layer: {name: "layer_2"}}]}]}, {layer: {name: "layer_1"}})).toBeFalsy();
    });
    it('canTableWidgetBeDependency', () => {
        const dependencyTableWidget1 = {layer: {name: "layer_1"}};
        const dependencyTableWidget2 = {layer: {name: "layer_2"}};
        expect(canTableWidgetBeDependency()).toBeFalsy();
        expect(canTableWidgetBeDependency({widgetType: 'map'})).toBeFalsy();
        expect(canTableWidgetBeDependency({widgetType: 'map', maps: [{layers: [{name: "layer_1"}]}]}, dependencyTableWidget1)).toBeTruthy();
        expect(canTableWidgetBeDependency({widgetType: 'counter', layer: {name: "layer_1"}}, dependencyTableWidget1)).toBeTruthy();
        expect(canTableWidgetBeDependency({widgetType: 'counter', layer: {name: "layer_1"}}, dependencyTableWidget2)).toBeFalsy();
        expect(canTableWidgetBeDependency({widgetType: 'table', layer: {name: "layer_1"}}, dependencyTableWidget1)).toBeTruthy();
        expect(canTableWidgetBeDependency({widgetType: 'table', layer: {name: "layer_1"}}, dependencyTableWidget2)).toBeFalsy();
        expect(canTableWidgetBeDependency({widgetType: 'chart', charts: [{chartId: "1"}]})).toBeFalsy();
        expect(canTableWidgetBeDependency({widgetType: 'chart', charts: [{chartId: "1", traces: [{layer: {name: "layer_1"}}]}]}, dependencyTableWidget1)).toBeTruthy();
        expect(canTableWidgetBeDependency({widgetType: 'chart', charts: [{chartId: "1", traces: [{layer: {name: "layer_1"}}, {layer: {name: "layer_1"}}]}]}, dependencyTableWidget2)).toBeFalsy();
        expect(canTableWidgetBeDependency({widgetType: 'chart', charts: [{chartId: "1", traces: [{layer: {name: "layer_1"}}, {layer: {name: "layer_2"}}]}]}, dependencyTableWidget2)).toBeFalsy();
    });

    it("MapSync dependency to mapWidget", () => {
        const parameters = {
            dependenciesMap: {
                mapSync: 'widgets[456].mapSync'
            },
            widgets: [
                {
                    id: "123",
                    widgetType: 'table'
                },
                {
                    id: "456",
                    widgetType: 'map'
                }
            ]
        };
        const result = checkMapSyncWithWidgetOfMapType(parameters.widgets, parameters.dependenciesMap);
        expect(result).toEqual(true);
    });
    it("MapSync dependency not in map widget", () => {
        const parameters = {
            dependenciesMap: {
                mapSync: 'widgets[123].mapSync'
            },
            widgets: [
                {
                    id: "123",
                    widgetType: 'table'
                },
                {
                    id: "456",
                    widgetType: 'map'
                }
            ]
        };
        const result = checkMapSyncWithWidgetOfMapType(parameters.widgets, parameters.dependenciesMap);
        expect(result).toEqual(false);
    });
    describe('addCurrentTimeShapes', () => {
        it('returns empty array if no start or end in timeRange', () => {
            const data = { xAxisOpts: [{ type: 'date', showCurrentTime: true }], yAxisOpts: [{ type: 'date', showCurrentTime: true }] };
            const shapes = addCurrentTimeShapes(data, {});
            expect(shapes).toEqual([]);
        });
        it('returns a line shape if only start is provided', () => {
            const data = { xAxisOpts: [{ type: 'date', showCurrentTime: true }], yAxisOpts: [{ type: 'date', showCurrentTime: true }] };
            const timeRange = { start: '2025-07-22' };
            const shapes = addCurrentTimeShapes(data, timeRange);
            expect(shapes.length).toBe(2); // one for x, one for y
            expect(shapes[0].type).toBe('line');
            expect(shapes[1].type).toBe('line');
            expect(shapes[0].line.color).toBe('rgba(58, 186, 111, 0.75)');
            expect(shapes[0].line.dash).toBe('dash');
            expect(shapes[0].line.width).toBe(3);
        });
        it('returns a rect shape if both start and end are provided', () => {
            const data = { xAxisOpts: [{ type: 'date', showCurrentTime: true }], yAxisOpts: [{ type: 'date', showCurrentTime: true }] };
            const timeRange = { start: '2025-07-22', end: '2025-07-23' };
            const shapes = addCurrentTimeShapes(data, timeRange);
            expect(shapes.length).toBe(2); // one for x, one for y
            expect(shapes[0].type).toBe('rect');
            expect(shapes[1].type).toBe('rect');
            expect(shapes[0].fillcolor).toBe('rgba(58, 186, 111, 0.75)');
        });
        it('uses custom axis shape options if provided', () => {
            const data = {
                xAxisOpts: [{ type: 'date', showCurrentTime: true, currentTimeShape: { color: 'red', style: 'dot', size: 5 }}],
                yAxisOpts: [{ type: 'date', showCurrentTime: true, currentTimeShape: { color: 'blue', style: 'longdash', size: 2 }}]
            };
            const timeRange = { start: '2025-07-22' };
            const shapes = addCurrentTimeShapes(data, timeRange);
            expect(shapes.length).toBe(2);
            expect(shapes[0].line.color).toBe('red');
            expect(shapes[0].line.dash).toBe('dot');
            expect(shapes[0].line.width).toBe(5);
            expect(shapes[1].line.color).toBe('blue');
            expect(shapes[1].line.dash).toBe('longdash');
            expect(shapes[1].line.width).toBe(2);
        });
    });
    describe('getWidgetByDependencyPath', () => {
        const testWidgets = [
            { id: 'widget-1', type: 'map', title: 'Map Widget 1' },
            { id: 'widget-2', type: 'chart', title: 'Chart Widget 2' },
            { id: 'widget-3', type: 'legend', title: 'Legend Widget 3' },
            { id: 'widget-4', type: 'text', title: 'Text Widget 4' }
        ];

        it('should return widget when dependency path matches widget ID', () => {
            const result = getWidgetByDependencyPath('widgets[widget-1]', testWidgets);
            expect(result).toEqual({ id: 'widget-1', type: 'map', title: 'Map Widget 1' });
        });

        it('should return null when widget ID does not exist', () => {
            const result = getWidgetByDependencyPath('widgets[nonexistent-widget]', testWidgets);
            expect(result).toBeFalsy();
        });

        it('should return null when dependency path does not match WIDGETS_REGEX pattern', () => {
            const result = getWidgetByDependencyPath('invalid-path', testWidgets);
            expect(result).toBeFalsy();
        });

        it('should return null when dependency path is empty string', () => {
            const result = getWidgetByDependencyPath('', testWidgets);
            expect(result).toBeFalsy();
        });

        it('should return null when dependency path is null', () => {
            const result = getWidgetByDependencyPath(null, testWidgets);
            expect(result).toBeFalsy();
        });

        it('should return null when dependency path is undefined', () => {
            const result = getWidgetByDependencyPath(undefined, testWidgets);
            expect(result).toBeFalsy();
        });

        it('should return null when widgets array is empty', () => {
            const result = getWidgetByDependencyPath('widgets[widget-1]', []);
            expect(result).toBeFalsy();
        });

        it('should return null when widgets array is null', () => {
            const result = getWidgetByDependencyPath('widgets[widget-1]', null);
            expect(result).toBeFalsy();
        });

        it('should return null when widgets array is undefined', () => {
            const result = getWidgetByDependencyPath('widgets[widget-1]', undefined);
            expect(result).toBeFalsy();
        });

        it('should handle dependency path with special characters in widget ID', () => {
            const widgetsWithSpecialChars = [
                { id: 'widget-with-dashes', type: 'map' },
                { id: 'widget_with_underscores', type: 'chart' },
                { id: 'widget.with.dots', type: 'legend' }
            ];

            expect(getWidgetByDependencyPath('widgets[widget-with-dashes]', widgetsWithSpecialChars))
                .toEqual({ id: 'widget-with-dashes', type: 'map' });
            expect(getWidgetByDependencyPath('widgets[widget_with_underscores]', widgetsWithSpecialChars))
                .toEqual({ id: 'widget_with_underscores', type: 'chart' });
            expect(getWidgetByDependencyPath('widgets[widget.with.dots]', widgetsWithSpecialChars))
                .toEqual({ id: 'widget.with.dots', type: 'legend' });
        });

        it('should handle dependency path with numeric widget ID', () => {
            const widgetsWithNumericIds = [
                { id: '123', type: 'map' },
                { id: '456', type: 'chart' }
            ];

            expect(getWidgetByDependencyPath('widgets[123]', widgetsWithNumericIds))
                .toEqual({ id: '123', type: 'map' });
            expect(getWidgetByDependencyPath('widgets["456"]', widgetsWithNumericIds))
                .toEqual({ id: '456', type: 'chart' });
        });
    });

    describe('getNextAvailableName', () => {
        it('should return "View 1" when no views exist', () => {
            const data = [];
            const result = getNextAvailableName(data);
            expect(result).toBe('View 1');
        });

        it('should return next available number when consecutive views exist', () => {
            const data = [{ name: 'View 1' }, { name: 'View 2' }, { name: 'View 3' }];
            const result = getNextAvailableName(data);
            expect(result).toBe('View 4');
        });

        it('should fill in missing gaps in the sequence', () => {
            const data = [{ name: 'View 1' }, { name: 'View 3' }, { name: 'View 4' }];
            const result = getNextAvailableName(data);
            expect(result).toBe('View 2');
        });
    });

    describe('updateDependenciesForMultiViewCompatibility', () => {
        it('should handle data with existing layouts array', () => {
            const data = {
                layouts: [{ id: '1', name: 'Layout 1' }],
                widgets: [{ id: 'w1', layoutId: '1' }]
            };
            const result = updateDependenciesForMultiViewCompatibility(data);
            expect(Array.isArray(result.layouts)).toBe(true);
            expect(result.layouts[0].id).toBe('1');
            expect(result.widgets[0].layoutId).toBe('1');
        });

        it('should wrap a single layout object into an array if not already an array', () => {
            const data = {
                layouts: { md: [] },
                widgets: [{ id: 'w1' }]
            };
            const result = updateDependenciesForMultiViewCompatibility(data);
            expect(Array.isArray(result.layouts)).toBe(true);
            expect(result.layouts[0].name).toBe('Main view');
            expect(result.widgets[0].layoutId).toBe(result.layouts[0].id);
        });

        it('should assign missing layoutId to widgets based on first layout', () => {
            const data = {
                layouts: [{ id: 'l1', name: 'Layout 1' }],
                widgets: [{ id: 'w1' }, { id: 'w2', layoutId: 'l2' }]
            };
            const result = updateDependenciesForMultiViewCompatibility(data);
            expect(result.widgets[0].layoutId).toBe('l1');
            expect(result.widgets[1].layoutId).toBe('l2');
        });
    });

    describe('getDefaultNullPlaceholderForDataType', () => {
        it('returns correct default values for numeric types', () => {
            expect(getDefaultNullPlaceholderForDataType('int')).toBe(0);
            expect(getDefaultNullPlaceholderForDataType('number')).toBe(0);
        });
        it('returns correct default values for string and boolean types', () => {
            expect(getDefaultNullPlaceholderForDataType('string')).toBe('NULL');
            expect(getDefaultNullPlaceholderForDataType('boolean')).toBe('NULL');
        });
        it('returns correct default values for date and time types', () => {
            const dateResult = getDefaultNullPlaceholderForDataType('date');
            const timeResult = getDefaultNullPlaceholderForDataType('time');
            const dateTimeResult = getDefaultNullPlaceholderForDataType('date-time');

            // Date should be in format like "2025-01-21Z"
            expect(dateResult).toMatch(/^\d{4}-\d{2}-\d{2}Z$/);

            // Time should be in format like "1970-01-01T14:30:45Z"
            expect(timeResult).toMatch(/^1970-01-01T\d{2}:\d{2}:\d{2}Z$/);

            // DateTime should be in format like "2025-01-21T14:30:45Z"
            expect(dateTimeResult).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
        });
    });
});
