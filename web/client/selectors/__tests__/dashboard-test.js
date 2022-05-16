/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {
    getDashboardId,
    isDashboardAvailable,
    isDashboardEditing,
    showConnectionsSelector,
    isShowSaveOpen,
    isShowSaveAsOpen,
    dashboardResource,
    isDashboardLoading,
    getDashboardSaveErrors,
    buttonCanEdit,
    dashboardServicesSelector,
    selectedDashboardServiceSelector,
    dashboardCatalogModeSelector,
    dashboardIsNewServiceSelector,
    dashboardSaveServiceSelector
} from '../dashboard';

describe('dashboard selectors', () => {
    it('test isDashboardAvailable selector', () => {
        const state = {dashboard: {editor: {available: true}}};
        expect(isDashboardAvailable(state)).toBe(true);
    });
    it('test isDashboardEditing selector', () => {
        const state = { dashboard: { editing: true } };
        expect(isDashboardEditing(state)).toBe(true);
    });
    it('test showConnectionsSelector', () => {
        expect(showConnectionsSelector({
            dashboard: {
                showConnections: true
            }
        })).toBe(true);
    });
    it('isShowOpen', () => {
        expect(isShowSaveOpen({
            dashboard: {
                showSaveModal: true
            }
        })).toBe(true);
    });
    it('isShowSaveAsOpen', () => {
        expect(isShowSaveAsOpen({
            dashboard: {
                showSaveAsModal: true
            }
        })).toBe(true);
    });
    it('dashboardResource', () => {
        expect(dashboardResource({
            dashboard: {
                resource: {}
            }
        })).toExist();
    });
    it('isDashboardLoading', () => {
        expect(isDashboardLoading({
            dashboard: {
                loading: true
            }
        })).toBe(true);
    });
    it('getDashboardSaveErrors', () => {
        expect(getDashboardSaveErrors({
            dashboard: {
                saveErrors: [{}]
            }
        }).length).toBe(1);
    });
    it('test buttonCanEdit with a new dashboared', () => {
        expect(buttonCanEdit({
            router: {
                location: {
                    pathname: '/dashboard/'
                }
            }
        })).toBe(true);
    });
    it('test buttonCanEdit when load a dashboared', () => {
        expect(buttonCanEdit({
            router: {
                location: {
                    pathname: '/dashboard/0000'
                }
            }
        })).toBe(false);
    });

    it("test dashboardServicesSelector", () => {
        const services = {test: {name: 'test'}};
        expect(dashboardServicesSelector({dashboard: {services}})).toBe(services);
    });

    it("test selectedDashboardServiceSelector", () => {
        const selectedService = {name: 'test'};
        expect(selectedDashboardServiceSelector({dashboard: {selectedService}})).toBe(selectedService);
    });

    it("test dashboardCatalogModeSelector", () => {
        expect(dashboardCatalogModeSelector({dashboard: {mode: "edit"}})).toBe("edit");
    });

    it("test dashboardIsNewServiceSelector", () => {
        expect(dashboardIsNewServiceSelector({dashboard: {isNew: true}})).toBe(true);
    });

    it("test dashboardSaveServiceSelector", () => {
        expect(dashboardSaveServiceSelector({dashboard: {saveServiceLoading: true}})).toBe(true);
    });
    it("getDashboardId should return dashboard id in case it exists", () => {
        expect(getDashboardId({dashboard: {resource: {id: '1234'}}})).toBe('1234');
    });
    it("getDashboardId should return undefined in case resource does not exists", () => {
        expect(getDashboardId({dashboard: {resource: {}}})).toBe(undefined);
    });

});
