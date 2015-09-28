/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const ACTIVATE_PANEL = 'ACTIVATE_PANEL';

function activatePanel(activeKey) {
    return {
        type: ACTIVATE_PANEL,
        activeKey: activeKey
    };
}
module.exports = {activatePanel, ACTIVATE_PANEL};
