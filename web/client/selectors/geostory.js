/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {get, find} from 'lodash';
import {getEffectivePath} from '../reducers/geostory';
/**
 * Returns a selector using a path inside the current story
 * @param {string} path the path
 * @returns {function} selector that returns the item at the provided path.
 */
export const createPathSelector = path => state => get(state, getEffectivePath(`geostory.currentStory.${path}`, state), "");
/**
 * gets the currentStory from the state
 * @returns {object} the object the represents the state
 */
export const currentStorySelector = state => get(state, 'geostory.currentStory');
/**
 * gets the current mode (view, edit) from the state
 * @returns {string} current mode. One of 'view' / 'edit'
 */
export const modeSelector = state => get(state, 'geostory.mode');
/**
 * gets the sections array of the current story
 */
export const sectionsSelector = state => get(currentStorySelector(state), "sections", []);
/**
 * Returns a selector for the section with the provided ID.
 * @param {string} id the ID of the section to get
 * @returns {function} selector that returns the section with the provided ID.
 */
export const sectionSelectorCreator = id => state => find(sectionsSelector(state), {id});
/**
 * Returns a selector for the section at the provided index
 * @param {number} index the index of the section to get
 * @returns {function} selector that returns the section at the provided index.
 */
export const sectionAtIndexSelectorCreator = index => state => (sectionsSelector(state) || [])[index];
/**
 * Returns a selector that fetches resourceId from a path inside the current story
 * @param {string} path the path
 * @returns {function} selector that returns the resourceId at the provided path.
 */
export const resourceIdSelectorCreator = path => state => createPathSelector(`${path}.resourceId`)(state);
/**
 * Returns a selector for the resources of the currentStory
 * @param {object} state
 * @returns {function} selector
 */
export const resourcesSelector = state => get(currentStorySelector(state), "resources", []);
/**
 * gets the resource specified by id among resources of the currentStory
 * @param {string} id
 * @returns {function} function that returns a selector
 */
export const resourceByIdSelectorCreator = id => state => find(resourcesSelector(state), {id});

