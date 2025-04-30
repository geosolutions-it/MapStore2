/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import rulesmanager from '../rulesmanager';
import {
    CLEAN_EDITING_GS_INSTANCE,
    EDIT_GS_INSTSANCES,
    GS_INSTANCES_SELECTED,
    GS_INSTSANCE_SAVED,
    SWITCH_GRID,
    STORING_GS_INSTANCES_DD
} from '../../actions/rulesmanager';

describe('test rules manager reducer', () => {

    it('returns original state on unrecognized action', () => {
        var state = rulesmanager(1, {type: 'UNKNOWN'});
        expect(state).toBe(1);
    });

    it('substitute selected rules', () => {
        const oldState = {
            selectedRules: [
                { id: "rules1" },
                { id: "rules2" }
            ]
        };
        var state = rulesmanager(oldState, {
            type: 'RULES_SELECTED',
            merge: false,
            unselect: false,
            rules: [
                { id: "rules3" },
                { id: "rules4" }
            ]
        });
        expect(state.selectedRules.length).toBe(2);
        expect(state.selectedRules).toInclude({ id: "rules3" });
        expect(state.selectedRules).toInclude({ id: "rules4" });
    });

    it('merge selected rules', () => {
        const oldState = {
            selectedRules: [
                { id: "rules1" },
                { id: "rules2" }
            ]
        };
        var state = rulesmanager(oldState, {
            type: 'RULES_SELECTED',
            merge: true,
            unselect: false,
            rules: [
                { id: "rules3" },
                { id: "rules4" }
            ]
        });
        expect(state.selectedRules.length).toBe(4);
        expect(state.selectedRules).toInclude({ id: "rules1" });
        expect(state.selectedRules).toInclude({ id: "rules2" });
        expect(state.selectedRules).toInclude({ id: "rules3" });
        expect(state.selectedRules).toInclude({ id: "rules4" });
    });

    it('substitute unselected rules', () => {
        const oldState = {
            selectedRules: [
                { id: "rules1" },
                { id: "rules2" },
                { id: "rules3" },
                { id: "rules4" }
            ]
        };
        var state = rulesmanager(oldState, {
            type: 'RULES_SELECTED',
            merge: false,
            unselect: true,
            rules: [
                { id: "rules3" },
                { id: "rules4" }
            ]
        });
        expect(state.selectedRules.length).toBe(2);
        expect(state.selectedRules).toInclude({ id: "rules3" });
        expect(state.selectedRules).toInclude({ id: "rules4" });
    });

    it('merge unselected rules', () => {
        const oldState = {
            selectedRules: [
                { id: "rules1" },
                { id: "rules2" },
                { id: "rules3" },
                { id: "rules4" }
            ]
        };
        var state = rulesmanager(oldState, {
            type: 'RULES_SELECTED',
            merge: true,
            unselect: true,
            rules: [
                { id: "rules3" },
                { id: "rules4" }
            ]
        });
        expect(state.selectedRules.length).toBe(2);
        expect(state.selectedRules).toInclude({ id: "rules1" });
        expect(state.selectedRules).toInclude({ id: "rules2" });
    });

    it('update filters values', () => {
        const oldState = {
            filtersValues: {
                filter1: "value1",
                filter2: "value2"
            }
        };
        var state = rulesmanager(oldState, {
            type: 'UPDATE_FILTERS_VALUES',
            filtersValues: {
                filter1: "value4",
                filter3: "value3"
            }
        });
        expect(state.filtersValues).toEqual({
            filter1: "value4",
            filter2: "value2",
            filter3: "value3"
        });
    });
    it('update set filter values', () => {
        const oldState = {
            filters: {
                layer: "layer1"
            }
        };
        var state = rulesmanager(oldState, {
            type: 'RULES_MANAGER:SET_FILTER',
            key: "workspace",
            value: "workspace1"
        });
        expect(state.filters).toEqual({
            layer: "layer1",
            workspace: "workspace1"
        });
    });

    it('update set reset filter values', () => {
        const oldState = {
            filters: {
                workspace: "workspace1",
                workspaceAny: false,
                layer: "layer1"
            }
        };
        var state = rulesmanager(oldState, {
            type: 'RULES_MANAGER:SET_FILTER',
            key: "workspace",
            value: undefined,
            isResetField: true
        });
        expect(state.filters).toEqual({
            workspace: undefined,
            workspaceAny: undefined,
            layer: "layer1"
        });
    });

    it('options loaded', () => {
        const oldState = {
            options: {
                groups: [
                    "group1",
                    "group2"
                ],
                layers: [
                    "layer1",
                    "layer2"
                ]
            }
        };
        var state = rulesmanager(oldState, {
            type: 'OPTIONS_LOADED',
            name: "layers",
            values: [
                "layer3",
                "layer4"
            ],
            page: 10,
            valuesCount: 20
        });
        expect(state.options.groups.length).toBe(2);
        expect(state.options.groups).toInclude("group1");
        expect(state.options.groups).toInclude("group2");
        expect(state.options.layers.length).toBe(2);
        expect(state.options.layers).toInclude("layer3");
        expect(state.options.layers).toInclude("layer4");
        expect(state.options.layersPage).toBe(10);
        expect(state.options.layersCount).toBe(20);
    });
    // for gs instance in case stand-alone geofence
    it('test switch grid', () => {
        const oldState = {
            activeGrid: "rules",
            filters: {
                workspace: "workspace1",
                workspaceAny: false,
                layer: "layer1"
            },
            selectedRules: [
                { id: "rules1" },
                { id: "rules2" },
                { id: "rules3" },
                { id: "rules4" }
            ],
            activeRule: {id: "rules1"}
        };
        var state = rulesmanager(oldState, {
            type: SWITCH_GRID,
            activeGrid: 'gsInstances'
        });
        expect(state.activeGrid).toEqual('gsInstances');
        expect(state.activeGSInstance).toEqual(undefined);
        expect(state.activeRule).toEqual(undefined);
        expect(state.selectedGSInstances).toEqual([]);
        expect(state.selectedRules).toEqual([]);
    });
    it('test EDIT_GS_INSTSANCES action for create', () => {
        const oldState = {
            activeGrid: "gsInstances"
        };
        var state = rulesmanager(oldState, {
            type: EDIT_GS_INSTSANCES,
            createNew: true
        });
        expect(state.activeGSInstance).toEqual({});
    });
    it('test EDIT_GS_INSTSANCES action for edit gs instance', () => {
        const oldState = {
            activeGrid: "gsInstances",
            selectedGSInstances: [
                { id: "gsInstance1" }
            ],
            activeGSInstance: {id: "gsInstance1"}
        };
        var state = rulesmanager(oldState, {
            type: EDIT_GS_INSTSANCES,
            createNew: false
        });
        expect(state.activeGSInstance).toEqual(oldState.selectedGSInstances[0]);
    });
    it('test GS_INSTSANCE_SAVED action for gs instance', () => {
        const oldState = {
            activeGrid: "gsInstances",
            selectedGSInstances: [
                { id: "gsInstance1" }
            ],
            activeGSInstance: {id: "gsInstance1"}
        };
        var state = rulesmanager(oldState, {
            type: GS_INSTSANCE_SAVED,
            createNew: false
        });
        expect(state.selectedGSInstances).toEqual([]);
    });
    it('test select/unselect action for gs instance', () => {
        const oldState1 = {
            activeGrid: "gsInstances",
            selectedGSInstances: []
        };
        const gsInstance1 = { id: "gsInstance1" };
        const gsInstance2 = { id: "gsInstance2" };
        let state1 = rulesmanager(oldState1, {
            type: GS_INSTANCES_SELECTED,
            gsInstances: [gsInstance1]
        });
        expect(state1.selectedGSInstances).toEqual([gsInstance1]);
        const oldState2 = {
            activeGrid: "gsInstances",
            selectedGSInstances: [{ id: "gsInstance1" }]
        };
        let state2 = rulesmanager(oldState2, {
            type: GS_INSTANCES_SELECTED,
            gsInstances: [gsInstance1],
            unselect: true,
            merge: true
        });
        expect(state2.selectedGSInstances).toEqual([]);
        let state3 = rulesmanager(oldState2, {
            type: GS_INSTANCES_SELECTED,
            gsInstances: [gsInstance2],
            merge: true
        });
        expect(state3.selectedGSInstances).toEqual([gsInstance1, gsInstance2]);

    });
    it('test clean edit action for gs instance', () => {
        const oldState = {
            activeGrid: "gsInstances",
            activeGSInstance: {id: "gsInstance1"}
        };
        var state = rulesmanager(oldState, {
            type: CLEAN_EDITING_GS_INSTANCE
        });
        expect(state.activeGSInstance).toEqual(undefined);
    });
    it('test store instances list', () => {
        const oldState = {
            activeGrid: "gsInstances",
            activeGSInstance: {id: "gsInstance1"}
        };
        var state = rulesmanager(oldState, {
            type: STORING_GS_INSTANCES_DD,
            instances: [{id: 1}, {id: 1}]
        });
        expect(state.instances).toEqual([{id: 1}, {id: 1}]);
    });
});
