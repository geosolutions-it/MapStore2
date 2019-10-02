/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const {compose, defaultProps} = require('recompose');
const ReactTestUtils = require('react-dom/test-utils');
const expect = require('expect');
const counterWidget = require('../../enhancers/counterWidget');
const CounterWidget = compose(
    defaultProps({
        canEdit: true
    }),
    counterWidget
)(require('../CounterWidget'));
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
        expect(container.querySelector('.glyphicon-pencil')).toExist();
        expect(container.querySelector('.glyphicon-trash')).toExist();
        expect(el).toExist();
    });
    it('view only mode', () => {
        ReactDOM.render(<CounterWidget canEdit={false} />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.glyphicon-pencil')).toNotExist();
        expect(container.querySelector('.glyphicon-trash')).toNotExist();
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
        ReactDOM.render(<CounterWidget />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelectorAll('.dropdown-menu li');
        expect(el.length).toEqual(2);
    });
});
