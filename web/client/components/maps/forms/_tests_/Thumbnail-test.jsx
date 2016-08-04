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
const TestUtils = require('react-addons-test-utils');

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
        const thumbnailItem = ReactDOM.render(<Thumbnail loading={true}/>, document.getElementById("container"));
        expect(thumbnailItem).toExist();

        const thumbnailItemDom = ReactDOM.findDOMNode(thumbnailItem);
        expect(thumbnailItemDom).toExist();

        expect(thumbnailItemDom.className).toBe('btn btn-info');
    });

    it('creates the component with defaults, loading=false', () => {
        const thumbnailItem = ReactDOM.render(<Thumbnail loading={false}/>, document.getElementById("container"));
        expect(thumbnailItem).toExist();

        const thumbnailItemDom = ReactDOM.findDOMNode(thumbnailItem);
        expect(thumbnailItemDom).toExist();

        expect(thumbnailItemDom.className).toBe('dropzone-thumbnail-container');
    });

    it('creates the component without a thumbnail', () => {
        let thumbnail = "myThumnbnailUrl";
        let map = {
            thumbnail: thumbnail,
            id: 123,
            canWrite: true,
            errors: []
        };
        const thumbnailItem = ReactDOM.render(<Thumbnail map={map}/>, document.getElementById("container"));
        expect(thumbnailItem).toExist();

        const thumbnailItemDom = ReactDOM.findDOMNode(thumbnailItem);
        expect(thumbnailItemDom).toExist();

        const content = TestUtils.findRenderedDOMComponentWithClass(thumbnailItem, 'dropzone-content-image');
        expect(content).toExist();
    });

    it('creates the component with a thumbnail', () => {
        let thumbnail = "myThumnbnailUrl";
        let map = {
            thumbnail: thumbnail,
            newThumbnail: thumbnail,
            id: 123,
            canWrite: true,
            errors: []
        };
        const thumbnailItem = ReactDOM.render(<Thumbnail map={map}/>, document.getElementById("container"));
        expect(thumbnailItem).toExist();

        const thumbnailItemDom = ReactDOM.findDOMNode(thumbnailItem);
        expect(thumbnailItemDom).toExist();

        const content = TestUtils.findRenderedDOMComponentWithClass(thumbnailItem, 'dropzone-content-image-added');
        expect(content).toExist();
    });

    it('creates the component with a format error', () => {
        let thumbnail = "myThumnbnailUrl";
        let errors = ["FORMAT"];
        let map = {
            thumbnail: thumbnail,
            id: 123,
            canWrite: true,
            errors: errors
        };
        const thumbnailItem = ReactDOM.render(<Thumbnail map={map}/>, document.getElementById("container"));
        expect(thumbnailItem).toExist();

        const thumbnailItemDom = ReactDOM.findDOMNode(thumbnailItem);
        expect(thumbnailItemDom).toExist();

        const errorFORMAT = TestUtils.findRenderedDOMComponentWithClass(thumbnailItem, 'errorFORMAT');
        expect(errorFORMAT).toExist();

        const noImg = TestUtils.findRenderedDOMComponentWithClass(thumbnailItem, 'dropzone-content-image');
        expect(noImg).toExist();
    });

    it('creates the component with a size error', () => {
        let thumbnail = "myThumnbnailUrl";
        let errors = ["SIZE"];
        let map = {
            thumbnail: thumbnail,
            id: 123,
            canWrite: true,
            errors: errors
        };
        const thumbnailItem = ReactDOM.render(<Thumbnail map={map}/>, document.getElementById("container"));
        expect(thumbnailItem).toExist();

        const thumbnailItemDom = ReactDOM.findDOMNode(thumbnailItem);
        expect(thumbnailItemDom).toExist();

        const errorSIZE = TestUtils.findRenderedDOMComponentWithClass(thumbnailItem, 'errorSIZE');
        expect(errorSIZE).toExist();

        const noImg = TestUtils.findRenderedDOMComponentWithClass(thumbnailItem, 'dropzone-content-image');
        expect(noImg).toExist();
    });

});
