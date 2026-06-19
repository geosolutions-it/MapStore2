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

    it('renders the toggle switch and collapse chevron when handlers are provided', () => {
        const container = document.getElementById('container');
        ReactDOM.render(
            <FilterItemToolbar
                filterData={filterDataFeatures}
                onToggleCollapse={() => {}}
                onToggleDisabled={() => {}}
            />,
            container
        );
        const toolbar = container.querySelector('.ms-filter-card-toolbar');
        expect(toolbar).toExist();
        const buttons = toolbar.querySelectorAll('button');
        // only the collapse chevron is a ToolButton
        expect(buttons.length).toBe(1);
        const toggle = toolbar.querySelector('.mapstore-switch-btn-xs input[type="checkbox"]');
        expect(toggle).toExist();
    });

    it('invokes onToggleCollapse when the collapse chevron is clicked', () => {
        const container = document.getElementById('container');
        let clicked = false;
        ReactDOM.render(
            <FilterItemToolbar
                filterData={filterDataFeatures}
                onToggleCollapse={() => { clicked = true; }}
            />,
            container
        );
        const buttons = container.querySelectorAll('.ms-filter-card-toolbar button');
        // only the chevron is rendered
        expect(buttons.length).toBe(1);
        Simulate.click(buttons[0]);
        expect(clicked).toBe(true);
    });
});
