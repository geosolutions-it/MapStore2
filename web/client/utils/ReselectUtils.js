/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isEqualWith, isObject } from 'lodash';
import { defaultMemoize, createSelectorCreator } from 'reselect';

const defaultCompare = (a, b) => a === b;

const isShallowEqualBy = (compare = defaultCompare) => (el1, el2) => {
    if (Array.isArray(el1) && Array.isArray(el2)) {
        return el1 === el2
            || el1.length === el2.length
                && el1.reduce((acc, curr, i) => acc && compare(curr, el2[i]), true);
    }
    if (isObject(el1) && isObject(el2)) {
        return el1 === el2
            || Object.keys(el1).length === Object.keys(el2).length
                && Object.keys(el1).reduce((acc, k) => acc && compare(el1[k], el2[k]), true);
    }
    return el1 === el2;
};

/**
 * Custom version of createSelector with custom compare function.
 * The previous compare function checks if values are arrays, then compares each element of the array.
 * This allows to avoid re-render when dependencies if the dependency keys do not change
 * @returns {function} selector that does shallow compare
 */
export const createShallowSelector = createSelectorCreator(
    defaultMemoize,
    (a, b) => isEqualWith(a, b, isShallowEqualBy())
);

/**
 * Similar to createShallowSelector, but allow to customize compare function with a custom one.
 * You can use isEqual from lodash (to do a deep compare) or compare only certain properties you're interested to.
 * @param {function} compare a function for compare elements
 */
export const createShallowSelectorCreator = (compare) => createSelectorCreator(
    defaultMemoize,
    (a, b) => isEqualWith(a, b, isShallowEqualBy(compare))
);
