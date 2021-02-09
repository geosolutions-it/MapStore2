/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Url from 'url';
import { trimStart, replace } from 'lodash';

export const CENTERANDZOOM = 'centerAndZoom';
export const MARKERANDZOOM = 'markerAndZoom';
export const BBOX = 'bbox';

export const DASHBOARD_DEFAULT_SHARE_OPTIONS = {
    embedPanel: true,
    advancedSettings: false,
    shareUrlRegex: "(h[^#]*)#\\/dashboard\\/([A-Za-z0-9]*)",
    shareUrlReplaceString: "$1dashboard-embedded.html#/$2",
    embedOptions: {
        showTOCToggle: false,
        showConnectionsParamToggle: true
    }
};

export const GEOSTORY_DEFAULT_SHARE_OPTIONS = {
    embedPanel: true,
    showAPI: false,
    embedOptions: { showTOCToggle: false },
    shareUrlRegex: "(h[^#]*)#\\/geostory\\/([^\\/]*)\\/([A-Za-z0-9]*)",
    shareUrlReplaceString: "$1geostory-embedded.html#/$3",
    advancedSettings: {
        hideInTab: "embed",
        homeButton: true
    }
};

export const SHARE_TABS = {
    link: 1,
    social: 2,
    embed: 3
};
/**
 * Utility functions for Share tools.
 * @memberof utils
 */
/**
 * get the absolute URL from the local url and the url to convert
 * @param  {string} localUrl     the context where to evaluate the URL, typically location.href
 * @param  {string} urlToConvert the url to convert
 * @return {string}              the absolute url of the urlToConvert
 */
export const getAbsoluteURL = (localUrl, urlToConvert) => {
    // case absolute URL
    if (urlToConvert.indexOf("http") === 0 || urlToConvert.indexOf("//") === 0) {
        return urlToConvert;
    }
    return Url.resolve(localUrl, urlToConvert);
};
/**
 * get the url for the configuration in GeoStore parsing the hash string (`#/viewer/{maptype}/1`)
 * @param  {string} url     the context where to evaluate the URL, typically location.href
 * @param  {string} geoStoreUrl the Base URL of GeoStore
 * @return {string} the absolute url of the GeoStore Resource
 */
export const getConfigUrl = (url, geoStoreUrl) => {
    let urlParsedObj = Url.parse(url, true);
    if (!urlParsedObj.hash) {
        return null;
    }
    const start = urlParsedObj.hash.lastIndexOf('/') + 1;
    const end = urlParsedObj.hash.lastIndexOf('?') >= 0 ? urlParsedObj.hash.lastIndexOf('?') : urlParsedObj.hash.length;
    const mapId = urlParsedObj.hash.substring(start, end);
    return Url.resolve(getAbsoluteURL(url, geoStoreUrl), 'data/' + mapId);
};
/**
 * Parses the API url to get the proper base path where to retrieve the js for the api.
 * @param  {string} url the current context
 * @return {string}     the base path of mapstore where to retrieve the js api.
 */
export const getApiUrl = (url) => {
    let urlParsedObj = Url.parse(url, false);
    return urlParsedObj.protocol + '//' + urlParsedObj.host + urlParsedObj.pathname;
};
/**
 * Remove all query from url and hash
 * @param  {string} url the current context
 * @return {string}     the current context without query params
 */
export const removeQueryFromUrl = (url = '') => {
    const { hash = '', ...parsedUrl } = Url.parse(url);
    const parseHash = Url.parse(hash && trimStart(hash, '#') || '');
    const formatHash = Url.format({ ...parseHash, query: null, search: null });
    return Url.format({ ...parsedUrl, query: null, search: null, hash: formatHash ? `#${formatHash}` : null });
};
export const getSharedGeostoryUrl = (url = '', removeScroll = false) => {
    if (url.match(/\#\/(geostory)/)) {
        let geostoryUrl = url.match(/\/(geostory)\/((shared)|(newgeostory))/)
            ? url
            : url.replace('/geostory/', '/geostory/shared/');

        if (removeScroll) {
            const parsedUrl = geostoryUrl.split('#')[1]?.split('/');
            if (parsedUrl.length === 6 && parsedUrl.includes('shared')) geostoryUrl = replace(geostoryUrl, `/section/${parsedUrl[parsedUrl.length - 1]}`, '');
            if (parsedUrl.length === 8 && parsedUrl.includes('shared')) geostoryUrl = replace(geostoryUrl, `/section/${parsedUrl[parsedUrl.length - 3]}/column/${parsedUrl[parsedUrl.length - 1]}`, '');
        }

        return geostoryUrl;
    }
    return url;
};
