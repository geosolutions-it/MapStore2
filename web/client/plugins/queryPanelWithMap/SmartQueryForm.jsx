/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';


import { toggleControl } from '../../actions/controls';
import { changeDrawingStatus } from '../../actions/draw';
import { applyFilter, discardCurrentFilter, storeCurrentFilter } from '../../actions/layerFilter';
import {
    addCrossLayerFilterField,
    addFilterField,
    addGroupField,
    changeCascadingValue,
    changeDwithinValue,
    changeSpatialFilterValue,
    expandAttributeFilterPanel,
    expandCrossLayerFilterPanel,
    expandSpatialFilterPanel,
    removeCrossLayerFilterField,
    removeFilterField,
    removeGroupField,
    removeSpatialSelection,
    reset,
    resetCrossLayerFilter,
    search,
    selectSpatialMethod,
    selectSpatialOperation,
    selectViewportSpatialMethod,
    setCrossLayerFilterParameter,
    showSpatialSelectionDetails,
    toggleMenu,
    updateCrossLayerFilterField,
    updateExceptionField,
    updateFilterField,
    updateLogicCombo,
    zoneChange,
    zoneGetValues,
    zoneSearch
} from '../../actions/queryform';
import QueryBuilder from '../../components/data/query/QueryBuilder';

import { mapSelector } from '../../selectors/map';
import {
    availableCrossLayerFilterLayersSelector,
    crossLayerFilterSelector
} from '../../selectors/queryform';


const onReset = reset.bind(null, "query");
// connecting a Dumb component to the store
// makes it a smart component
// we both connect state => props
// and actions to event handlers

const SmartQueryForm = connect((state) => {
    return {
        // QueryBuilder props
        useMapProjection: state.queryform.useMapProjection,
        groupLevels: state.queryform.groupLevels,
        groupFields: state.queryform.groupFields,
        filterFields: state.queryform.filterFields,
        attributes: state.query && state.query.typeName && state.query.featureTypes && state.query.featureTypes[state.query.typeName] && state.query.featureTypes[state.query.typeName].attributes,
        featureTypeError: state.query && state.query.typeName && state.query.featureTypes && state.query.featureTypes[state.query.typeName] && state.query.featureTypes[state.query.typeName].error,
        spatialField: state.queryform.spatialField,
        filters: state.queryform.filters,
        showDetailsPanel: state.queryform.showDetailsPanel,
        toolbarEnabled: state.queryform.toolbarEnabled,
        attributePanelExpanded: state.queryform.attributePanelExpanded,
        autocompleteEnabled: state.queryform.autocompleteEnabled,
        crossLayerExpanded: state.queryform.crossLayerExpanded,
        crossLayerFilterOptions: {
            layers: availableCrossLayerFilterLayersSelector(state),
            crossLayerFilter: crossLayerFilterSelector(state),
            ...(state.queryform.crossLayerFilterOptions || {})
        },
        maxFeaturesWPS: state.queryform.maxFeaturesWPS,
        spatialPanelExpanded: state.queryform.spatialPanelExpanded,
        featureTypeConfigUrl: state.query && state.query.url,
        searchUrl: state.query && state.query.url,
        featureTypeName: state.query && state.query.typeName,
        ogcVersion: "1.1.0",
        params: {typeName: state.query && state.query.typeName},
        resultTitle: "Query Result",
        showGeneratedFilter: false,
        allowEmptyFilter: true,
        emptyFilterWarning: true,
        maxHeight: state.map && state.map.present && state.map.present.size && state.map.present.size.height,
        zoom: (mapSelector(state) || {}).zoom,
        projection: (mapSelector(state) || {}).projection
    };
}, dispatch => {
    return {
        attributeFilterActions: bindActionCreators({
            onAddGroupField: addGroupField,
            onAddFilterField: addFilterField,
            onRemoveFilterField: removeFilterField,
            onUpdateFilterField: updateFilterField,
            onUpdateExceptionField: updateExceptionField,
            onUpdateLogicCombo: updateLogicCombo,
            onRemoveGroupField: removeGroupField,
            onChangeCascadingValue: changeCascadingValue,
            toggleMenu: toggleMenu,
            onExpandAttributeFilterPanel: expandAttributeFilterPanel
        }, dispatch),
        spatialFilterActions: bindActionCreators({
            onChangeSpatialFilterValue: changeSpatialFilterValue,
            onExpandSpatialFilterPanel: expandSpatialFilterPanel,
            onSelectSpatialMethod: selectSpatialMethod,
            onSelectViewportSpatialMethod: selectViewportSpatialMethod,
            onSelectSpatialOperation: selectSpatialOperation,
            onChangeDrawingStatus: changeDrawingStatus,
            onRemoveSpatialSelection: removeSpatialSelection,
            onShowSpatialSelectionDetails: showSpatialSelectionDetails,
            onChangeDwithinValue: changeDwithinValue,
            zoneFilter: zoneGetValues,
            zoneSearch,
            zoneChange
        }, dispatch),
        queryToolbarActions: bindActionCreators({
            onQuery: search,
            onReset,
            onSaveFilter: storeCurrentFilter,
            onRestoreFilter: discardCurrentFilter,
            storeAppliedFilter: applyFilter,
            onChangeDrawingStatus: changeDrawingStatus

        }, dispatch),
        crossLayerFilterActions: bindActionCreators({
            expandCrossLayerFilterPanel,
            setCrossLayerFilterParameter,
            addCrossLayerFilterField,
            updateCrossLayerFilterField,
            removeCrossLayerFilterField,
            resetCrossLayerFilter,
            toggleMenu: (rowId, status) => toggleMenu(rowId, status,  "crossLayer")
        }, dispatch),
        controlActions: bindActionCreators({onToggleQuery: toggleControl.bind(null, 'queryPanelWithMap', null)}, dispatch)
    };
})(QueryBuilder);

export default SmartQueryForm;
