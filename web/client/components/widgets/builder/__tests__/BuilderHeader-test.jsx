/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const ReactTestUtils = require('react-dom/test-utils');
const expect = require('expect');
const BuilderHeader = require('../BuilderHeader');
describe('BuilderHeader component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('BuilderHeader rendering with defaults', () => {
        ReactDOM.render(<BuilderHeader />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.m-header');
        expect(el).toExist();
    });
    it('Test BuilderHeader onClose', () => {
        const actions = {
            onClose: () => {}
        };
        const spyonClose = expect.spyOn(actions, 'onClose');
        ReactDOM.render(<BuilderHeader onClose={actions.onClose} />, document.getElementById("container"));
        const btn = document.querySelector('button.pull-left');
        ReactTestUtils.Simulate.click(btn); // <-- trigger event callback
        expect(spyonClose).toHaveBeenCalled();
    });
    it('filter button not present on first step', () => {
        ReactDOM.render(<BuilderHeader step={0} />, document.getElementById("container"));
        const btn = document.querySelector('.glyphicon-filter');
        expect(btn).toNotExist();
    });
    it('Test BuilderHeader  openFilterEditor callback', () => {
        const actions = {
            openFilterEditor: () => {}
        };
        const spy = expect.spyOn(actions, 'openFilterEditor');
        ReactDOM.render(<BuilderHeader step={1} openFilterEditor={actions.openFilterEditor} />, document.getElementById("container"));
        const btn = document.querySelector('.glyphicon-filter'); // the toolbar button
        ReactTestUtils.Simulate.click(btn); // <-- trigger event callback
        expect(spy).toHaveBeenCalled();
    });
    it('Test BuilderHeader nextButton', () => {
        const actions = {
            setPage: () => {}
        };
        const spysetPage = expect.spyOn(actions, 'setPage' );
        ReactDOM.render(<BuilderHeader step={1} valid setPage={actions.setPage} editorData={{type: "bar"}}/>, document.getElementById("container"));
        const btn = document.querySelector('.glyphicon-arrow-right');
        expect(btn).toExist();
        const prev = document.querySelector('.glyphicon-arrow-left');
        expect(prev).toExist();
        ReactTestUtils.Simulate.click(btn); // <-- trigger event callback
        expect(spysetPage).toHaveBeenCalled();
    });
    it('Test BuilderHeader prevButton', () => {
        const actions = {
            setPage: () => {}
        };
        const spysetPage = expect.spyOn(actions, 'setPage' );
        ReactDOM.render(<BuilderHeader step={1} valid setPage={actions.setPage} editorData={{type: "bar"}}/>, document.getElementById("container"));
        const btn = document.querySelector('.glyphicon-arrow-right');
        expect(btn).toExist();
        const prev = document.querySelector('.glyphicon-arrow-left');
        expect(prev).toExist();
        ReactTestUtils.Simulate.click(prev); // <-- trigger event callback
        expect(spysetPage).toHaveBeenCalled();
    });
    it('Test BuilderHeader save', () => {
        const actions = {
            onFinish: () => {}
        };
        const spyonFinish = expect.spyOn(actions, 'onFinish' );
        ReactDOM.render(<BuilderHeader step={2} valid onFinish={actions.onFinish} editorData={{type: "bar"}}/>, document.getElementById("container"));
        const btn = document.querySelector('.glyphicon-floppy-disk');
        expect(btn).toExist();
        ReactTestUtils.Simulate.click(btn); // <-- trigger event callback
        expect(spyonFinish).toHaveBeenCalled();
    });
});
