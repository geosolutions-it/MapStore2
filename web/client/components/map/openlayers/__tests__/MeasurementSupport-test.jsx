/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';

import MeasurementSupport from '../MeasurementSupport';

import { Map, View } from 'ol';

describe('Openlayers MeasurementSupport', () => {
    let msNode;

    /* basic objects */
    const viewOptions = {
        projection: 'EPSG:3857',
        center: [0, 0],
        zoom: 5
    };
    let map = new Map({
        target: "map",
        view: new View(viewOptions)
    });

    const testHandlers = {
        changeMeasurementState: () => {},
        updateMeasures: () => {},
        changeGeometry: () => {}
    };
    function getMapLayersNum(olMap) {
        return olMap.getLayers().getLength();
    }
    /* utility used to render the MeasurementSupport component with some default props*/
    const renderMeasurement = (props = {}) => {
        return ReactDOM.render(
            <MeasurementSupport
                {...testHandlers}
                measurement={props.measurement || {
                    geomType: null
                }}
                map={props.map || map}
                {...props}
            />, msNode);
    };

    beforeEach((done) => {
        document.body.innerHTML = '<div id="map" style="heigth: 100px; width: 100px"></div><div id="ms"></div>';
        msNode = document.getElementById('ms');
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(msNode);
        document.body.innerHTML = '';
        msNode = undefined;
        expect.restoreSpies();
        map = new Map({
            target: "map",
            view: new View(viewOptions)
        });
        setTimeout(done);
    });

    it('test creation', () => {
        const cmp = renderMeasurement();
        expect(cmp).toExist();
    });
    it('test if a new layer is added to the map in order to allow drawing.', () => {
        let cmp = renderMeasurement();
        expect(cmp).toExist();

        let initialLayersNum = getMapLayersNum(map);
        cmp = renderMeasurement({
            measurement: {
                geomType: "LineString",
                showLabel: true
            }
        });
        expect(getMapLayersNum(map)).toBeGreaterThan(initialLayersNum);
    });
    it('test if drawing layers will be removed', () => {
        let cmp = renderMeasurement();
        expect(cmp).toExist();

        let initialLayersNum = getMapLayersNum(map);
        cmp = renderMeasurement({
            measurement: {
                geomType: "Polygon"
            }
        });

        expect(getMapLayersNum(map)).toBeGreaterThan(initialLayersNum);
        cmp = renderMeasurement();
        expect(getMapLayersNum(map)).toBe(initialLayersNum);
    });
});
