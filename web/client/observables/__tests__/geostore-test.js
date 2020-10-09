/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');

const geoStoreMock = require('./geoStoreMock').default;
const {createResource, deleteResource, getResourceIdByName, updateResource} = require('../geostore');
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
    describe('linked resources', () => {

        const RES_1 = {
            data: {},
            category: "TEST",
            metadata: {
                name: "RES2"
            },
            linkedResources: {
                thumbnail: {
                    tail: '/raw?decode=datauri', // for thumbnails, this will be appended to the resource URL in the main resource
                    data: "something"
                }
            }
        };

        it('update linked resources', done => {
            let mockAxios;

            const { mock } = geoStoreMock({
                callbacks: {
                    onUpdateAttribute: ({data}) => {
                        expect(data).toEqual(JSON.stringify({
                            restAttribute: {
                                name: 'thumbnail',
                                value: 'rest/geostore/data/2/raw?decode=datauri' // the URL is encoded
                            }
                        }));

                    }
                }
            });
            mockAxios = mock;
            createResource(RES_1).subscribe(
                v => {
                    expect(v).toBe(0);
                    mockAxios.restore();
                    done();
                },
                e => {
                    mockAxios.restore();
                    done(e);

                });
        });

        it('updateResource linked resource is not created if no thumbnail attribute for resource and data is NODATA', done => {
            const testResource = {
                id: 10,
                data: {},
                category: "TEST",
                metadata: {
                    name: "RES2"
                },
                linkedResources: {
                    thumbnail: {
                        tail: '/raw?decode=datauri',
                        data: "NODATA"
                    }
                }
            };
            const DummyAPI = {
                getResourceAttributes: () => Promise.resolve([{
                    name: 'details',
                    type: 'STRING',
                    value: 'rest/geostore/data/134'
                }]),
                putResourceMetadataAndAttributes: () => Promise.resolve(10),
                putResource: () => Promise.resolve(10),
                createResource: ({name}) => name.search(/10-thumbnail/) !== -1 ? done(new Error('createResource for thumbnail is called!')) : Promise.resolve(11),
                updateResourceAttribute: () => Promise.resolve(11)
            };
            updateResource(testResource, DummyAPI).subscribe(
                () => done(),
                e => done(e)
            );
        });

        it('updateResource linked resource is created if data is valid', done => {
            const testResource = {
                id: 10,
                data: {},
                category: "TEST",
                metadata: {
                    name: "RES2"
                },
                linkedResources: {
                    thumbnail: {
                        tail: '/raw?decode=datauri',
                        data: "data"
                    }
                }
            };

            let createResourceThumbnail = false;

            const DummyAPI = {
                getResourceAttributes: () => Promise.resolve([{
                    name: 'details',
                    type: 'STRING',
                    value: 'rest/geostore/data/134'
                }]),
                putResourceMetadataAndAttributes: () => Promise.resolve(10),
                putResource: () => Promise.resolve(10),
                createResource: ({name}) => {
                    if (name.search(/10-thumbnail/) !== -1) {
                        createResourceThumbnail = true;
                    }
                    return Promise.resolve(11);
                },
                updateResourceAttribute: () => Promise.resolve(11)
            };
            updateResource(testResource, DummyAPI).subscribe(
                () => {
                    try {
                        expect(createResourceThumbnail).toBe(true);
                        done();
                    } catch (e) {
                        done(e);
                    }
                },
                e => done(e)
            );
        });
    });
});
