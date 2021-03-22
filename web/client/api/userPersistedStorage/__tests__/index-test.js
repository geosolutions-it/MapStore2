/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { setApi, getApi } from '..';


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

});
