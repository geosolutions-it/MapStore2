/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const {get} = require('lodash');
const expect = require('expect');
const CounterWizard = require('../CounterWizard');

const describeStates = require('../../../../../test-resources/wfs/describe-states.json');
describe('CounterWizard component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('CounterWizard rendering empty-view', () => {
        ReactDOM.render(<CounterWizard />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-wizard');
        expect(el).toExist();
        expect(container.querySelector('.chart-options-form')).toNotExist();
        expect(container.querySelector('.empty-state-container')).toExist();

    });
    it('CounterWizard rendering with base attributes', () => {
        ReactDOM.render(<CounterWizard featureTypeProperties={get(describeStates, "featureTypes[0].properties")}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-wizard');
        expect(el).toExist();
        expect(container.querySelector('.chart-options-form')).toExist();
    });
    it('CounterWizard rendering widget options', () => {
        ReactDOM.render(<CounterWizard step={1}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.chart-options-form');
        expect(el).toNotExist();
    });
});
