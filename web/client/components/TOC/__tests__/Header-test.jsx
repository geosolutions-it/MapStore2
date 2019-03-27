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
const expect = require('expect');

describe('TOC Header', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('render component', () => {
        ReactDOM.render(<Header/>, document.getElementById("container"));
        const el = document.getElementsByClassName("mapstore-toc-head").item(0);
        expect(el).toExist();
        const row = el.getElementsByClassName("row");
        expect(row.length).toBe(3);
        const sections = document.getElementsByClassName("toc-head-sections-3").item(0);
        expect(sections).toExist();
    });

    it('disable toolbar', () => {
        ReactDOM.render(<Header title={'Map Title'} showTools={false}/>, document.getElementById("container"));
        const el = document.getElementsByClassName("mapstore-toc-head").item(0);
        expect(el).toExist();
        const row = el.getElementsByClassName("row");
        expect(row.length).toBe(2);
        const sections = document.getElementsByClassName("toc-head-sections-2").item(0);
        expect(sections).toExist();
        const title = document.getElementsByClassName("mapstore-toc-head-title").item(0);
        expect(title).toExist();
        expect(title.innerHTML).toContain('Map Title');
    });

    it('disable filter', () => {
        ReactDOM.render(<Header showFilter={false}/>, document.getElementById("container"));
        const el = document.getElementsByClassName("mapstore-toc-head").item(0);
        expect(el).toExist();
        const row = el.getElementsByClassName("row");
        expect(row.length).toBe(2);
        const sections = document.getElementsByClassName("toc-head-sections-2").item(0);
        expect(sections).toExist();
        const title = document.getElementsByClassName("mapstore-toc-head-title").item(0);
        expect(title).toExist();
        expect(title.innerHTML).toNotContain('Map Title');
    });

    it('disable filter', () => {
        ReactDOM.render(<Header showTitle={false}/>, document.getElementById("container"));
        const el = document.getElementsByClassName("mapstore-toc-head").item(0);
        expect(el).toExist();
        const row = el.getElementsByClassName("row");
        expect(row.length).toBe(2);
        const sections = document.getElementsByClassName("toc-head-sections-2").item(0);
        expect(sections).toExist();
        const title = document.getElementsByClassName("mapstore-toc-head-title").item(0);
        expect(title).toNotExist();
    });

    it('disable title and filter', () => {
        ReactDOM.render(<Header showTitle={false} showFilter={false} toolbar={<div id="new-toolbar">toolbar</div>}/>, document.getElementById("container"));
        const el = document.getElementsByClassName("mapstore-toc-head").item(0);
        expect(el).toExist();
        const row = el.getElementsByClassName("row");
        expect(row.length).toBe(1);
        const sections = document.getElementsByClassName("toc-head-sections-1").item(0);
        expect(sections).toExist();
        const title = document.getElementsByClassName("mapstore-toc-head-title").item(0);
        expect(title).toNotExist();
        const toolbar = document.getElementById("new-toolbar");
        expect(toolbar).toExist();
        expect(toolbar.innerHTML).toBe('toolbar');
    });

    it('disable all', () => {
        ReactDOM.render(<Header showTitle={false} showTools={false} showFilter={false} toolbar={<div id="new-toolbar">toolbar</div>}/>, document.getElementById("container"));
        const el = document.getElementsByClassName("mapstore-toc-head").item(0);
        expect(el).toExist();
        const row = el.getElementsByClassName("row");
        expect(row.length).toBe(0);
        const sections = document.getElementsByClassName("toc-head-sections").item(0);
        expect(sections).toExist();
        const title = document.getElementsByClassName("mapstore-toc-head-title").item(0);
        expect(title).toNotExist();
        const toolbar = document.getElementById("new-toolbar");
        expect(toolbar).toNotExist();
    });
});
