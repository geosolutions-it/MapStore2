/*
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import {head, memoize} from 'lodash';

import { mapSelector } from './map';
import {DEFAULT_MAP_LAYOUT, parseLayoutValue} from '../utils/MapUtils';
import ConfigUtils from "../utils/ConfigUtils";

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

export const mapLayoutSelector = (state) => state.maplayout && state.maplayout.layout || {};

/**
 * Get map layout bounds left, top, bottom and right
 * @function
 * @memberof selectors.mapLayout
 * @param  {object} state the state
 * @return {object} boundingMapRect {left, top, bottom, right}
 */
export const boundingMapRectSelector = (state) => state.maplayout && state.maplayout.boundingMapRect || {};

/**
 * Get map layout bounds left, top, bottom and right
 * @function
 * @memberof selectors.mapLayout
 * @param  {object} state the state
 * @return {object} boundingMapRect {left, top, bottom, right}
 */
export const boundingSidebarRectSelector = (state) => state.maplayout && state.maplayout.boundingSidebarRect || {};

/**
 * Retrieve only specific attribute from map layout
 * @function
 * @memberof selectors.mapLayout
 * @param  {object} state the state
 * @param  {object} attributes attributes to retrieve, bool {left: true}
 * @param  {boolean} isDock flag to use dock paddings instead of toolbar paddings
 * @return {object} selected attributes of layout of the map
 */
export const mapLayoutValuesSelector = memoize((state, attributes = {}, isDock = false) => {
    const layout = mapLayoutSelector(state);
    const boundingSidebarRect = boundingSidebarRectSelector(state);
    return layout && Object.keys(layout).filter(key =>
        attributes[key]).reduce((a, key) => {
        if (isDock) {
            return ({...a, [key]: (boundingSidebarRect[key] ?? layout[key])});
        }
        return ({...a, [key]: layout[key]});
    },
    {}) || {};
}, (state, attributes, isDock) =>
    JSON.stringify(mapLayoutSelector(state)) +
    JSON.stringify(boundingSidebarRectSelector(state)) +
    JSON.stringify(attributes) + (isDock ? '_isDock' : ''));

/**
 * Check if conditions match with the current layout
 * @function
 * @memberof selectors.mapLayout
 * @param  {object} state the state
 * @param  {array} conditions array of object, [{ key: 'left', value: 300 }, { key: 'right', value: 0, type: 'not' }]
 * @return {boolean} returns true if the layout attributes match with the provided conditions
 */
export const checkConditionsSelector = (state, conditions = []) => {
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
export const rightPanelOpenSelector = state => {
    return !!mapLayoutSelector(state)?.rightPanel;
};

/**
 * Check if left panels are open
 * @function
 * @memberof selectors.mapLayout
 * @param  {object} state the state
 * @return {boolean} returns true if left panels are open
 */
export const leftPanelOpenSelector = state => {
    return !!mapLayoutSelector(state)?.leftPanel;
};

/**
 * Check if bottom panel is open
 * @function
 * @memberof selectors.mapLayout
 * @param  {object} state the state
 * @return {boolean} returns true if bottom panel is open
 */
export const bottomPanelOpenSelector = state => {
    const mapLayout = ConfigUtils.getConfigProp("mapLayout") || DEFAULT_MAP_LAYOUT;
    const bottomMapOffset = mapLayout?.bottom.sm ?? 0;
    return checkConditionsSelector(state, [{ key: 'bottom', value: bottomMapOffset, type: 'not' }]);
};

/**
 * Extract the map layout in pixels.
 * @param {object} state the state
 * @returns {object} object with `left,bottom,right,top` properties, in pixels, containing the map layout
 */

export const mapPaddingSelector = state => {
    const map = mapSelector(state);
    const boundingMapRect = boundingMapRectSelector(state);
    return boundingMapRect && map && map.size && {
        left: parseLayoutValue(boundingMapRect.left, map.size.width),
        bottom: parseLayoutValue(boundingMapRect.bottom, map.size.height),
        right: parseLayoutValue(boundingMapRect.right, map.size.width),
        top: parseLayoutValue(boundingMapRect.top, map.size.height)
    };
};
