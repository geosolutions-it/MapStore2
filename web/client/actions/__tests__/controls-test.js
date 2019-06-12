/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var {
    TOGGLE_CONTROL, toggleControl,
    SET_CONTROL_PROPERTY, setControlProperty,
    SET_CONTROL_PROPERTIES, setControlProperties,
    RESET_CONTROLS, resetControls,
    on
} = require('../controls');

describe('Test correctness of the controls actions', () => {

    it('resetControls', () => {
        var retval = resetControls();

        expect(retval).toExist();
        expect(retval.type).toBe(RESET_CONTROLS);
        expect(retval.skip.length).toBe(0);
    });
    it('toggleControl', () => {
        const testControl = 'test';
        var retval = toggleControl(testControl);

        expect(retval).toExist();
        expect(retval.type).toBe(TOGGLE_CONTROL);
        expect(retval.control).toBe(testControl);
        expect(retval.property).toNotExist();
    });

    it('toggleControl with custom property', () => {
        const testControl = 'test';
        const testProperty = 'prop';
        var retval = toggleControl(testControl, testProperty);

        expect(retval).toExist();
        expect(retval.type).toBe(TOGGLE_CONTROL);
        expect(retval.control).toBe(testControl);
        expect(retval.property).toBe(testProperty);
    });

    it('conditional toggle', () => {
        const testControl = 'test';
        var retval = on(toggleControl(testControl), () => {}, {});

        expect(retval).toExist();
        expect(retval.type).toBe('IF:' + TOGGLE_CONTROL);
        expect(retval.action).toExist();
        expect(retval.action.control).toBe(testControl);
        expect(retval.action.property).toNotExist();
        expect(retval.condition).toExist();
        expect(retval.elseAction).toExist();
    });

    it('setControlProperty', () => {
        const testControl = 'test';
        const testProperty = 'prop';
        const testValue = 'val';
        var retval = setControlProperty(testControl, testProperty, testValue);

        expect(retval).toExist();
        expect(retval.type).toBe(SET_CONTROL_PROPERTY);
        expect(retval.control).toBe(testControl);
        expect(retval.property).toBe(testProperty);
        expect(retval.value).toBe(testValue);
    });

    it('setControlProperties', () => {
        const testControl = 'test';
        const testProperty1 = 'prop1';
        const testValue1 = 'val1';
        const testProperty2 = 'prop2';
        const testValue2 = 'val2';
        var retval = setControlProperties(testControl, testProperty1, testValue1, testProperty2, testValue2);

        expect(retval).toExist();
        expect(retval.type).toBe(SET_CONTROL_PROPERTIES);
        expect(retval.control).toBe(testControl);
        expect(retval.properties).toExist();
        expect(retval.properties[testProperty1]).toBe(testValue1);
        expect(retval.properties[testProperty2]).toBe(testValue2);
    });

    it('setControlProperties wrong params ignored', () => {
        const testControl = 'test';
        const testProperty1 = 'prop1';
        const testValue1 = 'val1';
        const testProperty2 = 'prop2';
        const testValue2 = 'val2';
        const testProperty3 = 'prop3';
        var retval = setControlProperties(testControl, testProperty1, testValue1, testProperty2, testValue2, testProperty3);

        expect(retval).toExist();
        expect(retval.type).toBe(SET_CONTROL_PROPERTIES);
        expect(retval.control).toBe(testControl);
        expect(retval.properties).toExist();
        expect(retval.properties[testProperty1]).toBe(testValue1);
        expect(retval.properties[testProperty2]).toBe(testValue2);
        expect(retval.properties[testProperty3]).toNotExist();
    });
});
