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

    const createMockFilterData = (variant = 'button', selectionMode = 'single') => ({
        id: 'test-filter-1',
        items: [
            { id: 'item-1', label: 'Item 1' },
            { id: 'item-2', label: 'Item 2' }
        ],
        layout: {
            variant,
            label: 'Test Filter',
            icon: 'filter',
            selectionMode: selectionMode
        }
    });


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
            />,
            container
        );

        expect(container.innerHTML).toExist();
        // Check for loading overlay div that wraps LoadingSpinner
        const loadingOverlay = container.querySelector('div[style*="position: absolute"]');
        expect(loadingOverlay).toExist();
    });
});

