/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import expect from 'expect';

import ReactDOM from 'react-dom';
import MapillaryView from '../MapillaryView';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { waitFor } from '@testing-library/react';

describe('MapillaryView', () => {
    const testAPIKey = 'test';
    let mockAxios;
    const mockProviderSettings = {
        ApiURL: "base/web/client/test-resources/mapillary/output/run_04/index.json"
    };
    const props = {
        apiKey: testAPIKey,
        resetStViewData: () => {},
        style: {
            width: 100,
            height: 200,
            margin: 0
        }
    };
    beforeEach((done) => {
        mockAxios = new MockAdapter(axios);
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        mockAxios.restore();

        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    const emptyStreetView = () => {
        return document.getElementsByClassName('google-street-view')[0];
    };
    const mapillaryStreetView = () => {
        return document.getElementsByClassName('google-street-view')[1];
    };
    it('Test the main lifecycle', () => {
        ReactDOM.render(<MapillaryView {...props} providerSettings={mockProviderSettings}/>, document.getElementById("container"));
        const div = emptyStreetView();
        expect(div).toExist();
        expect(div.style.display).toEqual('block');
        const viewer = mapillaryStreetView();
        expect(viewer).toExist();
        expect(viewer.style.position).toExist();
    });
    it('Test MapillaryView with location value', (done) => {
        mockAxios = new MockAdapter(axios);
        mockAxios.onGet().reply(200, {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [
                            9.0327347,
                            44.3834013,
                            52.621
                        ]
                    },
                    "properties": {
                        "filename": "01916-1665045163-2022-10-06-08-32-43-889",
                        "md5sum": "b44289b035343cc4eebd23c57ec36309",
                        "filetype": "image",
                        "MAPLatitude": 44.3834013,
                        "MAPLongitude": 9.0327347,
                        "MAPCaptureTime": "2022_10_06_10_32_43_000",
                        "MAPAltitude": 52.621,
                        "MAPCompassHeading": {
                            "TrueHeading": 1.08,
                            "MagneticHeading": 1.08
                        },
                        "MAPSequenceUUID": "0",
                        "MAPDeviceMake": "NCTECH LTD",
                        "MAPDeviceModel": "iSTAR Pulsar",
                        "MAPOrientation": 1,
                        "width": 11000,
                        "height": 5500,
                        "extension": ".jpg"
                    }
                }
            ]
        });
        ReactDOM.render(<MapillaryView {...props} location={{properties: {imageId: "TEST_ID"}}} providerSettings={mockProviderSettings}/>, document.getElementById("container"));
        const div = emptyStreetView();
        expect(div).toExist();
        expect(div.style.display).toEqual('block');
        const viewer = mapillaryStreetView();
        expect(viewer).toExist();
        expect(viewer.style.position).toExist();
        waitFor(()=>expect(document.querySelector('.mapillary-dom')).toExist(), {
            timeout: 5000
        })
            .then(()=>{
                let mapillaryDomElem = document.querySelector('.mapillary-dom');
                expect(mapillaryDomElem).toExist();
            }).catch(done)
            .finally(done);
    });
});
