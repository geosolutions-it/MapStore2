/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var {
    SHOW_NOTIFICATION,
    HIDE_NOTIFICATION,
    CLEAR_NOTIFICATIONS,
    show,
    success,
    warning,
    error,
    info,
    hide,
    clear,
    dispatchAction
} = require('../notifications');

describe('Test correctness of the notifications actions', () => {

    it('show', () => {
        const action = show({title: "test"});
        expect(action.type).toBe(SHOW_NOTIFICATION);
        expect(action.title).toBe('test');
        expect(action.level).toBe('success');
        expect(action.uid).toExist();
    });
    it('hide', () => {
        const action = hide("1234");
        expect(action.type).toBe(HIDE_NOTIFICATION);
        expect(action.uid).toBe('1234');
    });
    it('clear', () => {
        const action = clear();
        expect(action.type).toBe(CLEAR_NOTIFICATIONS);
    });
    it('success', () => {
        const action = success({title: "test"});
        expect(action.type).toBe(SHOW_NOTIFICATION);
        expect(action.title).toBe('test');
        expect(action.level).toBe('success');
        expect(action.uid).toExist();
    });
    it('warning', () => {
        const action = warning({title: "test"});
        expect(action.type).toBe(SHOW_NOTIFICATION);
        expect(action.title).toBe('test');
        expect(action.level).toBe('warning');
        expect(action.uid).toExist();
    });
    it('error', () => {
        const action = error({title: "test"});
        expect(action.type).toBe(SHOW_NOTIFICATION);
        expect(action.title).toBe('test');
        expect(action.level).toBe('error');
        expect(action.uid).toExist();
    });
    it('info', () => {
        const action = info({title: "test"});
        expect(action.type).toBe(SHOW_NOTIFICATION);
        expect(action.title).toBe('test');
        expect(action.level).toBe('info');
        expect(action.uid).toExist();
    });
    it('dispatchAction', () => {
        const customAction = () => {
            return {
                type: 'CUSTOM_ACTION'
            };
        };
        const action = dispatchAction(customAction());
        expect(action.type).toBe('CUSTOM_ACTION');
    });


});
