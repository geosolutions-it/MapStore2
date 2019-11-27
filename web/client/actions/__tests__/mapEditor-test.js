/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';

import {
    hide, HIDE,
    save, SAVE,
    show, SHOW
} from '../mapEditor';

describe('mapEditor actions', () => {
    it('hide', () => {
        const action = hide();
        expect(action.type).toEqual(HIDE);
    });
    it('save', () => {
        const owner = "geostory";
        const map = {};
        const action = save(map, owner);
        expect(action.owner).toEqual(owner);
        expect(action.type).toEqual(SAVE);
        expect(action.map).toBe(map);
    });
    it('show', () => {
        const owner = "geostory";
        const map = {};
        const action = show(owner, map);
        expect(action.owner).toEqual(owner);
        expect(action.type).toEqual(SHOW);
        expect(action.map).toBe(map);
    });
});
