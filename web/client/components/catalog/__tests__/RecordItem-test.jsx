/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react/addons');
const ReactDOM = require('react-dom');
const ReactItem = require('../RecordItem.jsx');
const expect = require('expect');

const TestUtils = require('react/addons').addons.TestUtils;

const sampleRecord = {
    identifier: "test-identifier",
    title: "sample title",
    tags: ["subject1", "subject2"],
    description: "sample abstract",
    thumbnail: "img.jpg",
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
        params: {name: "workspace:layername"}
    }]
};

describe('This test for RecordItem', () => {
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
        const item = ReactDOM.render(<ReactItem />, document.getElementById("container"));
        expect(item).toExist();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();

        expect(itemDom.className).toBe('record-item panel panel-default');
    });
    // test data
    it('creates the component with data', () => {
        const item = ReactDOM.render(<ReactItem record={sampleRecord}/>, document.getElementById("container"));
        expect(item).toExist();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        expect(itemDom.className).toBe('record-item panel panel-default');
    });
    // test handlers
    it('check event handlers', () => {
        let actions = {
            onLayerAdd: () => {

            },
            onZoomToExtent: () => {

            }
        };
        let actionsSpy = expect.spyOn(actions, "onLayerAdd");
        let actionsSpy2 = expect.spyOn(actions, "onZoomToExtent");
        const item = ReactDOM.render((<ReactItem
            record={sampleRecord}
            onLayerAdd={actions.onLayerAdd}
            onZoomToExtent={actions.onZoomToExtent}/>), document.getElementById("container"));
        expect(item).toExist();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        expect(itemDom.className).toBe('record-item panel panel-default');
        let button = TestUtils.findRenderedDOMComponentWithTag(
           item, 'button'
        );
        expect(button).toExist();
        button.click();
        expect(actionsSpy.calls.length).toBe(1);
        expect(actionsSpy2.calls.length).toBe(1);
    });

});
