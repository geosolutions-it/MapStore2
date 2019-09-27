/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {Observable} from 'rxjs';
import {
    loadMedia,
    loadMediaSuccess,
    saveMediaSuccess,
    setAddingMedia,
    setEditingMedia,
    selectItem,
    LOAD_MEDIA,
    SAVE_MEDIA,
    SHOW
} from '../actions/mediaEditor';

import { editingSelector, sourceIdSelector } from '../selectors/mediaEditor';

import mediaAPI from '../api/media';

export const loadMediaEditorDataEpic = (action$, store) =>
    // TODO: NOW IS TRIGGERED ON SHOW because we can not select the source and the media type yet.
    // final version should get mediaType and sourceId from settings, for show (ok for LOAD_MEDIA)
    // now we have only one type/source, so I trigger directly the load of it
    action$.ofType(SHOW, LOAD_MEDIA)
    .switchMap(() => {
        return mediaAPI("geostory").load(store) // store is required for local data (e.g. local geostory data)
            .switchMap(results =>
                results && Observable.from(
                    results.map(r => loadMediaSuccess({
                        mediaType: r.mediaType,
                        sourceId: r.sourceId,
                        params: {mediaType: r.mediaType},
                        resultData: {resources: r.resources, totalCount: r.totalCount}
                    }))
                ) || Observable.empty()
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
