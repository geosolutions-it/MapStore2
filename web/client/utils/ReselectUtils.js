const { isEqualWith } = require('lodash');
const { defaultMemoize, createSelectorCreator } = require('reselect');

const isShallowEqual = (el1, el2) => {
    if (Array.isArray(el1) && Array.isArray(el2)) {
        return el1 === el2 || el1.reduce((acc, curr, i) => acc && curr === el2[i], true);
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
    (a, b) => isEqualWith(a, b, isShallowEqual)
);
module.exports = {
    createShallowSelector
};
