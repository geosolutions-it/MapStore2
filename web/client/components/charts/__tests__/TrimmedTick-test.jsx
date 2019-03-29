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
const {TrimmedTick} = require('../TrimmedTick');

describe('TrimmedTick component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Tick with a default value', () => {
        const payload = {value: 50};
        ReactDOM.render(<TrimmedTick x={60} y={60} height={600} width={600} payload={payload} />, document.getElementById("container"));
        const el = document.querySelector('#container');
        expect(el).toExist();
        const value = document.querySelector('#container > text > tspan').textContent;
        expect(value).toBe('50');
    });

    it('Tick with a number value of 123456', () => {
        const payload = {value: 123456};
        ReactDOM.render(<TrimmedTick x={60} y={60} height={600} width={600} payload={payload} />, document.getElementById("container"));
        const el = document.querySelector('#container');
        expect(el).toExist();
        const value = document.querySelector('#container > text > tspan').textContent;
        expect(value).toBe('123456');
    });
    it('Tick with a number value of 123456,789', () => {
        const payload = {value: 123456.789};
        ReactDOM.render(<TrimmedTick x={60} y={60} height={600} width={600} payload={payload} />, document.getElementById("container"));
        const el = document.querySelector('#container');
        expect(el).toExist();
        const value = document.querySelector('#container > text > tspan').textContent;
        expect(value).toBe('123 K');
    });
    it('Tick with a number value of 0.000001', () => {
        const payload = {value: 0.000001};
        ReactDOM.render(<TrimmedTick x={60} y={60} height={600} width={600} payload={payload} />, document.getElementById("container"));
        const el = document.querySelector('#container');
        expect(el).toExist();
        const value = document.querySelector('#container > text > tspan').textContent;
        expect(value).toBe('0');
    });
    it('Tick with a small number and long decimal value', () => {
        const payload = {value: 3e-8};
        ReactDOM.render(<TrimmedTick x={60} y={60} height={600} width={600} payload={payload} />, document.getElementById("container"));
        const el = document.querySelector('#container');
        expect(el).toExist();
        const value = document.querySelector('#container > text > tspan').textContent;
        expect(value).toBe('3e-8');
    });
    it('Tick with a small number and long decimal value', () => {
        const payload = {value: 0.00000003};
        ReactDOM.render(<TrimmedTick x={60} y={60} height={600} width={600} payload={payload} />, document.getElementById("container"));
        const el = document.querySelector('#container');
        expect(el).toExist();
        const value = document.querySelector('#container > text > tspan').textContent;
        expect(value).toBe('3e-8');
    });
    it('Tick with a long string', () => {
        const payload = {value: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'};
        ReactDOM.render(<TrimmedTick x={60} y={60} height={600} width={600} payload={payload} />, document.getElementById("container"));
        const el = document.querySelector('#container');
        expect(el).toExist();
        const value = document.querySelector('#container > text > tspan').textContent;
        expect(value).toBe('aaaa...');
    });
    it('Tick with a short string', () => {
        const payload = {value: 'short'};
        ReactDOM.render(<TrimmedTick x={60} y={60} height={600} width={600} payload={payload} />, document.getElementById("container"));
        const el = document.querySelector('#container');
        expect(el).toExist();
        const value = document.querySelector('#container > text > tspan').textContent;
        expect(value).toBe('short');
    });
});

