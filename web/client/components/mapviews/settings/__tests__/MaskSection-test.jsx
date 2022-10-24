/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import MaskSection from '../MaskSection';
import expect from 'expect';

describe('MaskSection component', () => {
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
        ReactDOM.render(<MaskSection />, document.getElementById("container"));
        const sectionNode = document.querySelector('.ms-map-views-section');
        expect(sectionNode).toBeTruthy();
    });
    it('should display three inputs and a select if expanded', () => {
        ReactDOM.render(<MaskSection expandedSections={{ mask: true }}/>, document.getElementById("container"));
        const sectionNode = document.querySelector('.ms-map-views-section');
        expect(sectionNode).toBeTruthy();
        const inputNodes = document.querySelectorAll('input');
        expect(inputNodes.length).toBe(3);
        expect([...inputNodes].map(node => node.getAttribute('type')))
            .toEqual([ 'checkbox', 'checkbox', 'number' ]);
        const selectNode = document.querySelector('.Select ');
        expect(selectNode).toBeTruthy();
    });
    it('should display a error message if the mask layer does not contain polygon or multi polygon features', () => {
        ReactDOM.render(<MaskSection
            expandedSections={{ mask: true }}
            view={{
                mask: {
                    resourceId: 'resource.01',
                    enabled: true
                }
            }}
            resources={[
                {
                    id: 'resource.01',
                    data: {
                        type: 'wfs',
                        url: '/geoserver/wfs',
                        name: 'clip',
                        title: {
                            'default': 'Clip'
                        },
                        id: 'layer.01',
                        collection: {
                            features: [
                                {
                                    type: 'Feature',
                                    id: 'feature.01',
                                    geometry: {
                                        type: 'Point',
                                        coordinates: [0, 0]
                                    },
                                    properties: {}
                                }
                            ]
                        }
                    }
                }
            ]}
        />, document.getElementById("container"));
        const sectionNode = document.querySelector('.ms-map-views-section');
        expect(sectionNode).toBeTruthy();
        const alertNode = document.querySelector('.alert > span');
        expect(alertNode).toBeTruthy();
        expect(alertNode.innerHTML).toBe('mapViews.maskLayerPolygonError');
    });
    it('should display a warning message if there are other polygon layer visible', () => {
        ReactDOM.render(<MaskSection
            expandedSections={{ mask: true }}
            view={{
                mask: {
                    enabled: true
                },
                layers: [
                    {
                        id: 'layer.01',
                        visibility: true
                    }
                ]
            }}
            vectorLayers={[
                {
                    id: 'layer.01',
                    type: 'vector',
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
        />, document.getElementById("container"));
        const sectionNode = document.querySelector('.ms-map-views-section');
        expect(sectionNode).toBeTruthy();
        const alertNode = document.querySelector('.alert > span');
        expect(alertNode).toBeTruthy();
        expect(alertNode.innerHTML).toBe('mapViews.maskOtherVisibleLayerWarning');
    });
});
