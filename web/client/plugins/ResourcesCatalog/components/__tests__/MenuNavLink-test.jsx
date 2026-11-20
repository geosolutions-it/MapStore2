
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
import MenuNavLink from '../MenuNavLink';

describe('MenuNavLink component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with default', () => {
        ReactDOM.render(<MenuNavLink />, document.getElementById('container'));
        const menuNavLink = document.querySelector('a');
        expect(menuNavLink).toBeTruthy();
    });
    it('should keep the href of web and in-app links', () => {
        ReactDOM.render(<div>
            <MenuNavLink href="https://mapstore.geosolutionsgroup.com/">web</MenuNavLink>
            <MenuNavLink href="#/viewer/1">viewer</MenuNavLink>
            <MenuNavLink href="docs/index.html">docs</MenuNavLink>
        </div>, document.getElementById('container'));
        const hrefs = [...document.querySelectorAll('a')].map(a => a.getAttribute('href'));
        expect(hrefs).toEqual(['https://mapstore.geosolutionsgroup.com/', '#/viewer/1', 'docs/index.html']);
    });
    it('should render without href when the link uses an unsupported protocol', () => {
        ReactDOM.render(<MenuNavLink href="ftp://files.example.com/docs">docs</MenuNavLink>, document.getElementById('container'));
        const menuNavLink = document.querySelector('a');
        expect(menuNavLink.hasAttribute('href')).toBe(false);
        expect(menuNavLink.innerText).toBe('docs');
    });
});
