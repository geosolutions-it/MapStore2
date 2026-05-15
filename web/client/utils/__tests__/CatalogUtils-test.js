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
    it('buildServiceUrl accepts object-shape domainAliases (legacy data)', () => {
        const serviceObjectShape = {
            type: "wms",
            url: "https://a.example.com/wms",
            domainAliases: { 0: "https://b.example.com/wms", 1: "https://c.example.com/wms" }
        };
        expect(CatalogUtils.buildServiceUrl(serviceObjectShape))
            .toBe("https://a.example.com/wms,https://b.example.com/wms,https://c.example.com/wms");
    });
    it('buildServiceUrl drops empty values from object-shape domainAliases', () => {
        const serviceObjectShape = {
            type: "wms",
            url: "https://a.example.com/wms",
            domainAliases: { 0: "", 1: "https://b.example.com/wms", 2: "" }
        };
        expect(CatalogUtils.buildServiceUrl(serviceObjectShape))
            .toBe("https://a.example.com/wms,https://b.example.com/wms");
    });
    it("updateServiceData", () => {
        let records = [{"url": "https://example.tif", sourceMetadata: {crs: "EPSG:3003"}}];
        let options = {service: {type: CatalogUtils.COG_LAYER_TYPE, records: [{url: "https://example.tif"}]}};
        expect(CatalogUtils.updateServiceData(options, {records})).toEqual({...options.service, records});

        records = [{"url": "https://example.tif", sourceMetadata: {crs: "EPSG:3003"}}];
        options = {service: {type: "wms", "autoload": true}};
        expect(CatalogUtils.updateServiceData(options, {records})).toEqual(options.service);
    });
});
