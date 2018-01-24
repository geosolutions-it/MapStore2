/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {
    currentMapSelector,
    currentMapIdSelector,
    currentMapNameSelector,
    currentMapDecriptionSelector,
    currentMapDetailsUriSelector,
    currentMapDetailsTextSelector,
    currentMapThumbnailUriSelector,
    currentMapDetailsChangedSelector,
    currentMapOriginalDetailsTextSelector
} = require('../currentmap');

const uri = "some/uri/6/";
const name = "name";
const description = "description";
const detailsText = "<p>adsojvasova<p/>";
const originalDetails = "<p>old value<p/>";
const mapId = 1;
const currentMapState = {
    currentMap: {
        name,
        description,
        details: uri,
        thumbnail: uri,
        id: mapId,
        detailsText,
        originalDetails,
        detailsChanged: true
    }};
describe('Test current map selectors', () => {
    it('test currentMapSelector', () => {
        const props = currentMapSelector(currentMapState);
        expect(props.detailsText).toBe("<p>adsojvasova<p/>");
    });
    it('test currentMapIdSelector', () => {
        const props = currentMapIdSelector(currentMapState);
        expect(props).toBe(mapId);
    });
    it('test currentMapNameSelector', () => {
        const props = currentMapNameSelector(currentMapState);
        expect(props).toBe("name");
    });
    it('test currentMapDetailsUriSelector', () => {
        const props = currentMapDetailsUriSelector(currentMapState);
        expect(props).toBe(uri);
    });
    it('test currentMapDecriptionSelector', () => {
        const props = currentMapDecriptionSelector(currentMapState);
        expect(props).toBe(description);
    });
    it('test currentMapDetailsTextSelector', () => {
        const props = currentMapDetailsTextSelector(currentMapState);
        expect(props).toBe("<p>adsojvasova<p/>");
    });
    it('test currentMapThumbnailUriSelector', () => {
        const props = currentMapThumbnailUriSelector(currentMapState);
        expect(props).toBe(uri);
    });
    it('test currentMapDetailsChangedSelector', () => {
        const props = currentMapDetailsChangedSelector(currentMapState);
        expect(props).toBeTruthy();
    });
    it('test currentMapOriginalDetailsTextSelector', () => {
        const props = currentMapOriginalDetailsTextSelector(currentMapState);
        expect(props).toBe(originalDetails);
    });

});
