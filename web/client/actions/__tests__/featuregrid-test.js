/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const {isEmpty, isEqual} = require('lodash');
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
    openFeatureGrid, OPEN_FEATURE_GRID,
    closeFeatureGrid, CLOSE_FEATURE_GRID,
    closeFeatureGridConfirm, CLOSE_FEATURE_GRID_CONFIRM,
    closeFeatureGridConfirmed, FEATURE_GRID_CLOSE_CONFIRMED,
    updateFilter, UPDATE_FILTER,
    zoomAll, ZOOM_ALL,
    openAdvancedSearch, OPEN_ADVANCED_SEARCH,
    initPlugin, INIT_PLUGIN,
    sizeChange, SIZE_CHANGE,
    START_SYNC_WMS, startSyncWMS,
    storeAdvancedSearchFilter, STORE_ADVANCED_SEARCH_FILTER,
    setUp, SET_UP,
    setTimeSync, SET_TIME_SYNC,
    fatureGridQueryResult, GRID_QUERY_RESULT,
    moreFeatures, LOAD_MORE_FEATURES,
    hideSyncPopover, HIDE_SYNC_POPOVER,
    toggleShowAgain, TOGGLE_SHOW_AGAIN_FLAG
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
    it('Test initPlugin action creator', () => {
        const someOption = "someValue";
        const retval = initPlugin({someOption});
        expect(retval).toExist();
        expect(retval.type).toBe(INIT_PLUGIN);
        expect(retval.options.someOption).toBe(someOption);

        // test with empty value, returns empty options
        const retval2 = initPlugin();
        expect(retval2).toExist();
        expect(retval2.type).toBe(INIT_PLUGIN);
        expect(isEmpty(retval2.options)).toBe(true);
        expect(isEqual(retval2.options, {})).toBe(true);
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
    it('Test hideSyncPopover action creator', () => {
        const retval = hideSyncPopover();
        expect(retval).toExist();
        expect(retval.type).toBe(HIDE_SYNC_POPOVER);
    });
    it('Test toggleShowAgain action creator', () => {
        const retval = toggleShowAgain();
        expect(retval).toExist();
        expect(retval.type).toBe(TOGGLE_SHOW_AGAIN_FLAG);
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
    it('Test openFeatureGrid', () => {
        const retval = openFeatureGrid();
        expect(retval).toExist();
        expect(retval.type).toBe(OPEN_FEATURE_GRID);
    });
    it('Test closeFeatureGrid', () => {
        const retval = closeFeatureGrid();
        expect(retval).toExist();
        expect(retval.type).toBe(CLOSE_FEATURE_GRID);
    });
    it('Test closeFeatureGridConfirm', () => {
        const retval = closeFeatureGridConfirm();
        expect(retval).toExist();
        expect(retval.type).toBe(CLOSE_FEATURE_GRID_CONFIRM);
    });
    it('Test saveError', () => {
        const retval = saveError();
        expect(retval).toExist();
        expect(retval.type).toBe(SAVE_ERROR);
    });
    it('Test zoomAll', () => {
        const retval = zoomAll();
        expect(retval).toExist();
        expect(retval.type).toBe(ZOOM_ALL);
    });
    it('Test startSyncWMS', () => {
        const retval = startSyncWMS();
        expect(retval).toExist();
        expect(retval.type).toBe(START_SYNC_WMS);
    });
    it('Test openAdvancedSearch', () => {
        const retval = openAdvancedSearch();
        expect(retval).toExist();
        expect(retval.type).toBe(OPEN_ADVANCED_SEARCH);
    });
    it('Test updateFilter', () => {
        const update = {name: "A"};
        const retval = updateFilter(update);
        expect(retval).toExist();
        expect(retval.type).toBe(UPDATE_FILTER);
        expect(retval.update).toBe(update);
    });
    it('Test sizeChange', () => {
        const size = 0.5;
        const dockProps = {maxDockSize: 0.7, minDockSize: 0.1};
        const retval = sizeChange(size, dockProps);
        expect(retval).toExist();
        expect(retval.type).toBe(SIZE_CHANGE);
        expect(retval.size).toBe(size);
        expect(retval.dockProps).toEqual(dockProps);
    });
    it('Test storeAdvancedSearchFilter', () => {
        const filterObj = {name: "A"};
        const retval = storeAdvancedSearchFilter(filterObj);
        expect(retval).toExist();
        expect(retval.type).toBe(STORE_ADVANCED_SEARCH_FILTER);
        expect(retval.filterObj).toBe(filterObj);
    });
    it('Test storeAdvancedSearchFilter', () => {
        const filterObj = {name: "A"};
        const retval = storeAdvancedSearchFilter(filterObj);
        expect(retval).toExist();
        expect(retval.type).toBe(STORE_ADVANCED_SEARCH_FILTER);
        expect(retval.filterObj).toBe(filterObj);
    });
    it('Test fatureGridQueryResult', () => {
        const pages = [];
        const retval = fatureGridQueryResult(features, pages);
        expect(retval).toExist();
        expect(retval.type).toBe(GRID_QUERY_RESULT);
        expect(retval.features).toBe(features);
        expect(retval.pages).toBe(pages);
    });
    it('Test moreFeatures', () => {
        const pages = {startPage: 0, endPage: 2};
        const retval = moreFeatures(pages);
        expect(retval).toExist();
        expect(retval.type).toBe(LOAD_MORE_FEATURES);
        expect(retval.pages).toBe(pages);
    });

    it('Test setUp', () => {
        const showFilteredObject = true;
        expect(setUp({ showFilteredObject })).toEqual({ type: SET_UP, options: { showFilteredObject }});
        expect(setUp({ showFilteredObject, timeSync: true })).toEqual({ type: SET_UP, options: { showFilteredObject, timeSync: true } });

    });
    it('setTimeSync', () => {
        expect(setTimeSync(true)).toEqual({ type: SET_TIME_SYNC, value: true });
        expect(setTimeSync(false)).toEqual({ type: SET_TIME_SYNC, value: false });

    });
});
