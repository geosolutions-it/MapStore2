/**
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {mapLayoutSelector, mapLayoutValuesSelector, checkConditionsSelector, rightPanelOpenSelector, bottomPanelOpenSelector} = require('../maplayout');

describe('Test map layout selectors', () => {
    it('test mapLayoutSelector no state', () => {
        const props = mapLayoutSelector({});
        expect(props).toEqual({});
    });

    it('test mapLayoutSelector', () => {
        const props = mapLayoutSelector({
            maplayout: {
                layout: {left: 0, bottom: 0, right: 0, top: 0}
            }
        });
        expect(props).toEqual({left: 0, bottom: 0, right: 0, top: 0});
    });

    it('test mapLayoutValuesSelector no state', () => {
        const props = mapLayoutValuesSelector({}, {left: true});
        expect(props).toEqual({});
    });

    it('test mapLayoutValuesSelector', () => {
        const props = mapLayoutValuesSelector({maplayout: { layout: {left: 300}}}, {left: true});
        expect(props).toEqual({ left: 300 });
    });

    it('test mapLayoutValuesSelector no state', () => {
        const props = checkConditionsSelector({});
        expect(props).toBe(false);
    });

    it('test mapLayoutValuesSelector', () => {
        let props = checkConditionsSelector({maplayout: { layout: {left: 300, right: 20}}}, [{key: 'left', value: 300}, {key: 'right', value: 0, type: 'not'}]);
        expect(props).toBe(true);
        props = checkConditionsSelector({maplayout: { layout: {left: 400}}}, [{key: 'left', value: 300}]);
        expect(props).toBe(false);
    });

    it('test rightPanelOpenSelector', () => {
        expect(rightPanelOpenSelector({maplayout: { layout: {right: 658, bottom: 500}}})).toBe(true);
        expect(rightPanelOpenSelector({maplayout: { layout: {left: 300, bottom: 30}}})).toBe(false);
        expect(rightPanelOpenSelector({})).toBe(false);
    });

    it('test bottomPanelOpenSelector', () => {
        expect(bottomPanelOpenSelector({maplayout: { layout: {left: 300, bottom: 500}}})).toBe(true);
        expect(bottomPanelOpenSelector({maplayout: { layout: {left: 300, bottom: 30}}})).toBe(false);
        expect(bottomPanelOpenSelector({})).toBe(false);
    });
});
