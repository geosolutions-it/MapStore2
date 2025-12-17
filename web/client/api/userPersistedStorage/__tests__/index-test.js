/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { setApi, getApi, getNameSpace, getItemKey } from '..';


describe('UserPersistedSession', () => {
    describe('MemoryStorage', () => {
        let memoryApi;
        beforeEach(() => {
            setApi("memoryStorage");
            memoryApi = getApi();
        });
        afterEach(() => {
            setApi("localStorage");
            memoryApi.setAccessDenied(false);
        });
        it('tests setItem & getItem', () => {
            memoryApi.setItem("key", "value");
            memoryApi.setItem("key2", "value2");
            expect(memoryApi.getItem("key")).toBe("value");
            expect(memoryApi.getItem("key2")).toBe("value2");
        });
        it('tests removeItem', () => {
            memoryApi.removeItem("key");
            expect(memoryApi.getItem("key2")).toBe("value2");
            expect(memoryApi.getItem("key")).toBeFalsy();
        });
        it('tests accessDenied', (done) => {
            memoryApi.setAccessDenied(true);
            try {
                memoryApi.getItem("key");
            } catch (e) {
                expect(e).toBeTruthy();
                const err = new Error("Cannot Access memoryStorage");
                expect(e).toEqual(err);
                done();
            }
        });

    });
    describe('getItemKey and namespace', () => {
        it('test namespace creation', () => {
            expect(getNameSpace('http://hello.world/')).toEqual('');
            expect(getNameSpace('http://hello.world/index.html')).toEqual('');
            expect(getNameSpace('')).toEqual('');
            expect(getNameSpace('/')).toEqual('');
            expect(getNameSpace('https://hello.world/mapstore')).toEqual('');
            expect(getNameSpace('https://hello.world/mapstore/')).toEqual('');
            expect(getNameSpace('https://hello.world/mapstore/index.html')).toEqual('');
            expect(getNameSpace('https://hello.world/mapstore/embedded.html?something/#/complicated')).toEqual('');
            expect(getNameSpace('https://hello.world/MApStore/embedded.html?something/#/complicated')).toEqual('');
            expect(getNameSpace('/mapstore-ctx-1/embedded.html?something/#/complicated')).toEqual('mapstore-ctx-1');
            expect(getNameSpace('/app')).toEqual('app');
            expect(getNameSpace('/app/')).toEqual('app');
            expect(getNameSpace('/app/index.html')).toEqual('app');
            expect(getNameSpace('https://hello.world/app')).toEqual('app');
            expect(getNameSpace('https://hello.world/app/')).toEqual('app');
            expect(getNameSpace('/mapstore-ctx-2/')).toEqual('mapstore-ctx-2');
            expect(getNameSpace('https://hello.world/mapstore2/embedded.html?something/#/complicated')).toEqual('mapstore2');
        });
        it('test getItemKey', () => {
            expect(getItemKey('a', 'b')).toEqual('mapstore.a.b');
            expect(getItemKey('a.b', 'c')).toEqual('mapstore.a.b.c');
            expect(getItemKey('a', 'b', {ns: 'app'})).toEqual('app:mapstore.a.b');
            expect(getItemKey('a', 'b', {base: 'other'})).toEqual('other.a.b');
            expect(getItemKey('a', 'b', {ns: 'app', base: 'other'})).toEqual('app:other.a.b');
        });
        it('getItemKey backward conpatibility', () => {
            // geostory tutorial
            expect(getItemKey("plugin.tutorial", "geostory.disabled")).toEqual("mapstore.plugin.tutorial.geostory.disabled");
            // tutorial
            const ID = "ID_ACT";
            expect(getItemKey("plugin.tutorial", ID + '.disabled')).toEqual('mapstore.plugin.tutorial.' + ID + '.disabled');
        });
    });

});
