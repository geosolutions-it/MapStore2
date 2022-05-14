/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import './queryform.css';

import PropTypes from 'prop-types';
import React from 'react';
import Spinner from 'react-spinkit';

import BorderLayout from '../../layout/BorderLayout';
import CrossLayerFilterComp from './CrossLayerFilter';
import crossLayerFilterEnhancer from './enhancers/crossLayerFilter';
import GroupField from './GroupField';
import QueryToolbar from './QueryToolbar';
import SpatialFilter from './SpatialFilter';
import QueryPanelHeader from './QueryPanelHeader';

const CrossLayerFilter = crossLayerFilterEnhancer(CrossLayerFilterComp);

class QueryBuilder extends React.Component {
    static propTypes = {
        params: PropTypes.object,
        featureTypeConfigUrl: PropTypes.string,
        useMapProjection: PropTypes.bool,
        attributes: PropTypes.array,
        featureTypeError: PropTypes.string,
        featureTypeErrorText: PropTypes.node,
        groupLevels: PropTypes.number,
        maxFeaturesWPS: PropTypes.number,
        filterFields: PropTypes.array,
        groupFields: PropTypes.array,
        spatialField: PropTypes.object,
        removeButtonIcon: PropTypes.string,
        addButtonIcon: PropTypes.string,
        attributePanelExpanded: PropTypes.bool,
        showDetailsButton: PropTypes.bool,
        spatialPanelExpanded: PropTypes.bool,
        crossLayerExpanded: PropTypes.bool,
        showDetailsPanel: PropTypes.bool,
        toolbarEnabled: PropTypes.bool,
        searchUrl: PropTypes.string,
        showGeneratedFilter: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.string
        ]),
        filterType: PropTypes.string,
        featureTypeName: PropTypes.string,
        ogcVersion: PropTypes.string,
        attributeFilterActions: PropTypes.object,
        spatialFilterActions: PropTypes.object,
        queryToolbarActions: PropTypes.object,
        resultTitle: PropTypes.string,
        pagination: PropTypes.object,
        sortOptions: PropTypes.object,
        spatialOperations: PropTypes.array,
        spatialMethodOptions: PropTypes.array,
        crossLayerFilterOptions: PropTypes.object,
        crossLayerFilterActions: PropTypes.object,
        hits: PropTypes.bool,
        clearFilterOptions: PropTypes.object,
        buttonStyle: PropTypes.string,
        removeGroupButtonIcon: PropTypes.string,
        maxHeight: PropTypes.number,
        allowEmptyFilter: PropTypes.bool,
        autocompleteEnabled: PropTypes.bool,
        emptyFilterWarning: PropTypes.bool,
        header: PropTypes.node,
        zoom: PropTypes.number,
        projection: PropTypes.string,
        toolsOptions: PropTypes.object,
        appliedFilter: PropTypes.object,
        storedFilter: PropTypes.object,
        advancedToolbar: PropTypes.bool,
        loadingError: PropTypes.bool,
        controlActions: PropTypes.object
    };

    static defaultProps = {
        params: {},
        featureTypeConfigUrl: null,
        useMapProjection: true,
        groupLevels: 1,
        buttonStyle: "default",
        removeGroupButtonIcon: "trash",
        groupFields: [],
        filterFields: [],
        attributes: [],
        spatialMethodOptions: [],
        spatialOperations: [],
        featureTypeError: "",
        spatialField: {},
        crossLayerFilter: null,
        removeButtonIcon: "trash",
        addButtonIcon: "glyphicon glyphicon-plus",
        attributePanelExpanded: true,
        spatialPanelExpanded: true,
        showDetailsPanel: false,
        toolbarEnabled: true,
        searchUrl: "",
        showGeneratedFilter: false,
        featureTypeName: null,
        pagination: null,
        sortOptions: null,
        hits: false,
        maxHeight: 830,
        allowEmptyFilter: false,
        autocompleteEnabled: true,
        emptyFilterWarning: false,
        advancedToolbar: false,
        loadingError: false,
        attributeFilterActions: {
            onAddGroupField: () => {},
            onAddFilterField: () => {},
            onRemoveFilterField: () => {},
            onUpdateFilterField: () => {},
            onUpdateExceptionField: () => {},
            onUpdateLogicCombo: () => {},
            onRemoveGroupField: () => {},
            onChangeCascadingValue: () => {},
            onExpandAttributeFilterPanel: () => {}
        },
        spatialFilterActions: {
            onExpandSpatialFilterPanel: () => {},
            onSelectSpatialMethod: () => {},
            onSelectSpatialOperation: () => {},
            onChangeDrawingStatus: () => {},
            onRemoveSpatialSelection: () => {},
            onShowSpatialSelectionDetails: () => {},
            onSelectViewportSpatialMethod: () => {},
            onChangeDwithinValue: () => {}
        },
        crossLayerFilterOptions: {

        },
        crossLayerFilterActions: {

        },
        queryToolbarActions: {
            onQuery: () => {},
            onReset: () => {},
            onChangeDrawingStatus: () => {},
            onSaveFilter: () => {},
            onRestoreFilter: () => {}
        },
        toolsOptions: {},
        controlActions: {
            onToggleQuery: () => {}
        }
    };

    render() {
        if (this.props.featureTypeError !== "") {
            return (<div>
                <QueryPanelHeader onToggleQuery={this.props.controlActions.onToggleQuery}/>
                <div style={{margin: "0 auto", "text-align": "center"}}>{this.props.featureTypeErrorText}</div>
            </div>);
        }

        const header = (<div className="m-header">{this.props.header}
            <QueryToolbar
                sendFilters={{
                    attributeFilter: this.props.attributePanelExpanded,
                    spatialFilter: this.props.spatialPanelExpanded,
                    crossLayerFilter: this.props.crossLayerExpanded
                }}
                params={this.props.params}
                filterFields={this.props.filterFields}
                groupFields={this.props.groupFields}
                spatialField={this.props.spatialField}
                toolbarEnabled={this.props.toolbarEnabled}
                searchUrl={this.props.searchUrl}
                showGeneratedFilter={this.props.showGeneratedFilter}
                featureTypeName={this.props.featureTypeName}
                ogcVersion={this.props.ogcVersion}
                filterType={this.props.filterType}
                actions={this.props.queryToolbarActions}
                resultTitle={this.props.resultTitle}
                pagination={this.props.pagination}
                sortOptions={this.props.sortOptions}
                crossLayerFilter={this.props.crossLayerFilterOptions.crossLayerFilter}
                hits={this.props.hits}
                allowEmptyFilter={this.props.allowEmptyFilter}
                emptyFilterWarning={this.props.emptyFilterWarning}
                appliedFilter={this.props.appliedFilter}
                storedFilter={this.props.storedFilter}
                advancedToolbar={this.props.advancedToolbar}
                loadingError={this.props.loadingError}
            /></div>);
        return this.props.attributes.length > 0 ?
            <BorderLayout header={header} className="mapstore-query-builder" id="query-form-panel">
                <GroupField
                    buttonStyle={this.props.buttonStyle}
                    removeGroupButtonIcon={this.props.removeGroupButtonIcon}
                    autocompleteEnabled={this.props.autocompleteEnabled}
                    maxFeaturesWPS={this.props.maxFeaturesWPS}
                    attributes={this.props.attributes}
                    groupLevels={this.props.groupLevels}
                    filterFields={this.props.filterFields}
                    groupFields={this.props.groupFields}
                    removeButtonIcon={this.props.removeButtonIcon}
                    addButtonIcon={this.props.addButtonIcon}
                    attributePanelExpanded={this.props.attributePanelExpanded}
                    actions={this.props.attributeFilterActions}/>
                {this.props.toolsOptions.hideSpatialFilter ? null : <SpatialFilter
                    useMapProjection={this.props.useMapProjection}
                    spatialField={this.props.spatialField}
                    clearFilterOptions={this.props.clearFilterOptions}
                    spatialOperations={this.props.spatialOperations}
                    spatialMethodOptions={this.props.spatialMethodOptions}
                    showDetailsButton={this.props.showDetailsButton}
                    spatialPanelExpanded={this.props.spatialPanelExpanded}
                    showDetailsPanel={this.props.showDetailsPanel}
                    actions={this.props.spatialFilterActions}
                    zoom={this.props.zoom}
                    projection={this.props.projection}/>}
                {this.props.toolsOptions.hideCrossLayer ? null : <CrossLayerFilter
                    spatialOperations={this.props.spatialOperations}
                    crossLayerExpanded={this.props.crossLayerExpanded}
                    searchUrl={this.props.searchUrl}
                    featureTypeName={this.props.featureTypeName}
                    {...this.props.crossLayerFilterOptions}
                    {...this.props.crossLayerFilterActions}
                />}
            </BorderLayout>
            : <div style={{margin: "0 auto", width: "60px"}}><Spinner spinnerName="three-bounce" overrideSpinnerClassName="spinner"/></div>;
    }
}

export default QueryBuilder;
