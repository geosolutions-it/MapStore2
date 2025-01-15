/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import LayersSection from '../LayersSection';
import expect from 'expect';
import { Simulate } from 'react-dom/test-utils';

describe('LayersSection component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render with default', () => {
        ReactDOM.render(<LayersSection />, document.getElementById("container"));
        const sectionNode = document.querySelector('.ms-map-views-section');
        expect(sectionNode).toBeTruthy();
    });
    it('should show message to add layers in map', () => {
        ReactDOM.render(<LayersSection
            expandedSections={{ layers: true }}
        />, document.getElementById("container"));
        const sectionNode = document.querySelector('.ms-map-views-section');
        expect(sectionNode).toBeTruthy();
        expect(sectionNode.lastChild.innerHTML).toBe('<span>mapViews.layersOptions</span>');
    });
    it('should display show clipping geometries checkbox', () => {
        ReactDOM.render(<LayersSection
            expandedSections={{ layers: true }}
            isClippingAvailable
        />, document.getElementById("container"));
        const sectionNode = document.querySelector('.ms-map-views-section');
        expect(sectionNode).toBeTruthy();
        const inputNodes = document.querySelectorAll('input');
        expect(inputNodes.length).toBe(2);
        expect(inputNodes[0].getAttribute('type')).toBe('checkbox');
    });
    it('should display terrain node', () => {
        ReactDOM.render(<LayersSection
            expandedSections={{ layers: true }}
            isTerrainAvailable
        />, document.getElementById("container"));
        const sectionNode = document.querySelector('.ms-map-views-section');
        expect(sectionNode).toBeTruthy();
        const layerNodes = [...document.querySelectorAll('.ms-node-layer')];
        expect(layerNodes.length).toBe(1);
    });
    it('should display list of layers', () => {
        ReactDOM.render(<LayersSection
            view={{
                id: 'view.01',
                layers: [
                    {
                        id: 'layer.01',
                        visibility: true
                    }
                ]
            }}
            layers={[
                {
                    id: 'layer.01',
                    type: 'vector',
                    visibility: false,
                    features: [
                        {
                            type: 'Feature',
                            id: 'feature.01',
                            geometry: {
                                type: 'Polygon',
                                coordinates: [[[0, 0], [0, 1], [1, 1], [0, 0]]]
                            },
                            properties: {}
                        }
                    ]
                },
                {
                    id: 'layer.02',
                    type: 'wfs',
                    visibility: false
                }
            ]}
            expandedSections={{ layers: true }}
            isClippingAvailable
        />, document.getElementById("container"));
        const sectionNode = document.querySelector('.ms-map-views-section');
        expect(sectionNode).toBeTruthy();
        const layerNodes = [...document.querySelectorAll('.ms-node-layer')];
        expect(layerNodes.length).toBe(2);
        expect([...layerNodes[0].querySelectorAll('button')]
            .map(layerButtonNode => layerButtonNode.querySelector('.glyphicon').getAttribute('class')))
            .toEqual([ 'glyphicon glyphicon-checkbox-off', 'glyphicon glyphicon-plug' ]);
        expect([...layerNodes[1].querySelectorAll('button')]
            .map(layerButtonNode => layerButtonNode.querySelector('.glyphicon').getAttribute('class')))
            .toEqual([ 'glyphicon glyphicon-checkbox-on', 'glyphicon glyphicon-unplug' ]);
    });
    it('should display list of groups', () => {
        ReactDOM.render(<LayersSection
            view={{
                id: 'view.01',
                layers: [
                    {
                        id: 'layer.01',
                        visibility: true
                    }
                ],
                groups: [
                    {
                        id: 'group_01.group_02',
                        visibility: false
                    }
                ]
            }}
            groups={[
                {
                    id: 'group_01',
                    title: 'Group 01',
                    visibility: true,
                    expanded: true
                },
                {
                    id: 'group_01.group_02',
                    title: 'Group 02',
                    visibility: true,
                    expanded: true
                }
            ]}
            layers={[
                {
                    id: 'layer.01',
                    type: 'vector',
                    title: 'Layer 01',
                    group: 'group_01',
                    visibility: false,
                    features: [
                        {
                            type: 'Feature',
                            id: 'feature.01',
                            geometry: {
                                type: 'Polygon',
                                coordinates: [[[0, 0], [0, 1], [1, 1], [0, 0]]]
                            },
                            properties: {}
                        }
                    ]
                },
                {
                    id: 'layer.02',
                    type: 'wfs',
                    title: 'Layer 02',
                    visibility: false,
                    group: 'group_01.group_02'
                }
            ]}
            expandedSections={{ layers: true }}
            isClippingAvailable
        />, document.getElementById("container"));
        const groupsHeaders = document.querySelectorAll('.ms-node-group > .ms-node-header');
        expect(groupsHeaders.length).toBe(2);
        expect([...groupsHeaders].map(group =>
            group.querySelector('.ms-node-title').innerText
        )).toEqual(['Group 01', 'Group 02']);
        expect(
            [...groupsHeaders].map(group =>
                [...group.querySelectorAll('button > .glyphicon')]
                    .map((glyph) => glyph.getAttribute('class'))
            ))
            .toEqual([
                [ 'glyphicon glyphicon-bottom', 'glyphicon glyphicon-checkbox-on', 'glyphicon glyphicon-plug' ],
                [ 'glyphicon glyphicon-bottom', 'glyphicon glyphicon-checkbox-off', 'glyphicon glyphicon-unplug' ]
            ]);
    });
    it('should trigger onChangeLayer by clicking on the unlink button of layers', (done) => {
        ReactDOM.render(<LayersSection
            view={{
                id: 'view.01',
                layers: [],
                groups: []
            }}
            groups={[
                {
                    id: 'group_01',
                    title: 'Group 01',
                    visibility: true,
                    expanded: true
                }
            ]}
            layers={[
                {
                    id: 'layer.01',
                    type: 'vector',
                    title: 'Layer 01',
                    group: 'group_01',
                    visibility: false,
                    features: [
                        {
                            type: 'Feature',
                            id: 'feature.01',
                            geometry: {
                                type: 'Polygon',
                                coordinates: [[[0, 0], [0, 1], [1, 1], [0, 0]]]
                            },
                            properties: {}
                        }
                    ]
                }
            ]}
            onChangeLayer={(id, value) => {
                try {
                    expect(id).toBe('layer.01');
                    expect(value).toEqual({ id: 'layer.01', visibility: false });
                } catch (e) {
                    done(e);
                }
                done();
            }}
            expandedSections={{ layers: true }}
            isClippingAvailable
        />, document.getElementById("container"));
        const layerHeaders = document.querySelectorAll('.ms-node-layer > .ms-node-header');
        expect(layerHeaders.length).toBe(1);
        const buttons = layerHeaders[0].querySelectorAll('button');
        expect(buttons.length).toBe(2);
        Simulate.click(buttons[1]);
    });
    it('should trigger onResetLayer by clicking on the link button of layers', (done) => {
        ReactDOM.render(<LayersSection
            view={{
                id: 'view.01',
                layers: [
                    {
                        id: 'layer.01',
                        visibility: true
                    }
                ],
                groups: []
            }}
            groups={[
                {
                    id: 'group_01',
                    title: 'Group 01',
                    visibility: true,
                    expanded: true
                }
            ]}
            layers={[
                {
                    id: 'layer.01',
                    type: 'vector',
                    title: 'Layer 01',
                    group: 'group_01',
                    visibility: false,
                    features: [
                        {
                            type: 'Feature',
                            id: 'feature.01',
                            geometry: {
                                type: 'Polygon',
                                coordinates: [[[0, 0], [0, 1], [1, 1], [0, 0]]]
                            },
                            properties: {}
                        }
                    ]
                }
            ]}
            onResetLayer={(id) => {
                try {
                    expect(id).toBe('layer.01');
                } catch (e) {
                    done(e);
                }
                done();
            }}
            expandedSections={{ layers: true }}
            isClippingAvailable
        />, document.getElementById("container"));
        const layerHeaders = document.querySelectorAll('.ms-node-layer > .ms-node-header');
        expect(layerHeaders.length).toBe(1);
        const buttons = layerHeaders[0].querySelectorAll('button');
        expect(buttons.length).toBe(2);
        Simulate.click(buttons[1]);
    });
    it('should trigger onChangeGroup by clicking on the unlink button of groups', (done) => {
        ReactDOM.render(<LayersSection
            view={{
                id: 'view.01',
                layers: [],
                groups: []
            }}
            groups={[
                {
                    id: 'group_01',
                    title: 'Group 01',
                    visibility: true,
                    expanded: true
                }
            ]}
            layers={[
                {
                    id: 'layer.01',
                    type: 'vector',
                    title: 'Layer 01',
                    group: 'group_01',
                    visibility: false,
                    features: [
                        {
                            type: 'Feature',
                            id: 'feature.01',
                            geometry: {
                                type: 'Polygon',
                                coordinates: [[[0, 0], [0, 1], [1, 1], [0, 0]]]
                            },
                            properties: {}
                        }
                    ]
                }
            ]}
            onChangeGroup={(id, value) => {
                try {
                    expect(id).toBe('group_01');
                    expect(value).toEqual({ id: 'group_01', visibility: true });
                } catch (e) {
                    done(e);
                }
                done();
            }}
            expandedSections={{ layers: true }}
            isClippingAvailable
        />, document.getElementById("container"));
        const groupHeaders = document.querySelectorAll('.ms-node-group > .ms-node-header');
        expect(groupHeaders.length).toBe(1);
        const buttons = groupHeaders[0].querySelectorAll('button');
        expect(buttons.length).toBe(3);
        Simulate.click(buttons[2]);
    });
    it('should trigger onResetGroup by clicking on the link button of groups', (done) => {
        ReactDOM.render(<LayersSection
            view={{
                id: 'view.01',
                layers: [],
                groups: [
                    {
                        id: 'group_01',
                        visibility: false
                    }
                ]
            }}
            groups={[
                {
                    id: 'group_01',
                    title: 'Group 01',
                    visibility: true,
                    expanded: true
                }
            ]}
            layers={[
                {
                    id: 'layer.01',
                    type: 'vector',
                    title: 'Layer 01',
                    group: 'group_01',
                    visibility: false,
                    features: [
                        {
                            type: 'Feature',
                            id: 'feature.01',
                            geometry: {
                                type: 'Polygon',
                                coordinates: [[[0, 0], [0, 1], [1, 1], [0, 0]]]
                            },
                            properties: {}
                        }
                    ]
                }
            ]}
            onResetGroup={(id) => {
                try {
                    expect(id).toBe('group_01');
                } catch (e) {
                    done(e);
                }
                done();
            }}
            expandedSections={{ layers: true }}
            isClippingAvailable
        />, document.getElementById("container"));
        const groupHeaders = document.querySelectorAll('.ms-node-group > .ms-node-header');
        expect(groupHeaders.length).toBe(1);
        const buttons = groupHeaders[0].querySelectorAll('button');
        expect(buttons.length).toBe(3);
        Simulate.click(buttons[2]);
    });

    it('should show toolbar with search input and global link and unlink buttons', () => {
        ReactDOM.render(<LayersSection
            view={{
                id: 'view.01',
                layers: [],
                groups: []
            }}
            groups={[
                {
                    id: 'group_01',
                    title: 'Group 01',
                    visibility: true,
                    expanded: true
                }
            ]}
            layers={[
                {
                    id: 'layer.01',
                    type: 'vector',
                    title: 'Layer 01',
                    group: 'group_01',
                    visibility: false,
                    features: [
                        {
                            type: 'Feature',
                            id: 'feature.01',
                            geometry: {
                                type: 'Polygon',
                                coordinates: [[[0, 0], [0, 1], [1, 1], [0, 0]]]
                            },
                            properties: {}
                        }
                    ]
                }
            ]}
            expandedSections={{ layers: true }}
            isClippingAvailable
        />, document.getElementById("container"));
        const formGroup = document.querySelectorAll('.form-group');
        expect(formGroup.length).toBe(2);
        const input = formGroup[1].querySelector('input');
        expect(input).toBeTruthy();
        const buttons = formGroup[1].querySelectorAll('button');
        expect(buttons.length).toBe(2);
    });

    it('should trigger onChange after clicking to link button', (done) => {
        ReactDOM.render(<LayersSection
            view={{
                id: 'view.01',
                layers: [],
                groups: [
                    {
                        id: 'group_01',
                        visibility: false
                    }
                ]
            }}
            groups={[
                {
                    id: 'group_01',
                    title: 'Group 01',
                    visibility: true,
                    expanded: true
                }
            ]}
            layers={[
                {
                    id: 'layer.01',
                    type: 'vector',
                    title: 'Layer 01',
                    group: 'group_01',
                    visibility: false,
                    features: [
                        {
                            type: 'Feature',
                            id: 'feature.01',
                            geometry: {
                                type: 'Polygon',
                                coordinates: [[[0, 0], [0, 1], [1, 1], [0, 0]]]
                            },
                            properties: {}
                        }
                    ]
                }
            ]}
            onChange={(value) => {
                try {
                    expect(value).toEqual({ groups: undefined, layers: undefined });
                } catch (e) {
                    done(e);
                }
                done();
            }}
            expandedSections={{ layers: true }}
            isClippingAvailable
        />, document.getElementById("container"));
        const formGroup = document.querySelectorAll('.form-group');
        expect(formGroup.length).toBe(2);
        const buttons = formGroup[1].querySelectorAll('button');
        expect(buttons.length).toBe(2);
        Simulate.click(buttons[0]);
    });

    it('should trigger onChange after clicking to unlink button', (done) => {
        ReactDOM.render(<LayersSection
            view={{
                id: 'view.01',
                layers: [],
                groups: [
                    {
                        id: 'group_01',
                        visibility: false
                    }
                ]
            }}
            groups={[
                {
                    id: 'group_01',
                    title: 'Group 01',
                    visibility: true,
                    expanded: true
                }
            ]}
            layers={[
                {
                    id: 'layer.01',
                    type: 'vector',
                    title: 'Layer 01',
                    group: 'group_01',
                    visibility: false,
                    features: [
                        {
                            type: 'Feature',
                            id: 'feature.01',
                            geometry: {
                                type: 'Polygon',
                                coordinates: [[[0, 0], [0, 1], [1, 1], [0, 0]]]
                            },
                            properties: {}
                        }
                    ]
                }
            ]}
            onChange={(value) => {
                try {
                    expect(value).toEqual({
                        groups: [ { id: 'group_01', visibility: false } ],
                        layers: [ { id: 'layer.01', visibility: false } ]
                    });
                } catch (e) {
                    done(e);
                }
                done();
            }}
            expandedSections={{ layers: true }}
            isClippingAvailable
        />, document.getElementById("container"));
        const formGroup = document.querySelectorAll('.form-group');
        expect(formGroup.length).toBe(2);
        const buttons = formGroup[1].querySelectorAll('button');
        expect(buttons.length).toBe(2);
        Simulate.click(buttons[1]);
    });
});
