/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import TestUtils from 'react-dom/test-utils';

import AutoRefreshInformations from '../AutoRefreshInformations';

describe('AutoRefreshInformations component', () => {
    let container;

    const renderComponent = (props = {}) => ReactDOM.render(
        <AutoRefreshInformations {...props} />,
        container
    );

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(container);
        document.body.removeChild(container);
    });

    it('renders the information control and empty summary', () => {
        renderComponent();

        expect(container.querySelector('.ms-autorefresh-informations')).toBeTruthy();
        expect(container.querySelector('.ms-autorefresh-layers-summary')).toBeTruthy();
    });

    it('renders each layer title and interval in the summary', () => {
        renderComponent({
            layers: [
                { id: 'layer-1', title: 'Roads', autoRefreshInterval: 60, visibility: true, _v_: 1 },
                { id: 'layer-2', title: 'Buildings', autoRefreshInterval: 120, visibility: false }
            ]
        });

        const rows = container.querySelectorAll('.ms-autorefresh-layer-summary__row');
        expect(rows.length).toBe(2);
        expect(rows[0].querySelector('.ms-autorefresh-layer-summary__row__title').textContent).toBe('Roads');
        expect(rows[0].querySelector('.ms-autorefresh-layer-summary__row__interval').textContent).toBe('60s');
        expect(rows[1].querySelector('.ms-autorefresh-layer-summary__row__interval').textContent).toBe('120s');
    });

    it('marks hidden and inactive layers in the summary', () => {
        renderComponent({
            layers: [
                { id: 'hidden', title: 'Hidden', autoRefreshInterval: 60, visibility: false },
                { id: 'stale', title: 'Stale', autoRefreshInterval: 60, visibility: true }
            ]
        });

        expect(container.querySelectorAll('.ms-autorefresh-layer-summary__row-hidden').length).toBe(1);
        expect(container.querySelectorAll('.ms-autorefresh-layer-summary__row-inactive').length).toBe(2);
    });

    it('opens the summary dropdown when the information button is clicked', () => {
        renderComponent();

        const button = container.querySelector('.ms-autorefresh-button');
        TestUtils.Simulate.click(button);

        expect(button.getAttribute('open')).toBe('');
    });

    it('hides the summary dropdown when the information button is clicked after being opened', () => {
        renderComponent();

        const button = container.querySelector('.ms-autorefresh-button');
        TestUtils.Simulate.click(button); // open the dropdown
        TestUtils.Simulate.click(button); // close the dropdown

        expect(button.getAttribute('open')).toBe(null);
    });
});
