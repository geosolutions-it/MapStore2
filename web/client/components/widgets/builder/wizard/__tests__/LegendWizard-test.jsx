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
const LegendWizard = require('../LegendWizard');
describe('LegendWizard component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('LegendWizard rendering with defaults', () => {
        ReactDOM.render(<LegendWizard />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-wizard');
        expect(el).toExist();
        expect(container.querySelector('.empty-state-container')).toExist();
    });
    it('LegendWizard rendering with layers', () => {
        const LAYERS = [{
            name: 'layer:00',
            title: 'Layer',
            visibility: true,
            type: 'wms'
        },
        {
            name: 'layer:01',
            title: 'Layer:01',
            visibility: false,
            type: 'wms',
            opacity: 0.5
        }
        ];
        const dependencies = { layers: LAYERS };
        ReactDOM.render(<LegendWizard valid dependencies={dependencies} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-wizard');
        expect(el).toExist();
        expect(container.querySelector('.compact-legend-grid')).toExist();
    });
    it('LegendWizard rendering options', () => {
        ReactDOM.render(<LegendWizard step={1} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.widget-options-form');
        expect(el).toExist();
    });
});
