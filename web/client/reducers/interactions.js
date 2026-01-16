/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Interactions reducer
 * Currently a no-op reducer maintained for store compatibility.
 * Interactions are stored directly on widget objects, not in Redux state.
 */
// eslint-disable-next-line no-unused-vars
function interactionsReducer(state = {}, action) {
    return state;
}

export default interactionsReducer;

