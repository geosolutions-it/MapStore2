/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const React = require('react');
const ReactDOM = require('react-dom');
const ThemaClassesEditor = require('../ThemaClassesEditor');
const TestUtils = require('react-dom/test-utils');

const classification = [{
    color: '#FF0000',
    min: 1.0,
    max: 10.0
}, {
    color: '#00FF00',
    min: 10.0,
    max: 25.0
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
        const colorPicker = domNode.querySelector('.ms-color-picker-swatch');
        expect(colorPicker).toExist();
        TestUtils.Simulate.click(colorPicker);
        // query in the document because now the overlay picker container is related to container node (portal)
        const sampleColor = document.querySelector('div[title="#D0021B"]');
        TestUtils.Simulate.click(sampleColor);
        // query in the document because now the overlay picker container is related to container node (portal)
        TestUtils.Simulate.click(document.querySelector('.ms-color-picker-cover'));
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
        const colorPicker = domNode.querySelector('.ms-color-picker-swatch');
        expect(colorPicker).toExist();
        TestUtils.Simulate.click(colorPicker);
        // query in the document because now the overlay picker container is related to container node (portal)
        TestUtils.Simulate.click(document.querySelector('.ms-color-picker-cover'));
        expect(spyUpdate).toNotHaveBeenCalled();
    });
});
