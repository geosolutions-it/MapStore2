/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import {head, isNaN, isString, isNil, lastIndexOf} from 'lodash';
import { push, LOCATION_CHANGE } from 'connected-react-router';
import uuid from 'uuid/v1';

import axios from '../libs/ajax';

const {
    createResource,
    updateResource,
    getResource
} = require('../api/persistence');

import {
    addResource,
    ADD,
    REMOVE,
    LOAD_GEOSTORY,
    loadGeostory,
    loadingGeostory,
    loadGeostoryError,
    setCurrentStory,
    saveGeoStoryError,
    storySaved,
    setControl,
    setResource,
    update,
    remove,
    SAVE,
    geostoryLoaded
} from '../actions/geostory';

import {
    show as showMediaEditor,
    HIDE,
    EDIT_MEDIA,
    CHOOSE_MEDIA,
    selectItem
} from '../actions/mediaEditor';
import { show, error } from '../actions/notifications';

import { LOGIN_SUCCESS, LOGOUT } from '../actions/security';


import { isLoggedIn } from '../selectors/security';
import { resourceIdSelectorCreator, createPathSelector, currentStorySelector, resourcesSelector} from '../selectors/geostory';
import { currentMediaTypeSelector, sourceIdSelector} from '../selectors/mediaEditor';

import { wrapStartStop } from '../observables/epics';
import { scrollToContent, ContentTypes, isMediaSection, Controls } from '../utils/GeoStoryUtils';

import { getEffectivePath } from '../reducers/geostory';
import { SourceTypes } from './../utils/MediaEditorUtils';


/**
 * opens the media editor for new image with content type media is passed
 * then it waits for chose media for updating the resourceId
 * @param {*} action$
 */
export const openMediaEditorForNewMedia = (action$, store) =>
    action$.ofType(ADD)
        .filter(({ element = {} }) => {
            const isMediaContent = element.type === ContentTypes.MEDIA;
            return isMediaContent || isMediaSection(element);
        })
        .switchMap(({path: arrayPath, element}) => {
            return Observable.of(
                showMediaEditor('geostory') // open mediaEditor
            )
                .merge(
                    action$.ofType(CHOOSE_MEDIA, HIDE)
                        .switchMap( ({type, resource = {}}) => {
                            let mediaPath = "";
                            if (isMediaSection(element) && arrayPath === "sections") {
                                mediaPath = ".contents[0].contents[0]";
                            }
                            const path = `${arrayPath}[{"id":"${element.id}"}]${mediaPath}`;
                            // if HIDE then update only the type but not the resource, this allows to use placeholder
                            return type === HIDE ?
                                Observable.of(
                                    update(
                                        path,
                                        { type: currentMediaTypeSelector(store.getState()) },
                                        "merge" )
                                ) :
                                Observable.of(
                                    update(
                                        path,
                                        { resourceId: resource.id, type: currentMediaTypeSelector(store.getState()) }, // TODO take type from mediaEditor state or from resource
                                        "merge"
                                    )
                                );
                        })
                        .takeUntil(action$.ofType(EDIT_MEDIA))
                );
        });


/**
 * Epic that handles the save story workflow. It uses persistence
 * @param {Observable} action$ stream of redux action
 */
export const saveGeoStoryResource = action$ => action$
    .ofType(SAVE)
    // delay is for speed up tests, not part of the SAVE action
    .exhaustMap(({ resource, delay = 1000 } = {}) =>
        (!resource.id ? createResource(resource) : updateResource(resource))
            .switchMap(rid => Observable.of(
                storySaved(rid),
                setControl(Controls.SHOW_SAVE, false),
                !resource.id
                    ? push(`/geostory/${rid}`)
                    : loadGeostory(rid),
            ).merge(
                Observable.of(show({
                    id: "STORY_SAVE_SUCCESS",
                    title: "saveDialog.saveSuccessTitle",
                    message: "saveDialog.saveSuccessMessage"
                })).delay(!resource.id ? delay : 0) // delay to allow loading
            )
            )
            .let(wrapStartStop(
                loadingGeostory(true, "loading"),
                loadingGeostory(false, "loading")
            ))
            .catch(
                ({ status, statusText, data, message, ...other } = {}) => Observable.of(saveGeoStoryError(status ? { status, statusText, data } : message || other), loadingGeostory(false, "loading"))
            )
    );
/**
 * side effect to scroll to new sections
 * it tries for max 10 times with an interval of 200 ms between each
 * @param {*} action$
 */
export const scrollToContentEpic = action$ =>
    action$.ofType(ADD)
        .switchMap(({element}) => {
            return Observable.of(element)
                .switchMap(() => {
                    if (!document.getElementById(element.id)) {
                        const err = new Error("Item not mounted yet");
                        throw err;
                    } else {
                        scrollToContent(element.id, {behavior: "auto", block: "center"});
                        return Observable.empty();
                    }
                })
                .retryWhen(errors => errors.delay(200).take(10));
        });


/**
 * opens the media editor with current media as the selected one
 * then it updates the resourceId reference of that content
 * @param {*} action$
 * @param {*} store
 */
export const editMediaForBackgroundEpic = (action$, store) =>
    action$.ofType(EDIT_MEDIA)
        .switchMap(({path, owner}) => {
            const selectedResource = resourceIdSelectorCreator(path)(store.getState());
            return Observable.of(
                showMediaEditor(owner),
                selectItem(selectedResource)
            )
                .merge(
                    action$.ofType(CHOOSE_MEDIA)
                        .switchMap( ({resource = {}}) => {
                            let actions = [];
                            const state = store.getState();
                            const mediaType = currentMediaTypeSelector(state);
                            const sourceId = sourceIdSelector(state);

                            // if resources comes from geostory the id is at root level
                            // otherwise it checks for the original resource id present in data
                            const resourceAlreadyPresent = head(resourcesSelector(state).filter(r => r.data && (sourceId !== SourceTypes.GEOSTORY && r.data.id || r.id) === resource.id));

                            let resourceId = resource.id;
                            if (resourceAlreadyPresent) {
                                resourceId = resourceAlreadyPresent.id;
                            } else {
                                // if the resource is new, add it to the story resources list
                                resourceId = uuid();
                                actions = [...actions, addResource(resourceId, mediaType, resource)];
                            }

                            actions = [...actions, update(`${path}`, {resourceId, type: mediaType}, "merge" )];
                            return Observable.from(actions);
                        })
                        .takeUntil(action$.ofType(HIDE, ADD)
                        )
                );
        });
/**
 * Load a story configuration from local files
 * it is triggered by LOAD_GEOSTORY action type
 * if the name provided is not present then return the default one (sampleStory.json)
 * @param {*} action$ the actions
 * @param {object} store
 */
export const loadGeostoryEpic = (action$, {getState = () => {}}) => action$
    .ofType(LOAD_GEOSTORY)
    .switchMap( ({id}) =>
        Observable.defer(() => {
            if (id && isNaN(parseInt(id, 10))) {
                return axios.get(`configs/${id}.json`)
                    // not return anything else that data in this case
                    // to match with data/resource object structure of getResource
                    .then(({data}) => ({data}));
            }
            return getResource(id);
        })
            .do(({data}) => {
                if (!data) {
                    throw Error("Wrong data format");
                }
                return true;
            })
            .switchMap(({ data, ...resource }) =>
                Observable.of(
                    geostoryLoaded(id),
                    setCurrentStory(isString(data) ? JSON.parse(data) : data),
                    setResource(resource)
                )
            )
            // adds loading status to the start and to the end of the stream and handles exceptions
            .let(wrapStartStop(
                loadingGeostory(true, "loading"),
                loadingGeostory(false, "loading"),
                e => {
                    let message = "geostory.errors.loading.unknownError";
                    if (e.status === 403 ) {
                        message = "geostory.errors.loading.pleaseLogin";
                        if (isLoggedIn(getState())) {
                            message = "geostory.errors.loading.geostoryNotAccessible";
                        }
                    } else if (e.status === 404) {
                        message = "geostory.errors.loading.geostoryDoesNotExist";
                    } else if (isNil(e.status)) {
                        // manage generic errors like json parse errors (syntax errors)
                        message = e.message;
                    }
                    return Observable.of(
                        error({
                            title: "geostory.errors.loading.title",
                            message
                        }),
                        setCurrentStory({}),
                        loadGeostoryError({...e, messageId: message})
                    );
                }
            ))
    );
/**
 * Triggers reload of last loaded story when user login-logout
 * @param {Observable} action$ the stream of redux actions
 */
export const reloadGeoStoryOnLoginLogout = (action$) =>
    action$.ofType(LOAD_GEOSTORY).switchMap(
        ({ id }) => action$
            .ofType(LOGIN_SUCCESS, LOGOUT)
            .switchMap(() => Observable.of(loadGeostory(id)).delay(500))
            .takeUntil(action$.ofType(LOCATION_CHANGE))
    );

/**
 * Removes containers that are empty after a REMOVE action from GeoStory.
 * In case of nested contents, it could call recursively until all the empty containers are empty
 * @param {Observable} action$ stream of redux actions
 * @param {object} store simplified redux store redux store
 * @returns {Observable} a stream that emits remove action for the container, if empty.
 */
export const cleanUpEmptyStoryContainers = (action$, {getState = () => {}}) =>
    action$.ofType(REMOVE).switchMap(({path: rawPath}) => {
        // find out the lower container (has contents property) in the path
        const effectivePath = getEffectivePath(rawPath, currentStorySelector(getState()));
        const containerIndex = lastIndexOf(effectivePath, "contents");
        if (containerIndex > 0) {
            const containerPath = effectivePath.splice(0, containerIndex);
            const container = createPathSelector(containerPath.join('.'))(getState());
            // if empty contents, remove it
            if (container && container.contents && container.contents.length === 0) {
                return Observable.of(remove(containerPath.join('.')));
            }
        }
        return Observable.empty();
    });
