/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const Message = require('../../I18N/Message');

const SwitchPanel = require('../../misc/switch/SwitchPanel');
const {Row, Col} = require('react-bootstrap');
const Select = require('react-select').default;


const GeometricOperationSelector = require('./GeometricOperationSelector');
const GroupField = require('./GroupField');
const {isSameUrl} = require('../../../utils/URLUtils');


const isSameOGCServiceRoot = (origSearchUrl, {search, url} = {}) => isSameUrl(origSearchUrl, url) || isSameUrl(origSearchUrl, (search && search.url));
// bbox make not sense with cross layer filter
const getAllowedSpatialOperations = (spatialOperations) => (spatialOperations || []).filter( ({id} = {}) => id !== "BBOX");

module.exports = ({
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
    removeCrossLayerFilterField = () => {}
} = {}) => {
    const {typeName, geometryName, filterFields, groupFields = [{
        id: 1,
        logic: "OR",
        index: 0
    }]} = queryCollection;

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
                <div><Message msgId="queryform.crossLayerFilter.targetLayer"/></div>
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
                        autocompleteEnabled={false /* TODO make it work with stream enhancer */}
                        withContainer={false}
                        attributes={attributes}
                        groupLevels={-1}
                        filterFields={filterFields}
                        actions={{
                            onUpdateLogicCombo: updateLogicCombo,
                            onAddFilterField: addCrossLayerFilterField,
                            onUpdateFilterField: updateCrossLayerFilterField,
                            onRemoveFilterField: removeCrossLayerFilterField
                        }}
                        groupFields={groupFields} filterField/>
                </Col>
            </Row>)
            : null}
    </SwitchPanel>);
};
