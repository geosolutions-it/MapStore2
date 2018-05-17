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
        expect(buttons.length).toBe(2);
        expect(buttons[0].querySelector('.glyphicon-filter')).toExist();
        // filter should not enabled because valid means also that
        // there are some attributes
        expect(buttons[0].disabled).toBe(true);
        expect(buttons[1].querySelector('.glyphicon-arrow-right')).toExist();
        expect(buttons[1].disabled).toBe(true);
        ReactDOM.render(<Toolbar step={0} valid />, document.getElementById("container"));
        expect(container.querySelectorAll('button')[1].disabled).toBe(false);
        expect(container.querySelectorAll('button')[1].disabled).toBeFalsy();
    });
    it('step 1', () => {
        ReactDOM.render(<Toolbar step={1} valid />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.btn-group');
        expect(el).toExist();
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBe(2);
        expect(buttons[0].querySelector('.glyphicon-arrow-left')).toExist();
        expect(buttons[1].querySelector('.glyphicon-floppy-disk')).toExist();
    });
    it('step buttons', () => {
        ReactDOM.render(<Toolbar stepButtons={[{text: "text", glyph: 'test', id: "test-button"}]} step={0} valid={false} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.btn-group');
        expect(el).toExist();
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBe(3);
        expect(buttons[0].querySelector('.glyphicon-test')).toExist();
        expect(buttons[1].querySelector('.glyphicon-filter')).toExist();
        expect(buttons[2].querySelector('.glyphicon-arrow-right')).toExist();
        expect(buttons[2].disabled).toBe(true);
        ReactDOM.render(<Toolbar step={0} valid />, document.getElementById("container"));
        expect(container.querySelectorAll('button')[1].disabled).toBeFalsy();
    });
});
