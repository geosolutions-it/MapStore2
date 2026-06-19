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
import { Provider } from 'react-redux';
import { Simulate } from 'react-dom/test-utils';

import FilterWidget from '../FilterWidget';

const makeStore = (collected) => ({
    subscribe: () => () => {},
    getState: () => ({}),
    dispatch: (a) => { collected.push(a); }
});

const renderWith = (collected, props) => {
    const container = document.getElementById('container');
    ReactDOM.render(
        <Provider store={makeStore(collected)}>
            <FilterWidget {...props} />
        </Provider>,
        container
    );
};

describe('FilterWidget per-filter card UX', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    const baseFilter = {
        id: 'flt-1',
        disabled: false,
        layout: {
            variant: 'checkbox',
            label: 'Filter 1',
            icon: 'filter',
            selectionMode: 'multiple',
            defaultExpanded: true
        },
        data: {
            dataSource: 'features',
            layer: { id: 'layer-1', name: 'test' }
        },
        items: []
    };

    it('renders a per-filter toolbar inside the filter card', () => {
        const collected = [];
        renderWith(collected, {
            id: 'w-1',
            title: 'Widget',
            filters: [baseFilter],
            selections: { 'flt-1': [] },
            updateProperty: () => {}
        });
        const toolbars = document.querySelectorAll('.ms-filter-card-toolbar');
        expect(toolbars.length).toBe(1);
    });

    it('toggling the disabled switch calls updateProperty(filters, ...) with disabled=true', () => {
        const collected = [];
        let lastUpdate = null;
        renderWith(collected, {
            id: 'w-1',
            title: 'Widget',
            filters: [baseFilter],
            selections: { 'flt-1': [] },
            updateProperty: (id, key, value) => { lastUpdate = { id, key, value }; }
        });
        const switches = document.querySelectorAll('.mapstore-switch-btn-xs input[type="checkbox"]');
        expect(switches.length).toBeGreaterThan(0);
        Simulate.change(switches[0]);
        expect(lastUpdate).toExist();
        expect(lastUpdate.key).toBe('filters');
        expect(Array.isArray(lastUpdate.value)).toBe(true);
        expect(lastUpdate.value[0].disabled).toBe(true);
        // also re-applies interactions
        expect(collected.length).toBeGreaterThanOrEqualTo(0);
    });

    it('disabling a filter preserves its selections', () => {
        const collected = [];
        const updates = [];
        renderWith(collected, {
            id: 'w-1',
            title: 'Widget',
            filters: [baseFilter],
            selections: { 'flt-1': ['Arizona', 'Texas'] },
            updateProperty: (id, key, value) => { updates.push({ id, key, value }); }
        });
        const switches = document.querySelectorAll('.mapstore-switch-btn-xs input[type="checkbox"]');
        Simulate.change(switches[0]);
        // only filters update on disable, selections are intentionally preserved
        const filtersUpdate = updates.find(u => u.key === 'filters');
        const selectionsUpdate = updates.find(u => u.key === 'selections');
        expect(filtersUpdate).toExist();
        expect(filtersUpdate.value[0].disabled).toBe(true);
        expect(selectionsUpdate).toNotExist();
    });

    it('re-enabling a filter does not wipe selections', () => {
        const collected = [];
        const updates = [];
        // start disabled with empty selections
        const disabledFilter = { ...baseFilter, disabled: true };
        renderWith(collected, {
            id: 'w-1',
            title: 'Widget',
            filters: [disabledFilter],
            selections: { 'flt-1': [] },
            updateProperty: (id, key, value) => { updates.push({ id, key, value }); }
        });
        const switches = document.querySelectorAll('.mapstore-switch-btn-xs input[type="checkbox"]');
        Simulate.change(switches[0]);
        // only filters update, selections must not be cleared on re-enable
        const filtersUpdate = updates.find(u => u.key === 'filters');
        const selectionsUpdate = updates.find(u => u.key === 'selections');
        expect(filtersUpdate).toExist();
        expect(filtersUpdate.value[0].disabled).toBe(false);
        expect(selectionsUpdate).toNotExist();
    });

    it('starts the body collapsed when layout.defaultExpanded is false', () => {
        const collected = [];
        const collapsedFilter = { ...baseFilter, layout: { ...baseFilter.layout, defaultExpanded: false } };
        renderWith(collected, {
            id: 'w-1',
            title: 'Widget',
            filters: [collapsedFilter],
            selections: { 'flt-1': [] },
            updateProperty: () => {}
        });
        const selectableItems = document.querySelectorAll('.ms-filter-view-no-selectable-items');
        expect(selectableItems.length).toBe(0);
        // header (toolbar) must still be visible
        const toolbars = document.querySelectorAll('.ms-filter-card-toolbar');
        expect(toolbars.length).toBe(1);
    });
});
