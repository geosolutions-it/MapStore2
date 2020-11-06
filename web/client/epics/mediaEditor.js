/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {Observable} from 'rxjs';
import uuid from 'uuid';
import findKey from 'lodash/findKey';

import {
    loadMedia,
    loadMediaSuccess,
    saveMediaSuccess,
    setAddingMedia,
    setEditingMedia,
    selectItem,
    updateItem,
    setMediaService,
    LOAD_MEDIA,
    SAVE_MEDIA,
    SHOW,
    ADDING_MEDIA,
    EDITING_MEDIA,
    IMPORT_IN_LOCAL,
    REMOVE_MEDIA,
    SET_MEDIA_TYPE,
    SET_MEDIA_SERVICE,
    SELECT_ITEM,
    loadingSelectedMedia,
    loadingMediaList
} from '../actions/mediaEditor';

import { HIDE, SAVE, hide as hideMapEditor, SHOW as MAP_EDITOR_SHOW} from '../actions/mapEditor';

import { editingSelector, selectedIdSelector, sourceIdSelector, currentMediaTypeSelector, currentResourcesSelector, selectedItemSelector, sourcesSelector, selectedSourceSelector} from '../selectors/mediaEditor';
import {MediaTypes } from '../utils/GeoStoryUtils';
import {SourceTypes} from '../utils/MediaEditorUtils';

import mediaAPI from '../api/media';

export const loadMediaEditorDataEpic = (action$, store) =>
    action$.ofType(SHOW, LOAD_MEDIA, SET_MEDIA_TYPE, SET_MEDIA_SERVICE)
        .switchMap((action) => {
            const state = store.getState();
            const sourceId = action.sourceId || sourceIdSelector(state);
            const mediaType = action.mediaType || currentMediaTypeSelector(state);
            const resources = currentResourcesSelector(store.getState()) || [];
            const selectedId = selectedIdSelector(state);
            const pageSize = 10;
            const page = action.params?.page ? action.params.page : 1;
            const params = {
                ...action.params,
                page,
                pageSize
            };
            const currentResources = page === 1
                ? []
                : resources;
            const source = {
                ...selectedSourceSelector(state),
                store
            };
            return mediaAPI(source).load({
                mediaType,
                sourceId,
                params,
                selectedId
            })
                .switchMap(resultData => {
                    return resultData
                        ? Observable.of(loadMediaSuccess({
                            mediaType,
                            sourceId,
                            params: {
                                ...params,
                                mediaType
                            },
                            resultData: {
                                ...resultData,
                                resources: [
                                    ...currentResources,
                                    ...resultData.resources
                                ]
                            }
                        }))
                        :  Observable.empty();
                })
                .startWith(loadingMediaList());
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
            const sourceOptions = {
                ...selectedSourceSelector(store.getState()),
                store
            };
            const handler = editing ?
                mediaAPI(sourceOptions).edit({ mediaType, source, data }) :
                mediaAPI(sourceOptions).save({ mediaType, source, data });
            const feedbackAction = editing ? setEditingMedia(false) : setAddingMedia(false);
            return handler // store is required both for some custom auth, or to dispatch actions in case of local
                // TODO: saving state (for loading spinners), errors
                .switchMap(({id}) => {
                    return Observable.of(
                        saveMediaSuccess({mediaType, source, data, id}),
                        feedbackAction,
                        selectItem(id)
                    );
                });
        });
/**
 * Handles new map creation
 * On map save:
 * Store created map in geostory
 * select it
 * hide mapEditor
 * On cancel:
 * Stops adding media
 * @memberof epics.mediaEditor
 * @param {Observable} action$ stream of actions
 * @param {object} store redux store
 */
export const mediaEditorNewMap = (action$, {getState} ) =>
    action$.ofType(MAP_EDITOR_SHOW)
        .filter(({owner, map}) => owner === 'mediaEditor' && !map)
        .switchMap(() => {
            const switchToEditStream = action$.ofType(SAVE).switchMap(({map}) => {
                const currentResources = currentResourcesSelector(getState()) || [];
                const resId = uuid();
                return Observable.from([loadMediaSuccess({
                    mediaType: MediaTypes.MAP,
                    sourceId: SourceTypes.GEOSTORY,
                    params: {mediaType: MediaTypes.MAP},
                    resultData: {resources: [{ id: resId, type: 'map', data: {type: 'map', id: resId, ...map}}, ...currentResources], totalCount: currentResources.length + 1}}),
                selectItem(resId),
                hideMapEditor()]);
            }).takeUntil(action$.ofType(HIDE));
            const cancelStream = action$.ofType(HIDE).map(() => setAddingMedia(false)).takeUntil(action$.ofType(SAVE));
            return Observable.merge(cancelStream, switchToEditStream);
        });
/**
* Handles map editing
* On map save:
* update current selected item
* hide mapEditor
* On cancel:
* Stops adding media
* @memberof epics.mediaEditor
* @param {Observable} action$ stream of actions
* @param {object} store redux store
*/
export const mediaEditorEditMap = (action$, {getState}) =>
    action$.ofType(MAP_EDITOR_SHOW)
        .filter(({owner, map}) => owner === 'mediaEditor' && !!map)
        .switchMap(() => action$.ofType(SAVE)
            .switchMap(({map: editedMap}) => {
                const selectedItems = selectedItemSelector(getState());
                return Observable.from([updateItem({...selectedItems, data: {...editedMap}}, "replace"), hideMapEditor()]);
            })
            .takeUntil(action$.ofType(HIDE))
        );

/**
 * Reload local geostory media on close editing or adding media
 * @memberof epics.mediaEditor
 * @param {Observable} action$ stream of actions
 * @param {object} store redux store
 */
export const reloadMediaResources = (action$, {getState}) =>
    action$.ofType(EDITING_MEDIA, ADDING_MEDIA)
        .filter(({editing = true, adding = true}) => editing === false || adding === false)
        .map(() => loadMedia(undefined, currentMediaTypeSelector(getState()), SourceTypes.GEOSTORY));

/**
 * Handle the import of a resource from en external source to local source
 * @memberof epics.mediaEditor
 * @param {Observable} action$ stream of actions
 * @param {object} store redux store
 */

export const importInLocalSource = (action$, store) =>
    action$.ofType(IMPORT_IN_LOCAL)
        .switchMap(({resource, sourceType}) => {
            const sources = sourcesSelector(store.getState());
            const sourceId = findKey(sources, ({type}) => sourceType === type);
            const source = {
                ...sources[sourceId],
                store
            };
            const handler = mediaAPI(source).save({ mediaType: resource.type, source: sources[sourceId], data: resource });
            return handler // store is required both for some custom auth, or to dispatch actions in case of local
                // TODO: saving state (for loading spinners), errors
                .switchMap(({id}) => {
                    return Observable.of(
                        setMediaService(sourceId),
                        saveMediaSuccess({mediaType: resource.type, source: sources[sourceId], data: resource, id}),
                        loadMedia(undefined, resource.type, sourceId),
                        selectItem(id)
                    );
                });
        });

/**
 * It handles the edit of a remote map (GOSTORE). On mapEditor save the map is saved in local store, the media service switched to local,
 * the local media reloaded, the saved map selected and the mapEditor hidden.
 * @memberof epics.mediaEditor
 * @param {Observable} action$  actions stream
 * @param {*} application store
 */
export const editRemoteMap = (action$, store) =>
    action$.ofType(MAP_EDITOR_SHOW).filter(({owner, map}) => owner === 'mediaEditorEditRemote' && !!map)
        .switchMap(({map: {data: resource} = {}} = {}) => {
            return action$.ofType(SAVE).switchMap(({map}) => {
                const sources = sourcesSelector(store.getState());
                const sourceId = findKey(sources, ({type}) => SourceTypes.GEOSTORY === type);
                const source = {
                    ...sources[sourceId],
                    store
                };
                const handler = mediaAPI(source).save({ mediaType: resource.type, source: sources[sourceId], data: { ...resource, ...map} });
                return handler.switchMap(({id}) =>
                    Observable.of(
                        setMediaService(sourceId),
                        saveMediaSuccess({mediaType: resource.type, source: sources[sourceId], data: resource, id}),
                        loadMedia(undefined, resource.type, sourceId),
                        selectItem(id),
                        hideMapEditor()
                    ));
            }).takeUntil(action$.ofType(HIDE));
        });

/**
 * Handles delete media events:
 * - API callback
 * - reload data of the updated source
 * @memberof epics.mediaEditor
 * @param {Observable} action$ stream of actions
 * @param {object} store redux store
 */
export const removeMediaEpic = (action$, store) =>
    action$.ofType(REMOVE_MEDIA)
        .switchMap(({mediaType}) => {
            const source = {
                ...selectedSourceSelector(store.getState()),
                store
            };
            const handler = mediaAPI(source).remove({ mediaType });
            return handler
                .switchMap(() => {
                    return Observable.of(
                        loadMedia(undefined, currentMediaTypeSelector(store.getState()), SourceTypes.GEOSTORY));
                });
        });
/**
 * Handles selection of a media item and update the data if needed
 * @memberof epics.mediaEditor
 * @param {Observable} action$ stream of actions
 * @param {object} store redux store
 */
export const updateSelectedItem = (action$, store) =>
    action$.ofType(SELECT_ITEM)
        .switchMap(() => {
            const state = store.getState();
            const selectedItem = selectedItemSelector(state);
            const source = {
                ...selectedSourceSelector(store.getState()),
                store
            };
            return mediaAPI(source).getData({ selectedItem })
                .switchMap((response) => {
                    return response === null
                        ? Observable.of(
                            loadingSelectedMedia(false)
                        )
                        : Observable.of(
                            updateItem({ ...selectedItem, data: { ...response }}, 'replace'),
                            loadingSelectedMedia(false)
                        );
                })
                .catch(() => {
                    return Observable.of(
                        loadingSelectedMedia(false)
                    );
                })
                .startWith(
                    loadingSelectedMedia(true)
                );
        });
