/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get, findIndex } from 'lodash';

import setFP from 'lodash/fp/set';
import unsetFP from 'lodash/fp/unset';
import composeFP from 'lodash/fp/compose';

export const set = setFP;
export const unset = unsetFP;
export const compose = composeFP;

/**
 * Utility functions for reducers and immutable objects in general
 * @memberof utils
 * @static
 * @name ImmutableUtils
 */

/**
 * Immutable array upsert in a nested object (update or insert)
 * The element is inserted at the end of the array.
 * @param  {string} path  the path of the attribute to change
 * @param  {object} entry the entry to insert
 * @param  {object} condition the [condition](https://lodash.com/docs/4.17.4#findIndex) to match
 * @param  {object} obj   the object to clone and change
 * @return {object} the new object
 * @memberof utils.ImmutableUtils
 */
export const arrayUpsert = (path, entry, condition, object) => {
    const arr = path ? get(object, path) || [] : object;
    const index = findIndex(arr, condition);
    if (index >= 0) {
        let array = arr.slice();
        array.splice(index, 1, entry);
        return path ? set(path, array, object) : array;
    }
    return path ? set(path, arr.concat(entry), object) : arr.concat(entry);
};

/**
 * immutable array update (update or insert)
 * @param  {string} path  the path of the attribute to change. if path falsy, the passed object is the array to modify
 * @param  {object} entry the entry to insert
 * @param  {object} condition the [condition](https://lodash.com/docs/4.17.4#findIndex) to match
 * @param  {object} obj   the object to clone and change
 * @return {object} the new object
 * @memberof utils.ImmutableUtils
 */
export const arrayUpdate = (path, entry, condition, object) => {
    const arr = path ? get(object, path) || [] : object;
    const index = findIndex(arr, condition);
    if (index >= 0) {
        let array = arr.slice();
        array.splice(index, 1, entry);
        return path ? set(path, array, object) : array;
    }
    return object;
};
/**
 * Deletes one element of the array
 * @param  {string} [path]  the path of the attribute to change. if path falsy, the passed object is the array to modify
 * @param  {object} condition the [condition](https://lodash.com/docs/4.17.4#findIndex) to match
 * @param  {object} obj   the object to clone and change
 * @return {object} the new object
 * @memberof utils.ImmutableUtils
 * @example arrayDelete('path.to.array', {id: id_of_the_item_to_delete}, object_to_modify)
 */
export const arrayDelete = (path, condition, object) => {
    const arr = path ? get(object, path) || [] : object;
    const index = findIndex(arr, condition);
    if (index >= 0) {
        const array = arr.slice();
        array.splice(index, 1);
        return path ? set(path, array, object) : array();
    }
    return object;
};
/**
 * Set of lodash fp. **NOTE:** This function is curried, so partial applications will return a function that takes the missing parameters
 * @param {string} path the path
 * @param {any} value the value to set
 * @param {any} object the object to use.
 * @memberof utils.ImmutableUtils
 * @example
 * set('a.b.c',2, {}, obj); // returns {a: {b: {c: 2}}});
 */
/**
 * Unset of lodash fp. **NOTE:** This function is curried, so partial applications will return a function that takes the missing parameters
 * @param {string} path the path
 * @memberof utils.ImmutableUtil
 * @param {any} object the object to use.
 * @example
 * set('a.b.c',2, {}, obj); // returns {a: {b: {c: 2}}});
 */
/**
 * compose of lodash fp. Allow to compose functions with currying.
 * Allows to write something like `set(a, b, set(c, d, set(e, f, state)))`
 * as
 * ```
 * compose(set(a, b), set(c, d), set(e, f))(state)
 * ```
 * @memberof utils.ImmutableUtils
 */
