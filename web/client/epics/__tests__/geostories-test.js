/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
const { testEpic } = require('./epicTestUtils');
const ConfigUtils = require('../../utils/ConfigUtils');

const {
    searchGeostoriesOnMapSearch,
    searchGeostories: searchGeostoriesEpic,
    reloadOnGeostories
} = require('../geostories');

const { storySaved } = require('../../actions/geostory');


const {
    SEARCH_GEOSTORIES,
    searchGeostories,
    LOADING,
    GEOSTORIES_LIST_LOADED
} = require('../../actions/geostories');

const {
    SHOW_NOTIFICATION
} = require('../../actions/notifications');

const {
    mapsLoading
} = require('../../actions/maps');
let getDefaults = ConfigUtils.getDefaults;
describe('geostories epics', () => {
    beforeEach( () => {
        getDefaults = ConfigUtils.getDefaults;
    });
    afterEach(() => {
        ConfigUtils.getDefaults = getDefaults;
    });
    it('searchGeostoriesOnMapSearch', (done) => {
        const startActions = [mapsLoading("Search Text")];
        testEpic(searchGeostoriesOnMapSearch, 1, startActions, actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case LOADING:

                    break;
                case SEARCH_GEOSTORIES:
                    expect(action.searchText).toBe("Search Text");
                    done();
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            });
            done();
        }, {});
    });
    it('searchGeostories', (done) => {
        const baseUrl = "base/web/client/test-resources/geostore/extjs/search/search_1.json#";
        ConfigUtils.getDefaults = () => ({
            geoStoreUrl: baseUrl
        });

        const startActions = [searchGeostories("Search Text")];
        testEpic(searchGeostoriesEpic, 3, startActions, actions => {
            expect(actions.length).toBe(3);
            expect(actions[0].type).toBe(LOADING);
            expect(actions[0].name).toBe("loading");
            expect(actions[0].value).toBe(true);
            expect(actions[1].type).toBe(GEOSTORIES_LIST_LOADED);
            expect(actions[1].totalCount).toBe(1);
            expect(actions[2].type).toBe(LOADING);
            expect(actions[2].name).toBe("loading");
            expect(actions[2].value).toBe(false);
            done();
        }, {});
    });
    describe('reloadOnGeostories', () => {
        it('reload on storySaved', (done) => {
            const startActions = [storySaved("Search Text")];
            testEpic(reloadOnGeostories, 1, startActions, ([a]) => {
                expect(a.type).toBe(SEARCH_GEOSTORIES);
                expect(a.params.start).toBe(0);
                expect(a.params.limit).toBe(12);
                expect(a.searchText).toBe("test");
                done();
            }, {
                geostories: {
                    searchText: "test",
                    options: {
                        params: {
                            start: 0,
                            limit: 12
                        }
                    }
                }
            });
        });
    });
    it('searchGeostories error', (done) => {
        const baseUrl = "base/web/client/test-resources/geostore/extjs/search/NODATA#";
        ConfigUtils.getDefaults = () => ({
            geoStoreUrl: baseUrl
        });

        const startActions = [searchGeostories("Search Text")];
        testEpic(searchGeostoriesEpic, 3, startActions, actions => {
            expect(actions.length).toBe(3);
            expect(actions[0].type).toBe(LOADING);
            expect(actions[0].name).toBe("loading");
            expect(actions[0].value).toBe(true);
            expect(actions[1].type).toBe(SHOW_NOTIFICATION);
            expect(actions[2].type).toBe(LOADING);
            expect(actions[2].name).toBe("loading");
            expect(actions[2].value).toBe(false);
            done();
        }, {});
    });
});
