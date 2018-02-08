/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const expect = require('expect');
const ReactDOM = require('react-dom');
const IdentifyContainer = require('../IdentifyContainer');
// const TestUtils = require('react-dom/test-utils');

describe("test IdentifyContainer", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test rendering as panel', () => {
        ReactDOM.render(<IdentifyContainer enabled requests={[{}]}/>, document.getElementById("container"));
        const sidePanel = document.getElementsByClassName('ms-side-panel');
        expect(sidePanel.length).toBe(1);
    });

    it('test rendering as modal', () => {
        ReactDOM.render(<IdentifyContainer enabled requests={[{}]} dock={false}/>, document.getElementById("container"));
        const resizableModal = document.getElementsByClassName('ms-resizable-modal');
        expect(resizableModal.length).toBe(1);
    });

    it('test component with missing responses', () => {
        const Viewer = ({missingResponses}) => <div id="test-viewer-gfi">{missingResponses}</div>;
        ReactDOM.render(
            <IdentifyContainer viewer={Viewer} enabled requests={[{}]}/>,
            document.getElementById("container")
        );
        const testViewer = document.getElementById('test-viewer-gfi');
        expect(testViewer.innerHTML).toBe('1');
    });

    it('test component component uses custom viewer', () => {
        const Viewer = ({responses}) => <div id="test-viewer-gfi">{responses.length}</div>;
        ReactDOM.render(
            <IdentifyContainer enabled responses={[{}, {}]} viewer={Viewer} />,
            document.getElementById("container")
        );
        const viewer = document.getElementById("test-viewer-gfi");
        expect(viewer.innerHTML).toBe('2');
    });

    it('test component reverse geocode enable/disable', () => {
        ReactDOM.render(
            <IdentifyContainer
                enableRevGeocode
                point={{latlng: {lat: 40, lng: 10}}}
                enabled
                reverseGeocodeData={{display_name: "test"}} />,
            document.getElementById("container")
        );

        let coords = document.getElementsByClassName('ms-geocode-coords')[0];
        expect(coords.innerHTML.indexOf('Lat:') !== -1).toBe(true);
        expect(coords.innerHTML.indexOf('Long:') !== -1).toBe(true);

        ReactDOM.render(
            <IdentifyContainer
                point={{latlng: {lat: 40, lng: 10}}}
                enabled
                reverseGeocodeData={{display_name: "test"}} />,
            document.getElementById("container")
        );
        coords = document.getElementsByClassName('ms-geocode-coords');
        expect(coords.length).toBe(0);

        ReactDOM.render(
            <IdentifyContainer
                point={null}
                enableRevGeocode
                enabled
                reverseGeocodeData={{display_name: "test"}} />,
            document.getElementById("container")
        );
        coords = document.getElementsByClassName('ms-geocode-coords')[0];
        expect(coords.innerHTML).toBe('');
    });

    it('test component reverse geocode modal', () => {
        ReactDOM.render(
            <IdentifyContainer
                enableRevGeocode
                point={{latlng: {lat: 40, lng: 10}}}
                enabled
                showModalReverse
                reverseGeocodeData={{display_name: "test response"}} />,
            document.getElementById("container")
        );

        let alertModal = document.getElementsByClassName('ms-alert-center')[0];
        expect(alertModal).toExist();
        expect(alertModal.children[0].innerHTML).toBe('test response');

        ReactDOM.render(
            <IdentifyContainer
                point={{latlng: {lat: 40, lng: 10}}}
                enabled
                showModalReverse={false}
                reverseGeocodeData={{display_name: "test"}} />,
            document.getElementById("container")
        );

        alertModal = document.getElementsByClassName('ms-alert-center')[0];
        expect(alertModal).toNotExist();
    });
});
