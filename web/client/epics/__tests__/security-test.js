/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { testEpic, addTimeoutEpic, TEST_TIMEOUT } from './epicTestUtils';
import { refreshLayersOnRulesUpdateEpic } from '../security';
import { loadRequestsRules } from '../../actions/security';
import { CHANGE_LAYER_PROPERTIES } from '../../actions/layers';

describe('security epics', () => {
    it('refreshLayersOnRulesUpdateEpic refreshes the layers a changed rule applies to', (done) => {
        const rules = [
            { urlPattern: '^\\/geoserver\\/', params: { authkey: '${securityToken}' } },
            { urlPattern: '^https://gs\\.example\\.com/geoserver/', headers: { Authorization: 'Bearer service-token' } }
        ];
        const state = {
            security: { previousRules: [] },
            layers: {
                flat: [
                    { id: 'relative', url: '/geoserver/wms' },
                    { id: 'absolute', url: `${window.location.origin}/geoserver/wms` },
                    { id: 'named-host', url: ['https://tiles.example.net/wms', 'https://gs.example.com/geoserver/wms'] },
                    { id: 'other-host', url: 'https://tiles.example.net/geoserver/wms' },
                    { id: 'no-url' }
                ]
            }
        };
        testEpic(addTimeoutEpic(refreshLayersOnRulesUpdateEpic, 50), 4, loadRequestsRules(rules), actions => {
            expect(actions.map(({ type }) => type)).toEqual([CHANGE_LAYER_PROPERTIES, CHANGE_LAYER_PROPERTIES, CHANGE_LAYER_PROPERTIES, TEST_TIMEOUT]);
            expect(actions.slice(0, 3).map(({ layer }) => layer)).toEqual(['relative', 'absolute', 'named-host']);
            done();
        }, state);
    });
});
