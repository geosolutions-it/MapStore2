/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';


import { UNLOAD_RESOURCES } from '../../actions/resources';
import { LOGOUT } from '../../../../actions/security';

import {unloadCatalogResourcesOnLogout} from '../resources';

import { testEpic } from '../../../../epics/__tests__/epicTestUtils';

describe('resources Epics', () => {
    it('unloadResources epic', (done) => {
        const action = { type: LOGOUT };
        testEpic(unloadCatalogResourcesOnLogout, 1, action, ([update]) => {
            expect(update).toExist();
            expect(update.type).toBe(UNLOAD_RESOURCES);
            done();
        }, {});
    });
});
