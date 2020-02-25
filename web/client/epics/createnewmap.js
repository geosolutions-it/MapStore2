/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';
import { values } from 'lodash';
import { push } from 'connected-react-router';

import {
    SHOW_NEW_MAP_DIALOG,
    CREATE_NEW_MAP,
    setContexts,
    loading,
    showNewMapDialog
} from '../actions/createnewmap';

import { mapTypeSelector } from '../selectors/maptype';

import { getResources } from '../api/persistence';
import { wrapStartStop } from '../observables/epics';

export const loadContextsOnNewMapEpic = (action$) => action$
    .ofType(SHOW_NEW_MAP_DIALOG)
    .filter(({show}) => show)
    .switchMap(() => getResources({
        category: 'CONTEXT',
        options: {
            params: {
                start: 0,
                limit: 10000
            }
        }
    }).map(response => response.totalCount === 1 ? [response.results] : values(response.results))
        .switchMap(contexts => Rx.Observable.of(setContexts(contexts)))
        .let(wrapStartStop(
            loading(true, 'newMapDialog'),
            loading(false, 'newMapDialog'),
            () => Rx.Observable.empty()
        ))
    );

export const createNewMapEpic = (action$, store) => action$
    .ofType(CREATE_NEW_MAP)
    .switchMap(({context}) => {
        const state = store.getState();
        const mapType = mapTypeSelector(state);

        return Rx.Observable.of(
            showNewMapDialog(false),
            push("/viewer/" + mapType + "/new" + (context ? `/context/${context.id}` : ''))
        );
    });
