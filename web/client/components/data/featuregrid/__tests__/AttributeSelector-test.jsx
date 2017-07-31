/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var ReactDOM = require('react-dom');
var AttributeSelector = require('../AttributeSelector');
var expect = require('expect');
const spyOn = expect.spyOn;


describe('Test for AttributeSelector component', () => {
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
        ReactDOM.render(<AttributeSelector/>, document.getElementById("container"));
        const el = document.getElementsByClassName("data-attribute-selector")[0];
        expect(el).toExist();
    });
    it('render with attributes, checked by default', () => {
        ReactDOM.render(<AttributeSelector attributes={[{label: "label", attribute: "attr"}]}/>, document.getElementById("container"));
        const check = document.getElementsByTagName("input")[0];
        expect(check).toExist();
        expect(check.checked).toBe(true);
    });
    it('check hide is not selected', () => {
        ReactDOM.render(<AttributeSelector attributes={[{label: "label", attribute: "attr", hide: true}]}/>, document.getElementById("container"));
        const checks = document.getElementsByTagName("input");
        expect(checks.length).toBe(1);
        expect(checks[0].checked).toBe(false);
    });
    it('click event', () => {
        const events = {
            onChange: () => {}
        };
        spyOn(events, "onChange");
        ReactDOM.render(<AttributeSelector onChange={events.onChange} attributes={[{label: "label", attribute: "attr", hide: true}]}/>, document.getElementById("container"));
        const checks = document.getElementsByTagName("input");
        expect(checks.length).toBe(1);
        checks[0].click();
        expect(events.onChange).toHaveBeenCalled();

    });

});
