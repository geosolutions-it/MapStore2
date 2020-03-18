/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Rx from 'rxjs';
import { error, success } from '../actions/notifications';
import { SAVE_USER_SESSION, LOAD_USER_SESSION, REMOVE_USER_SESSION,
    userSessionSaved, userSessionLoaded, loading, saveUserSession, userSessionRemoved } from "../actions/usersession";
import { createResource, createCategory, updateResource, getResourceDataByName, getResourceIdByName, deleteResource } from '../api/persistence';
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
 * const epic = saveUserSessionEpicCreator(nameSelector, sessionSelector, idSelector)
 * setInterval(() => dispatch({type: SAVE_USER_SESSION}), 60 * 1000)
 */
export const saveUserSessionEpicCreator = (nameSelector, sessionSelector, idSelector = () => {}) => (action$, store) => action$
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

/**
 * Returns an epic that saves a user session (dispatching the saveUserSession action creator)
 * at defined intervals.
 * It can be started and stopped by two specific actions (configurable).
 *
 * @param {string} startAction the action type that will start saving of the user sessions
 * @param {string} endAction the action type that will stop saving of the user sessions
 * @param {number} frequency interval between saves (in milliseconds)
 * @param {function} finalAction optional action creator emitted after stop
 */
export const autoSaveSessionEpicCreator = (startAction, endAction, frequency, finalAction) => (action$) => action$
    .ofType(startAction)
    .switchMap(() => Rx.Observable.interval(frequency)
        .switchMap(() => Rx.Observable.of(saveUserSession()))
        .takeUntil(action$.ofType(endAction)).concat(finalAction ? Rx.Observable.of(finalAction()) : Rx.Observable.empty())
    );

/**
 * Returns an epic that loads the user session, triggered by a LOAD_USER_SESSION action.
 *
 * @param {function} nameSelector selector that builds the session identifier
 */
export const loadUserSessionEpicCreator = (nameSelector) => (action$, store) =>
    action$.ofType(LOAD_USER_SESSION).switchMap(({name}) => {
        const state = store.getState();
        const sessionName = name || nameSelector(state);
        return Rx.Observable.forkJoin(
            getResourceIdByName("USERSESSION", sessionName),
            getResourceDataByName("USERSESSION", sessionName)
        ).switchMap(([id, session]) => Rx.Observable.of(
            userSessionLoaded(id, session)
        ))
            .let(wrapStartStop(
                loading(true, 'userSessionLoading'),
                loading(false, 'userSessionLoading'),
                () => Rx.Observable.of(userSessionLoaded(undefined, undefined))
            ));
    });

/**
 * Returns a user session remove epic.
 * The epic triggers on a REMOVE_USER_SESSION action.
 *
 * @param {function} idSelector selector of the identifier for the current session (to be removed)
 * @example
 *
 * const idSelector = (state) => ({state.usersession.id})
 * const epic = removeUserSessionEpicCreator(idSelector)
 */
export const removeUserSessionEpicCreator = (idSelector) => (action$, store) =>
    action$.ofType(REMOVE_USER_SESSION).switchMap(() => {
        const state = store.getState();
        const sessionId = idSelector(state);
        return deleteResource({id: sessionId}).switchMap(() => Rx.Observable.of(userSessionRemoved(), success({
            title: "success",
            message: "userSession.successRemoved"
        })));
    }).let(wrapStartStop(
        loading(true, 'userSessionRemoving'),
        loading(false, 'userSessionRemoving'),
        () => Rx.Observable.of(error({
            title: 'userSession.removeErrorNotification.titleContext',
            message: 'userSession.removeErrorNotification.defaultMessage',
            position: "tc",
            autoDismiss: 5
        }))
    ));
