/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import * as CatalogUtils from '../CatalogUtils';

describe('Test the CatalogUtils', () => {
    it('buildServiceUrl', ( ) => {
        const legacyWMSServiceWithAlias = {
            type: "wms",
            url: "https://a.example.com/wms,https://b.example.com/wms",
            domainAliases: [
                "https://c.example.com/wms"
            ]
        };
        const legacyWMSServiceWithoutAlias = {
            type: "wms",
            url: "https://a.example.com/wms,https://b.example.com/wms"
        };
        const WMSService = {
            type: "wms",
            url: "https://a.example.com/wms",
            domainAliases: [
                "https://b.example.com/wms",
                "https://c.example.com/wms"
            ]
        };
        const otherService = {
            type: "wfs",
            url: "https://a.example.com/wfs",
            domainAliases: [
                "https://b.example.com/wfs",
                "https://c.example.com/wfs"
            ]
        };
        const mergedURL1 = CatalogUtils.buildServiceUrl(WMSService);
        const mergedURL2 = CatalogUtils.buildServiceUrl(otherService);
        const mergedURL3 = CatalogUtils.buildServiceUrl(legacyWMSServiceWithAlias);
        const mergedURL4 = CatalogUtils.buildServiceUrl(legacyWMSServiceWithoutAlias);
        expect(mergedURL1).toBe("https://a.example.com/wms,https://b.example.com/wms,https://c.example.com/wms");
        expect(mergedURL2).toBe("https://a.example.com/wfs");
        expect(mergedURL3).toBe("https://a.example.com/wms,https://b.example.com/wms,https://c.example.com/wms");
        expect(mergedURL4).toBe("https://a.example.com/wms,https://b.example.com/wms");
    });
});
