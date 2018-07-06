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
        expect(domNode.getElementsByClassName('cp-swatch').length).toBe(0);
    });
    it('creates component with classes', () => {
        const cmp = ReactDOM.render(<ThemaClassesEditor classification={classification}/>, document.getElementById("container"));
        expect(cmp).toExist();
        const domNode = ReactDOM.findDOMNode(cmp);
        expect(domNode.getElementsByClassName('cp-swatch').length).toBe(2);
    });
    it('on update', () => {
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
});
