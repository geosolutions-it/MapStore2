/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import geoStoreMock from './geoStoreMock';
import { createResource, deleteResource, getResourceIdByName, updateResource, getResource } from '../geostore';
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
                updateResourceAttribute: () => Promise.resolve(11),
                getResourcePermissions: () => Promise.resolve([])
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
                updateResourceAttribute: () => Promise.resolve(11),
                getResourcePermissions: () => Promise.resolve([]),
                updateResourcePermissions: () => Promise.resolve()
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
        it('updateResource linked resource is updated', done => {
            const testResource = {
                id: 10,
                data: {},
                category: "TEST",
                metadata: {
                    name: "RES2"
                },
                linkedResources: {
                    details: { category: "DETAILS", data: "<p>Test</p>"}
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
                updateResourceAttribute: () => Promise.resolve(11),
                getResourcePermissions: () => Promise.resolve([]),
                updateResourcePermissions: () => Promise.resolve()
            };
            updateResource(testResource, DummyAPI).subscribe(
                () => done(),
                e => done(e)
            );
        });
    });
    it('getResource with default arguments', done => {

        const ID = 7;

        const DummyAPI = {
            getShortResource: testAndResolve(
                id => expect(id).toBe(ID),
                {}
            ),
            getResourceAttributes: testAndResolve(
                id => expect(id).toBe(ID),
                [{
                    "name": "thumbnail",
                    "type": "STRING",
                    "value": "rest%2Fgeostore%2Fdata%2F2%2Fraw%3Fdecode%3Ddatauri"
                }]
            ),
            getData: testAndResolve(
                (id) => {
                    expect(id).toBe(ID);
                },
                {}
            )
        };
        getResource(ID, {}, DummyAPI)
            .subscribe(
                (res) => {
                    try {
                        expect(res).toEqual(
                            {
                                attributes: { thumbnail: 'rest%2Fgeostore%2Fdata%2F2%2Fraw%3Fdecode%3Ddatauri' },
                                data: {},
                                permissions: undefined
                            }
                        );
                        done();
                    } catch (e) {
                        done(e);
                    }
                },
                e => expect(true).toBe(false, e)
            );
    });
    it('getResource with includeAttributes set to false ', done => {

        const ID = 7;

        const DummyAPI = {
            getShortResource: testAndResolve(
                id => expect(id).toBe(ID),
                {}
            ),
            getResourceAttributes: testAndResolve(
                id => expect(id).toBe(ID),
                [{
                    "name": "thumbnail",
                    "type": "STRING",
                    "value": "rest%2Fgeostore%2Fdata%2F2%2Fraw%3Fdecode%3Ddatauri"
                }]
            ),
            getData: testAndResolve(
                (id) => {
                    expect(id).toBe(ID);
                },
                {}
            )
        };
        getResource(ID, { includeAttributes: false }, DummyAPI)
            .subscribe(
                (res) => {
                    try {
                        expect(res).toEqual(
                            {
                                attributes: {},
                                data: {},
                                permissions: undefined
                            }
                        );
                        done();
                    } catch (e) {
                        done(e);
                    }
                },
                e => expect(true).toBe(false, e)
            );
    });
    it('getResource with includeTags set to false', done => {

        const ID = 7;

        const DummyAPI = {
            getShortResource: testAndResolve(
                id => expect(id).toBe(ID),
                {
                    ShortResource: {
                        tagList: {
                            Tag: {
                                id: '1',
                                name: 'Tag',
                                description: 'description',
                                color: '#ff0000'
                            }
                        }
                    }
                }
            ),
            getResourceAttributes: testAndResolve(
                id => expect(id).toBe(ID),
                []
            ),
            getData: testAndResolve(
                (id) => {
                    expect(id).toBe(ID);
                },
                {}
            )
        };
        getResource(ID, { includeTags: true }, DummyAPI)
            .subscribe(
                (res) => {
                    try {
                        expect(res).toEqual(
                            {
                                attributes: {},
                                data: {},
                                permissions: undefined,
                                tags: [{
                                    id: '1',
                                    name: 'Tag',
                                    description: 'description',
                                    color: '#ff0000'
                                }]
                            }
                        );
                        done();
                    } catch (e) {
                        done(e);
                    }
                },
                e => expect(true).toBe(false, e)
            );
    });
    it('updateResource with tags', done => {
        const ID = 10;
        const testResource = {
            id: ID,
            tags: [{ tag: { id: '1' }, action: 'link'}, { tag: { id: '2' }, action: 'unlink'}]
        };
        const DummyAPI = {
            putResourceMetadataAndAttributes: testAndResolve(
                (id) => {
                    expect(id).toBe(ID);
                },
                {}
            ),
            linkTagToResource: testAndResolve(
                (tagId, resourceId) => {
                    expect(tagId).toBe('1');
                    expect(resourceId).toBe(ID);
                },
                {}
            ),
            unlinkTagFromResource: testAndResolve(
                (tagId, resourceId) => {
                    expect(tagId).toBe('2');
                    expect(resourceId).toBe(ID);
                },
                {}
            )
        };
        updateResource(testResource, DummyAPI).subscribe(
            () => done(),
            e => done(e)
        );
    });
    it('createResource should skip invalid tags', done => {
        const ID = 1;
        const testResource = {
            metadata: { name: 'A' },
            data: {},
            category: 'MAP',
            tags: [{ id: '1' }, { tag: { id: '2' }, action: 'link'}]
        };
        const DummyAPI = {
            createResource: testAndResolve(
                (metadata, data, category) => {
                    expect(metadata).toBe(testResource.metadata);
                    expect(data).toBe(testResource.data);
                    expect(category).toBe(testResource.category);
                },
                { data: ID }
            ),
            getResourcePermissions: testAndResolve(
                (id) => {
                    expect(id).toBe(ID);
                },
                []
            ),
            updateResourcePermissions: testAndResolve(
                (id) => {
                    expect(id).toBe(ID);
                },
                {}
            ),
            linkTagToResource: testAndResolve(
                (tagId, resourceId) => {
                    expect(tagId).toBe('2');
                    expect(resourceId).toBe(ID);
                },
                {  }
            )
        };
        createResource(testResource, DummyAPI).subscribe(
            () => done(),
            e => done(e)
        );
    });
    it('updateResource should skip invalid tags', done => {
        const ID = 10;
        const testResource = {
            id: ID,
            tags: [{ id: '1' }, { tag: { id: '2' }, action: 'link'}]
        };
        const DummyAPI = {
            putResourceMetadataAndAttributes: testAndResolve(
                (id) => {
                    expect(id).toBe(ID);
                },
                {}
            ),
            linkTagToResource: testAndResolve(
                (tagId, resourceId) => {
                    expect(tagId).toBe('2');
                    expect(resourceId).toBe(ID);
                },
                {}
            )
        };
        updateResource(testResource, DummyAPI).subscribe(
            () => done(),
            e => done(e)
        );
    });
    it('createResource with tags', done => {
        const ID = 10;
        const testResource = {
            id: ID,
            tags: [{ tag: { id: '1' }, action: 'link'}, { tag: { id: '2' }, action: 'unlink'}]
        };
        const DummyAPI = {
            createResource: testAndResolve(() => {},
                {
                    data: ID
                }
            ),
            getResourcePermissions: testAndResolve(() => {}, [{
                "canRead": true,
                "canWrite": true,
                "user": { "id": 3, "name": "admin" }
            }]),
            updateResourcePermissions: testAndResolve(
                (id) => {
                    expect(id).toBe(ID);
                }
            ),
            linkTagToResource: testAndResolve(
                (tagId, resourceId) => {
                    expect(tagId).toBe('1');
                    expect(resourceId).toBe(ID);
                },
                {}
            ),
            unlinkTagFromResource: testAndResolve(
                (tagId, resourceId) => {
                    expect(tagId).toBe('2');
                    expect(resourceId).toBe(ID);
                },
                {}
            )
        };
        createResource(testResource, DummyAPI).subscribe(
            () => done(),
            e => done(e)
        );
    });
    it('updateResource should call permission API independently without parallel API calls', done => {
        const ID = 10;
        const testResource = {
            id: ID,
            data: {},
            metadata: { name: 'Test Resource' },
            permission: [{ canRead: true, canWrite: true, user: { id: 1, name: 'test' } }, 	{
                canRead: true,
                canWrite: false,
                group: {
                    id: 479,
                    groupName: "everyone"
                }
            }],
            linkedResources: {
                details: {
                    "category": "DETAILS",
                    "value": "rest/geostore/data/1200000000",
                    "data": "<p>test</p>"
                }
            }
        };

        // Track API calls with timestamps to verify independence
        const apiCalls = [];

        const DummyAPI = {
            putResourceMetadataAndAttributes: (id, metadata) => {
                const startTime = Date.now();
                apiCalls.push({ name: `putResourceMetadataAndAttributes-start-${id}`, time: startTime, id, metadata, url: `PUT /rest/geostore/resources/${id}/metadata` });

                return new Promise((resolve) => {
                    setTimeout(() => {
                        const endTime = Date.now();
                        apiCalls.push({ name: `putResourceMetadataAndAttributes-end-${id}`, time: endTime, id, url: `PUT /rest/geostore/resources/${id}/metadata` });
                        resolve({});
                    }, 50);
                });
            },
            putResource: (id, data) => {
                const startTime = Date.now();
                apiCalls.push({ name: `putResource-start-${id}`, time: startTime, id, data, url: `PUT /rest/geostore/resources/${id}/data` });

                return new Promise((resolve) => {
                    setTimeout(() => {
                        const endTime = Date.now();
                        apiCalls.push({ name: `putResource-end-${id}`, time: endTime, id, url: `PUT /rest/geostore/resources/${id}/data` });
                        resolve({});
                    }, 50);
                });
            },
            updateResourcePermissions: (id, permissions) => {
                // console.log('updateResourcePermissions--->', id, permissions);
                if (id === ID) {
                    // Main resource permission API
                    apiCalls.push({ name: `updateResourcePermissions-start-${id}`, time: Date.now(), id, permissions, url: `PUT /rest/geostore/resources/${id}/permissions` });

                    return new Promise((resolve) => {
                        setTimeout(() => {
                            apiCalls.push({ name: `updateResourcePermissions-end-${id}`, time: Date.now(), id, url: `PUT /rest/geostore/resources/${id}/permissions` });
                            resolve({
                                SecurityRuleList: {
                                    SecurityRule: testResource.permission
                                }
                            });
                        }, 300); // 300ms delay to simulate API call
                    });
                }
                // Linked resource permission API
                const startTime = Date.now();
                apiCalls.push({ name: `updateResourcePermissions-linked-start-${id}`, time: startTime, id, permissions, url: `PUT /rest/geostore/resources/${id}/permissions` });

                return new Promise((resolve) => {
                    setTimeout(() => {
                        const endTime = Date.now();
                        apiCalls.push({ name: `updateResourcePermissions-linked-end-${id}`, time: endTime, id, url: `PUT /rest/geostore/resources/${id}/permissions` });
                        resolve({
                            SecurityRuleList: {
                                SecurityRule: testResource.permission
                            }
                        });
                    }, 200); // 200ms delay for linked resource permission API
                });
            },
            getResourceAttributes: (id) => {
                const startTime = Date.now();
                apiCalls.push({ name: `getResourceAttributes-start-${id}`, time: startTime, id, url: `GET /rest/geostore/resources/${id}/attributes` });

                return new Promise((resolve) => {
                    setTimeout(() => {
                        const endTime = Date.now();
                        apiCalls.push({ name: `getResourceAttributes-end-${id}`, time: endTime, id, url: `GET /rest/geostore/resources/${id}/attributes` });
                        resolve([{
                            name: 'details',
                            type: 'STRING',
                            value: 'rest/geostore/data/1200000000'
                        }]);
                    }, 50);
                });
            },
            updateResourceAttribute: (id, name, value) => {
                const startTime = Date.now();
                apiCalls.push({ name: `updateResourceAttribute-start-${id}`, time: startTime, id, value, url: `PUT /rest/geostore/resources/${id}/attributes/${name}` });

                return new Promise((resolve) => {
                    setTimeout(() => {
                        const endTime = Date.now();
                        apiCalls.push({ name: `updateResourceAttribute-end-${id}`, time: endTime, id, url: `PUT /rest/geostore/resources/${id}/attributes/${name}` });
                        resolve({});
                    }, 50);
                });
            },
            createResource: (resource) => {
                const startTime = Date.now();
                apiCalls.push({ name: `createResource-start-${resource.id}`, time: startTime, id: resource.id, url: `POST /rest/geostore/resources` });

                return new Promise((resolve) => {
                    setTimeout(() => {
                        const endTime = Date.now();
                        apiCalls.push({ name: `createResource-end-${resource.id}`, time: endTime, id: resource.id, url: `POST /rest/geostore/resources` });
                        resolve({});
                    }, 50);
                });
            }
        };

        updateResource(testResource, DummyAPI).subscribe(
            () => {
                // Group API calls by resource ID to analyze timing relationships between permission and non-permission calls for each resource
                const groupedById = apiCalls.reduce((acc, item) => {
                    const id = item.id.toString(); // Normalize to string if needed
                    if (!acc[id]) {
                        acc[id] = [];
                    }
                    acc[id].push(item);
                    return acc;
                }, {});

                // Ensure that permission API calls (updateResourcePermissions) are not executed in parallel with other API calls for the same resource ID.
                // This test checks that NO non-permission API call (such as metadata, data, attribute, or linked resource updates)
                // occurs between the start and end of a permission API call window for each resource.
                Object.keys(groupedById).forEach(id => {
                    const calls = groupedById[id];

                    const permissionCalls = calls.filter(call => call.name.includes('updateResourcePermissions'));
                    const nonPermissionCalls = calls.filter(call => !call.name.includes('updateResourcePermissions'));
                    const permissionStartCall = permissionCalls.find(call => call.name.includes('start'));
                    const permissionEndCall = permissionCalls.find(call => call.name.includes('end'));

                    expect(permissionStartCall.time).toBeLessThan(permissionEndCall.time);

                    nonPermissionCalls.forEach(call => {
                        const t = call.time;

                        const isBetween = t > permissionStartCall.time && t < permissionEndCall.time;
                        expect(isBetween).toBe(false); // Fails if any non-permission call is inside the permission window
                    });

                });
                done();
            }
        );

    });
    it('updateResource should update permission for linked resources not currently modified', done => {
        const ID = 1;
        const resourceAttributes = [{
            name: 'details',
            type: 'STRING',
            value: 'rest/geostore/data/2'
        }];
        const testResource = {
            id: ID,
            metadata: { name: 'Test Resource' },
            permission: [
                { canRead: true, canWrite: true, user: { id: 1, name: 'test' } },
                { canRead: true, canWrite: false, group: { id: 479, groupName: "everyone" }}
            ]
        };

        const apiCalls = [];
        const DummyAPI = {
            putResourceMetadataAndAttributes: testAndResolve(
                (id) => {
                    apiCalls.push(`putResourceMetadataAndAttributes-${id}`);
                }, {}),
            updateResourcePermissions: testAndResolve(
                (id) => {
                    apiCalls.push(`updateResourcePermissions-${id}`);
                }, {}),
            getResourceAttributes: testAndResolve(
                (id) => {
                    apiCalls.push(`getResourceAttributes-${id}`);
                }, resourceAttributes)
        };

        updateResource(testResource, DummyAPI)
            .subscribe(() => {
                try {
                    expect(apiCalls).toEqual([
                        'putResourceMetadataAndAttributes-1',
                        'updateResourcePermissions-1',
                        'getResourceAttributes-1',
                        'updateResourcePermissions-2'
                    ]);
                } catch (e) {
                    done(e);
                }
                done();
            },
            e => done(e));

    });

    it('updateResource should call permissions if not provided to correctly update modified linked resources', done => {
        const ID = 1;
        const resourceAttributes = [{
            name: 'details',
            type: 'STRING',
            value: 'rest/geostore/data/2'
        }];
        const resourcePermissions = [
            { canRead: true, canWrite: true, user: { id: 1, name: 'test' } },
            { canRead: true, canWrite: false, group: { id: 479, groupName: "everyone" }}
        ];
        const testResource = {
            id: ID,
            metadata: { name: 'Test Resource' },
            linkedResources: {
                details: {
                    "category": "DETAILS",
                    "value": "rest/geostore/data/2",
                    "data": "<p>test</p>"
                }
            }
        };

        const apiCalls = [];
        const DummyAPI = {
            putResourceMetadataAndAttributes: testAndResolve(
                (id) => {
                    apiCalls.push(`putResourceMetadataAndAttributes-${id}`);
                }, {}),
            getResourcePermissions: testAndResolve(
                (id) => {
                    apiCalls.push(`getResourcePermissions-${id}`);
                }, resourcePermissions),
            getResourceAttributes: testAndResolve(
                (id) => {
                    apiCalls.push(`getResourceAttributes-${id}`);
                }, resourceAttributes),
            putResource: testAndResolve(
                (id) => {
                    apiCalls.push(`putResource-${id}`);
                }),
            updateResourcePermissions: testAndResolve(
                (id, permissions) => {
                    expect(permissions).toEqual({ SecurityRuleList: { SecurityRule: resourcePermissions }});
                    apiCalls.push(`updateResourcePermissions-${id}`);
                }, {}),
            updateResourceAttribute: testAndResolve(
                (id) => {
                    apiCalls.push(`updateResourceAttribute-${id}`);
                }, {})
        };

        updateResource(testResource, DummyAPI)
            .subscribe(() => {
                try {
                    expect(apiCalls).toEqual([
                        'putResourceMetadataAndAttributes-1',
                        'getResourcePermissions-1',
                        'getResourceAttributes-1',
                        'putResource-2',
                        'updateResourceAttribute-1',
                        'updateResourcePermissions-2'
                    ]);
                } catch (e) {
                    done(e);
                }
                done();
            },
            e => done(e));
    });
});
