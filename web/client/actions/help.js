/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const CHANGE_HELP_STATE = 'CHANGE_HELP_STATE';
export const CHANGE_HELP_TEXT = 'CHANGE_HELP_TEXT';
export const CHANGE_HELPWIN_VIZ = 'CHANGE_HELPWIN_VIZ';

export function changeHelpState(enabled) {
    return {
        type: CHANGE_HELP_STATE,
        enabled: enabled
    };
}

export function changeHelpText(helpText) {
    return {
        type: CHANGE_HELP_TEXT,
        helpText: helpText
    };
}

export function changeHelpwinVisibility(helpwinViz) {
    return {
        type: CHANGE_HELPWIN_VIZ,
        helpwinViz: helpwinViz
    };
}
