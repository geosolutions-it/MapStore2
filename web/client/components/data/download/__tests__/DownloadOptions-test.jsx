/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var ReactDOM = require('react-dom');
var DownloadOptions = require('../DownloadOptions');
var expect = require('expect');
const spyOn = expect.spyOn;
const TestUtils = require('react-dom/test-utils');

describe('Test for DownloadOptions component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    // test DEFAULTS
    it('render with defaults', () => {
        const cmp = ReactDOM.render(<DownloadOptions/>, document.getElementById("container"));
        expect(cmp).toExist();
    });
    it('render with element selected', () => {
        const cmp = ReactDOM.render(<DownloadOptions downloadOptions={{selectedFormat: "test"}} formats={[{name: "test"}]}/>, document.getElementById("container"));
        expect(cmp).toExist();
        expect(TestUtils.scryRenderedDOMComponentsWithClass(cmp, "Select-value-label")).toExist();
    });
    it('render with srs list element selected', () => {
        const cmp = ReactDOM.render(<DownloadOptions downloadOptions={{selectedSrs: "test"}} srsList={[{name: "test"}]}/>, document.getElementById("container"));
        expect(cmp).toExist();
        expect(TestUtils.scryRenderedDOMComponentsWithClass(cmp, "Select-value-label")).toExist();
    });
    it('singlePage checkbox events', () => {
        const events = {
            onChange: () => {}
        };
        spyOn(events, "onChange");
        ReactDOM.render(<DownloadOptions onChange={events.onChange} virtualScroll={false} downloadOptions={{selectedFormat: "test"}} formats={[{name: "test"}]}/>, document.getElementById("container"));
        const check = document.querySelector('input[type=checkbox]');
        check.click();
        expect(events.onChange).toHaveBeenCalled();

    });
    it('singlePage checkbox not to render: virtualScroll=true', () => {
        ReactDOM.render(<DownloadOptions downloadOptions={{selectedFormat: "test"}} formats={[{name: "test"}]}/>, document.getElementById("container"));
        const check = document.querySelector('input[type=checkbox]');
        expect(check).toNotExist();

    });
    it('singlePage checkbox to render: virtualScroll=false', () => {
        ReactDOM.render(<DownloadOptions virtualScroll={false} downloadOptions={{selectedFormat: "test"}} formats={[{name: "test"}]}/>, document.getElementById("container"));
        const check = document.querySelector('input[type=checkbox]');
        expect(check).toExist();

    });
    it('options in the select with local formats', () => {
        const events = {
            onChange: () => {},
            mockFetch: () => {}
        };
        const wfsFormats = [{name: "test"}, {name: 'test2'}, {name: "test3"}, {name: 'test4'}];
        const localFormats = [{name: "test3"}, {name: 'test4'}];

        ReactDOM.render(
            <DownloadOptions
                onChange={events.onChange}
                virtualScroll={false}
                formatOptionsFetch={events.mockFetch}
                downloadOptions={{selectedFormat: "test"}}
                formats={localFormats}
                wfsFormats={wfsFormats}
            />, document.getElementById("container"));
        const reactBootstrapSelect = document.querySelector('.Select-input input');
        TestUtils.Simulate.change(reactBootstrapSelect);
        const options = document.querySelectorAll('.Select-option');
        const optionsValue = [...options].map(i=> i.innerText);
        expect(optionsValue).toEqual(['test3', 'test4']);
    });
    it('options in the select', () => {
        const events = {
            onChange: () => {},
            mockFetch: () => {}
        };
        const wfsFormats = [{name: "test"}, {name: 'test2'}, {name: "test3"}, {name: 'test4'}];

        ReactDOM.render(
            <DownloadOptions
                onChange={events.onChange}
                virtualScroll={false}
                formatOptionsFetch={events.mockFetch}
                downloadOptions={{selectedFormat: "test"}}
                formats={[]}
                wfsFormats={wfsFormats}
            />, document.getElementById("container"));
        const reactBootstrapSelect = document.querySelector('.Select-input input');
        TestUtils.Simulate.change(reactBootstrapSelect);
        const options = document.querySelectorAll('.Select-option');
        const optionsValue = [...options].map(i=> i.innerText);
        expect(optionsValue).toEqual(['test', 'test2', 'test3', 'test4']);
    });
});
