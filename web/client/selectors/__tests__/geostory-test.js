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
    isCollapsedSelector,
    createPathSelector,
    currentStorySelector,
    isEditAllowedSelector,
    sectionsSelector,
    sectionSelectorCreator,
    sectionAtIndexSelectorCreator,
    resourceSelector,
    canEditSelector,
    resourcesSelector,
    resourceByIdSelectorCreator,
    resourceIdSelectorCreator,
    saveDialogSelector,
    errorsSelector,
    loadingSelector
} from "../geostory";

describe('geostory selectors', () => { // TODO: check default
    it('isCollapsedSelector', () => { expect(isCollapsedSelector({geostory: {isCollapsed: false}})).toEqual(false); });
    it('currentStorySelector', () => { expect(currentStorySelector({geostory: {currentStory: {}}})).toEqual({}); });
    it('createPathSelector', () => {
        const path = 'sections[{"id": "section_id"}].contents[{"id": "content_id"}]';
        expect(createPathSelector(path)({geostory: {currentStory: {sections: [{id: "section_id", contents: [{ id: "content_id" }]}]}}})).toEqual({id: "content_id"});
    });
    it('resourceIdSelectorCreator', () => {
        const path = 'sections[{"id": "section_id"}].contents[{"id": "content_id"}]';
        const resourceId = "resource_id";
        expect(resourceIdSelectorCreator(path)({geostory: {currentStory: {sections: [{id: "section_id", contents: [{ id: "content_id", resourceId }]}]}}})).toEqual(resourceId);
    });
    it('modeSelector', () => { expect(modeSelector({geostory: {mode: "view"}})).toEqual("view"); });
    it('sectionsSelector', () => { expect(sectionsSelector({geostory: {currentStory: {sections: []}}})).toEqual([]); });
    it('sectionSelectorCreator', () => { expect(sectionSelectorCreator("id")({geostory: {currentStory: {sections: [{id: "id"}]}}})).toEqual({id: "id"}); });
    it('sectionAtIndexSelectorCreator', () => { expect(sectionAtIndexSelectorCreator(0)({geostory: {currentStory: {sections: [{id: "id"}]}}})).toEqual({id: "id"}); });
    it('resourcesSelector', () => { expect(resourcesSelector({geostory: {currentStory: {resources: []}}})).toEqual([]); });
    it('canEditSelector false', () => { expect(canEditSelector({geostory: {resource: {id: 123}}})).toEqual(false); });
    it('canEditSelector true', () => { expect(canEditSelector({geostory: {resource: {canEdit: true}}})).toEqual(true); });
    it('isEditAllowedSelector, logged ADMIN, can edit', () => { expect(isEditAllowedSelector({geostory: {resource: {canEdit: true}}, security: {user: {role: "ADMIN"}}})).toEqual(true); });
    it('isEditAllowedSelector, logged USER, cannot edit', () => { expect(isEditAllowedSelector({geostory: {resource: {canEdit: false}}, security: {user: {role: "USER"}}})).toEqual(false); });
    it('isEditAllowedSelector, logged ADMIN, local resource', () => { expect(isEditAllowedSelector({geostory: {resource: {}}, security: {user: {role: "ADMIN"}}})).toEqual(true); });
    it('resourceSelector', () => { expect(resourceSelector({geostory: {resource: {id: 123}}})).toEqual({id: 123}); });
    it('resourceByIdSelectorCreator', () => { expect(resourceByIdSelectorCreator("id")({geostory: {currentStory: {resources: [{id: "id"}]}}})).toEqual({id: "id"}); });
    it('saveDialogSelector', () => {
        expect(saveDialogSelector({
            geostory: {
                controls: {
                    save: { // Note: this is the path of Controls.SHOW_SAVE
                        show: "save"
                    }
                }
            }
        })).toEqual("save");
    });
    it('loadingSelector', () => expect(loadingSelector({ geostory: { loading: true } })).toBe(true));
    it('errorsSelector', () => expect(errorsSelector({ geostory: { errors: ["some", "error"] } })).toBeTruthy());
});
