/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const ReactDOM = require('react-dom');
const expect = require('expect');
const mapimport = require('../mapimport');
const { setLayers, onSelectLayer, onError, setLoading, onLayerAdded, updateBBox, onSuccess } = require('../../actions/mapimport');
const L1 = {name: "L1"};
const L2 = { name: "L2" };
const W1 = {name: "TEST", "message": "M1"};
const W1_2 = { name: "TEST", "message": "M1" };
const W2 = { name: "TEST1", "message": "M1" };
const BBOX = [0, 0, 1, 1];
const MESSAGE = "MESSAGE";
describe('mapimport reducer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('state change on setLayers', () => {

        const action = setLayers([L1, L2], [W1]);
        const state = mapimport( undefined, action);
        expect(state).toExist();
        expect(state.layers.length).toBe(2);
        expect(state.errors.length).toBe(1);
        expect(state.selected).toBe(L1);
    });
    it('mapimport onSelectLayer', () => {
        const action = onSelectLayer(L1);
        const state = mapimport( undefined, action);
        expect(state).toExist();
        expect(state.selected).toBe(L1);
    });
    it('mapimport onSelectLayer', () => {
        const action = onError(W1);
        const state = mapimport(undefined, action);
        expect(state).toExist();
        expect(state.errors.length).toBe(1);
        const state2 = mapimport(state, onError(W1_2));
        expect(state2.errors.length).toBe(1);
        const state3 = mapimport(state, onError(W2));
        expect(state3.errors.length).toBe(2);
    });
    it('mapimport setLoading', () => {
        const action = setLoading(true);
        const state = mapimport( undefined, action);
        expect(state).toExist();
        expect(state.loading).toBe(true);
    });
    it('mapimport onLayerAdded', () => {
        const BASE_STATE = mapimport(undefined, setLayers([L1, L2], [W1]));
        const state = mapimport(BASE_STATE, onLayerAdded(L1));
        expect(state).toExist();
        expect(state.layers.length).toBe(1);
        expect(state.errors.length).toBe(1);
        expect(state.selected).toBe(L2);
    });
    it('mapimport updateBBox', () => {
        const action = updateBBox(BBOX);
        const state = mapimport( undefined, action);
        expect(state).toExist();
        expect(state.bbox).toBe(BBOX);
    });
    it('mapimport onSuccess', () => {
        const action = onSuccess(MESSAGE);
        const state = mapimport( undefined, action);
        expect(state).toExist();
        expect(state.success).toBe(MESSAGE);
    });
    it('state change on setLayers when import is canceled', () => {
        const action = setLayers(null);
        const state = mapimport( undefined, action);
        expect(state).toExist();
        expect(state.layers).toBe(null);
        expect(state.errors).toBe(null);
        expect(state.selected).toBe(null);
        expect(state.success).toBe(null);
    });
});
