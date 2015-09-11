/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var axios = require('axios');

var proxy = '/mapstore/proxy/?url=';

axios.interceptors.request.use(config => {
    var uri = config.url || '';
    var sameOrigin = !(uri.indexOf("http") === 0);
    var urlParts = !sameOrigin && uri.match(/([^:]*:)\/\/([^:]*:?[^@]*@)?([^:\/\?]*):?([^\/\?]*)/);
    if (urlParts) {
        let location = window.location;
        sameOrigin =
            urlParts[1] === location.protocol &&
            urlParts[3] === location.hostname;
        let uPort = urlParts[4];
        let lPort = location.port;
        if (uPort !== 80 && uPort !== "" || lPort !== "80" && lPort !== "") {
            sameOrigin = sameOrigin && uPort === lPort;
        }
    }
    if (!sameOrigin) {
        let proxyUrl = config ? config.proxyUrl || proxy : proxy;
        if (proxyUrl) {

            if (proxyUrl.match(/^http:\/\//i) === null) {
                proxyUrl = 'http://' + window.location.host + proxyUrl;
            }
            config.url = proxyUrl + encodeURIComponent(uri);
        }
    }
    return config;
});

module.exports = axios;
