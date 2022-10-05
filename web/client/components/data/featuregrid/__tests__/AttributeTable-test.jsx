/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import ReactDOM from 'react-dom';
import AttributeSelector from '../AttributeTable';
import expect from 'expect';
import TestUtils from "react-dom/test-utils";
const spyOn = expect.spyOn;


describe('Test for AttributeTable component', () => {
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
        const check = document.getElementsByTagName("input")[1];
        expect(check).toExist();
        expect(check.checked).toBe(true);
    });
    it('check hide is not selected', () => {
        ReactDOM.render(<AttributeSelector attributes={[{label: "label", attribute: "attr", hide: true}]}/>, document.getElementById("container"));
        const checks = document.getElementsByTagName("input");
        expect(checks.length).toBe(2);
        expect(checks[0].checked).toBe(false);
    });
    it('click event', () => {
        const events = {
            onChange: () => {}
        };
        spyOn(events, "onChange");
        ReactDOM.render(<AttributeSelector onChange={events.onChange} attributes={[{label: "label", attribute: "attr", hide: true}]}/>, document.getElementById("container"));
        const checks = document.getElementsByTagName("input");
        expect(checks.length).toBe(2);
        checks[0].click();
        expect(events.onChange).toHaveBeenCalled();

    });
    it('click event onChange', () => {
        const events = {
            onChange: () => {}
        };
        const _spyOn = spyOn(events, "onChange");
        ReactDOM.render(<AttributeSelector onChange={events.onChange} attributes={[{label: "label", name: "attr", attribute: "attr", hide: true}]}/>, document.getElementById("container"));
        const checks = document.getElementsByTagName("input");
        expect(checks.length).toBe(2);
        checks[0].click();
        expect(events.onChange).toHaveBeenCalled();
        const [arg, value] = _spyOn.calls[0].arguments;
        expect(arg).toEqual("options.propertyName");
        expect(value).toEqual([{name: "attr"}]);
    });
    it('test title onGridRowsUpdated', () => {
        const events = {
            onChange: () => {}
        };
        const _spyOn = spyOn(events, "onChange");
        ReactDOM.render(<AttributeSelector options={{propertyName: [{name: 'attr'}, {name: 'attr1'}]}} onChange={events.onChange} attributes={[{label: "label", name: "attr", attribute: "attr"}]}/>, document.getElementById("container"));
        const checks = document.getElementsByClassName("react-grid-Cell");
        TestUtils.Simulate.doubleClick(checks[2]); // Activate input field
        const input = document.getElementsByTagName("input");
        expect(input.length).toBe(3);
        TestUtils.Simulate.change(input[1], {target: {value: 'Attribute title'}}); // Update value in title to trigger 'onGridRowsUpdated'
        TestUtils.Simulate.keyDown(input[1], { key: 'Enter', keyCode: 13 });
        expect(events.onChange).toHaveBeenCalled();
        const [arg, value] = _spyOn.calls[0].arguments;
        expect(arg).toEqual("options.propertyName");
        expect(value).toEqual([{"name": "attr", "title": "Attribute title"}, {"name": "attr1"}]);
    });
    it('test description onGridRowsUpdated', () => {
        const events = {
            onChange: () => {}
        };
        const _spyOn = spyOn(events, "onChange");
        ReactDOM.render(<AttributeSelector options={{propertyName: [{name: 'attr'}, {name: 'attr1'}]}} onChange={events.onChange} attributes={[{label: "label", name: "attr", attribute: "attr"}]}/>, document.getElementById("container"));
        const checks = document.getElementsByClassName("react-grid-Cell");
        TestUtils.Simulate.doubleClick(checks[3]); // Activate input field
        const input = document.getElementsByTagName("input");
        expect(input.length).toBe(3);

        // Update value in title to trigger 'onGridRowsUpdated'
        TestUtils.Simulate.change(input[1], {target: {value: 'Attribute description'}});
        TestUtils.Simulate.keyDown(input[1], { key: 'Enter', keyCode: 13 });
        expect(events.onChange).toHaveBeenCalled();

        const [arg, value] = _spyOn.calls[0].arguments;
        expect(arg).toEqual("options.propertyName");
        expect(value).toEqual([{"name": "attr", "description": "Attribute description"}, {"name": "attr1"}]);
    });
    it('test retain attributes onGridRowsUpdated when no matching attribute name found', () => {
        const options = { propertyName: [{name: 'attr1'}, {name: 'attr2'}]};
        const events = {
            onChange: () => {}
        };
        const _spyOn = spyOn(events, "onChange");
        ReactDOM.render(<AttributeSelector options={options} onChange={events.onChange} attributes={[{label: "label", name: "attr", attribute: "attr"}]}/>, document.getElementById("container"));
        const checks = document.getElementsByClassName("react-grid-Cell");
        TestUtils.Simulate.doubleClick(checks[3]); // Activate input field
        const input = document.getElementsByTagName("input");
        expect(input.length).toBe(3);
        TestUtils.Simulate.change(input[1], {target: {value: 'some val'}});
        TestUtils.Simulate.keyDown(input[1], { key: 'Enter', keyCode: 13 });
        expect(events.onChange).toHaveBeenCalled();

        const [arg, value] = _spyOn.calls[0].arguments;
        expect(arg).toEqual("options.propertyName");
        expect(value).toEqual(options.propertyName);
    });
    it('test disable editable cell when row is not selected', () => {
        ReactDOM.render(<AttributeSelector options={{propertyName: [{name: 'attr'}, {name: 'attr1'}]}}  attributes={[{label: "label", name: "attr", attribute: "attr", hide: true}]}/>, document.getElementById("container"));
        const checks = document.getElementsByClassName("react-grid-Cell");
        TestUtils.Simulate.doubleClick(checks[2]); // Activate title field
        let input = document.getElementsByTagName("input");
        // Title input field is not enabled, as activated would result in 3 total fields
        expect(input.length).toBe(2);

        TestUtils.Simulate.doubleClick(checks[3]); // Activate description field
        input = document.getElementsByTagName("input");
        expect(input.length).toBe(2); // Description input field is not enabled
    });
});
