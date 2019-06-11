/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');

const controls = require('../controls');
const {TOGGLE_CONTROL, SET_CONTROL_PROPERTY, SET_CONTROL_PROPERTIES, RESET_CONTROLS} = require('../../actions/controls');

describe('Test the controls reducer', () => {
    it('default case', () => {
        const state = controls({
            mycontrol: {
                enabled: true
            }
        }, {});
        expect(state.mycontrol).toExist();
        expect(state.mycontrol.enabled).toBe(true);
    });

    it('toggles a control the first time', () => {
        const state = controls({}, {
            type: TOGGLE_CONTROL,
            control: 'mycontrol'
        });
        expect(state.mycontrol).toExist();
        expect(state.mycontrol.enabled).toBe(true);
    });

    it('toggles a control already initialized', () => {
        const state = controls({
            mycontrol: {
                enabled: true
            }
        }, {
            type: TOGGLE_CONTROL,
            control: 'mycontrol'
        });
        expect(state.mycontrol).toExist();
        expect(state.mycontrol.enabled).toBe(false);
    });

    it('toggles a control using custom property', () => {
        const state = controls({
            mycontrol: {
                custom: false
            }
        }, {
            type: TOGGLE_CONTROL,
            control: 'mycontrol',
            property: 'custom'
        });
        expect(state.mycontrol).toExist();
        expect(state.mycontrol.custom).toBe(true);
    });

    it('set a control property', () => {
        const state = controls({}, {
            type: SET_CONTROL_PROPERTY,
            control: 'mycontrol',
            property: 'prop',
            value: 'val'
        });
        expect(state.mycontrol).toExist();
        expect(state.mycontrol.prop).toBe('val');
    });

    it('set a control property with toggle', () => {
        const state = controls({
            mycontrol: {
                enabled: true,
                prop: "val"
            }
        }, {
            type: SET_CONTROL_PROPERTY,
            control: 'mycontrol',
            property: 'prop',
            value: 'val',
            toggle: true
        });
        expect(state.mycontrol).toExist();
        expect(state.mycontrol.prop).toBe(undefined);
    });

    it('set a list of control properties', () => {
        const state = controls({}, {
            type: SET_CONTROL_PROPERTIES,
            control: 'mycontrol',
            properties: {
                'prop1': 'val1',
                'prop2': 'val2'
            }
        });
        expect(state.mycontrol).toExist();
        expect(state.mycontrol.prop1).toBe('val1');
        expect(state.mycontrol.prop2).toBe('val2');
    });

    it('reset the controls without skip ', () => {
        const state = controls(
            {
                c1: { enabled: true},
                c2: { enabled: false},
                c3: { idonthaveenabledfield: "whatever"}
            }, {
                type: RESET_CONTROLS,
                skip: []
            });
        expect(state.c1).toExist();
        expect(state.c2).toExist();
        expect(state.c3).toExist();
        expect(state.c1.enabled).toBe(false);
        expect(state.c2.enabled).toBe(false);
        expect(state.c3.enabled).toNotExist();
        expect(state.c3.idonthaveenabledfield).toExist();
        expect(state.c3.idonthaveenabledfield).toBe("whatever");
    });

    it('reset the controls with skip c1,c3', () => {
        const state = controls(
            {
                c1: { enabled: true},
                c2: { enabled: true},
                c3: { idonthaveenabledfield: "whatever"}
            }, {
                type: RESET_CONTROLS,
                skip: ["c1", "c3"]
            });
        expect(state.c1).toExist();
        expect(state.c2).toExist();
        expect(state.c3).toExist();
        expect(state.c1.enabled).toBe(true);
        expect(state.c2.enabled).toBe(false);
        expect(state.c3.enabled).toNotExist();
        expect(state.c3.idonthaveenabledfield).toExist();
        expect(state.c3.idonthaveenabledfield).toBe("whatever");
    });
});
