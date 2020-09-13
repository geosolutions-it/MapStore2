/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');

const maps = require('../maps');
const {
    mapsLoaded, mapsLoading, loadError, mapCreated,
    mapDeleting,
    mapsSearchTextChanged, setShowMapDetails} = require('../../actions/maps');

const sampleMap = {
    canDelete: false,
    showMapDetails: true,
    canEdit: false,
    canCopy: true,
    creation: '2017-01-16 12:16:09.538',
    lastUpdate: '2017-03-17 11:51:34.428',
    description: 'Simple map to test WFS search capabilities',
    id: 1,
    name: 'WFS Test Map',
    thumbnail: '%2Fmapstore%2Frest%2Fgeostore%2Fdata%2F1744%2Fraw%3Fdecode%3Ddatauri',
    owner: 'admin'
};

const mapsSampleResult = {

    results: [
        sampleMap
    ],
    totalCount: 1
};
describe('Test the maps reducer', () => {
    it('on default state and unknown action, ', () => {
        let state = maps(undefined, {type: "____NOT_EXISTING_ACTION____"});
        expect(state).toExist();
        expect(state.enabled).toBe(false);
        expect(state.searchText).toBe("");
    });

    it('on mapsSearchTextChanged action', () => {
        let state = maps(null, mapsSearchTextChanged("TEST"));
        expect(state.searchText).toBe("TEST");
    });
    it('on setShowMapDetails action', () => {
        let bool = false;
        let state = maps({showMapDetails: true}, setShowMapDetails(bool));
        expect(state.showMapDetails).toBe(bool);
    });
    it('on mapSearchText', () => {
        let state = maps(null, mapsLoading("TEST", {
            start: 0,
            limit: 10
        }));
        expect(state.loading).toBe(true);
        expect(state.start).toBe(0);
        expect(state.limit).toBe(10);
        expect(state.searchText).toBe("TEST");
    });
    it('on mapsLoaded', () => {
        let state = maps(null, mapsLoaded(mapsSampleResult, {
            start: 0,
            limit: 10
        }, "TEST"));
        expect(state.loading).toBe(false);
        expect(state.start).toBe(0);
        expect(state.limit).toBe(10);
        expect(state.searchText).toBe("TEST");
        expect(state.results).toBe(mapsSampleResult.results);

        // check for single result without array
        state = maps(null, mapsLoaded({results: sampleMap}, "TEST", {
            start: 0,
            limit: 10
        }));
        expect(state.results.length).toBe(1);
        expect(state.results[0]).toBe(sampleMap);
        // check for empty string for no results
        state = maps(null, mapsLoaded({results: ""}, "TEST", {
            start: 0,
            limit: 10
        }));
        expect(state.results.length).toBe(0);
    });
    it('on loadError', () => {
        let state = maps(null, loadError("ERROR"));
        expect(state.loadingError).toBe("ERROR");
    });
    it('on mapCreated, mapDeleting and mapDeleted', () => {
        let state = maps(null, mapsLoaded(mapsSampleResult, "TEST", {
            start: 0,
            limit: 10
        }));
        state = maps(state, mapCreated(42, {id: 42, name: "test"}, {}));
        expect(state.results.length).toBe(2);
        state = maps(state, mapDeleting(42, "success"));
        expect(state.results[1].deleting).toBe(true);
        expect(state.totalCount).toBe(2);

    });
});
