/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import ReactDOM from 'react-dom';
import RecordGrid from '../RecordGrid.jsx';
import expect from 'expect';
import TestUtils from 'react-dom/test-utils';
import axios from '../../../libs/ajax';
import MockAdapter from "axios-mock-adapter";
import TILE_MAP_RESPONSE from 'raw-loader!../../../test-resources/tms/TileMapSample.xml';

let mockAxios;

const sampleCatalogURL = "http://test.com/catalog";
const sampleRecord = {
    serviceType: 'wms',
    isValid: true,
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
    }],
    ogcReferences: {
        type: "OGC:WMS",
        url: "http://wms.sample.service:80/geoserver/wms?SERVICE=WMS&",
        params: {name: "workspace:layername"},
        SRS: ["EPSG:4326"]
    }
};

describe('This test for Record Grid', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        mockAxios.restore();
        setTimeout(done);
    });

    // test DEFAULTS
    it('creates the component with defaults', () => {
        const item = ReactDOM.render(<RecordGrid />, document.getElementById("container"));
        expect(item).toBeTruthy();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();

        expect(itemDom.className).toBe("record-grid container-fluid");
    });
    // test data
    it('creates the component with data', () => {
        const item = ReactDOM.render(<RecordGrid records={[sampleRecord]} catalogURL={sampleCatalogURL}/>, document.getElementById("container"));
        expect(item).toBeTruthy();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        expect(itemDom.className).toBe("record-grid container-fluid");

        // check the thumbnail as a to verify thtat the url is really loaded into the component
        let img = TestUtils.findRenderedDOMComponentWithTag(
            item, 'img'
        );
        expect(img).toBeTruthy();
        expect(img.src).toBe(sampleRecord.thumbnail);
    });

    // test non-array configuration
    it('creates the component with non-array data', () => {
        const item = ReactDOM.render(<RecordGrid records={sampleRecord} catalogURL={sampleCatalogURL}/>, document.getElementById("container"));
        expect(item).toBeTruthy();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeTruthy();
        expect(itemDom.className).toBe("record-grid container-fluid");

        // check the thumbnail as a to verify thtat the url is really loaded into the component
        let img = TestUtils.findRenderedDOMComponentWithTag(
            item, 'img'
        );
        expect(img).toBeTruthy();
        expect(img.src).toBe(sampleRecord.thumbnail);
    });

    // test empty configuration
    it('creates the component with no data', () => {
        const item = ReactDOM.render(<RecordGrid records={false} catalogURL={sampleCatalogURL}/>, document.getElementById("container"));
        expect(item).toBeTruthy();

        const itemDom = ReactDOM.findDOMNode(item);
        expect(itemDom).toBeFalsy();
    });

    it('creates the component with not allowed custom crs', (done) => {
        let actions = {
            onError: () => {
                done();
            }
        };
        const item = ReactDOM.render(<RecordGrid records={[sampleRecord]}
            catalogURL={sampleCatalogURL} crs="EPSG:3857" onError={actions.onError}/>, document.getElementById("container"));
        expect(item).toBeTruthy();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toBeTruthy();
        button.click();
    });

    it('creates the component with allowed custom crs', (done) => {
        let actions = {
            onLayerAdd: () => {
                done();
            }
        };
        const item = ReactDOM.render(<RecordGrid records={[sampleRecord]}
            catalogURL={sampleCatalogURL} crs="EPSG:4326" onLayerAdd={actions.onLayerAdd} />, document.getElementById("container"));
        expect(item).toBeTruthy();
        let button = TestUtils.findRenderedDOMComponentWithTag(
            item, 'button'
        );
        expect(button).toBeTruthy();
        button.click();
    });

    it('should send a request for tms layer', (done) => {
        mockAxios.onGet().reply(() => {
            expect(document.querySelector('#content')).toBeFalsy();
            return [200, TILE_MAP_RESPONSE];
        });

        const item = ReactDOM.render(
            <RecordGrid
                records={[{
                    serviceType: 'tms',
                    layerType: 'tms',
                    isValid: true,
                    references: []
                }]}
                catalogURL={sampleCatalogURL}
                onLayerAdd={(layer) => {
                    try {
                        expect(layer.type).toBe("tms");
                        expect(layer.title).toBe("Sample Layer");
                        expect(layer.visibility).toBe(true);
                        expect(layer.srs).toBe("EPSG:3857");
                        done();
                    } catch (e) {
                        done(e);
                    }
                    done();
                }} />,
            document.getElementById("container")
        );
        expect(item).toBeTruthy();
        const button = TestUtils.findRenderedDOMComponentWithTag(item, 'button');
        expect(button).toBeTruthy();
        button.click();
    });
});
