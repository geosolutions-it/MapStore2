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
    searchDashboardsOnMapSearch,
    searchDashboards: searchDashboardsEpic,
    reloadOnDashboards
} = require('../dashboards');

const { dashboardSaved } = require('../../actions/dashboard');


const {
    SEARCH_DASHBOARDS,
    searchDashboards,
    LOADING,
    DASHBOARDS_LIST_LOADED
} = require('../../actions/dashboards');

const {
    SHOW_NOTIFICATION
} = require('../../actions/notifications');

const {
    mapsLoading
} = require('../../actions/maps');
let getDefaults = ConfigUtils.getDefaults;
describe('dashboards epics', () => {
    beforeEach( () => {
        getDefaults = ConfigUtils.getDefaults;
    });
    afterEach(() => {
        ConfigUtils.getDefaults = getDefaults;
    });
    it('searchDashboardsOnMapSearch', (done) => {
        const startActions = [mapsLoading("Search Text")];
        testEpic(searchDashboardsOnMapSearch, 1, startActions, actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case LOADING:

                    break;
                case SEARCH_DASHBOARDS:
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
    it('searchDashboards', (done) => {
        const baseUrl = "base/web/client/test-resources/geostore/extjs/search/search_1.json#";
        ConfigUtils.getDefaults = () => ({
            geoStoreUrl: baseUrl
        });

        const startActions = [searchDashboards("Search Text")];
        testEpic(searchDashboardsEpic, 3, startActions, actions => {
            expect(actions.length).toBe(3);
            expect(actions[0].type).toBe(LOADING);
            expect(actions[0].name).toBe("loading");
            expect(actions[0].value).toBe(true);
            expect(actions[1].type).toBe(DASHBOARDS_LIST_LOADED);
            expect(actions[1].totalCount).toBe(1);
            expect(actions[2].type).toBe(LOADING);
            expect(actions[2].name).toBe("loading");
            expect(actions[2].value).toBe(false);
            done();
        }, {});
    });
    describe('reloadOnDashboards', () => {
        it('reload on dashboardSaved', (done) => {
            const startActions = [dashboardSaved("Search Text")];
            testEpic(reloadOnDashboards, 1, startActions, ([a]) => {
                expect(a.type).toBe(SEARCH_DASHBOARDS);
                expect(a.params.start).toBe(0);
                expect(a.params.limit).toBe(12);
                expect(a.searchText).toBe("test");
                done();
            }, {
                dashboards: {
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
    it('searchDashboards error', (done) => {
        const baseUrl = "base/web/client/test-resources/geostore/extjs/search/NODATA#";
        ConfigUtils.getDefaults = () => ({
            geoStoreUrl: baseUrl
        });

        const startActions = [searchDashboards("Search Text")];
        testEpic(searchDashboardsEpic, 3, startActions, actions => {
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
