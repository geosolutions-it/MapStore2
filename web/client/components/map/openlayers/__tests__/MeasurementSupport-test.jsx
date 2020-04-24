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

import { LineString } from 'ol/geom';
import { Map, View, Feature } from 'ol';

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

    const uom = {
        length: {unit: 'm', label: 'm'},
        area: {unit: 'sqm', label: 'm²'}
    };

    const testHandlers = {
        changeMeasurementState: () => {},
        changeGeometry: () => {},
        setTextLabels: () => {}
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
                    geomType: null,
                    disableLabels: true
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
                geomType: "LineString"
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
    it('test drawInteraction callbacks for a distance (LineString)', () => {
        const spyOnChangeMeasurementState = expect.spyOn(testHandlers, "changeMeasurementState");
        const spyOnChangeGeometry = expect.spyOn(testHandlers, "changeGeometry");
        let cmp = renderMeasurement();
        cmp = renderMeasurement({
            measurement: {
                geomType: "LineString",
                lineMeasureEnabled: true,
                updatedByUI: false,
                disableLabels: true
            },
            uom
        });

        cmp.drawInteraction.dispatchEvent({
            type: 'drawstart',
            feature: new Feature({
                geometry: new LineString([[13.0, 43.0], [13.0, 43.0]]),
                name: 'My line with 2 points'
            })
        });
        cmp.drawInteraction.dispatchEvent({
            type: 'drawend',
            feature: new Feature({
                geometry: new LineString([[13.0, 43.0], [13.0, 40.0], [13.0, 10.0]]),
                name: 'My line with 3 points'
            })
        });

        expect(spyOnChangeMeasurementState).toNotHaveBeenCalled();
        expect(spyOnChangeGeometry).toHaveBeenCalled();
        const changedFeatures = spyOnChangeGeometry.calls[0].arguments[0];
        expect(changedFeatures.length).toBe(1);
        expect(changedFeatures[0].type).toBe("Feature");
        expect(changedFeatures[0].geometry.coordinates.length).toBe(3);
    });
    it('test multiple feature drawing (LineString)', () => {
        const spyOnChangeGeometry = expect.spyOn(testHandlers, "changeGeometry");
        let cmp = renderMeasurement();
        cmp = renderMeasurement({
            measurement: {
                geomType: "LineString",
                lineMeasureEnabled: true,
                updatedByUI: false,
                disableLabels: true
            },
            uom
        });
        cmp.drawInteraction.dispatchEvent({
            type: 'drawstart',
            feature: new Feature({
                geometry: new LineString([[13.0, 43.0], [13.0, 43.0]]),
                name: 'My line with 2 points #1'
            })
        });
        cmp.drawInteraction.dispatchEvent({
            type: 'drawend',
            feature: new Feature({
                geometry: new LineString([[13.0, 43.0], [13.0, 40.0], [13.0, 10.0]]),
                name: 'My line with 3 points'
            })
        });

        expect(spyOnChangeGeometry).toHaveBeenCalled();
        const changedFeatures = spyOnChangeGeometry.calls[0].arguments[0];
        expect(changedFeatures.length).toBe(1);
        expect(changedFeatures[0].type).toBe("Feature");
        expect(changedFeatures[0].geometry.coordinates.length).toBe(3);

        cmp = renderMeasurement({
            measurement: {
                geomType: "LineString",
                lineMeasureEnabled: true,
                updatedByUI: false,
                disableLabels: true,
                features: [changedFeatures[0]]
            },
            uom
        });
        cmp.drawInteraction.dispatchEvent({
            type: 'drawstart',
            feature: new Feature({
                geometry: new LineString([[15.0, 45.0], [15.0, 45.0]]),
                name: 'My line with 2 points #2'
            })
        });
        cmp.drawInteraction.dispatchEvent({
            type: 'drawend',
            feature: new Feature({
                geometry: new LineString([[15.0, 45.0], [15.0, 47.0], [15.0, 49.0], [16.0, 5.0]]),
                name: 'My line with 4 points'
            })
        });

        expect(spyOnChangeGeometry).toHaveBeenCalled();
        expect(spyOnChangeGeometry.calls.length).toBe(2);
        const changedFeatures2 = spyOnChangeGeometry.calls[1].arguments[0];
        expect(changedFeatures2.length).toBe(2);
        expect(changedFeatures2[0].type).toBe("Feature");
        expect(changedFeatures2[0].geometry.coordinates.length).toBe(3);
        expect(changedFeatures2[1].type).toBe("Feature");
        expect(changedFeatures2[1].geometry.coordinates.length).toBe(4);
    });
    it('test updating distance (LineString) tooltip after change uom', () => {
        const spyOnSetTextLabels = expect.spyOn(testHandlers, "setTextLabels");
        let cmp = renderMeasurement();
        cmp = renderMeasurement({
            measurement: {
                geomType: "LineString",
                lineMeasureEnabled: true,
                updatedByUI: false,
                showLabel: true
            },
            uom
        });

        const geometry = new LineString([[15.0, 45.0], [15.0, 45.0]]);
        const feature = new Feature({
            geometry,
            name: 'My line'
        });

        cmp.drawInteraction.dispatchEvent({
            type: 'drawstart',
            feature
        });
        expect(cmp.sketchFeature).toExist();
        cmp.sketchFeature.getGeometry().setCoordinates([[15.0, 45.0], [15.0, 40.0]]);
        cmp.sketchFeature.getGeometry().appendCoordinate([16.0, 35.0]);
        cmp.sketchFeature.getGeometry().appendCoordinate([16.0, 35.0]);
        cmp.drawInteraction.dispatchEvent({
            type: 'drawend',
            feature: new Feature({
                geometry: new LineString([[15.0, 45.0], [15.0, 40.0], [16.0, 35.0]]),
                name: 'My line'
            })
        });

        cmp = renderMeasurement({
            measurement: {
                geomType: "LineString",
                lineMeasureEnabled: true,
                updatedByUI: true,
                showLabel: true
            },
            uom: {
                length: {unit: 'km', label: 'km'},
                area: {unit: 'sqm', label: 'm²'}
            }
        });

        expect(cmp.outputValues).toExist();
        expect(cmp.outputValues.length).toBe(1);
        expect(cmp.textLabels).toExist();
        expect(cmp.textLabels.length).toBe(2);

        expect(spyOnSetTextLabels).toHaveBeenCalled();
        expect(spyOnSetTextLabels.calls[0].arguments[0].length).toBe(2);
        expect(spyOnSetTextLabels.calls[0].arguments[0].map(({text}) => text.substring(text.length - 2, text.length) === 'km').reduce(
            (result, value) => result && value,
            true
        )).toBe(true);
    });
    it('test drawing (LineString)', () => {
        const spyOnChangeGeometry = expect.spyOn(testHandlers, "changeGeometry");
        let cmp = renderMeasurement();
        cmp = renderMeasurement({
            measurement: {
                geomType: "LineString",
                lineMeasureEnabled: true,
                updatedByUI: false
            },
            uom
        });

        const geometry = new LineString([[15.0, 45.0], [15.0, 45.0]]);
        const feature = new Feature({
            geometry,
            name: 'My line'
        });

        cmp.drawInteraction.dispatchEvent({
            type: 'drawstart',
            feature
        });
        expect(cmp.sketchFeature).toExist();
        cmp.sketchFeature.getGeometry().setCoordinates([[15.0, 45.0], [15.0, 40.0]]);
        expect(cmp.segmentOverlays.length).toBe(1);
        expect(cmp.measureTooltips.length).toBe(1);
        cmp.sketchFeature.getGeometry().appendCoordinate([16.0, 35.0]);
        expect(cmp.segmentOverlays.length).toBe(2);
        expect(cmp.measureTooltips.length).toBe(1);
        cmp.sketchFeature.getGeometry().appendCoordinate([16.0, 35.0]);
        expect(cmp.segmentOverlays.length).toBe(3);
        cmp.drawInteraction.dispatchEvent({
            type: 'drawend',
            feature: new Feature({
                geometry: new LineString([[15.0, 45.0], [15.0, 40.0], [16.0, 35.0]]),
                name: 'My line'
            })
        });
        expect(spyOnChangeGeometry).toHaveBeenCalled();
        const changedFeatures = spyOnChangeGeometry.calls[0].arguments[0];
        expect(changedFeatures.length).toBe(1);
        expect(changedFeatures[0].type).toBe("Feature");
        expect(changedFeatures[0].geometry.coordinates.length).toBe(3);
        expect(cmp.segmentOverlays.length).toBe(2);
        expect(cmp.measureTooltips.length).toBe(1);
    });
    it('test drawInteraction callbacks for a distance (Bearing)', () => {
        const spyOnChangeMeasurementState = expect.spyOn(testHandlers, "changeMeasurementState");
        const spyOnChangeGeometry = expect.spyOn(testHandlers, "changeGeometry");
        let cmp = renderMeasurement();
        cmp = renderMeasurement({
            measurement: {
                geomType: "Bearing",
                updatedByUI: false,
                disableLabels: true,
                bearingMeasureEnabled: true,
                trueBearing: {measureTrueBearing: true}
            },
            uom
        });

        cmp.drawInteraction.dispatchEvent({
            type: 'drawstart',
            feature: new Feature({
                geometry: new LineString([[13.0, 43.0], [13.0, 43.0]]),
                name: 'Line with 2 points'
            })
        });
        cmp.drawInteraction.dispatchEvent({
            type: 'drawend',
            feature: new Feature({
                geometry: new LineString([[13.0, 43.0], [13.0, 40.0]]),
                name: '2 points'
            })
        });

        expect(spyOnChangeMeasurementState).toNotHaveBeenCalled();
        expect(spyOnChangeGeometry).toHaveBeenCalled();
        const changedFeatures = spyOnChangeGeometry.calls[0].arguments[0];
        expect(changedFeatures.length).toBe(1);
        expect(changedFeatures[0].type).toBe("Feature");
        expect(changedFeatures[0].geometry.coordinates.length).toBe(2);
        expect(changedFeatures[0].properties.values[0].formattedValue).toContain("T");
        expect(changedFeatures[0].properties.values[0].type).toContain("bearing");
    });
});
