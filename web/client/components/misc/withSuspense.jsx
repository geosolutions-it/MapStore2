/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root dir
 ectory of this source tree.
 */

import React, { Suspense, forwardRef } from 'react';

const withSuspense = (activeFunc, { fallback = null } = {}) => (Component) => forwardRef((props, ref) => {
    return (activeFunc === undefined || activeFunc(props)) ?  (
        <Suspense fallback={fallback}>
            <Component ref={ref} {...props} />
        </Suspense>
    ) : null;
});

export default withSuspense;
