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

import { LineString, Polygon } from 'ol/geom';
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
        const spyOnChangeGeometry = expect.spyOn(testHandlers, "changeGeometry");
        let cmp = renderMeasurement();
        cmp = renderMeasurement({
            measurement: {
                geomType: "LineString",
                lineMeasureEnabled: true,
                updatedByUI: false,
                showLabel: true,
                showLengthAndBearingLabel: true
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
        expect(spyOnChangeGeometry).toHaveBeenCalled();
        const prevMeasurementFeature = spyOnChangeGeometry.calls[0].arguments[0];
        expect(prevMeasurementFeature[0].geometry.textLabels).toExist();
        expect(prevMeasurementFeature[0].geometry.textLabels[0].text).toBe("4.99 m | S 0° 0' 0'' E");
        expect(prevMeasurementFeature[0].geometry.textLabels[1].text).toBe("5.09 m | S 11° 18' 35'' E");

        cmp = renderMeasurement({
            measurement: {
                geomType: "LineString",
                lineMeasureEnabled: true,
                updatedByUI: true,
                showLabel: true,
                showLengthAndBearingLabel: true,
                features: prevMeasurementFeature
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
        expect(spyOnSetTextLabels.calls[1].arguments[0].length).toBe(2);
        expect(spyOnSetTextLabels.calls[1].arguments[0].map(({text}) => text.includes('km')).reduce(
            (result, value) => result && value,
            true
        )).toBe(true);
        expect(spyOnChangeGeometry).toHaveBeenCalled();
        const resultFeature = spyOnChangeGeometry.calls[0].arguments[0];
        expect(resultFeature[0].geometry.textLabels).toExist();
        expect(resultFeature[0].geometry.textLabels[0].text).toBe("0 km | S 0° 0' 0'' E");
        expect(resultFeature[0].geometry.textLabels[1].text).toBe("0.01 km | S 11° 18' 35'' E");
    });
    it('test changing uom when no existing coordinates', () => {
        const spyOnSetTextLabels = expect.spyOn(testHandlers, "setTextLabels");
        const spyOnChangeGeometry = expect.spyOn(testHandlers, "changeGeometry");
        let cmp = renderMeasurement();
        cmp = renderMeasurement({
            measurement: {
                geomType: "LineString",
                lineMeasureEnabled: true,
                updatedByUI: false,
                showLabel: true,
                showLengthAndBearingLabel: true
            },
            uom
        });
        cmp = renderMeasurement({
            measurement: {
                geomType: "LineString",
                lineMeasureEnabled: true,
                updatedByUI: true,
                showLabel: true,
                showLengthAndBearingLabel: true
            },
            uom: {
                length: {unit: 'km', label: 'km'},
                area: {unit: 'sqm', label: 'm²'}
            }
        });

        expect(cmp.outputValues).toExist();
        expect(cmp.outputValues.length).toBe(0);
        expect(cmp.textLabels).toExist();
        expect(cmp.textLabels.length).toBe(0);

        expect(spyOnSetTextLabels).toHaveBeenCalled();
        expect(spyOnSetTextLabels.calls[0].arguments[0].length).toBe(0);
        expect(spyOnSetTextLabels.calls[0].arguments[0].map(({text}) => text.includes('km')).reduce(
            (result, value) => result && value,
            true
        )).toBe(true);
        expect(spyOnChangeGeometry).toHaveBeenCalled();
        const resultFeature = spyOnChangeGeometry.calls[0].arguments[0];
        expect(resultFeature.length).toBe(0);
    });
    it('test add coordinates manually when no existing coordinates', () => {
        const features = [{"type": "Feature", "properties": {"disabled": true}, "geometry": {"type": "LineString", "coordinates": [["", ""]], "textLabels": []}}];
        const spyOnChangeGeometry = expect.spyOn(testHandlers, "changeGeometry");
        let cmp = renderMeasurement();
        cmp = renderMeasurement({
            measurement: {
                geomType: "LineString",
                lineMeasureEnabled: true,
                updatedByUI: false,
                showLabel: true,
                showLengthAndBearingLabel: true,
                features: []
            },
            uom
        });
        cmp = renderMeasurement({
            measurement: {
                geomType: "LineString",
                lineMeasureEnabled: true,
                updatedByUI: true,
                showLabel: true,
                showLengthAndBearingLabel: true,
                features
            },
            uom
        });

        expect(cmp.outputValues).toExist();
        expect(cmp.outputValues.length).toBe(0);
        expect(cmp.textLabels).toExist();
        expect(cmp.textLabels.length).toBe(0);

        expect(spyOnChangeGeometry).toHaveBeenCalled();
        const resultFeature = spyOnChangeGeometry.calls[0].arguments[0];
        expect(resultFeature.length).toBe(1);
        expect(resultFeature[0].properties.disabled).toBe(true);
        expect(resultFeature[0].geometry).toBeTruthy();
        expect(resultFeature[0].geometry).toEqual(features[0].geometry);
        // Add empty label when empty coordinate (edit)
        expect(resultFeature[0].geometry.textLabels).toEqual([{text: "0"}]);
    });
    it('test remove last coordinates when updating polygon', () => {
        const features = [{"type": "Feature", "properties": {"disabled": false}, "geometry": {"type": "Polygon",
            "coordinates": [[[1, 2], [2, 3], [3, 4], [1, 2], [1, 2]]], "textLabels": [{text: "1m"}, {text: "2m"}, {text: "3m"}, {text: "4m"}]}}];
        const spyOnChangeGeometry = expect.spyOn(testHandlers, "changeGeometry");
        let cmp = renderMeasurement();
        cmp = renderMeasurement({
            measurement: {
                geomType: "LineString",
                lineMeasureEnabled: true,
                updatedByUI: false,
                showLabel: true,
                showLengthAndBearingLabel: true,
                features: []
            },
            uom
        });
        cmp = renderMeasurement({
            measurement: {
                geomType: "Polygon",
                lineMeasureEnabled: true,
                updatedByUI: true,
                showLabel: true,
                showLengthAndBearingLabel: true,
                features,
                currentFeature: 0
            },
            uom
        });

        expect(cmp.outputValues).toExist();
        expect(cmp.outputValues.length).toBe(2);
        expect(cmp.textLabels).toExist();
        expect(cmp.textLabels.length).toBe(3);

        expect(spyOnChangeGeometry).toHaveBeenCalled();
        const resultFeature = spyOnChangeGeometry.calls[0].arguments[0];
        expect(resultFeature.length).toBe(1);
        expect(resultFeature[0].properties.disabled).toBe(false);
        expect(resultFeature[0].geometry).toBeTruthy();
        expect(resultFeature[0].geometry.type).toBe('Polygon');
        expect(resultFeature[0].geometry.coordinates[0].length).toBe(4);
        expect(resultFeature[0].geometry.textLabels.length).toBe(3);
    });
    it('test drawing (LineString)', () => {
        const spyOnChangeGeometry = expect.spyOn(testHandlers, "changeGeometry");
        let cmp = renderMeasurement();
        cmp = renderMeasurement({
            measurement: {
                geomType: "LineString",
                lineMeasureEnabled: true,
                updatedByUI: false,
                showLengthAndBearingLabel: true
            },
            uom
        });

        let geometry = new LineString([[15.0, 45.0], [15.0, 45.0]]);
        let feature = new Feature({
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
        let changedFeatures = spyOnChangeGeometry.calls[0].arguments[0];
        expect(changedFeatures.length).toBe(1);
        expect(changedFeatures[0].type).toBe("Feature");
        expect(changedFeatures[0].geometry.coordinates.length).toBe(3);
        expect(cmp.segmentOverlays.length).toBe(2);
        expect(cmp.measureTooltips.length).toBe(1);
        expect(changedFeatures[0].geometry.textLabels).toExist();
        expect(changedFeatures[0].geometry.textLabels[0].text).toBe("4.99 m | S 0° 0' 0'' E");
        expect(changedFeatures[0].geometry.textLabels[1].text).toBe("5.09 m | S 11° 18' 35'' E");
        expect(cmp.textLabels.length).toBe(2);
        expect(cmp.textLabels[0].type).toBe("LineString");
        expect(cmp.textLabels[0].textId).toBe(0);


        // Text label display when drawing line with true bearing
        cmp = renderMeasurement({
            measurement: {
                geomType: "LineString",
                lineMeasureEnabled: true,
                updatedByUI: false,
                showLengthAndBearingLabel: true,
                trueBearing: {measureTrueBearing: true},
                features: [{
                    "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [[0, 1], [10, 20]]
                    },
                    "properties": {
                        "name": "My line",
                        "values": [
                            {
                                "value": 10.087,
                                "formattedValue": "10.09 m",
                                "position": [
                                    0.00014373044545912343,
                                    0.0003144103494347836
                                ],
                                "type": "length"
                            }
                        ]
                    }
                }]
            },
            uom
        });

        geometry = new LineString([[15.0, 45.0], [15.0, 45.0]]);
        feature = new Feature({
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

        expect(spyOnChangeGeometry).toHaveBeenCalled();
        changedFeatures = spyOnChangeGeometry.calls[1].arguments[0];
        expect(spyOnChangeGeometry).toHaveBeenCalled();
        expect(changedFeatures[1].geometry.textLabels).toExist();
        expect(changedFeatures[1].geometry.textLabels[0].text).toBe("4.99 m | 180°");
        expect(changedFeatures[1].geometry.textLabels[1].text).toBe("5.09 m | 168°");
        expect(cmp.textLabels.length).toBe(4);
        expect(cmp.textLabels[2].type).toBe("LineString");
        expect(cmp.textLabels[2].textId).toBe(1);

    });
    it('test showLengthAndBearingLabel', ()=>{
        const spyOnChangeGeometry = expect.spyOn(testHandlers, "changeGeometry");
        let cmp = renderMeasurement();
        cmp = renderMeasurement({
            measurement: {
                geomType: "LineString",
                lineMeasureEnabled: true,
                updatedByUI: false,
                showLengthAndBearingLabel: true,
                trueBearing: {measureTrueBearing: true}
            },
            uom
        });

        let geometry = new LineString([[15.0, 45.0], [15.0, 45.0]]);
        let feature = new Feature({
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
        expect(spyOnChangeGeometry).toHaveBeenCalled();
        let changedFeatures = spyOnChangeGeometry.calls[0].arguments[0];
        expect(changedFeatures[0].geometry.textLabels).toExist();
        expect(changedFeatures[0].geometry.textLabels[0].text).toBe("4.99 m | 180°");
        expect(changedFeatures[0].geometry.textLabels[1].text).toBe("5.09 m | 168°");

        // Hide show length and bearing combination label
        cmp = renderMeasurement({
            measurement: {
                geomType: "LineString",
                lineMeasureEnabled: true,
                updatedByUI: false,
                showLengthAndBearingLabel: false,
                features: changedFeatures
            },
            uom
        });

        geometry = new LineString([[15.0, 45.0], [15.0, 45.0]]);
        feature = new Feature({
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
        expect(spyOnChangeGeometry).toHaveBeenCalled();
        changedFeatures = spyOnChangeGeometry.calls[1].arguments[0];
        expect(changedFeatures[1].geometry.textLabels).toExist();
        expect(changedFeatures[1].geometry.textLabels[0].text).toBe("4.99 m");
        expect(changedFeatures[1].geometry.textLabels[1].text).toBe("5.09 m");
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
        expect(cmp.sketchFeature).toExist();
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
        expect(changedFeatures[0].properties.values[0].formattedValue).toNotContain("T");
        expect(changedFeatures[0].properties.values[0].type).toContain("bearing");
    });
    it('test drawState restore on geomType change', () => {
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

        const initialOverlayCount = map.getOverlays().getLength();

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
        expect(cmp.savedDrawState).toExist();
        expect(cmp.savedDrawState.textLabels).toEqual([]);
        expect(cmp.savedDrawState.segmentLengths).toEqual([]);
        expect(cmp.savedDrawState.measureTooltipsLength).toBe(0);
        expect(cmp.savedDrawState.segmentOverlaysLength).toBe(0);
        cmp.sketchFeature.getGeometry().setCoordinates([[15.0, 45.0], [15.0, 40.0]]);
        cmp.sketchFeature.getGeometry().appendCoordinate([16.0, 35.0]);
        expect(map.getOverlays().getLength()).toBe(initialOverlayCount + 3);

        cmp = renderMeasurement({
            measurement: {
                geomType: "Bearing",
                updatedByUI: false,
                bearingMeasureEnabled: true,
                trueBearing: {measureTrueBearing: true}
            },
            uom
        });

        expect(cmp.savedDrawState).toBe(null);
        expect(cmp.textLabels).toEqual([]);
        expect(cmp.segmentLengths).toEqual([]);
        expect(cmp.segmentOverlays).toEqual([]);
        expect(cmp.segmentOverlayElements).toEqual([]);
        expect(cmp.measureTooltips).toEqual([]);
        expect(cmp.measureTooltipElements).toEqual([]);
        expect(cmp.outputValues).toEqual([]);
        expect(map.getOverlays().getLength()).toBe(initialOverlayCount);
    });
    it('test drawState restore on geomType change with drawn geometry', () => {
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

        let geometry = new LineString([[15.0, 45.0], [15.0, 45.0]]);
        let feature = new Feature({
            geometry,
            name: 'My line'
        });

        cmp.drawInteraction.dispatchEvent({
            type: 'drawstart',
            feature
        });
        expect(cmp.sketchFeature).toExist();
        expect(cmp.savedDrawState).toExist();
        expect(cmp.savedDrawState.textLabels).toEqual([]);
        expect(cmp.savedDrawState.segmentLengths).toEqual([]);
        expect(cmp.savedDrawState.measureTooltipsLength).toBe(0);
        expect(cmp.savedDrawState.segmentOverlaysLength).toBe(0);
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
        expect(cmp.savedDrawState).toBe(null);

        cmp = renderMeasurement({
            measurement: {
                geomType: "LineString",
                lineMeasureEnabled: true,
                updatedByUI: false,
                showLabel: true
            },
            uom
        });

        geometry = new LineString([[10.0, 15.0], [10.0, 15.0]]);
        feature = new Feature({
            geometry,
            name: 'My line 2'
        });

        const savedOverlayCount = map.getOverlays().getLength();

        cmp.drawInteraction.dispatchEvent({
            type: 'drawstart',
            feature
        });
        expect(cmp.savedDrawState).toExist();
        expect(cmp.savedDrawState.textLabels.length).toBe(2);
        expect(cmp.savedDrawState.segmentLengths.length).toBe(2);
        expect(cmp.savedDrawState.measureTooltipsLength).toBe(1);
        expect(cmp.savedDrawState.segmentOverlaysLength).toBe(2);

        const savedTextLabels = [...cmp.savedDrawState.textLabels];
        const savedSegmentLengths = [...cmp.savedDrawState.segmentLengths];

        cmp.sketchFeature.getGeometry().setCoordinates([[10.0, 15.0], [10.0, 10.0]]);
        cmp.sketchFeature.getGeometry().appendCoordinate([11.0, 25.0]);
        expect(map.getOverlays().getLength()).toBe(savedOverlayCount + 3);

        cmp = renderMeasurement({
            measurement: {
                geomType: "Bearing",
                updatedByUI: false,
                bearingMeasureEnabled: true,
                trueBearing: {measureTrueBearing: true}
            },
            uom
        });

        expect(cmp.savedDrawState).toBe(null);
        expect(cmp.textLabels).toEqual(savedTextLabels);
        expect(cmp.segmentLengths).toEqual(savedSegmentLengths);
        expect(cmp.segmentOverlays.length).toBe(2);
        expect(cmp.segmentOverlayElements.length).toEqual(2);
        expect(cmp.measureTooltips.length).toBe(1);
        expect(cmp.measureTooltipElements.length).toBe(1);
        expect(cmp.outputValues.length).toBe(1);
        expect(map.getOverlays().getLength()).toBe(savedOverlayCount);
    });
    it('test removeInteraction and measurement state on geomType change', () => {
        const spyOnchangeGeometry = expect.spyOn(testHandlers, 'changeGeometry');
        const spyOnsetTextLabels = expect.spyOn(testHandlers, 'setTextLabels');

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

        const feature = new Feature({
            geometry: new LineString([[10.0, 15.0], [10.0, 15.0]]),
            name: 'My line 1'
        });
        const savedOverlayCount = map.getOverlays().getLength();
        const savedInteractionsCount = map.getInteractions().getLength();
        cmp.drawInteraction.dispatchEvent({
            type: 'drawstart',
            feature
        });
        cmp.sketchFeature.getGeometry().setCoordinates([[10.0, 15.0], [10.0, 10.0]]);
        cmp.sketchFeature.getGeometry().appendCoordinate([11.0, 25.0]);
        expect(map.getOverlays().getLength()).toBe(savedOverlayCount + 3);
        expect(map.getInteractions().getLength()).toBe(savedInteractionsCount);
        expect(map.getLayers().getLength()).toBe(1);

        // On geomtype null
        cmp = renderMeasurement({
            measurement: {
                geomType: null,
                updatedByUI: false,
                features: ['test'],
                textLabels: ['test']
            },
            uom
        });
        expect(cmp.drawInteraction).toBe(null);
        expect(cmp.sketchFeature).toBe(null);
        expect(map.getInteractions().getLength()).toBe(savedInteractionsCount - 1);
        expect(cmp.measureTooltips.length).toBe(0);
        expect(cmp.measureTooltipElements.length).toBe(0);
        expect(cmp.outputValues.length).toBe(0);
        expect(cmp.segmentOverlays.length).toBe(0);
        expect(cmp.segmentOverlayElements.length).toBe(0);
        expect(map.getOverlays().getLength()).toBe(0);
        expect(cmp.textLabels).toEqual([]);
        expect(cmp.segmentLengths).toEqual([]);
        expect(map.getLayers().getLength()).toBe(0);
        expect(cmp.vector).toBe(null);
        expect(cmp.measureLayer).toBe(null);
        expect(cmp.source).toBe(null);
        expect(spyOnchangeGeometry.calls[0].arguments[0]).toEqual([]);
        expect(spyOnsetTextLabels.calls[0].arguments[0]).toEqual([]);
    });
    it('test removeInteraction in edit when feature has invalid coordinates', () => {
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

        const feature = new Feature({
            geometry: new LineString([[10.0, 15.0], [10.0, 15.0]]),
            name: 'My line 1'
        });
        const savedInteractionsCount = map.getInteractions().getLength();
        cmp.drawInteraction.dispatchEvent({
            type: 'drawstart',
            feature
        });
        cmp.sketchFeature.getGeometry().setCoordinates([[10.0, 15.0], [10.0, 10.0]]);
        cmp.sketchFeature.getGeometry().appendCoordinate([11.0, 25.0]);

        const features = [{
            type: "Feature",
            geometry: {type: "LineString", coordinates: [[1, 2], [2, 3], ["", ""]], textLabels: [{text: "1m"}]},
            properties: {values: [{value: 1154.583, formattedValue: "10 m", position: [1, 2], type: "length"}], disabled: true}
        }];
        cmp = renderMeasurement({
            measurement: {
                geomType: "LineString",
                lineMeasureEnabled: true,
                updatedByUI: true,
                features
            },
            uom
        });
        // Remove drawInteraction when feature has disabled property
        expect(cmp.drawInteraction).toBe(null);
        expect(cmp.sketchFeature).toBe(null);
        expect(map.getInteractions().getLength()).toBe(savedInteractionsCount - 1);
        expect(cmp.measureTooltips.length).toBe(0);
        expect(cmp.measureTooltipElements.length).toBe(0);
        expect(cmp.outputValues.length).toBe(0);
        expect(cmp.segmentOverlays.length).toBe(0);
        expect(cmp.segmentOverlayElements.length).toBe(0);
        expect(map.getOverlays().getLength()).toBe(0);
        expect(cmp.textLabels).toEqual([]);
        expect(cmp.segmentLengths).toEqual([]);
        expect(map.getLayers().getLength()).toBe(1);
        cmp = renderMeasurement({
            measurement: {
                geomType: "LineString",
                lineMeasureEnabled: true,
                updatedByUI: true,
                features: [{
                    type: "Feature",
                    geometry: {type: "LineString", coordinates: [[1, 2], [2, 3], [3, 4]], textLabels: [{text: "1m"}, {text: "2m"}]},
                    properties: {values: [{value: 1154.583, formattedValue: "10 m", position: [1, 2], type: "length"}], disabled: false}
                }]
            },
            uom
        });
        // Restore drawInteraction when feature is valid
        expect(cmp.drawInteraction).toBeTruthy();
    });

    it('test modify features when geometry in edit is not fully formed', () => {
        const spyOnchangeGeometry = expect.spyOn(testHandlers, 'changeGeometry');
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

        cmp.drawInteraction.dispatchEvent({
            type: 'drawstart',
            feature: new Feature({
                geometry: new Polygon([[10.0, 15.0], [10.0, 15.0]])
            })
        });

        // LineString
        let ftLineString = {
            type: "Feature",
            geometry: {type: "LineString", coordinates: [[1, 2]], textLabels: []}
        };
        cmp = renderMeasurement({
            measurement: {
                geomType: "LineString",
                lineMeasureEnabled: true,
                updatedByUI: true,
                features: [ftLineString],
                currentFeature: 0
            },
            uom
        });
        expect(cmp.source.getFeatures().length).toBe(1);
        let feature = cmp.source.getFeatures()[0];
        expect(feature.getGeometry().getType()).toBe('LineString');
        expect(spyOnchangeGeometry).toHaveBeenCalled();
        let updatedFeatures = spyOnchangeGeometry.calls[0].arguments[0];
        expect(updatedFeatures[0].geometry.coordinates).toEqual([[1, 2], ["", ""]]);
        expect(updatedFeatures[0].geometry.textLabels).toEqual([{text: "0"}]);
        expect(updatedFeatures[0].properties.disabled).toBe(true);

        // Polygon
        cmp = renderMeasurement({
            measurement: {
                geomType: "Polygon",
                areaMeasureEnabled: true,
                currentFeature: 1,
                updatedByUI: true,
                features: [{...ftLineString, geometry: {...ftLineString.geometry, coordinates: [[1, 2], [2, 3]]}}, {
                    type: "Feature",
                    geometry: {type: "Polygon", coordinates: [[[1, 2], ["", ""], [1, 2]]], textLabels: [{text: "0"}, {text: "0"}]},
                    properties: {disabled: true}
                }]
            },
            uom
        });

        // Generate Linestring geometry for unformed Polygon
        expect(cmp.source.getFeatures().length).toBe(2);
        feature = cmp.source.getFeatures()[1];
        expect(feature.getGeometry().getType()).toBe('LineString');
        updatedFeatures = spyOnchangeGeometry.calls[1].arguments[0];
        expect(updatedFeatures[1].geometry.coordinates).toEqual([[[1, 2], ["", ""], [1, 2]]]);
        expect(updatedFeatures[1].geometry.textLabels.length).toBe(3);
        expect(updatedFeatures[1].properties.disabled).toBe(true);
    });
});
