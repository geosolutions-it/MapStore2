/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Url = require('url');
const { trimStart, replace } = require('lodash');
/**
 * Utility functions for Share tools.
 * @memberof utils
 */
var ShareUtils = {
    /**
     * get the absolute URL from the local url and the url to convert
     * @param  {string} localUrl     the context where to evaluate the URL, typically location.href
     * @param  {string} urlToConvert the url to convert
     * @return {string}              the absolute url of the urlToConvert
     */
    getAbsoluteURL: (localUrl, urlToConvert) => {
        // case absolute URL
        if (urlToConvert.indexOf("http") === 0 || urlToConvert.indexOf("//") === 0) {
            return urlToConvert;
        }
        return Url.resolve(localUrl, urlToConvert);
    },
    /**
     * get the url for the configuration in GeoStore parsing the hash string (`#/viewer/{maptype}/1`)
     * @param  {string} url     the context where to evaluate the URL, typically location.href
     * @param  {string} geoStoreUrl the Base URL of GeoStore
     * @return {string} the absolute url of the GeoStore Resource
     */
    getConfigUrl: (url, geoStoreUrl) => {
        let urlParsedObj = Url.parse(url, true);
        if (!urlParsedObj.hash) {
            return null;
        }
        const start = urlParsedObj.hash.lastIndexOf('/') + 1;
        const end = urlParsedObj.hash.lastIndexOf('?') >= 0 ? urlParsedObj.hash.lastIndexOf('?') : urlParsedObj.hash.length;
        const mapId = urlParsedObj.hash.substring(start, end);
        return Url.resolve(ShareUtils.getAbsoluteURL(url, geoStoreUrl), 'data/' + mapId);
    },
    /**
     * Parses the API url to get the proper base path where to retrieve the js for the api.
     * @param  {string} url the current context
     * @return {string}     the base path of mapstore where to retrieve the js api.
     */
    getApiUrl: (url) => {
        let urlParsedObj = Url.parse(url, false);
        return urlParsedObj.protocol + '//' + urlParsedObj.host + urlParsedObj.pathname;
    },
    /**
     * Remove all query from url and hash
     * @param  {string} url the current context
     * @return {string}     the current context without query params
     */
    removeQueryFromUrl: (url = '') => {
        const { hash = '', ...parsedUrl } = Url.parse(url);
        const parseHash = Url.parse(hash && trimStart(hash, '#') || '');
        const formatHash = Url.format({ ...parseHash, query: null, search: null });
        return Url.format({ ...parsedUrl, query: null, search: null, hash: formatHash ? `#${formatHash}` : null });
    },
    getSharedGeostoryUrl: (url = '', removeScroll = false) => {
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
    }
};

module.exports = ShareUtils;
