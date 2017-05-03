/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');

const {toggle3d, UPDATE_LAST_2D_MAPTYPE} = require('../../actions/globeswitcher');
const assign = require('object-assign');
const Rx = require('rxjs');
const { ActionsObservable } = require('redux-observable');
const {updateRouteOn3dSwitch} = require('../globeswitcher');
const epicTest = (epic, count, action, callback, state = {}) => {
    const actions = new Rx.Subject();
    const actions$ = new ActionsObservable(actions);
    const store = { getState: () => state };
    epic(actions$, store)
        .take(count)
        .toArray()
        .subscribe(callback);
    if (action.length) {
        action.map(act => actions.next(act));
    } else {
        actions.next(action);
    }
};
describe('globeswitcher Epics', () => {
    it('produces the search epic', (done) => {
        epicTest(updateRouteOn3dSwitch, 2, assign({hash: "/viewer/leaflet/2"}, toggle3d(true, "leaflet")), actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                    case "@@router/TRANSITION":
                        expect(action.payload.method).toBe('push');
                        expect(action.payload.args.length).toBe(1);
                        break;
                    case UPDATE_LAST_2D_MAPTYPE:
                        expect(action.mapType).toBe("leaflet");
                        break;
                    default:
                        expect(true).toBe(false);

                }
            });
            done();
        });

    });
});
