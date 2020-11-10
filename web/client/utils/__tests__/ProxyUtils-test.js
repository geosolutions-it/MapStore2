/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {needProxy, getProxyUrl} from '../ProxyUtils';

describe('ProxyUtils test', () => {
    it('Need Proxy', () => {
        expect(needProxy("http:someurl.com")).toBe(true);
        expect(needProxy(["http:someurl.com", "http:someotherurl.com"])).toBe(true);
        expect(needProxy("/geoserver")).toBe(false);
        expect(needProxy(["/geoserver", "/geoserver1"])).toBe(false);
        expect(needProxy([location.href])).toBe(false);
    });
    it('GetProxyUrl', () => {
        let res = getProxyUrl({proxyUrl: "http:someurl.com"});
        expect(res).toBe("http:someurl.com");
    });
});
