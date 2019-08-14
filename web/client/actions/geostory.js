
/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Modes } from '../utils/GeoStoryUtils';
import uuid from "uuid";

export const CHANGE_MODE = "GEOSTORY:CHANGE_MODE";
/**
 * Turn on/off editing mode.
 * @param {boolean} editing editing mode. true to activate, false to deactivate.
 */
export const setEditing = (editing) => ({ type: CHANGE_MODE, mode: editing ? Modes.EDIT : Modes.VIEW});
export const SET_CURRENT_STORY = "GEOSTORY:SET_CURRENT_STORY";

/**
 * Sets the current story for editor/viewer
 * @param {object} story the story object
 */
export const setCurrentStory = (story) => ({ type: SET_CURRENT_STORY, story});

export const ADD = "GEOSTORY:ADD";

/**
 * Adds an entry to current story. The entry can be a section, a content or anything to append in an array (even sub-content)
 * @param {string} path path where to add the element. It can contain path like this `sections[{id: "abc"}].contents[{id: "def"}]` to resolve the predicate between brackets.
 * @param {string|number} [position] the ID or the index of the section where to place the section (if not present the section will be appended at the end)
 * @param {string|object} content the object to add or the content template to apply. can be a section, a content or whatever. If it is a string, it will be used the template with that name.
 */
export const add = (path, position, element) => ({
    type: ADD,
    id: element && element.id || uuid(), // automatically assign an ID
    path,
    position,
    element
});

export const UPDATE = "GEOSTORY:UPDATE";

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
