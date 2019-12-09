/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');

const {
    isDashboardAvailable,
    isDashboardEditing,
    showConnectionsSelector,
    isShowSaveOpen,
    isShowSaveAsOpen,
    dashboardResource,
    isDashboardLoading,
    getDashboardSaveErrors,
    buttonCanEdit
} = require('../dashboard');
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
});
