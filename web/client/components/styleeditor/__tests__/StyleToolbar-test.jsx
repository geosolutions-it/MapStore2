/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const StyleToolbar = require('../StyleToolbar');
const expect = require('expect');

describe('test StyleToolbar module component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test StyleToolbar creation', () => {
        ReactDOM.render(<StyleToolbar />, document.getElementById("container"));
        const buttons = document.querySelectorAll('.btn');
        expect(buttons.length).toBe(0);
    });

    it('test StyleToolbar no status', () => {
        ReactDOM.render(<StyleToolbar editEnabled />, document.getElementById("container"));
        const buttons = document.querySelectorAll('.btn');
        expect(buttons.length).toBe(3);
    });

    it('test StyleToolbar status template', () => {
        ReactDOM.render(<StyleToolbar editEnabled status="template"/>, document.getElementById("container"));
        let buttons = document.querySelectorAll('.btn');
        expect(buttons.length).toBe(1);

        ReactDOM.render(<StyleToolbar editEnabled status="template" templateId="001"/>, document.getElementById("container"));
        buttons = document.querySelectorAll('.btn');
        expect(buttons.length).toBe(2);
    });

    it('test StyleToolbar status edit', () => {
        ReactDOM.render(<StyleToolbar editEnabled status="edit"/>, document.getElementById("container"));
        const buttons = document.querySelectorAll('.btn');
        expect(buttons.length).toBe(2);
        const disabledButtons = document.querySelectorAll('button:disabled');
        expect(disabledButtons.length).toBe(0);
    });

    it('test StyleToolbar show set default style', () => {
        ReactDOM.render(<StyleToolbar editEnable enableSetDefaultStyle editEnabled/>, document.getElementById("container"));
        const buttons = document.querySelectorAll('.btn');
        expect(buttons.length).toBe(4);
    });

    it('test StyleToolbar modal uses portal', () => {
        ReactDOM.render(<StyleToolbar showModal />, document.getElementById("container"));
        const modalContainer = document.body.children[1].querySelector('.ms-resizable-modal');
        expect(modalContainer).toExist();
    });
});
