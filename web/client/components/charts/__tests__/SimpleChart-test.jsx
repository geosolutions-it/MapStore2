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
      {name: 'Page A', uv: 0},
      {name: 'Page B', uv: 1},
      {name: 'Page C', uv: 2},
      {name: 'Page D', uv: 3},
      {name: 'Page E', uv: 4},
      {name: 'Page F', uv: 5},
      {name: 'Page G', uv: 6}
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
    it('test with y axis vlaues over trillion ', () => {
        let modifiedData = data;
        modifiedData[6].uv = 10000000000000;

        ReactDOM.render(<SimpleChart data={modifiedData} type="line" xAxis={{dataKey: "name"}} yAxis series={SERIES}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('div');
        expect(el).toExist();
        const maxValue = document.querySelector('#container > div > svg > g.recharts-layer.recharts-y-axis > g > g > g:nth-child(5) > text > tspan').textContent;
        expect(maxValue).toBe('10 T');
    });
    it('test y axis with short strings ', () => {
        let modifiedData = data;
        modifiedData.map(y => y.uv = 'string');
        ReactDOM.render(<SimpleChart data={modifiedData} type="line" xAxis={{dataKey: "name"}} yAxis={{dataKey: "uv", type: "category"}} series={SERIES}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('div');
        expect(el).toExist();
        const maxValue = document.querySelector('#container > div > svg > g.recharts-layer.recharts-y-axis > g > g > g > text > tspan').textContent;
        expect(maxValue).toBe('string');
    });
    it('test y axis with long strings ', () => {
        let modifiedData = data;
        const string = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        modifiedData.map((y, i) => y.uv = string.substring(0, i * 2));
        ReactDOM.render(<SimpleChart data={modifiedData} type="line" xAxis={{dataKey: "name"}} yAxis={{dataKey: "uv", type: "category"}} series={SERIES}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('div');
        expect(el).toExist();
        const firstValue = document.querySelector('#container > div > svg > g.recharts-layer.recharts-y-axis > g > g > g:nth-child(1) > text > tspan').textContent;
        const secondValue = document.querySelector('#container > div > svg > g.recharts-layer.recharts-y-axis > g > g > g:nth-child(2) > text > tspan').textContent;
        const thirdValue = document.querySelector('#container > div > svg > g.recharts-layer.recharts-y-axis > g > g > g:nth-child(3) > text > tspan').textContent;
        const fourthValue = document.querySelector('#container > div > svg > g.recharts-layer.recharts-y-axis > g > g > g:nth-child(4) > text > tspan').textContent;
        const fifthValue = document.querySelector('#container > div > svg > g.recharts-layer.recharts-y-axis > g > g > g:nth-child(5) > text > tspan').textContent;
        const sixthValue = document.querySelector('#container > div > svg > g.recharts-layer.recharts-y-axis > g > g > g:nth-child(6) > text > tspan').textContent;

        expect(firstValue).toBe('aa');
        expect(secondValue).toBe('aaaa');
        expect(thirdValue).toBe('aaaaaa');
        expect(fourthValue).toBe('aaaa...');
        expect(fourthValue).toEqual(fifthValue);
        expect(fourthValue).toEqual(sixthValue);


    });
    it('test y axis with undefined valus ', () => {
        let modifiedData = data;
        modifiedData.map(y => y.uv = undefined);
        ReactDOM.render(<SimpleChart data={modifiedData} type="line" xAxis={{dataKey: "name"}} yAxis={{dataKey: "uv", type: "category"}} series={SERIES}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('div');
        expect(el).toExist();
        const maxValue = document.querySelector('#container > div > svg > g.recharts-layer.recharts-y-axis').textContent;
        expect(maxValue).toBe('');
    });
    it('test y axis with null valus ', () => {
        let modifiedData = data;
        modifiedData.map(y => y.uv = null);
        ReactDOM.render(<SimpleChart data={modifiedData} type="line" xAxis={{dataKey: "name"}} yAxis={{dataKey: "uv", type: "category"}} series={SERIES}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('div');
        expect(el).toExist();
        const maxValue = document.querySelector('#container > div > svg > g.recharts-layer.recharts-y-axis').textContent;
        expect(maxValue).toBe('');
    });
    it('test y axis with long decimal numbers ', () => {
        let modifiedData = data;
        modifiedData.map((y, i) => y.uv = 3.1 / (i * 2));
        ReactDOM.render(<SimpleChart data={modifiedData} type="line" xAxis={{dataKey: "name"}} yAxis={{dataKey: "uv", type: "category"}} series={SERIES}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('div');
        expect(el).toExist();
        expect(el).toExist();
        const firstValue = document.querySelector('#container > div > svg > g.recharts-layer.recharts-y-axis > g > g > g:nth-child(1) > text > tspan').textContent;
        const secondValue = document.querySelector('#container > div > svg > g.recharts-layer.recharts-y-axis > g > g > g:nth-child(2) > text > tspan').textContent;
        const thirdValue = document.querySelector('#container > div > svg > g.recharts-layer.recharts-y-axis > g > g > g:nth-child(3) > text > tspan').textContent;
        const fourthValue = document.querySelector('#container > div > svg > g.recharts-layer.recharts-y-axis > g > g > g:nth-child(4) > text > tspan').textContent;
        const fifthValue = document.querySelector('#container > div > svg > g.recharts-layer.recharts-y-axis > g > g > g:nth-child(5) > text > tspan').textContent;
        const sixthValue = document.querySelector('#container > div > svg > g.recharts-layer.recharts-y-axis > g > g > g:nth-child(6) > text > tspan').textContent;

        expect(firstValue).toEqual(Infinity);
        expect(secondValue.length).toBeLessThan(7);
        expect(thirdValue.length).toBeLessThan(7);
        expect(fourthValue.length).toBeLessThan(7);
        expect(fifthValue.length).toBeLessThan(7);
        expect(sixthValue.length).toBeLessThan(7);
    });
    it('test y axis with small values and long decimal numbers ', () => {
        let modifiedData = data;
        modifiedData.map((y, i) => y.uv = 0 + i / 100000000);
        ReactDOM.render(<SimpleChart data={modifiedData} type="line" xAxis={{dataKey: "name"}} yAxis={{dataKey: "uv", type: "category"}} series={SERIES}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('div');
        expect(el).toExist();
        expect(el).toExist();
        const firstValue = document.querySelector('#container > div > svg > g.recharts-layer.recharts-y-axis > g > g > g:nth-child(1) > text > tspan').textContent;
        const secondValue = document.querySelector('#container > div > svg > g.recharts-layer.recharts-y-axis > g > g > g:nth-child(2) > text > tspan').textContent;
        const thirdValue = document.querySelector('#container > div > svg > g.recharts-layer.recharts-y-axis > g > g > g:nth-child(3) > text > tspan').textContent;
        const fourthValue = document.querySelector('#container > div > svg > g.recharts-layer.recharts-y-axis > g > g > g:nth-child(4) > text > tspan').textContent;
        const fifthValue = document.querySelector('#container > div > svg > g.recharts-layer.recharts-y-axis > g > g > g:nth-child(5) > text > tspan').textContent;
        const sixthValue = document.querySelector('#container > div > svg > g.recharts-layer.recharts-y-axis > g > g > g:nth-child(6) > text > tspan').textContent;

        expect(firstValue).toEqual(0);
        expect(secondValue).toEqual(1e-8);
        expect(thirdValue).toEqual(2e-8);
        expect(fourthValue).toEqual(3e-8);
        expect(fifthValue).toEqual(4e-8);
        expect(sixthValue).toEqual(5e-8);
    });
});
