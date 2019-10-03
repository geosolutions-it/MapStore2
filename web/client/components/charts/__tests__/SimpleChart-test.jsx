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
const SimpleChart = require('../SimpleChart');

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
        expect(el).toNotExist();
    });
    it('test line chart', () => {
        ReactDOM.render(<SimpleChart data={data} type="line" xAxis={{dataKey: "name"}} series={SERIES}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('div');
        expect(el).toExist();
    });
    it('test line chart with oblique labels', () => {
        ReactDOM.render(<SimpleChart data={data} type="line" xAxis={{dataKey: "name"}} xAxisAngle={45} series={SERIES}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('div');
        expect(el).toExist();
        const text = container.querySelector('text');
        expect(text.attributes.transform.value).toBe("rotate(-45)");

    });
    it('test pie chart', () => {
        ReactDOM.render(<SimpleChart data={data} type="pie" xAxis={{dataKey: "name"}} series={SERIES}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('div');
        expect(el).toExist();
    });
    it('test bar chart', () => {
        ReactDOM.render(<SimpleChart data={data} type="bar" xAxis={{dataKey: "name"}} series={SERIES}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('div');
        expect(el).toExist();
    });
    it('test bar chart with oblique labels', () => {
        ReactDOM.render(<SimpleChart data={data} type="bar" xAxis={{dataKey: "name"}} xAxisAngle={45} series={SERIES}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('div');
        expect(el).toExist();
        const text = container.querySelector('text');
        expect(text.attributes.transform.value).toBe("rotate(-45)");

    });
    it('test gauge chart', () => {
        ReactDOM.render(<SimpleChart data={data} type="gauge" xAxis={{dataKey: "name"}} series={SERIES}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('div');
        expect(el).toExist();
    });
    it('test chart legend and tooltip', () => {
        ReactDOM.render(<SimpleChart data={data} xAxis={{dataKey: "name"}} series={SERIES}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('div');
        const legend = container.querySelector("div > div.recharts-legend-wrapper");
        const tooltip = container.querySelector("div > div.recharts-tooltip-wrapper");
        expect(el).toExist();
        expect(legend).toExist();
        expect(tooltip).toExist();

    });
});
