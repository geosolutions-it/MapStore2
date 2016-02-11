/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {CHANGE_SNAPSHOT_STATE, SNAPSHOT_ERROR, SNAPSHOT_READY} = require('../actions/snapshot');

const assign = require('object-assign');

function snapshot(state = null, action) {
    switch (action.type) {
        case CHANGE_SNAPSHOT_STATE:
            return assign({}, state, {
                state: action.state
            });
        case SNAPSHOT_READY:
            return assign({}, state, {
                img: {
                    data: action.imgData,
                    width: action.width,
                    height: action.height,
                    size: action.size
                }
            });
        case SNAPSHOT_ERROR:
            return assign({}, state, {
                error: action.error
            });
        default:
            return state;
    }

}

module.exports = snapshot;
