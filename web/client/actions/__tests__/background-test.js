/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const {
    SET_LAYER_BACKGROUND,
    SET_START_BACKGROUND,
    setLayerBackground,
    setStartBackground
} = require('../background');

describe('Test background selector actions', () => {
    it('test set layer background action', () => {
        const name = "currentLayer";
        const layer = {};
        const e = setLayerBackground(name, layer);

        expect(e).toExist();
        expect(e.type).toBe(SET_LAYER_BACKGROUND);
        expect(e.name).toExist();
        expect(e.name).toBe(name);
        expect(e.layer).toExist();
        expect(e.layer).toEqual(layer);

    });

    it('test set start background action', () => {
        const start = 1;
        const e = setStartBackground(start);

        expect(e).toExist();
        expect(e.type).toBe(SET_START_BACKGROUND);
        expect(e.start).toExist();
        expect(e.start).toBe(start);
    });
});
