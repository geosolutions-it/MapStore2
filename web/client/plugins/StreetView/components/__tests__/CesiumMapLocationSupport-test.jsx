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
import CesiumMapLocationSupport from '../CesiumMapLocationSupport';
import { act } from 'react-dom/test-utils';
import * as Cesium from 'cesium';

describe('CesiumMapLocationSupport', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should not render', () => {
        act(() => {
            ReactDOM.render(<CesiumMapLocationSupport />, document.getElementById("container"));
        });
        expect(document.querySelector('#container').children.length).toBe(0);
    });
    it('should update location and position of marker', (done) => {
        let dataSource;
        act(() => {
            ReactDOM.render(
                <CesiumMapLocationSupport
                    location={{ latLng: { lat: 45, lng: 9, h: 100 } }}
                    pov={{ heading: 30 }}
                    map={{
                        dataSources: {
                            add: (_dataSource) => {
                                dataSource = _dataSource;
                            },
                            remove: () => {

                            }
                        },
                        scene: {
                            requestRender: () => {}
                        }
                    }}
                    onUpdate={() => {
                        try {
                            expect(dataSource.entities.values.length).toBe(1);
                            const cartographic = Cesium.Cartographic.fromCartesian(dataSource.entities.values[0].position.getValue(Cesium.JulianDate.now()));
                            expect(Math.round(Cesium.Math.toDegrees(cartographic.longitude))).toBe(9);
                            expect(Math.round(Cesium.Math.toDegrees(cartographic.latitude))).toBe(45);
                            expect(Math.round(cartographic.height)).toBe(100);
                            const orientation = dataSource.entities.values[0].orientation.getValue(Cesium.JulianDate.now());
                            expect(orientation).toBeTruthy();
                        } catch (e) {
                            done(e);
                        }
                        done();
                    }}
                />, document.getElementById("container"));
        });
        expect(document.querySelector('#container').children.length).toBe(0);
    });
});

