/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {
    modeSelector,
    currentStorySelector,
    sectionsSelector,
    sectionSelectorCreator,
    sectionAtIndexSelectorCreator,
    resourcesSelector,
    resourceByIdSelectorCreator

} from "../geostory";

describe('geostory selectors', () => { // TODO: check default
    it('currentStorySelector', () => { expect(currentStorySelector({geostory: {currentStory: {}}})).toEqual({}); });
    it('modeSelector', () => { expect(modeSelector({geostory: {mode: "view"}})).toEqual("view"); });
    it('sectionsSelector', () => { expect(sectionsSelector({geostory: {currentStory: {sections: []}}})).toEqual([]); });
    it('sectionSelectorCreator', () => { expect(sectionSelectorCreator("id")({geostory: {currentStory: {sections: [{id: "id"}]}}})).toEqual({id: "id"}); });
    it('sectionAtIndexSelectorCreator', () => { expect(sectionAtIndexSelectorCreator(0)({geostory: {currentStory: {sections: [{id: "id"}]}}})).toEqual({id: "id"}); });
    it('resourcesSelector', () => { expect(resourcesSelector({geostory: {currentStory: {resources: []}}})).toEqual([]); });
    it('resourceByIdSelectorCreator', () => { expect(resourceByIdSelectorCreator("id")({geostory: {currentStory: {resources: [{id: "id"}]}}})).toEqual({id: "id"}); });
});
