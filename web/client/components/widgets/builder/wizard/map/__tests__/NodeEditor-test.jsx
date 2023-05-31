/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import {createSink} from 'recompose';
import { Simulate } from 'react-dom/test-utils';
import { VisualizationModes } from '../../../../../../utils/MapTypeUtils';
import NodeEditor from '../NodeEditor';
import nodeEditor from '../enhancers/nodeEditor';
const EnhancedNodeEditor = nodeEditor(NodeEditor);
describe('NodeEditor component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('NodeEditor rendering with defaults', () => {
        ReactDOM.render(<NodeEditor settings={{ nodeType: 'layers' }} tabs={[{
            id: 'general',
            titleId: 'layerProperties.general',
            tooltipId: 'layerProperties.general',
            glyph: 'wrench',
            visible: true,
            Component: createSink(() => {})
        }]} element={{}} />, document.getElementById("container"));
        const container = document.getElementById('container');
        // search the icon rendered
        const el = container.querySelector('.glyphicon-wrench');
        expect(el).toExist();
    });
    it('cache options should show info with matching with the map projection with nodeEditor(NodeEditor)', () => {
        const layer = {
            id: 'layer-01',
            type: 'wms',
            name: 'workspace:layer',
            group: 'group-01',
            url: '/geoserver/wms',
            tileGridStrategy: 'custom',
            tileGrids: [
                {
                    id: 'EPSG:32122x2',
                    crs: 'EPSG:32122',
                    scales: [2557541.55271451, 1278770.776357255, 639385.3881786275],
                    origins: [[403035.4105968763, 414783], [403035.4105968763, 414783], [403035.4105968763, 323121]],
                    tileSize: [512, 512]
                },
                {
                    id: 'EPSG:900913',
                    crs: 'EPSG:900913',
                    scales: [559082263.9508929, 279541131.97544646, 139770565.98772323],
                    origin: [-20037508.34, 20037508],
                    tileSize: [256, 256]
                }
            ]
        };
        ReactDOM.render(<EnhancedNodeEditor
            map={{ projection: 'EPSG:3857', groups: [{ id: layer.group }], layers: [layer] }}
            nodes={[{ id: layer.group, nodes: [layer]}]}
            layers={[layer]}
            editNode={layer.id}
        />, document.getElementById("container"));

        const tabs = document.querySelectorAll('.nav-tabs > li > a');
        expect(tabs.length).toBe(3);

        Simulate.click(tabs[1]);

        const info = document.querySelector('.glyphicon-info-sign');
        expect(info).toBeTruthy();
        expect(info.getAttribute('class')).toBe('text-success glyphicon glyphicon-info-sign');

        let table = document.querySelector('table');
        expect(table).toBeFalsy();

        Simulate.mouseOver(info);

        table = document.querySelector('table');
        expect(table).toBeTruthy();

        const tableRows = table.querySelectorAll('tbody > tr');
        expect([...tableRows].map((row) => row.innerText)).toEqual([
            'EPSG:32122x2\tEPSG:32122\t512',
            'EPSG:900913\tEPSG:900913\t256'
        ]);
        const paragraph = document.querySelector('p');
        expect(paragraph.innerText).toBe('layerProperties.tileGridInUse');
    });
    it('should not shows the cache options for 3D maps with nodeEditor(NodeEditor)', () => {
        const layer = {
            id: 'layer-01',
            type: 'wms',
            name: 'workspace:layer',
            group: 'group-01',
            url: '/geoserver/wms',
            tileGridStrategy: 'custom',
            tileGrids: [
                {
                    id: 'EPSG:32122x2',
                    crs: 'EPSG:32122',
                    scales: [2557541.55271451, 1278770.776357255, 639385.3881786275],
                    origins: [[403035.4105968763, 414783], [403035.4105968763, 414783], [403035.4105968763, 323121]],
                    tileSize: [512, 512]
                },
                {
                    id: 'EPSG:900913',
                    crs: 'EPSG:900913',
                    scales: [559082263.9508929, 279541131.97544646, 139770565.98772323],
                    origin: [-20037508.34, 20037508],
                    tileSize: [256, 256]
                }
            ]
        };
        ReactDOM.render(<EnhancedNodeEditor
            map={{ visualizationMode: VisualizationModes._3D, projection: 'EPSG:3857', groups: [{ id: layer.group }], layers: [layer] }}
            nodes={[{ id: layer.group, nodes: [layer]}]}
            layers={[layer]}
            editNode={layer.id}
        />, document.getElementById("container"));

        const tabs = document.querySelectorAll('.nav-tabs > li > a');
        expect(tabs.length).toBe(3);

        Simulate.click(tabs[1]);
        const cacheOptionsNode = document.querySelector('.ms-wms-cache-options-toolbar');
        expect(cacheOptionsNode).toBeFalsy();
    });
});
