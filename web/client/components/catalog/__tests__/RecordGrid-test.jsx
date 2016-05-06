/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react/addons');
const ReactDOM = require('react-dom');
const RecordGrid = require('../RecordGrid.jsx');
const expect = require('expect');

const TestUtils = require('react/addons').addons.TestUtils;
const sampleCatalogURL = "http://test.com/catalog";
const sampleRecord = {
    boundingBox: {
        extent: [10.686,
                44.931,
                46.693,
                12.54],
        crs: "EPSG:4326"

    },
    dc: {
        identifier: "test-identifier",
        title: "sample title",
        subject: ["subject1", "subject2"],
        "abstract": "sample abstract",
        URI: [{
            TYPE_NAME: "DC_1_1.URI",
            protocol: "OGC:WMS-1.1.1-http-get-map",
            name: "workspace:layername",
            description: "sample layer description",
            value: "http://wms.sample.service:80/geoserver/wms?SERVICE=WMS&"
        }, {
            TYPE_NAME: "DC_1_1.URI",
            protocol: "image/png",
            name: "thumbnail",
            value: "resources.get?id=187105&fname=55b9f7b9-53ff-4e2d-8537-4e681c3218c5_s.png&access=public"
        }]
    }
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

        expect(itemDom.className).toBe("record-grid container");
    });
    // test data
    it('creates the component with data', () => {
        const item = ReactDOM.render(<RecordGrid records={[sampleRecord]} catalogURL={sampleCatalogURL}/>, document.getElementById("container"));
        expect(item).toExist();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toExist();
        expect(itemDom.className).toBe("record-grid container");

        // check the thumbnail as a to verify thtat the url is really loaded into the component
        let img = TestUtils.findRenderedDOMComponentWithTag(
           item, 'img'
        );
        expect(img).toExist();
        expect(img.src).toBe(sampleCatalogURL + "/" + sampleRecord.dc.URI[1].value);
    });


});
