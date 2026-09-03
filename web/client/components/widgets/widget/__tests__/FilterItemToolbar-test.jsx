/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import { Simulate } from 'react-dom/test-utils';

import FilterItemToolbar from '../FilterItemToolbar';

const filterDataFeatures = {
    id: 'f-1',
    disabled: false,
    data: { dataSource: 'features', layer: { id: 'l1', name: 'test' } }
};

describe('FilterItemToolbar component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('renders the toggle switch for Disable component', () => {
        const container = document.getElementById('container');
        ReactDOM.render(
            <FilterItemToolbar
                showDisableToggle
                filterData={filterDataFeatures}
                onToggleDisabled={() => {}}
            />,
            container
        );
        const toggle = container.querySelector('.mapstore-switch-btn-xs input[type="checkbox"]');
        expect(toggle).toExist();
    });

    it('invokes onToggleDisabled when the toggle switch is clicked', () => {
        const container = document.getElementById('container');
        let clicked = false;
        ReactDOM.render(
            <FilterItemToolbar
                showDisableToggle
                filterData={filterDataFeatures}
                onToggleDisabled={(disabled) => { clicked = disabled; }}
            />,
            container
        );
        const toggle = container.querySelector('.mapstore-switch-btn-xs input[type="checkbox"]');
        Simulate.change(toggle);
        expect(clicked).toBe(true);
    });

    it('renders the collapse toggle for Collapse component', () => {
        const container = document.getElementById('container');
        ReactDOM.render(
            <FilterItemToolbar
                showCollapseToggle
                filterData={filterDataFeatures}
                collapsed={false}
                onToggleCollapse={() => {}}
            />,
            container
        );
        const collapseBtn = container.querySelector('.ms-filter-collapse-toggle');
        expect(collapseBtn).toExist();
    });

    it('invokes onToggleCollapse when the collapse button is clicked', () => {
        const container = document.getElementById('container');
        let clicked = false;
        ReactDOM.render(
            <FilterItemToolbar
                showCollapseToggle
                filterData={filterDataFeatures}
                collapsed={false}
                onToggleCollapse={() => { clicked = true; }}
            />,
            container
        );
        const collapseBtn = container.querySelector('.ms-filter-collapse-toggle');
        Simulate.click(collapseBtn);
        expect(clicked).toBe(true);
    });

    it('renders zoom button when showZoomButton is true', () => {
        const container = document.getElementById('container');
        let zoomed = false;
        ReactDOM.render(
            <FilterItemToolbar
                filterData={filterDataFeatures}
                showZoomButton
                showDisableToggle
                onToggleDisabled={() => {}}
                onZoomToFilterExtent={() => { zoomed = true; }}
            />,
            container
        );
        const buttons = container.querySelectorAll('.ms-filter-card-toolbar button');
        expect(buttons.length).toBe(1);
        expect(buttons[0].querySelector('.glyphicon-zoom-to')).toExist();
        Simulate.click(buttons[0]);
        expect(zoomed).toBe(true);
    });

    it('disables zoom button when filter is disabled', () => {
        const container = document.getElementById('container');
        ReactDOM.render(
            <FilterItemToolbar
                filterData={{...filterDataFeatures, disabled: true}}
                showZoomButton
                showDisableToggle
                onToggleDisabled={() => {}}
                onZoomToFilterExtent={() => {}}
            />,
            container
        );
        const buttons = container.querySelectorAll('.ms-filter-card-toolbar button');
        expect(buttons[0].className.includes('disabled')).toBe(true);
    });
});
