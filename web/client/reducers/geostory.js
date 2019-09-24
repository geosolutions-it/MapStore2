/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { get, isString, isNumber, findIndex, toPath, isObject, isArray, castArray } from "lodash";
import { set, unset, arrayUpdate } from '../utils/ImmutableUtils';

import {
    ADD,
    ADD_RESOURCE,
    CHANGE_MODE,
    EDIT_RESOURCE,
    LOADING_GEOSTORY,
    SET_CURRENT_STORY,
    TOGGLE_CARD_PREVIEW,
    UPDATE,
    UPDATE_CURRENT_PAGE,
    REMOVE,
    SET_CONTROL,
    SET_RESOURCE,
    SAVED,
    SAVE_ERROR
} from '../actions/geostory';


let INITIAL_STATE = {
    mode: 'edit', // TODO: change in to Modes.VIEW
    cardPreviewEnabled: true
};

/**
 * transforms the path with  into a path with predicates into a path with array indexes
 * @private
 * @param {string|string[]} rawPath path to transform in real path
 * @param {object} state the state to check to inspect the tree and get the real path
 */
export const getEffectivePath = (rawPath, state) => {
    const rawPathArray = toPath(rawPath); // converts `a.b['section'].c[{"a":"b"}]` into `["a","b","section","c","{\"a\":\"b\"}"]`
    // use curly brackets elements as predicates of findIndex to get the correct index.
    return rawPathArray.reduce( (path, current) => {
        if (current && current.indexOf('{') === 0) {
            const predicate = JSON.parse(current);
            const currentArray = get(state, path);
            const index = findIndex(
                currentArray,
                predicate
            );
            if (index >= 0) {
                return [...path, index];
            }
            // if the predicate is not found, it will ignore the unknown part
            return path;
        }
        return [...path, current];
    }, []);
};


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

/**
 * Reducer that manage state for geostory plugins. Example:
 * @memberof reducers
 * @function
 * @name geostory
 * @param state the application state
 * @param {string} state.mode the mode ('view' or 'edit')
 * @param {object} state.currentStory the current story.
 *
 * @example
 * {
 *     "mode": "edit", // 'edit' or 'view',
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
            const {id, path: rawPath, position} = action;
            let {element} = action;

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
            const {id, mediaType: type, data} = action;
            // add last resource on top
            return set('currentStory.resources', [{id, type, data}, ...(state.currentStory && state.currentStory.resources || [])], state);
        }
        case CHANGE_MODE: {
            return set('mode', action.mode, state);
        }
        case EDIT_RESOURCE: {
            const {id, mediaType: type, data} = action;
            const newState = arrayUpdate("currentStory.resources", {id, type, data}, {id}, state);
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
            return set('currentStory', action.story, state);
        }
        case SET_CONTROL: {
            const {control, value} = action;
            return set(`controls.${control}`, value, state);
        }
        /**
         * **NOTE** this is the resource that contains the whole story (e.g. GeoStore).
         * It contains permissions and so on. Don't confuse with story resources (media).
         */
        case SET_RESOURCE: {
            const { resource } = action;
            return set(`resource`, resource, state);
        }
        case SAVED: {
            return unset(`errors.save`, state);
        }
        case SAVE_ERROR: {
            return set(`errors.save`, castArray(action.error), state);
        }
        case TOGGLE_CARD_PREVIEW: {
            return set('cardPreviewEnabled', !state.cardPreviewEnabled, state);
        }
        case UPDATE: {
            const { path: rawPath, mode } = action;
            let { element: newElement } = action;
            const path = getEffectivePath(`currentStory.${rawPath}`, state);
            const oldElement = get(state, path);
            if (isObject(oldElement) && isObject(newElement) && mode === "merge") {
                newElement = {...oldElement, ...newElement};
            }
            return set(path, newElement, state);
        }
        case UPDATE_CURRENT_PAGE: {
            const {type, ...currentPage} = action;
            return set('currentPage', currentPage, state); // maybe a merge is better
        }
        default:
            return state;
    }
};
