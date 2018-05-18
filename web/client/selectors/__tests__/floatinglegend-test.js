/**
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {legendSizeSelector, legendExpandedSelector} = require('../floatinglegend');

describe('Test floatinglegend selectors', () => {
    it('test legendSizeSelector', () => {
        let props = legendSizeSelector({});
        expect(props).toEqual({width: 0, height: 0});

        const floatinglegend = {
            size: {
                width: 300,
                height: 7
            }
        };
        props = legendSizeSelector({floatinglegend});
        expect(props).toBe(floatinglegend.size);
    });

    it('test legendExpandedSelector', () => {
        let props = legendExpandedSelector({});
        expect(props).toBe(false);

        const floatinglegend = {
            expanded: true
        };
        props = legendExpandedSelector({floatinglegend});
        expect(props).toBe(floatinglegend.expanded);
    });

});
