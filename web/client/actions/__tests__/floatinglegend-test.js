/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const {
    RESIZE_LEGEND,
    EXPAND_LEGEND,
    resizeLegend,
    expandLegend
} = require('../floatinglegend');

describe('Test floatinglegend actions', () => {
    it('resizeLegend', () => {
        const size = {height: 100};
        const retval = resizeLegend(size);
        expect(retval).toExist();
        expect(retval.type).toBe(RESIZE_LEGEND);
        expect(retval.size).toBe(size);
    });
    it('expandLegend', () => {
        const expanded = true;
        const retval = expandLegend(expanded);
        expect(retval).toExist();
        expect(retval.type).toEqual(EXPAND_LEGEND);
        expect(retval.expanded).toEqual(expanded);
    });
});
