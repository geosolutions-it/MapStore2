/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const virtualScrollFetch = require('../virtualScrollFetch');
const Rx = require("rxjs");
const ConfigUtils = require("../../../../../../utils/ConfigUtils");
ConfigUtils.setConfigProp("geoFenceUrl", "base/web/client/test-resources/");
const axios = require('../../../../../../libs/ajax');
const interceptors = (config) => {
    if (config.url === "base/web/client/test-resources/geofence/rest/rules") {
        config.url = "base/web/client/test-resources/geofence/rest/rules.xml";
    }
    return config;
};

describe('rulegrid virtulaScrollFetch', () => {
    it('generate pages request', (done) => {
        const inter = axios.interceptors.request.use(interceptors);
        const onLoad = ({pages}) => {
            axios.interceptors.request.eject(inter);
            expect(pages).toExist();
            expect(pages[0]).toExist();
            expect(pages[0].length).toBe(5);
            done();
        };
        const onLoadError = () => {
            axios.interceptors.request.eject(inter);
        };
        const pages$ = Rx.Observable.of({ pagesToLoad: [0], startPage: 0, endPage: 0, pages: {}});
        const prop$ = Rx.Observable.of({size: 5,
            maxStoredPages: 5,
            filters: {},
            onLoad,
            moreRules: () => {},
            setLoading: () => {},
            onLoadError
        });
        virtualScrollFetch(pages$)(prop$).subscribe(() => {});
    });
});
