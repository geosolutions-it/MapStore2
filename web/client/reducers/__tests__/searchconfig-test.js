/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const expect = require('expect');

const searchconfig = require('../searchconfig');
const {SET_SEARCH_CONFIG_PROP, RESET_SEARCH_CONFIG, UPDATE_SERVICE} = require('../../actions/searchconfig');

describe('Test the searchconfig reducer', () => {
    it('Map config loaded with textSearchConfig', () => {

        const action = {type: 'MAP_CONFIG_LOADED',
            config: { version: 2, map: {layers: [], text_search_config: {override: true}}}};

        const state = searchconfig({}, action);
        expect(state.textSearchConfig).toExist();
        expect(state.textSearchConfig.override).toBe(true);
    });
    it('Map config loaded without textSearchConfig', () => {

        const action = {type: 'MAP_CONFIG_LOADED',
            config: { version: 2, map: {layers: []}}};

        const state = searchconfig({}, action);
        expect(state.textSearchConfig).toBe(undefined);
    });
    it('reset searchconfig state', () => {
        const state = searchconfig(
            {service: "test", page: 1, init_service_values: "test", editIdx: 2, textSearchConfig: {}}
            , {
                type: RESET_SEARCH_CONFIG,
                page: 0
            });
        expect(state.page).toBe(0);
        expect(state.service).toBe(undefined);
        expect(state.init_service_values).toBe(undefined);
        expect(state.editIdx).toBe(undefined);
        expect(state.textSearchConfig).toExist();
    });

    it('test service update', () => {
        const state = searchconfig({
            textSearchConfig: {services: [{name: "test"}]}
        }, {
            type: UPDATE_SERVICE,
            service: {name: "changed"},
            idx: 0
        });
        expect(state.textSearchConfig).toExist();
        expect(state.textSearchConfig.services[0].name).toBe("changed");
    });
    it('test service add', () => {
        const state = searchconfig({
            textSearchConfig: {services: [{name: "test"}]}
        }, {
            type: UPDATE_SERVICE,
            service: {name: "changed"},
            idx: -1
        });
        expect(state.textSearchConfig).toExist();
        expect(state.textSearchConfig.services[1].name).toBe("changed");
    });

    it('set a search config property', () => {
        const state = searchconfig({}, {
            type: SET_SEARCH_CONFIG_PROP,
            property: "prop",
            value: 'val'
        });
        expect(state.prop).toExist();
        expect(state.prop).toBe('val');
    });
    it('should support both: old textSearchConfig field with typo and corrected new one', () => {
        const oldState = searchconfig({}, {
            type: 'MAP_CONFIG_LOADED',
            config: {
                map: {
                    text_serch_config: 'test'
                }
            }
        });
        const newState = searchconfig({}, {
            type: 'MAP_CONFIG_LOADED',
            config: {
                map: {
                    text_serch_config: 'test'
                }
            }
        });
        expect(oldState.textSearchConfig).toExist();
        expect(newState.textSearchConfig).toExist();
        expect(oldState.textSearchConfig).toBe('test');
        expect(newState.textSearchConfig).toBe('test');
    });
});
