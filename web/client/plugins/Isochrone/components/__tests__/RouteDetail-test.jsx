/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import TestUtils from 'react-dom/test-utils';

import RouteDetail from '../RouteDetail';

describe('RouteDetail component', () => {
    let container;
    const mockIsochroneData = [
        {
            layer: {
                id: 'isochrone_run_0',
                name: 'Test Isochrone',
                visibility: true,
                opacity: 0.8,
                features: [
                    {
                        type: 'Feature',
                        geometry: { type: 'Polygon', coordinates: [] },
                        properties: {}
                    }
                ],
                style: {
                    body: {
                        rules: [
                            {
                                name: 'isochrone_rule',
                                symbolizers: []
                            }
                        ]
                    }
                }
            },
            bbox: [40.7, -74.1, 40.8, -74.0],
            config: {
                distance_limit: 1000,
                time_limit: null,
                location: [-74.0060, 40.7128]
            }
        }
    ];

    const mockIsochroneLayers = [
        {
            id: 'isochrone_marker_0',
            options: {
                features: [
                    {
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: [-74.0060, 40.7128] },
                        properties: { name: 'Start Point' }
                    }
                ],
                style: {
                    body: {
                        rules: [
                            {
                                name: 'marker_rule',
                                symbolizers: []
                            }
                        ]
                    }
                }
            }
        }
    ];

    const defaultProps = {
        isochroneData: mockIsochroneData,
        isochroneLayers: mockIsochroneLayers,
        onLayerPropertyChange: expect.createSpy(),
        onAddAsLayer: expect.createSpy()
    };

    beforeEach((done) => {
        container = document.createElement('div');
        document.body.appendChild(container);
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(container);
        document.body.removeChild(container);
        setTimeout(done);
    });

    const renderComponent = (props = {}) => {
        const component = React.createElement(RouteDetail, {
            ...defaultProps,
            ...props
        });
        return ReactDOM.render(component, container);
    };

    describe('Basic rendering', () => {
        it('should render with default props', () => {
            renderComponent();
            expect(container.querySelector('.ms-isochrone-area-detail')).toBeTruthy();
        });

        it('should render layer containers for each isochrone data item', () => {
            renderComponent();
            const layerContainers = container.querySelectorAll('.ms-isochrone-layer-container');
            expect(layerContainers.length).toBe(1);
        });

        it('should render layer header with visibility toggle', (done) => {
            renderComponent();
            expect(container.querySelector('.ms-isochrone-layer-header-container')).toBeTruthy();
            expect(container.querySelector('.ms-isochrone-layer-header')).toBeTruthy();
            done();
        });

        it('should render layer information', () => {
            renderComponent();
            const layerInfo = container.querySelector('.ms-isochrone-layer-header');
            expect(layerInfo).toBeTruthy();
        });

        it('should render dropdown menu', () => {
            renderComponent();
            const dropdown = container.querySelector('.ms-isochrone-options');
            expect(dropdown).toBeTruthy();
        });

        it('should render opacity slider', (done) => {
            renderComponent();
            const slider = container.querySelector('.mapstore-slider');
            expect(slider).toBeTruthy();
            done();
        });
    });

    describe('Layer information display', () => {
        it('should display distance information for distance-based isochrone', () => {
            renderComponent({
                isochroneData: [{
                    ...mockIsochroneData[0],
                    config: {
                        location: [-74.0060, 40.7128],
                        distanceLimit: 1000,
                        timeLimit: null
                    }
                }]
            });
            const layerInfo = container.querySelector('.ms-isochrone-layer-header');
            expect(layerInfo.textContent).toEqual('Lat: 40.71, Lon: -74.01 | isochrone.distance: 1000 km');
        });

        it('should display time information for time-based isochrone', () => {
            const timeBasedData = [{
                ...mockIsochroneData[0],
                config: {
                    location: [-74.0060, 40.7128],
                    distanceLimit: null,
                    timeLimit: 300
                }
            }];
            renderComponent({ isochroneData: timeBasedData });
            const layerInfo = container.querySelector('.ms-isochrone-layer-header');
            expect(layerInfo.textContent).toEqual('Lat: 40.71, Lon: -74.01 | isochrone.time: 300 min');
        });
    });

    describe('Visibility toggle', () => {
        it('should call onLayerPropertyChange when visibility is toggled', () => {
            const onLayerPropertyChange = expect.createSpy();
            renderComponent({ onLayerPropertyChange });

            const visibilityCheck = container.querySelector('input[type="checkbox"]');
            if (visibilityCheck) {
                TestUtils.Simulate.change(visibilityCheck, { target: { checked: false } });
                expect(onLayerPropertyChange).toHaveBeenCalled();
            }
        });
    });

    it('test opacity slider', () => {
        renderComponent();
        const slider = container.querySelector('.mapstore-slider');
        expect(slider).toBeTruthy();
    });

    describe('Dropdown menu actions', () => {

        it('should call onAddAsLayer when add as layer is clicked', (done) => {
            const onAddAsLayer = expect.createSpy();
            renderComponent({ onAddAsLayer, isochroneLayers: mockIsochroneLayers });

            const dropdown = container.querySelector('.ms-isochrone-options');
            TestUtils.Simulate.click(dropdown);

            const menuItems = container.querySelectorAll('.dropdown-menu li');
            expect(menuItems.length).toBe(4);
            TestUtils.Simulate.click(menuItems[2]);
            setTimeout(() => expect(onAddAsLayer).toHaveBeenCalled());
            done();
        });
        it('should call onDeleteLayer when delete layer is clicked', (done) => {
            const onDeleteLayer = expect.createSpy();
            const onDeleteIsochroneData = expect.createSpy();
            renderComponent({ onDeleteLayer, onDeleteIsochroneData, isochroneLayers: mockIsochroneLayers });

            const dropdown = container.querySelector('.ms-isochrone-options');
            TestUtils.Simulate.click(dropdown);

            const menuItems = container.querySelectorAll('.dropdown-menu li');
            expect(menuItems.length).toBe(4);
            TestUtils.Simulate.click(menuItems[3]);
            setTimeout(() => {
                expect(onDeleteLayer).toHaveBeenCalled();
                expect(onDeleteIsochroneData).toHaveBeenCalled();
            });
            done();
        });
        it('should call onSetCurrentRunParameters when delete layer is clicked', (done) => {
            const onSetCurrentRunParameters = expect.createSpy();
            const onUpdateLocation = expect.createSpy();
            renderComponent({ onSetCurrentRunParameters, onUpdateLocation, isochroneLayers: mockIsochroneLayers });

            const dropdown = container.querySelector('.ms-isochrone-options');
            TestUtils.Simulate.click(dropdown);

            const menuItems = container.querySelectorAll('.dropdown-menu li');
            expect(menuItems.length).toBe(4);
            TestUtils.Simulate.click(menuItems[0]);
            setTimeout(() => {
                expect(onSetCurrentRunParameters).toHaveBeenCalled();
                expect(onUpdateLocation).toHaveBeenCalled();
            });
            done();
        });
    });

    it('should render nothing when isochroneData is empty', () => {
        renderComponent({ isochroneData: [] });
        const layerContainers = container.querySelectorAll('.ms-isochrone-layer-container');
        expect(layerContainers.length).toBe(0);
    });

    it('should handle missing isochroneData', () => {
        renderComponent({ isochroneData: null });
        expect(container.querySelector('.ms-isochrone-area-detail')).toBeTruthy();
    });

    describe('Layer property changes', () => {
        it('should update both run and marker layers when properties change', () => {
            const onLayerPropertyChange = expect.createSpy();
            renderComponent({ onLayerPropertyChange });

            const visibilityCheck = container.querySelector('input[type="checkbox"]');
            if (visibilityCheck) {
                TestUtils.Simulate.change(visibilityCheck, { target: { checked: false } });

                expect(onLayerPropertyChange).toHaveBeenCalled();
            }
        });
    });

    it('should handle missing isochroneLayers', () => {
        renderComponent({ isochroneLayers: null });
        expect(container.querySelector('.ms-isochrone-area-detail')).toBeTruthy();
    });
});
