/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');

const {RESIZE_LEGEND, EXPAND_LEGEND} = require('../../actions/legendaction');
const legendaction = require('../legendaction');

describe('Test the legendaction reducer', () => {
    it('change legend size height and/or width', () => {
        const size = {height: 300, width: 300};
        const action = {
            type: RESIZE_LEGEND,
            size
        };
        const state = legendaction({}, action);
        expect(state.size).toEqual(size);
    });
    it('change legend expanded state', () => {
        const expanded = true;
        const action = {
            type: EXPAND_LEGEND,
            expanded
        };
        const state = legendaction({}, action);
        expect(state.expanded).toEqual(expanded);
    });
});
