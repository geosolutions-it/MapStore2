/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import csw from '../../api/CSW';
const API = {
    csw
};
import catalog from '../catalog';
const {getMetadataRecordById, autoSearchEpic} = catalog(API);
import {SHOW_NOTIFICATION} from '../../actions/notifications';
import {testEpic, TEST_TIMEOUT, addTimeoutEpic} from './epicTestUtils';
import {getMetadataRecordById as initAction, changeText, SET_LOADING} from '../../actions/catalog';

describe('catalog Epics', () => {
    it('getMetadataRecordById', (done) => {
        testEpic(getMetadataRecordById, 2, initAction(), (actions) => {
            actions.filter( ({type}) => type === SHOW_NOTIFICATION).map(({message}) => {
                expect(Array.isArray(message)).toBe(false);
                expect(typeof message).toBe("string");
                done();
            });
        }, {
            layers: {
                selected: ["TEST"],
                flat: [{
                    id: "TEST",
                    catalogURL: "base/web/client/test-resources/csw/getRecordsResponseException.xml"
                }]
            }
        });

    });
    it('autoSearchEpic', (done) => {
        const NUM_ACTIONS = 3;
        testEpic(addTimeoutEpic(autoSearchEpic, 100), NUM_ACTIONS, changeText("value"), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((action) => {
                switch (action.type) {
                    case SET_LOADING: {
                        expect(action.loading).toBe(true);
                        break;
                    }
                    // here actions[2] is a thunk
                    case TEST_TIMEOUT:
                        done();
                        break;
                    default:
                        done(new Error("Action not recognized"));
                }
            });
            done();
        }, {
            catalog: {
                selectedService: 'gs_stable_csw',
                services: {
                    gs_stable_csw: {
                        url: 'https://gs-stable.geo-solutions.it/geoserver/csw',
                        type: 'csw',
                        title: 'GeoSolutions GeoServer CSW',
                        autoload: true
                    }
                }
            }
        });

    });
});
