/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. */

import React, { Suspense, forwardRef } from 'react';
/**
 * this function create an HOC to provide a default Suspense wrapper
 * this could be helpful to avoid a complete component rewrite (eg isolate plugin panel component)
 * @param {function} activeFunc a function that should return true or false to decide if display or hide the component, if undefined the component is mounted
 * @param {object} options
 * @param {node} options.fallback the fallback prop for the Suspense wrapper
 * @returns an HOC
 * @example
 * import React, { lazy } from 'react';
 * const LazyComponent = withSuspense((props) => !!props.enabled, { fallback: <div>Loading</div> })(lazy(() => import('./MyComponent')));
 * // with no options the fallback is null and the component is mounted as soon as the parent is mounted
 * const LazyComponentNoOptions = withSuspense()(lazy(() => import('./MyComponent')));
 */
const withSuspense = (activeFunc, { fallback = null } = {}) => (Component) => forwardRef((props, ref) => {
    return (activeFunc === undefined || activeFunc(props)) ?  (
        <Suspense fallback={fallback}>
            <Component ref={ref} {...props} />
        </Suspense>
    ) : null;
});

export default withSuspense;
