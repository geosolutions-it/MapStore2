
/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Rx from 'rxjs';

import { getDomainValues } from '../api/MultiDim';
import { getBufferedTime } from '../utils/TimeUtils';

/**
 * Creates an observable that gets the nearest time domains for the selected layer in timeline redux state.
 * **note**: this function should be moved in utils and refactored to not take domainArgs and state,but only the arguments to send and override.
 * @param {Function} domainArgs function that returns an object with the settings and params for the getDomainValues request
 * @param {Boolean} useBuffer if set to true applies or removes 1 millisecond buffer to current time
 * @param {Function} getState function that returns the current state
 * @param {String} snapType in case of time intervals whether snapping is set to "start" or "end"
 * @param {String} time the submitted time to calculate the domains for
 * @returns {Observable<[String, String]>} an observable that emits an array with the nearest time values in domain.
 */
export const getNearestTimesObservable = (domainArgs, useBuffer, getState, snapType, time) =>
    Rx.Observable.forkJoin(
        getDomainValues(...domainArgs(getState, { sort: "asc", limit: 1, ...(time && {fromValue: useBuffer ? getBufferedTime(time, 0.001, 'remove') : time}), ...(snapType === 'end' ? {fromEnd: true} : {}) }))
            .map(res => res.DomainValues.Domain.split(","))
            .map(([tt]) => tt).catch(err => err && Rx.Observable.of(null)),
        getDomainValues(...domainArgs(getState, { sort: "desc", limit: 1, ...(time && {fromValue: useBuffer ? getBufferedTime(time, 0.001, 'add') : time}), ...(snapType === 'end' ? {fromEnd: true} : {}) }))
            .map(res => res.DomainValues.Domain.split(","))
            .map(([tt]) => tt).catch(err => err && Rx.Observable.of(null))
    );
