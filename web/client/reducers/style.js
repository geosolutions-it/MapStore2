/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SET_STYLE_PARAMETER } from '../actions/style';

const initialSpec = {
    color: { r: 0, g: 0, b: 255, a: 1 },
    width: 3,
    fill: { r: 0, g: 0, b: 255, a: 0.1 },
    radius: 10,
    marker: false
};

function style(state = initialSpec, action) {
    switch (action.type) {
    case SET_STYLE_PARAMETER: {
        return Object.assign({}, state, {[action.name]: action.value});
    }
    default:
        return state;
    }
}

export default style;
