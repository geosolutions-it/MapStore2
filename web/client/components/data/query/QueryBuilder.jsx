const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const GroupField = require('./GroupField');
const SpatialFilter = require('./SpatialFilter');
const QueryToolbar = require('./QueryToolbar');
const crossLayerFilterEnhancer = require('./enhancers/crossLayerFilter');
const CrossLayerFilter = crossLayerFilterEnhancer(require('./CrossLayerFilter'));
const BorderLayout = require('../../layout/BorderLayout');

const Spinner = require('react-spinkit');

require('./queryform.css');

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
        loadingError: PropTypes.bool
    };

    static defaultProps = {
        params: {},
        featureTypeConfigUrl: null,
        useMapProjection: true,
        groupLevels: 1,
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
        toolsOptions: {}
    };

    render() {
        if (this.props.featureTypeError !== "") {
            return <div style={{margin: "0 auto", "text-align": "center"}}>{this.props.featureTypeErrorText}</div>;
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
                    spatialOperations={this.props.spatialOperations}
                    spatialMethodOptions={this.props.spatialMethodOptions}
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

module.exports = QueryBuilder;
