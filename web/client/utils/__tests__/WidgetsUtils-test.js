/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {
    convertDependenciesMappingForCompatibility,
    getConnectionList,
    getMapDependencyPath, getWidgetDependency,
    getWidgetsGroups,
    shortenLabel, updateDependenciesMapOfMapList
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
});
