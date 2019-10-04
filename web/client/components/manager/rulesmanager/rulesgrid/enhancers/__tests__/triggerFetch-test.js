/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const triggerFetch = require('../triggerFetch');
const Rx = require("rxjs");
const axios = require('../../../../../../libs/ajax');
const triggerInterceptors = (config) => {
    if (config.url.indexOf("rules/count") !== -1) {
        config.url = "base/web/client/test-resources/geofence/rest/rules/count";
        config.baseURL = "";
    }
    return config;
};

describe('rulegrid triggerFetch', () => {
    it('get count', (done) => {
        const inter = axios.interceptors.request.use(triggerInterceptors);
        const onLoad = ({pages, rowsCount}) => {
            expect(pages).toEqual({});
            expect(rowsCount).toBe(10);
            done();
        };
        const onLoadError = () => {};
        const prop$ = Rx.Observable.of({version: 0, filters: {}, setLoading: () => {}, onLoad, onLoadError});
        triggerFetch(prop$).subscribe({
            next: () => {},
            error: () => {},
            complete: () => {
                axios.interceptors.request.eject(inter);
            }
        });
    });

    it('handle error', (done) => {
        const inter = axios.interceptors.request.use(triggerInterceptors);
        const onLoad = () => {
            throw new Error("ERROR");
        };
        const onLoadError = (e) => {
            expect(e.title).toExist();
            expect(e.message).toExist();
            done();
        };
        const prop$ = Rx.Observable.of({ version: 0, filters: {}, setLoading: () => { }, onLoad, onLoadError });
        triggerFetch(prop$).subscribe({
            next: () => { },
            error: () => { },
            complete: () => {
                axios.interceptors.request.eject(inter);
            }
        });
    });
});
