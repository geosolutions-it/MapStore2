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
        expect(thumbnailItem).toExist();

        const thumbnailItemDom = ReactDOM.findDOMNode(thumbnailItem);
        expect(thumbnailItemDom).toExist();

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
        expect(thumbnailItem).toExist();

        const thumbnailItemDom = ReactDOM.findDOMNode(thumbnailItem);
        expect(thumbnailItemDom).toExist();

        const content = TestUtils.findRenderedDOMComponentWithClass(thumbnailItem, 'dropzone-content-image');
        expect(content).toExist();
    });

    it('creates the component with a thumbnail', () => {
        let thumbnail = "http://localhost:8081/%2Fgeostore%2Frest%2Fdata%2F2214%2Fraw%3Fdecode%3Ddatauri";
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


    it('creates the component with a thumbnail, map=null, metadata=null', () => {
        let thumbnail = "http://localhost:8081/%2Fgeostore%2Frest%2Fdata%2F2214%2Fraw%3Fdecode%3Ddatauri";
        let map = {
            name: "nameMap",
            description: "descMap",
            thumbnail: thumbnail,
            newThumbnail: thumbnail,
            id: 123,
            canWrite: true,
            errors: []
        };

        const thumbnailItem = ReactDOM.render(<Thumbnail map={map}/>, document.getElementById("container"));
        expect(thumbnailItem).toExist();

        // map, metadata
        thumbnailItem.updateThumbnail(null, null);

        const thumbnailItemDom = ReactDOM.findDOMNode(thumbnailItem);
        expect(thumbnailItemDom).toExist();

        const content = TestUtils.findRenderedDOMComponentWithClass(thumbnailItem, 'dropzone-content-image-added');
        expect(content).toExist();
    });

    it('creates the component with a thumbnail, map=null, metadata=object', () => {
        let thumbnail = "http://localhost:8081/%2Fgeostore%2Frest%2Fdata%2F2214%2Fraw%3Fdecode%3Ddatauri";
        let map = {
            name: "nameMap",
            description: "descMap",
            thumbnail: thumbnail,
            newThumbnail: thumbnail,
            id: 123,
            canWrite: true,
            errors: []
        };

        let metadata = {
            name: "name of the map",
            description: "desc of the map"
        };

        const thumbnailItem = ReactDOM.render(<Thumbnail map={map}/>, document.getElementById("container"));
        expect(thumbnailItem).toExist();

        // map, metadata
        thumbnailItem.updateThumbnail(null, metadata);

        const thumbnailItemDom = ReactDOM.findDOMNode(thumbnailItem);
        expect(thumbnailItemDom).toExist();

        const content = TestUtils.findRenderedDOMComponentWithClass(thumbnailItem, 'dropzone-content-image-added');
        expect(content).toExist();
    });

    it('creates the component with a thumbnail, onDrop files=null', (done) => {
        let thumbnail = "http://localhost:8081/%2Fgeostore%2Frest%2Fdata%2F2214%2Fraw%3Fdecode%3Ddatauri";
        let map = {
            name: "nameMap",
            description: "descMap",
            thumbnail: thumbnail,
            newThumbnail: thumbnail,
            id: 123,
            canWrite: true,
            errors: []
        };

        const thumbnailItem = ReactDOM.render(
            <Thumbnail
                map={map}
                onError={(error, mapId) => {
                    try {
                        expect(error).toEqual([]);
                        expect(mapId).toEqual(123);
                    } catch (e) {
                        done(e);
                    }
                }}
                onUpdate={(data) => {
                    try {
                        expect(data).toBeTruthy();
                        const content = document.querySelector('.dropzone-content-image-added');
                        expect(content).toBeTruthy();
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
            />, document.getElementById("container"));
        expect(thumbnailItem).toExist();
        const thumbnailItemDom = ReactDOM.findDOMNode(thumbnailItem);
        expect(thumbnailItemDom).toBeTruthy();

        const file = new Blob([null], { type: 'image/png' });

        const input = document.querySelector('input');
        TestUtils.Simulate.drop(input, { dataTransfer: { files: [file] } });

        const content = thumbnailItemDom.querySelector('.dropzone-content-image-added');
        expect(content).toBeFalsy();

        const loadingNode = document.querySelector('.ms-loading');
        expect(loadingNode).toBeTruthy();
    });


    it('creates the component with a thumbnail, onRemoveThumbnail', (done) => {
        let thumbnail = "http://localhost:8081/%2Fgeostore%2Frest%2Fdata%2F2214%2Fraw%3Fdecode%3Ddatauri";
        let map = {
            name: "nameMap",
            description: "descMap",
            thumbnail: thumbnail,
            newThumbnail: thumbnail,
            id: 123,
            canWrite: true,
            errors: []
        };

        const thumbnailItem = ReactDOM.render(<Thumbnail
            map={map}
            onUpdate={(data) => {
                try {
                    expect(data).toBe(null);
                } catch (e) {
                    done(e);
                }
            }}
            onError={(error, mapId) => {
                try {
                    expect(error).toEqual([]);
                    expect(mapId).toEqual(123);
                    const content = document.querySelector('.dropzone-content-image-added');
                    expect(content).toBeTruthy();
                } catch (e) {
                    done(e);
                }
                done();
            }}
        />, document.getElementById("container"));
        expect(thumbnailItem).toBeTruthy();

        const removeNode = document.querySelector('.btn');
        expect(removeNode).toBeTruthy();
        TestUtils.Simulate.click(removeNode);
    });

    it('creates the component with a thumbnail, deleteThumbnail(thumbnail, mapId)', () => {
        let thumbnail = "http://localhost:8081/%2Fgeostore%2Frest%2Fdata%2F2214%2Fraw%3Fdecode%3Ddatauri";
        let map = {
            name: "nameMap",
            description: "descMap",
            thumbnail: thumbnail,
            newThumbnail: thumbnail,
            id: 123,
            canWrite: true,
            errors: []
        };

        const thumbnailItem = ReactDOM.render(<Thumbnail map={map}/>, document.getElementById("container"));
        expect(thumbnailItem).toExist();

        // map, metadata
        thumbnailItem.deleteThumbnail(thumbnail, map.id);

        const thumbnailItemDom = ReactDOM.findDOMNode(thumbnailItem);
        expect(thumbnailItemDom).toExist();

        const content = TestUtils.findRenderedDOMComponentWithClass(thumbnailItem, 'dropzone-content-image-added');
        expect(content).toExist();
    });
});
