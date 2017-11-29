/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {get, find} = require('lodash');
const {Observable} = require('rxjs');
const {describeFeatureType} = require('../../../observables/wfs');
const {findGeometryProperty} = require('../../../utils/ogc/WFS/base');
const {describeFeatureTypeToAttributes} = require('../../../utils/FeatureTypeUtils');
const SwitchPanel = require('../../misc/switch/SwitchPanel');
const {Row, Col} = require('react-bootstrap');
const Select = require('react-select');
const {compose, withProps, withPropsOnChange, withHandlers, defaultProps} = require('recompose');
const propsStreamFactory = require('../../misc/enhancers/propsStreamFactory');
const GeometricOperationSelector = require('./GeometricOperationSelector');
const GroupField = require('./GroupField');

const crossLayerFilterEnhancer = compose(
    withPropsOnChange(
        ['crossLayerFilter'],
        ({crossLayerFilter = {}} = {}) => ({
            queryCollection: get(crossLayerFilter, 'collectGeometries.queryCollection'),
            operation: get(crossLayerFilter, 'operation'),
            distance: get(crossLayerFilter, 'distance')
        })),
    withProps(({layers = [], queryCollection = {}} = {}) => ({
        layer: find(layers, ({name} = {}) => name === queryCollection.typeName)
    })),
    withHandlers({
        setQueryCollectionParameter: ({setCrossLayerFilterParameter = () => {}}) => (k, v) => setCrossLayerFilterParameter(`collectGeometries.queryCollection[${k}]`, v),
        updateLogicCombo: ({setCrossLayerFilterParameter = () => {}}) =>
            (id, logic) => setCrossLayerFilterParameter(`collectGeometries.queryCollection.groupFields`, [{
                id,
                logic,
                index: 0
            }]),
        setOperation: ({setCrossLayerFilterParameter = () => {}}) => (v) => setCrossLayerFilterParameter(`operation`, v)
    }),
    defaultProps({
        dataStreamFactory: ($props, {setQueryCollectionParameter = () => {}} = {}) => $props
            .distinctUntilChanged(({layer = {}} = {}, {layer: newLayer } = {}) => newLayer && layer.name === (newLayer && newLayer.name))
            .filter(({layer} = {}) => !!layer)
            .switchMap(({layer} = {}) =>
                Observable.defer( () => describeFeatureType({layer}))
                    .do((result) => {
                        const geomProp = get(findGeometryProperty(result.data || {}), "name");
                        if (geomProp) {
                            setQueryCollectionParameter("geometryName", geomProp);
                        }
                    })
                    .map(({data = {}} = {}) => describeFeatureTypeToAttributes(data))
                    .map(attributes => ({
                        attributes,
                          loading: false
                    }))
                    .catch( e => {
                        return Observable.of({
                            errorObj: e,
                            loading: false,
                            featureTypeProperties: []
                        });
                    })
                    .startWith({loading: true})
            ).catch( e => {
                return Observable.of({
                    errorObj: e,
                    loading: false,
                    featureTypeProperties: []
                });
            }).startWith({})

    }),
    propsStreamFactory
);

module.exports = crossLayerFilterEnhancer(({
    crossLayerExpanded,
    spatialOperations,
    expandCrossLayerFilterPanel = () => {},
    layers,
    loading,
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
        expanded={crossLayerExpanded}
        buttons={typeName ? [{
            glyph: 'clear-filter',
            tooltipId: "remove",
            onClick: () => resetCrossLayerFilter()
        }] : []}
        onSwitch={expandCrossLayerFilterPanel}
        title={"Layer Filter" /* TODO */}>
            <Row className="filter-field-fixed-row">
            <Col xs={6}>
                <div className="m-label">Target Layer/* TODO */</div>
            </Col>
            <Col xs={6}>
                <Select
                    clearable={false}
                    isLoading={loading}
                    options={layers.map( l => ({
                        label: l.title || l.name,
                        value: l.name
                    }))}
                    placeholder="Select Layer"
                    filter="contains"
                    value={typeName}
                    onChange={ sel => {
                        setQueryCollectionParameter("typeName", sel && sel.value);
                    }}/>
            </Col>
        </Row>
        {(typeName && geometryName)
            ? (<Row className="filter-field-fixed-row">
                <Col xs={6}>
                    <div className="m-label">Operation/* TODO */</div>
                </Col>
                <Col xs={6}>
                <GeometricOperationSelector
                    value={operation}
                    onChange={({id}={}) => setOperation(id)}
                    spatialOperations={spatialOperations.filter( ({id} = {}) => id !== "BBOX")}
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
});
