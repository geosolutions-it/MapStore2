/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');

const expect = require('expect');
const Toolbar = require('../Toolbar');
describe('CounterWizard Toolbar component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('rendering with defaults', () => {
        ReactDOM.render(<Toolbar />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.btn-group');
        expect(el).toExist();
    });
    it('step 0', () => {
        ReactDOM.render(<Toolbar step={0} valid={false} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.btn-group');
        expect(el).toExist();
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBe(0);
    });
    it('step 1', () => {
        ReactDOM.render(<Toolbar step={1} valid />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.btn-group');
        expect(el).toExist();
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBe(3);
        expect(buttons[0].querySelector('.glyphicon-arrow-left')).toExist();
        expect(buttons[1].querySelector('.glyphicon-filter')).toExist();
    });
    it('step 2', () => {
        ReactDOM.render(<Toolbar step={1} valid />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.btn-group');
        expect(el).toExist();
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBe(3);
        expect(buttons[0].querySelector('.glyphicon-arrow-left')).toExist();
        expect(buttons[1].querySelector('.glyphicon-filter')).toExist();
        expect(buttons[2].querySelector('.glyphicon-arrow-right')).toExist();
    });
    it('step buttons', () => {
        ReactDOM.render(<Toolbar stepButtons={[{ text: "text", glyph: 'test', id: "test-button" }]} step={0} valid={false} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.btn-group');
        expect(el).toExist();
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBe(1);
        expect(buttons[0].querySelector('.glyphicon-test')).toExist();
    });
});
