/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const CHANGE_HELP_STATE = 'CHANGE_HELP_STATE';
const CHANGE_HELP_TEXT = 'CHANGE_HELP_TEXT';

function changeHelpState(enabled) {
    return {
        type: CHANGE_HELP_STATE,
        enabled: enabled
    };
}

function changeHelpText(helpText) {
    return {
        type: CHANGE_HELP_TEXT,
        helpText: helpText
    };
}

module.exports = {
    CHANGE_HELP_STATE,
    CHANGE_HELP_TEXT,
    changeHelpState,
    changeHelpText
};
