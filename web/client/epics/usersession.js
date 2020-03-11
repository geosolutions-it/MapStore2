/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Rx from 'rxjs';
import { error } from '../actions/notifications';
import { SAVE_USER_SESSION, userSessionSaved, loading, saveUserSession } from "../actions/usersession";
import { createResource, createCategory, updateResource } from '../api/persistence';
import {userSelector} from '../selectors/security';
import { wrapStartStop } from '../observables/epics';
import isString from "lodash/isString";

const saveUserSessionErrorStatusToMessage = (status) => {
    switch (status) {
    default:
        return 'userSession.saveErrorNotification.defaultMessage';
    }
};

/**
 * Returns a user session save epic.
 * The epic triggers on a SAVE_USER_SESSION action.
 *
 * @param {function} nameSelector selector that builds the session identifier
 * @param {*} sessionSelector selector that builds the session object to save
 * @param {*} idSelector selector of the identifier for the current session (if it already exists)
 * @example
 *
 * const nameSelector = (state) => ({state.context.name + "." + state.security.user.name})
 * const sessionSelector = (state) => ({state.map.present})
 * const idSelector = (state) => ({state.usersession.id})
 * const epic = saveUserSessionEpic(nameSelector, sessionSelector, idSelector)
 * setInterval(() => dispatch({type: SAVE_USER_SESSION}), 60 * 1000)
 */
export const saveUserSessionEpic = (nameSelector, sessionSelector, idSelector = () => {}) => (action$, store) => action$
    .ofType(SAVE_USER_SESSION)
    .switchMap(() => {
        const state = store.getState();
        const session = sessionSelector(state);
        const resource = {
            category: 'USERSESSION',
            data: session,
            metadata: {
                name: nameSelector(state),
                attributes: {
                    user: userSelector(state).name
                }
            }
        };
        const id = idSelector(state);
        return (id ? updateResource({
            ...resource,
            id
        }) : createResource(resource)).switchMap(rid => {
            return Rx.Observable.of(
                userSessionSaved(rid, session)
            );
        })
            .let(wrapStartStop(
                loading(true, 'userSessionSaving'),
                loading(false, 'userSessionSaving'),
                ({ status, data }, stream$) => {
                    if (status === 404 && isString(data) && data.indexOf('Resource Category not found') > -1) {
                        return createCategory('USERSESSION').switchMap(() => stream$.skip(1))
                            .catch(() => Rx.Observable.of(error({
                                title: 'userSession.saveErrorNotification.titleContext',
                                message: 'userSession.saveErrorNotification.categoryError',
                                position: "tc",
                                autoDismiss: 5,
                                values: {
                                    categoryName: 'USERSESSION'
                                }
                            })));
                    }
                    return Rx.Observable.of(error({
                        title: 'userSession.saveErrorNotification.titleContext',
                        message: saveUserSessionErrorStatusToMessage(status),
                        position: "tc",
                        autoDismiss: 5,
                        values: {
                            data
                        }
                    }));
                }
            ));
    });

export const startStopUserSessionSaveEpic = (startAction, endAction, frequency) => (action$) => action$
    .ofType(startAction)
    .switchMap(() => Rx.Observable.interval(frequency).switchMap(() => Rx.Observable.of(saveUserSession())))
    .takeUntil(action$.ofType(endAction));
