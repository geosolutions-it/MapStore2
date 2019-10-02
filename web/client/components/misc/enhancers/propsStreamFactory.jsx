/*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

const {compose, mapPropsStreamWithConfig, defaultProps} = require('recompose');

const rxjsConfig = require('recompose/rxjsObservableConfig').default;

const Rx = require('rxjs');
const mapPropsStream = mapPropsStreamWithConfig(rxjsConfig);
/**
 * This enhancer allows a component to implement a function (passed as property)
 * called `dataStreamFactory`, that returns a stream of props. The props from the stream
 * will override the props coming from extenal in the wrapped component.
 * This allows to make the component more reusable, for instance making it doing some
 * ajax operations in autonomy.
 * This is the dataStreamFactory method signature.
 * ```
 * dataStreamFactory(props$ : Observable, initialProps : Object) : Observable
 * ```
 * *Notice*: The stream must emit at least one value to render. You can start with empty object.
 *
 * @memberof components.misc.enhancers
 * @function
 * @name propsStreamFactory
 * @example
 * // example: every props change increment the *count* prop
 * const AutoCount = propsStreamFactory(Component);
 * // ...
 * // later in the render method
 * return <AutoCount dataStreamFactory={$props => $props.scan( (acc) => acc + 1, 0).map(count => ({count}))} />;
 */
module.exports = compose(
    defaultProps({
        dataStreamFactory: () => Rx.Observable.of({})
    }),
    mapPropsStream(props$ => {
        // TODO capture sensible props changes instead of take first
        let fetcherStream = props$.take(1).switchMap(p => {
            // this provides the stream of props with the first event
            return p.dataStreamFactory(props$.startWith(p), p);
        });
        return fetcherStream.combineLatest(props$, (overrides = {}, props = {}) => ({
            ...props,
            ...overrides
        }));
    })
);
