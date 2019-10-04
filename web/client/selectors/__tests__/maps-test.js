/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {
    mapNameSelector,
    mapFromIdSelector,
    mapsResultsSelector,
    mapMetadataSelector,
    isMapsLastPageSelector,
    mapDescriptionSelector,
    showMapDetailsSelector,
    mapDetailsUriFromIdSelector,
    mapPermissionsFromIdSelector,
    mapThumbnailsUriFromIdSelector,
    searchTextSelector,
    searchParamsSelector
} = require('../maps');

const name = "name";
const description = "description";
const details = "%2Fmapstore%2Frest%2Fgeostore%2Fdata%2F10%2Fraw%3Fdecode%3Ddatauri";
const thumbnail = "%2Fmapstore%2Frest%2Fgeostore%2Fdata%2F10%2Fraw%3Fdecode%3Ddatauri";
const detailsText = "<p>name<p>";
const mapId = 1;
const creation = '2017-12-01 10:58:46.337';
const mapsState = {
    maps: {
        showMapDetails: true,
        metadata: {
            name,
            description
        },
        searchText: '*',
        start: 4,
        totalCount: 4,
        results: [
            {
                canDelete: true,
                canEdit: true,
                canCopy: true,
                creation,
                description,
                id: mapId,
                name,
                thumbnail,
                details,
                detailsText,
                owner: 'admin',
                permissions: [
                    {name: "name"}
                ]
            }
        ]
    }
};
describe('Test maps selectors', () => {

    it('test mapsResultsSelector no state', () => {
        const props = mapsResultsSelector(mapsState);
        expect(props.length).toBe(1);
        expect(props[0].creation).toBe(creation);
        expect(props[0].id).toBe(mapId);
    });
    it('test mapFromIdSelector no state', () => {
        const props = mapFromIdSelector(mapsState, mapId);
        expect(props.creation).toBe(creation);
    });
    it('test showMapDetailsSelector no state', () => {
        const props = showMapDetailsSelector(mapsState);
        expect(props).toBe(mapsState.maps.showMapDetails);
    });
    it('test mapNameSelector no state', () => {
        const props = mapNameSelector(mapsState, mapId);
        expect(props).toBe(name);
    });
    it('test mapMetadataSelector no state', () => {
        const props = mapMetadataSelector(mapsState);
        expect(props.name).toBe(name);
        expect(props.description).toBe(description);
    });
    it('test isMapsLastPageSelector no state', () => {
        const props = isMapsLastPageSelector(mapsState);
        expect(props).toBeTruthy();
    });
    it('test mapDescriptionSelector no state', () => {
        const props = mapDescriptionSelector(mapsState, mapId);
        expect(props).toBe(description);
    });
    it('test mapDetailsUriFromIdSelector no state', () => {
        const props = mapDetailsUriFromIdSelector(mapsState, mapId);
        expect(props).toBe("%2Fmapstore%2Frest%2Fgeostore%2Fdata%2F10%2Fraw%3Fdecode%3Ddatauri");
    });
    it('test mapPermissionsFromIdSelector no state', () => {
        const props = mapPermissionsFromIdSelector(mapsState, mapId);
        expect(props.length).toBe(1);
    });
    it('test mapThumbnailsUriFromIdSelector no state', () => {
        const props = mapThumbnailsUriFromIdSelector(mapsState, mapId);
        expect(props).toBe(thumbnail);
    });
    it('test searchTextSelector no state', () => {
        const searchText = searchTextSelector(mapsState);
        expect(searchText).toBe(mapsState.maps.searchText);
    });
    it('test searchParamsSelector no state', () => {
        const params = searchParamsSelector(mapsState);
        expect(params.start).toBe(4);
    });
});
