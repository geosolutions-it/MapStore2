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
import QueryToolbar from './QueryToolbar';
import QueryPanelHeader from './QueryPanelHeader';


class QueryBuilder extends React.Component {
    static propTypes = {
        params: PropTypes.object,
        attributes: PropTypes.array,
        featureTypeError: PropTypes.string,
        featureTypeErrorText: PropTypes.node,
        filterFields: PropTypes.array,
        groupFields: PropTypes.array,
        spatialField: PropTypes.object,
        attributePanelExpanded: PropTypes.bool,
        spatialPanelExpanded: PropTypes.bool,
        crossLayerExpanded: PropTypes.bool,
        toolbarEnabled: PropTypes.bool,
        searchUrl: PropTypes.string,
        showGeneratedFilter: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.string
        ]),
        filterType: PropTypes.string,
        featureTypeName: PropTypes.string,
        ogcVersion: PropTypes.string,
        queryToolbarActions: PropTypes.object,
        resultTitle: PropTypes.string,
        pagination: PropTypes.object,
        sortOptions: PropTypes.object,
        spatialOperations: PropTypes.array,
        spatialMethodOptions: PropTypes.array,
        crossLayerFilterOptions: PropTypes.object,
        hits: PropTypes.bool,
        buttonStyle: PropTypes.string,
        maxHeight: PropTypes.number,
        allowEmptyFilter: PropTypes.bool,
        emptyFilterWarning: PropTypes.bool,
        header: PropTypes.node,
        zoom: PropTypes.number,
        projection: PropTypes.string,
        toolsOptions: PropTypes.object,
        appliedFilter: PropTypes.object,
        storedFilter: PropTypes.object,
        advancedToolbar: PropTypes.bool,
        loadingError: PropTypes.bool,
        controlActions: PropTypes.object,
        getItems: PropTypes.func,
        renderItems: PropTypes.func
    };

    static defaultProps = {
        params: {},
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
        attributePanelExpanded: true,
        spatialPanelExpanded: true,
        toolbarEnabled: true,
        searchUrl: "",
        showGeneratedFilter: false,
        featureTypeName: null,
        pagination: null,
        sortOptions: null,
        hits: false,
        maxHeight: 830,
        allowEmptyFilter: false,
        emptyFilterWarning: false,
        advancedToolbar: false,
        loadingError: false,
        crossLayerFilterOptions: {},
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
        },
        renderItems: () => {},
        getItems: () => {}
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
        const { spatialMethodOptions, toolsOptions, spatialOperations} = this.props;
        return this.props.attributes.length > 0 ?
            <BorderLayout header={header} className="mapstore-query-builder" id="query-form-panel">
                {this.props.renderItems('start', { spatialOperations, spatialMethodOptions, toolsOptions })}
                {this.props.renderItems('attributes', { spatialOperations, spatialMethodOptions, toolsOptions })}
                {this.props.renderItems('afterAttributes', { spatialOperations, spatialMethodOptions, toolsOptions })}
                {this.props.renderItems('spatial', { spatialOperations, spatialMethodOptions, toolsOptions })}
                {this.props.renderItems('afterSpatial', { spatialOperations, spatialMethodOptions, toolsOptions })}
                {this.props.renderItems('crossLayer', { spatialOperations, spatialMethodOptions, toolsOptions })}
                {this.props.renderItems('end', { spatialOperations, spatialMethodOptions, toolsOptions })}
            </BorderLayout>
            : <div style={{margin: "0 auto", width: "60px"}}><Spinner spinnerName="three-bounce" overrideSpinnerClassName="spinner"/></div>;
    }
}

export default QueryBuilder;
