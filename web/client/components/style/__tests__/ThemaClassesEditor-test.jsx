/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import React from 'react';
import ReactDOM from 'react-dom';
import ThemaClassesEditor from '../ThemaClassesEditor';
import TestUtils from 'react-dom/test-utils';

const classification = [{
    color: '#FF0000',
    min: 1.0,
    max: 10.0
}, {
    color: '#00FF00',
    min: 10.0,
    max: 25.0
}];
const uniqueClassification = {
    number: [{
        color: '#FF0000',
        unique: 10
    }, {
        color: '#00FF00',
        unique: 20
    }],
    string: [{
        color: '#FF0000',
        unique: 'Test'
    }, {
        color: '#00FF00',
        unique: 'Test1'
    }]
};

const uniqueClassificationCustomLabels = [{
    color: '#FF0000',
    unique: 'pcfc',
    title: 'Pacific'
}, {
    color: '#00FF00',
    unique: 'satl',
    title: 'South Atlantic'
}];

describe("Test the ThemaClassesEditor component", () => {
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
        const cmp = ReactDOM.render(<ThemaClassesEditor />, document.getElementById("container"));
        expect(cmp).toExist();
        const domNode = ReactDOM.findDOMNode(cmp);
        expect(domNode.getElementsByClassName('ms-color-picker-swatch').length).toBe(0);
    });
    it('creates component with classes', () => {
        const cmp = ReactDOM.render(<ThemaClassesEditor classification={classification}/>, document.getElementById("container"));
        expect(cmp).toExist();
        const domNode = ReactDOM.findDOMNode(cmp);
        expect(domNode.getElementsByClassName('ms-color-picker-swatch').length).toBe(2);
    });
    it('creates component with custom labels allowed', () => {
        const cmp = ReactDOM.render(<ThemaClassesEditor classification={uniqueClassificationCustomLabels} customLabels />, document.getElementById("container"));
        expect(cmp).toExist();
        const domNode = ReactDOM.findDOMNode(cmp);
        expect(domNode.getElementsByClassName('form-control').length).toBe(4);
    });
    it('on update value', () => {
        const actions = {
            onUpdateClasses: () => { }
        };

        const spyUpdate = expect.spyOn(actions, 'onUpdateClasses');

        const cmp = ReactDOM.render(
            <ThemaClassesEditor classification={classification}
                onUpdateClasses={actions.onUpdateClasses}
            />, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(cmp);
        const input = domNode.getElementsByTagName('input')[0];
        TestUtils.Simulate.change(input, { target: { value: '7.0' } });
        TestUtils.Simulate.blur(input);
        expect(spyUpdate).toHaveBeenCalled();
    });
    it('on update color', () => {
        const actions = {
            onUpdateClasses: () => { }
        };

        const spyUpdate = expect.spyOn(actions, 'onUpdateClasses');

        const cmp = ReactDOM.render(
            <ThemaClassesEditor classification={classification}
                onUpdateClasses={actions.onUpdateClasses}
            />, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(cmp);
        const colorPicker = domNode.querySelector('.ms-color-picker');
        expect(colorPicker).toExist();
        // open the popover
        TestUtils.Simulate.click(colorPicker);
        // query in the document because now the overlay picker container is related to container node (portal)
        const sampleColor = document.querySelector('div[title="#D0021B"]');
        TestUtils.Simulate.click(sampleColor);
        // close the popover
        TestUtils.Simulate.click(colorPicker);
        expect(spyUpdate).toHaveBeenCalled();
        expect(spyUpdate.calls.length).toBe(1);
        expect(spyUpdate.calls[0].arguments[0].length).toBe(2);
        expect(spyUpdate.calls[0].arguments[0][0].color.toUpperCase()).toBe('#D0021B');
    });

    it('on update color no choice', () => {
        const actions = {
            onUpdateClasses: () => { }
        };

        const spyUpdate = expect.spyOn(actions, 'onUpdateClasses');

        const cmp = ReactDOM.render(
            <ThemaClassesEditor classification={classification}
                onUpdateClasses={actions.onUpdateClasses}
            />, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(cmp);
        const colorPicker = domNode.querySelector('.ms-color-picker');
        expect(colorPicker).toExist();
        // open the popover
        TestUtils.Simulate.click(colorPicker);
        // close the popover
        TestUtils.Simulate.click(colorPicker);
        expect(spyUpdate).toNotHaveBeenCalled();
    });
    it('on update value classification with unique field of type number', () => {
        const actions = {
            onUpdateClasses: () => { }
        };

        const spyUpdate = expect.spyOn(actions, 'onUpdateClasses');

        const cmp = ReactDOM.render(
            <ThemaClassesEditor classification={uniqueClassification.number}
                onUpdateClasses={actions.onUpdateClasses}
            />, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(cmp);
        const input = domNode.getElementsByTagName('input')[0];
        TestUtils.Simulate.change(input, { target: { value: '7.0' } });
        TestUtils.Simulate.blur(input);
        expect(spyUpdate).toHaveBeenCalled();
        const [field] = spyUpdate.calls[0].arguments[0];
        expect(field.unique).toEqual(7);
    });
    it('on update value classification with unique field of type string', () => {
        const actions = {
            onUpdateClasses: () => { }
        };

        const spyUpdate = expect.spyOn(actions, 'onUpdateClasses');

        const cmp = ReactDOM.render(
            <ThemaClassesEditor classification={uniqueClassification.string}
                onUpdateClasses={actions.onUpdateClasses}
            />, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(cmp);
        const input = domNode.getElementsByTagName('input')[0];
        TestUtils.Simulate.change(input, { target: { value: 'Test4' } });
        TestUtils.Simulate.blur(input);
        expect(spyUpdate).toHaveBeenCalled();
        const [field] = spyUpdate.calls[0].arguments[0];
        expect(field.unique).toEqual('Test4');
    });
    it('on update value by adding new rule entry before in non-unique classification', () => {
        const actions = { onUpdateClasses: () => { } };
        const spyUpdate = expect.spyOn(actions, 'onUpdateClasses');
        const cmp = ReactDOM.render(
            <ThemaClassesEditor classification={classification}
                onUpdateClasses={actions.onUpdateClasses}
            />, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(cmp);
        const buttons = domNode.getElementsByClassName('add-rule');
        expect(buttons.length).toBe(2);
        const [addNewEntryBefore] = domNode.querySelectorAll('.dropdown-menu > li > a');
        TestUtils.Simulate.click(addNewEntryBefore);
        expect(spyUpdate).toHaveBeenCalled();
        const [arg1, arg2] = spyUpdate.calls[0].arguments;
        expect(arg2).toBe('interval');
        expect(arg1).toBeTruthy();
        expect(arg1.length).toBe(3);
        expect(arg1[0]).toEqual({"color": "#ffffff", "min": 0, "max": 1, "title": " >= 0 AND <1"});
    });
    it('on update value by deleting a rule entry in non-unique classification', () => {
        const actions = { onUpdateClasses: () => { } };
        const spyUpdate = expect.spyOn(actions, 'onUpdateClasses');
        const cmp = ReactDOM.render(
            <ThemaClassesEditor classification={classification}
                onUpdateClasses={actions.onUpdateClasses}
            />, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(cmp);
        const buttons = domNode.getElementsByClassName('add-rule');
        expect(buttons.length).toBe(2);
        const menuItem = domNode.querySelectorAll('.dropdown-menu > li > a');
        TestUtils.Simulate.click(menuItem[2]); // Delete
        expect(spyUpdate).toHaveBeenCalled();
        const [arg1, arg2] = spyUpdate.calls[0].arguments;
        expect(arg2).toBe('interval');
        expect(arg1).toBeTruthy();
        expect(arg1.length).toBe(1);
        expect(arg1[0]).toEqual(classification[1]);
    });
    it('on update value by adding new rule entry after in non-unique classification', () => {
        const actions = { onUpdateClasses: () => { } };
        const spyUpdate = expect.spyOn(actions, 'onUpdateClasses');
        const cmp = ReactDOM.render(
            <ThemaClassesEditor classification={classification}
                onUpdateClasses={actions.onUpdateClasses}
            />, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(cmp);
        const [, addNewEntryAfter] = domNode.querySelectorAll('.dropdown-menu > li > a');
        TestUtils.Simulate.click(addNewEntryAfter);
        expect(spyUpdate).toHaveBeenCalled();
        const [arg1, arg2] = spyUpdate.calls[0].arguments;
        expect(arg2).toBe('interval');
        expect(arg1).toBeTruthy();
        expect(arg1.length).toBe(3);
        expect(arg1[1]).toEqual({"color": "#ffffff", "min": 10, "max": 10, "title": " >= 10 AND <10"});
    });
    it('on update value by adding new rule entry before in Unique classification', () => {
        const actions = { onUpdateClasses: () => { } };
        const spyUpdate = expect.spyOn(actions, 'onUpdateClasses');
        const cmp = ReactDOM.render(
            <ThemaClassesEditor classification={uniqueClassification.number}
                onUpdateClasses={actions.onUpdateClasses}
            />, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(cmp);
        const buttons = domNode.getElementsByClassName('add-rule');
        expect(buttons.length).toBe(2);
        const menuItem = domNode.querySelectorAll('.dropdown-menu > li > a');
        TestUtils.Simulate.click(menuItem[0]);
        expect(spyUpdate).toHaveBeenCalled();
        const [arg1, arg2] = spyUpdate.calls[0].arguments;
        expect(arg2).toBe('interval');
        expect(arg1).toBeTruthy();
        expect(arg1.length).toBe(3);
        expect(arg1[0]).toEqual({"color": "#ffffff", "unique": 0, "title": 0});
    });
    it('on update value by adding new rule entry after in Unique classification', () => {
        const actions = { onUpdateClasses: () => { } };
        const spyUpdate = expect.spyOn(actions, 'onUpdateClasses');
        const cmp = ReactDOM.render(
            <ThemaClassesEditor classification={uniqueClassification.number}
                onUpdateClasses={actions.onUpdateClasses}
            />, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(cmp);
        const buttons = domNode.getElementsByClassName('add-rule');
        expect(buttons.length).toBe(2);
        const menuItem = domNode.querySelectorAll('.dropdown-menu > li > a');
        TestUtils.Simulate.click(menuItem[1]);
        expect(spyUpdate).toHaveBeenCalled();
        const [arg1, arg2] = spyUpdate.calls[0].arguments;
        expect(arg2).toBe('interval');
        expect(arg1).toBeTruthy();
        expect(arg1.length).toBe(3);
        expect(arg1[1]).toEqual({"color": "#ffffff", "unique": 0, "title": 0});
    });
    it('on update value by deleting a rule entry in Unique classification', () => {
        const actions = { onUpdateClasses: () => { } };
        const spyUpdate = expect.spyOn(actions, 'onUpdateClasses');
        const cmp = ReactDOM.render(
            <ThemaClassesEditor classification={uniqueClassification.number}
                onUpdateClasses={actions.onUpdateClasses}
            />, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(cmp);
        const buttons = domNode.getElementsByClassName('add-rule');
        expect(buttons.length).toBe(2);
        const menuItem = domNode.querySelectorAll('.dropdown-menu > li > a');
        TestUtils.Simulate.click(menuItem[2]);
        expect(spyUpdate).toHaveBeenCalled();
        const [arg1, arg2] = spyUpdate.calls[0].arguments;
        expect(arg2).toBe('interval');
        expect(arg1).toBeTruthy();
        expect(arg1.length).toBe(1);
        expect(arg1[0]).toBe(uniqueClassification.number[1]);
    });
    it('on update value by modifying rule of Unique classification of type string', () => {
        const actions = { onUpdateClasses: () => { } };
        const spyUpdate = expect.spyOn(actions, 'onUpdateClasses');
        const cmp = ReactDOM.render(
            <ThemaClassesEditor classification={uniqueClassification.string}
                onUpdateClasses={actions.onUpdateClasses}
            />, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(cmp);
        const buttons = domNode.getElementsByClassName('add-rule');
        expect(buttons.length).toBe(2);
        const [addNewEntryBefore] = domNode.querySelectorAll('.dropdown-menu > li > a');
        TestUtils.Simulate.click(addNewEntryBefore);
        expect(spyUpdate).toHaveBeenCalled();
        const [arg1, arg2] = spyUpdate.calls[0].arguments;
        expect(arg2).toBe('interval');
        expect(arg1).toBeTruthy();
        expect(arg1.length).toBe(3);
        expect(arg1[0]).toEqual({"color": "#ffffff", "unique": '', "title": ''});
    });
    it('removal of all rules is not allowed', () => {
        const actions = { onUpdateClasses: () => { } };
        const spyUpdate = expect.spyOn(actions, 'onUpdateClasses');
        const cmp = ReactDOM.render(
            <ThemaClassesEditor classification={uniqueClassificationCustomLabels}
                onUpdateClasses={actions.onUpdateClasses}
                allowEmpty={false}
            />, document.getElementById("container"));
        const domNode = ReactDOM.findDOMNode(cmp);
        const buttons = domNode.getElementsByClassName('add-rule');
        expect(buttons.length).toBe(2);
        const menuItemButton = domNode.querySelectorAll('.dropdown-menu')[0];
        const menuItem = domNode.querySelectorAll('.dropdown-menu > li > a');
        expect(menuItem.length).toBe(5);
        expect(menuItemButton.children.length).toBe(2);
        TestUtils.Simulate.click(menuItem[4]);
        expect(spyUpdate).toHaveBeenCalled();
        const [arg1, arg2] = spyUpdate.calls[0].arguments;
        expect(arg2).toBe('interval');
        expect(arg1).toBeTruthy();
        expect(arg1.length).toBe(1);
    });
});
