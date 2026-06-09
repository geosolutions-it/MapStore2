/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import expect from 'expect';
import ReactDOM from 'react-dom';
import MapViewerLayout from '../MapViewerLayout';

describe("Test MapViewerLayout Component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('renders with basic props', () => {
        ReactDOM.render(
            <MapViewerLayout id="MAPVIEWER" className="MAP_CLASS">
                <div className="content"></div>
            </MapViewerLayout>,
            document.getElementById("container")
        );

        expect(document.getElementById('MAPVIEWER')).toExist();
        expect(document.getElementsByClassName('MAP_CLASS')[0]).toExist();
        expect(document.getElementsByClassName('ms-map-viewer-layout-body')[0]).toExist();
        expect(document.getElementsByClassName('ms-map-viewer-layout-content')[0]).toExist();
        expect(document.getElementsByClassName('content')[0]).toExist();
    });

    it('renders header and footer', () => {
        ReactDOM.render(
            <MapViewerLayout
                header={<div className="header"></div>}
                footer={<div className="footer"></div>}
            >
                <div className="content"></div>
            </MapViewerLayout>,
            document.getElementById("container")
        );

        expect(document.getElementsByClassName('header')[0]).toExist();
        expect(document.getElementsByClassName('footer')[0]).toExist();
        expect(document.getElementsByClassName('content')[0]).toExist();
    });

    it('renders background, top and bottom containers', () => {
        ReactDOM.render(
            <MapViewerLayout
                background={<div className="background"></div>}
                top={<div className="top"></div>}
                bottom={<div className="bottom"></div>}
            >
                <div className="content"></div>
            </MapViewerLayout>,
            document.getElementById("container")
        );

        // background is inside a _fill _absolute container
        expect(document.getElementsByClassName('background')[0]).toExist();
        // top and bottom containers
        expect(document.getElementsByClassName('top')[0]).toExist();
        expect(document.getElementsByClassName('bottom')[0]).toExist();
    });

    it('renders left and right columns', () => {
        ReactDOM.render(
            <MapViewerLayout
                leftColumn={<div className="left-column"></div>}
                rightColumn={<div className="right-column"></div>}
            >
                <div className="content"></div>
            </MapViewerLayout>,
            document.getElementById("container")
        );

        expect(document.getElementsByClassName('ms-map-viewer-layout-left-column')[0]).toExist();
        expect(document.getElementsByClassName('left-column')[0]).toExist();
        expect(document.getElementsByClassName('ms-map-viewer-layout-right-column')[0]).toExist();
        expect(document.getElementsByClassName('right-column')[0]).toExist();
    });

    it('renders additional columns container', () => {
        ReactDOM.render(
            <MapViewerLayout
                columns={[
                    <div key="col-1" className="extra-col-1"></div>,
                    <div key="col-2" className="extra-col-2"></div>
                ]}
            >
                <div className="content"></div>
            </MapViewerLayout>,
            document.getElementById("container")
        );

        expect(document.getElementsByClassName('ms-map-viewer-layout-columns')[0]).toExist();
        expect(document.getElementsByClassName('extra-col-1')[0]).toExist();
        expect(document.getElementsByClassName('extra-col-2')[0]).toExist();
    });
});

