/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const RecordGrid = require('../RecordGrid.jsx');
const expect = require('expect');

const TestUtils = require('react-dom/test-utils');
const sampleCatalogURL = "http://test.com/catalog";
const sampleRecord = {
    identifier: "test-identifier",
    title: "sample title",
    tags: ["subject1", "subject2"],
    description: "sample abstract",
    thumbnail: "http://samlple.com/img.jpg",
    boundingBox: {
        extent: [10.686,
            44.931,
            46.693,
            12.54],
        crs: "EPSG:4326"

    },
    references: [{
        type: "OGC:WMS",
        url: "http://wms.sample.service:80/geoserver/wms?SERVICE=WMS&",
        params: {name: "workspace:layername"},
        SRS: ["EPSG:4326"]
    }]
};

describe('This test for Record Grid', () => {
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
    it('creates the component with defaults', () => {
        const item = ReactDOM.render(<RecordGrid />, document.getElementById("container"));
        expect(item).toExist();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();

        expect(itemDom.className).toBe("record-grid container-fluid");
    });
    // test data
    it('creates the component with data', () => {
        const item = ReactDOM.render(<RecordGrid records={[sampleRecord]} catalogURL={sampleCatalogURL}/>, document.getElementById("container"));
        expect(item).toExist();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        expect(itemDom.className).toBe("record-grid container-fluid");

        // check the thumbnail as a to verify thtat the url is really loaded into the component
        let img = TestUtils.findRenderedDOMComponentWithTag(
            item, 'img'
        );
        expect(img).toExist();
        expect(img.src).toBe(sampleRecord.thumbnail);
    });

    // test non-array configuration
    it('creates the component with non-array data', () => {
        const item = ReactDOM.render(<RecordGrid records={sampleRecord} catalogURL={sampleCatalogURL}/>, document.getElementById("container"));
        expect(item).toExist();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        expect(itemDom.className).toBe("record-grid container-fluid");

        // check the thumbnail as a to verify thtat the url is really loaded into the component
        let img = TestUtils.findRenderedDOMComponentWithTag(
            item, 'img'
        );
        expect(img).toExist();
        expect(img.src).toBe(sampleRecord.thumbnail);
    });

    // test empty configuration
    it('creates the component with no data', () => {
        const item = ReactDOM.render(<RecordGrid records={false} catalogURL={sampleCatalogURL}/>, document.getElementById("container"));
        expect(item).toExist();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toNotExist();
    });

    it('creates the component with not allowed custom crs', () => {
        let actions = {
            onError: () => {
            }
        };
        let actionsSpy = expect.spyOn(actions, "onError");
        const item = ReactDOM.render(<RecordGrid records={[sampleRecord]}
            catalogURL={sampleCatalogURL} crs="EPSG:3857" onError={actions.onError}/>, document.getElementById("container"));
        expect(item).toExist();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toExist();
        button.click();
        expect(actionsSpy.calls.length).toBe(1);
    });

    it('creates the component with allowed custom crs', () => {
        let actions = {
            onLayerAdd: () => {
            }
        };
        let actionsSpy = expect.spyOn(actions, "onLayerAdd");
        const item = ReactDOM.render(<RecordGrid records={[sampleRecord]}
            catalogURL={sampleCatalogURL} crs="EPSG:4326" onLayerAdd={actions.onLayerAdd} />, document.getElementById("container"));
        expect(item).toExist();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toExist();
        button.click();
        expect(actionsSpy.calls.length).toBe(1);
    });
});
