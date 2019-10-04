/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const {SET_COOKIE_VISIBILITY, SET_MORE_DETAILS_VISIBILITY, SET_DETAILS_COOKIE_HTML} = require('../actions/cookie');
const assign = require('object-assign');

function cookie(state = {
    html: {}
}, action) {
    switch (action.type) {
    case SET_COOKIE_VISIBILITY: {
        return assign({}, state, {showCookiePanel: action.status});
    }
    case SET_MORE_DETAILS_VISIBILITY: {
        return assign({}, state, {seeMore: action.status});
    }
    case SET_DETAILS_COOKIE_HTML: {
        return assign({}, state, {html: { ...state.html, [action.lang]: action.html}});
    }
    default:
        return state;
    }
}

module.exports = cookie;
