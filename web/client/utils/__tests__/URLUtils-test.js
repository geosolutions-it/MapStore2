/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const { urlParts, isSameUrl, sameQueryParams} = require('../URLUtils');

const url1 = "https://demo.geo-solutions.it:443/geoserver/wfs";
const url2 = "https://demo.geo-solutions.it/geoserver/wfs";
const url3 = "/geoserver/wfs";
const url4 = "http://localhost/geoserver/wfs";
const urlPartsResult1 = {
    protocol: "https:",
    domain: "demo.geo-solutions.it",
    port: "443",
    rootPath: "/geoserver/wfs",
    applicationRootPath: 'geoserver'
};
describe('URLUtils', () => {
    it('test urlParts', () => {
        const data = urlParts(url1);
        expect(data).toEqual(urlPartsResult1);
    });
    it('test urlParts undefined url', () => {
        const data = urlParts();
        expect(data).toEqual({});
    });
    it('test isSameUrl', () => {
        const data = isSameUrl(url1, url2);
        expect(data).toBeTruthy();
    });
    it('test isSameUrl with relative url', () => {
        const data = isSameUrl(url3, url4);
        expect(data).toBeTruthy();
    });
    it('test isSameUrl with array', () => {
        expect(isSameUrl(url3, [url4])).toBeTruthy();
        expect(isSameUrl(url3, [url4])).toBeTruthy();
    });
    it('test isSameUrl with one null', () => {
        const data = isSameUrl(url3);
        expect(data).toBeFalsy();
    });
    it('test isSameUrl with clean and dirty relative url', () => {
        expect(isSameUrl(
            "/geoserver/wfs",
            "/geoserver/wfs?&")).toBe(true);
        expect(isSameUrl(
            "/geoserver/wfs",
            "/geoserver/wfs?&&&&")).toBe(true);
        expect(isSameUrl(
            "/geoserver/wfs",
            "/geoserver/wfs?")).toBe(true);
        expect(isSameUrl(
            "/geoserver/wfs?&",
            "/geoserver/wfs?param1=true&param2=false")).toBe(false);
        expect(isSameUrl(
            "/path/geoserver/wfs?",
            "/geoserver/wfs?")).toBe(false);

    });
    it('test isSameUrl with clean and dirty absolute url', () => {
        expect(isSameUrl(
            "https://demo.geo-solutions.it:443/geoserver/wfs",
            "https://demo.geo-solutions.it/geoserver/wfs?")).toBe(true);
        expect(isSameUrl(
            "https://demo.geo-solutions.it:443/geoserver/wfs",
            "https://demo.geo-solutions.it/geoserver/wfs?")).toBe(true);
        expect(isSameUrl(
            "https://demo.geo-solutions.it/geoserver/wfs?",
            "https://demo.geo-solutions.it/geoserver/wfs?param1=true&param2=false")).toBe(false);
        expect(isSameUrl(
            "https://demo.geo-solutions.it/path/geoserver/wfs?",
            "https://demo.geo-solutions.it/geoserver/wfs?")).toBe(false);
    });
    it('test sameQueryParams', () => {
        expect(sameQueryParams("", "")).toBe(true);
        expect(sameQueryParams("", undefined)).toBe(true);
        expect(sameQueryParams("", false)).toBe(true);
        expect(sameQueryParams("", "&a=b")).toBe(false);
        expect(sameQueryParams("a=b", "a=b")).toBe(true);
        expect(sameQueryParams("a=C", "a=b")).toBe(false);
        expect(sameQueryParams("a=b", "&a=b")).toBe(true);
        expect(sameQueryParams("a=b", "&a=b&c=d")).toBe(false);
        expect(sameQueryParams("a=b&c=d", "&a=b&c=d")).toBe(true);
    });

});
