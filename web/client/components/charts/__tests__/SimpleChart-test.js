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
import SimpleChart from '../SimpleChart';
import { DATASET_MULTI_SERIES_1 } from './sample_data';

const { data, series, xAxis } = DATASET_MULTI_SERIES_1;
describe('SimpleChart component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('SimpleChart rendering with defaults', () => {
        ReactDOM.render(<SimpleChart />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('div');
        expect(el).toExist();
    });
    it('test line chart', () => {
        ReactDOM.render(<SimpleChart data={data} type="line" xAxis={xAxis} series={series} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('div');
        expect(el).toExist();
    });
    it('test pie chart', () => {
        ReactDOM.render(<SimpleChart data={data} type="pie" xAxis={xAxis} series={series} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('div');
        expect(el).toExist();
    });
    it('test bar chart', () => {
        ReactDOM.render(<SimpleChart data={data} type="bar" xAxis={xAxis} series={series} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('div');
        expect(el).toExist();
    });
});
