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
const ChartWidget = require('../ChartWidget');
describe('ChartWidget component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('ChartWidget rendering with defaults', () => {
        ReactDOM.render(<ChartWidget />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.mapstore-widget-card');
        expect(el).toExist();
    });
    it('Test ChartWidget onEdit callback', () => {
        const actions = {
            onEdit: () => {}
        };
        const spyonEdit = expect.spyOn(actions, 'onEdit');
        ReactDOM.render(<ChartWidget onEdit={actions.onEdit} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.glyphicon-pencil');
        ReactTestUtils.Simulate.click(el); // <-- trigger event callback
        expect(spyonEdit).toHaveBeenCalled();
    });
    it('Test ChartWidget callbacks', () => {
        const actions = {
            onEdit: () => {},
            exportCSV: () => {},
            exportImage: () => {}
        };
        const spyonEdit = expect.spyOn(actions, 'onEdit');
        const spyexportCSV = expect.spyOn(actions, 'exportCSV');
        const spyexportImage = expect.spyOn(actions, 'exportImage');
        ReactDOM.render(<ChartWidget exportCSV={actions.exportCSV} exportImage={actions.exportImage} onEdit={actions.onEdit} />, document.getElementById("container"));
        const container = document.getElementById('container');
        let el = container.querySelector('.glyphicon-pencil');
        ReactTestUtils.Simulate.click(el); // <-- trigger event callback
        expect(spyonEdit).toHaveBeenCalled();
        el = container.querySelector('.exportCSV');
        ReactTestUtils.Simulate.click(el);
        expect(spyexportCSV).toHaveBeenCalled();
        el = container.querySelector('.exportImage');
        ReactTestUtils.Simulate.click(el);
        expect(spyexportImage).toHaveBeenCalled();
    });
});
