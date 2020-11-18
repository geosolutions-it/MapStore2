/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { set } from '../../../utils/ImmutableUtils';

import { shallowEqual, branch, withPropsOnChange } from 'recompose';

/**
 * Syncs map center
 */
export default (prop) => branch(
    ({mapSync} = {}) => mapSync,
    withPropsOnChange(
        ({ mapSync, dependencies = {} } = {}, { mapSync: newMapSync, dependencies: newDependencies }) =>
            newDependencies && shallowEqual(dependencies[prop], newDependencies[prop])
            || mapSync === newMapSync,
        ({ map, mapSync, dependencies = {} }) => ({
            mapStateSource: "__dependency_system__",
            map: dependencies[prop] && mapSync ? set(prop, dependencies[prop], map) : map
        })
    )
);
