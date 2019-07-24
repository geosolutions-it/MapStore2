/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {get} from 'lodash';

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

