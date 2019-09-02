/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import {isNaN, isString, isNil, isObject} from 'lodash';

import axios from '../libs/ajax';

import {
    ADD,
    LOAD_GEOSTORY,
    loadingGeostory,
    loadGeostoryError,
    setCurrentStory,
    update
} from '../actions/geostory';
import {
    show,
    HIDE,
    EDIT_MEDIA,
    CHOOSE_MEDIA,
    selectItem
} from '../actions/mediaEditor';
import { error } from '../actions/notifications';

import { isLoggedIn } from '../selectors/security';
import { resourceIdSelectorCreator } from '../selectors/geostory';

import { wrapStartStop } from '../observables/epics';
import { ContentTypes, SectionTypes } from '../utils/GeoStoryUtils';

/**
 * opens the media editor for new image with content type media is passed
 * then it waits for chose media for updating the resourceId
 * @param {*} action$
 */
export const openMediaEditorForNewMedia = action$ =>
    action$.ofType(ADD)
        .filter(({ element }) => element.type === ContentTypes.MEDIA)
        .switchMap(({path: arrayPath, element}) => {
            return Observable.of(
                    show('geostory') // open mediaEditor
                )
                .merge(
                    action$.ofType(CHOOSE_MEDIA)
                        .switchMap( ({resource = {}}) => {
                            let mediaPath = "";
                            if (element.type === SectionTypes.MEDIA && arrayPath === "sections") {
                                mediaPath = "contents[0].contents[0]";
                            }
                            return Observable.of(
                                update(`${arrayPath}[{"id":"${element.id}"}]${mediaPath}`, {
                                    resourceId: resource.id,
                                    type: element.type || "image" }, "merge" )// TODO take type from mediaEditor state or from resource
                                );
                        })
                        .takeUntil(action$.ofType(HIDE))
                );
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
            const state = store.getState();
            const resourceId = resourceIdSelectorCreator(path)(state);
            return Observable.of(
                    show(owner), // open mediaEditor
                    selectItem(resourceId)
                )
                .merge(
                    action$.ofType(CHOOSE_MEDIA)
                        .switchMap( ({resource = {}}) => {
                            return Observable.of(
                                update(`${path}.resourceId`, resource.id )
                                );
                        })
                        .takeUntil(action$.ofType(HIDE))
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
                if (isNaN(parseInt(id, 10))) {
                    return axios.get(`configs/${id}.json`);
                }
                // TODO manage load process from external api
                return axios.get(`configs/sampleStory.json`);
            })
            .map(({ data }) => {
                if (isObject(data)) {
                    return setCurrentStory(data);
                }
                if (isString(data)) {
                    return setCurrentStory(JSON.parse(data));
                }
                return setCurrentStory({});
            })
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
