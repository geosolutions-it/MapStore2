/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';

import { rulesSelector, optionsSelector } from '../rulesmanager';
import ConfigUtils from '../../utils/ConfigUtils';

describe('test rules manager selectors', () => {

    it('test rules selector for stand-alone geofence', () => {
        const state = {
            rulesmanager: {
                rules: [
                    {
                        id: "rules1",
                        priority: 1,
                        roleName: "role1",
                        access: "ALLOW"
                    }
                ]
            }
        };
        const rules = rulesSelector(state);
        expect(rules.length).toBe(1);
        expect(rules[0]).toEqual({
            id: 'rules1',
            priority: 1,
            roleName: 'role1',
            roleAny: '*',
            userName: '*',
            userAny: '*',
            service: '*',
            serviceAny: '*',
            request: '*',
            requestAny: '*',
            workspace: '*',
            workspaceAny: '*',
            layer: '*',
            layerAny: '*',
            access: 'ALLOW',
            instanceName: '*',
            instanceAny: '*'
        });
    });
    it('test rules selector for integrated geofence [geoserver]', () => {
        const state = {
            rulesmanager: {
                rules: [
                    {
                        id: "rules1",
                        priority: 1,
                        roleName: "role1",
                        access: "ALLOW"
                    }
                ]
            }
        };
        ConfigUtils.setConfigProp("geoFenceServiceType", "geoserver");
        const rules = rulesSelector(state);
        expect(rules.length).toBe(1);
        expect(rules[0]).toEqual({
            id: 'rules1',
            priority: 1,
            roleName: 'role1',
            roleAny: '*',
            userName: '*',
            userAny: '*',
            service: '*',
            serviceAny: '*',
            request: '*',
            requestAny: '*',
            workspace: '*',
            workspaceAny: '*',
            layer: '*',
            layerAny: '*',
            access: 'ALLOW'
        });
        ConfigUtils.removeConfigProp("geoFenceServiceType");

    });

    it('test options selector', () => {
        const state = {
            rulesmanager: {
                options: {
                    roles: ["role1"],
                    users: [
                        {userName: "user1"}
                    ],
                    workspaces: [
                        {name: "workspace1"}
                    ],
                    layers: {
                        records: [{
                            dc: {
                                identifier: "workspace:layer1"
                            }
                        }]
                    },
                    layersPage: 5,
                    layersCount: 10
                }
            }
        };
        const options = optionsSelector(state);
        expect(options).toEqual({
            roles: ["role1"],
            users: ["user1"],
            workspaces: ["workspace1"],
            layers: ["layer1"],
            layersPage: 5,
            layersCount: 10
        });
    });
});
