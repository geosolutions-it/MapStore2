/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';

import measurement from '../measurement';

import {
    toggleMeasurement,
    changeUom,
    changeCoordinates,
    changeFormatMeasurement,
    resetGeometry,
    updateMeasures,
    init,
    setAnnotationMeasurement,
    setMeasurementConfig,
    setCurrentFeature,
    changeGeometry
} from '../../actions/measurement';

import { RESET_CONTROLS, setControlProperty } from '../../actions/controls';

describe('Test the measurement reducer', () => {

    it('returns original state on unrecognized action', () => {
        let state = measurement(undefined, {type: 'UNKNOWN'});
        expect(state.lineMeasureEnabled).toBe(true);
        expect(state.areaMeasureEnabled).toBe(false);
        expect(state.bearingMeasureEnabled).toBe(false);
        expect(state.uom.area.unit).toBe("sqm");
        expect(state.uom.area.label).toBe("m²");
        expect(state.lengthFormula).toBe("haversine");
    });

    it('RESET_GEOMETRY', () => {
        const state = measurement({feature: {}}, resetGeometry());
        expect(state.feature.properties.disabled).toBe(true);
        expect(state.isDrawing).toBe(true);
        expect(state.updatedByUI).toBe(false);

    });
    it('CHANGE_MEASUREMENT_TOOL previous geomType empty', () => {
        const state = measurement( {geomType: ""}, toggleMeasurement({
            geomType: "LineString"
        }));
        expect(state.geomType).toBe("LineString");
        expect(state.lineMeasureEnabled).toBe(true);
        expect(state.areaMeasureEnabled).toBe(false);
        expect(state.bearingMeasureEnabled).toBe(false);
    });
    it('CHANGE_MEASUREMENT_TOOL previous geomType LineString, switch to Polygon', () => {
        const state = measurement( {geomType: "LineString"}, toggleMeasurement({
            geomType: "Polygon"
        }));
        expect(state.geomType).toBe("Polygon");
        expect(state.lineMeasureEnabled).toBe(false);
        expect(state.areaMeasureEnabled).toBe(true);
        expect(state.bearingMeasureEnabled).toBe(false);
    });

    it('CHANGE_UOM', () => {
        let state = measurement( {showLabel: true}, changeUom("length", {label: "km", value: "km"}, {
            length: {unit: 'm', label: 'm'},
            area: {unit: 'sqm', label: 'm²'}
        }));
        expect(state.lenUnit).toBe("km");
        expect(state.uom.length.label).toBe("km");
        expect(state.updatedByUI).toBe(true);

    });
    it('RESET_CONTROLS', () => {
        let state = measurement( {feature: {}, geomType: "Bearing", bearingMeasureEnabled: true}, {type: RESET_CONTROLS});
        expect(state.lineMeasureEnabled).toBe(false);
        expect(state.areaMeasureEnabled).toBe(false);
        expect(state.bearingMeasureEnabled).toBe(false);
        expect(state.geomType).toEqual("");
        expect(state.features).toEqual([]);
    });
    it('INIT', () => {
        let state = measurement( {feature: {}}, init({showAddAsAnnotation: true}));
        expect(state.showAddAsAnnotation).toBe(true);
    });
    it('CHANGE_FORMAT', () => {
        let state = measurement( {format: "aeronautical"}, changeFormatMeasurement("decimal"));
        expect(state.format).toBe("decimal");
    });
    it('CHANGE_COORDINATES', () => {
        const coordinates = [{lon: 3, lat: 1}, {lon: 5, lat: 5}];
        const feature = {
            geometry: {
                type: "LineString",
                coordinates: [[1, 3], [5, 4]],
                textLabels: [{text: "1m"}]
            }
        };
        let state = measurement({
            feature,
            features: [feature],
            currentFeature: 0
        }, changeCoordinates(coordinates));
        expect(state.feature.geometry.coordinates).toEqual([[3, 1], [5, 5]]);
        expect(state.feature.properties.disabled).toEqual(false);
        expect(state.updatedByUI).toBe(true);
        expect(state.features[0].geometry.textLabels).toEqual([{text: "1m"}]);
    });
    it('SET_CONTROL_PROPERTY closing measure tool', () => {
        let state = measurement({
            geomType: "LineString",
            lineMeasureEnabled: true,
            areaMeasureEnabled: false,
            bearingMeasureEnabled: false
        }, setControlProperty("measure", "enabled", false));
        expect(state.lineMeasureEnabled).toEqual(false);
        expect(state.geomType).toEqual("");
    });
    it('SET_CONTROL_PROPERTY closing other tools than measure', () => {
        let state = measurement({
            geomType: "LineString",
            lineMeasureEnabled: true,
            areaMeasureEnabled: false,
            bearingMeasureEnabled: false
        }, setControlProperty("drawer", "enabled", false));
        expect(state.lineMeasureEnabled).toEqual(true);
        expect(state.geomType).toEqual("LineString");
    });
    it('UPDATE_MEASURES', () => {
        let state = measurement({
            geomType: "LineString",
            lineMeasureEnabled: true,
            areaMeasureEnabled: false,
            bearingMeasureEnabled: false,
            len: 0,
            area: 700
        }, updateMeasures({len: 12430, area: 0}));
        expect(state.len).toEqual(12430);
        expect(state.area).toEqual(0);
        expect(state.geomType).toEqual("LineString");
    });
    it('SET_ANNOTATION_MEASUREMENT', () => {
        let state = measurement({
            geomType: "LineString",
            lineMeasureEnabled: true,
            areaMeasureEnabled: false,
            bearingMeasureEnabled: false,
            len: 0,
            area: 700
        }, setAnnotationMeasurement([{type: 'Feature', geometry: {type: 'LineString'}}], {id: 1, visibility: true}));
        expect(state.features).toEqual([{type: 'Feature', geometry: {type: 'LineString'}}]);
        expect(state.geomTypeSelected).toEqual(['LineString']);
        expect(state.updatedByUI).toBe(true);
        expect(state.exportToAnnotation).toBe(true);
        expect(state.id).toBe(1);
        expect(state.visibility).toBe(true);
        expect(state.geomType).toEqual("LineString");
    });
    it('SET_MEASUREMENT_CONFIG', () => {
        let state = measurement({
            geomType: "LineString",
            lineMeasureEnabled: true,
            areaMeasureEnabled: false,
            bearingMeasureEnabled: false,
            len: 0,
            area: 700
        }, setMeasurementConfig("exportToAnnotation", true));
        expect(state.exportToAnnotation).toBe(true);
    });
    it('SET_CURRENT_FEATURE', () => {
        let state = measurement({
            geomType: "LineString",
            lineMeasureEnabled: true,
            areaMeasureEnabled: false,
            bearingMeasureEnabled: false,
            len: 0,
            area: 700,
            features: ["1", "2"],
            currentFeature: 4
        }, setCurrentFeature());
        expect(state.currentFeature).toBe(2);
    });
    it('CHANGED_GEOMETRY', () => {
        const feature = {type: "Feature", geometry: {type: "LineString"}};
        let state = measurement({
            geomType: "Bearing",
            lineMeasureEnabled: true,
            areaMeasureEnabled: false,
            bearingMeasureEnabled: false,
            len: 0,
            area: 700,
            features: [],
            updatedByUI: true,
            isDrawing: true,
            currentFeature: 0
        }, changeGeometry([feature, feature]));
        expect(state.features).toEqual([feature, feature]);
        expect(state.updatedByUI).toBe(false);
        expect(state.isDrawing).toBe(false);
        expect(state.geomTypeSelected).toEqual(["LineString"]);
        expect(state.currentFeature).toBe(1);
    });
    it('CHANGED_GEOMETRY', () => {
        let state = measurement({
            features: [],
            updatedByUI: true,
            isDrawing: true,
            currentFeature: 0
        }, changeGeometry([]));
        expect(state.features).toEqual([]);
        expect(state.updatedByUI).toBe(false);
        expect(state.isDrawing).toBe(false);
        expect(state.isDrawing).toBe(false);
        expect(state.exportToAnnotation).toBe(false);
        expect(state.currentFeature).toBe(0);
    });
    it('CHANGED_GEOMETRY - do not fail if features array is missing in the initial state', () => {
        let state = measurement({
            updatedByUI: true,
            isDrawing: true
        }, changeGeometry([]));
        expect(state.features).toEqual([]);
        expect(state.updatedByUI).toBe(false);
        expect(state.isDrawing).toBe(false);
        expect(state.isDrawing).toBe(false);
        expect(state.currentFeature).toBe(0);
    });
});
