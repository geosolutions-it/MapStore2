/*
 * Copyright 2025, GeoSolutions.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import { Simulate } from 'react-dom/test-utils';
import { FilterView } from '../FilterView';

describe('FilterView component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    const createMockFilterData = (variant = 'button', selectionMode = 'single', options = {}) => ({
        id: 'test-filter-1',
        layout: {
            variant,
            label: 'Test Filter',
            icon: 'filter',
            selectionMode: selectionMode,
            ...options
        }
    });

    const mockSelectableItems = [
        { id: '1', label: 'Option 1' },
        { id: '2', label: 'Option 2' }
    ];


    it('returns null when filterData is missing', () => {
        const container = document.getElementById("container");
        ReactDOM.render(<FilterView />, container);
        expect(container.innerHTML).toBe('');
    });

    it('returns null when componentMap does not contain the variant', () => {
        const container = document.getElementById("container");
        const filterData = createMockFilterData('unknown-variant');
        ReactDOM.render(
            <FilterView
                filterData={filterData}
                componentMap={{}}
            />,
            container
        );
        expect(container.innerHTML).toBe('');
    });

    it('renders button component when variant is button', () => {
        const container = document.getElementById("container");
        const filterData = createMockFilterData('button');

        ReactDOM.render(
            <FilterView
                filterData={filterData}
                selectableItems={mockSelectableItems}
            />,
            container
        );

        expect(document.querySelector('.ms-filter-button-list-item')).toExist();
    });

    it('renders checkbox component when variant is checkbox, single selection', () => {
        const container = document.getElementById("container");
        const filterData = createMockFilterData('checkbox');

        ReactDOM.render(
            <FilterView
                filterData={filterData}
                selectableItems={mockSelectableItems}
            />,
            container
        );

        expect(document.querySelector('input[type="radio"]')).toExist();
    });
    it('renders checkbox component when variant is checkbox, multiselect', () => {
        const container = document.getElementById("container");
        const filterData = createMockFilterData('checkbox', 'multiple');

        ReactDOM.render(
            <FilterView
                filterData={filterData}
                selectableItems={mockSelectableItems}
            />,
            container
        );
        expect(document.querySelector('input[type="checkbox"]')).toExist();
    });

    it('renders switch component when variant is switch', () => {
        const container = document.getElementById("container");
        const filterData = createMockFilterData('switch');

        ReactDOM.render(
            <FilterView
                filterData={filterData}
                selectableItems={mockSelectableItems}
            />,
            container
        );

        expect(container.querySelector('.mapstore-switch-btn')).toExist();
    });

    it('renders dropdown component when variant is dropdown, single', () => {
        const container = document.getElementById("container");
        const filterData = createMockFilterData('dropdown');

        ReactDOM.render(
            <FilterView
                filterData={filterData}
                selectableItems={mockSelectableItems}
            />,
            container
        );
        expect(container.querySelector('.ms-filter-dropdown.Select--single')).toExist();

    });
    it('renders dropdown component when variant is dropdown, multiple', () => {
        const container = document.getElementById("container");
        const filterData = createMockFilterData('dropdown', 'multiple');

        ReactDOM.render(
            <FilterView
                filterData={filterData}
                selectableItems={mockSelectableItems}
            />,
            container
        );
        expect(container.querySelector('.ms-filter-dropdown.Select--multi')).toExist();

    });

    it('shows missing parameters message when missingParameters is true', () => {
        const container = document.getElementById("container");
        const filterData = createMockFilterData('button');

        ReactDOM.render(
            <FilterView
                filterData={filterData}
                missingParameters
                selectableItems={mockSelectableItems}
            />,
            container
        );

        expect(container.innerHTML).toExist();
        // Check for the message id
        expect(container.textContent).toContain('widgets.filterWidget.missingParametersMessage');
        // Also verify the container class is present
        expect(container.querySelector('.ms-filter-builder-mock-previews')).toExist();
    });

    it('shows loading spinner when loading is true', () => {
        const container = document.getElementById("container");
        const filterData = createMockFilterData('button');

        ReactDOM.render(
            <FilterView
                filterData={filterData}
                loading
                selectableItems={mockSelectableItems}
            />,
            container
        );

        expect(container.innerHTML).toExist();
        // Check for loading overlay div that wraps LoadingSpinner
        const loadingOverlay = container.querySelector('div[style*="position: absolute"]');
        expect(loadingOverlay).toExist();
    });

    it('shows error message when fetchError is true', () => {
        const container = document.getElementById("container");
        const filterData = createMockFilterData('button');

        ReactDOM.render(
            <FilterView
                filterData={filterData}
                fetchError
                selectableItems={mockSelectableItems}
            />,
            container
        );

        expect(container.innerHTML).toExist();
        // Check for the warning icon
        expect(container.querySelector('.glyphicon-warning-sign')).toExist();
        // Check for the error message translation key
        expect(container.textContent).toContain('widgets.filterWidget.fetchError');
    });

    it('does not call onSelectionChange when forceSelection is true and user clicks checkbox with value 1 to deselect', () => {
        const container = document.getElementById("container");
        const onSelectionChangeSpy = expect.createSpy();
        const filterData = createMockFilterData('checkbox', 'multiple', { forceSelection: true });

        ReactDOM.render(
            <FilterView
                filterData={filterData}
                selectableItems={mockSelectableItems}
                selections={['1']}
                onSelectionChange={onSelectionChangeSpy}
            />,
            container
        );

        // Checkbox for value 1 (Option 1) is the first checkbox in the list
        const checkboxForOption1 = container.querySelector('.ms-filter-checkbox-list input[type="checkbox"]');
        expect(checkboxForOption1).toExist();
        // Click to uncheck (deselect) - with forceSelection on, onSelectionChange must not be called
        Simulate.change(checkboxForOption1, { target: { checked: false } });

        expect(onSelectionChangeSpy).toNotHaveBeenCalled();
    });
});

