/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {
    toggleMeasurement, CHANGE_MEASUREMENT_TOOL,
    changeMeasurementState, CHANGE_MEASUREMENT_STATE,
    resetGeometry, RESET_GEOMETRY,
    changeUom, CHANGE_UOM,
    changeFormatMeasurement, CHANGE_FORMAT,
    init, INIT,
    changeGeometry, CHANGED_GEOMETRY,
    changeCoordinates, CHANGE_COORDINATES,
    updateMeasures, UPDATE_MEASURES
} = require('../measurement');
const feature = {type: "Feature", geometry: {
    coordinates: [],
    type: "LineString"
}};
const measureState = {
    len: 84321231.123,
    lengthFormula: "vincenty",
    feature
};
describe('Test correctness of measurement actions', () => {

    it('Test toggleMeasurement action creator', () => {
        const retval = toggleMeasurement(measureState);
        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_MEASUREMENT_TOOL);
        expect(retval.lengthFormula).toBe("vincenty");
    });
    it('Test resetGeometry action creator', () => {
        const retval = resetGeometry(measureState);
        expect(retval).toExist();
        expect(retval.type).toBe(RESET_GEOMETRY);
    });


    it('Test changeMousePositionState action creator', () => {
        const [uom, value, previousUom] = ["m", 42, {
            length: {unit: 'km', label: 'km'},
            area: {unit: 'sqm', label: 'm²'}
        }];
        const retval = changeUom(uom, value, previousUom);
        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_UOM);
        expect(retval.uom).toBe("m");
        expect(retval.value).toBe(42);
        expect(retval.previousUom.length.label).toBe("km");
    });

    it('Test changeGeometry action creator', () => {

        const retval = changeGeometry([feature]);
        expect(retval).toExist();
        expect(retval.type).toBe(CHANGED_GEOMETRY);
        expect(retval.features).toExist();
        expect(retval.features.length).toBe(1);
        expect(retval.features[0].geometry.type).toBe("LineString");
    });
    it('Test changeMeasurementState action creator', () => {
        const retval = changeMeasurementState(measureState);
        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_MEASUREMENT_STATE);
        expect(retval.feature.geometry.type).toBe("LineString");
    });
    it('Test init action creator', () => {
        const defaultOptions = { showAddAsAnnotation: true};
        const retval = init(defaultOptions);
        expect(retval).toExist();
        expect(retval.type).toBe(INIT);
        expect(retval.defaultOptions).toEqual(defaultOptions);
    });
    it('Test changeFormatMeasurement action creator', () => {
        const format = "decimal";
        const retval = changeFormatMeasurement(format);
        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_FORMAT);
        expect(retval.format).toEqual(format);
    });
    it('Test addAnnotation action creator', () => {
        const coordinates = [[1, 2], [2, 5]];
        const retval = changeCoordinates(coordinates);
        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_COORDINATES);
        expect(retval.coordinates).toEqual(coordinates);
    });
    it('Test updateMeasures action creator', () => {
        const retval = updateMeasures({len: 0});
        expect(retval).toExist();
        expect(retval.type).toBe(UPDATE_MEASURES);
        expect(retval.measures).toEqual({len: 0});
    });
});
