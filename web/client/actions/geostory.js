/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import isString from 'lodash/isString';
import uuid from "uuid";
import { Modes, getDefaultSectionTemplate } from '../utils/GeoStoryUtils';

export const ADD = "GEOSTORY:ADD";
export const ADD_RESOURCE = "GEOSTORY:ADD_RESOURCE";
export const CHANGE_MODE = "GEOSTORY:CHANGE_MODE";
export const CLEAR_SAVE_ERROR = "GEOSTORY:CLEAR_SAVE_ERROR";
export const EDIT_RESOURCE = "GEOSTORY:EDIT_RESOURCE";
export const EDIT_WEBPAGE = "GEOSTORY:EDIT_WEBPAGE";
export const ERRORS_LOGO = "GEOSTORY:ERRORS_LOGO";
export const GEOSTORY_LOADED = "GEOSTORY:GEOSTORY_LOADED";
export const LOAD_GEOSTORY = "GEOSTORY:LOAD_GEOSTORY";
export const LOAD_GEOSTORY_ERROR = "GEOSTORY:LOAD_GEOSTORY_ERROR";
export const LOADING_GEOSTORY = "GEOSTORY:LOADING_GEOSTORY";
export const MOVE = "GEOSTORY:MOVE";
export const REMOVE = "GEOSTORY:REMOVE";
export const SAVE = "GEOSTORY:SAVE_STORY";
export const SAVE_ERROR = "GEOSTORY:SAVE_ERROR";
export const SAVED = "GEOSTORY:STORY_SAVED";
export const SELECT_CARD = "GEOSTORY:SELECT_CARD";
export const SET_CONTROL = "GEOSTORY:SET_CONTROL";
export const SET_RESOURCE = "GEOSTORY:SET_RESOURCE";
export const SET_CURRENT_STORY = "GEOSTORY:SET_CURRENT_STORY";
export const SET_WEBPAGE_URL = "GEOSTORY:SET_WEBPAGE_URL";
export const TOGGLE_CARD_PREVIEW = "GEOSTORY:TOGGLE_CARD_PREVIEW";
export const TOGGLE_SETTINGS_PANEL = "GEOSTORY:TOGGLE_SETTINGS_PANEL";
export const TOGGLE_SETTING = "GEOSTORY:TOGGLE_SETTING";
export const TOGGLE_CONTENT_FOCUS = "GEOSTORY:TOGGLE_CONTENT_FOCUS";
export const UPDATE = "GEOSTORY:UPDATE";
export const UPDATE_SETTING = "GEOSTORY:UPDATE_SETTING";
export const UPDATE_CURRENT_PAGE = "GEOSTORY:UPDATE_CURRENT_PAGE";
export const REMOVE_RESOURCE = "GEOSTORY:REMOVE_RESOURCE";
export const SET_PENDING_CHANGES = "GEOSTORY:SET_PENDING_CHANGES";
export const SET_UPDATE_URL_SCROLL = "GEOSTORY:SET_UPDATE_URL_SCROLL";
/**
 * Adds an entry to current story. The entry can be a section, a content or anything to append in an array (even sub-content)
 *
 * @param {string} path path where to add the element. It can contain path like this `sections[{"id": "abc"}].contents[{"id": "def"}]` to resolve the predicate between brackets.
 * @param {string|number} [position] the ID or the index of the section where to place the section (if not present the section will be appended at the end)
 * @param {string|object} element the object to add or the template to apply. can be a section, a content or whatever. If it is a string, it will be transformed in the content template with the provided name.
 * @param {function} [localize] localization function used in case of template to localize default strings
 */
export const add = (path, position, element, localize = v => v) => ({
    type: ADD,
    id: element && element.id || uuid(), // automatically assign an ID
    path,
    position,
    element: isString(element) && getDefaultSectionTemplate(element, localize) || element
});
/**
 * Adds a resource to the current story
 */
export const addResource = ( id, mediaType, data ) => ({type: ADD_RESOURCE, id, mediaType, data});
/**
 * ClearSaveError
*/
export const clearSaveError = () => ({ type: CLEAR_SAVE_ERROR});
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
 * @param {object} options custom data user in epics for specific cases
 */
export const loadGeostory = (id, options) => ({ type: LOAD_GEOSTORY, id, options});

/**
 * GeoStory Loaded event
 * @param {string} id the story name of .json file
 */
export const geostoryLoaded = (id) => ({ type: GEOSTORY_LOADED, id });
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
 * removes a content from a story
 * @param {string} path
 */
export const remove = (path) => ({
    type: REMOVE,
    path
});
/**
 * Lunch the story save
 * @param {object} resource the resource to save
 */
export const saveStory = resource => ({type: SAVE, resource});
/**
 * Triggered when there is a save error
 * @param {Error} error the error
 */
export const saveGeoStoryError = error => ({type: SAVE_ERROR, error});
/**
 * Sets the variables for the controls of GeoStory. Can be used for dialogs or other tools
 * specific of GeoStory.
 * @param {string} control path to the control or control value to set
 * @param {object} value any value you want to set for the control
 */
export const setControl = (control, value) => ({ type: SET_CONTROL, control, value });
/**
 * changes selection of cards, if already selected it deselects
 * @param {string} card card being selected
 */
export const selectCard = (card) => ({ type: SELECT_CARD, card });
/**
 * Sets the resource for GeoStorySave plugin content.
 * **NOTE**: Don't confuse this from the resources of the story content. This contains permission and
 * basic properties **of the remote resource of the whole story (e.g. geostore resource)**
 * specific of GeoStory.
 * @param {object} resource the original resource saved. contains all edit options (canSave, canEdit...)
 */
export const setResource = (resource) => ({ type: SET_RESOURCE, resource});
/**
 * Triggered when the resource has been saved
 * @param {number} id the id of the saved resource
 */
export const storySaved = id => ({type: SAVED, id});
/**
 * Sets the current story for editor/viewer
 * @param {object} story the story object
*/
export const setCurrentStory = (story) => ({ type: SET_CURRENT_STORY, story});
/**
 * Turn on/off preview in cards.
*/
export const toggleCardPreview = () => ({ type: TOGGLE_CARD_PREVIEW});
/**
 * Turn on/off settings options in panel, like logo etc.
*/
export const toggleSetting = (option) => ({ type: TOGGLE_SETTING, option});
/**
 * Turn on/off settings panel.
*/
export const toggleSettingsPanel = (withSave = false) => ({ type: TOGGLE_SETTINGS_PANEL, withSave});
/**
 * Updates a value or an object in the current Story. Useful to update contents, settings and so on.
 * @param {string} path the path of the element to modify. It can contain path like this `sections[{"id": "abc"}].contents[{"id": "def"}]` to resolve the predicate between brackets.
 * @param {object} element the object to update
 * @param {string|object} [mode="replace"] "merge" or "replace", if "merge", the object passed as element will be merged with the original one (if present and if it is an object)
 */
export const update = (path, element, mode = "replace") => ({
    type: UPDATE,
    path,
    element,
    mode
});
/**
 * updates the current page with current value of sectionId (future can be extended adding other info about current content).
 * @param {object} param0 current page information. Contains `sectionId`
 */
export const updateCurrentPage = ({sectionId, columnId}) => ({
    type: UPDATE_CURRENT_PAGE,
    sectionId,
    columnId
});
/**
 * moves one section/content from `source` to the `target` container at the `position` position.
 * @param {string} source source path of the section/content to move
 * @param {string} target target path in the story, where to place the moved content
 * @param {string|number} position position where to place the dropped item.
 * We are removing the source item and
 * adding it again to the position where the target item was,
 * making the other item to shift beyond it
 *                       0  1  2      0  1  2  3
 * i0 dragged to i2 ==> i1 i2 i3 ==> i1 i2 i0 i3
 *                       0  1  2      0  1  2  3
 * i3 dragged to i1 ==> i0 i1 i2 ==> i0 i3 i1 i2
 */
export const move = (source, target, position) => ({
    type: MOVE,
    source,
    target,
    position
});

/**
 * Toggle focus on content
 * @param {boolean} status if true set the focus otherwise remove
 * @param {object: {id: string, type: string}} target the target content to be focused
 * @param {string} selector css selector of target element
 * @param {boolean} hideContent true if the target is the background of the target
 * @param {string} path target path in the current story
 */
export const setFocusOnContent = (status, target, selector, hideContent, path) => ({
    type: TOGGLE_CONTENT_FOCUS,
    status,
    target,
    selector,
    hideContent,
    path
});

/**
 * update settings for the story
 * @param {string} prop prop name to update in the state
 * @param {*} value value used to update the prop
 */
export const updateSetting = (prop, value) => ({type: UPDATE_SETTING, prop, value});

export const setWebPageUrl = (src) => ({ type: SET_WEBPAGE_URL, src });

export const editWebPage = ({ path }, owner = 'GEOSTORY') => ({ type: EDIT_WEBPAGE, path, owner });

/**
 * Removes a resource in the current story
 */
export const removeResource = ( id, mediaType) => ({type: REMOVE_RESOURCE, id, mediaType});

/**
 * Sets pending changes
 */
export const setPendingChanges = value => ({type: SET_PENDING_CHANGES, value});

/**
 * Sets should url be updated on scroll
 */
export const updateUrlOnScroll = value => ({type: SET_UPDATE_URL_SCROLL, value});
