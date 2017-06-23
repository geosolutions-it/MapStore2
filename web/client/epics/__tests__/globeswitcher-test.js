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

const {updateRouteOn3dSwitch} = require('../globeswitcher');
const {testEpic} = require('./epicTestUtils');
describe('globeswitcher Epics', () => {
    it('updates maptype', (done) => {
        testEpic(updateRouteOn3dSwitch, 2, assign({hash: "/viewer/leaflet/2"}, toggle3d(true, "leaflet")), actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                case "@@router/CALL_HISTORY_METHOD":
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

    it('updates maptype on newmap', (done) => {
        testEpic(updateRouteOn3dSwitch, 2, assign({hash: "/viewer/leaflet/new"}, toggle3d(true, "leaflet")), actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                    case "@@router/CALL_HISTORY_METHOD":
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
