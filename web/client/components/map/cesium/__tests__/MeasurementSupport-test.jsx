/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import CesiumMap from '../Map';
import expect from 'expect';
import { act, Simulate } from 'react-dom/test-utils';
import MeasurementSupport from '../MeasurementSupport';
import {
    MeasureTypes,
    defaultUnitOfMeasure
} from '../../../../utils/MeasureUtils';

describe('Cesium MeasurementSupport', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with default values', () => {
        let ref;
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ y: 43.9, x: 10.3 }}
                    zoom={11}
                >
                    <MeasurementSupport />
                </CesiumMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        expect(ref.map.canvas).toBeTruthy();
    });
    it('should trigger onChangeMeasureType on tool button click', (done) => {
        let ref;
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ y: 43.9, x: 10.3 }}
                    zoom={11}
                >
                    <MeasurementSupport
                        active
                        unitsOfMeasure={defaultUnitOfMeasure}
                        defaultMeasureType={MeasureTypes.POLYLINE_DISTANCE_3D}
                        onChangeMeasureType={(measureType) => {
                            if (measureType === MeasureTypes.ANGLE_3D) {
                                try {
                                    expect(measureType).toBe(MeasureTypes.ANGLE_3D);
                                } catch (e) {
                                    done(e);
                                }
                                done();
                            }
                            // initial is the defaultMeasureType
                            expect(measureType).toBe(MeasureTypes.POLYLINE_DISTANCE_3D);
                        }}
                    />
                </CesiumMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        expect(ref.map.canvas).toBeTruthy();
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(8);
        expect([...buttons].map(button => button.querySelector('.glyphicon').getAttribute('class'))).toEqual([
            'glyphicon glyphicon-polyline-3d',
            'glyphicon glyphicon-polygon-3d',
            'glyphicon glyphicon-point-coordinates',
            'glyphicon glyphicon-height-from-terrain',
            'glyphicon glyphicon-angle',
            'glyphicon glyphicon-slope',
            'glyphicon glyphicon-trash',
            'glyphicon glyphicon-ext-json'
        ]);
        Simulate.click(buttons[4]);
    });
});
