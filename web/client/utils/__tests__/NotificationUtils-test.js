/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const expect = require('expect');
const {basicSuccess, basicError} = require('../NotificationUtils');
const {SHOW_NOTIFICATION} = require('../../actions/notifications');


describe('NotificationUtils', () => {
    beforeEach( () => {

    });
    afterEach(() => {

    });
    it('test basicError', () => {
        const action = basicError();
        expect(action).toExist();
        expect(action.type).toBe(SHOW_NOTIFICATION);
        expect(action.level).toBe("error");
        expect(action.title).toBe("notification.warning");
        expect(action.autoDismiss).toBe(6);
        expect(action.message).toBe("Error");
        expect(action.position).toBe("tc");
    });
    it('test basicSuccess', () => {
        const action = basicSuccess('Thunderforest.OpenCycleMap');
        expect(action).toExist();
        expect(action.type).toBe(SHOW_NOTIFICATION);
        expect(action.level).toBe("success");
        expect(action.title).toBe("notification.success");
        expect(action.autoDismiss).toBe(6);
        expect(action.message).toBe("Success");
        expect(action.position).toBe("tc");
    });

});
