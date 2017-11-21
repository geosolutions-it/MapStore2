/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');

const expect = require('expect');
const ChartWizard = require('../ChartWizard');
describe('ChartWizard component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('ChartWizard rendering with defaults', () => {
        ReactDOM.render(<ChartWizard />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-wizard');
        expect(el).toExist();
        expect(container.querySelector('.chart-options-form')).toNotExist();
    });
    it('ChartWizard rendering chart options', () => {
        ReactDOM.render(<ChartWizard step={1}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.chart-options-form');
        expect(el).toExist();
    });
});
