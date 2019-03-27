/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var ReactDOM = require('react-dom');
var DownloadDialog = require('../DownloadDialog');
var expect = require('expect');
const spyOn = expect.spyOn;
const TestUtils = require('react-dom/test-utils');

describe('Test for DownloadDialog component', () => {
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
        const cmp = ReactDOM.render(<DownloadDialog/>, document.getElementById("container"));
        expect(cmp).toExist();
    });
    it('render with enabled', () => {
        const cmp = ReactDOM.render(<DownloadDialog enabled formats={[{name: "test"}]}/>, document.getElementById("container"));
        expect(cmp).toExist();
        expect(TestUtils.scryRenderedDOMComponentsWithClass(cmp, "Select-value-label")).toExist();
    });
    it('export event', () => {
        const events = {
            onExport: () => {}
        };
        spyOn(events, "onExport");
        ReactDOM.render(<DownloadDialog onExport={events.onExport} downloadOptions={{selectedFormat: "test"}} formats={[{name: "test"}]}/>, document.getElementById("container"));
        const btn = document.querySelector('button.download-button');
        btn.click();
        expect(events.onExport).toHaveBeenCalled();

    });
});
