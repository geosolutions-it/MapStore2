/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');

const expect = require('expect');
const emptyChartState = require('../emptyChartState');

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
});
