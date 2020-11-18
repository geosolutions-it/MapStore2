/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import React from 'react';
import ReactDOM from 'react-dom';
import MarkNameSelector from '../MarkNameSelector';

describe("Test the MarkNameSelector component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates component with defaults', () => {
        const cmp = ReactDOM.render(<MarkNameSelector/>, document.getElementById("container"));
        expect(cmp).toExist();
        cmp.props.onChange();
    });

    it('creates component contrast', () => {
        const cmp = ReactDOM.render(<MarkNameSelector markName="square"/>, document.getElementById("container"));
        expect(cmp).toExist();
    });
});
