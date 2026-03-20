/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React from 'react';

import ReactDOM from 'react-dom';
import Cookie from '../Cookie';
import expect from 'expect';

describe('Test for Cookie component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    // test DEFAULTS
    it('render with defaults', () => {
        const cmp = ReactDOM.render(<Cookie/>, document.getElementById("container"));
        expect(cmp).toExist();
        expect(document.body.querySelector('.mapstore-cookie-panel')).toNotExist();
    });

    it('render with show = true', () => {
        const cmp = ReactDOM.render(<Cookie show externalCookieUrl=""/>, document.getElementById("container"));
        expect(cmp).toExist();
        const panel = document.body.querySelector('.mapstore-cookie-panel');
        expect(panel).toExist();
        expect(panel.classList.contains('not-see-more')).toBe(true);
    });

    it('renders cookie panel into document.body via portal', () => {
        ReactDOM.render(<Cookie show/>, document.getElementById("container"));
        const panel = document.body.querySelector('.mapstore-cookie-panel');
        expect(panel).toExist();
        expect(panel.parentNode).toBe(document.body);
    });

});
