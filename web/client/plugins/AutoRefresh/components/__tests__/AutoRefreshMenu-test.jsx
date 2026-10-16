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

import AutoRefreshMenu from '../AutoRefreshMenu';

describe('AutoRefreshMenu component', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(container);
        document.body.removeChild(container);
    });

    it('renders children inside a right-aligned scrollable dropdown menu', () => {
        ReactDOM.render(<AutoRefreshMenu><span className="menu-content">Content</span></AutoRefreshMenu>, container);

        const menu = container.querySelector('.dropdown-menu');
        expect(menu.querySelector('.menu-content').textContent).toBe('Content');
        expect(menu.style.right).toBe('0px');
        expect(menu.style.overflowY).toBe('auto');
        expect(menu.style.maxHeight).toBe('calc(50vh)');
    });
});
