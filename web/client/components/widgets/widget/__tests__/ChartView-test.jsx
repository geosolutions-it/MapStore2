/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';

import expect from 'expect';
import ChartView from '../ChartView';
describe('ChartView component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('ChartView rendering with defaults', () => {
        ReactDOM.render(<ChartView />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.mapstore-widget-chart');
        expect(el).toExist();
    });
    it('ChartView rendering with error', () => {
        ReactDOM.render(<ChartView error={new Error()}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.mapstore-widget-chart');
        expect(el).toExist();
        expect(container.querySelector('.empty-state-container')).toExist();
    });
});
