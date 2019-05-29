/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {get, findIndex} = require('lodash');
const set = require('lodash/fp/set');


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
const arrayUpsert = (path, entry, condition, object) => {
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
const arrayUpdate = (path, entry, condition, object) => {
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
const arrayDelete = (path, condition, object) => {
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
 * Utility functions for reducers and immutable objects in general
 * @memberof utils
 * @static
 * @name ImmutableUtils
 */
module.exports = {
    /**
     * Set of lodash fp
     * @param {string} path the path
     * @param value the value to set
     * @param
     * @example
     * set('a.b.c',2, {}); // returns {a: {b: {c: 2}}});
     */
    set,
    arrayUpsert,
    arrayUpdate,
    arrayDelete
};
