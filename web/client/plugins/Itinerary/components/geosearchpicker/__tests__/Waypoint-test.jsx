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

import Waypoint from '../Waypoint';
import { DragDropContext as dragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

const WaypointComponent = dragDropContext(HTML5Backend)(Waypoint);

describe('Waypoint Component', () => {
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

    const mockWaypoint = { id: 1, value: 'Paris' };
    const mockLocations = [[2.3522, 48.8566], [4.8320, 45.7578]];
    const mockSearchResults = [
        {
            properties: {
                display_name: 'Paris, France',
                type: 'city'
            },
            lat: 48.8566,
            lon: 2.3522
        }
    ];

    const defaultProps = {
        waypoint: mockWaypoint,
        index: 0,
        waypoints: [{id: 1}, {id: 2}, {id: 3}],
        locations: mockLocations,
        onLocationChange: () => {},
        onLocationSelect: () => {},
        onSearchByLocationName: () => {},
        searchResults: mockSearchResults,
        searchLoading: false,
        onRemoveWaypoint: () => {},
        onSelectLocationFromMap: () => {},
        onToggleCoordinateEditor: () => {},
        isDraggable: true,
        isDragging: false,
        isOver: false
    };

    it('should render waypoint container', () => {
        ReactDOM.render(<WaypointComponent {...defaultProps} />, container);

        const waypointContainer = container.querySelector('.geosearch-waypoint');
        expect(waypointContainer).toBeTruthy();
    });

    it('should render drag handle when draggable', () => {
        ReactDOM.render(<WaypointComponent {...defaultProps} />, container);

        const dragHandle = container.querySelector('.drag-handle');
        expect(dragHandle).toBeTruthy();
    });

    it('should not render drag handle when not draggable', () => {
        const nonDraggableProps = {
            ...defaultProps,
            isDraggable: false
        };

        ReactDOM.render(<WaypointComponent {...nonDraggableProps} />, container);

        const dragHandle = container.querySelector('.drag-handle');
        expect(dragHandle).toBeFalsy();
    });

    it('should render locate button', () => {
        ReactDOM.render(<WaypointComponent {...defaultProps} />, container);

        const locateButton = container.querySelector('.waypoint-locate');
        expect(locateButton).toBeTruthy();
    });

    it('should render delete button when draggable and waypoints length is greater than 2', () => {
        ReactDOM.render(<WaypointComponent {...defaultProps} />, container);

        const deleteButton = container.querySelector('.waypoint-delete');
        expect(deleteButton).toBeTruthy();
    });

    it('should not render delete button when not draggable', () => {
        const nonDraggableProps = {
            ...defaultProps,
            isDraggable: false
        };

        ReactDOM.render(<WaypointComponent {...nonDraggableProps} />, container);

        const deleteButton = container.querySelector('.waypoint-delete');
        expect(deleteButton).toBeFalsy();
    });

    it('should show SearchAutoComplete by default', () => {
        ReactDOM.render(<WaypointComponent {...defaultProps} />, container);

        const searchComponent = container.querySelector('.geosearch-waypoint');
        expect(searchComponent).toBeTruthy();
    });

    it('should show point icon when coordinate editor is not active', () => {
        ReactDOM.render(<WaypointComponent {...defaultProps} />, container);

        const locateButton = container.querySelector('.waypoint-locate');
        const pointIcon = locateButton.querySelector('.glyphicon-point');
        expect(pointIcon).toBeTruthy();
    });

    it('should call onToggleCoordinateEditor and onSelectLocationFromMap when locate button is clicked', () => {
        let toggleCalled = false;
        let selectLocationCalled = false;
        let updateLocationsCalled = false;

        const mockOnToggleCoordinateEditor = () => {
            toggleCalled = true;
        };

        const mockOnSelectLocationFromMap = () => {
            selectLocationCalled = true;
        };

        const mockOnUpdateLocations = () => {
            updateLocationsCalled = true;
        };


        const propsWithHandlers = {
            ...defaultProps,
            onToggleCoordinateEditor: mockOnToggleCoordinateEditor,
            onSelectLocationFromMap: mockOnSelectLocationFromMap,
            onUpdateLocations: mockOnUpdateLocations
        };

        ReactDOM.render(<WaypointComponent {...propsWithHandlers} />, container);

        const locateButton = container.querySelector('.waypoint-locate');
        ReactTestUtils.Simulate.click(locateButton);

        expect(toggleCalled).toBe(true);
        expect(selectLocationCalled).toBe(true);
        expect(updateLocationsCalled).toBe(true);
    });

    it('should call onRemoveWaypoint when delete button is clicked', () => {
        let removeCalled = false;
        let removeIndex = null;

        const mockOnRemoveWaypoint = (index) => {
            removeCalled = true;
            removeIndex = index;
        };

        const propsWithRemove = {
            ...defaultProps,
            onRemoveWaypoint: mockOnRemoveWaypoint
        };

        ReactDOM.render(<WaypointComponent {...propsWithRemove} />, container);

        const deleteButton = container.querySelector('.waypoint-delete');
        ReactTestUtils.Simulate.click(deleteButton);

        expect(removeCalled).toBe(true);
        expect(removeIndex).toBe(0);
    });

    it('should handle valid coordinates correctly', () => {
        const validLocations = [[2.3522, 48.8566]];
        const propsWithValidCoords = {
            ...defaultProps,
            locations: validLocations,
            index: 0
        };

        ReactDOM.render(<WaypointComponent {...propsWithValidCoords} />, container);

        // Component should render without crashing
        expect(container.querySelector('.geosearch-waypoint')).toBeTruthy();
    });

    it('should handle invalid coordinates gracefully', () => {
        const invalidLocations = [[null, undefined], ['invalid', 'coordinates']];
        const propsWithInvalidCoords = {
            ...defaultProps,
            locations: invalidLocations,
            index: 0
        };

        ReactDOM.render(<WaypointComponent {...propsWithInvalidCoords} />, container);

        // Component should render without crashing
        expect(container.querySelector('.geosearch-waypoint')).toBeTruthy();
    });

    it('should handle missing waypoint value', () => {
        const waypointWithoutValue = { id: 1, value: null };
        const propsWithoutValue = {
            ...defaultProps,
            waypoint: waypointWithoutValue
        };

        ReactDOM.render(<WaypointComponent {...propsWithoutValue} />, container);

        expect(container.querySelector('.geosearch-waypoint')).toBeTruthy();
    });

    it('should handle missing locations array', () => {
        const propsWithoutLocations = {
            ...defaultProps,
            locations: []
        };

        ReactDOM.render(<WaypointComponent {...propsWithoutLocations} />, container);

        expect(container.querySelector('.geosearch-waypoint')).toBeTruthy();
    });

    it('should handle undefined props gracefully', () => {
        ReactDOM.render(<WaypointComponent />, container);

        expect(container.innerHTML).toBeTruthy();
    });

    it('should use default props when not provided', () => {
        ReactDOM.render(<WaypointComponent />, container);

        expect(container.innerHTML).toBeTruthy();
    });

    it('should handle minimal props gracefully', () => {
        const minimalProps = {
            waypoint: mockWaypoint,
            index: 0
        };

        ReactDOM.render(<WaypointComponent {...minimalProps} />, container);

        expect(container.querySelector('.geosearch-waypoint')).toBeTruthy();
    });
});
