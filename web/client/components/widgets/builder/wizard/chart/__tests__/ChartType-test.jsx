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
const ChartType = require('../ChartType');
describe('ChartType component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('ChartType rendering with defaults', () => {
        ReactDOM.render(<ChartType />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.msSideGrid');
        expect(el).toExist();
        expect(container.querySelector('.selected')).toNotExist();
    });
    it('ChartType selected', () => {
        ReactDOM.render(<ChartType type="bar"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.selected');
        expect(el).toExist();
    });
    it('Test ChartType onSelect', () => {
        const actions = {
            onSelect: () => {},
            onNextPage: () => {}
        };
        const spyonSelect = expect.spyOn(actions, 'onSelect');
        const spyonNextPage = expect.spyOn(actions, 'onNextPage');
        ReactDOM.render(<ChartType type="bar" onSelect={actions.onSelect} onNextPage={actions.onNextPage} />, document.getElementById("container"));
        ReactTestUtils.Simulate.click(document.querySelector('.selected')); // <-- trigger event callback
        expect(spyonSelect).toHaveBeenCalled();
        expect(spyonSelect.calls[0].arguments[0]).toBe("bar");
        expect(spyonNextPage).toHaveBeenCalled();
    });
});
