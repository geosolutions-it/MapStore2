/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import { isNil, isObject } from 'lodash';
import { compose, withProps } from 'recompose';
import Rx from 'rxjs';

import wpsAggregate from '../../../observables/wps/aggregate';
import { getWpsUrl } from '../../../utils/LayersUtils';
import propsStreamFactory from '../../misc/enhancers/propsStreamFactory';

const wpsAggregateToChartData = ({AggregationResults = [], GroupByAttributes = [], AggregationAttribute, AggregationFunctions} = {}) =>
    AggregationResults.map((res) => ({
        ...GroupByAttributes.reduce((a, p, i) => {
            let value = res[i];
            if (isObject(value)) {
                if (!isNil(value.time)) {
                    value = (new Date(value.time)).toISOString();
                } else {
                    throw new Error('Unknown response format from server');
                }
            }
            return {
                ...a,
                [p]: value
            };
        }, {}),
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
                }).map((data) => ({
                    loading: false,
                    isAnimationActive: false,
                    error: undefined,
                    data: wpsAggregateToChartData(data),
                    series: [{dataKey: `${data.AggregationFunctions[0]}(${data.AggregationAttribute})`}],
                    xAxis: {dataKey: data.GroupByAttributes[0]}
                })).do(onLoad)
                    .catch((e) => Rx.Observable.of({
                        loading: false,
                        error: e,
                        data: []
                    }).do(onLoadError)
                    ).startWith({loading: true})
        );
export default compose(
    withProps( () => ({
        dataStreamFactory
    })),
    propsStreamFactory
);
