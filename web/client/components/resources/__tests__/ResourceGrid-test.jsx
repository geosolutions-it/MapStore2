/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import ReactDOM from 'react-dom';
import ResourceGrid from '../ResourceGrid.jsx';
import expect from 'expect';

describe('This test for ResourceGrid', () => {
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
    it('creates the component with defaults', () => {
        ReactDOM.render(<ResourceGrid />, document.getElementById("container"));
        const dom = document.querySelector('.ms-grid');
        expect(dom).toExist();
    });

    it('component with data', () => {
        var map1 = { id: 1, name: "a", description: "description" };
        var map2 = { id: 2, name: "b", description: "description" };
        ReactDOM.render(<ResourceGrid resources={[map1, map2]} show />, document.getElementById("container"));
        const dom = document.querySelector('.ms-grid');
        expect(dom).toExist();

        // check list
        const list = dom.getElementsByClassName("map-thumb");
        expect(list.length).toBe(2, " list missing");
    });
});
