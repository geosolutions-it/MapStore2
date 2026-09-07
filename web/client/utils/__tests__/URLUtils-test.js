/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { urlParts, isSameUrl, sameQueryParams, isValidURL, isValidURLTemplate, getDefaultUrl, updateUrlParams, getSafeHref } from '../URLUtils';

const url1 = "https://demo.geo-solutions.it:443/geoserver/wfs";
const url2 = "https://demo.geo-solutions.it/geoserver/wfs";
const url3 = "/geoserver/wfs";
const url4 = (location && location.origin || "FAIL") + "/geoserver/wfs";
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
        expect(isSameUrl(url3, [url2])).toBeFalsy();
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
        // check avoid parsing exceptions
        expect(isSameUrl(
            "https://demo.geo-solutions.it/path/geoserver/wfs?",
            1
        )).toBe(false);
    });
    it('test sameQueryParams', () => {
        // empty cases
        expect(sameQueryParams("", "")).toBe(true);
        expect(sameQueryParams("", undefined)).toBe(true);
        expect(sameQueryParams("", false)).toBe(true);
        expect(sameQueryParams("", "&a=b")).toBe(false);
        // single parameter
        expect(sameQueryParams("a=b", "a=b")).toBe(true);
        expect(sameQueryParams("a=C", "a=b")).toBe(false);
        // dirty
        expect(sameQueryParams("a=b", "&a=b")).toBe(true);
        expect(sameQueryParams("&a=b", "a=b")).toBe(true);
        // multiple params
        expect(sameQueryParams("a=b", "&a=b&c=d")).toBe(false);
        expect(sameQueryParams("a=b&c=d", "&a=b&c=d")).toBe(true);
        // different sorting
        expect(sameQueryParams("a=b&c=d", "&c=d&a=b")).toBe(true);
        // dirty, different sorting
        expect(sameQueryParams("a=b&c=d&", "&c=d&a=b")).toBe(true);
    });

    it('isValidURL', () => {
        expect(isValidURL('http://www.my-site.com')).toBe(true);
        expect(isValidURL('http://www.my-site.com/some/path/to/resource')).toBe(true);
        expect(isValidURL('http://www.my-site.com/some/path/to/resource?query=true&passtest=true')).toBe(true);
        expect(isValidURL('http://www.my-site.com/#/some/path/to/resource')).toBe(true);
        expect(isValidURL('http://www.my-site.com/#/some/path/to/resource?query=true&passtest=true')).toBe(true);
        expect(isValidURL('http://my-site.com')).toBe(true);
        expect(isValidURL('http://my-site.com/some/path/to/resource')).toBe(true);
        expect(isValidURL('http://my-site.com/some/path/to/resource?query=true&passtest=true')).toBe(true);
        expect(isValidURL('http://my-site.com/#/some/path/to/resource')).toBe(true);
        expect(isValidURL('http://my-site.com/#/some/path/to/resource?query=true&passtest=true')).toBe(true);
        expect(isValidURL('https://my-site.com')).toBe(true);
        expect(isValidURL('https://my-site.com/some/path/to/resource')).toBe(true);
        expect(isValidURL('https://my-site.com/some/path/to/resource?query=true&passtest=true')).toBe(true);
        expect(isValidURL('https://my-site.com/#/some/path/to/resource')).toBe(true);
        expect(isValidURL('https://my-site.com/#/some/path/to/resource?query=true&passtest=true')).toBe(true);
        expect(isValidURL('my-site.com')).toBe(false);
        expect(isValidURL('my-site.com/some/path/to/resource')).toBe(false);
        expect(isValidURL('my-site.com/some/path/to/resource?query=false&passtest=false')).toBe(false);
        expect(isValidURL('my-site.com/#/some/path/to/resource')).toBe(false);
        expect(isValidURL('my-site.com/#/some/path/to/resource?query=false&passtest=false')).toBe(false);
        expect(isValidURL('lorem-ipsum-dolor-sit-amet')).toBe(false);
        expect(isValidURL('lorem ipsum dolor sit amet')).toBe(false);
        expect(isValidURL('lorem')).toBe(false);
        expect(isValidURL('data:text/html,<script>something;</script>')).toBe(false);
        expect(isValidURL('javascript:something;')).toBe(false); // eslint-disable-line no-script-url
        expect(isValidURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', undefined, {
            allowedProtocols: ['data']
        })).toBe(true);

    });
    const SAMPLE_URL_TEMPLATES = [
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'http://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
        'http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png',
        'http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
        'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        'http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
        'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        'https://{s}.tile.thunderforest.com/{variant}/{z}/{x}/{y}.png',
        'http://openmapsurfer.uni-hd.de/tiles/{variant}/x={x}&y={y}&z={z}',
        'http://{s}.tile.openstreetmap.se/hydda/{variant}/{z}/{x}/{y}.png',
        'http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}',
        'https://api.tiles.mapbox.com/v4/{source}/{z}/{x}/{y}.png?access_token={accessToken}',
        'https://api.mapbox.com/styles/v1/mapbox/{source}/tiles/{z}/{x}/{y}?access_token={accessToken}',
        'https://stamen-tiles-{s}.a.ssl.fastly.net/{variant}/{z}/{x}/{y}.{ext}',
        'https://server.arcgisonline.com/ArcGIS/rest/services/{variant}/MapServer/tile/{z}/{y}/{x}',
        'http://{s}.tile.openweathermap.org/map/{variant}/{z}/{x}/{y}.png',
        'http://a{s}.acetate.geoiq.com/tiles/{variant}/{z}/{x}/{y}.png',
        'http://t{s}.freemap.sk/T/{z}/{x}/{y}.jpeg',
        'http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png',
        'https://{s}.basemaps.cartocdn.com/{variant}/{z}/{x}/{y}.png',
        'http://{s}.tiles.wmflabs.org/{variant}/{z}/{x}/{y}.png',
        'https://maps{s}.wien.gv.at/basemap/{variant}/normal/google3857/{z}/{y}/{x}.{format}',
        'https://map1.vis.earthdata.nasa.gov/wmts-webmerc/{variant}/default/{time}/{tilematrixset}9/{z}/{y}/{x}.{format}',
        'https://map1.vis.earthdata.nasa.gov/wmts-webmerc/{variant}/default/{time}/{tilematrixset}8/{z}/{y}/{x}.{format}',
        'https://map1.vis.earthdata.nasa.gov/wmts-webmerc/{variant}/default/{time}/{tilematrixset}7/{z}/{y}/{x}.{format}',
        'https://map1.vis.earthdata.nasa.gov/wmts-webmerc/{variant}/default/{time}/{tilematrixset}8/{z}/{y}/{x}.{format}',
        'https://map1.vis.earthdata.nasa.gov/wmts-webmerc/{variant}/default/{time}/{tilematrixset}6/{z}/{y}/{x}.{format}',
        'https://map1.vis.earthdata.nasa.gov/wmts-webmerc/{variant}/default/{time}/{tilematrixset}7/{z}/{y}/{x}.{format}',
        'https://nls-{s}.tileserver.com/{variant}/{z}/{x}/{y}.jpg',
        'http://geo.nls.uk/maps/opendata/{z}/{x}/{y}.png',
        'http://geo.nls.uk/maps/os/six_inch/{z}/{x}/{y}.png',
        'http://geo.nls.uk/maps/os/newpopular/{z}/{x}/{y}.png',
        'http://geo.nls.uk/maps/ireland/gsgs4136/{z}/{x}/{y}.png',
        'http://tiles-{s}.data-cdn.linz.govt.nz/services;key={linzAPIkey}/tiles/v4/{variant}/{tilematrixset}/{z}/{x}/{y}.png',
        'https://geodata.nationaalgeoregister.nl/tiles/service/wmts?layer={variant}&tilematrixset=EPSG:3857&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix={z}&TileCol={x}&TileRow={y}',
        'https://geodata.nationaalgeoregister.nl/luchtfoto/rgb/wmts?layer={variant}&tilematrixset=EPSG:3857&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix={z}&TileCol={x}&TileRow={y}',
        'https://geodata.nationaalgeoregister.nl/luchtfoto/rgb/wmts?layer={variant}&tilematrixset=EPSG:3857&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix={z}&TileCol={x}&TileRow={y}'
    ];
    it('isValidURLTemplate', () => {
        SAMPLE_URL_TEMPLATES.map(url => expect(isValidURLTemplate(url)).toBeTruthy());
    });
    it('getDefaultUrl', () => {
        const _url = [
            'http://gs-stable.geosolutionsgroup.com:443/geoserver1',
            'http://gs-stable.geosolutionsgroup.com:443/geoserver2',
            'http://gs-stable.geosolutionsgroup.com:443/geoserver3'
        ];

        expect(getDefaultUrl(_url)).toBe(_url[0]);
    });

    it("update Url params", () => {
        const url = 'https://my-site.com/some/path/to/resouce?query=true&passtest=true';
        const updatedUrl = updateUrlParams(url, { query: false, passtest: false });
        expect(updatedUrl).toBe('https://my-site.com/some/path/to/resouce?passtest=false&query=false');
    });
    it("add new Url param", () => {
        const url = 'https://my-site.com/some/path/to/resouce';
        const updatedUrl = updateUrlParams(url, { newParam: 'newValue' });
        expect(updatedUrl).toBe('https://my-site.com/some/path/to/resouce?newParam=newValue');
    });
    it("add new Url param empty", () => {
        const url = 'https://my-site.com/some/path/to/resouce';
        const updatedUrl = updateUrlParams(url, {});
        expect(updatedUrl).toBe('https://my-site.com/some/path/to/resouce');
    });

    describe('link targets', () => {
        it('isValidURL rejects urls resolved on another host', () => {
            expect(isValidURL('//other-host.com/x')).toBe(false);
            expect(isValidURL('/\\other-host.com/x')).toBe(false);
        });
        it('isValidURL accepts urls resolved on another host with allowProtocolRelative', () => {
            expect(isValidURL('//other-host.com/x', undefined, { allowProtocolRelative: true })).toBe(true);
        });
        it('isValidURL rejects values that are not strings', () => {
            expect(isValidURL(undefined)).toBe(false);
            expect(isValidURL(null)).toBe(false);
            expect(isValidURL(42)).toBe(false);
            expect(isValidURL({})).toBe(false);
        });
        it('isValidURL rejects protocols that are not allowed', () => {
            // eslint-disable-next-line no-script-url
            expect(isValidURL('javascript:void(0)')).toBe(false);
            expect(isValidURL('vbscript:void(0)')).toBe(false);
            expect(isValidURL('file:///tmp/file.txt')).toBe(false);
            expect(isValidURL('data:text/html,<p>content</p>')).toBe(false);
        });
        it('isValidURL accepts application paths and http urls', () => {
            expect(isValidURL('/viewer/42')).toBe(true);
            expect(isValidURL('/context/name?category=PERMALINK')).toBe(true);
            expect(isValidURL('http://my-host.com/x')).toBe(true);
            expect(isValidURL('https://my-host.com/x')).toBe(true);
        });
        it('getSafeHref returns in app references and linkable urls', () => {
            expect(getSafeHref('#/viewer/42')).toBe('#/viewer/42');
            expect(getSafeHref('?f=map')).toBe('?f=map');
            expect(getSafeHref('/viewer/42')).toBe('/viewer/42');
            expect(getSafeHref('https://my-host.com/x')).toBe('https://my-host.com/x');
            expect(getSafeHref('mailto:info@my-host.com')).toBe('mailto:info@my-host.com');
            expect(getSafeHref('tel:+123456')).toBe('tel:+123456');
        });
        it('getSafeHref returns references without protocol', () => {
            expect(getSafeHref('viewer/42')).toBe('viewer/42');
            expect(getSafeHref('./viewer/42')).toBe('./viewer/42');
            expect(getSafeHref('../viewer/42')).toBe('../viewer/42');
        });
        it('getSafeHref returns an empty string for references resolved on another host', () => {
            expect(getSafeHref('//other-host.com')).toBe('');
            expect(getSafeHref('/\\other-host.com')).toBe('');
            expect(getSafeHref('\\\\other-host.com')).toBe('');
            expect(getSafeHref('\\/other-host.com')).toBe('');
        });
        it('getSafeHref returns an empty string for hrefs with control characters', () => {
            // the browser removes the control characters, resolving the href to a protocol
            expect(getSafeHref('java\nscript:void(0)')).toBe('');
            expect(getSafeHref('java\tscript:void(0)')).toBe('');
        });
        it('getSafeHref returns an empty string for hrefs that can not be used', () => {
            // eslint-disable-next-line no-script-url
            expect(getSafeHref('javascript:void(0)')).toBe('');
            // eslint-disable-next-line no-script-url
            expect(getSafeHref('JAVASCRIPT:void(0)')).toBe('');
            expect(getSafeHref('data:text/html,<p>content</p>')).toBe('');
            expect(getSafeHref(undefined)).toBe('');
            expect(getSafeHref(null)).toBe('');
            expect(getSafeHref('')).toBe('');
            expect(getSafeHref('   ')).toBe('');
            expect(getSafeHref(42)).toBe('');
        });
    });
});


