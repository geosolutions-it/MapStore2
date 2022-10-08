/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose, mapPropsStream } from 'recompose';
import { castArray, isEqual } from 'lodash';

import { getLayerJSONFeature } from '../../../observables/wfs';
import Rx from 'rxjs';
import { getSearchUrl, getWpsUrl } from '../../../utils/LayersUtils';
import wpsAggregate from "../../../observables/wps/aggregate";

/**
 * Validate all charts and types when map sync is enabled
 */
export default compose(
    mapPropsStream(props$ => {
        return props$.combineLatest(
            props$
                .filter(({layerOptions = [], mapSync}) =>
                    mapSync && layerOptions.every(({layer, options} = {}) =>
                        layer.name
                        && getSearchUrl(layer) && options && options.aggregationAttribute && options.groupByAttributes
                    ))
                .distinctUntilChanged(
                    ({layerOptions, selectedChartId, mapSync}, newProps) =>
                        isEqual(mapSync, newProps.mapSync) && isEqual(layerOptions, newProps.layerOptions) && isEqual(selectedChartId, newProps.selectedChartId)
                )
                // eslint-disable-next-line no-unused-vars
                .switchMap(({layerOptions = [], triggerValidation = () => {}, validating} = {}) =>
                    Rx.Observable.forkJoin(
                        layerOptions.map(({layer, filter, options} = {}) => {
                            const isWFS = !options.aggregateFunction || options.aggregateFunction === "None";
                            return isWFS ? getLayerJSONFeature(
                                layer,
                                filter,
                                {
                                    propertyName: options.classificationAttribute ? [
                                        ...castArray(options.aggregationAttribute),
                                        ...castArray(options.groupByAttributes),
                                        ...castArray(options.classificationAttribute)
                                    ] :
                                        [
                                            ...castArray(options.aggregationAttribute),
                                            ...castArray(options.groupByAttributes)
                                        ]
                                }
                            ) : wpsAggregate(
                                getWpsUrl(layer),
                                {featureType: layer.name, ...options, filter},
                                {timeout: 15000}
                            );
                        }))
                        .do(() => triggerValidation(false))
                        .catch((e) =>
                            Rx.Observable.of({ error: e })
                                .do(() => triggerValidation(true))
                        ).startWith(triggerValidation(true))
                )
                .startWith({}),
            (p1, p2) => ({
                ...p1,
                ...p2
            })
        );
    })
);
