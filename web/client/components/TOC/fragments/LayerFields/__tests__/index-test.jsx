import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';

import AxiosMockAdapter from 'axios-mock-adapter';

import axios from '../../../../../libs/ajax';

import LayerFields, { loadFields, hasFields } from '../index';
let mockAxios;
describe('TOC Settings - LayerFields component', () => {
    describe('hasFields', () => {
        it('check hasFields with wfs', () => {
            expect(hasFields({
                type: 'wfs'
            })).toBe(true);
        });
        it('check hasFields with wms', () => {
            expect(hasFields({
                type: 'wms',
                search: {
                    type: 'wfs'
                }
            })).toBe(true);
        });
        it('check hasFields with wms and no search', () => {
            expect(hasFields({
                type: 'wms'
            })).toBe(false);
        });
    });
    describe('loadFields', () => {
        beforeEach((done) => {
            document.body.innerHTML = '<div id="container"></div>';
            setTimeout(done);
            mockAxios = new AxiosMockAdapter(axios);

        });
        afterEach((done) => {
            ReactDOM.unmountComponentAtNode(document.getElementById("container"));
            document.body.innerHTML = '';
            setTimeout(done);
            mockAxios.restore();
        });
        it('loadFields with no fields', (done) => {
            mockAxios.onGet().reply(200, {
                featureTypes: [{
                    typeName: 'topp:states',
                    properties: [{
                        name: 'name',
                        localType: 'string'
                    }]
                }]
            }
            );
            loadFields({
                url: 'test',
                type: 'wfs'
            }).then((fields) => {
                expect(fields).toEqual([{
                    name: 'name',
                    type: 'string'
                }]);
                done();
            }).catch((e) => {
                done(e);
            });
        });
        it('check merge applies alias from old fields', (done) => {
            mockAxios.onGet().reply(200, {
                featureTypes: [{
                    typeName: 'topp:states',
                    properties: [{
                        name: 'name',
                        localType: 'string'
                    }]
                }]
            }
            );
            loadFields({
                url: 'test',
                fields: [{
                    name: 'name',
                    type: 'string',
                    alias: 'Name'
                }],
                type: 'wfs'
            }).then((fields) => {
                expect(fields).toEqual([{
                    name: 'name',
                    type: 'string',
                    alias: 'Name'
                }]);
                done();
            }).catch((e) => {
                done(e);
            });
        });
        it('merge with new field', (done) => {
            mockAxios.onGet().reply(200, {
                featureTypes: [{
                    typeName: 'topp:states',
                    properties: [{
                        name: 'name',
                        localType: 'string'
                    }, {
                        name: 'new',
                        localType: 'string'
                    }]
                }]
            });
            loadFields({
                url: 'test',
                fields: [{
                    name: 'name',
                    type: 'string',
                    alias: 'Name'
                }],
                type: 'wfs'
            }).then((fields) => {
                expect(fields).toEqual([{
                    name: 'name',
                    type: 'string',
                    alias: 'Name'
                }, {
                    name: 'new',
                    type: 'string'
                }]);
                done();
            }).catch((e) => {
                done(e);
            });
        });
        it('check disabled merge', (done) => {
            mockAxios.onGet().reply(200, {
                featureTypes: [{
                    typeName: 'topp:states',
                    properties: [{
                        name: 'name',
                        localType: 'string'
                    }, {
                        name: 'new',
                        localType: 'string'
                    }]
                }]
            });
            loadFields({
                url: 'test',
                fields: [{
                    name: 'name',
                    type: 'string',
                    alias: 'Name'
                }],
                type: 'wfs'
            }, false).then((fields) => {
                expect(fields).toEqual([{
                    name: 'name',
                    type: 'string'
                }, {
                    name: 'new',
                    type: 'string'
                }]);
                done();
            }).catch((e) => {
                done(e);
            });
        });
    });
    describe('LayerFields component', () => {
        beforeEach((done) => {
            document.body.innerHTML = '<div id="container"></div>';
            setTimeout(done);
            mockAxios = new AxiosMockAdapter(axios);

        });
        afterEach((done) => {
            ReactDOM.unmountComponentAtNode(document.getElementById("container"));
            document.body.innerHTML = '';
            setTimeout(done);
            mockAxios.restore();
        });
        const TEST_FIELDS = [{
            name: 'name',
            type: 'string'
        }, {
            name: 'new',
            type: 'string'
        }];

        it('LayerFields rendering with defaults', (done) => {
            mockAxios.onGet().reply(200, {
                featureTypes: [{
                    typeName: 'topp:states',
                    properties: [{
                        name: 'name',
                        localType: 'string'
                    }]
                }]
            }
            );
            ReactDOM.render(<LayerFields layer={{ype: "wfs", url: "test", fields: TEST_FIELDS}}/>, document.getElementById("container"));
            const container = document.getElementById('container');
            const el = container.querySelector('.layer-fields');
            expect(el).toExist();
            done();
        });
        it('LayerFields rendering with fields', (done) => {
            ReactDOM.render(<LayerFields layer={{fields: TEST_FIELDS}}/>, document.getElementById("container"));
            const container = document.getElementById('container');
            const el = container.querySelector('.layer-fields');
            expect(el).toExist();
            const rows = el.querySelectorAll('.layer-fields-row');
            expect(rows.length).toBe(2);
            done();
        });
    });
});
