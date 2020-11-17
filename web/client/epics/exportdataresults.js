/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import { LOCATION_CHANGE } from 'connected-react-router';

import {
    SHOW_INFO_BUBBLE_MESSAGE,
    ADD_EXPORT_DATA_RESULT,
    REMOVE_EXPORT_DATA_RESULT,
    UPDATE_EXPORT_DATA_RESULT,
    CHECK_EXPORT_DATA_ENTRIES,
    SERIALIZE_COOKIE,
    showInfoBubble,
    setInfoBubbleMessage,
    setExportDataResults,
    removeExportDataResults,
    checkingExportDataEntries,
    serializeCookie
} from '../actions/exportdataresults';
import {
    LOGIN_SUCCESS,
    LOGOUT
} from '../actions/security';
import {
    MAP_CONFIG_LOADED
} from '../actions/config';

import {
    exportDataResultsSelector
} from '../selectors/exportdataresults';
import {
    isLoggedIn,
    userSelector
} from '../selectors/security';

import { getExecutionStatus } from '../observables/wps/execute';
import { interceptOGCError } from '../utils/ObservableUtils';

const restoreExportDataResultsFromCookie = (state) => {
    const user = userSelector(state);

    if (user?.id) {
        const cookies = document.cookie.split(';');
        const userExportDataResultsCookie = cookies.filter(cookie => cookie.indexOf(`exportDataResults_${user.id}=`) > -1)[0];

        if (userExportDataResultsCookie) {
            const { results } = JSON.parse(decodeURIComponent(userExportDataResultsCookie.split('=')[1]));
            return Observable.of(setExportDataResults(results.filter(({status}) => status !== 'pending')));
        }
    }

    return Observable.empty();
};

export const showInfoBubbleMessageEpic = (action$) => action$
    .ofType(SHOW_INFO_BUBBLE_MESSAGE)
    .concatMap((action = {}) => Observable.of(setInfoBubbleMessage(action.msgId, action.msgParams, action.level), showInfoBubble(true)).delay(10) // the delay is to ensure that transition animation always triggers
        .concat(Observable.of(showInfoBubble(false)).delay(action.duration || 3000))
        .concat(Observable.empty().delay(1000)/* this is set to the duration of css transition animation in exportdataresults.less*/));

export const checkExportDataEntriesEpic = (action$, store) => action$
    .ofType(CHECK_EXPORT_DATA_ENTRIES)
    .exhaustMap(() => {
        const state = store.getState();
        const results = exportDataResultsSelector(state) || [];
        const validResults = results.filter(({status}) => status === 'completed');

        return validResults.length > 0 ? Observable.forkJoin(validResults
            .map((validResult) => {
                const { result } = validResult;
                const executionIdStart = result.indexOf('executionId=');
                const executionIdSlice = result.slice(executionIdStart);
                const executionIdEnd = executionIdSlice.indexOf('&');
                const executionId = (executionIdEnd > -1 ? executionIdSlice.slice(0, executionIdEnd) : executionIdSlice).slice(12);
                const urlEnd = result.indexOf('?');
                const url = result.slice(0, urlEnd);

                return getExecutionStatus(url, executionId)
                    .let(interceptOGCError)
                    .catch(() => {
                        return Observable.of(null);
                    })
                    .map(reqResult => !reqResult ? validResult.id : null);
            })
        ).flatMap(checkedResults => {
            return Observable.of(
                removeExportDataResults(checkedResults.filter(res => !!res)),
                serializeCookie(),
                checkingExportDataEntries(false)
            );
        }).startWith(checkingExportDataEntries(true)) : Observable.empty();
    });

export const serializeCookieOnExportDataChange = (action$, store) => action$
    .ofType(ADD_EXPORT_DATA_RESULT, REMOVE_EXPORT_DATA_RESULT, UPDATE_EXPORT_DATA_RESULT, SERIALIZE_COOKIE)
    .filter(() => isLoggedIn(store.getState()))
    .do(() => {
        const state = store.getState();
        const results = exportDataResultsSelector(state);
        const { id } = userSelector(state);

        const json = JSON.stringify({results});

        document.cookie = `exportDataResults_${id}=${encodeURIComponent(json)}`;
    })
    .flatMap(() => Observable.empty());

export const resetExportDataResultsOnLogout = (action$) => action$
    .ofType(MAP_CONFIG_LOADED)
    .switchMap(() => action$
        .ofType(LOGOUT)
        .switchMap(() => Observable.of(setExportDataResults([])))
        .takeUntil(action$.ofType(LOCATION_CHANGE))
    );

export const setExportDataResultsOnLoginSuccessAndMapConfigLoaded = (action$, store) => action$
    .ofType(MAP_CONFIG_LOADED)
    .switchMap(() => restoreExportDataResultsFromCookie(store.getState()).concat(action$
        .ofType(LOGIN_SUCCESS)
        .switchMap(() => restoreExportDataResultsFromCookie(store.getState()))
        .takeUntil(action$.ofType(LOCATION_CHANGE))
    ));
