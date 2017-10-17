 /**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const {isEqual} = require('lodash');
const {compose, withProps} = require('recompose');
const wpsAggregate = require('../../../observables/wps/aggregate');
const propsStreamFactory = require('../../misc/enhancers/propsStreamFactory');
const wpsAggregateToChartData = ({AggregationResults = [], GroupByAttributes = [], AggregationAttribute} = {}) =>
    AggregationResults.map( (res) => ({
        ...GroupByAttributes.reduce( (a, p, i) => ({...a, [p]: res[i]}), {}),
        [AggregationAttribute]: res[res.length - 1]
    }));

const sameOptions = (o1 = {}, o2 = {}) =>
    o1.aggregateFunction === o2.aggregateFunction
    && o1.aggregationAttribute === o2.aggregationAttribute
    && o1.groupByAttributes === o2.groupByAttributes;
    // && isEqual(o1.fitler. o2.filter);
const dataStreamFactory = ($props) =>
    $props
        .filter(({url, layer, options}) => url && layer && layer.name && options && options.aggregateFunction && options.aggregationAttribute && options.groupByAttributes)
        .distinctUntilChanged(
            ({url, layer={}, options = {}}, newProps) =>
                url === newProps.url
                && (newProps.layer && layer.name === newProps.layer.name)
                && sameOptions(options, newProps.options))
        .switchMap(
            ({url, layer={}, options, filter}) =>
            wpsAggregate(url, {featureType: layer.name, ...options, filter})
                .map((response) => ({
                    loading: false,
                    isAnimationActive: false,
                    data: wpsAggregateToChartData(response.data),
                    series: [{dataKey: response.data.AggregationAttribute}],
                    xAxis: {dataKey: response.data.GroupByAttributes[0]}
                })).startWith({loading: true})
        );
module.exports = compose(
    withProps( () => ({
        dataStreamFactory
    })),
    propsStreamFactory
);
