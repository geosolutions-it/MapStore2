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
const ConfigUtils = require("../../../../../../utils/ConfigUtils");
ConfigUtils.setConfigProp("geoFenceUrl", "base/web/client/test-resources/");
describe('rulegrid triggerFetch', () => {
    it('get count', (done) => {
        const onLoad = ({pages, rowsCount}) => {
            expect(pages).toEqual({});
            expect(rowsCount).toBe(10);
            done();
        };
        const prop$ = Rx.Observable.of({version: 0, filters: {}, setLoading: () => {}, onLoad, onLoadError: () => { }});
        triggerFetch(prop$).subscribe(() => {});
    });
});
