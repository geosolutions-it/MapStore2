
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
 * @param {Function} domainArgs function that returns an object with the settings and params for the getDomainValues request
 * @param {Boolean} useBuffer if set to true applies or removes 1 millisecond buffer to current time
 * @param {Function} getState function that returns the current state
 * @param {String} snapType in case of time intervals whether snapping is set to "start" or "end"
 * @param {String} time the submitted time to claculate the domains for
 * @returns {[String, String]} [previous, next] next and previous time domains of the submitted reference time
 */
export const getTimeDomainsObservable = (domainArgs, useBuffer, getState, snapType, time) => (
    // TODO: find out a way to optimize and do only one request
    Rx.Observable.forkJoin(
        getDomainValues(...domainArgs(getState, { sort: "asc", fromValue: useBuffer ? getBufferedTime(time, 0.0001, 'remove') : time, ...(snapType === 'end' ? {fromEnd: true} : {}) }))
            .map(res => res.DomainValues.Domain.split(","))
            .map(([tt]) => tt).catch(err => err && Rx.Observable.of(null)),
        getDomainValues(...domainArgs(getState, { sort: "desc", fromValue: useBuffer ? getBufferedTime(time, 0.0001, 'add') : time, ...(snapType === 'end' ? {fromEnd: true} : {}) }))
            .map(res => res.DomainValues.Domain.split(","))
            .map(([tt]) => tt).catch(err => err && Rx.Observable.of(null))
    )
);
