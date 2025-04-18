/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    CHANGE_SNAPSHOT_STATE,
    SNAPSHOT_ERROR,
    SNAPSHOT_READY,
    SNAPSHOT_ADD_QUEUE,
    SNAPSHOT_REMOVE_QUEUE
} from '../actions/snapshot';

function snapshot(state = null, action) {
    switch (action.type) {
    case CHANGE_SNAPSHOT_STATE:
        return Object.assign({}, state, {
            state: action.state,
            tainted: action.tainted
        });
    case SNAPSHOT_READY:
        return Object.assign({}, state, {
            img: {
                data: action.imgData,
                width: action.width,
                height: action.height,
                size: action.size
            }
        });
    case SNAPSHOT_ERROR:
        return Object.assign({}, state, {
            error: action.error
        });
    case SNAPSHOT_ADD_QUEUE: {
        let queue = [];
        if (state && state.queue !== undefined) {
            queue = [...state.queue, action.options];
        } else {
            queue = [action.options];
        }
        return Object.assign({}, state, {
            queue: queue
        });
    }
    case SNAPSHOT_REMOVE_QUEUE: {
        let queue = state.queue || [];
        queue = queue.filter((conf) => {
            if (conf.key === action.options.key) {
                return false;
            }
            return true;
        });
        return Object.assign({}, state, {
            queue: queue
        });
    }
    default:
        return state;
    }

}

export default snapshot;
