/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';

import { loadGSInstances } from '../../../../../../observables/rulesmanager';

const sameFilter = (f1, {filters: f2}) => f1 === f2;
const sameVersion = (f1, {version: f2}) => f1 === f2;

/**
 * Function that converts stream of a GSInstancesGrid props to trigger data fetch events, It gets the rules count
 * @param {Observable} Stream of props.
 * @return {Observable} Stream of props to trigger the data fetch
 */
export default ($props) => {
    return $props.distinctUntilChanged(
        ({filters, version}, newProps) => sameVersion(version, newProps) && sameFilter(filters, newProps))
        .switchMap(({setLoading, onLoad, onLoadError = () => { }}) => {
            setLoading(true);
            return loadGSInstances()
                .do(() => setLoading(false))
                .do((rowsCount) => onLoad({...rowsCount}))
                .catch((e) => Rx.Observable.of({
                    error: e
                }).do(() => onLoadError({
                    title: "rulesmanager.errorTitle",
                    message: "rulesmanager.errorLoadingRules"
                })).do(() => setLoading(false)));
        }
        );
};
