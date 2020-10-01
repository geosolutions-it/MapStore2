/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const SET_ACTIVE = "SWIPE:SET_ACTIVE";
const SET_MODE = "SWIPE:SET_MODE";
const SET_SWIPE_TOOL_DIRECTION = "SWIPE:SET_SWIPE_TOOL_DIRECTION";
const SET_SPY_TOOL_RADIUS = "SWIPE:SET_SPY_TOOL_RADIUS";

/**
* Sets the status of boolean values of the swipe redux state
* @memberof actions.swipe
* @param {boolean} active
* @param {string}  prop the name of the property to set to either true or false
* @return {object} of type `SET_ACTIVE` with active and prop
*/
function setActive(active, prop = "active") {
    return {
        type: SET_ACTIVE,
        active,
        prop
    };
}

/**
* Sets the mode of the Swipe tool i.e. either swipe or spy
* @memberof actions.swipe
* @param {string} mode
* @return {object} of type `SET_MODE` with mode
*/
function setMode(mode = "swipe") {
    return {
        type: SET_MODE,
        mode
    };
}

/**
* Sets the cut direction of the swipe tool
* @memberof actions.swipe
* @param {string} direction cut-vertical or cut-horizontal
* @return {object} of type `SET_SWIPE_TOOL_DIRECTION` with direction
*/
function setSwipeToolDirection(direction) {
    return {
        type: SET_SWIPE_TOOL_DIRECTION,
        direction
    };
}

/**
* Sets the radius of the spyglass mode
* @memberof actions.swipe
* @param {number} radius
* @return {object} of type `SET_SPY_TOOL_RADIUS` with radius
*/
function setSpyToolRadius(radius) {
    return {
        type: SET_SPY_TOOL_RADIUS,
        radius
    };
}

export {
    setActive,
    setMode,
    setSwipeToolDirection,
    setSpyToolRadius,
    SET_ACTIVE,
    SET_MODE,
    SET_SWIPE_TOOL_DIRECTION,
    SET_SPY_TOOL_RADIUS
};
