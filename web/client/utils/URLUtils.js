/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import Url from "url";

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

/**
 * Compares two url to check if are the same
 * @function
 * @memberof utils.URLUtils
 * @param  {string} originalUrl the original url
 * @param  {string} otherUrl url to compare to
 * @return {boolean} true when urls are the same else false
 */
export const isSameUrl = (originalUrl, otherUrl) => {
    if (originalUrl === otherUrl) return true;
    const urlParsed = Url.parse(originalUrl);
    const otherUrlParsed = Url.parse(otherUrl);
    const originalUrlParts = urlParts(originalUrl);
    const otherUrlParts = urlParts(otherUrl);
    const isSameProtocol = originalUrlParts.protocol === otherUrlParts.protocol;
    const isSameDomain = originalUrlParts.domain === otherUrlParts.domain;
    const isSameRootPath = originalUrlParts.rootPath === otherUrlParts.rootPath;
    const isSamePort = originalUrlParts.port === otherUrlParts.port;

    const isSamePathname = urlParsed.pathname === otherUrlParsed.pathname;
    const ignoreSearchPath = ((urlParsed.search || "").length < 4 ) === (otherUrlParsed.search || "").length < 4;
    /* ignoreSearchPath is needed to ignore url where path are dirty like /wfs? and /wfs?&
    * the minimum valid search path is 4 char length => ?p=v
    */
    return isSameProtocol && isSamePort && isSameDomain && (ignoreSearchPath && isSamePathname ? true : isSameRootPath);
};
