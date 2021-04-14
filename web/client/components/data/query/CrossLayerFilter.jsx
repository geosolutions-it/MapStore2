/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import Message from '../../I18N/Message';
import SwitchPanel from '../../misc/switch/SwitchPanel';
import { Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import GeometricOperationSelector from './GeometricOperationSelector';
import GroupField from './GroupField';
import { isSameUrl } from '../../../utils/URLUtils';
import InfoPopover from '../../widgets/widget/InfoPopover';

const isSameOGCServiceRoot = (origSearchUrl, {search, url} = {}) => isSameUrl(origSearchUrl, url) || isSameUrl(origSearchUrl, (search && search.url));
// bbox make not sense with cross layer filter
const getAllowedSpatialOperations = (spatialOperations) => (spatialOperations || []).filter( ({id} = {}) => id !== "BBOX");

export default ({
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
                        autocompleteEnabled
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
