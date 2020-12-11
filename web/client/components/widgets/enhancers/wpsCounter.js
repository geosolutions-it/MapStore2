/**
  * Copyright 2018, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
import { compose, withProps } from 'recompose';

import wpsAggregate from '../../../observables/wps/aggregate';
import propsStreamFactory from '../../misc/enhancers/propsStreamFactory';
import Rx from 'rxjs';
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
import { getWpsUrl } from '../../../utils/LayersUtils';

/**
 * Stream of props -> props to retrieve data from WPS aggregate process on params changes.
 * Can be used with widgets and charts to auto-update data on property changes.
 * When new data is retrieved, calls also onLoad handler, or onLoadError if something went wrong.
 *
 */
const dataStreamFactory = ($props) =>
    $props
        .filter(({layer = {}, options}) => layer.name && getWpsUrl(layer) && options && options.aggregateFunction && options.aggregationAttribute)
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
                    data: wpsAggregateToCounterData(data),
                    series: [{dataKey: `${data.AggregationFunctions[0]}(${data.AggregationAttribute})`}]
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
