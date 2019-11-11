/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';
import {SAVE_CONTEXT, contextSaved} from '../actions/contextcreator';
import {newContextSelector} from '../selectors/contextcreator';
import {push} from 'connected-react-router';
import {show, error} from '../actions/notifications';
import {createResource} from '../api/persistence';

export const saveContextResource = (action$, store) => action$
    .ofType(SAVE_CONTEXT)
    .exhaustMap(() => {
        const state = store.getState();
        const context = newContextSelector(state);
        const newResource = {
            category: 'CONTEXT',
            data: context,
            metadata: {
                name: context && context.name
            }
        };
        return createResource(newResource)
            .switchMap(rid => Rx.Observable.of(
                contextSaved(rid),
                push(`/context/id/${rid}`),
                show({
                    title: "saveDialog.saveSuccessTitle",
                    message: "saveDialog.saveSuccessMessage"
                })
            ))
            .catch(({message}) => Rx.Observable.of(error({
                title: 'contextCreator.saveErrorNotification.title',
                message: message || 'contextCreator.saveErrorNotification.defaultMessage',
                position: "tc",
                autoDismiss: 5
            })));
    });
