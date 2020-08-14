/* eslint-disable indent */
/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import head from 'lodash/head';
import isNaN from 'lodash/isNaN';
import isString from 'lodash/isString';
import isNil from 'lodash/isNil';
import lastIndexOf from 'lodash/lastIndexOf';
import words from 'lodash/words';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import { push, LOCATION_CHANGE } from 'connected-react-router';
import uuid from 'uuid/v1';

import axios from '../libs/ajax';

const {
    createResource,
    updateResource,
    getResource
} = require('../api/persistence');

import {
    ADD,
    ADD_RESOURCE,
    LOAD_GEOSTORY,
    SET_RESOURCE,
    MOVE,
    REMOVE,
    SAVE,
    SAVED,
    addResource,
    add,
    geostoryLoaded,
    loadGeostory,
    loadingGeostory,
    loadGeostoryError,
    remove,
    setCurrentStory,
    saveGeoStoryError,
    setControl,
    setResource,
    setEditing,
    storySaved,
    update,
    setFocusOnContent,
    setPendingChanges,
    UPDATE,
    CHANGE_MODE,
    SET_WEBPAGE_URL,
    EDIT_WEBPAGE,
    EDIT_RESOURCE,
    UPDATE_CURRENT_PAGE,
    UPDATE_SETTING,
    SET_CURRENT_STORY
} from '../actions/geostory';
import { setControlProperty } from '../actions/controls';

import {
    show as showMediaEditor,
    HIDE,
    EDIT_MEDIA,
    CHOOSE_MEDIA,
    selectItem,
    setMediaType,
    hide
} from '../actions/mediaEditor';
import { show, error } from '../actions/notifications';

import { LOGIN_SUCCESS, LOGOUT } from '../actions/security';


import { isLoggedIn, isAdminUserSelector } from '../selectors/security';
import {
     resourceIdSelectorCreator,
     createPathSelector,
     currentStorySelector,
     resourcesSelector,
     getFocusedContentSelector,
     isSharedStory,
     resourceByIdSelectorCreator,
     modeSelector,
     updateUrlOnScrollSelector
} from '../selectors/geostory';
import { currentMediaTypeSelector, sourceIdSelector} from '../selectors/mediaEditor';

import { wrapStartStop } from '../observables/epics';
import { scrollToContent, ContentTypes, isMediaSection, Controls, getEffectivePath, getFlatPath, isWebPageSection, MediaTypes, Modes, parseHashUrlScrollUpdate } from '../utils/GeoStoryUtils';

import { SourceTypes } from './../utils/MediaEditorUtils';

import { HIDE as HIDE_MAP_EDITOR, SAVE as SAVE_MAP_EDITOR, hide as hideMapEditor, SHOW as MAP_EDITOR_SHOW} from '../actions/mapEditor';


const updateMediaSection = (store, path) => action$ =>
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
            } else if (isEmpty(resource)) {
                actions = [...actions, remove(`${path}`), hide()];
            }  else {
            // if the resource is new, add it to the story resources list
                resourceId = uuid();
                actions = [...actions, addResource(resourceId, mediaType, resource)];
            }
            let media = mediaType === MediaTypes.MAP ? {resourceId, type: mediaType, map: undefined} : {resourceId, type: mediaType};
            actions = [...actions, update(`${path}`, media, "merge" ), hide()];
            return Observable.from(actions);
        });

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
            let mediaPath = "";
            if (isMediaSection(element) && arrayPath === "sections") {
                        mediaPath = ".contents[0].contents[0]";
            }
            const path = `${arrayPath}[{"id":"${element.id}"}]${mediaPath}`;
            return Observable.of(
                showMediaEditor('geostory') // open mediaEditor
            )
                .merge(
                    action$.let(updateMediaSection(store, path)),
                    action$.ofType(HIDE)
                        .switchMap(() => {
                            return Observable.of(remove(
                                path));
                        }).takeUntil(action$.ofType(UPDATE))
                ).takeUntil(action$.ofType(EDIT_MEDIA));
        });

const updateWebPageSection = path => action$ =>
    action$.ofType(SET_WEBPAGE_URL)
        .switchMap(({ src }) => {
            return Observable.of(
                update(`${path}`, { src, editURL: false }, 'merge'),
            );
        });

    /**
     * Epic that handles opening webPageCreator and saves url of WebPage component
     * @param {Observable} action$ stream of redux action
     */
export const openWebPageComponentCreator = action$ =>
    action$.ofType(ADD)
        .filter(({ element = {} }) => {
            const isWebPage = element.type === ContentTypes.WEBPAGE && element.editURL !== false;
            return isWebPage || isWebPageSection(element);
        })
        .switchMap(({ path: arrayPath, element }) => {
            let mediaPath = '';
            if (isWebPageSection(element) && arrayPath === "sections") {
                mediaPath = ".contents[0].contents[0]";
            }
            const path = `${arrayPath}[{"id":"${element.id}"}]${mediaPath}`;
            return Observable.of(update(path, { editURL: true }, 'merge'))
                .merge(action$.let(updateWebPageSection(path)))
                .takeUntil(action$.ofType(EDIT_WEBPAGE));
        });

export const editWebPageComponent = action$ =>
    action$.ofType(EDIT_WEBPAGE)
        .switchMap(({ path }) => {
            return Observable.of(update(path, { editURL: true }, 'merge'))
                .merge(action$.let(updateWebPageSection(path)))
                .takeUntil(action$.ofType(ADD));
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
            const resource = resourceByIdSelectorCreator(selectedResource)(store.getState());
            return Observable.of(currentMediaTypeSelector(store.getState()))
            .filter((mediaType) => {
                return resource && resource.type !== mediaType;
            })
            .map(() => setMediaType(resource.type)).merge(
                Observable.of(
                    showMediaEditor(owner),
                    selectItem(selectedResource)
                )
                          .merge(
                    action$.let(updateMediaSection(store, path))
                        .takeUntil(action$.ofType(HIDE, ADD)
                        )
                ));
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
    .switchMap( ({id}) => {
        return Observable.defer(() => {
            if (id && isNaN(parseInt(id, 10))) {
                return axios.get(`configs/${id}.json`)
                    // not return anything else that data in this case
                    // to match with data/resource object structure of getResource
                    .then(({data}) => {
                        // generates random id for section
                        const defaultSections = data.sections;
                        const sectionsWithId = isArray(defaultSections)
                            && defaultSections.map(section => ({ ...section, id: uuid()}));
                        const newData = sectionsWithId.length ? {
                            ...data,
                            sections: sectionsWithId
                        } : data;
                        return ({ data: newData, isStatic: true, canEdit: true });
                    });
            }
            return getResource(id);
        })
            .do(({data}) => {
                if (!data) {
                    throw Error("Wrong data format");
                }
                return true;
            })
            .switchMap(({ data, isStatic = false, ...resource }) => {
                const state = getState();
                const isAdmin = isAdminUserSelector(state);
                const user = isLoggedIn(state);

                const story = isString(data) ? JSON.parse(data) : data;
                if (!user && isNaN(parseInt(id, 10))) {
                    return Observable.of(loadGeostoryError({status: 403}));
                }

                const isEditMode = modeSelector(state) === Modes.EDIT;

                return Observable.from([
                    // initialize editing only for new or static sources
                    // or verify if user can edit when current mode is equal to EDIT
                    ...(isStatic || isEditMode
                        ? [ setEditing((resource && resource.canEdit || isAdmin)) ]
                        : []),
                    geostoryLoaded(id),
                    setCurrentStory(story),
                    setResource(resource)
                ]);
            })
            // adds loading status to the start and to the end of the stream and handles exceptions
            .let(wrapStartStop(
                loadingGeostory(true, "loading"),
                loadingGeostory(false, "loading"),
                e => {
                    let message = "geostory.errors.loading.unknownError";
                    if (e.status === 403 ) {
                        message = "geostory.errors.loading.pleaseLogin";
                        if (isLoggedIn(getState()) || isSharedStory(getState())) {
                            // TODO only in view mode
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
            .startWith(setCurrentStory({}));
    });
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
 * @param {object} store simplified redux store
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

/**
 * trigger actions for sorting in GeostoryEditor
 * @param {Observable} action$ stream of redux actions
 * @param {object} store simplified redux store
 * @returns {Observable} a stream that emits actions for sorting
 */
export const sortContentEpic = (action$, {getState = () => {}}) =>
    action$.ofType(MOVE).switchMap(({source, target, position}) => {
        const state = getState();
        const current = createPathSelector(source)(state);

        // remove first so, the highlight works correctly
        return Observable.of(
            remove(source),
            add(target, position, current)
        );
    });
/**
 * trigger actions for focus a map on map editing
 * @param {Observable} action$ stream of redux actions
 * @returns {Observable} a stream that emits actions setting focus on content
 */
export const setFocusOnMapEditing = (action$, {getState = () =>{}}) =>
         action$.ofType(UPDATE).filter(({path = ""}) => path.endsWith("editMap"))
     .map(({path: rowPath, element: status}) => {
            const {flatPath, path} = getFlatPath(rowPath, currentStorySelector(getState()));
            const target = flatPath.pop();
            const section = flatPath.shift();
            const hideContent = path[path.length - 2] === "background";
            const selector = hideContent && `#${section.id} .ms-section-background-container` || `#${target.id}`;
            scrollToContent(target.id);

            return setFocusOnContent(status, target, selector, hideContent, rowPath.replace(".editMap", ""));
     });

/**
* Handles map editing from inline editor
* On map save:
* update current edited map in current story resources
* hide mapEditor,
* toggle inline map editor
* @memberof epics.mediaEditor
* @param {Observable} action$ stream of actions
* @param {object} store redux store
*/
export const inlineEditorEditMap = (action$, {getState}) =>
    action$.ofType(MAP_EDITOR_SHOW)
        .filter(({owner, map}) => owner === 'inlineEditor' && !!map)
        .switchMap(() => {
            return action$.ofType(SAVE_MAP_EDITOR)
            .switchMap(({map}) => {
                const {path} = getFocusedContentSelector(getState());
                return  Observable.of(update(`${path}.map`, map), update(`${path}.editMap`, false), hideMapEditor())
                        .takeUntil(action$.ofType(HIDE_MAP_EDITOR));
            });
        });


export const closeShareOnGeostoryChangeMode = action$ =>
    action$.ofType(CHANGE_MODE)
        .switchMap(() => Observable.of(setControlProperty('share', 'enabled', false)));

/**
 * Handles changes on GeoStory to show the pending changes prompt
 */
export const handlePendingGeoStoryChanges = action$ =>
        Observable.merge(
            // when load an existing geostory
            action$.ofType(LOAD_GEOSTORY).switchMap(() => action$.ofType(SET_RESOURCE))
        ).switchMap( () =>
            // listen to modification events
            action$.ofType(
                    ADD,
                    UPDATE,
                    REMOVE,
                    ADD_RESOURCE,
                    EDIT_RESOURCE,
                    UPDATE_SETTING
                )
                // TODO: compare to exclude no-ops (e.g. update by click)
                .take(1)
                .switchMap( () =>
                    // set the flag for pending changes
                    Observable.of(setPendingChanges(true)).concat(
                        // and reset it when one of these actions is performed.
                        action$.ofType(
                            SAVED, LOCATION_CHANGE, LOGOUT
                        )
                        .take(1)
                            .switchMap(() => Observable.of(setPendingChanges(false)))
                    )
            )
    );

/**
 * Handle the url updates on currentPage change
 * @param {Observable} action$ stream of actions
 * @param {object} store redux store
 */
export const urlUpdateOnScroll = (action$, {getState}) =>
    action$.ofType(UPDATE_CURRENT_PAGE)
        .debounceTime(50) // little delay if too many UPDATE_CURRENT_PAGE actions come
        .switchMap(({sectionId, columnId}) => {
            if (
                modeSelector(getState()) !== 'edit' && (!!columnId || !!sectionId)
                && updateUrlOnScrollSelector(getState())
            ) {
                const storyId = get(getState(), 'geostory.resource.id');
                const newUrl = parseHashUrlScrollUpdate(window.location.href, window?.location?.hash, storyId, sectionId, columnId);
                if (newUrl) {
                    history.pushState(null, '', newUrl);
                }
        }
            return Observable.empty();
        });

/**
 * When story is loaded, scrolls down to the element from the URL
 * @param {Observable} action$ stream of actions
 */
export const scrollOnLoad = (action$) =>
    action$.ofType(SET_CURRENT_STORY)
        .switchMap(() => {
            const storyIds = window?.location?.hash?.split('/');
            if (window?.location?.hash?.includes('shared')) {
                scrollToContent(storyIds[7] || storyIds[5], {block: "start", behavior: "auto"});
            } else if (storyIds.length > 5) {
                scrollToContent(storyIds[6], {block: "start", behavior: "auto"});
            } else if (storyIds.length === 5) {
                scrollToContent(storyIds[4], {block: 'start', behavior: "auto"});
            }
            return Observable.empty();
    });

/**
 * Loads geostory on POP history
 * @param {Observable} action$ stream of actions
 */
export const loadStoryOnHistoryPop = (action$) =>
    action$.ofType(LOCATION_CHANGE)
        .switchMap(({payload}) => {
            const hasGeostory = payload?.location?.pathname.includes('/geostory/');
            if (hasGeostory && payload.action === 'POP') {
                const separatedUrl = words(payload?.location?.pathname);
                return separatedUrl.find(i=> i === 'shared')
                    ? Observable.of(loadGeostory(separatedUrl[2])).delay(500)
                    : Observable.of(loadGeostory(separatedUrl[1])).delay(500);
            }
            return Observable.empty();
        });

/**
 * Handle the scroll of section preview in the sidebar
 * @memberof epics.mediaEditor
 * @param {Observable} action$ stream of actions
 * @param {object} store redux store
 */
export const scrollSideBar = (action$, {getState}) =>
    action$.ofType(UPDATE_CURRENT_PAGE)
        .filter(({columnId, sectionId}) => modeSelector(getState()) === 'edit' && (!!columnId || !!sectionId))
        .debounceTime(50) // little delay if too many UPDATE_CURRENT_PAGE actions come
        .switchMap(() => {
            /* We need to select the most inner highlighted element of the preview list
             * The selector will query all the highlighted elements and the pop will extract
             * the most inner (i.e a section content column in an immersive section)
             */
            return Observable.of(Array.from(document.querySelectorAll(".ms-geostory-builder .mapstore-side-card.ms-highlight")).pop())
                .filter(el => !!el)
                .withLatestFrom(
                    Observable.of(document.querySelector(".ms-geostory-builder .ms2-border-layout-body"))
                    .filter(scrollable => !!scrollable)
                )
                .map(([el, scrollable]) => {
                    const scroll = function() {
                        const {top, bottom} = el.getBoundingClientRect();
                        const {top: cTop, bottom: cBottom} = scrollable.getBoundingClientRect();
                        if (top < cTop) {
                            scrollable.scrollBy({top: (top - cTop) - 10, behavior: 'smooth'});
                        } else if (bottom > cBottom) {
                            scrollable.scrollBy({top: (bottom - cBottom) + 10, behavior: 'smooth'});
                        }
                    };
                    return scroll;
                })
                .do(scroll => window.requestAnimationFrame(scroll))
                .ignoreElements();
        });
