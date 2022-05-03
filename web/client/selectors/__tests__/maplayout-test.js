/**
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';

import {
    mapLayoutSelector,
    mapLayoutValuesSelector,
    checkConditionsSelector,
    rightPanelOpenSelector,
    leftPanelOpenSelector,
    bottomPanelOpenSelector,
    boundingMapRectSelector,
    mapPaddingSelector
} from '../maplayout';

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
        expect(rightPanelOpenSelector({maplayout: { layout: {rightPanel: true, leftPanel: false}}})).toBe(true);
        expect(rightPanelOpenSelector({maplayout: { layout: {rightPanel: false, leftPanel: false}}})).toBe(false);
        expect(rightPanelOpenSelector({})).toBe(false);
    });

    it('test leftPanelOpenSelector', () => {
        expect(leftPanelOpenSelector({maplayout: { layout: {rightPanel: true, leftPanel: true}}})).toBe(true);
        expect(leftPanelOpenSelector({maplayout: { layout: {rightPanel: false, leftPanel: false}}})).toBe(false);
        expect(leftPanelOpenSelector({})).toBe(false);
    });

    it('test bottomPanelOpenSelector', () => {
        expect(bottomPanelOpenSelector({maplayout: { layout: {left: 300, bottom: 500}}})).toBe(true);
        expect(bottomPanelOpenSelector({maplayout: { layout: {left: 300, bottom: 30}}})).toBe(false);
        expect(bottomPanelOpenSelector({})).toBe(false);
    });

    it('test boundingMapRectSelector', () => {

        expect(boundingMapRectSelector({
            maplayout: {
                layout: {left: 300, bottom: 500}
            }
        })).toEqual({});

        expect(boundingMapRectSelector({
            maplayout: {
                layout: {left: 300, bottom: 500},
                boundingMapRect: {left: 300, bottom: 500}
            }
        })).toEqual({left: 300, bottom: 500});

        expect(boundingMapRectSelector({})).toEqual({});
    });
    it('test mapPaddingSelector', () => {
        const state = {
            map: {
                present: {
                    size: {
                        width: 2000,
                        height: 1000
                    }
                }
            },
            maplayout: {
                layout: {
                    left: 200,
                    right: 0,
                    bottom: '35%',
                    dockSize: 35,
                    transform: 'translate(0, -30px)',
                    height: 'calc(100% - 30px)'
                },
                boundingMapRect: {
                    bottom: '35%',
                    dockSize: 35,
                    left: 200,
                    right: 0
                }
            }
        };
        const padding = mapPaddingSelector(state);
        expect(padding).toExist();
        expect(padding.top).toBe(0);
        expect(padding.left).toBe(200);
        expect(padding.right).toBe(0);
        expect(padding.bottom).toBe(350); // 35% of 1000
    });
});
