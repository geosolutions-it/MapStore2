/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import TOC from '../TOC';
import { Simulate } from 'react-dom/test-utils';
import { NodeTypes } from '../../../../utils/LayersUtils';
import { getTileMatrix } from '../../../../utils/WMTSUtils';
import { saveMapConfiguration } from '../../../../utils/MapUtils';

describe('TOC', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render with defaults', () => {
        ReactDOM.render(<TOC />, document.getElementById("container"));
        expect(document.querySelector('.ms-layers-tree')).toBeTruthy();
    });
    describe('WMTS map changes', () => {
        const createTOC = TOC;
        const tileMatrixSet = {
            'ows:Identifier': 'EPSG:4326',
            'ows:SupportedCRS': 'urn:ogc:def:crs:EPSG::4326',
            TileMatrix: [{ 'ows:Identifier': 'EPSG:4326:0', ScaleDenominator: 1000 }]
        };
        const createMap = () => ({
            layers: [{
                id: 'wmts', type: 'wmts', name: 'topp:states', url: '/wmts', visibility: true,
                availableTileMatrixSets: { 'EPSG:4326': { crs: 'EPSG:4326', tileMatrixSet } }
            }],
            groups: []
        });

        [false, true].forEach(linked => {
            it(`preserves matrix definitions through repeated visibility changes ${linked ? 'with' : 'without'} initial sources`, () => {
                let map = createMap();
                if (linked) {
                    map = saveMapConfiguration(map, map.layers, map.groups, []).map;
                    expect(map.layers[0].availableTileMatrixSets['EPSG:4326'].tileMatrixSet).toBe(undefined);
                }
                const onChangeMap = expect.createSpy(newMap => { map = newMap; }).andCallThrough();
                const render = () => ReactDOM.render(<TOC map={map} onChangeMap={onChangeMap} config={{ sortable: false }} />,
                    document.getElementById('container'));
                [false, true].forEach(visibility => {
                    render();
                    Simulate.click(document.querySelector('.ms-visibility-check'));
                    expect(map.layers[0].visibility).toBe(visibility);
                    expect(map.layers[0].availableTileMatrixSets['EPSG:4326'].tileMatrixSet).toEqual(tileMatrixSet);
                    expect(getTileMatrix(map.layers[0], 'EPSG:4326').tileMatrixSet).toEqual(tileMatrixSet);
                });
                expect(onChangeMap.calls.length).toBe(2);
            });
        });

        it('preserves matrix definitions and layer order after sorting', () => {
            const map = createMap();
            map.layers = [...map.layers, { id: 'wms', type: 'wms', name: 'other', url: '/wms' }]
                .map(layer => ({ ...layer, group: 'group01' }));
            map.groups = [{ id: 'group01', title: 'Group 01', expanded: true }];
            const onChangeMap = expect.createSpy();
            const toc = createTOC({ map, onChangeMap });
            toc.props.onSort('wmts', 'group01', 0);

            expect(onChangeMap.calls.length).toBe(1);
            const [updated] = onChangeMap.calls[0].arguments;
            expect(updated.layers.map(layer => layer.id)).toEqual(['wms', 'wmts']);
            expect(updated.layers[1].availableTileMatrixSets['EPSG:4326'].tileMatrixSet).toEqual(tileMatrixSet);
        });

        it('preserves matrix definitions after opacity and group changes', () => {
            let map = createMap();
            map.layers[0].group = 'group01';
            map.groups = [{ id: 'group01', title: 'Group 01', visibility: true }];
            const onChangeMap = newMap => { map = newMap; };
            createTOC({ map, onChangeMap }).props.onChange('wmts', NodeTypes.LAYER, { opacity: 0.5 });
            expect(map.layers[0].opacity).toBe(0.5);
            expect(map.layers[0].availableTileMatrixSets['EPSG:4326'].tileMatrixSet).toEqual(tileMatrixSet);
            createTOC({ map, onChangeMap }).props.onChange('group01', NodeTypes.GROUP, { visibility: false });
            expect(map.groups[0].visibility).toBe(false);
            expect(map.layers[0].availableTileMatrixSets['EPSG:4326'].tileMatrixSet).toEqual(tileMatrixSet);
        });
    });
    it('should trigger on change map with onChange event', (done) => {
        ReactDOM.render(<TOC
            config={{ sortable: false }}
            map={{
                layers: [
                    {
                        id: 'layer02',
                        name: 'Layer 02',
                        group: 'group02'
                    },
                    {
                        id: 'layer01',
                        name: 'Layer 01',
                        group: 'group01'
                    }
                ],
                groups: [
                    {
                        id: 'group01',
                        title: 'Group 01',
                        visibility: true
                    },
                    {
                        id: 'group02',
                        title: 'Group 02',
                        visibility: true
                    }
                ]
            }}
            onChangeMap={(map) => {
                expect(map.groups[0].visibility).toBe(false);
                done();
            }}
        />, document.getElementById("container"));
        expect(document.querySelector('.ms-layers-tree')).toBeTruthy();
        const visibilityChecks = [...document.querySelectorAll('.ms-visibility-check')];
        expect(visibilityChecks.length).toBe(4);
        Simulate.click(visibilityChecks[0]);
    });
    it('should trigger on select node', (done) => {
        ReactDOM.render(<TOC
            config={{ sortable: false }}
            map={{
                layers: [
                    {
                        id: 'layer02',
                        name: 'Layer 02',
                        group: 'group02'
                    },
                    {
                        id: 'layer01',
                        name: 'Layer 01',
                        group: 'group01'
                    }
                ],
                groups: [
                    {
                        id: 'group01',
                        title: 'Group 01',
                        visibility: true
                    },
                    {
                        id: 'group02',
                        title: 'Group 02',
                        visibility: true
                    }
                ]
            }}
            onSelectNode={(nodeId, nodeType) => {
                expect(nodeId).toBe('group01');
                expect(nodeType).toBe('group');
                done();
            }}
        />, document.getElementById("container"));
        expect(document.querySelector('.ms-layers-tree')).toBeTruthy();
        const nodeHeaders = [...document.querySelectorAll('.ms-node-header')];
        expect(nodeHeaders.length).toBe(4);
        Simulate.click(nodeHeaders[0]);
    });
});
