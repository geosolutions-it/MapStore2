/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import triggerFetchGSInstances from '../triggerFetchGSInstances';
import Rx from 'rxjs';
import axios from '../../../../../../../libs/ajax';
const triggerInterceptors = (config) => {
    if (config.url.indexOf("instances") !== -1) {
        config.url = "base/web/client/test-resources/geofence/rest/rules/gsInstances.xml";
        config.baseURL = "";
    }
    return config;
};

describe('gsInstances triggerFetchGSInstances', () => {
    it('get count', (done) => {
        const inter = axios.interceptors.request.use(triggerInterceptors);
        const onLoad = ({pages, rowsCount}) => {
            expect(pages).toEqual({0: [
                {
                    "id": "1",
                    "name": "geoserver",
                    "url": "http://localhost:8080/geoserver",
                    "description": "description"
                },
                {
                    "id": "2",
                    "name": "geoserver2",
                    "url": "http://localhost:8080/geoserver2",
                    "description": "geoserver2 description"
                },
                {
                    "id": "3",
                    "name": "geoserver3",
                    "url": "http://localhost:8080/geoserver3",
                    "description": "geoserver3 description"
                },
                {
                    "id": "4",
                    "name": "geoserver4",
                    "url": "http://localhost:8080/geoserver4",
                    "description": "geoserver4 description"
                },
                {
                    "id": "5",
                    "name": "geoserver5",
                    "url": "http://localhost:8080/geoserver5",
                    "description": "geoserver5 description"
                }
            ]});
            expect(rowsCount).toBe(5);
            done();
        };
        const onLoadError = () => {};
        const prop$ = Rx.Observable.of({version: 0, filters: {}, setLoading: () => {}, onLoad, onLoadError});
        triggerFetchGSInstances(prop$).subscribe({
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
        triggerFetchGSInstances(prop$).subscribe({
            next: () => { },
            error: () => { },
            complete: () => {
                axios.interceptors.request.eject(inter);
            }
        });
    });
});
