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
    isChartCompatibleWithTableWidget
} from '../WidgetsUtils';
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
        expect(_widgets[0].charts[0].layer).toBeTruthy();
        expect(_widgets[0].charts[0].yAxis).toBeTruthy();
        expect(_widgets[0].charts[0].cartesian).toBe(false);
        expect(_widgets[0].charts[0].legend).toBe(false);
        expect(_widgets[0].charts[0].options).toBeTruthy();
        expect(_widgets[0].charts[0].autoColorOptions).toBeTruthy();
        expect(_widgets[0].charts[0].url).toBe('some_url');
        expect(_widgets[0].charts[0].name).toBe('Chart-1');
        expect(_widgets[0].charts[0].chartId).toBe(_widgets[0].selectedChartId);
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
            expect(charts[0].type).toBe('bar');
            expect(charts[0].chartId).toBeTruthy();
            expect(charts[0].layer.name).toBe('NewTest');
            expect(charts[0].name).toBe('Chart-1');
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
            expect(charts[4].layer.name).toBe('Test3');
            expect(charts[4].name).toBe('Chart-5');
            expect(charts[4].type).toBe('bar');
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
        const widget = getSelectedWidgetData({id: "1", selectedChartId: "1", widgetType: "chart", charts: [{layer: "test", chartId: "1"}]});
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
    it("isChartCompatibleWithTableWidget", () => {
        expect(isChartCompatibleWithTableWidget()).toBeFalsy();
        expect(isChartCompatibleWithTableWidget({charts: []})).toBeFalsy();
        expect(isChartCompatibleWithTableWidget({charts: [{layer: {name: "test"}}]})).toBeFalsy();
        expect(isChartCompatibleWithTableWidget({charts: [{layer: {name: "test"}}]}, {layer: {name: "test"}})).toBeTruthy();
        expect(isChartCompatibleWithTableWidget({charts: [{layer: {name: "test"}}, {layer: {name: "test1"}}]}, {layer: {name: "test"}})).toBeFalsy();
        expect(isChartCompatibleWithTableWidget({charts: [{layer: {name: "test"}}, {layer: {name: "test"}}]}, {layer: {name: "test"}})).toBeTruthy();
    });
});
