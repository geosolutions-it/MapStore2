/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const scrollStream = require('../scrollStream');
const Rx = require("rxjs");
describe('rulegrid scrollStream', () => {
    it('generate pages request', (done) => {
        const moreRules = (pagesRequest) => {
            expect(pagesRequest).toExist();
            expect(pagesRequest.pagesToLoad).toExist();
            expect(pagesRequest.pagesToLoad).toEqual([0, 1]);
            expect(pagesRequest.startPage).toBe(0);
            expect(pagesRequest.endPage).toBe(1);
            expect(pagesRequest.pages).toEqual({});
            done();
        };
        const onGridScroll$ = Rx.Observable.of({ firstRowIdx: 0, lastRowIdx: 10});
        const prop$ = Rx.Observable.of({ size: 10, moreRules, pages: {}, rowsCount: 50, vsOverScan: 5, scrollDebounce: 50, onGridScroll$});
        scrollStream(prop$).subscribe(() => {});
    });
});
