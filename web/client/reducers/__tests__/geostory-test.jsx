/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');

import {
    setCurrentStory,
    setEditing
} from '../../actions/geostory';
import { currentStorySelector, modeSelector } from '../../selectors/geostory';
import TEST_STORY from "json-loader!../../test-resources/geostory/sampleStory_1.json";


import geostory from '../../reducers/geostory';
import { Modes } from '../../utils/GeoStoryUtils';

describe('geostory reducer', () => {
    it('setEditing sets mode', () => {
        expect(modeSelector({
            geostory: geostory(undefined, setEditing(true))
        })).toBe(Modes.EDIT);
        expect(modeSelector({geostory: geostory(undefined, setEditing(false))})).toBe(Modes.VIEW);
    });
    it('setCurrentStory sets story', () => {
        expect(currentStorySelector({ geostory: geostory(undefined, setCurrentStory(TEST_STORY)) })).toBe(TEST_STORY);
    });
});
