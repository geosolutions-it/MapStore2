/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { get, isString, isNumber, findIndex, toPath, isObject } from "lodash";
import { set } from '../utils/ImmutableUtils';

import {
    ADD,
    CHANGE_MODE,
    SET_CURRENT_STORY,
    UPDATE
} from '../actions/geostory';

let INITIAL_STATE = {
    mode: 'view'
};
import { getDefaultSectionTemplate } from '../utils/GeoStoryUtils';


/**
 * transforms the path with  into a path with predicates into a path with array indexes
 * @private
 * @param {string|string[]} rawPath path to transform in real path
 * @param {object} state the state to check to inspect the tree and get the real path
 */
const getEffectivePath = (rawPath, state) => {
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

// Array().keys() DON'T WORK IN IE 11 ( Array.from(Array(10).keys()) )
// Use Object.keys([ ...new Array(10) ]) instead


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
 *   }
 * }
 *
 */
export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case CHANGE_MODE: {
            return set('mode', action.mode, state);
        }
        case SET_CURRENT_STORY: {
            return set('currentStory', action.story, state);
        }
        case ADD: {
            const {id, path: rawPath, position} = action;
            let {element} = action;
            if (isString(element) && getDefaultSectionTemplate(element)) {
                element = getDefaultSectionTemplate(element);
            }

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
        default:
            return state;
    }
};
