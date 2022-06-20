/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

/**
 * Sets a cookie in the browser
 * @param {string} name sets a cookie with a given string
 * @param {string} value set the value of the cookie
 * @param {number} validity milliseconds of validity
 */
export function setCookie(name, value, validity) {
    var expires = "";
    if (validity) {
        const date = new Date();
        date.setTime(date.getTime() + validity);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

/**
 * remove a cookie.
 * @param {string} name name of the cookie
 */
export function eraseCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
/**
 * Extract the value of a cookie (only the value)
 * @param {string} name the name of the cookie
 * @returns {string} the value of the cookie
 */
export function getCookieValue(name) {
    return document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || '';
}

