/*
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const {head} = require('lodash');

/**
 * selects map layout state
 * @name mapLayout
 * @memberof selectors
 * @static
 */

/**
 * Get map layout bounds and style
 * @function
 * @memberof selectors.mapLayout
 * @param  {object} state the state
 * @return {object} the layout of the map
 */

const mapLayoutSelector = (state) => state.maplayout && state.maplayout.layout || {};

/**
 * Retrieve only specific attribute from map layout
 * @function
 * @memberof selectors.mapLayout
 * @param  {object} state the state
 * @param  {object} attributes attributes to retrieve, bool {left: true}
 * @return {object} selected attributes of layout of the map
 */
const mapLayoutValuesSelector = (state, attributes = {}) => {
    const layout = mapLayoutSelector(state);
    return layout && Object.keys(layout).filter(key =>
        attributes[key]).reduce((a, key) => ({...a, [key]: layout[key]}),
    {}) || {};
};

/**
 * Check if conditions match with the current layout
 * @function
 * @memberof selectors.mapLayout
 * @param  {object} state the state
 * @param  {array} conditions array of object, [{ key: 'left', value: 300 }, { key: 'right', value: 0, type: 'not' }]
 * @return {object} returns true if the layout attributes match with the provided conditions
 */
const checkConditionsSelector = (state, conditions = []) => {
    const layout = mapLayoutSelector(state);
    const check = !!head(conditions.filter(c => layout[c.key]).map(c => {
        if (c.type === 'not') {
            return layout[c.key] !== c.value;
        }
        return layout[c.key] === c.value;
    }));
    return check;
};

module.exports = {
    mapLayoutSelector,
    mapLayoutValuesSelector,
    checkConditionsSelector
};
