/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {withProps} = require('recompose');
const {pick} = require('lodash');
/**
 * re-map widget dependencies to a new object, based on a mapping object
 *
 * @param {object} widget dependenciesMap. a map of key1: key2, where key1 is the key to return and key2 is the key of the value to return in the deps object
 * @param {object} deps the original dependencies object
 *
 * in case of nested dependencies
 * @example
 * // w1 dependenciesMap
 * const dependenciesMap={
 *   layer: "widgets[w1].layer",
 *   mapSync: "widgets[w1].mapSync",
 *   dependenciesMap: "widgets[w1].dependenciesMap"
 * };
 * const dependencies={
 *   "widgets[w1].dependenciesMap": "widgets[w2].dependenciesMap",
 *   "widgets[w1].layer": "widgets[w2].layer",
 *   "widgets[w1].mapSync": true,
 *   "widgets[w2].layer": {...},
 * };
 * return <EnhancedCmp dependenciesMap={dependenciesMap} dependencies={dependencies} />
 * // the enhancer will pass to the component of dependencies={layer: {...}}
 */

const buildDependencies = (map, deps) => {
    if (map) {
        const dependenciesGenerated = Object.keys(map).reduce((ret, k) => {
            if (k === "dependenciesMap" && deps[map[k]] && deps[map.mapSync]) {
                // go recursively until we get the dependencies from table ancestors
                return {
                    ...ret,
                    ...pick(buildDependencies(deps[map[k]], deps), ["options", "layer", "quickFilters", "filter", "dependenciesMap"])
                };
            }
            return {
                ...ret,
                [k]: deps[map[k]]
            };
        }, {});
        return dependenciesGenerated;
    }
    return deps;
};
/**
 * re-map widget `dependencies` based on `dependenciesMap` property (if `dependenciesMap` is present).
 * @example
 * const dependenciesMap={x: "a"};
 * const dependencies={a: "b"};
 * return <EnhancedCmp dependenciesMap={dependenciesMap} dependencies={dependencies} />
 * // the enhancer will pass to the component dependencies={x: "b"}
 */
module.exports = withProps(
    ({ dependenciesMap, dependencies }) => ({
        dependencies: dependenciesMap
            ? buildDependencies(dependenciesMap, dependencies)
            : dependencies,
        dependenciesMap
    })
);
