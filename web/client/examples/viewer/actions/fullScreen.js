/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const ACTIVATE_BUTTON = 'ACTIVATE_BUTTON';

function activateButton(activeKey) {
    return {
        type: ACTIVATE_BUTTON,
        activeKey: activeKey
    };
}
module.exports = {activateButton, ACTIVATE_BUTTON};
