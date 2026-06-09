/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {
    keepLayer,
    isLegendLayerVisible,
    isLegendGroupVisible,
    getNodeStyle,
    hasVisibleLegend
} from '../DynamicLegendUtils';
import { NodeTypes } from '../../../../utils/LayersUtils';

describe('DynamicLegendUtils', () => {

    it('keepLayer', () => {
        expect(keepLayer()).toBe(false);
        expect(keepLayer({ group: 'myGroup', type: 'wmts' })).toBe(false);
        expect(keepLayer({ group: 'background', type: 'wms' })).toBe(false);
        expect(keepLayer({ type: 'wms' })).toBe(true);
        expect(keepLayer({ type: 'arcgis' })).toBe(true);
    });

    it('isLegendLayerVisible', () => {
        expect(isLegendLayerVisible()).toBe(true);
        expect(isLegendLayerVisible({ visibility: false })).toBe(false);
        expect(isLegendLayerVisible({ legendEmpty: true })).toBe(false);
        expect(isLegendLayerVisible({ minResolution: 1, maxResolution: 10 }, 5)).toBe(true);
        expect(isLegendLayerVisible({ minResolution: 1, maxResolution: 10 }, 11)).toBe(false);
        expect(isLegendLayerVisible({ minResolution: 1, maxResolution: 10, disableResolutionLimits: true }, 11)).toBe(true);
    });

    it('isLegendGroupVisible', () => {
        expect(isLegendGroupVisible()).toBe(false);
        expect(isLegendGroupVisible({ visibility: false })).toBe(false);
        expect(isLegendGroupVisible({ visibility: true, nodes: [{ visibility: false }] })).toBe(false);
        expect(isLegendGroupVisible({ visibility: true, nodes: [{ legendEmpty: true }] })).toBe(false);
        expect(isLegendGroupVisible({ visibility: true, nodes: [{ minResolution: 1, maxResolution: 10 }] }, 5)).toBe(true);
        expect(isLegendGroupVisible({ visibility: true, nodes: [{ minResolution: 1, maxResolution: 10 }] }, 11)).toBe(false);
        expect(isLegendGroupVisible({ visibility: true, nodes: [{ minResolution: 1, maxResolution: 10, disableResolutionLimits: true }] }, 11)).toBe(true);
    });

    it('getNodeStyle', () => {
        expect(getNodeStyle()).toEqual({});
        expect(getNodeStyle({ minResolution: 1, maxResolution: 10 }, NodeTypes.LAYER, 5)).toEqual({});
        expect(getNodeStyle({ minResolution: 1, maxResolution: 10 }, NodeTypes.LAYER, 11)).toEqual({ display: 'none' });
        expect(getNodeStyle({ visibility: true, nodes: [{ minResolution: 1, maxResolution: 10 }] }, NodeTypes.GROUP, 5)).toEqual({});
        expect(getNodeStyle({ visibility: true, nodes: [{ minResolution: 1, maxResolution: 10 }] }, NodeTypes.GROUP, 11)).toEqual({ display: 'none' });
    });

    it('hasVisibleLegend',  () => {
        expect(hasVisibleLegend()).toBe(false);
        expect(hasVisibleLegend([{ visibility: true }, { visibility: false }])).toBe(false);
        expect(hasVisibleLegend([{ visibility: true, legendEmpty: false }, { visibility: false }])).toBe(true);
        expect(hasVisibleLegend([{ visibility: true, legendEmpty: true }, { visibility: false }])).toBe(false);
    });
});
