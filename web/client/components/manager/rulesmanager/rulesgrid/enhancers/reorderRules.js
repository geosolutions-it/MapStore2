/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Rx = require("rxjs");
const samePages = ({pages: oP}, {pages: nP}) => oP === nP;
const { moveRules } = require('../../../../../observables/rulesmanager');

/**
 * Function that converts stream of a reorder rules into action that updates geofence
 * @param {Observable} Stream of props.
 * @return {Observable} Stream of props to trigger the data fetch
 */
module.exports = () => (prop$) =>
    prop$.distinctUntilChanged((oP, nP) => samePages(oP, nP))
        .switchMap(({ orderRule$, setLoading, setData, onLoadError, pages}) =>
            orderRule$
                .switchMap(({rules, targetPriority}) => {
                    setData({pages, editing: true});
                    setLoading(true);
                    return moveRules(targetPriority, rules)
                        .catch((e) => Rx.Observable.of({
                            error: e
                        }).do(() => onLoadError({
                            title: "rulesmanager.errorTitle",
                            message: "rulesmanager.errorMovingRules"
                        })).do(() => setLoading(false)))
                        .do(() => setData({pages: []}));
                }
                ));
