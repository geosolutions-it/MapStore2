
/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { isString } from 'lodash';
import uuid from "uuid";
import { Modes, getDefaultSectionTemplate } from '../utils/GeoStoryUtils';

export const ADD = "GEOSTORY:ADD";
export const ADD_RESOURCE = "GEOSTORY:ADD_RESOURCE";
export const CHANGE_MODE = "GEOSTORY:CHANGE_MODE";
export const EDIT_RESOURCE = "GEOSTORY:EDIT_RESOURCE";
export const LOAD_GEOSTORY = "GEOSTORY:LOAD_GEOSTORY";
export const LOAD_GEOSTORY_ERROR = "GEOSTORY:LOAD_GEOSTORY_ERROR";
export const LOADING_GEOSTORY = "GEOSTORY:LOADING_GEOSTORY";
export const SET_CURRENT_STORY = "GEOSTORY:SET_CURRENT_STORY";
export const UPDATE = "GEOSTORY:UPDATE";

/**
 * Adds an entry to current story. The entry can be a section, a content or anything to append in an array (even sub-content)
 *
 * @param {string} path path where to add the element. It can contain path like this `sections[{id: "abc"}].contents[{id: "def"}]` to resolve the predicate between brackets.
 * @param {string|number} [position] the ID or the index of the section where to place the section (if not present the section will be appended at the end)
 * @param {string|object} element the object to add or the template to apply. can be a section, a content or whatever. If it is a string, it will be transformed in the content template with the provided name.
 */
export const add = (path, position, element) => ({
    type: ADD,
    id: element && element.id || uuid(), // automatically assign an ID
    path,
    position,
    element: isString(element) && getDefaultSectionTemplate(element) || element
});
/**
 * Adds a resource to the current story
 */
export const addResource = ( id, mediaType, data ) => ({type: ADD_RESOURCE, id, mediaType, data});
/**
 * Turn on/off editing mode.
 * @param {boolean} editing editing mode. true to activate, false to deactivate.
*/
export const setEditing = (editing) => ({ type: CHANGE_MODE, mode: editing ? Modes.EDIT : Modes.VIEW});
/**
 * Edits a resource in the current story
 */
export const editResource = ( id, mediaType, data ) => ({type: EDIT_RESOURCE, id, mediaType, data});
/**
 * Load geostory from configuration
 * @param {string} id the story name of .json file
 */
export const loadGeostory = (id) => ({ type: LOAD_GEOSTORY, id});
/**
 * Loading status of geostory
 * @param {boolean} value the status of the loading process
 * @param {string} name of the loading process
 */
export const loadingGeostory = (value = false, name = "loading") => ({ type: LOADING_GEOSTORY, value, name});
/**
 * load failed and this intercept error
 * @param {object} error the status of the loading process
 */
export const loadGeostoryError = (error) => ({ type: LOAD_GEOSTORY_ERROR, error});
/**
 * Sets the current story for editor/viewer
 * @param {object} story the story object
*/
export const setCurrentStory = (story) => ({ type: SET_CURRENT_STORY, story});
/**
 * Updates a value or an object in the current Story. Useful to update contents, settings and so on.
 * @param {string} path the path of the element to modify. It can contain path like this `sections[{id: "abc"}].contents[{id: "def"}]` to resolve the predicate between brackets.
 * @param {object} element the object to update
 * @param {string|object} [mode="replace"] "merge" or "replace", if "merge", the object passed as element will be merged with the original one (if present and if it is an object)
 */
export const update = (path, element, mode = "replace") => ({
    type: UPDATE,
    path,
    element,
    mode
});
