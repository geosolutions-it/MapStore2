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
import { waitFor } from '@testing-library/react';

describe('MapillaryView', () => {
    const testAPIKey = 'test';
    const mockProviderSettings = {
        ApiURL: "base/web/client/test-resources/mapillary/output/run_04/"
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
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
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
        expect(div).toBeTruthy();
        expect(div.style.display).toEqual('block');
        const viewer = mapillaryStreetView();
        expect(viewer).toBeTruthy();
        expect(viewer.style.position).toBeTruthy();
    });
    it('Test displaying Mapillary viewer by associating location value', (done) => {
        ReactDOM.render(<MapillaryView {...props} location={{properties: {imageId: "image01"}}} providerSettings={mockProviderSettings}/>, document.getElementById("container"));
        const div = emptyStreetView();
        expect(div).toBeTruthy();
        expect(div.style.display).toEqual('block');
        const viewer = mapillaryStreetView();
        expect(viewer).toBeTruthy();
        expect(viewer.style.position).toBeTruthy();
        waitFor(()=>expect(document.querySelector('.mapillary-dom')).toBeTruthy())
            .then(()=>{
                let mapillaryDomElem = document.querySelector('.mapillary-dom');
                expect(mapillaryDomElem).toBeTruthy();
                done();
            }).catch(done);
    });
});
