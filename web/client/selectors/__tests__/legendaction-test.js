/**
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {legendSizeSelector, legendExpandedSelector} = require('../legendaction');

describe('Test legendaction selectors', () => {
    it('test legendSizeSelector', () => {
        let props = legendSizeSelector({});
        expect(props).toEqual({width: 0, height: 0});

        const legendaction = {
            size: {
                width: 300,
                height: 7
            }
        };
        props = legendSizeSelector({legendaction});
        expect(props).toBe(legendaction.size);
    });

    it('test legendExpandedSelector', () => {
        let props = legendExpandedSelector({});
        expect(props).toBe(false);

        const legendaction = {
            expanded: true
        };
        props = legendExpandedSelector({legendaction});
        expect(props).toBe(legendaction.expanded);
    });

});
