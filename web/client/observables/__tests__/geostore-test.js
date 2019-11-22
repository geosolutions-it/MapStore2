/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const {createResource, deleteResource, getResourceIdByName} = require('../geostore');
const testAndResolve = (test = () => {}, value) => (...args) => {
    test(...args);
    return Promise.resolve(value);
};
describe('geostore observables for resources management', () => {
    it('createResource', done => {
        const DummyAPI = {
            createResource: testAndResolve(() => {},
                {
                    data: "1"
                }
            ),
            getResourcePermissions: testAndResolve(() => {}, [{
                "canRead": true,
                "canWrite": true,
                "user": { "id": 3, "name": "admin" }
            }]),
            updateResourcePermissions: testAndResolve(
                (id) => {
                    expect(id).toBe('1');
                }
            )
        };
        const TEST_RESOURCE = {
            data: {},
            category: "TEST",
            metadata: {}
        };
        createResource(TEST_RESOURCE, DummyAPI)
            .subscribe(
                () => { },
                e => expect(true).toBe(false, e),
                () => done()
            );
    });
    it('deleteResource', done => {
        const DummyAPI = {
            deleteResource: () => {},
            getResourceAttributes: testAndResolve(
                id => expect(id).toBe(1),
                [{
                    "name": "thumbnail",
                    "type": "STRING",
                    "value": "rest%2Fgeostore%2Fdata%2F2%2Fraw%3Fdecode%3Ddatauri"
                }]
            )
        };
        const spy = expect.spyOn(DummyAPI, 'deleteResource');
        deleteResource({ id: 1 }, undefined, DummyAPI).subscribe(
            () => {},
            e => expect(true).toBe(false, e),
            () => {
                // check the connected resource is deleted too
                expect(spy.calls.length).toBe(2);
                done();
            }
        );
    });
    it('getResourceIdByName', done => {
        const resourceName = 'name';
        const spyFuncs = {
            dummy: () => {}
        };
        const DummyAPI = {
            getResourceIdByName: (category, name) => Promise.resolve([category, name, 1])
        };
        const spyResult = expect.spyOn(spyFuncs, 'dummy');
        getResourceIdByName('CONTEXT', resourceName, DummyAPI).subscribe(
            result => spyFuncs.dummy(result),
            e => expect(true).toBe(false, e),
            () => {
                expect(spyResult.calls.length).toBe(1);
                expect(spyResult.calls[0].arguments[0]).toEqual(['CONTEXT', resourceName, 1]);
                done();
            }
        );
    });
});
