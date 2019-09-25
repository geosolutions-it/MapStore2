/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {Observable} from 'rxjs';
import {find} from 'lodash';
import {
    loadMedia,
    loadMediaSuccess,
    saveMediaSuccess,
    setAddingMedia,
    setEditingMedia,
    selectItem,
    CHOOSE_MEDIA,
    HIDE,
    LOAD_MEDIA,
    SAVE_MEDIA,
    SHOW,
    SELECT_MAP
} from '../actions/mediaEditor';
import { editResource, addResource } from '../actions/geostory';

import { currentMediaTypeSelector, editingSelector, sourceIdSelector } from '../selectors/mediaEditor';
import { resourcesSelector } from '../selectors/geostory';

import mediaAPI from '../api/media';

export const loadMediaEditorDataEpic = (action$, store) =>
    // TODO: NOW IS TRIGGERED ON SHOW because we can not select the source and the media type yet.
    // final version should get mediaType and sourceId from settings, for show (ok for LOAD_MEDIA)
    // now we have only one type/source, so I trigger directly the load of it
    action$.ofType(SHOW, LOAD_MEDIA)
    .switchMap(() => {
        const sourceId = sourceIdSelector(store.getState());
        return mediaAPI(sourceId).load(store) // store is required for local data (e.g. local geostory data)
            .switchMap(results =>
                Observable.from(
                    results.map(r => loadMediaSuccess({
                        mediaType: r.mediaType,
                        sourceId: r.sourceId,
                        params: {mediaType: r.mediaType},
                        resultData: {resources: r.resources}
                    }))
                )
            );
    });

/**
 * Handles save|updates media events:
 * - API callback
 * - Success action emission
 * - close add form
 * - reload data of the updated source
 * @memberof epics.mediaEditor
 * @param {Observable} action$ stream of actions
 * @param {object} store redux store
 */
export const editorSaveUpdateMediaEpic = (action$, store) =>
    action$.ofType(SAVE_MEDIA)
    .switchMap(({mediaType = "image", source, data}) => {
        const editing = editingSelector(store.getState());
        const sourceId = sourceIdSelector(store.getState());
        const handler = editing ?
            mediaAPI(sourceId).edit(mediaType, source, data, store) :
            mediaAPI(sourceId).save(mediaType, source, data, store);
        const feedbackAction = editing ? setEditingMedia(false) : setAddingMedia(false);
        return handler // store is required both for some custom auth, or to dispatch actions in case of local
            // TODO: saving state (for loading spinners), errors
            .switchMap(({id}) => {
                return Observable.of(
                    saveMediaSuccess({mediaType, source, data, id}),
                    feedbackAction,
                    loadMedia(undefined, mediaType, source),
                    selectItem(id)
                );
            });
    }
   );

export const saveMapEpic = (action$, store) =>
    action$.ofType(SELECT_MAP)
    .switchMap(({map}) => {
        return action$.ofType(CHOOSE_MEDIA)
            .switchMap(() => {
                const mediaType = currentMediaTypeSelector(store.getState());
                const alreadyPresent = find(resourcesSelector(store.getState()), {id: map.id});
                return Observable.of(
                    alreadyPresent ? editResource(map.id, mediaType, map) : addResource(map.id, mediaType, map)
                );
            }).takeUntil(action$.ofType(HIDE));
    }
);

