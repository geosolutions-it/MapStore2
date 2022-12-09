/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import Toolbar from '../Toolbar';

describe('ChartWizard Toolbar component', () => {
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
        expect(el).toBeTruthy();
    });
    it('step 0', () => {
        ReactDOM.render(<Toolbar step={0} valid={false} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.btn-group');
        expect(el).toBeTruthy();
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBe(2);
    });
    it('step 0 with dashboard editing', () => {
        ReactDOM.render(<Toolbar step={0} valid={false} dashBoardEditing />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.btn-group');
        expect(el).toBeTruthy();
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBe(4);
    });
    it('step 0 - arrow right - disable button', () => {
        ReactDOM.render(<Toolbar step={0} valid={false} dashBoardEditing />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.btn-group');
        expect(el).toBeTruthy();
        const buttons = container.querySelectorAll('button');
        expect(buttons[3].classList.contains('disabled')).toBeTruthy();
    });
    it('step 0 - disable button on error in charts', () => {
        ReactDOM.render(<Toolbar step={0} valid dashBoardEditing editorData={{mapSync: true}} errors={{"layer1": true}} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.btn-group');
        expect(el).toBeTruthy();
        const buttons = container.querySelectorAll('button');
        expect(buttons[3].classList.contains('disabled')).toBeTruthy();
    });
    it('step 1', () => {
        ReactDOM.render(<Toolbar step={1} valid />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.btn-group');
        expect(el).toBeTruthy();
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBe(3);
        expect(buttons[2].querySelector('.glyphicon-floppy-disk')).toBeTruthy();
    });
    it('step buttons in map viewer', () => {
        ReactDOM.render(<Toolbar stepButtons={[{ text: "text", glyph: 'test', id: "test-button" }]} step={0} valid={false} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.btn-group');
        expect(el).toExist();
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBe(3);
        expect(buttons[0].querySelector('.glyphicon-test')).toExist();
    });
    it('step buttons with dashBoardEditing', () => {
        ReactDOM.render(<Toolbar dashBoardEditing stepButtons={[{ text: "text", glyph: 'test', id: "test-button" }]} step={0} valid={false} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.btn-group');
        expect(el).toExist();
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBe(5);
        expect(buttons[0].querySelector('.glyphicon-test')).toExist();
    });
});
