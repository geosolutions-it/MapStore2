/*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

const React = require('react');
const ReactDOM = require('react-dom');
const Rx = require('rxjs');

const expect = require('expect');
const DataStreamChart = require('../DataStreamChart');
const data = [
    {name: 'Page A', uv: 0, pv: 0, amt: 0},
    {name: 'Page B', uv: 1, pv: 1, amt: 1},
    {name: 'Page C', uv: 2, pv: 2, amt: 2},
    {name: 'Page D', uv: 3, pv: 3, amt: 3},
    {name: 'Page E', uv: 4, pv: 4, amt: 4},
    {name: 'Page F', uv: 5, pv: 5, amt: 5},
    {name: 'Page G', uv: 6, pv: 6, amt: 6}
];
const SERIES = [{dataKey: "pv"}, {dataKey: "uv"}];
describe('DataStreamChart component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('DataStreamChart rendering with defaults', () => {
        ReactDOM.render(<DataStreamChart />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('div');
        expect(el).toNotExist();
    });
    it('DataStreamChart with mock data stream', () => {
        const dataStreamFactory = () => Rx.Observable.of({data});
        ReactDOM.render(<DataStreamChart dataStreamFactory={dataStreamFactory} type="line" xAxis={{dataKey: "name"}} series={SERIES}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('div');
        expect(el).toExist();
    });
});
