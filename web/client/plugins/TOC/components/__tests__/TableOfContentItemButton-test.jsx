/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import TableOfContentItemButton from '../TableOfContentItemButton';

describe('TableOfContentItemButton', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render a button with defaults', () => {
        ReactDOM.render(<TableOfContentItemButton />, document.getElementById("container"));
        expect(document.querySelector('button')).toBeTruthy();
        expect(document.querySelector('.btn')).toBeTruthy();
        expect(document.querySelector('li')).toBeFalsy();
    });
    it('should render a button with contextMenu prop', () => {
        ReactDOM.render(<TableOfContentItemButton contextMenu />, document.getElementById("container"));
        expect(document.querySelector('button')).toBeTruthy();
        expect(document.querySelector('.btn')).toBeFalsy();
        expect(document.querySelector('li')).toBeFalsy();
    });
    it('should render a menu item with menuItem prop', () => {
        ReactDOM.render(<TableOfContentItemButton menuItem />, document.getElementById("container"));
        expect(document.querySelector('button')).toBeFalsy();
        expect(document.querySelector('.btn')).toBeFalsy();
        expect(document.querySelector('li')).toBeTruthy();
    });
});
