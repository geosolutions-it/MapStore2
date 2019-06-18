/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const CHANGE_CRS_INPUT_VALUE = 'CHANGE_CRS_INPUT_VALUE';

function setInputValue(value) {
    return {
        type: CHANGE_CRS_INPUT_VALUE,
        value
    };
}

module.exports = {
    CHANGE_CRS_INPUT_VALUE,
    setInputValue
};
