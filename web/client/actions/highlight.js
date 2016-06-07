/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const HIGHLIGHT_STATUS = 'HIGHLIGHT_STATUS';
const UPDATE_HIGHLIGHTED = 'UPDATE_HIGHLIGHTED';

function highlightStatus(status) {
    return {
        type: HIGHLIGHT_STATUS,
        status
    };
}
function updateHighlighted(count) {
    return {
        type: UPDATE_HIGHLIGHTED,
        count
    };
}

module.exports = {
    HIGHLIGHT_STATUS,
    UPDATE_HIGHLIGHTED,
    highlightStatus,
    updateHighlighted

};
