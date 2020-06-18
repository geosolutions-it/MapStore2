/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Rx from 'rxjs';
import { setControlProperty } from '../actions/controls';
import { mapHasPendingChangesSelector } from '../selectors/mapsave';
import { hasPendingChanges as storyHasPendingChanges } from '../selectors/geostory';

import { feedbackMaskSelector } from '../selectors/feedbackmask';

import { LOGOUT } from '../actions/security';
import { CHECK_PENDING_CHANGES } from '../actions/pendingChanges';
import { LOCATION_CHANGE } from 'connected-react-router';


/**
 * When CHECK_PENDING_CHANGES is triggered, checks current status of the resource to check if it has pending changes to save.
 * If any, triggers to show confirm message.
 * Otherwise, if any, triggers the action passed in CHECK_PENDING_CHANGES action.
 */
export const comparePendingChanges = (action$, { getState = () => { } }) =>
    action$
        .ofType(CHECK_PENDING_CHANGES)
        .switchMap(({ action, source }) => {
            const state = getState();

            const { currentPage } = feedbackMaskSelector(state);

            // TODO: avoid to specify the check and the reset event here, provide them externally to generalize this support.
            const isMapToSave = currentPage === 'viewer' && mapHasPendingChangesSelector(state);
            const isStoryToSave = currentPage === 'geostory' && storyHasPendingChanges(state);
            if (isMapToSave || isStoryToSave) {
                return Rx.Observable.of(
                    setControlProperty('unsavedMap', 'enabled', true),
                    setControlProperty('unsavedMap', 'source', source, false)
                ).merge(
                    // reset on location change
                    action$.ofType(LOCATION_CHANGE, LOGOUT).take(1).switchMap(() =>
                        Rx.Observable.of(
                            setControlProperty('unsavedMap', 'enabled', false),
                            setControlProperty('unsavedMap', 'source', undefined)
                        )
                    ));
            }
            return action ? Rx.Observable.of(action) : Rx.Observable.empty();
        });
