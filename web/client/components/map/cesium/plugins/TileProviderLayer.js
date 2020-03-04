/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/cesium/Layers';
import Cesium from '../../../../libs/cesium';
import TileProvider from '../../../../utils/TileConfigProvider';
import ConfigUtils from '../../../../utils/ConfigUtils';
import ProxyUtils from '../../../../utils/ProxyUtils';

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
    return ProxyUtils.getProxyUrl() + encodeURIComponent(url + queryString);
};

function NoProxy() {
}

NoProxy.prototype.getURL = (r) => r;

function template(str, data) {

    return str.replace(/(?!(\{?[zyxs]?\}))\{*([\w_]+)*\}/g, function() {
        let st = arguments[0];
        let key = arguments[1] ? arguments[1] : arguments[2];
        let value = data[key];

        if (value === undefined) {
            throw new Error('No value provided for variable ' + st);

        } else if (typeof value === 'function') {
            value = value(data);
        }
        return value;
    });
}

Layers.registerType('tileprovider', (options) => {
    let [url, opt] = TileProvider.getLayerConfig(options.provider, options);
    let proxyUrl = ConfigUtils.getProxyUrl({});
    let proxy;
    if (proxyUrl) {
        proxy = opt.noCors || ProxyUtils.needProxy(url);
    }
    const cr = opt.credits;
    const credit = cr ? new Cesium.Credit(cr.text, cr.imageUrl, cr.link) : opt.attribution;
    return new Cesium.UrlTemplateImageryProvider({
        url: template(url, opt),
        enablePickFeatures: false,
        subdomains: opt.subdomains,
        maximumLevel: opt.maxZoom,
        minimumLevel: opt.minZoom,
        credit,
        proxy: proxy ? new TileProviderProxy(proxyUrl) : new NoProxy()
    });
});
