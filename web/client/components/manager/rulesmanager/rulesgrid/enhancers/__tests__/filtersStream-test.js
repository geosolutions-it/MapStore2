/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const filtersStream = require('../filtersStream');
const Rx = require("rxjs");
describe('rulegrid filterStream', () => {
    it('debounce addFilter$', (done) => {
        const setFilters = (filter) => {
            expect(filter).toExist();
            expect(filter).toBe("WFS");
            done();
        };
        const addFilter$ = Rx.Observable.from(["WF", "WFS"]);
        const prop$ = Rx.Observable.of({setFilters, addFilter$});
        filtersStream(prop$).subscribe(() => {});
    });
});
