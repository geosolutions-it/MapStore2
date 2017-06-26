/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const SET_COOKIE_VISIBILITY = 'SET_COOKIE_VISIBILITY';
const SET_MORE_DETAILS_VISIBILITY = 'SET_MORE_DETAILS_VISIBILITY';
const SET_DETAILS_COOKIE_HTML = 'SET_DETAILS_COOKIE_HTML';

function setCookieVisibility(status) {
    return {
        type: SET_COOKIE_VISIBILITY,
        status
    };
}
function setMoreDetailsVisibility(status) {
    return {
        type: SET_MORE_DETAILS_VISIBILITY,
        status
    };
}
function setDetailsCookieHtml(html, lang) {
    return {
        type: SET_DETAILS_COOKIE_HTML,
        html,
        lang
    };
}
module.exports = {
    SET_COOKIE_VISIBILITY, setCookieVisibility,
    SET_MORE_DETAILS_VISIBILITY, setMoreDetailsVisibility,
    SET_DETAILS_COOKIE_HTML, setDetailsCookieHtml
};
