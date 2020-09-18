/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { get, isString, isNumber, findIndex, find, isPlainObject, isArray, castArray, uniqBy } from "lodash";
import { set, unset, arrayUpdate, compose,
    arrayDelete } from '../utils/ImmutableUtils';
import { getEffectivePath, MediaTypes } from '../utils/GeoStoryUtils';

import {
    ADD,
    ADD_RESOURCE,
    CHANGE_MODE,
    CLEAR_SAVE_ERROR,
    EDIT_RESOURCE,
    LOADING_GEOSTORY,
    REMOVE,
    SAVED,
    SAVE_ERROR,
    SET_CURRENT_STORY,
    SELECT_CARD,
    SET_CONTROL,
    SET_RESOURCE,
    TOGGLE_CARD_PREVIEW,
    TOGGLE_CONTENT_FOCUS,
    TOGGLE_SETTING,
    TOGGLE_SETTINGS_PANEL,
    UPDATE,
    UPDATE_CURRENT_PAGE,
    UPDATE_SETTING,
    REMOVE_RESOURCE,
    SET_PENDING_CHANGES,
    SET_UPDATE_URL_SCROLL
} from '../actions/geostory';


/**
 * Return the index of the where to place an item.
 * If the position is a string, return the index after the item found inside the array (0 if not found)
 * If the position is a number, return the number or the min between the number and max of the array
 * If the position is undefined returns the next index of the array
 * @private
 * @param {object[]} array array of items
 * @param {string|number} position the ID of the item or the index
 * @returns {number} the index where to insert the new element
 */
const getIndexToInsert = (array, position) => {
    const sectionsSize = array.length;
    let index = 0;
    // no position means append
    if (!position && position !== 0) {
        index = sectionsSize;
    }
    // if position is a string, is the ID of the section before the place we want to insert. By default 0;
    if (isString(position)) {
        index = findIndex(
            array,
            { id: position }
        ) + 1;
    } else if (isNumber(position)) {
        index = Math.min(position, array.length);
    }
    return index;
};

const getContentsByResourceId = (rId, path, {contents, background, id, resourceId}) => {
    let cts = [];
    let localPath = path + `{"id": "${id}"}]`;
    if (resourceId === rId) {
        return [localPath];
    }
    if (background && background.resourceId === rId) {
        cts.push(localPath + ".background");
    }
    if (contents) {
        return contents.reduce((acc, e) => [...acc, ...getContentsByResourceId(rId, localPath + ".contents[", e)],
            cts);
    }
    return cts;
};

let INITIAL_STATE = {
    mode: 'view', // TODO: change in to Modes.VIEW
    isCollapsed: false,
    focusedContent: {},
    currentPage: {},
    settings: {},
    oldSettings: {},
    updateUrlOnScroll: false
};

/**
 * Reducer that manage state for geostory plugins. Example:
 * @memberof reducers
 * @function
 * @name geostory
 * @param state the application state
 * @param {string} state.mode the mode ('view' or 'edit')
 * @param {object} state.currentStory the current story.
 * @param {boolean} state.updateUrlOnScroll should update URL on scroll
 *
 * @example
 * {
 *     "mode": "edit", // 'edit' or 'view',
 *     "defaultSettings": {
 *       "isLogoEnabled": false,
 *       "isTitleEnabled": false,
 *       "isNavbarEnabled": false
 *     },
 *     "currentStory": {
 *      "resources": [] // resources (media) of the story
 *     // sections
 *     "sections": [
 *       {
 *         "type": "paragraph", // each session has a type
 *         "id": "SomeID",
 *         "title": "Abstract",
 *         // depending on the type, session can have one or more contents
 *         "contents": [
 *           {
 *             "id": "SomeID",
 *             "type": "text", // each content must have a type
 *             "background": {}, // and each content can have a background
 *             "html": "<p>this is some html content</p>"
 *           }
 *         ]
 *       },
 *       {
 *         "type": "immersive",
 *         "id": "SomeID2",
 *         "title": "Abstract",
 *         "contents": [
 *           {
 *             "id": "col1",
 *             "type": "column",
 *             "background": {},
 *             "contents": [{"type": "text"}, {"type": "media" }]
 *             ]
 *           },
 *           {
 *             "id": "col2",
 *             "type": "column",
 *             "background": {},
 *             "contents": [{"type": "text"}, {"type": "media" }]
 *           }
 *         ]
 *       }
 *     ]
 *   },
 *   "resource": {} // original resource of the story. Contains access info (id, canSave, canDelete...)
 *   "loading": true,
 *   "loadingFlags": {} // contains specific loading entries (saving, loading...)
 *   "errors": {} // contains errors if happened
 * }
 *
 */
export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
    case ADD: {
        const { id, path: rawPath, position } = action;
        let { element } = action;

        const path = getEffectivePath(`currentStory.${rawPath}`, state);
        const arrayToUpdate = get(state, path, []);
        const index = getIndexToInsert(arrayToUpdate, position);
        // create a copy
        const newSections = arrayToUpdate.slice();
        // insert the new element at the proper index
        newSections.splice(index, 0, {
            id,
            ...element
        });
        return set(
            path,
            newSections,
            state);
    }
    case ADD_RESOURCE: {
        const { id, mediaType: type, data } = action;
        // add last resource on top
        return set('currentStory.resources', [{ id, type, data }, ...(state.currentStory && state.currentStory.resources || [])], state);
    }
    case CHANGE_MODE: {
        return set('mode', action.mode, state);
    }
    case EDIT_RESOURCE: {
        const { id, mediaType: type, data } = action;

        let newState = arrayUpdate("currentStory.resources", { id, type, data }, { id }, state);
        // With a map resource we have to reset all contents' custom map configurations.
        if (type === MediaTypes.MAP) {
            state.currentStory.sections.reduce((acc, section) =>  ([...acc, ...getContentsByResourceId(id, "sections[", section)])
                , [])
                .map(rawPath => {
                    const path = getEffectivePath(`currentStory.${rawPath}.map`, state);
                    newState = set(path, undefined, newState);
                });
        }
        return newState;
    }
    case REMOVE_RESOURCE: {
        const {id, mediaType} = action;

        let newState = arrayDelete("currentStory.resources", { id }, state);
        state.currentStory.sections.reduce((acc, section) =>  ([...acc, ...getContentsByResourceId(id, "sections[", section)])
            , [])
            .map(rawPath => {
                const resIdPath = getEffectivePath(`currentStory.${rawPath}.resourceId`, state);
                newState = unset(resIdPath, newState);
                if (mediaType === MediaTypes.MAP) {
                    const customMapPath = getEffectivePath(`currentStory.${rawPath}.map`, state);
                    newState = unset(customMapPath, newState);
                }
            });
        return newState;
    }
    case LOADING_GEOSTORY: {
        // anyway sets loading to true
        return set(action.name === "loading" ? "loading" : `loadFlags.${action.name}`, action.value, set(
            "loading", action.value, state
        ));
    }
    case REMOVE: {
        const { path: rawPath } = action;
        const path = getEffectivePath(`currentStory.${rawPath}`, state);
        let containerPath = [...path];
        let lastElement = containerPath.pop();
        const container = get(state, containerPath);
        if (isArray(container)) {
            if (isString(lastElement)) {
                // path sometimes can not be converted into numbers (e.g. when recursive remove of containers)
                lastElement = parseInt(lastElement, 10);
            }
            return set(containerPath, [...container.slice(0, lastElement), ...container.slice(lastElement + 1)], state);
        }
        // object
        return unset(path, state);
    }
    case SET_CURRENT_STORY: {
        let defaultSettings = state.defaultSettings || {};
        let settings = action.story.settings || defaultSettings;
        const existingFontFamilies = settings?.theme?.fontFamilies || [];

        // make sure to add fonts loaded from GeoStory useEffect hook when setting the current story
        const fontFamilies = state.currentStory?.settings?.theme?.fontFamilies;
        if (fontFamilies && fontFamilies.length > 0) {
            settings = set('theme.fontFamilies', uniqBy([...fontFamilies, ...existingFontFamilies], "family"), settings);
        }
        return set('currentStory', {...action.story, settings}, state);
    }
    case SELECT_CARD: {
        return set(`selectedCard`, state.selectedCard === action.card ? "" : action.card, state);
    }
    case SET_CONTROL: {
        const { control, value } = action;
        return set(`controls.${control}`, value, state);
    }
    /**
     * **NOTE** this is the resource that contains the whole story (e.g. GeoStore).
     * It contains permissions and so on. Don't confuse with story resources (media).
     */
    case SET_RESOURCE: {
        const { resource } = action;
        const settings = state.currentStory && state.currentStory.settings || {};
        return compose(
            set(`resource`, resource),
            set('currentStory.settings.storyTitle', settings.storyTitle || resource.name) // TODO check that resource has name prop

        )(state);
    }
    case SAVED: case CLEAR_SAVE_ERROR: {
        return unset(`errors.save`, state);
    }
    case SAVE_ERROR: {
        return set(`errors.save`, castArray(action.error), state);
    }
    case TOGGLE_CARD_PREVIEW: {
        return set('isCollapsed', !state.isCollapsed, state);
    }
    case TOGGLE_SETTING: {
        const visibility = get(state, `currentStory.settings.${action.option}`);
        return set(`currentStory.settings.${action.option}`, !visibility, state);
    }
    case TOGGLE_SETTINGS_PANEL: {

        const newStatus = !state.isSettingsEnabled;
        const settings = state.currentStory && state.currentStory.settings || {};
        return compose(
            set('isSettingsEnabled', newStatus),
            set('oldSettings', newStatus ? settings : {}),
            // when closing (newStatus=false) check if it is because of the save, in that case keep changes otherwise restore previous settings
            set('currentStory.settings', newStatus ? {...settings} : (action.withSave ? settings : state.oldSettings))
        )(state);
    }
    case UPDATE: {
        const { path: rawPath, mode } = action;
        let { element: newElement } = action;
        const path = getEffectivePath(`currentStory.${rawPath}`, state);
        const oldElement = get(state, path);

        // NOTE: isObject vs isPlainObject are different
        if (isPlainObject(oldElement) && isPlainObject(newElement) && mode === "merge") {
            newElement = { ...oldElement, ...newElement };
        }

        if (isArray(oldElement) && isArray(newElement) && mode === "merge") {
            newElement = [ ...oldElement, ...newElement ];
        }
        return set(path, newElement, state);
    }
    case UPDATE_SETTING: {
        return set(`currentStory.settings.${action.prop}`, action.value, state);
    }
    case UPDATE_CURRENT_PAGE: {
        /* if the page update updates a column, update state only if the column for the current immersive section has changed.
        * This to avoid to select a column that doesn't belong to the current section (it could happen due to scroll events, in case of multiple immersive sections in the same viewport).
        */
        if (action.columnId) {
            const section = find(state.currentStory.sections, s => find(s.contents, {id: action.columnId}));
            if (section && find(section.contents, {id: action.columnId})) {
                return set('currentPage', {
                    ...state.currentPage,
                    columns: {
                        ...state.currentPage.columns,
                        [section.id]: action.columnId
                    }
                }, state);
            }
            return state;
        }
        // always update state if section changes
        return set('currentPage', { ...state.currentPage, sectionId: action.sectionId }, state);
    }
    case TOGGLE_CONTENT_FOCUS: {
        const {status, target, selector = "", hideContent = false, path} = action;
        const focusedContent = status ? {target, selector, hideContent, path} : undefined;
        return set(`focusedContent`, focusedContent, state);
    }
    case SET_PENDING_CHANGES: {
        return set(`pendingChanges`, action.value, state);
    }
    case SET_UPDATE_URL_SCROLL: {
        return set(`updateUrlOnScroll`, action.value, state);
    }
    default:
        return state;
    }
};
