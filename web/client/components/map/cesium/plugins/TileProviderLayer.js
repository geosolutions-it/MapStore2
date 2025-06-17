/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/cesium/Layers';
import * as Cesium from 'cesium';
import TileProvider from '../../../../utils/TileConfigProvider';
import ConfigUtils from '../../../../utils/ConfigUtils';
import {creditsToAttribution} from '../../../../utils/LayersUtils';
import {getProxyUrl} from '../../../../utils/ProxyUtils';
import isEqual from 'lodash/isEqual';

function splitUrl(originalUrl) {
    let url = originalUrl;
    let queryString = "";
    if (originalUrl.indexOf('?') !== -1) {
        url = originalUrl.substring(0, originalUrl.indexOf('?') + 1);
        if (originalUrl.indexOf('%') !== -1) {
            url = decodeURIComponent(url);
        }
        queryString = originalUrl.substring(originalUrl.indexOf('?') + 1);
    }
    return {url, queryString};
}

function TileProviderProxy(proxy) {
    this.proxy = proxy;
}

TileProviderProxy.prototype.getURL = function(resource) {
    let {url, queryString} = splitUrl(resource);
    if (url.indexOf("//") === 0) {
        url = location.protocol + url;
    }
    return getProxyUrl() + encodeURIComponent(url + queryString);
};

function NoProxy() {
}

NoProxy.prototype.getURL = (r) => r;

/**
 * Returns the URL passed as parameter, replacing all the variables with the values in the data object, except for the variables x, y, z and s, that are reserved for the tile coordinates and server.
 * @param {string} URL the string to replace
 * @param {object} data data to use for replacement
 * @returns {string}
 */
export function template(str, data) {

    return str.replace(/{([^{}]+)}/g, function(textMatched, key) {
        if (['x', 'y', 'z', 's'].includes(key)) {
            return textMatched;
        }
        if (key === '-x') {
            return "{reverseX}";
        }
        if (key === '-y') {
            return "{reverseY}";
        }

        let value = data[key];

        if (value === undefined) {
            throw new Error('No value provided for variable ' + key);

        } else if (typeof value === 'function') {
            value = value(data);
        }
        return value;
    });
}

const create = (options) => {
    let [url, opt] = TileProvider.getLayerConfig(options.provider, options);
    let proxyUrl = ConfigUtils.getProxyUrl({});
    const cr = opt.credits;

    const credit = cr ? new Cesium.Credit(creditsToAttribution(cr)) : opt.attribution;
    return new Cesium.UrlTemplateImageryProvider({
        url: template(url, opt),
        enablePickFeatures: false,
        subdomains: opt.subdomains,
        maximumLevel: opt.maxZoom,
        minimumLevel: opt.minZoom,
        credit,
        proxy: options?.forceProxy ? new TileProviderProxy(proxyUrl) : new NoProxy()
    });
};

const update = (layer, newOptions, oldOptions) => {
    if (
        newOptions.forceProxy !== oldOptions.forceProxy ||
        !isEqual(oldOptions.security, newOptions.security)
    ) {
        return create(newOptions);
    }
    return null;
};

Layers.registerType('tileprovider', {
    create,
    update: update
});
