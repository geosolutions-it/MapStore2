/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const expect = require('expect');
const GeocodeViewer = require('../GeocodeViewer.jsx');
const TestUtils = require('react-dom/test-utils');

describe('GeocodeViewer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates the GeocodeViewer hide', () => {
        ReactDOM.render(
            <GeocodeViewer
                enableRevGeocode
                latlng={{lat: 40, lng: 10}}
                lngCorrected={10}/>,
            document.getElementById("container")
        );
        const modalEditor = document.getElementsByClassName('ms-resizable-modal');
        expect(modalEditor.length).toBe(0);
    });

    it('test rendering close x and show', () => {
        const testHandlers = {
            hideRevGeocode: () => {}
        };
        const spyHideRevGeocode = expect.spyOn(testHandlers, 'hideRevGeocode');
        ReactDOM.render(<GeocodeViewer
            enableRevGeocode
            showModalReverse
            latlng={{lat: 40, lng: 10}}
            hideRevGeocode={testHandlers.hideRevGeocode}
            lngCorrected={10}/>, document.getElementById("container"));
        const modalEditor = document.getElementsByClassName('ms-resizable-modal');
        expect(modalEditor.length).toBe(1);
        const btns = document.getElementsByClassName('ms-header-btn');
        expect(btns.length).toBe(1);
        TestUtils.Simulate.click(btns[0]);
        expect(spyHideRevGeocode).toHaveBeenCalled();
    });

    it('test rendering close close', () => {
        const testHandlers = {
            hideRevGeocode: () => {}
        };
        const spyHideRevGeocode = expect.spyOn(testHandlers, 'hideRevGeocode');
        ReactDOM.render(<GeocodeViewer
            enableRevGeocode
            showModalReverse
            latlng={{lat: 40, lng: 10}}
            hideRevGeocode={testHandlers.hideRevGeocode}
            lngCorrected={10}/>, document.getElementById("container"));
        const modalEditor = document.getElementsByClassName('ms-resizable-modal');
        expect(modalEditor.length).toBe(1);
        const btns = document.getElementsByClassName('btn');
        expect(btns.length).toBe(1);
        TestUtils.Simulate.click(btns[0]);
        expect(spyHideRevGeocode).toHaveBeenCalled();
    });
});
