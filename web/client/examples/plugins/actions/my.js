/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const MY_ACTION = 'MY_ACTION';

function action(payload) {
    return {
        type: MY_ACTION,
        payload
    };
}

module.exports = {MY_ACTION, action};
