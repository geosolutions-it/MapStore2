/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';

import mapEditor, {DEFAULT_STATE} from '../mapEditor';

const {
    hide,
    show
} = require('../../actions/mapEditor');

describe('Test the mapEditor reducer', () => {
    it('HIDE', () => {
        let state = mapEditor(DEFAULT_STATE, hide());
        expect(state.open).toEqual(false);
        expect(state.owner).toEqual(undefined);
    });
    it('SHOW', () => {
        const owner = "owner";
        const open = true;
        let state = mapEditor({}, show(owner));
        expect(state.open).toEqual(open);
        expect(state.owner).toEqual(owner);
    });
});
