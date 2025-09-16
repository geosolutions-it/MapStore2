/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { SET_SHOW_DETAILS, UNLOAD_RESOURCES } from '../../actions/resources';

import { unloadCatalogResourcesOnAuthentication } from '../resources';

import { testEpic } from '../../../../epics/__tests__/epicTestUtils';
import { loginSuccess, logout } from '../../../../actions/security';

describe('resources Epics', () => {
    it('unloadResources on logout epic', (done) => {
        testEpic(unloadCatalogResourcesOnAuthentication, 2, logout(), ([showDetailsAction, unloadResourcesAction]) => {
            try {
                expect(showDetailsAction).toBeTruthy();
                expect(showDetailsAction.type).toBe(SET_SHOW_DETAILS);
                expect(showDetailsAction.show).toBe(false);
                expect(unloadResourcesAction).toBeTruthy();
                expect(unloadResourcesAction.type).toBe(UNLOAD_RESOURCES);
                done();
            } catch (e) {
                done(e);
            }
        }, {});
    });
    it('unloadResources on login success epic', (done) => {
        testEpic(unloadCatalogResourcesOnAuthentication, 2, loginSuccess(), ([showDetailsAction, unloadResourcesAction]) => {
            try {
                expect(showDetailsAction).toBeTruthy();
                expect(showDetailsAction.type).toBe(SET_SHOW_DETAILS);
                expect(showDetailsAction.show).toBe(false);
                expect(unloadResourcesAction).toBeTruthy();
                expect(unloadResourcesAction.type).toBe(UNLOAD_RESOURCES);
                done();
            } catch (e) {
                done(e);
            }
        }, {});
    });
});
