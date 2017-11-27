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
const SwitchPanel = require('../../misc/switch/SwitchPanel');
const {Row, Col} = require('react-bootstrap');
const Select = require('react-select');
const {compose, withProps, withPropsOnChange, withHandlers, defaultProps} = require('recompose');
const propsStreamFactory = require('../../misc/enhancers/propsStreamFactory');


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
        setQueryCollectionParameter: ({setCrossLayerFilterParameter = () => {}}) => (k, v) => setCrossLayerFilterParameter(`collectGeometries.queryCollection[${k}]`, v)
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
                    .map((result) => get(result, "data.featureTypes[0].properties") || [])
                    .map(featureTypeProperties => ({
                          loading: false,
                          featureTypeProperties
                    }).startWith({loading: true})
            ))
            .catch( e => {
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
    expandCrossLayerFilterPanel = () => {},
    layers,
    loading,
    queryCollection = {},
    setQueryCollectionParameter = () => {}
} = {}) => {
    const {typeName, geometryName} = queryCollection;

    return (<SwitchPanel
        expanded={crossLayerExpanded}
        onSwitch={expandCrossLayerFilterPanel}
        title={"Layer Filter" /* TODO */}>
            <Row>
            <Col xs={6}>
                <div className="m-label">Layer:</div>
            </Col>
            <Col xs={6}>
                <Select
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
                {geometryName }
            </Col>
        </Row>
        </SwitchPanel>);
});
