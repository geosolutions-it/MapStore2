/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {
    mapsResultsSelector,
    mapFromIdSelector,
    mapDetailsUriFromIdSelector,
    mapPermissionsFromIdSelector
} = require('../maps');
const mapsState = {
    maps: {
        results: [
        {
          canDelete: true,
          canEdit: true,
          canCopy: true,
          creation: '2017-12-01 10:58:46.337',
          description: 'desc details map',
          id: 1,
          name: 'details map',
          thumbnail: '%2Fmapstore%2Frest%2Fgeostore%2Fdata%2F4%2Fraw%3Fdecode%3Ddatauri',
          detailsText: '%2Fmapstore%2Frest%2Fgeostore%2Fdata%2F10%2Fraw%3Fdecode%3Ddatauri',
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
        expect(props[0].creation).toBe("2017-12-01 10:58:46.337");
    });
    it('test mapFromIdSelector no state', () => {
        const props = mapFromIdSelector(mapsState, 1);
        expect(props.creation).toBe("2017-12-01 10:58:46.337");
    });
    it('test mapDetailsUriFromIdSelector no state', () => {
        const props = mapDetailsUriFromIdSelector(mapsState, 1);
        expect(props).toBe("%2Fmapstore%2Frest%2Fgeostore%2Fdata%2F10%2Fraw%3Fdecode%3Ddatauri");
    });
    it('test mapPermissionsFromIdSelector no state', () => {
        const props = mapPermissionsFromIdSelector(mapsState, 1);
        expect(props.length).toBe(1);
    });
});
