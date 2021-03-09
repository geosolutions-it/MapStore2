/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import emptyChartState from '../emptyChartState';

describe('widgets emptyChartState enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('emptyChartState rendering with defaults', () => {
        const Dummy = emptyChartState(() => <div id="dummy"></div>);
        ReactDOM.render(<Dummy data={[]}/>, document.getElementById("container"));
        expect(document.getElementById("dummy")).toNotExist();
    });
    it('emptyChartState rendering with data', () => {
        const Dummy = emptyChartState(() => <div id="dummy"></div>);
        ReactDOM.render(<Dummy data={["a"]}/>, document.getElementById("container"));
        expect(document.getElementById("dummy")).toExist();
    });

    it("should render empty chart state", () => {
        const Dummy = emptyChartState(() => <div id="dummy"></div>);
        ReactDOM.render(<Dummy data={[]}/>, document.getElementById("container"));
        expect(document.querySelector(".ms-widget-empty-message")).toExist();
    });
});
