/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var React = require('react');
var ReactDOM = require('react-dom');
var propsStreamFactory = require('../propsStreamFactory');

describe("propsStreamFactory enhancer", () => {
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
        const CMP = propsStreamFactory(({count = 0}) => <div id={"count-" + count} />);
        ReactDOM.render(<CMP />, document.getElementById("container"));
        const el = document.getElementById("count-0");
        // const el = document.getElementById("count-1");
        expect(el).toExist();
    });
    it('creates component with dataStreamFactory props', () => {
        const CMP = propsStreamFactory(({count}) => <div id={"count-" + count} />);
        ReactDOM.render(<CMP dataStreamFactory={$props => $props.scan( (acc) => acc + 1, 0).map(count => ({count}))}/>, document.getElementById("container"));
        const el = document.getElementById("count-1");
        // const el = document.getElementById("count-1");
        expect(el).toExist();
        ReactDOM.render(<CMP dataStreamFactory={$props => $props.scan( (acc) => acc + 1, 0).map(count => ({count}))}/>, document.getElementById("container"));
        const el2 = document.getElementById("count-2");
        expect(el2).toExist();
    });

});
