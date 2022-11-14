/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import Message from '../../components/I18N/Message';
import SwitchPanel from '../../components/misc/switch/SwitchPanel';
import { Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import GeometricOperationSelector from '../../components/data/query/GeometricOperationSelector';
import GroupField from '../../components/data/query/GroupField';
import { isSameUrl } from '../../utils/URLUtils';
import InfoPopover from '../../components/widgets/widget/InfoPopover';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {
    addCrossLayerFilterField as _addCrossLayerFilterField,
    expandCrossLayerFilterPanel as _expandCrossLayerFilterPanel,
    removeCrossLayerFilterField as _removeCrossLayerFilterField,
    resetCrossLayerFilter as _resetCrossLayerFilter,
    setCrossLayerFilterParameter as _setCrossLayerFilterParameter,
    toggleMenu as _toggleMenu,
    updateCrossLayerFilterField as _updateCrossLayerFilterField
} from "../../actions/queryform";
import {compose, withProps} from "recompose";
import crossLayerFilterEnhancer from "../../components/data/query/enhancers/crossLayerFilter";
import {availableCrossLayerFilterLayersSelector, crossLayerFilterSelector} from "../../selectors/queryform";

const isSameOGCServiceRoot = (origSearchUrl, {search, url} = {}) => isSameUrl(origSearchUrl, url) || isSameUrl(origSearchUrl, (search && search.url));
// bbox make not sense with cross layer filter
const getAllowedSpatialOperations = (spatialOperations) => (spatialOperations || []).filter( ({id} = {}) => id !== "BBOX");

const CrossLayerFilterComponent = ({
    crossLayerExpanded = true,
    spatialOperations,
    expandCrossLayerFilterPanel = () => {},
    layers = [],
    errorObj,
    loadingAttributes,
    loadingCapabilities,
    searchUrl,
    queryCollection = {},
    attributes = [],
    operation,
    updateLogicCombo = () => {},
    resetCrossLayerFilter = () => {},
    setOperation = () => {},
    setQueryCollectionParameter = () => {},
    addCrossLayerFilterField = () => {},
    updateCrossLayerFilterField = () => {},
    removeCrossLayerFilterField = () => {},
    toggleMenu = () => {}
} = {}) => {
    const {typeName, geometryName, filterFields, groupFields = [{
        id: 1,
        logic: "OR",
        index: 0
    }]} = queryCollection;

    const unMatchingLayerOptions = layers
        .filter( l => !isSameOGCServiceRoot(searchUrl, l));

    const renderUnMatchingLayersInfo = () => {
        if (layers.length && unMatchingLayerOptions.length) {
            return (<InfoPopover bsStyle="link" text={<Message msgId="queryform.crossLayerFilter.errors.layersExcluded" />}/>);
        }
        return null;
    };
    return (<SwitchPanel
        loading={loadingCapabilities}
        expanded={crossLayerExpanded && !loadingCapabilities && !errorObj}
        error={errorObj}
        errorMsgId={"queryPanel"}
        buttons={[
            ...(typeName ? [{
                glyph: 'clear-filter',
                tooltipId: "queryform.crossLayerFilter.clear",
                onClick: () => resetCrossLayerFilter()
            }] : [])
        ]}
        onSwitch={expandCrossLayerFilterPanel}
        title={<Message msgId="queryform.crossLayerFilter.title" />} >
        <Row className="inline-form filter-field-fixed-row">
            <Col xs={6}>
                <div>
                    <Message msgId="queryform.crossLayerFilter.targetLayer"/>&nbsp;
                    { renderUnMatchingLayersInfo() }
                </div>

            </Col>
            <Col xs={6}>
                <Select
                    clearable={false}
                    disabled={loadingCapabilities || !!errorObj}
                    isLoading={loadingAttributes}
                    options={layers
                        .filter( l => isSameOGCServiceRoot(searchUrl, l))
                        .map( l => ({
                            label: l.title || l.name,
                            value: l.name
                        }))}
                    placeholder={<Message msgId="queryform.crossLayerFilter.placeholder" />}
                    filter="contains"
                    value={typeName}
                    onChange={ sel => {
                        setQueryCollectionParameter("typeName", sel && sel.value);
                    }}/>
            </Col>
        </Row>
        {(typeName && geometryName)
            ? (<Row className="inline-form filter-field-fixed-row">
                <Col xs={6}>
                    <div><Message msgId="queryform.crossLayerFilter.operation"/></div>
                </Col>
                <Col xs={6}>
                    <GeometricOperationSelector
                        value={operation}
                        onChange={({id} = {}) => setOperation(id)}
                        spatialOperations={getAllowedSpatialOperations(spatialOperations)}
                    />
                </Col>
            </Row>)
            : null}
        {(typeName && geometryName && operation)
            ? (<Row className="filter-field-fixed-row">
                <Col xs={12}>
                    <GroupField
                        dropUp
                        autocompleteEnabled
                        withContainer={false}
                        attributes={attributes}
                        groupLevels={-1}
                        filterFields={filterFields}
                        actions={{
                            onUpdateLogicCombo: updateLogicCombo,
                            onAddFilterField: addCrossLayerFilterField,
                            onUpdateFilterField: updateCrossLayerFilterField,
                            onRemoveFilterField: removeCrossLayerFilterField,
                            toggleMenu: toggleMenu
                        }}
                        groupFields={groupFields} filterField/>
                </Col>
            </Row>)
            : null}
    </SwitchPanel>);
};

//                     spatialOperations={this.props.spatialOperations}
//                     crossLayerExpanded={this.props.crossLayerExpanded}
//                     searchUrl={this.props.searchUrl}
//                     featureTypeName={this.props.featureTypeName}
//                     {...this.props.crossLayerFilterOptions}
//                     {...this.props.crossLayerFilterActions}

const CrossLayerFilter = compose(
    connect((state) => {
        return {
            attributes: state.query && state.query.typeName && state.query.featureTypes && state.query.featureTypes[state.query.typeName] && state.query.featureTypes[state.query.typeName].attributes,
            crossLayerExpanded: state.queryform.crossLayerExpanded,
            crossLayerFilterOptions: {
                layers: availableCrossLayerFilterLayersSelector(state),
                crossLayerFilter: crossLayerFilterSelector(state),
                ...(state.queryform.crossLayerFilterOptions || {})
            },
            searchUrl: state.query && state.query.url,
            featureTypeName: state.query && state.query.typeName
        };
    }, dispatch => {
        return {
            crossLayerFilterActions: bindActionCreators({
                expandCrossLayerFilterPanel: _expandCrossLayerFilterPanel,
                setCrossLayerFilterParameter: _setCrossLayerFilterParameter,
                addCrossLayerFilterField: _addCrossLayerFilterField,
                updateCrossLayerFilterField: _updateCrossLayerFilterField,
                removeCrossLayerFilterField: _removeCrossLayerFilterField,
                resetCrossLayerFilter: _resetCrossLayerFilter,
                toggleMenu: (rowId, status) => _toggleMenu(rowId, status,  "crossLayer")
            }, dispatch)
        };
    }),
    withProps(({ crossLayerFilterOptions, crossLayerFilterActions }) => ({
        ...crossLayerFilterOptions,
        ...crossLayerFilterActions
    })),
    crossLayerFilterEnhancer
)(CrossLayerFilterComponent);

export default CrossLayerFilter;
