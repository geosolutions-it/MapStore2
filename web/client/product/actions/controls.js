/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const TOGGLE_CONTROL = 'TOGGLE_CONTROL';
const CHOOSE_MENU = 'CHOOSE_MENU';
const SHOW_TOOLBAR_CONTROL = 'SHOW_TOOLBAR_CONTROL';

function toggleControl(control) {
    return {
        type: TOGGLE_CONTROL,
        control
    };
}

function showToolbarControl(control) {
    return {
        type: SHOW_TOOLBAR_CONTROL,
        control
    };
}

function chooseMenu(menu) {
    return {
        type: CHOOSE_MENU,
        menu
    };
}

module.exports = {TOGGLE_CONTROL, SHOW_TOOLBAR_CONTROL, CHOOSE_MENU,
    toggleControl, showToolbarControl, chooseMenu};
