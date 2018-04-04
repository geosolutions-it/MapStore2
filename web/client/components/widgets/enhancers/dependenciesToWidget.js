/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {withProps} = require('recompose');
/**
 * re-map widget dependencies to a new object, based on a mapping object
 *
 * @param {object} widget dependenciesMap. a map of key1: key2, where key1 is the key to return and key2 is the key of the value to return in the deps object
 * @param {object} deps the original dependencies object
 */
const buildDependencies = (map, deps) => map
    ? Object.keys(map).reduce((ret, k) => ({
        ...ret,
        [k]: deps[map[k]]
    }), {})
    : deps;
/**
 * re-map widget `dependencies` based on `dependenciesMap` property (if `dependenciesMap` is present).
 * @example
 * const dependenciesMap={x: "a"};
 * const dependencies={a: "b"};
 * return <EnhancedCmp dependenciesMap={dependenciesMap} dependencies={dependencies} />
 * // the enhancer will pass to the component dependencies={x: "b"}
 */
module.exports = withProps(
    ({ dependencies, dependenciesMap }) => ({
        dependencies: dependenciesMap
            ? buildDependencies(dependenciesMap, dependencies)
            : dependencies
    })
);
