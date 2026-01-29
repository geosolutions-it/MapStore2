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
import {upperFirst} from "lodash/string";


function overrideItem(item, overrides = [], layerName) {
    let replacement;
    replacement = overrides.find(i => i.target === item.id);
    if (replacement?.layerNameRegex) {
        const regexp = new RegExp(replacement.layerNameRegex);
        if (!regexp.test(layerName)) replacement = null;
    }
    return replacement ?? item;
}

const EmptyComponent = () => {
    return null;
};

function handleRemoved(item) {
    return item.plugin ? item : {
        ...item,
        plugin: EmptyComponent
    };
}

function mergeItems(standard = [], overrides, layerName) {
    return standard
        .map(item => overrideItem(item, overrides, layerName))
        .map(handleRemoved);
}

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
        filters: PropTypes.array,
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
        standardItems: PropTypes.object,
        items: PropTypes.array,
        selectedLayer: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
        style: PropTypes.object
    };

    static defaultProps = {
        params: {},
        buttonStyle: "default",
        removeGroupButtonIcon: "trash",
        groupFields: [],
        filterFields: [],
        filters: [],
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
        items: [],
        selectedLayer: false,
        standardItems: {},
        style: {}
    };

    getItems = (target) => {
        const layerName = this.props.selectedLayer;
        const filtered = this.props.items.filter(this.filterItem(target, layerName));
        const merged = mergeItems(this.props.standardItems[target], this.props.items, layerName)
            .map(item => ({
                ...item,
                target
            }));
        return [...merged, ...filtered]
            .sort((i1, i2) => (i1.position ?? 0) - (i2.position ?? 0));
    };

    renderItem = (item, opts) => {
        const {validations, ...options } = opts;
        const Comp = item.component ?? item.plugin;
        const {style, ...other} = this.props;
        const itemOptions = this.props[item.id + "Options"];
        // this allows "hideSpatialFilter", "hideCrossLayer" options
        const hideItem = options[`hide${upperFirst(item.id)}`] === true;
        return hideItem ? null : <Comp role="body" {...other} {...item.cfg} {...options} {...itemOptions} validation={validations?.[item.id ?? item.name]}/>;
    };

    renderItems = (target, options) => {
        return this.getItems(target)
            .map(item => this.renderItem(item, options));
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
                filters={this.props.filters}
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
                queryBtnGlyph="ok"
            /></div>);
        const { spatialMethodOptions, toolsOptions, spatialOperations} = this.props;
        return this.props.attributes.length > 0 ?
            <>
                <BorderLayout header={header} className="mapstore-query-builder" id="query-form-panel">
                    {this.renderItems('start', { spatialOperations, spatialMethodOptions, ...toolsOptions })}
                    {this.renderItems('attributes', { spatialOperations, spatialMethodOptions, ...toolsOptions })}
                    {this.renderItems('afterAttributes', { spatialOperations, spatialMethodOptions, ...toolsOptions })}
                    {this.renderItems('spatial', { spatialOperations, spatialMethodOptions, ...toolsOptions })}
                    {this.renderItems('afterSpatial', { spatialOperations, spatialMethodOptions, ...toolsOptions })}
                    {this.renderItems('layers', { spatialOperations, spatialMethodOptions, ...toolsOptions })}
                    {this.renderItems('end', { spatialOperations, spatialMethodOptions, ...toolsOptions })}
                </BorderLayout>
                {this.renderItems('map', { spatialOperations, spatialMethodOptions, ...toolsOptions })}
            </>
            : <div className="spinner-panel" style={{margin: "0 auto", width: "60px"}}><Spinner spinnerName="three-bounce" overrideSpinnerClassName="spinner"/></div>;
    }

    filterItem = (target, layerName) => (el) => {
        if (el.layerNameRegex) {
            const regexp = new RegExp(el.layerNameRegex);
            return (!target || el.target === target) && regexp.test(layerName);
        }
        return (!target || el.target === target);
    }
}

export default QueryBuilder;
