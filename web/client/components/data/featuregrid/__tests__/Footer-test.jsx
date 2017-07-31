/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var ReactDOM = require('react-dom');
var BottomToolbar = require('../Footer');
var expect = require('expect');
const spyOn = expect.spyOn;


describe('Test for BottomToolbar component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('render with defaults', () => {
        ReactDOM.render(<BottomToolbar/>, document.getElementById("container"));
        const el = document.getElementsByClassName("data-grid-bottom-toolbar")[0];
        expect(el).toExist();
    });
    it('render 1 page only results', () => {
        const events = {
            onPageChange: () => {}
        };
        const spy = spyOn(events, "onPageChange");
        const props = {startIndex: 0, maxFeatures: 10, totalFeatures: 9, resultSize: 9};
        ReactDOM.render(<BottomToolbar {...props}/>, document.getElementById("container"));
        const el = document.getElementsByClassName("data-grid-bottom-toolbar")[0];
        expect(el).toExist();
        expect(document.getElementsByClassName("first-page")[0].disabled).toBe(true);
        expect(document.getElementsByClassName("prev-page")[0].disabled).toBe(true);
        expect(document.getElementsByClassName("next-page")[0].disabled).toBe(true);
        expect(document.getElementsByClassName("last-page")[0].disabled).toBe(true);
        document.getElementsByClassName("first-page")[0].click();
        document.getElementsByClassName("prev-page")[0].click();
        document.getElementsByClassName("next-page")[0].click();
        document.getElementsByClassName("last-page")[0].click();
        expect(spy.calls.length).toBe(0);
    });
    it('render 2nd page of 3', () => {
        const events = {
            onPageChange: () => {}
        };
        const spy = spyOn(events, "onPageChange");
        const props = {startIndex: 10, maxFeatures: 10, totalFeatures: 29, resultSize: 10};
        ReactDOM.render(<BottomToolbar onPageChange={events.onPageChange} {...props}/>, document.getElementById("container"));
        const el = document.getElementsByClassName("data-grid-bottom-toolbar")[0];
        expect(el).toExist();
        expect(document.getElementsByClassName("first-page")[0].disabled).toBe(false);
        expect(document.getElementsByClassName("prev-page")[0].disabled).toBe(false);
        expect(document.getElementsByClassName("next-page")[0].disabled).toBe(false);
        expect(document.getElementsByClassName("last-page")[0].disabled).toBe(false);
        document.getElementsByClassName("first-page")[0].click();
        document.getElementsByClassName("prev-page")[0].click();
        document.getElementsByClassName("next-page")[0].click();
        document.getElementsByClassName("last-page")[0].click();
        expect(spy.calls.length).toBe(4);
    });
    it('render 3nd page of 3', () => {
        const events = {
            onPageChange: () => {}
        };
        const spy = spyOn(events, "onPageChange");
        const props = {startIndex: 20, maxFeatures: 10, totalFeatures: 29, resultSize: 9};
        ReactDOM.render(<BottomToolbar onPageChange={events.onPageChange} {...props}/>, document.getElementById("container"));
        const el = document.getElementsByClassName("data-grid-bottom-toolbar")[0];
        expect(el).toExist();
        expect(document.getElementsByClassName("first-page")[0].disabled).toBe(false);
        expect(document.getElementsByClassName("prev-page")[0].disabled).toBe(false);
        expect(document.getElementsByClassName("next-page")[0].disabled).toBe(true);
        expect(document.getElementsByClassName("last-page")[0].disabled).toBe(true);
        document.getElementsByClassName("first-page")[0].click();
        document.getElementsByClassName("prev-page")[0].click();
        document.getElementsByClassName("next-page")[0].click();
        document.getElementsByClassName("last-page")[0].click();
        expect(spy.calls.length).toBe(2);
    });
    //
    /*
    it('render with attributes, checked by default', () => {
        ReactDOM.render(<BottomToolbar attributes={[{label: "label"}]}/>, document.getElementById("container"));
        const check = document.getElementsByTagName("input")[0];
        expect(check).toExist();
        expect(check.checked).toBe(true);
    });
    it('check hide is not selected', () => {
        ReactDOM.render(<BottomToolbar attributes={[{label: "label", hide: true}]}/>, document.getElementById("container"));
        const checks = document.getElementsByTagName("input");
        expect(checks.length).toBe(1);
        expect(checks[0].checked).toBe(false);
    });
    it('click event', () => {
        const events = {
            onChange: () => {}
        };
        spyOn(events, "onChange");
        ReactDOM.render(<BottomToolbar onChange={events.onChange} attributes={[{label: "label", hide: true}]}/>, document.getElementById("container"));
        const checks = document.getElementsByTagName("input");
        expect(checks.length).toBe(1);
        checks[0].click();
        expect(events.onChange).toHaveBeenCalled();

    });
    */

});
