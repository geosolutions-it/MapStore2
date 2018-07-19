 /**
  * Copyright 2018, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const {compose, withProps} = require('recompose');
const wpsAggregate = require('../../../observables/wps/aggregate');
const propsStreamFactory = require('../../misc/enhancers/propsStreamFactory');
const Rx = require('rxjs');
const wpsAggregateToCounterData = ({AggregationResults = [], GroupByAttributes = [], AggregationAttribute, AggregationFunctions} = {}) =>
    AggregationResults.map( (res) => ({
        ...GroupByAttributes.reduce( (a, p, i) => ({...a, [p]: res[i]}), {}),
        [`${AggregationFunctions[0]}(${AggregationAttribute})`]: res[res.length - 1]
    }));
const sameFilter = (f1, f2) => f1 === f2;
const sameOptions = (o1 = {}, o2 = {}) =>
    o1.aggregateFunction === o2.aggregateFunction
    && o1.aggregationAttribute === o2.aggregationAttribute
    && o1.viewParams === o2.viewParams;

const getLayerUrl = l => l && l.wpsUrl || (l.search && l.search.url) || l.url;

/**
 * Stream of props -> props to retrieve data from WPS aggregate process on params changes.
 * Can be used with widgets and charts to auto-update data on property changes.
 * When new data is retrieved, calls also onLoad handler, or onLoadError if something went wrong.
 *
 */
const dataStreamFactory = ($props) =>
    $props
        .filter(({layer = {}, options}) => layer.name && getLayerUrl(layer) && options && options.aggregateFunction && options.aggregationAttribute)
        .distinctUntilChanged(
            ({layer={}, options = {}, filter}, newProps) =>
                getLayerUrl(layer) === getLayerUrl(layer)
                && (newProps.layer && layer.name === newProps.layer.name)
                && sameOptions(options, newProps.options)
                && sameFilter(filter, newProps.filter))
        .switchMap(
            ({layer={}, options, filter, onLoad = () => {}, onLoadError = () => {}}) =>
            wpsAggregate(getLayerUrl(layer), {featureType: layer.name, ...options, filter}, {
                timeout: 15000
            }).map((response) => ({
                    loading: false,
                    isAnimationActive: false,
                    error: undefined,
                    data: wpsAggregateToCounterData(response.data),
                    series: [{dataKey: `${response.data.AggregationFunctions[0]}(${response.data.AggregationAttribute})`}]
                })).do(onLoad)
                .catch((e) => Rx.Observable.of({
                        loading: false,
                        error: e,
                        data: []
                    }).do(onLoadError)
                ).startWith({loading: true})
        );
module.exports = compose(
    withProps( () => ({
        dataStreamFactory
    })),
    propsStreamFactory
);
