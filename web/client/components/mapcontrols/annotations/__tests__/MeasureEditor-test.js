/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const React = require('react');
const ReactDOM = require('react-dom');
const ReactTestUtils = require('react-dom/test-utils');
const expect = require('expect');
const MeasureEditor = require('../MeasureEditor');

describe('MeasureEditor component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('MeasureEditor rendering with defaults', () => {
        ReactDOM.render(<MeasureEditor />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('input');
        expect(el).toExist();
    });
    it('MeasureEditor rendering value', () => {
        ReactDOM.render(<MeasureEditor value={10}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('input');
        expect(el).toExist();
        expect(el.value).toBe('10');
    });
    it('MeasureEditor rendering value different UOM', () => {
        ReactDOM.render(<MeasureEditor value={10000} displayUom="km" />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('input');
        expect(el).toExist();
        expect(el.value).toBe('10');
        const options = document.querySelectorAll("option");
        expect(options.length).toBe(5);
        expect(options[0].innerText).toBe("ft");
        expect(options[1].innerText).toBe("m");
        expect(options[2].innerText).toBe("km");
        expect(options[3].innerText).toBe("mi");
        expect(options[4].innerText).toBe("nm");
    });
    it('MeasureEditor rendering only degrees uom', () => {
        ReactDOM.render(<MeasureEditor value={10} projection="EPSG:4326"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('input');
        expect(el).toExist();
        expect(el.value).toBe('10');
        const options = document.querySelectorAll("option");
        expect(options.length).toBe(1);
        expect(options[0].innerText).toBe("deg");
    });
    it('MeasureEditor rendering value changes', () => {
        ReactDOM.render(<MeasureEditor value={10000} displayUom="km" />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('input');
        expect(el).toExist();
        expect(el.value).toBe('10');
        ReactDOM.render(<MeasureEditor value={1000} displayUom="km" />, document.getElementById("container"));
        expect(el.value).toBe('1');
    });
    it('Test MeasureEditor onChange callback, and change after re-render', () => {
        const actions = {
            onChange: () => {}
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<MeasureEditor onChange={actions.onChange} displayUom="km" value={10} />, document.getElementById("container"));
        const container = document.getElementById('container');

        const el = container.querySelector('input');
        ReactTestUtils.Simulate.focus(el);
        el.value = "1";
        ReactTestUtils.Simulate.change(el);
        ReactDOM.render(<MeasureEditor onChange={actions.onChange} displayUom="km" value={1000} />, document.getElementById("container"));
        expect(spyonChange).toHaveBeenCalled();
        expect(spyonChange.calls[0].arguments[0]).toBe(1000);
        expect(el.value).toBe('1');
        ReactDOM.render(<MeasureEditor onChange={actions.onChange} displayUom="km" value={10000} />, document.getElementById("container"));
        expect(el.value).toBe('10');
    });
});
