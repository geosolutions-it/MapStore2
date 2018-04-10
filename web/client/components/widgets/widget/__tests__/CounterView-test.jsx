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
const CounterView = require('../CounterView');
describe('CounterView component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('CounterView rendering with defaults', () => {
        ReactDOM.render(<CounterView />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.empty-state-image');
        expect(el).toExist();
    });
    it('CounterView rendering with data', () => {
        ReactDOM.render(<CounterView data={[{ dataKey: 1 }]} series={[{dataKey: "dataKey"}]}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.empty-state-image');
        expect(el).toNotExist();
        expect(container.querySelector('span')).toExist();
    });
    it('CounterView rendering with error', () => {
        ReactDOM.render(<CounterView error={new Error()}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.glyphicon-warning-sign')).toExist();
    });
    it('CounterView rendering style', () => {
        ReactDOM.render(<CounterView data={[{ dataKey: 1 }]} series={[{ dataKey: "dataKey" }]} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.counter-widget-view');
        expect(el).toExist();
        const content = el.querySelector('div');
        expect(content.style.width).toBe("100%");
        expect(content.style.height).toBe("100%");
        expect(content.style.transform).toExist();
        expect(content.style.top).toBe('50%');
        expect(content.style.left).toBe('50%');
        ReactDOM.render(<CounterView data={[{ dataKey: 1 }]} style={{top: "10px"}} series={[{ dataKey: "dataKey" }]} />, document.getElementById("container"));
        const content2 = container.querySelector('.counter-widget-view div');
        expect(content2.style.top).toBe('10px');
    });
});
