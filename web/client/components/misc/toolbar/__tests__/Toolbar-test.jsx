/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

var expect = require('expect');
var React = require('react');
var ReactDOM = require('react-dom');
var Toolbar = require('../Toolbar');


describe("Toolbar component", () => {
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
        ReactDOM.render(<Toolbar />, document.getElementById("container"));
        const el = document.getElementsByClassName("btn-group");
        expect(el).toExist();
    });
    it('creates component with buttons and defaultProps', () => {
        ReactDOM.render(<Toolbar key={"toolbar"} btnDefaultProps={{className: "TEST_CLASS"}} buttons={[{
            id: "button",
            tooltip: "hello",
            text: "hello",
            tooltipPosition: "right",
            glyph: "plus"
        }]}/>, document.getElementById("container"));
        const el = document.getElementsByClassName("btn-group");
        expect(el).toExist();
        const btn = document.getElementById("button");
        expect(btn).toExist();
        expect(document.getElementsByClassName("TEST_CLASS").length > 0).toBe(true);
    });
    it('test button visibility', () => {
        ReactDOM.render(<Toolbar key={"toolbar"} buttons={[{
            id: "button",
            visible: false,
            tooltip: "hello",
            text: "hello",
            tooltipPosition: "right",
            glyph: "plus"
        }]}/>, document.getElementById("container"));
        const el = document.getElementsByClassName("btn-group");
        expect(el).toExist();
        const btn = document.getElementById("button");
        expect(btn).toNotExist();
    });
    // Optionally removes css animation group
    it('test disable animation', () => {
        ReactDOM.render(<Toolbar key={"toolbar"} transitionProps={false} buttons={[{
            id: "button",
            visible: true,
            tooltip: "hello",
            text: "hello",
            tooltipPosition: "right",
            glyph: "plus"
        }]} />, document.getElementById("container"));
        // this allows vertical toolbar with bootstrap css (animation group add internal span)
        const el = document.querySelector(".btn-group > button");
        expect(el).toExist();
    });
});
