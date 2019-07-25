/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import Url from "url";
import { isArray, isString, isEqual, sortBy } from 'lodash';

export const urlParts = (url) => {
    if (!url) return {};
    let isRelativeUrl = !(url.indexOf("http") === 0);
    let urlPartsArray = isRelativeUrl ? [] : url.match(/([^:]*:)\/\/([^:]*:?[^@]*@)?([^:\/\?]*):?([^\/\?]*)/);
    if (isRelativeUrl) {
        let location = window.location;
        urlPartsArray[1] = location.protocol;
        urlPartsArray[3] = location.hostname;
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
    // if both empty string, false or undefined, means it's empty
    if (!q1 && !q2) {
        return true;
    }
    const params1 = q1 ? q1.split('&') : [];
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
    if (!isString(originalUrl || !isString(otherUrl))) return false;
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
