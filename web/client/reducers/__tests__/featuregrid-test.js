/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const idFt1 = "idFt1";
const idFt2 = "idFt2";
let feature1 = {
    type: "Feature",
    geometry: {
        type: "Point",
        coordinates: [1, 2]
    },
    id: idFt1,
    properties: {
        someProp: "someValue"
    }
};
let feature2 = {
    type: "Feature",
    geometry: {
        type: "Point",
        coordinates: [1, 2]
    },
    id: idFt2,
    properties: {
        someProp: "someValue"
    }
};
let newfeature3 = {
    type: "Feature",
    geometry: {
        type: "Point",
        coordinates: [1, 2]
    },
    _new: true,
    id: idFt2,
    properties: {
        someProp: "someValue"
    }
};
import expect from 'expect';
import featuregrid from '../featuregrid';

import {
    setFeatures,
    dockSizeFeatures,
    setLayer,
    toggleTool,
    customizeAttribute,
    selectFeatures,
    deselectFeatures,
    createNewFeatures,
    updateFilter,
    featureSaving,
    toggleSelection,
    clearSelection,
    MODES,
    toggleEditMode,
    toggleViewMode,
    saveSuccess,
    clearChanges,
    saveError,
    startDrawingFeature,
    deleteGeometryFeature,
    geometryChanged,
    setSelectionOptions,
    changePage,
    featureModified,
    setPermission,
    disableToolbar,
    openFeatureGrid,
    closeFeatureGrid,
    toggleShowAgain,
    initPlugin,
    sizeChange,
    storeAdvancedSearchFilter,
    setUp,
    setTimeSync,
    setPagination,
    setViewportFilter
} from '../../actions/featuregrid';

import {isViewportFilterActive, paginationSelector, useLayerFilterSelector} from '../../selectors/featuregrid';


import { featureTypeLoaded, createQuery, updateQuery } from '../../actions/wfsquery';
import { changeDrawingStatus } from '../../actions/draw';
import { configureMap } from '../../actions/config';

import museam from '../../test-resources/wfs/museam.json';
describe('Test the featuregrid reducer', () => {
    it('returns original state on unrecognized action', () => {
        let state = featuregrid(1, {type: 'UNKNOWN'});
        expect(state).toBe(1);
    });
    it('default state', () => {
        let state = featuregrid(undefined, {type: 'UNKNOWN'});
        expect(state).toExist();
        expect(state.pagination).toExist();
        expect(state.select).toExist();
        expect(state.features).toExist();
    });
    it('toggleShowAgain toggling', () => {
        let state = featuregrid({showAgain: false}, toggleShowAgain());
        expect(state).toExist();
        expect(state.showAgain).toBe(true);
        let state2 = featuregrid({showAgain: true}, toggleShowAgain());
        expect(state2.showAgain).toBe(false);
    });
    it('initPlugin with default roles and groups', () => {
        let state = featuregrid({}, initPlugin({}));
        expect(state).toExist();
        expect(state.editingAllowedRoles.length).toBe(1);
        expect(state.editingAllowedRoles).toEqual(["ADMIN"]);
        expect(state.editingAllowedGroups).toEqual([]);
    });
    it('initPlugin with roles and groups allowed', () => {
        const someValue = "someValue";
        const editingAllowedRoles = [someValue];
        const editingAllowedGroups = [someValue];
        let state = featuregrid({}, initPlugin({editingAllowedRoles, editingAllowedGroups}));
        expect(state).toExist();
        expect(state.editingAllowedRoles.length).toBe(1);
        expect(state.editingAllowedRoles[0]).toBe(someValue);
        expect(state.editingAllowedGroups[0]).toBe(someValue);
    });
    it('openFeatureGrid', () => {
        let state = featuregrid(undefined, openFeatureGrid());
        expect(state).toExist();
        expect(state.open).toBe(true);
    });
    it('closeFeatureGrid', () => {
        let state = featuregrid(undefined, closeFeatureGrid());
        expect(state).toExist();
        expect(state.open).toBe(false);
        expect(state.mode).toBe(MODES.VIEW);
    });
    it('closeFeatureGrid with closer', () => {
        let state = featuregrid(undefined, closeFeatureGrid('closer1'));
        expect(state).toExist();
        expect(state.open).toBe(false);
        expect(state.mode).toBe(MODES.VIEW);
        expect(state.closer).toBe('closer1');
    });

    it('selectFeature', () => {
        // TODO FIX this test or the reducer
        // single select
        let state = featuregrid( undefined, selectFeatures([{id: '1'}, {id: '2'}]));
        expect(state.select).toExist();
        expect(state.select.length).toBe(2);
        expect(state.select[0]).toEqual({id: '1'});
        state = featuregrid( state, selectFeatures([{id: '3'}, {id: '4'}]));
        expect(state.select).toExist();
        expect(state.select.length).toBe(2);
        expect(state.select[0]).toEqual({id: '3'});
        // check multiselect true, append false
        state = featuregrid(undefined, {type: 'UNKNOWN'});
        state = featuregrid({...state, multiselect: true}, selectFeatures([{id: '1'}, {id: '2'}], false));
        expect(state.select).toExist();
        expect(state.select.length).toBe(2);
        expect(state.select[0]).toEqual({id: '1'});

        // check multiselect true, append true and also duplicates
        state = featuregrid( state, selectFeatures([{id: '3'}, {id: '3'}], true));
        expect(state.select).toExist();
        expect(state.select.length).toBe(3);
        expect(state.select[1]).toEqual({id: '2'});
    });

    it('clearSelection', () => {
        let state = featuregrid({select: [1, 2]}, clearSelection());
        expect(state.select).toExist();
        expect(state.select.length).toBe(0);
    });
    it('featureModified', () => {
        const features = [feature1, feature2];
        let updated = [{
            geometry: null,
            id: idFt2
        }, {
            name: "newName",
            id: idFt1
        }];
        let state = featuregrid({select: [1, 2]}, featureModified(features, updated));
        expect(state.changes.length).toBe(2);
        expect(state.select).toExist();
    });
    it('deselectFeature', () => {
        let state = featuregrid( {select: [1, 2], changes: []}, deselectFeatures([1]));
        expect(state.select).toExist();
        expect(state.select[0]).toBe(2);
    });

    it('toggleSelection', () => {
        let state = featuregrid( {select: [1, 2], multiselect: true, changes: []}, toggleSelection([1]));
        expect(state.select).toExist();
        expect(state.select[0]).toBe(2);
        expect(state.select.length).toBe(1);
        state = featuregrid( state, toggleSelection([2]));
        expect(state.select.length).toBe(0);
        state = featuregrid( state, toggleSelection([6]));
        expect(state.select.length).toBe(1);
        expect(state.select[0]).toBe(6);
        state = featuregrid( state, toggleSelection([6]));
        expect(state.select.length).toBe(0);
    });

    it('setFeatures', () => {
        let state = featuregrid( {}, setFeatures(museam.features));
        expect(state.features).toExist();
        expect(state.features.length).toBe(1);
    });
    it('dockSizeFeatures', () => {
        let state = featuregrid( {}, dockSizeFeatures(200));
        expect(state.dockSize).toBe(200);
    });
    it('toggleEditMode edit', () => {
        let state = featuregrid( {}, toggleEditMode());
        expect(state.multiselect).toBeTruthy();
        expect(state.mode).toBe(MODES.EDIT);
        expect(state.tools.settings).toBeFalsy();
    });
    it('toggleViewMode view', () => {
        let state = featuregrid( {}, toggleViewMode());
        expect(state.multiselect).toBeFalsy();
        expect(state.mode).toBe(MODES.VIEW);
    });
    it('featureSaving', () => {
        let state = featuregrid( {}, featureSaving());
        expect(state.saving).toBeTruthy();
        expect(state.loading).toBeTruthy();
    });
    it('saveSuccess', () => {
        let state = featuregrid( {}, saveSuccess());
        expect(state.deleteConfirm).toBeFalsy();
        expect(state.saved).toBeTruthy();
        expect(state.saving).toBeFalsy();
        expect(state.loading).toBeFalsy();
    });
    it('clearChanges', () => {
        let state = featuregrid( {select: [feature1, feature2]}, clearChanges());
        expect(state.deleteConfirm).toBeFalsy();
        expect(state.saved).toBeFalsy();
        expect(state.newFeatures.length).toBe(0);
        expect(state.changes.length).toBe(0);
    });
    it('createNewFeatures', () => {
        let state = featuregrid( {}, createNewFeatures([1]));
        expect(state.deleteConfirm).toBeFalsy();
        expect(state.saved).toBeFalsy();
        expect(state.newFeatures.length).toBe(1);
    });
    it('saveError', () => {
        let state = featuregrid( {}, saveError());
        expect(state.deleteConfirm).toBeFalsy();
        expect(state.saving).toBeFalsy();
        expect(state.loading).toBeFalsy();
    });
    it('setLayer', () => {
        let state = featuregrid( {}, setLayer("TEST_ID"));
        expect(state.selectedLayer).toBe("TEST_ID");
    });
    it('toggleTool', () => {
        let state = featuregrid( {}, toggleTool("toolA"));
        expect(state.tools).toExist();
        expect(state.tools.toolA).toBe(true);
        state = featuregrid( state, toggleTool("toolA"));
        expect(state.tools.toolA).toBe(false);
        state = featuregrid( state, toggleTool("toolA", "value"));
        expect(state.tools.toolA).toBe("value");
    });
    it('customizeAttribute', () => {
        let state = featuregrid( {}, customizeAttribute("attrA", "test", true));
        expect(state.attributes).toExist();
        expect(state.attributes.attrA).toExist();
        expect(state.attributes.attrA.test).toBe(true);
        // auto toggle
        state = featuregrid( state, customizeAttribute("attrA", "test"));
        expect(state.attributes.attrA.test).toBe(false);
        state = featuregrid( state, customizeAttribute("attrA", "test", "value"));
        expect(state.attributes.attrA.test).toBe("value");
        state = featuregrid( state, customizeAttribute("attrA", 'label', "label title"));
        expect(state.attributes.attrA.label).toBe("label title");
    });
    it('startDrawingFeature', () => {
        let state = featuregrid( {drawing: true}, startDrawingFeature());
        expect(state.drawing).toBe(false);
    });
    it('setSelectionOptions({multiselect= false} = {})', () => {
        let state = featuregrid( {}, setSelectionOptions({multiselect: false}));
        expect(state.multiselect).toBe(false);
    });
    it('changePage', () => {
        let state = featuregrid( {}, changePage(1, 4));
        expect(state.pagination.size).toBe(4);
        expect(state.pagination.page).toBe(1);
    });
    it('setPermission', () => {
        let state = featuregrid( {}, setPermission({canEdit: true}));
        expect(state.canEdit).toBe(true);
    });

    it('CHANGE_DRAWING_STATUS', () => {
        let state = featuregrid( {}, changeDrawingStatus("clean"));
        expect(state.drawing).toBe(false);
        state = featuregrid( {drawing: true, pagination: {size: 3}}, changeDrawingStatus("stop"));
        expect(state.drawing).toBe(true);
        expect(state.pagination.size).toBe(3);
    });
    it('DELETE_GEOMETRY_FEATURE', () => {
        let state = featuregrid( {newFeatures: []}, deleteGeometryFeature([feature1]));
        expect(state.changes.length).toBe(1);
        expect(state.newFeatures.length).toBe(0);
        state = featuregrid( {newFeatures: [newfeature3], changes: []}, deleteGeometryFeature([newfeature3]));
        expect(state.changes.length).toBe(0);
        expect(state.newFeatures.length).toBe(1);
    });
    it('GEOMETRY_CHANGED', () => {
        let state = featuregrid( {newFeatures: []}, geometryChanged([feature1]));
        expect(state.changes.length).toBe(1);
        expect(state.newFeatures.length).toBe(0);
        state = featuregrid( state, geometryChanged([feature1, feature2]));
        expect(state.changes.length).toBe(2);

    });
    it('DISABLE_TOOLBAR', () => {
        let state = featuregrid({}, {type: "UNKNOWN"});
        expect(state.disableToolbar).toBeFalsy();
        state = featuregrid({}, disableToolbar(true));
        expect(state.disableToolbar).toBe(true);

        state = featuregrid({}, disableToolbar(false));
        expect(state.disableToolbar).toBe(false);

    });
    it('UPDATE_FILTER', () => {
        const update = {
            attribute: "ATTRIBUTE",
            opeartor: "OPERATOR",
            value: {attribute: "ATTRIBUTE", method: "METHOD_1"},
            rawValue: "RAWVAL"
        };
        let state = featuregrid({}, updateFilter(update));
        expect(state.filters).toExist();
        expect(state.filters[update.attribute]).toExist();
        expect(state.filters[update.attribute].value).toBe(update.value);


        const multiselectUpdate = {...update, value: {attribute: "ATTRIBUTE", method: "METHOD_2"}};
        state = featuregrid(state, updateFilter(multiselectUpdate, true));
        expect(state.filters).toExist();
        expect(state.filters[update.attribute]).toExist();
        expect(state.filters[update.attribute].attribute).toEqual(update.attribute);
        expect(state.filters[update.attribute].value).toEqual(
            [ { attribute: 'ATTRIBUTE', method: 'METHOD_1' },
                { attribute: 'ATTRIBUTE', method: 'METHOD_2' } ]);


        state = featuregrid({}, createQuery("url", {}));
        expect(state.filters).toExist();
        expect(state.filters[update.attribute]).toNotExist();

    });
    it('featureTypeLoaded', () => {
        let state = featuregrid( {}, featureTypeLoaded("typeName", {
            original: {featureTypes: [
                {
                    properties: [
                        {},
                        {localType: "Point"}
                    ]
                }]}}));
        expect(state.localType).toBe("Point");

    });
    it('SIZE_CHANGE', () => {
        let state = featuregrid({}, sizeChange(0.5, {maxDockSize: 0.7, minDockSize: 0.1}));
        expect(state.dockSize).toBe(0.5);
        state = featuregrid({}, sizeChange(0.8, {maxDockSize: 0.7, minDockSize: 0.1}));
        expect(state.dockSize).toBe(0.7);
        state = featuregrid({}, sizeChange(0.05, {maxDockSize: 0.7, minDockSize: 0.1}));
        expect(state.dockSize).toBe(0.1);
        state = featuregrid({}, sizeChange(0.5));
        expect(state.dockSize).toBe(0.5);
    });
    it("storeAdvancedSearchFilter", () => {
        const filterObj = {test: 'test'};
        let state = featuregrid({selectedLayer: "test_layer"}, storeAdvancedSearchFilter(filterObj));
        expect(state.advancedFilters.test_layer).toBe(filterObj);
    });
    it('setUp', () => {
        expect(featuregrid({}, setUp({ showFilteredObject: true })).showFilteredObject).toBe(true);
        expect(featuregrid({}, setUp({ timeSync: true })).timeSync).toBe(true);
        expect(featuregrid({}, setUp({ showTimeSync: true })).showTimeSync).toBe(true);
    });
    it('setTimeSync ', () => {
        expect(featuregrid({}, setTimeSync(true)).timeSync).toBe(true);
        expect(featuregrid({}, setTimeSync(false)).timeSync).toBe(false);
    });
    it('setPagination', () => {
        const newState = featuregrid(undefined, setPagination(10000));
        expect(paginationSelector({ featuregrid: newState })).toEqual({page: 0, size: 10000});
    });
    describe('updateQuery', () => {
        it('when useLayerFilter is specified, update it', () => {
            expect(
                useLayerFilterSelector({
                    featuregrid: featuregrid(undefined, updateQuery({useLayerFilter: true}))
                })
            ).toEqual(true); // default is true from selector
            expect(
                useLayerFilterSelector({
                    featuregrid: featuregrid(undefined, updateQuery({useLayerFilter: false}))
                })
            ).toEqual(false); // from the default is set to false
            expect(
                useLayerFilterSelector({
                    featuregrid: featuregrid({useLayerFilter: false}, updateQuery({useLayerFilter: true}))
                })
            ).toEqual(true); // remains true
            expect(
                useLayerFilterSelector({
                    featuregrid: featuregrid({useLayerFilter: true}, updateQuery({useLayerFilter: false}))
                })
            ).toEqual(false); // changes to false
            expect(
                useLayerFilterSelector({
                    featuregrid: featuregrid({useLayerFilter: false}, updateQuery({useLayerFilter: false}))
                })
            ).toEqual(false); // remains false

        });
        it('when useLayerFilter is not specified, nothing changes', () => {
            expect(
                useLayerFilterSelector({
                    featuregrid: featuregrid(undefined, updateQuery())
                })
            ).toEqual(true); // default is true from selector
            expect(
                useLayerFilterSelector({
                    featuregrid: featuregrid({useLayerFilter: true}, updateQuery())
                })
            ).toEqual(true); // remains true
            expect(
                useLayerFilterSelector({
                    featuregrid: featuregrid({useLayerFilter: false}, updateQuery())
                })
            ).toEqual(false); // remains false
        });

    });

    it('setViewportFilter', () => {
        const newState = featuregrid(undefined, setViewportFilter(true));
        expect(isViewportFilterActive({ featuregrid: newState })).toEqual(true);
    });
    it('configureMap', () => {
        const featureGrid = {attributes: {col1: {hide: true}}};
        const newState = featuregrid(undefined, configureMap({featureGrid}));
        expect(newState.attributes).toEqual(featureGrid.attributes);
    });
});
