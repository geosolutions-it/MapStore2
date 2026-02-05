/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';

import CameraPositionPlugin from '../CameraPosition';
import { getPluginForTest } from './pluginsTestUtils';

const CAMERA_POSITION_ID = 'mapstore-cameraposition';

describe('CameraPosition Plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('renders CameraPosition plugin with default props', () => {
        const { Plugin } = getPluginForTest(CameraPositionPlugin, {
            maptype: {
                mapType: 'cesium'
            },
            map: {
                present: {
                    viewerOptions: {
                        cameraPosition: {
                            longitude: 10.5,
                            latitude: 43.5,
                            height: 100
                        }
                    }
                }
            },
            cameraPosition: {
                showCameraPosition: true,
                crs: 'EPSG:4326',
                heightType: 'Ellipsoidal'
            }
        });
        ReactDOM.render(
            <Plugin />,
            document.getElementById("container")
        );
        const component = document.getElementById(CAMERA_POSITION_ID);
        expect(component).toExist();
    });


    it('renders with custom availableHeightTypes', () => {
        const { Plugin } = getPluginForTest(CameraPositionPlugin, {
            map: { present: { viewerOptions: {} } },
            cameraPosition: { showCameraPosition: true, crs: 'EPSG:4326', heightType: 'Ellipsoidal' }
        });
        const availableHeightTypes = [ { value: "Ellipsoidal", labelId: "ellipsoidal" }, { value: "MSL", labelId: "msl", geoidUrl: "http://localhost/geoid.pgm" }];
        ReactDOM.render(
            <Plugin availableHeightTypes={availableHeightTypes} />,
            document.getElementById("container")
        );
        const component = document.getElementById(CAMERA_POSITION_ID);
        expect(component).toExist();
    });

    it('renders with custom template configurations', () => {
        const { Plugin } = getPluginForTest(CameraPositionPlugin, {
            map: { present: { viewerOptions: {} } },
            cameraPosition: { showCameraPosition: true, crs: 'EPSG:4326', heightType: 'Ellipsoidal' }
        });
        ReactDOM.render(
            <Plugin degreesTemplate="MousePositionLabelDMS" projectedTemplate="MousePositionLabelYX"/>,
            document.getElementById("container")
        );
        const component = document.getElementById(CAMERA_POSITION_ID);
        expect(component).toExist();
    });
});
