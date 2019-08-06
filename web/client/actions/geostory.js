
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

export const ADD_SECTION = "GEOSTORY_ADD_SECTION";
export const addSection = (type, position, content) => ({
   id: content.id || uuid(),
});
