/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');
const {show, hide, clear} = require('../../actions/notifications');
const notifications = require('../notifications');
describe('Test the notifications reducer', () => {
    it('add notification', () => {
        let state = notifications([], show({title: "test", uid: 1}));
        expect(state).toExist();
        expect(state.length).toBe(1);
    });
    it('hide notification', () => {
        let state = notifications([{uid: 1}], hide(1));
        expect(state).toExist();
        expect(state.length).toBe(0);
    });
    it('clear notifications', () => {
        let state = notifications([{uid: 1}], clear());
        expect(state).toExist();
        expect(state.length).toBe(0);
    });
});
