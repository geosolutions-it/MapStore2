/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {
    SET_LAYERS, setLayers,
    ON_ERROR, onError,
    LOADING, setLoading,
    ON_SELECT_LAYER, onSelectLayer,
    ON_LAYER_ADDED, onLayerAdded,
    UPDATE_BBOX, updateBBox,
    ON_SUCCESS, onSuccess,
    ON_SHAPE_ERROR, onShapeError
} = require('../mapimport');
describe('map import actions', () => {
    it('onSuccess', () => {
        const action = onSuccess("message");
        expect(action).toExist();
        expect(action.type).toBe(ON_SUCCESS);
        expect(action.message).toBe("message");
    });
    it('onShapeError', () => {
        const action = onShapeError("message");
        expect(action).toExist();
        expect(action.type).toBe(ON_SHAPE_ERROR);
        expect(action.message).toBe("message");
    });
    it('updateBBox', () => {
        const action = updateBBox([1, 2, 3, 4]);
        expect(action).toExist();
        expect(action.type).toBe(UPDATE_BBOX);
        expect(action.bbox).toEqual([1, 2, 3, 4]);
    });
    it('onLayerAdded', () => {
        const layer = {
            type: "vector",
            name: "annotations"
        };
        const action = onLayerAdded(layer);
        expect(action).toExist();
        expect(action.type).toBe(ON_LAYER_ADDED);
        expect(action.layer).toEqual(layer);
    });
    it('onError', () => {
        const action = onError("message");
        expect(action).toExist();
        expect(action.type).toBe(ON_ERROR);
        expect(action.error).toBe("message");
    });
    it('onSelectLayer', () => {
        const action = onSelectLayer("layer");
        expect(action).toExist();
        expect(action.type).toBe(ON_SELECT_LAYER);
        expect(action.layer).toBe("layer");
    });
    it('setLoading', () => {
        const action = setLoading(true);
        expect(action).toExist();
        expect(action.type).toBe(LOADING);
        expect(action.status).toBe(true);
    });
    it('setLayers', () => {
        const layers = [{
            type: "vector",
            name: "annotations"
        }];
        const errors = [];
        const action = setLayers(layers, errors);
        expect(action).toExist();
        expect(action.type).toBe(SET_LAYERS);
        expect(action.layers).toEqual(layers);
        expect(action.errors).toEqual(errors);
    });
});
