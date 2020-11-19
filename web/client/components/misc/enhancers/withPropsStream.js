/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


import { mapPropsStreamWithConfig } from 'recompose';

import rxjsConfig from 'recompose/rxjsObservableConfig';
import Rx from 'rxjs';
const mapPropsStream = mapPropsStreamWithConfig(rxjsConfig);

/**
 * implements the stream version of withProps
 * as the mapPropsStream implements mapProps with stream.
 * For the moment the argument is only a function, the stream returns the props
 * that have be merged with upcoming props.
 * You can also return falsy value to use the props stream only as a trigger for actions
 * @param {function} propStreamFactory a function that gets the stream of props and returns the stream of props to add to the enhanced component
 */

export default propStreamFactory => mapPropsStream(props$ => {
    const newProps$ = propStreamFactory(props$) || Rx.Observable.empty();
    return newProps$.startWith({}).combineLatest(props$, (overrides = {}, props = {}) => ({
        ...props,
        ...overrides
    }));
});

