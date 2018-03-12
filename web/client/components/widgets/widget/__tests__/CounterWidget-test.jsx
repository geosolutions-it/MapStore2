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
const CounterWidget = require('../CounterWidget');
describe('CounterWidget component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('CounterWidget rendering with defaults', () => {
        ReactDOM.render(<CounterWidget />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.mapstore-widget-card');
        expect(el).toExist();
    });
    it('Test CounterWidget onEdit callback', () => {
        const actions = {
            onEdit: () => {}
        };
        const spyonEdit = expect.spyOn(actions, 'onEdit');
        ReactDOM.render(<CounterWidget onEdit={actions.onEdit} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.glyphicon-pencil');
        ReactTestUtils.Simulate.click(el); // <-- trigger event callback
        expect(spyonEdit).toHaveBeenCalled();
    });
    it('Test CounterWidget width data', () => {
        const actions = {
            onEdit: () => { }
        };
        const spyonEdit = expect.spyOn(actions, 'onEdit');
        ReactDOM.render(<CounterWidget onEdit={actions.onEdit} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.glyphicon-pencil');
        ReactTestUtils.Simulate.click(el); // <-- trigger event callback
        expect(spyonEdit).toHaveBeenCalled();
    });
    it('Test CounterWidget DropdownMenu', () => {
        ReactDOM.render(<CounterWidget onEdit={actions.onEdit} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelectorAll('.dropdown-menu dropdown-menu-right li');
        expect(el).toEqual(2);
    });
});
