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
import TestUtils from 'react-dom/test-utils';

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
    });

    it('render with show = true', () => {
        const cmp = ReactDOM.render(<Cookie show externalCookieUrl=""/>, document.getElementById("container"));
        expect(cmp).toExist();
        expect(TestUtils.scryRenderedDOMComponentsWithClass(cmp, "mapstore-cookie-panel")).toExist();
    });

});
