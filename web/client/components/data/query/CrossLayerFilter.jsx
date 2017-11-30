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
const {describeFeatureType, getLayerWFSCapabilities} = require('../../../observables/wfs');
const {findGeometryProperty} = require('../../../utils/ogc/WFS/base');
const Message = require('../../I18N/Message');
const {describeFeatureTypeToAttributes} = require('../../../utils/FeatureTypeUtils');
const SwitchPanel = require('../../misc/switch/SwitchPanel');
const {Row, Col} = require('react-bootstrap');
const Select = require('react-select');
const {compose, withProps, withPropsOnChange, withHandlers, defaultProps} = require('recompose');
const propsStreamFactory = require('../../misc/enhancers/propsStreamFactory');
const GeometricOperationSelector = require('./GeometricOperationSelector');
const GroupField = require('./GroupField');

const hasCrossLayerFunctionalities = (data) => {
    const functions = get(data, "WFS_Capabilities.Filter_Capabilities.Scalar_Capabilities.ArithmeticOperators.Functions.FunctionNames.FunctionName");
    return !!find(functions, ({_} = {}) => _ === "queryCollection");
};
const isSameOGCServiceRoot = (origSearchUrl, {search, url} = {}) => origSearchUrl === url || origSearchUrl === (search && search.url);

// bbox make not sense with cross layer filter
const getAllowedSpatialOperations = (spatialOperations) => (spatialOperations || []).filter( ({id} = {}) => id !== "BBOX");

const createCrossLayerFunctionalitiesInspectionStream = ($props) => $props
    .distinctUntilChanged(({searchUrl} = {}, {searchUrl: newSearchUrl} = {}) => searchUrl === newSearchUrl)
    .switchMap( (props = {}) => {
        if (props.crossLayerExpanded) {
            return Observable.of(props);
        }
        return $props.filter( ({crossLayerExpanded} = {}) => crossLayerExpanded).take(1);
    })
    .switchMap(({featureTypeName, searchUrl }) => getLayerWFSCapabilities({layer: {
        name: featureTypeName,
        url: searchUrl,
        search: {
            type: "wfs",
            url: searchUrl
        }
    }})
    .do(
        (capabilities) => {
            if (!hasCrossLayerFunctionalities(capabilities)) {
                throw new Error("nocrosslayerfunctionalities");
            }
        })
        .map(() => ({
            loadingCapabilities: false
        }))
        .catch( e => {
            return Observable.of({
                errorObj: e,
                loadingAttributes: false,
                loadingCapabilities: false,
                featureTypeProperties: []
            });
        })
    .startWith({loadingCapabilities: true}))
.startWith({});
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
        dataStreamFactory: ($props, {setQueryCollectionParameter = () => {}} = {}) =>
            createCrossLayerFunctionalitiesInspectionStream($props)
            .combineLatest(
                $props
                // retrieve layer's attributes on layer selection change
                .distinctUntilChanged(({layer = {}} = {}, {layer: newLayer } = {}) => newLayer && layer.name === (newLayer && newLayer.name))
                .filter(({layer} = {}) => !!layer)
                .switchMap(({layer} = {}) =>
                    Observable.defer( () => describeFeatureType({layer}))
                        .do((result) => {
                            const geomProp = get(findGeometryProperty(result.data || {}), "name");
                            if (geomProp) {
                                setQueryCollectionParameter("geometryName", geomProp);
                            }
                            setQueryCollectionParameter("filterFields", []);
                        })
                        .map(({data = {}} = {}) => describeFeatureTypeToAttributes(data))
                        .map(attributes => ({
                            attributes,
                            loadingAttributes: false
                        }))
                        .startWith({loadingAttributes: true})
                        .catch( e => {
                            return Observable.of({
                                errorObj: e,
                                loadingAttributes: false,
                                featureTypeProperties: []
                            });
                        })
                ).catch( e => {
                    return Observable.of({
                        errorObj: e,
                        loadingAttributes: false,
                        loadingCapabilities: false,
                        featureTypeProperties: []
                    });
                }).startWith({}),
                    // combine the 2 streams output props
                    (overrides= {}, props = {}) => ({
                        ...props,
                        ...overrides
                    })
            ).startWith({})
    }),
    propsStreamFactory
);

module.exports = crossLayerFilterEnhancer(({
    crossLayerExpanded,
    spatialOperations,
    expandCrossLayerFilterPanel = () => {},
    layers,
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
            <Row className="filter-field-fixed-row">
            <Col xs={6}>
                <div className="m-label"><Message msgId="queryform.crossLayerFilter.targetLayer"/></div>
            </Col>
            <Col xs={6}>
                <Select
                    clearable={false}
                    disabled={loadingCapabilities || errorObj}
                    isLoading={loadingAttributes}
                    options={layers
                      .filter( l => isSameOGCServiceRoot(searchUrl, l))
                      .map( l => ({
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
                    <div className="m-label"><Message msgId="queryform.crossLayerFilter.operation"/></div>
                </Col>
                <Col xs={6}>
                <GeometricOperationSelector
                    value={operation}
                    onChange={({id}={}) => setOperation(id)}
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
});
