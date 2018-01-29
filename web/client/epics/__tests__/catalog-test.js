/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');

const API = {
    csw: require('../../api/CSW')
};
const {getMetadataRecordById} = require('../catalog')(API);
const {SHOW_NOTIFICATION} = require('../../actions/notifications');
const {testEpic} = require('./epicTestUtils');
const {getMetadataRecordById: initAction} = require('../../actions/catalog');

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
});
