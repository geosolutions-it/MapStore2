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
    mapsLoaded, mapsLoading, loadError, mapCreated, mapUpdating,
    mapMetadataUpdated, mapDeleting, mapDeleted, attributeUpdated, thumbnailError, permissionsLoading,
    permissionsLoaded, saveMap, permissionsUpdated, resetUpdating,
    mapsSearchTextChanged} = require('../../actions/maps');

const sampleMap = {
    canDelete: false,
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
const SecurityRule = {canRead: true, canWrite: false};
const permissions = {
    SecurityRuleList: {SecurityRule}
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
    it('on mapUpdating, mapMetadataUpdated, attributeUpdated, permissionsUpdated and resetUpdating, thumbnailError', () => {
        let state = maps(null, mapsLoaded(mapsSampleResult, "TEST", {
            start: 0,
            limit: 10
        }));
        state = maps(state, mapUpdating(sampleMap.id));
        expect(state.results[0].updating).toBe(true);
        state = maps(state, resetUpdating(sampleMap.id));
        expect(state.results[0].updating).toBe(false);
        state = maps(state, mapUpdating(sampleMap.id));
        expect(state.results[0].updating).toBe(true);
        state = maps(state, mapMetadataUpdated(sampleMap.id, "newName", "newDescription" ));
        expect(state.results[0].updating).toBe(false);
        expect(state.results[0].name).toBe("newName");
        expect(state.results[0].description).toBe("newDescription");
        state = maps(state, attributeUpdated(sampleMap.id, "attr", "newValue" ));
        expect(state.results[0].attr).toBe("newValue");
        state = maps(state, permissionsUpdated(sampleMap.id, "ERROR" ));
        expect(state.results[0].loadingError).toBe("ERROR");
        state = maps(state, mapUpdating(sampleMap.id));
        expect(state.results[0].updating).toBe(true);
        state = maps(state, thumbnailError(sampleMap.id));
        expect(state.results[0].updating).toBe(false);
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
        state = maps(state, mapDeleted(42, "success"));
        expect(state.results.length).toBe(1);
        expect(state.totalCount).toBe(1);

    });
    it('on saveMap', () => {
        let state = maps(null, mapsLoaded(mapsSampleResult, "TEST", {
            start: 0,
            limit: 10
        }));
        state = maps(state, saveMap({
            newThumbnail: "THUMB",
            thumbnailError: "ERR",
            thumbnail: "thumb"
        }, sampleMap.id));

        expect(state.results[0].thumbnail).toBe("thumb");
        expect(state.results[0].thumbnailError).toBe("ERR");
        expect(state.results[0].newThumbnail).toBe("THUMB");
    });
    it('on permissionsLoading and permissionsLoaded', () => {
        let state = maps(null, mapsLoaded(mapsSampleResult, "TEST", {
            start: 0,
            limit: 10
        }));
        state = maps(state, permissionsLoading(sampleMap.id));
        expect(state.results[0].permissionLoading).toBe(true);
        state = maps(state, permissionsLoaded(permissions, sampleMap.id));
        expect(state.results[0].permissionLoading).toBe(false);
        expect(state.results[0].permissions).toExist();
        expect(state.results[0].permissions.SecurityRuleList).toExist();
        expect(state.results[0].permissions.SecurityRuleList.SecurityRule).toExist();
        expect(state.results[0].permissions.SecurityRuleList.SecurityRule.length).toBe(1);
        state = maps(state, permissionsLoaded({
            SecurityRuleList: {SecurityRule: [SecurityRule]}
        }, sampleMap.id));
        expect(state.results[0].permissions.SecurityRuleList).toExist();
        expect(state.results[0].permissions.SecurityRuleList.SecurityRule).toExist();
        expect(state.results[0].permissions.SecurityRuleList.SecurityRule.length).toBe(1);

    });


});
