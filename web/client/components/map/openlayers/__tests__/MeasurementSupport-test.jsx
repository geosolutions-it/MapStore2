/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const React = require('react');
const ReactDOM = require('react-dom');
const ol = require('openlayers');
const {round} = require('lodash');
const MeasurementSupport = require('../MeasurementSupport');
const {
    lineFeature,
    lineFeature2,
    lineFeature3,
    invalidLineFeature,
    polyFeature,
    invalidPolyFeature,
    polygonFt,
    invalidFirstCoordPolyFeature
} = require('../../../../test-resources/drawsupport/features');

describe('Openlayers MeasurementSupport', () => {
    let msNode;

    /* basic objects */
    const viewOptions = {
        projection: 'EPSG:3857',
        center: [0, 0],
        zoom: 5
    };
    let map = new ol.Map({
        target: "map",
        view: new ol.View(viewOptions)
    });
    const uom = {
        length: {unit: 'm', label: 'm'},
        area: {unit: 'sqm', label: 'm²'}
    };

    const testHandlers = {
        changeMeasurementState: () => {},
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

    /**
     * it renders the measure support with draw interaction enabled
    */
    const renderWithDrawing = (props = {}) => {
        let cmp = renderMeasurement();
        // entering componentWillReceiveProps
        cmp = renderMeasurement({
            measurement: {
                feature: {},
                geomType: "LineString"
            },
            ...props
        });
        return cmp;
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
        map = new ol.Map({
            target: "map",
            view: new ol.View(viewOptions)
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
    it('test updating distance (LineString) tooltip after change uom', () => {
        let cmp = renderWithDrawing();
        expect(cmp).toExist();
        const spyOnChangeMeasurementState = expect.spyOn(testHandlers, "changeMeasurementState");
        cmp = renderMeasurement({
            measurement: {
                geomType: "LineString",
                feature: lineFeature,
                lineMeasureEnabled: true,
                updatedByUI: true,
                showLabel: true
            },
            uom
        });
        cmp = renderMeasurement({
            measurement: {
                geomType: "LineString",
                feature: lineFeature2,
                lineMeasureEnabled: true,
                updatedByUI: true,
                showLabel: true
            },
            uom
        });
        expect(spyOnChangeMeasurementState).toHaveBeenCalled();
        expect(spyOnChangeMeasurementState.calls.length).toBe(1);
        const measureState = spyOnChangeMeasurementState.calls[0].arguments[0];
        expect(measureState).toExist();
        expect(round(measureState.len, 2)).toBe(6010861.63);
        expect(measureState.bearing).toBe(0);
        expect(measureState.area).toBe(0);
    });
    it('test updating Bearing (LineString) tooltip after change uom', () => {
        let cmp = renderWithDrawing();
        expect(cmp).toExist();
        const spyOnChangeMeasurementState = expect.spyOn(testHandlers, "changeMeasurementState");
        cmp = renderMeasurement({
            measurement: {
                geomType: "Bearing",
                feature: lineFeature,
                bearingMeasureEnabled: true,
                updatedByUI: true,
                showLabel: true
            },
            uom
        });
        cmp = renderMeasurement({
            measurement: {
                geomType: "Bearing",
                feature: lineFeature2,
                bearingMeasureEnabled: true,
                updatedByUI: true,
                showLabel: true
            },
            uom
        });
        expect(spyOnChangeMeasurementState).toHaveBeenCalled();
        expect(spyOnChangeMeasurementState.calls.length).toBe(1);
        const measureState = spyOnChangeMeasurementState.calls[0].arguments[0];
        expect(measureState).toExist();
        expect(measureState.len).toBe(0);
        expect(measureState.area).toBe(0);
        expect(round(measureState.bearing, 2)).toBe(84.55);
    });
    it('test updating area (Polygon) tooltip after change uom', () => {
        const spyOnChangeMeasurementState = expect.spyOn(testHandlers, "changeMeasurementState");
        let cmp = renderWithDrawing();
        expect(cmp).toExist();
        cmp = renderMeasurement({
            measurement: {
                geomType: "Polygon",
                feature: polyFeature,
                areaMeasureEnabled: true,
                updatedByUI: true,
                showLabel: false
            },
            uom
        });
        expect(spyOnChangeMeasurementState).toHaveBeenCalled();
        expect(spyOnChangeMeasurementState.calls.length).toBe(1);
        const measureState = spyOnChangeMeasurementState.calls[0].arguments[0];
        expect(measureState).toExist();
        expect(measureState.len).toBe(0);
        expect(round(measureState.area, 2)).toBe(49490132941.51);
        expect(measureState.bearing).toBe(0);
    });
    it('test updating area (Polygon) with invalid feature after change uom', () => {
        const spyOnChangeMeasurementState = expect.spyOn(testHandlers, "changeMeasurementState");
        let cmp = renderWithDrawing();
        expect(cmp).toExist();
        cmp = renderMeasurement({
            measurement: {
                geomType: "Polygon",
                feature: invalidPolyFeature,
                areaMeasureEnabled: true,
                updatedByUI: true,
                showLabel: false
            },
            uom
        });
        expect(spyOnChangeMeasurementState).toHaveBeenCalled();
        expect(spyOnChangeMeasurementState.calls.length).toBe(1);
        const measureState = spyOnChangeMeasurementState.calls[0].arguments[0];
        expect(measureState).toExist();
        expect(measureState.len).toBe(0);
        expect(round(measureState.area, 2)).toBe(247450664707.54);
        expect(measureState.bearing).toBe(0);
    });
    it('test updating distance (LineString) with invalid feature after change uom', () => {
        const spyOnChangeMeasurementState = expect.spyOn(testHandlers, "changeMeasurementState");
        let cmp = renderWithDrawing();
        expect(cmp).toExist();
        cmp = renderMeasurement({
            measurement: {
                geomType: "LineString",
                feature: invalidLineFeature,
                lineMeasureEnabled: true,
                updatedByUI: true,
                showLabel: false
            },
            uom
        });
        expect(spyOnChangeMeasurementState).toHaveBeenCalled();
        expect(spyOnChangeMeasurementState.calls.length).toBe(1);
        const measureState = spyOnChangeMeasurementState.calls[0].arguments[0];
        expect(measureState).toExist();
        expect(round(measureState.len, 2)).toBe(6010861.63);
        expect(measureState.area).toBe(0);
        expect(measureState.bearing).toBe(0);
    });
    it('test drawInteraction callbacks for a distance (LineString)', () => {
        const spyOnChangeMeasurementState = expect.spyOn(testHandlers, "changeMeasurementState");
        const spyOnChangeGeometry = expect.spyOn(testHandlers, "changeGeometry");
        let cmp = renderWithDrawing();
        expect(cmp).toExist();
        cmp = renderMeasurement({
            measurement: {
                geomType: "LineString",
                feature: lineFeature,
                lineMeasureEnabled: true,
                updatedByUI: true,
                showLabel: true
            },
            uom
        });
        cmp.drawInteraction.dispatchEvent({
            type: 'drawstart',
            feature: new ol.Feature({
                  geometry: new ol.geom.LineString([[13.0, 43.0], [13.0, 40.0]]),
                  name: 'My line with 2 points'
            })
        });
        cmp.drawInteraction.dispatchEvent({
            type: 'drawend',
            feature: new ol.Feature({
                  geometry: new ol.geom.LineString([[13.0, 43.0], [13.0, 40.0], [11.0, 41.0]]),
                  name: 'My line with 3 points'
            })
        });
        expect(spyOnChangeMeasurementState).toHaveBeenCalled();
        expect(spyOnChangeGeometry).toHaveBeenCalled();
        const changedFeature = spyOnChangeGeometry.calls[0].arguments[0];
        expect(changedFeature.type).toBe("Feature");
        expect(changedFeature.geometry.coordinates.length).toBe(3);

    });
    it('test drawing a distance (LineString) and moving pointer', () => {
        let cmp = renderWithDrawing();
        expect(cmp).toExist();
        cmp = renderMeasurement({
            measurement: {
                geomType: "LineString",
                feature: lineFeature,
                lineMeasureEnabled: true,
                updatedByUI: true,
                showLabel: true
            },
            uom
        });
        cmp.drawInteraction.dispatchEvent({
            type: 'drawstart',
            feature: new ol.Feature({
                  geometry: new ol.geom.LineString([[13.0, 43.0], [13.0, 40.0]]),
                  name: 'My line with 2 points'
            })
        });
        cmp.drawInteraction.dispatchEvent({
            type: 'drawend',
            feature: new ol.Feature({
                  geometry: new ol.geom.LineString([[13.0, 43.0], [13.0, 40.0], [11.0, 41.0]]),
                  name: 'My line with 3 points'
            })
        });
        cmp = renderMeasurement({
            measurement: {
                geomType: "LineString",
                feature: lineFeature3,
                lineMeasureEnabled: true,
                updatedByUI: true,
                showLabel: true
            },
            uom
        });
        map.dispatchEvent({
            type: 'pointermove',
            coordinate: [100, 400]
        });
        expect(cmp.helpTooltip.getPosition()).toEqual([100, 400]);

    });

    it('test drawing a polygon with 4 vertices and then invalidating the first coord', () => {
        const spyOnChangeMeasurementState = expect.spyOn(testHandlers, "changeMeasurementState");
        let cmp = renderWithDrawing();
        expect(cmp).toExist();
        cmp = renderMeasurement({
            measurement: {
                geomType: "Polygon",
                feature: polygonFt,
                areaMeasureEnabled: true,
                updatedByUI: true,
                showLabel: true
            },
            uom
        });
        cmp = renderMeasurement({
            measurement: {
                geomType: "Polygon",
                feature: invalidFirstCoordPolyFeature,
                areaMeasureEnabled: true,
                updatedByUI: true,
                showLabel: true
            },
            uom
        });
        expect(spyOnChangeMeasurementState).toHaveBeenCalled();
        expect(spyOnChangeMeasurementState.calls.length).toBe(2);
        const args = spyOnChangeMeasurementState.calls[1].arguments;
        expect(args[0].feature.geometry.coordinates[0].length).toBe(5);
        expect(args[0].feature.geometry.coordinates).toEqual([[[0, ""], [0, 5], [10, 5], [0, 1], [0, ""]]]);

    });

});
