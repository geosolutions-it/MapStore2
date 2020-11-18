/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
import {compose, withProps} from 'recompose';
import { castArray, sortBy } from 'lodash';

import { getLayerJSONFeature } from '../../../observables/wfs';
import propsStreamFactory from '../../misc/enhancers/propsStreamFactory';
import Rx from 'rxjs';
import {getSearchUrl} from '../../../utils/LayersUtils';

const wfsToChartData = ({ features } = {}, { groupByAttributes}) => {

    return sortBy(features.map(({properties}) => properties), groupByAttributes); // TODO: sort
};
const sameFilter = (f1, f2) => f1 === f2;
const sameOptions = (o1 = {}, o2 = {}) =>
    o1.aggregateFunction === o2.aggregateFunction
    && o1.aggregationAttribute === o2.aggregationAttribute
    && o1.groupByAttributes === o2.groupByAttributes
    && o1.viewParams === o2.viewParams;


const dataStreamFactory = ($props) =>
    $props
        .filter(({layer = {}, options}) => layer.name && getSearchUrl(layer)
            && options
            && options.aggregationAttribute // maybe another attribute
            && options.groupByAttributes // TODO: not needed
        )
        .distinctUntilChanged(
            ({layer = {}, options = {}, filter}, newProps) =>
                (newProps.layer && layer.name === newProps.layer.name && layer.loadingError === newProps.layer.loadingError)
                && sameOptions(options, newProps.options)
                && sameFilter(filter, newProps.filter))
        .switchMap(
            ({layer = {}, options, filter, onLoad = () => {}, onLoadError = () => {}}) =>
                getLayerJSONFeature(
                    layer,
                    filter,
                    { propertyName: [...castArray(options.aggregationAttribute), ...castArray(options.groupByAttributes)] }
                ).map((response) => ({
                    loading: false,
                    isAnimationActive: false,
                    error: undefined,
                    data: wfsToChartData(response, options),
                    series: [{ dataKey: options.aggregationAttribute}],
                    xAxis: { dataKey: options.groupByAttributes}
                }))
                    .do(onLoad)
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
