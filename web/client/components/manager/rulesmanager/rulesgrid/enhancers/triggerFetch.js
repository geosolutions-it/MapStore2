/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';

const sameFilter = (f1, {filters: f2}) => f1 === f2;
const sameVersion = (f1, {version: f2}) => f1 === f2;
import { getCount } from '../../../../../observables/rulesmanager';

/**
 * Function that converts stream of a RulesGrid props to trigger data fetch events, It gets the rules count
 * @param {Observable} Stream of props.
 * @return {Observable} Stream of props to trigger the data fetch
 */
export default ($props) => {
    return $props.distinctUntilChanged(
        ({filters, version}, newProps) => sameVersion(version, newProps) && sameFilter(filters, newProps))
        .switchMap(({filters, setLoading, onLoad, onLoadError = () => { }}) => {
            setLoading(true);
            return getCount(filters)
                .do(() => setLoading(false))
            // TODO: bring this conversion inside the API
                .do((rowsCount) => onLoad({pages: {}, rowsCount}))
                .catch((e) => Rx.Observable.of({
                    error: e
                }).do(() => onLoadError({
                    title: "rulesmanager.errorTitle",
                    message: "rulesmanager.errorLoadingRules"
                })).do(() => setLoading(false)));
        }
        );
};
