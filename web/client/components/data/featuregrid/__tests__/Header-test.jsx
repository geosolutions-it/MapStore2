/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const Header = require('../Header');
const Toolbar = require('../toolbars/Toolbar');
const expect = require('expect');

describe('Test for TopToolbar component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('render with defaults', () => {
        ReactDOM.render(<Header/>, document.getElementById("container"));
        const el = document.getElementsByClassName("data-grid-top-toolbar")[0];
        expect(el).toExist();
    });
    it('render with ViewTools', () => {
        ReactDOM.render(<Header toolbar={Toolbar}/>, document.getElementById("container"));
        const el = document.getElementsByClassName("data-grid-top-toolbar")[0];
        expect(el).toExist();
    });
    it('render with title as object without currentLocale', () => {

        const title = {
            'default': 'Layer',
            'it-IT': 'Livello'
        };

        ReactDOM.render(<Header title={title}/>, document.getElementById("container"));
        const el = document.getElementsByClassName("data-grid-top-toolbar")[0];
        expect(el).toExist();
        const strong = document.getElementsByTagName("STRONG")[0];
        expect(strong.innerHTML).toBe(title.default);
    });
    it('render with title as object with currentLocale', () => {

        const title = {
            'default': 'Layer',
            'it-IT': 'Livello'
        };

        ReactDOM.render(<Header title={title} currentLocale="it-IT"/>, document.getElementById("container"));
        const el = document.getElementsByClassName("data-grid-top-toolbar")[0];
        expect(el).toExist();
        const strong = document.getElementsByTagName("STRONG")[0];
        expect(strong.innerHTML).toBe(title['it-IT']);
    });
    it('render with title as object with missing currentLocale', () => {

        const title = {
            'default': 'Layer',
            'it-IT': 'Livello'
        };

        ReactDOM.render(<Header title={title} currentLocale="en-US"/>, document.getElementById("container"));
        const el = document.getElementsByClassName("data-grid-top-toolbar")[0];
        expect(el).toExist();
        const strong = document.getElementsByTagName("STRONG")[0];
        expect(strong.innerHTML).toBe(title.default);
    });
});
