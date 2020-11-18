/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const SET_ACTIVE = "SWIPE:SET_ACTIVE";

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

export {
    setActive,
    SET_ACTIVE
};
