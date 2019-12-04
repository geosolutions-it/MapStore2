/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';

import {openSelector, ownerSelector} from '../mapEditor';


const state = {mapEditor: {open: true, owner: 'mediaEditor'}};

describe('Test the mapEditor selectors', () => {
    it('openSelector', () => {
        const isOpen = openSelector(state);
        expect(isOpen).toBeTruthy();
    });
    it('ownerSelector', () => {
        const owner = ownerSelector(state);
        expect(owner).toBe('mediaEditor');
    });
});
