/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import SidebarElement from "../SidebarElement";

describe("The SidebarElement component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('is created with defaults', () => {
        ReactDOM.render(<SidebarElement/>, document.getElementById("container"));
        const domComp = document.getElementsByClassName('btn')[0];
        expect(domComp).toExist();

    });

    it('should have proper style', () => {
        ReactDOM.render(<SidebarElement bsStyle="primary" />, document.getElementById("container"));
        const domComp = document.getElementsByClassName('btn-primary')[0];
        expect(domComp).toExist();
    });
});
