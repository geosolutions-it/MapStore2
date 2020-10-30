/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');

const {getUrls, template} = require('../TileProviderUtils');
const url = "//stamen-tiles-{s}.a.ssl.fastly.net/{variant}/{z}/{x}/{y}.{ext}";
const urlReplaced = "//stamen-tiles-a.a.ssl.fastly.net/{variant}/{z}/{x}/{y}.{ext}";

const optArray = {
    subdomains: ['a', 'b', 'c', 'd'],
    variant: 'toner', // this can't be missing
    ext: 'png', // this can't be missing
    url
};
describe('Test the TileProviderUtils', () => {
    it('test getUrls defaults', () => {
        let urls = getUrls();
        expect(urls.length).toBe(3);
        urls.forEach((u) => {
            expect(u).toBe("");
        });
    });
    it('test getUrls with String as subdomains', () => {
        const opt = {
            subdomains: 'abcd',
            variant: 'toner', // this can't be missing
            ext: 'png', // this can't be missing
            url
        };
        let urls = getUrls(opt);
        expect(urls.length).toBe(opt.subdomains.length);
        urls.forEach((u, i) => {
            expect(u.indexOf("//stamen-tiles-" + opt.subdomains[i])).toBe(0);
        });
    });
    it('test getUrls with array of char as subdomains', () => {

        let urls = getUrls(optArray);
        expect(urls.length).toBe(optArray.subdomains.length);
        urls.forEach((u, i) => {
            expect(u.indexOf("//stamen-tiles-" + optArray.subdomains[i])).toBe(0);
        });
    });

    it('test template defaults', () => {
        const value = template();
        expect(value).toBe("");
    });
    it('test template ', () => {
        const value = template(urlReplaced, optArray);
        expect(value).toBe("//stamen-tiles-a.a.ssl.fastly.net/" + optArray.variant + "/{z}/{x}/{y}." + optArray.ext);
        expect(
            template("https://test.com/6510a8722129af6954196fbb26dfadc/1.0.0/topowebb/default/3857/{z}/{y}/{x}.png", optArray))
            .toEqual("https://test.com/6510a8722129af6954196fbb26dfadc/1.0.0/topowebb/default/3857/{z}/{y}/{x}.png");
        // expect().toBe();
    });


});
