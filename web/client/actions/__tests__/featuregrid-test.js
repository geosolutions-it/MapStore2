/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const {
    SELECT_FEATURES, selectFeatures,
    changePage, CHANGE_PAGE,
    sort, SORT_BY,
    setSelectionOptions, SET_SELECTION_OPTIONS,
    MODES, TOGGLE_MODE, toggleEditMode, toggleViewMode,
    featureModified, FEATURES_MODIFIED,
    createNewFeatures, CREATE_NEW_FEATURE,
    saveChanges, SAVE_CHANGES,
    saveSuccess, SAVE_SUCCESS,
    deleteFeatures, DELETE_SELECTED_FEATURES,
    startEditingFeature, START_EDITING_FEATURE,
    featureSaving, SAVING,
    saveError, SAVE_ERROR,
    clearChanges, CLEAR_CHANGES,
    geometryChanged, GEOMETRY_CHANGED,
    startDrawingFeature, START_DRAWING_FEATURE,
    deleteGeometry, DELETE_GEOMETRY,
    deleteGeometryFeature, DELETE_GEOMETRY_FEATURE,
    clearChangeConfirmed, CLEAR_CHANGES_CONFIRMED,
    deleteFeaturesConfirm, DELETE_SELECTED_FEATURES_CONFIRM,
    closeFeatureGridConfirmed, FEATURE_GRID_CLOSE_CONFIRMED
} = require('../featuregrid');

const idFeature = "2135";
const feature = {
    type: "Feature",
    id: idFeature,
    properties: {
        name: "f.name"
    },
    geometry: {
        type: "Point",
        coordinates: [1, 2]
    }
};
const features = [feature, feature];
const options = {editEnabled: true};
describe('Test correctness of featurgrid actions', () => {

    it('Test deleteGeometryFeature action creator', () => {
        const retval = deleteGeometryFeature(features);
        expect(retval).toExist();
        expect(retval.features).toExist();
        expect(retval.features.length).toBe(features.length);
        expect(retval.type).toBe(DELETE_GEOMETRY_FEATURE);
    });
    it('Test deleteGeometry action creator', () => {
        const retval = deleteGeometry();
        expect(retval).toExist();
        expect(retval.type).toBe(DELETE_GEOMETRY);
    });
    it('Test closeFeatureGridConfirmed action creator', () => {
        const retval = closeFeatureGridConfirmed();
        expect(retval).toExist();
        expect(retval.type).toBe(FEATURE_GRID_CLOSE_CONFIRMED);
    });
    it('Test clearChangeConfirmed action creator', () => {
        const retval = clearChangeConfirmed();
        expect(retval).toExist();
        expect(retval.type).toBe(CLEAR_CHANGES_CONFIRMED);
    });
    it('Test startDrawingFeature action creator', () => {
        const retval = startDrawingFeature();
        expect(retval).toExist();
        expect(retval.type).toBe(START_DRAWING_FEATURE);
    });
    it('Test geometryChanged action creator', () => {
        const retval = geometryChanged([feature]);
        expect(retval).toExist();
        expect(retval.type).toBe(GEOMETRY_CHANGED);
        expect(retval.features).toExist();
        expect(retval.features[0].id).toBe(idFeature);
        expect(retval.features.length).toBe(1);
    });
    it('Test selectFeature action creator', () => {
        const someFeatures = [1, 2];
        const retval = selectFeatures(someFeatures);
        expect(retval).toExist();
        expect(retval.type).toBe(SELECT_FEATURES);
        expect(retval.features).toExist();
        expect(retval.features).toBe(someFeatures);
    });
    it('Test changePage action creator', () => {
        const retval = changePage(1, 2);
        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_PAGE);
        expect(retval.page).toBe(1);
        expect(retval.size).toBe(2);
    });
    it('Test sort action creator', () => {
        const retval = sort("attr", "ASC");
        expect(retval).toExist();
        expect(retval.type).toBe(SORT_BY);
        expect(retval.sortBy).toBe("attr");
        expect(retval.sortOrder).toBe("ASC");
    });
    it('Test startEditingFeature', () => {
        const retval = startEditingFeature(feature, options);
        expect(retval).toExist();
        expect(retval.type).toBe(START_EDITING_FEATURE);
    });
    it('Test setSelectionOptions', () => {
        const retval = setSelectionOptions({multiselect: true});
        expect(retval).toExist();
        expect(retval.type).toBe(SET_SELECTION_OPTIONS);
        expect(retval.multiselect).toExist();
        expect(retval.multiselect).toBeTruthy();
    });
    it('Test toggleEditMode AND toggleViewMode', () => {
        let retval = toggleEditMode();
        expect(retval).toExist();
        expect(retval.type).toBe(TOGGLE_MODE);
        expect(retval.mode).toExist();
        expect(retval.mode).toBe(MODES.EDIT);

        retval = toggleViewMode();
        expect(retval).toExist();
        expect(retval.type).toBe(TOGGLE_MODE);
        expect(retval.mode).toExist();
        expect(retval.mode).toBe(MODES.VIEW);
    });

    it('Test featureModified', () => {
        const retval = featureModified([feature, feature], true);
        expect(retval).toExist();
        expect(retval.type).toBe(FEATURES_MODIFIED);
        expect(retval.features).toExist();
        expect(retval.features.length).toBe(2);
        expect(retval.updated).toBeTruthy();
    });
    it('Test createNewFeatures', () => {
        const retval = createNewFeatures(features);
        expect(retval).toExist();
        expect(retval.type).toBe(CREATE_NEW_FEATURE);
        expect(retval.features).toExist();
        expect(retval.features.length).toBe(2);
    });
    it('Test saveChanges', () => {
        const retval = saveChanges();
        expect(retval).toExist();
        expect(retval.type).toBe(SAVE_CHANGES);
    });
    it('Test saveSuccess', () => {
        const retval = saveSuccess();
        expect(retval).toExist();
        expect(retval.type).toBe(SAVE_SUCCESS);
    });
    it('Test deleteFeatures', () => {
        const retval = deleteFeatures();
        expect(retval).toExist();
        expect(retval.type).toBe(DELETE_SELECTED_FEATURES);
    });
    it('Test featureSaving', () => {
        const retval = featureSaving();
        expect(retval).toExist();
        expect(retval.type).toBe(SAVING);
    });
    it('Test clearChanges', () => {
        const retval = clearChanges();
        expect(retval).toExist();
        expect(retval.type).toBe(CLEAR_CHANGES);
    });
    it('Test deleteFeaturesConfirm', () => {
        const retval = deleteFeaturesConfirm();
        expect(retval).toExist();
        expect(retval.type).toBe(DELETE_SELECTED_FEATURES_CONFIRM);
    });
    it('Test saveError', () => {
        const retval = saveError();
        expect(retval).toExist();
        expect(retval.type).toBe(SAVE_ERROR);
    });

});
