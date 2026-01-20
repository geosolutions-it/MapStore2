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

    // Mock components for componentMap
    const MockButtonComponent = () => <div className="mock-button-component" />;
    const MockCheckboxComponent = () => <div className="mock-checkbox-component" />;
    const MockSwitchComponent = () => <div className="mock-switch-component" />;
    const MockDropdownComponent = () => <div className="mock-dropdown-component" />;

    const createMockFilterData = (variant = 'button') => ({
        id: 'test-filter-1',
        layout: {
            variant,
            label: 'Test Filter',
            icon: 'filter',
            selectionMode: 'single'
        }
    });

    const createMockSelectableItems = () => [
        { id: 'item-1', label: 'Item 1' },
        { id: 'item-2', label: 'Item 2' }
    ];

    const createComponentMap = () => ({
        button: MockButtonComponent,
        checkbox: MockCheckboxComponent,
        'switch': MockSwitchComponent,
        dropdown: MockDropdownComponent
    });

    it('returns null when filterData is missing', () => {
        const container = document.getElementById("container");
        ReactDOM.render(<FilterView componentMap={createComponentMap()} />, container);
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
        const componentMap = createComponentMap();
        const selectableItems = createMockSelectableItems();

        ReactDOM.render(
            <FilterView
                filterData={filterData}
                componentMap={componentMap}
                selectableItems={selectableItems}
            />,
            container
        );

        expect(container.innerHTML).toExist();
        expect(document.querySelector('.mock-button-component')).toExist();
    });

    it('renders checkbox component when variant is checkbox', () => {
        const container = document.getElementById("container");
        const filterData = createMockFilterData('checkbox');
        const componentMap = createComponentMap();
        const selectableItems = createMockSelectableItems();

        ReactDOM.render(
            <FilterView
                filterData={filterData}
                componentMap={componentMap}
                selectableItems={selectableItems}
            />,
            container
        );

        expect(container.innerHTML).toExist();
        expect(document.querySelector('.mock-checkbox-component')).toExist();
    });

    it('renders switch component when variant is switch', () => {
        const container = document.getElementById("container");
        const filterData = createMockFilterData('switch');
        const componentMap = createComponentMap();
        const selectableItems = createMockSelectableItems();

        ReactDOM.render(
            <FilterView
                filterData={filterData}
                componentMap={componentMap}
                selectableItems={selectableItems}
            />,
            container
        );

        expect(container.innerHTML).toExist();
        expect(document.querySelector('.mock-switch-component')).toExist();
    });

    it('renders dropdown component when variant is dropdown', () => {
        const container = document.getElementById("container");
        const filterData = createMockFilterData('dropdown');
        const componentMap = createComponentMap();
        const selectableItems = createMockSelectableItems();

        ReactDOM.render(
            <FilterView
                filterData={filterData}
                componentMap={componentMap}
                selectableItems={selectableItems}
            />,
            container
        );

        expect(container.innerHTML).toExist();
        expect(document.querySelector('.mock-dropdown-component')).toExist();
    });

    it('shows missing parameters message when missingParameters is true', () => {
        const container = document.getElementById("container");
        const filterData = createMockFilterData('button');
        const componentMap = createComponentMap();

        ReactDOM.render(
            <FilterView
                filterData={filterData}
                componentMap={componentMap}
                missingParameters
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
        const componentMap = createComponentMap();

        ReactDOM.render(
            <FilterView
                filterData={filterData}
                componentMap={componentMap}
                loading
            />,
            container
        );

        expect(container.innerHTML).toExist();
        // Check for loading overlay div that wraps LoadingSpinner
        const loadingOverlay = container.querySelector('div[style*="position: absolute"]');
        expect(loadingOverlay).toExist();
    });
});

