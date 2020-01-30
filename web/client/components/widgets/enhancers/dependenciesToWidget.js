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
 * re-map widget `dependencies` based on `dependenciesMap` property (if `dependenciesMap` is present).
 * Dependencies can be also transitive:
 * in this case the transitive dependency will be expressed using
 * the values present for the key **dependenciesMap** inside dependenciesMap object
 * of that widget.
 *
 * @param {object} widget dependenciesMap. a map of key1: key2, where key1 is the key to return and key2 is the key of the value to return in the deps object
 * @param {object} deps the original dependencies object
 *
 * @example
 * // * in case of a single connection between two widgets
 *
 * const dependenciesMap={x: "a"};
 * const dependencies={a: "b"};
 * return <EnhancedCmp dependenciesMap={dependenciesMap} dependencies={dependencies} />
 * // the enhancer will pass to the component dependencies={x: "b"}
 *
 *
 * @example
 * in case of a single connection between more than two widgets
 * let's imagine this dependencies tree
 *
 * COUNTER ------- depends on -------> MAP ------- depends on -------> TABLE
 *
 * the filters(quickFilter, attributeFilter) present in the table widget
 * will be propagated throw each widget to the lat one(counter)
 *
 * // dependenciesMap for COUNTER will look like:
 * {
 *   layer: "widgets[MAP_ID].layer",
 *   quickFilters: "widgets[MAP_ID].quickFilters",
 *   mapSync: "widgets[MAP_ID].mapSync",
 *   dependenciesMap: "widgets[MAP_ID].dependenciesMap"
 * };
 *
 * // dependenciesMap for MAP will look like:
 * {
 *   quickFilters: "widgets[TABLE_ID].quickFilters",
 *   options: "widgets[TABLE_ID].options",
 *   layer: "widgets[TABLE_ID].layer",
 *   mapSync: "widgets[TABLE_ID].mapSync",
 *   dependenciesMap: "widgets[TABLE_ID].dependenciesMap"
 * };
 *
 * // dependencies for COUNTER will result in:
 * const counterDependencies = {
 *   "mapSync": true,
 *   "quickFilters": QUICK_FILTERS_OBJ,
 *   "options": OPTIONS_OBJ,
 *   "layer": LAYER_OBJ,
 * };
 * return <EnhancedCmp dependenciesMap={dependenciesMap} dependencies={dependencies} />
 * // the enhancer will pass to the component of dependencies={counterDependencies}
 */

const buildDependencies = (map, deps, originalWidgetId) => {
    if (map) {
        const dependenciesGenerated = Object.keys(map).reduce((ret, k) => {
            if (k === "dependenciesMap" && deps[map[k]] && deps[map.mapSync] &&
                deps[map[k]][k] && deps[map[k]][k].indexOf(originalWidgetId) === -1 // avoiding loop
            ) {
                // go recursively until we get the dependencies from table ancestors
                return {
                    ...ret,
                    ...pick(buildDependencies(deps[map[k]], deps, originalWidgetId), ["options", "layer", "quickFilters", "filter", "dependenciesMap"])
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
    ({ dependenciesMap, dependencies, id }) => ({
        dependencies: dependenciesMap
            ? buildDependencies(dependenciesMap, dependencies, id)
            : dependencies,
        dependenciesMap
    })
);
