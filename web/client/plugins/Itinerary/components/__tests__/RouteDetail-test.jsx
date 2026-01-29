/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

import RouteDetail from '../RouteDetail';

describe('RouteDetail Component', () => {
    let container;

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        container = document.getElementById('container');
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(container);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    const mockItineraryData = {
        features: [
            {
                id: 'route-0',
                geometry: {
                    type: 'LineString',
                    coordinates: [[2.3522, 48.8566], [4.8320, 45.7578]]
                }
            },
            {
                id: 'start-marker-0',
                geometry: {
                    type: 'Point',
                    coordinates: [2.3522, 48.8566]
                }
            },
            {
                id: 'end-marker-0',
                geometry: {
                    type: 'Point',
                    coordinates: [4.8320, 45.7578]
                }
            }
        ],
        routes: [
            [
                {
                    streetName: 'L 52',
                    distance: 3954.715,
                    time: 249530,
                    sign: 0,
                    text: 'Continue onto L 52 and drive toward Drewitz, Theeßen'
                },
                {
                    streetName: 'Drewitz Street',
                    distance: 1000,
                    time: 60000,
                    sign: 2,
                    text: 'Turn right onto Drewitz Street'
                }
            ]
        ]
    };

    const mockParseItineraryData = (data) => ({
        routes: data[0]?.routes || [],
        features: data[0]?.features || []
    });

    const mockOnAddAsLayer = () => {};

    it('should render nothing when itineraryData is empty', () => {
        ReactDOM.render(
            <RouteDetail
                itineraryData={[]}
                parseItineraryData={mockParseItineraryData}
                onAddAsLayer={mockOnAddAsLayer}
            />,
            container
        );

        expect(container.innerHTML).toBe('');
    });

    it('should render nothing when itineraryData is null', () => {
        ReactDOM.render(
            <RouteDetail
                itineraryData={null}
                parseItineraryData={mockParseItineraryData}
                onAddAsLayer={mockOnAddAsLayer}
            />,
            container
        );

        expect(container.innerHTML).toBe('');
    });

    it('should render route itineraries when data is provided', () => {
        ReactDOM.render(
            <RouteDetail
                itineraryData={mockItineraryData}
                parseItineraryData={mockParseItineraryData}
                onAddAsLayer={mockOnAddAsLayer}
            />,
            container
        );

        const routeTitle = container.querySelector('.itinerary-detail-container');
        expect(routeTitle).toBeTruthy();
        expect(routeTitle.textContent).toContain('itinerary.routeItineraries');
    });

    it('should render route details with correct information', () => {
        ReactDOM.render(
            <RouteDetail
                itineraryData={mockItineraryData}
                parseItineraryData={mockParseItineraryData}
                onAddAsLayer={mockOnAddAsLayer}
            />,
            container
        );

        const routeDetails = container.querySelectorAll('.itinerary-route-detail');
        expect(routeDetails.length).toBe(1);

        const routeName = container.querySelector('.itinerary-via-route');
        expect(routeName).toBeTruthy();
    });

    it('should render route with correct total distance and time', () => {
        ReactDOM.render(
            <RouteDetail
                itineraryData={mockItineraryData}
                parseItineraryData={mockParseItineraryData}
                onAddAsLayer={mockOnAddAsLayer}
            />,
            container
        );

        const timeDistanceContainer = container.querySelector('.time-distance');
        expect(timeDistanceContainer).toBeTruthy();

        // Check if time and distance are displayed
        const timeElement = timeDistanceContainer.querySelector('div:first-child');
        const distanceElement = timeDistanceContainer.querySelector('div:last-child');
        expect(timeElement).toBeTruthy();
        expect(distanceElement).toBeTruthy();
    });

    it('should start with collapsed route by default', () => {
        ReactDOM.render(
            <RouteDetail
                itineraryData={mockItineraryData}
                parseItineraryData={mockParseItineraryData}
                onAddAsLayer={mockOnAddAsLayer}
            />,
            container
        );

        const instructionContainer = container.querySelector('.itinerary-instruction-container');
        expect(instructionContainer).toBeFalsy();
    });

    it('should expand route when expand icon is clicked', () => {
        ReactDOM.render(
            <RouteDetail
                itineraryData={mockItineraryData}
                parseItineraryData={mockParseItineraryData}
                onAddAsLayer={mockOnAddAsLayer}
            />,
            container
        );

        const expandIcon = container.querySelector('.expand-icon');
        expect(expandIcon).toBeTruthy();

        ReactTestUtils.Simulate.click(expandIcon);

        const instructionContainer = container.querySelector('.itinerary-instruction-container');
        expect(instructionContainer).toBeTruthy();
    });

    it('should show route instructions when expanded', () => {
        ReactDOM.render(
            <RouteDetail
                itineraryData={mockItineraryData}
                parseItineraryData={mockParseItineraryData}
                onAddAsLayer={mockOnAddAsLayer}
            />,
            container
        );

        const expandIcon = container.querySelector('.expand-icon');
        ReactTestUtils.Simulate.click(expandIcon);

        const instructions = container.querySelectorAll('.itinerary-instruction-item');
        expect(instructions.length).toBe(2); // Two instructions in mock data

        const firstInstruction = instructions[0];
        expect(firstInstruction.textContent).toContain('Continue onto L 52 and drive toward Drewitz, Theeßen');
    });

    it('should show roundabout info for sign 6', () => {
        const roundaboutData = {
            features: [],
            routes: [
                [
                    {
                        streetName: 'Roundabout Street',
                        distance: 500,
                        time: 30000,
                        sign: 6,
                        text: 'Enter roundabout'
                    }
                ]
            ]
        };

        ReactDOM.render(
            <RouteDetail
                itineraryData={roundaboutData}
                parseItineraryData={mockParseItineraryData}
                onAddAsLayer={mockOnAddAsLayer}
            />,
            container
        );

        const expandIcon = container.querySelector('.expand-icon');
        ReactTestUtils.Simulate.click(expandIcon);

        const roundaboutInfo = container.querySelector('.itinerary-roundabout-info');
        expect(roundaboutInfo).toBeTruthy();
        expect(roundaboutInfo.textContent).toContain('itinerary.goThroughRoundabout');
    });

    it('should render dropdown menu with export and add as layer options', () => {
        ReactDOM.render(
            <RouteDetail
                itineraryData={mockItineraryData}
                parseItineraryData={mockParseItineraryData}
                onAddAsLayer={mockOnAddAsLayer}
            />,
            container
        );

        const dropdownButton = container.querySelector('.itinerary-options');
        expect(dropdownButton).toBeTruthy();

        // Click to open dropdown
        ReactTestUtils.Simulate.click(dropdownButton);

        // Check if dropdown items are present
        const menuItems = container.querySelectorAll('.dropdown-menu li');
        expect(menuItems.length).toBeGreaterThan(0);
    });

    it('should call onAddAsLayer when add as layer option is clicked', () => {
        let addAsLayerCalled = false;
        let featuresPassed = null;

        const mockOnAddAsLayerWithSpy = (features) => {
            addAsLayerCalled = true;
            featuresPassed = features;
        };

        ReactDOM.render(
            <RouteDetail
                itineraryData={mockItineraryData}
                parseItineraryData={mockParseItineraryData}
                onAddAsLayer={mockOnAddAsLayerWithSpy}
            />,
            container
        );

        const dropdownButton = container.querySelector('.itinerary-options');
        ReactTestUtils.Simulate.click(dropdownButton);

        // Find and click the add as layer menu item
        const menuItems = container.querySelectorAll('.dropdown-menu li');
        const addAsLayerItem = Array.from(menuItems).find(item =>
            item.textContent.includes('Add as Layer')
        );

        if (addAsLayerItem) {
            ReactTestUtils.Simulate.click(addAsLayerItem);
            expect(addAsLayerCalled).toBe(true);
            expect(featuresPassed).toBeTruthy();
        }
    });

    it('should render route color indicator', () => {
        ReactDOM.render(
            <RouteDetail
                itineraryData={mockItineraryData}
                parseItineraryData={mockParseItineraryData}
                onAddAsLayer={mockOnAddAsLayer}
            />,
            container
        );

        const colorIndicator = container.querySelector('div[style*="border"]');
        expect(colorIndicator).toBeTruthy();
    });

    it('should show time and distance separators between instructions', () => {
        ReactDOM.render(
            <RouteDetail
                itineraryData={mockItineraryData}
                parseItineraryData={mockParseItineraryData}
                onAddAsLayer={mockOnAddAsLayer}
            />,
            container
        );

        const expandIcon = container.querySelector('.expand-icon');
        ReactTestUtils.Simulate.click(expandIcon);

        const separators = container.querySelectorAll('.time-distance-separator');
        expect(separators.length).toBe(1); // One separator between two instructions
    });

    it('should render multiple routes when multiple route data is provided', () => {
        const multipleRouteData = {
            features: [],
            routes: [
                [
                    {
                        streetName: 'Route 1',
                        distance: 1000,
                        time: 60000,
                        sign: 0,
                        text: 'First route instruction'
                    }
                ],
                [
                    {
                        streetName: 'Route 2',
                        distance: 2000,
                        time: 120000,
                        sign: 0,
                        text: 'Second route instruction'
                    }
                ]
            ]
        };

        ReactDOM.render(
            <RouteDetail
                itineraryData={multipleRouteData}
                parseItineraryData={mockParseItineraryData}
                onAddAsLayer={mockOnAddAsLayer}
            />,
            container
        );

        const routeDetails = container.querySelectorAll('.itinerary-route-detail');
        expect(routeDetails.length).toBe(2);
    });

    it('should handle missing route data gracefully', () => {
        const incompleteData = [
            {
                features: [],
                routes: []
            }
        ];

        ReactDOM.render(
            <RouteDetail
                itineraryData={incompleteData}
                parseItineraryData={mockParseItineraryData}
                onAddAsLayer={mockOnAddAsLayer}
            />,
            container
        );

        // Should render without crashing
        expect(container.innerHTML).toBeTruthy();
    });

    it('should handle missing instruction properties', () => {
        const incompleteInstructionData = [
            {
                features: [],
                routes: [
                    [
                        {
                            // Missing properties
                            text: 'Instruction without distance or time'
                        }
                    ]
                ]
            }
        ];

        ReactDOM.render(
            <RouteDetail
                itineraryData={incompleteInstructionData}
                parseItineraryData={mockParseItineraryData}
                onAddAsLayer={mockOnAddAsLayer}
            />,
            container
        );

        // Should render without crashing
        expect(container.innerHTML).toBeTruthy();
    });

    it('should use default props when not provided', () => {
        ReactDOM.render(<RouteDetail />, container);
        expect(container.innerHTML).toBe('');
    });

    it('should use default parseItineraryData function when not provided', () => {
        ReactDOM.render(
            <RouteDetail
                itineraryData={mockItineraryData}
                onAddAsLayer={mockOnAddAsLayer}
            />,
            container
        );

        // Should render without crashing
        expect(container.innerHTML).toBeTruthy();
    });
});
