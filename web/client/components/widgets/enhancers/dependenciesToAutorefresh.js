/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { compose, withProps } from 'recompose';
import Rx from 'rxjs';
import { isNumber } from 'lodash';

import propsStreamFactory from '../../misc/enhancers/propsStreamFactory';

let currentTicks = {};

/**
 * Set the property `shouldAutorefresh` to true if the widget should autorefresh based on the autorefreshTicks and layer.id.
 * @param {object} props the widget props
 * @param {{[prop: string]: number}} props.autorefreshTicks an object with the layer.id as key and the ticks as value
 * @param {object} props.layer the layer object where to perform the requests, used to get the layer.id to check against the autorefreshTicks
 * @returns {Rx.Observable<{shouldAutorefresh: boolean}>} an observable that emits an object with the property shouldAutorefresh (boolean)
 * @example
 * // in a widget component
 * const MyWidget = ({shouldAutorefresh}) => {
 *   useEffect(() => {
 *     if (shouldAutorefresh) {
 *       // trigger data fetch
 *     }
 *  }, [shouldAutorefresh]);
 */
const dataStreamFactory = ($props) =>
    $props
        .switchMap(
            ({autorefreshTicks, layer}) => {
                let shouldAutorefresh = false;

                if (layer?.id && Object.keys(autorefreshTicks).length && isNumber(autorefreshTicks[layer.id]) &&
                        currentTicks[layer.id] !== autorefreshTicks[layer.id]) {
                    currentTicks[layer.id] = autorefreshTicks[layer.id];
                    shouldAutorefresh = true;
                }

                return Rx.Observable.of({
                    shouldAutorefresh
                });
            }
        );

export default compose(
    withProps( () => ({
        dataStreamFactory
    })),
    propsStreamFactory
);
