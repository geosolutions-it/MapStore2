/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var ReactDOM = require('react-dom');
var Thumbnail = require('../Thumbnail.jsx');
var expect = require('expect');
const TestUtils = require('react-dom/test-utils');

describe('This test for Thumbnail', () => {


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
    it('creates the component with defaults, loading=true', () => {
        const thumbnailItem = ReactDOM.render(<Thumbnail loading/>, document.getElementById("container"));
        expect(thumbnailItem).toBeTruthy();

        const thumbnailItemDom = ReactDOM.findDOMNode(thumbnailItem);
        expect(thumbnailItemDom).toBeTruthy();

        expect(thumbnailItemDom.className).toBe('dropzone-thumbnail-container ms-loading');
    });

    it('creates the component with defaults, loading=false', () => {
        const thumbnailItem = ReactDOM.render(<Thumbnail loading={false} map={{saving: false}}/>, document.getElementById("container"));
        expect(thumbnailItem).toBeTruthy();

        const thumbnailItemDom = ReactDOM.findDOMNode(thumbnailItem);
        expect(thumbnailItemDom).toBeTruthy();

        expect(thumbnailItemDom.className).toBe('dropzone-thumbnail-container');
    });

    it('creates the component without a thumbnail', () => {
        let thumbnail = "http://localhost:8081/%2Fgeostore%2Frest%2Fdata%2F2214%2Fraw%3Fdecode%3Ddatauri";
        let map = {
            thumbnail: thumbnail,
            id: 123,
            canWrite: true,
            errors: []
        };
        const thumbnailItem = ReactDOM.render(<Thumbnail map={map}/>, document.getElementById("container"));
        expect(thumbnailItem).toBeTruthy();

        const thumbnailItemDom = ReactDOM.findDOMNode(thumbnailItem);
        expect(thumbnailItemDom).toBeTruthy();

        const content = TestUtils.findRenderedDOMComponentWithClass(thumbnailItem, 'dropzone-content-image');
        expect(content).toBeTruthy();
    });

    it('creates the component with a thumbnail', () => {
        let thumbnail = "http://localhost:8081/%2Fgeostore%2Frest%2Fdata%2F2214%2Fraw%3Fdecode%3Ddatauri";
        const thumbnailItem = ReactDOM.render(<Thumbnail thumbnail={thumbnail}/>, document.getElementById("container"));
        expect(thumbnailItem).toBeTruthy();

        const thumbnailItemDom = ReactDOM.findDOMNode(thumbnailItem);
        expect(thumbnailItemDom).toBeTruthy();

        const content = TestUtils.findRenderedDOMComponentWithClass(thumbnailItem, 'dropzone-content-image-added');
        expect(content).toBeTruthy();
    });

});
