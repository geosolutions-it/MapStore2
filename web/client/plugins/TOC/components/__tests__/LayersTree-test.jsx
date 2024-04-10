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
import LayersTree from '../LayersTree';
import { Simulate } from 'react-dom/test-utils';

describe('LayersTree', () => {
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
        ReactDOM.render(<LayersTree />, document.getElementById("container"));
        expect(document.querySelector('.ms-layers-tree')).toBeTruthy();
    });
    it('should render group and layer nodes', () => {
        ReactDOM.render(<LayersTree
            config={{
                sortable: false
            }}
            tree={[
                {
                    id: 'group01',
                    title: 'Group 01',
                    nodes: [
                        {
                            id: 'layer01',
                            name: 'Layer 01',
                            group: 'group01'
                        }
                    ]
                },
                {
                    id: 'group02',
                    title: 'Group 02',
                    nodes: [
                        {
                            id: 'layer02',
                            name: 'Layer 02',
                            group: 'group02'
                        }
                    ]
                }
            ]}
        />, document.getElementById("container"));
        expect(document.querySelector('.ms-layers-tree')).toBeTruthy();
        const groups = [...document.querySelectorAll('.ms-node-group')];
        expect(groups.length).toBe(2);
        expect(groups.map((group) => group.querySelector('.ms-node-title').innerText))
            .toEqual([ 'Group 01', 'Group 02' ]);
        expect(groups.map((group) => group.querySelector('.ms-node-layer .ms-node-title').innerText))
            .toEqual([ 'Layer 01', 'Layer 02' ]);
    });
    it('should render with filter with match', () => {
        ReactDOM.render(<LayersTree
            config={{
                sortable: false
            }}
            filterText="layer"
            tree={[
                {
                    id: 'group01',
                    title: 'Group 01',
                    nodes: [
                        {
                            id: 'layer01',
                            name: 'Layer 01',
                            group: 'group01'
                        }
                    ]
                },
                {
                    id: 'group02',
                    title: 'Group 02',
                    nodes: [
                        {
                            id: 'layer02',
                            name: 'Layer 02',
                            group: 'group02'
                        }
                    ]
                }
            ]}
        />, document.getElementById("container"));
        expect(document.querySelector('.ms-layers-tree')).toBeTruthy();
        const groups = [...document.querySelectorAll('.ms-node-group')];
        expect(groups.length).toBe(2);
        expect(groups.map((group) => group.querySelector('.ms-node-title').innerText))
            .toEqual([ 'Group 01', 'Group 02' ]);
        expect(groups.map((group) => group.querySelector('.ms-node-layer .ms-node-title').innerHTML))
            .toEqual([ '<mark>Layer</mark> 01', '<mark>Layer</mark> 02' ]);
    });
    it('should render with filter without match', () => {
        ReactDOM.render(<LayersTree
            config={{
                sortable: false
            }}
            filterText="Test"
            tree={[
                {
                    id: 'group01',
                    title: 'Group 01',
                    nodes: [
                        {
                            id: 'layer01',
                            name: 'Layer 01',
                            group: 'group01'
                        }
                    ]
                },
                {
                    id: 'group02',
                    title: 'Group 02',
                    nodes: [
                        {
                            id: 'layer02',
                            name: 'Layer 02',
                            group: 'group02'
                        }
                    ]
                }
            ]}
        />, document.getElementById("container"));
        expect(document.querySelector('.ms-layers-tree')).toBeTruthy();
        const groups = [...document.querySelectorAll('.ms-node-group')];
        expect(groups.length).toBe(0);
        expect(document.querySelector('span').innerText).toBe('toc.noFilteredResults');
    });
    it('should trigger on change clicking on visibility', (done) => {
        ReactDOM.render(<LayersTree
            config={{
                sortable: false
            }}
            onChange={({ node, options }) => {
                expect(node.id).toBe('group01');
                expect(options.visibility).toBe(true);
                done();
            }}
            tree={[
                {
                    id: 'group01',
                    title: 'Group 01',
                    nodes: [
                        {
                            id: 'layer01',
                            name: 'Layer 01',
                            group: 'group01'
                        }
                    ]
                },
                {
                    id: 'group02',
                    title: 'Group 02',
                    nodes: [
                        {
                            id: 'layer02',
                            name: 'Layer 02',
                            group: 'group02'
                        }
                    ]
                }
            ]}
        />, document.getElementById("container"));
        expect(document.querySelector('.ms-layers-tree')).toBeTruthy();
        const visibilityChecks = [...document.querySelectorAll('.ms-visibility-check')];
        expect(visibilityChecks.length).toBe(4);
        Simulate.click(visibilityChecks[0]);
    });
    it('should trigger on select clicking on node header', (done) => {
        ReactDOM.render(<LayersTree
            config={{
                sortable: false
            }}
            onSelect={({ node }) => {
                expect(node.id).toBe('group01');
                done();
            }}
            tree={[
                {
                    id: 'group01',
                    title: 'Group 01',
                    nodes: [
                        {
                            id: 'layer01',
                            name: 'Layer 01',
                            group: 'group01'
                        }
                    ]
                },
                {
                    id: 'group02',
                    title: 'Group 02',
                    nodes: [
                        {
                            id: 'layer02',
                            name: 'Layer 02',
                            group: 'group02'
                        }
                    ]
                }
            ]}
        />, document.getElementById("container"));
        expect(document.querySelector('.ms-layers-tree')).toBeTruthy();
        const nodeHeaders = [...document.querySelectorAll('.ms-node-header')];
        expect(nodeHeaders.length).toBe(4);
        Simulate.click(nodeHeaders[0]);
    });
    it('should trigger context menu on list item', (done) => {
        ReactDOM.render(<LayersTree
            config={{
                sortable: false
            }}
            onContextMenu={({ node }) => {
                expect(node.id).toBe('group01');
                done();
            }}
            tree={[
                {
                    id: 'group01',
                    title: 'Group 01',
                    nodes: [
                        {
                            id: 'layer01',
                            name: 'Layer 01',
                            group: 'group01'
                        }
                    ]
                },
                {
                    id: 'group02',
                    title: 'Group 02',
                    nodes: [
                        {
                            id: 'layer02',
                            name: 'Layer 02',
                            group: 'group02'
                        }
                    ]
                }
            ]}
        />, document.getElementById("container"));
        expect(document.querySelector('.ms-layers-tree')).toBeTruthy();
        const nodeItem = [...document.querySelectorAll('.ms-node')];
        expect(nodeItem.length).toBe(4);
        Simulate.contextMenu(nodeItem[0]);
    });
});
