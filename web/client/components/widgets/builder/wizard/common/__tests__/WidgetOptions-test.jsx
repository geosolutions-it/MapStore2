/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const ReactTestUtils = require('react-dom/test-utils');
const expect = require('expect');
const WidgetOptions = require('../WidgetOptions');
describe('WidgetOptions component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('WidgetOptions rendering with defaults', () => {
        ReactDOM.render(<WidgetOptions />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.widget-options-form');
        expect(el).toBeTruthy();
    });
    it('Test WidgetOptions onChange', () => {
        const actions = {
            onChange: () => {}
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<WidgetOptions onChange={actions.onChange} />, document.getElementById("container"));
        const inputs = document.querySelectorAll('input');

        ReactTestUtils.Simulate.change(inputs[0], { target: { value: 'Title' } });
        expect(spyonChange.mock.calls[0][0]).toBe("title");
        expect(spyonChange.mock.calls[0][1]).toBe("Title");

        ReactTestUtils.Simulate.change(inputs[1], { target: { value: 'Description' } });
        expect(spyonChange.mock.calls[1][0]).toBe("description");
        expect(spyonChange.mock.calls[1][1]).toBe("Description");
    });
});
