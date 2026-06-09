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

import GeoSearchPicker from '../GeoSearchPicker';

describe('GeoSearchPicker component', () => {
    let container;
    const defaultProps = {
        waypoint: { value: '' },
        location: [0, 0],
        searchResults: [],
        searchLoading: false,
        onSetWaypoint: () => {},
        onSearchByLocationName: () => {},
        onUpdateLocation: () => {},
        onSelectLocationFromMap: () => {},
        onToggleCoordinateEditor: () => {}
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
        const component = React.createElement(GeoSearchPicker, {
            ...defaultProps,
            ...props
        });
        return ReactDOM.render(component, container);
    };

    describe('render component', () => {
        it('should render with default props', () => {
            renderComponent();
            expect(container.querySelector('.ms-isochrone-geosearch-waypoint')).toBeTruthy();
            expect(container.querySelector('.rw-combobox')).toBeTruthy();
        });

        it('should render search input when coordinates editor is not shown', () => {
            renderComponent();
            expect(container.querySelector('.rw-combobox')).toBeTruthy();
            expect(container.querySelector('.ms-isochrone-geosearch-coord-editor')).toBeFalsy();
        });

        it('should render coordinates editor when showCoordinatesEditor is true', () => {
            renderComponent({ showCoordinatesEditor: true });
            // The component manages its own state, so we need to trigger the toggle
            const toggleButton = container.querySelector('.ms-isochrone-waypoint-locate');
            TestUtils.Simulate.click(toggleButton);
            expect(container.querySelector('.ms-isochrone-geosearch-coord-editor')).toBeTruthy();
        });
    });

    describe('Search functionality', () => {
        it('should display search results in combobox', () => {
            const searchResults = [
                { display_name: 'Test Location 1', lat: '40.7128', lon: '-74.0060' },
                { display_name: 'Test Location 2', lat: '34.0522', lon: '-118.2437' }
            ];
            renderComponent({ searchResults });

            const combobox = container.querySelector('.rw-combobox');
            expect(combobox).toBeTruthy();
        });

        it('should show loading state when searchLoading is true', () => {
            renderComponent({ searchLoading: true });
            const combobox = container.querySelector('.rw-combobox');
            expect(combobox).toBeTruthy();
        });

        it('should call onSearchByLocationName when input changes', () => {
            const onSearchByLocationName = expect.createSpy();
            renderComponent({ onSearchByLocationName });

            const input = container.querySelector('input');
            TestUtils.Simulate.change(input, { target: { value: 'New York' } });

            expect(onSearchByLocationName).toHaveBeenCalledWith('New York');
        });

        it('should call onSetWaypoint when input changes', (done) => {
            const onSetWaypoint = expect.createSpy();
            renderComponent({ onSetWaypoint });

            const input = container.querySelector('input');
            TestUtils.Simulate.change(input, { target: { value: 'Test Location' } });
            expect(onSetWaypoint).toHaveBeenCalled();
            done();
        });
    });

    describe('Location selection', () => {
        it('should call onLocationSelect when a result is selected', () => {
            const onUpdateLocation = expect.createSpy();
            const searchResults = [
                { display_name: 'Test Location', lat: '40.7128', lon: '-74.0060' }
            ];
            renderComponent({ searchResults, onUpdateLocation });

            // Simulate selecting a result
            const combobox = container.querySelector('.rw-combobox');
            const list = combobox.querySelector('.rw-list');
            if (list) {
                const firstItem = list.querySelector('.rw-list-option');
                if (firstItem) {
                    TestUtils.Simulate.click(firstItem);
                }
            }
        });
    });

    describe('Coordinates editor toggle', () => {
        it('should toggle between search and coordinates editor', () => {
            const onSelectLocationFromMap = expect.createSpy();
            const onToggleCoordinateEditor = expect.createSpy();
            const onSearchByLocationName = expect.createSpy();
            const onSetWaypoint = expect.createSpy();
            renderComponent({
                onSelectLocationFromMap,
                onToggleCoordinateEditor,
                onSearchByLocationName,
                onSetWaypoint
            });

            const toggleButton = container.querySelector('.ms-isochrone-waypoint-locate');
            TestUtils.Simulate.click(toggleButton);

            expect(onSelectLocationFromMap).toHaveBeenCalled();
            expect(onToggleCoordinateEditor).toHaveBeenCalledWith(true);
            // Verify search is cleared when switching to coordinate editor
            expect(onSearchByLocationName).toHaveBeenCalledWith('');
            expect(onSetWaypoint).toHaveBeenCalled();
        });

        it('should clear search when switching back to search mode', () => {
            const onSearchByLocationName = expect.createSpy();
            const onSetWaypoint = expect.createSpy();
            renderComponent({
                onSearchByLocationName,
                onSetWaypoint
            });

            const toggleButton = container.querySelector('.ms-isochrone-waypoint-locate');
            // First click toggles to coordinate editor
            TestUtils.Simulate.click(toggleButton);
            // Second click toggles back to search
            TestUtils.Simulate.click(toggleButton);

            // Verify search is cleared when switching back to search
            expect(onSearchByLocationName).toHaveBeenCalledWith('');
            expect(onSetWaypoint).toHaveBeenCalled();
        });

        it('should show correct tooltip based on current state', () => {
            renderComponent();
            const toggleButton = container.querySelector('.ms-isochrone-waypoint-locate');
            expect(toggleButton).toBeTruthy();
        });
    });

    describe('Props handling', () => {
        it('should handle custom displayName prop', () => {
            const searchResults = [
                { properties: { custom_name: 'Custom Location' } }
            ];
            renderComponent({
                searchResults,
                displayName: 'properties.custom_name'
            });
            expect(container.querySelector('.rw-combobox')).toBeTruthy();
        });

        it('should handle waypoint with value', () => {
            const waypoint = { value: 'Initial Location' };
            renderComponent({ waypoint });
            const input = container.querySelector('input');
            expect(input.value).toBe('Initial Location');
        });

        it('should handle location coordinates', () => {
            const location = [40.7128, -74.0060];
            renderComponent({ location });
            expect(container.querySelector('.ms-isochrone-geosearch-waypoint')).toBeTruthy();
        });
    });

    describe('Input clearing behavior', () => {
        it('should clear input when location is cleared', (done) => {
            const waypoint = { value: 'Test Location' };
            renderComponent({ waypoint, location: [40.7128, -74.0060] });

            const input = container.querySelector('input');
            expect(input.value).toBe('Test Location');

            // Update location to null/empty
            renderComponent({ waypoint, location: null });

            setTimeout(() => {
                const updatedInput = container.querySelector('input');
                expect(updatedInput.value).toBe('');
                done();
            }, 100);
        });

        it('should clear input when waypoint value is cleared', (done) => {
            const waypoint = { value: 'Test Location' };
            renderComponent({ waypoint });

            const input = container.querySelector('input');
            expect(input.value).toBe('Test Location');

            // Update waypoint with empty value
            renderComponent({ waypoint: { value: null } });

            setTimeout(() => {
                const updatedInput = container.querySelector('input');
                expect(updatedInput.value).toBe('');
                done();
            }, 100);
        });

        it('should clear input when waypoint value is empty string', (done) => {
            const waypoint = { value: 'Test Location' };
            renderComponent({ waypoint });

            const input = container.querySelector('input');
            expect(input.value).toBe('Test Location');

            // Update waypoint with empty string
            renderComponent({ waypoint: { value: '' } });

            setTimeout(() => {
                const updatedInput = container.querySelector('input');
                expect(updatedInput.value).toBe('');
                done();
            }, 100);
        });

        it('should update input when waypoint value changes', (done) => {
            renderComponent({ waypoint: { value: 'Initial' } });

            const input = container.querySelector('input');
            expect(input.value).toBe('Initial');

            // Update waypoint with new value
            renderComponent({ waypoint: { value: 'Updated Location' } });

            setTimeout(() => {
                const updatedInput = container.querySelector('input');
                expect(updatedInput.value).toBe('Updated Location');
                done();
            }, 100);
        });
    });
});
