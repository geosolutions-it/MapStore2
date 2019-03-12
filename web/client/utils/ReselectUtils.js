const { isEqualWith, isObject } = require('lodash');
const { defaultMemoize, createSelectorCreator } = require('reselect');

const defaultCompare = (a, b) => a === b;

const isShallowEqualBy = (compare = defaultCompare) => (el1, el2) => {
    if (Array.isArray(el1) && Array.isArray(el2)) {
        return el1 === el2 || el1.reduce((acc, curr, i) => acc && compare(curr, el2[i]), true);
    }
    if (isObject(el1) && isObject(el2)) {
        return el1 === el2 || Object.keys(el1).reduce((acc, k) => acc && compare(el1[k], el2[k]), true);
    }
    return el1 === el2;
};

/**
 * Custom version of createSelector with custom compare function.
 * The previous compare function checks if values are arrays, then compares each element of the array.
 * This allows to avoid re-render when dependencies if the dependency keys do not change
 */
const createShallowSelector = createSelectorCreator(
    defaultMemoize,
    (a, b) => isEqualWith(a, b, isShallowEqualBy())
);
const createShallowSelectorCreator = (compare) => createSelectorCreator(
    defaultMemoize,
    (a, b) => isEqualWith(a, b, isShallowEqualBy(compare))
);
module.exports = {
    createShallowSelector,
    createShallowSelectorCreator
};
