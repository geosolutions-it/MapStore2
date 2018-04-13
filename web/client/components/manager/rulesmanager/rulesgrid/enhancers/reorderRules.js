/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Rx = require("rxjs");
const sameRowsCount = ({rowsCount: oR}, {rowsCount: nR}) => oR === nR;
const { moveRules } = require('../../../../../observables/rulesmanager');

/**
 * Function that converts stream of a reorder rules into action that updates geofence
 * @param {Observable} Stream of props.
 * @return {Observable} Stream of props to trigger the data fetch
 */
module.exports = (page$) => (prop$) =>
    prop$.distinctUntilChanged((oP, nP) => sameRowsCount(oP, nP))
        .switchMap(({ orderRule$, setLoading, onLoadError, moreRules}) =>
                orderRule$.withLatestFrom(page$, (orderRequest, lastPagesRequest) => ({
                    ...orderRequest,
                    lastPagesRequest
                }))
                .switchMap(({rules, targetPriority, lastPagesRequest}) => {
                    setLoading(true);
                    return moveRules(targetPriority, rules)
                    .do(() => {
                        const {startPage, endPage} = lastPagesRequest;
                        const pagesToLoad = [];
                        for (let i = startPage; i <= endPage; i++) {
                            pagesToLoad.push(i);
                        }
                        setLoading(false);
                        moreRules({startPage, endPage, pagesToLoad, pages: {}});
                    })
                    .catch((e) => Rx.Observable.of({
                        error: e
                    }).do(() => onLoadError({
                        title: "rulesmanager.errorTitle",
                        message: "rulesmanager.errorMovingRules"
                    })).do(() => setLoading(false)));
                }
));
