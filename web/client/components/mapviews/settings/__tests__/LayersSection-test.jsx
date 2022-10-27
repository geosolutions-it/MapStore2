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
        expect(inputNodes.length).toBe(1);
        expect([...inputNodes].map(node => node.getAttribute('type'))).toEqual(['checkbox']);
    });
    it('should display terrain node', () => {
        ReactDOM.render(<LayersSection
            expandedSections={{ layers: true }}
            isTerrainAvailable
        />, document.getElementById("container"));
        const sectionNode = document.querySelector('.ms-map-views-section');
        expect(sectionNode).toBeTruthy();
        const layerNodes = [...document.querySelectorAll('.ms-map-views-layer-node')];
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
        const layerNodes = [...document.querySelectorAll('.ms-map-views-layer-node')];
        expect(layerNodes.length).toBe(2);
        const layerButtonNodes = [...layerNodes[0].querySelectorAll('button')];
        expect(layerButtonNodes.length).toBe(2);
        const changedLayerNodes = [...document.querySelectorAll('.ms-map-views-layer-node.changed')];
        expect(changedLayerNodes.length).toBe(1);
        const changedLayerButtonNodes = [...changedLayerNodes[0].querySelectorAll('button')];
        expect(changedLayerButtonNodes.length).toBe(3);
    });
});
