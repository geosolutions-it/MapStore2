/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Function that converts a stream of a scrollEvent into page requestes
 * @param {Observable} Stream of props.
 * @return {Observable} Stream of props to trigger the data fetch
 */

const {getPagesToLoad} = require('../../../../../utils/RulesGridUtils');

const sameRowsCount = ({rowsCount: oR}, {rowsCount: nR}) => oR === nR;
const samePages = ({pages: oP}, {pages: nP}) => oP === nP;

module.exports = ($props) => {
    return $props.distinctUntilChanged((oP, nP) => sameRowsCount(oP, nP) && samePages(oP, nP))
        .switchMap(({ size, moreRules, pages, rowsCount, vsOverScan = 5, scrollDebounce = 50, onGridScroll$ }) => {
            return onGridScroll$.filter(() => rowsCount !== 0)
                .debounceTime(scrollDebounce)
                .map(({ firstRowIdx, lastRowIdx }) => {
                    const fr = firstRowIdx - vsOverScan < 0 ? 0 : firstRowIdx - vsOverScan;
                    const lr = lastRowIdx + vsOverScan > rowsCount - 1 ? rowsCount - 1 : lastRowIdx + vsOverScan;
                    const startPage = Math.floor(fr / size);
                    const endPage = Math.floor(lr / size);
                    return {pagesToLoad: getPagesToLoad(startPage, endPage, pages), startPage, endPage, pages};
                })
                .filter(({pagesToLoad}) => pagesToLoad.length > 0)
                .do((p) => moreRules(p));
        });
};
