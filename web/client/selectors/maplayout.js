/*
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const {head} = require('lodash');
const {mapSelector} = require('./map');
const {parseLayoutValue} = require('../utils/MapUtils');

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
 * Get map layout bounds left, top, bottom and right
 * @function
 * @memberof selectors.mapLayout
 * @param  {object} state the state
 * @return {object} boundingMapRect {left, top, bottom, right}
 */
const boundingMapRectSelector = (state) => state.maplayout && state.maplayout.boundingMapRect || {};

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
 * @return {boolean} returns true if the layout attributes match with the provided conditions
 */
const checkConditionsSelector = (state, conditions = []) => {
    const layout = mapLayoutSelector(state);
    const check = !!head(conditions.filter(c => layout[c.key]).map(c => {
        if (c.type === 'not') {
            return layout[c.key] !== c.value && layout[c.key];
        }
        return layout[c.key] === c.value;
    }));
    return check;
};

/**
 * Check if right panels are open
 * @function
 * @memberof selectors.mapLayout
 * @param  {object} state the state
 * @return {boolean} returns true if right panels are open
 */
const rightPanelOpenSelector = state => {
    // need to remove 658 and manage it from the state with all dafault layout variables
    return checkConditionsSelector(state, [{ key: 'right', value: 658 }]);
};
/**
 * Check if bottom panel is open
 * @function
 * @memberof selectors.mapLayout
 * @param  {object} state the state
 * @return {boolean} returns true if bottom panel is open
 */
const bottomPanelOpenSelector = state => {
    // need to remove 30 and manage it from the state with all dafault layout variables
    return checkConditionsSelector(state, [{ key: 'bottom', value: 30, type: 'not' }]);
};

/**
 * Extract the map layout in pixels.
 * @param {object} state the state
 * @returns {object} object with `left,bottom,right,top` properties, in pixels, containing the map layout
 */

const mapPaddingSelector = state => {
    const map = mapSelector(state);
    const boundingMapRect = boundingMapRectSelector(state);
    return boundingMapRect && map && map.size && {
        left: parseLayoutValue(boundingMapRect.left, map.size.width),
        bottom: parseLayoutValue(boundingMapRect.bottom, map.size.height),
        right: parseLayoutValue(boundingMapRect.right, map.size.width),
        top: parseLayoutValue(boundingMapRect.top, map.size.height)
    };
};

module.exports = {
    mapLayoutSelector,
    mapLayoutValuesSelector,
    checkConditionsSelector,
    rightPanelOpenSelector,
    bottomPanelOpenSelector,
    boundingMapRectSelector,
    mapPaddingSelector
};
