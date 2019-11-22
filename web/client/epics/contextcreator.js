/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';
import {omit} from 'lodash';
import {push} from 'connected-react-router';
import {SAVE_CONTEXT, LOAD_CONTEXT, contextSaved, setResource, startResourceLoad,
    loadFinished, contextLoadError, loading} from '../actions/contextcreator';
import {newContextSelector, resourceSelector} from '../selectors/contextcreator';
import {wrapStartStop} from '../observables/epics';
import {isLoggedIn} from '../selectors/security';
import {show, error} from '../actions/notifications';
import {createResource, updateResource, getResource} from '../api/persistence';

const saveContextErrorStatusToMessage = (status) => {
    switch (status) {
    case 409:
        return 'contextCreator.saveErrorNotification.conflict';
    default:
        return 'contextCreator.saveErrorNotification.defaultMessage';
    }
}

export const saveContextResource = (action$, store) => action$
    .ofType(SAVE_CONTEXT)
    .exhaustMap(({destLocation}) => {
        const state = store.getState();
        const context = newContextSelector(state);
        const resource = resourceSelector(state);
        const newResource = resource ? {
            ...omit(resource, 'name', 'description'),
            data: context,
            metadata: {
                name: context && context.name || resource && resource.name,
                description: resource.description
            }
        } : {
            category: 'CONTEXT',
            data: context,
            metadata: {
                name: context && context.name
            }
        };
        return (resource ? updateResource : createResource)(newResource)
            .switchMap(rid => Rx.Observable.of(
                contextSaved(rid),
                push(destLocation || `/context/${context.name}`),
                show({
                    title: "saveDialog.saveSuccessTitle",
                    message: "saveDialog.saveSuccessMessage"
                })
            ))
            .catch(({status, data}) => Rx.Observable.of(error({
                title: 'contextCreator.saveErrorNotification.title',
                message: saveContextErrorStatusToMessage(status),
                position: "tc",
                autoDismiss: 5,
                values: {
                    data
                }
            })));
    });

export const contextCreatorLoadContext = (action$, store) => action$
    .ofType(LOAD_CONTEXT)
    .switchMap(({id}) => (id === 'new' ?
        Rx.Observable.empty() :
        Rx.Observable.of(startResourceLoad())
            .concat(getResource(id).switchMap(resource => Rx.Observable.of(setResource(resource)))))
        .concat(Rx.Observable.of(loadFinished()))
        .let(
            wrapStartStop(
                loading(true, "loading"),
                loading(false, "loading"),
                e => {
                    let message = `context.errors.context.unknownError`;
                    if (e.status === 403) {
                        message = `context.errors.context.pleaseLogin`;
                        if (isLoggedIn(store.getState())) {
                            message = `context.errors.context.notAccessible`;
                        }
                    } if (e.status === 404) {
                        message = `context.errors.context.notFound`;
                    }
                    // prompt login should be triggered here
                    return Rx.Observable.of(contextLoadError({error: {...e.originalError, message}}));
                }
            )
        )
    );
