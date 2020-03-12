/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';
import { push } from 'connected-react-router';

import {
    CREATE_NEW_MAP,
    loading,
    showNewMapDialog,
    hasContexts
} from '../actions/createnewmap';
import { MAPS_LOAD_MAP } from '../actions/maps';

import { mapTypeSelector } from '../selectors/maptype';

import { getResources } from '../api/persistence';
import { wrapStartStop } from '../observables/epics';

export const checkContextsOnMapLoad = (action$) => action$
    .ofType(MAPS_LOAD_MAP)
    .switchMap(() => getResources({
        category: 'CONTEXT',
        options: {
            params: {
                start: 0,
                limit: 1
            }
        }
    }).map(response => response.totalCount)
        .switchMap((totalCount = 0) => Rx.Observable.of(hasContexts(totalCount > 0)))
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
