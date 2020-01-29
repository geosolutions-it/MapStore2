/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const {compose, withProps} = require('recompose');
const wpsAggregate = require('../../../observables/wps/aggregate');
const propsStreamFactory = require('../../misc/enhancers/propsStreamFactory');
const Rx = require('rxjs');
const wpsAggregateToChartData = ({AggregationResults = [], GroupByAttributes = [], AggregationAttribute, AggregationFunctions} = {}) =>
    AggregationResults.map( (res) => ({
        ...GroupByAttributes.reduce( (a, p, i) => ({...a, [p]: res[i]}), {}),
        [`${AggregationFunctions[0]}(${AggregationAttribute})`]: res[res.length - 1]
    })).sort( (e1, e2) => {
        const n1 = parseFloat(e1[GroupByAttributes]);
        const n2 = parseFloat(e2[GroupByAttributes]);
        if (!isNaN(n1) && !isNaN(n2) ) {
            return n1 - n2;
        }
        if (e1 < e2) {
            return -1;
        }
        if (e1 > e2) {
            return 1;
        }
        return 0;
    });
const sameFilter = (f1, f2) => f1 === f2;
const sameOptions = (o1 = {}, o2 = {}) =>
    o1.aggregateFunction === o2.aggregateFunction
    && o1.aggregationAttribute === o2.aggregationAttribute
    && o1.groupByAttributes === o2.groupByAttributes
    && o1.viewParams === o2.viewParams;

const {getWpsUrl} = require('../../../utils/LayersUtils');

const dataStreamFactory = ($props) =>
    $props
        .filter(({layer = {}, options}) => layer.name && getWpsUrl(layer) && options && options.aggregateFunction && options.aggregationAttribute && options.groupByAttributes)
        .distinctUntilChanged(
            ({layer = {}, options = {}, filter}, newProps) =>
                (newProps.layer && layer.name === newProps.layer.name && layer.loadingError === newProps.layer.loadingError)
                && sameOptions(options, newProps.options)
                && sameFilter(filter, newProps.filter))
        .switchMap(
            ({layer = {}, options, filter, onLoad = () => {}, onLoadError = () => {}}) =>
                wpsAggregate(getWpsUrl(layer), {featureType: layer.name, ...options, filter}, {
                    timeout: 15000
                }).map((response) => ({
                    loading: false,
                    isAnimationActive: false,
                    error: undefined,
                    data: wpsAggregateToChartData(response.data),
                    series: [{dataKey: `${response.data.AggregationFunctions[0]}(${response.data.AggregationAttribute})`}],
                    xAxis: {dataKey: response.data.GroupByAttributes[0]}
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
