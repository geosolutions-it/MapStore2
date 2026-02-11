/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import Url from "url";
import { isArray, isString, isEqual, sortBy, find } from 'lodash';
import queryString from 'query-string';

export const urlParts = (url) => {
    if (!url) return {};
    let isRelativeUrl = !(url.indexOf("http") === 0);
    let urlPartsArray = isRelativeUrl ? [] : url.match(/([^:]*:)\/\/([^:]*:?[^@]*@)?([^:\/\?]*):?([^\/\?]*)/);
    if (isRelativeUrl) {
        let location = window.location;
        urlPartsArray[1] = location.protocol;
        urlPartsArray[3] = location.hostname;
        urlPartsArray[4] = location.port;
        urlPartsArray[5] = url;

    }
    urlPartsArray[4] = urlPartsArray[4] === "" || !urlPartsArray[4] ? (urlPartsArray[1] === "https:" ? "443" : "80") : urlPartsArray[4];
    urlPartsArray[5] = urlPartsArray[5] ? urlPartsArray[5] : url.slice(urlPartsArray[0].length);
    const [, protocol, , domain, port, rootPath] = urlPartsArray;
    const applicationRootPath = rootPath.indexOf('/') === 0 ? rootPath.split('/')[1] : '';
    return {protocol, domain, port, rootPath, applicationRootPath};
};

export const sameQueryParams = ( q1 = "", q2 = "") => {
    if (q1 === q2) {
        return true;
    }
    // if both "", false or undefined, means they are both empty query strings
    if (!q1 && !q2) {
        return true;
    }
    const params1 = q1 ? q1.split('&').filter(v => !!v) : [];
    const params2 = q2 ? q2.split('&').filter(v => !!v) : [];
    return isEqual(sortBy(params1), sortBy(params2));
};

/**
 * Compares two url to check if are the same. In case of multi-URL (array of URLs)
 * passed as parameter, the function will compare the first element of the array with the other URL.
 * @function
 * @memberof utils.URLUtils
 * @param  {string|string[]} u1 the first URL to compare (or an array of URLs)
 * @param  {string!string[]} u2 the second URL to compare with (or an array of URLs)
 * @return {boolean} true when urls are the same else false
 */
export const isSameUrl = (u1, u2) => {
    // if array takes the first
    const originalUrl = isArray(u1) ? u1[0] : u1;
    const otherUrl = isArray(u2) ? u2[0] : u2;
    if (originalUrl === otherUrl) return true;
    if (!originalUrl || !otherUrl) return false; // if one is undefined they are not the same
    // check type before parsing to avoid parse exceptions
    if (!isString(originalUrl) || !isString(otherUrl)) return false;
    const urlParsed = Url.parse(originalUrl);
    const otherUrlParsed = Url.parse(otherUrl);

    const originalUrlParts = urlParts(originalUrl);
    const otherUrlParts = urlParts(otherUrl);

    const isSameProtocol = originalUrlParts.protocol === otherUrlParts.protocol;
    const isSameDomain = originalUrlParts.domain === otherUrlParts.domain;
    const isSamePort = originalUrlParts.port === otherUrlParts.port;
    const isSamePathname = urlParsed.pathname === otherUrlParsed.pathname;
    const isSameQueryParams = sameQueryParams(urlParsed.query, otherUrlParsed.query);
    return isSameProtocol && isSamePort && isSameDomain && isSamePathname && isSameQueryParams;
};

/**
 * Method parse query string into object
 * @param {string} url - any url
 * @return {object}
 */
export const getQueryParams = (url) => {
    return queryString.parse(url);
};

/**
 * Validator of URL. check if a URL is valid and secure.
 * @param {string} url - url to validate
 * @param {RegExp} [regexp] - optional custom regexp. If regexp is passed, options are ignored.
 * @param {object} [options] optional configurations
 * @param {string[]} [options.allowedProtocols] by default only http and https are allowed
 * @param {string[]} [options.forbiddenMimes] if `data` is one of the protcol allowed, here a list of forbidden mime types that can be risky.
 * by default `'text/html'`, `'text/javascript'`, `'application/javascript'`, `'image/svg+xml'` are forbidden.
 */
export const isValidURL = (url, regexp,
    {
        allowedProtocols = ['http', 'https'],
        forbiddenMimes = ['text/html', 'text/javascript', 'application/javascript', 'image/svg+xml']
    } = {}) => {
    if (regexp) {
        const regex = new RegExp(regexp);
        return regex.test(url);
    }
    const base = url.indexOf('/') === 0 ? window?.location?.origin : undefined;
    if (!URL.canParse(url, base)) {
        return false;
    }

    const parsed = new URL(url, base);
    const protocol = parsed.protocol.replace(':', '').toLowerCase();
    // check allowed protocols
    if (!allowedProtocols.map(p => p.toLowerCase()).includes(protocol)) {
        return false;
    }
    if (protocol === 'data') {
        // Il pathname di un data URI contiene il mime type (es. "image/png;base64")
        const mimeType = parsed.pathname.split(';')[0] || '';
        const isForbidden = forbiddenMimes.some(mime =>
            mimeType.toLowerCase().includes(mime.toLowerCase())
        );
        return !isForbidden;
    }
    return true;
};

/**
 * Check url templates. It accepts URL in this format
 */
export const isValidURLTemplate = (url, params, regexp = /^(http(s{0,1}):\/\/)+?[\w.\-{}]+(?:\.[\w\.-]+)+[\w\-\._~\/\;\.\%\:\&\=\?{}]+$/) => {
    const regex = new RegExp(regexp);
    const match = regex.test(url);
    if (!match) {
        return false;
    }
    if (match && !params) {
        return true;
    }
    if (match && params) {
        const foundParams = /\{(.*?)\}/.test(url);
        return params.filter(p => find(foundParams, p)).length === 0;
    }
    return false;

};

/**
 * Helper for working with a single string url.
 * Use when calling implementations that do not know about array of urls, such as the `urlUtil` library,
 * while still supporting our implementation of domain aliases and domain sharding.
 *
 * @param {string || array} url - Either a string representing a valid url or an array of strings which are all valid urls.
 * @returns {string} Returns the argument if the argument is string, otherwise if the argument is an array, returns the first element.
 */
export const getDefaultUrl = (url) => {
    return isArray(url) ? url[0] : url;
};

/**
 * Updates the given URL by adding or updating query parameters.
 *
 * @param {string} url - The source URL.
 * @param {Object} params - The parameters to add or update.
 * @returns {string} - The updated URL with new query parameters.
 */
export function updateUrlParams(url, params) {
    const parsedUrl = queryString.parseUrl(url);
    const updatedQuery = { ...parsedUrl?.query, ...params };
    // TODO: use stringifyUrl instead after updating `query-string`, not supported in current version
    return parsedUrl?.url + '?' + queryString.stringify(updatedQuery);
}
