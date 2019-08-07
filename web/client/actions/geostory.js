
/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Modes, getDefaultSectionTemplate } from '../utils/GeoStoryUtils';
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

export const ADD_SECTION = "GEOSTORY:ADD_SECTION";

/**
 *
 * @param {string} type type of the section to add
 * @param {string|number} [position] the ID or the index of the section where to place the section (if not present the section will be appended at the end)
 * @param {*} content the section
 */
export const addSection = (type, position, section) => ({
    type: ADD_SECTION,
    id: section && section.id || uuid(), // automatically assign an ID
    sectionType: type,
    position,
    section: section || getDefaultSectionTemplate(type)
});
