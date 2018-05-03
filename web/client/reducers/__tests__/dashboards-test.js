/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');

var dashboards = require('../dashboards');
const {
    setDashboardsAvailable,
    dashboardListLoaded,
    dashboardsLoading
} = require('../../actions/dashboards');


describe('Test the dashboards reducer', () => {
    it('dashboards setDashboardsAvailable', () => {
        const action = setDashboardsAvailable(true);
        const state = dashboards( undefined, action);
        expect(state).toExist();
        expect(state.available).toBe(true);
    });
    it('dashboards dashboardListLoaded', () => {
        const action = dashboardListLoaded({
            results: ""
        }, {
            searchText: "TEST"
        });
        const state = dashboards( undefined, action);
        expect(state).toExist();
        expect(state.results.length).toBe(0);
        expect(state.searchText).toBe("TEST");
    });
    it('dashboards dashboardsLoading', () => {
        const action = dashboardsLoading(true);
        const state = dashboards( undefined, action);
        expect(state).toExist();
        expect(state.loading).toBe(true);
    });
    it('dashboards dashboardsLoading save', () => {
        const action = dashboardsLoading(true, "saving");
        const state = dashboards(undefined, action);
        expect(state).toExist();
        expect(state.loading).toBe(true);
        expect(state.loadFlags.saving).toBe(true);
    });
});
