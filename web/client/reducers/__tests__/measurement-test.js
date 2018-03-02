/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const expect = require('expect');
const measurement = require('../measurement');
const {
    toggleMeasurement,
    changeMeasurementState,
    changeUom,
    changeLengthFormula,
    toggleShowLabel,
    changeGeometry
} = require('../../actions/measurement');
const {RESET_CONTROLS} = require('../../actions/controls');
const feature = {type: "Feature", geometry: {
    coordinates: [[2, 2], [3, 3]],
    type: "LineString"
}};
describe('Test the measurement reducer', () => {

    it('returns original state on unrecognized action', () => {
        let state = measurement(undefined, {type: 'UNKNOWN'});
        expect(state.lineMeasureEnabled).toBe(false);
        expect(state.areaMeasureEnabled).toBe(false);
        expect(state.bearingMeasureEnabled).toBe(false);
        expect(state.uom.area.unit).toBe("sqm");
        expect(state.uom.area.label).toBe("m²");
        expect(state.lengthFormula).toBe("haversine");
    });

    it('CHANGE_MEASUREMENT_TOOL previous geomType LineString', () => {
        const state = measurement( {geomType: "LineString"}, toggleMeasurement({
            geomType: "LineString"
        }));
        expect(state.geomType).toBe(null);
        expect(state.lineMeasureEnabled).toBe(false);
        expect(state.areaMeasureEnabled).toBe(false);
        expect(state.bearingMeasureEnabled).toBe(false);
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

    it('CHANGE_MEASUREMENT_STATE', () => {
        let testAction = changeMeasurementState({
            lineMeasureEnabled: true,
            areaMeasureEnabled: false,
            bearingMeasureEnabled: false,
            geomType: "LineString",
            point: 0,
            len: 120205,
            area: 0,
            bearing: 0,
            lenUnit: "m",
            areaUnit: "sqm",
            feature
    });
        let state = measurement( {}, testAction);
        expect(state.lineMeasureEnabled).toBe(true);
        expect(state.areaMeasureEnabled).toBe(false);
        expect(state.bearingMeasureEnabled).toBe(false);
        expect(state.geomType).toBe("LineString");
        expect(state.len).toBe(120205);
    });


    it('TOGGLE_SHOW_LABEL', () => {
        let state = measurement( {showLabel: true}, toggleShowLabel());
        expect(state.showLabel).toBe(false);
        let state2 = measurement( {}, toggleShowLabel());
        expect(state2.showLabel).toBe(true);
    });
    it('CHANGE_UOM', () => {
        let state = measurement( {showLabel: true}, changeUom("length", {label: "km", value: "km"}, {
            length: {unit: 'm', label: 'm'},
            area: {unit: 'sqm', label: 'm²'}
        }));
        expect(state.lenUnit).toBe("km");
        expect(state.uom.length.label).toBe("km");
    });
    it('CHANGE_FORMULA', () => {
        let state = measurement( {feature, lengthFormula: "vincenty"}, changeLengthFormula("haversine"));
        expect(state.lengthFormula).toBe("haversine");
        expect(state.len).toBe(157353.62718543038);
    });
    it('CHANGE_FORMULA no feature', () => {
        let state = measurement( {feature: {}, lengthFormula: "vincenty"}, changeLengthFormula("haversine"));
        expect(state.lengthFormula).toBe("haversine");
        expect(state.len).toBe(0);
    });
    it('CHANGED_GEOMETRY', () => {
        let state = measurement( {feature: {}}, changeGeometry(feature));
        expect(state.feature.geometry.coordinates.length).toBe(2);
    });
    it('RESET_CONTROLS', () => {
        let state = measurement( {feature: {}}, {type: RESET_CONTROLS});
        expect(state.lineMeasureEnabled).toBe(false);
        expect(state.areaMeasureEnabled).toBe(false);
        expect(state.bearingMeasureEnabled).toBe(false);
    });

});
