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
const LegendView = require('../LegendView');
describe('LegendView component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('LegendView rendering with defaults', () => {
        ReactDOM.render(<LegendView />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.compact-legend-grid')).toExist();
    });

    it('LegendView rendering with layers', () => {
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
        ReactDOM.render(<LegendView layers={LAYERS} />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.mapstore-side-card')).toExist();
    });
});
