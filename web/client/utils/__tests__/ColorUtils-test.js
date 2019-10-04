/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');

const ColorUtils = require('../ColorUtils');

describe('Test the ColorUtils', () => {
    it('colorToRgbaStr name color', () => {
        const rgbaColor = ColorUtils.colorToRgbaStr("red");
        expect(rgbaColor).toBe("rgb(255, 0, 0)");
    });
    it('colorToRgbaStr hex color', () => {
        const rgbaColor = ColorUtils.colorToRgbaStr("#FF0000", 0.5);
        expect(rgbaColor).toBe("rgba(255, 0, 0, 0.5)");
    });
    it('colorToRgbaStr rgba color with overrided alpha', () => {
        const rgbaColor = ColorUtils.colorToRgbaStr("rgba(255, 255, 255, 0.8)", 0.5);
        expect(rgbaColor).toBe("rgba(255, 255, 255, 0.5)");
    });
    it('colorToRgbaStr rgba color', () => {
        const rgbaColor = ColorUtils.colorToRgbaStr("rgba(255, 255, 255, 0.8)");
        expect(rgbaColor).toBe("rgba(255, 255, 255, 0.8)");
    });
    it('colorToRgbaStr undefined color', () => {
        const rgbaColor = ColorUtils.colorToRgbaStr();
        expect(rgbaColor).toBe(undefined);
    });
    it('hexToRgb', () => {
        expect(ColorUtils.hexToRgb('#000000')).toEqual([0, 0, 0]);
        expect(ColorUtils.hexToRgb('000000')).toEqual([0, 0, 0]);
        expect(ColorUtils.hexToRgb('#FFFFFF')).toEqual([255, 255, 255]);
        expect(ColorUtils.hexToRgb('#FF0000')).toEqual([255, 0, 0]); // Red
        expect(ColorUtils.hexToRgb('#00FFFF')).toEqual([0, 255, 255]); // Cyan
        expect(ColorUtils.hexToRgb('#808080')).toEqual([128, 128, 128]); // Gray
    });
    it('hexToHsv', () => {
        expect(ColorUtils.hexToHsv('#000000')).toEqual([0, 0, 0]);
        expect(ColorUtils.hexToHsv('000000')).toEqual([0, 0, 0]);
        expect(ColorUtils.hexToHsv('#FFFFFF')).toEqual([0, 0, 1]);
        expect(ColorUtils.hexToHsv('#FF0000')).toEqual([0, 1, 1]); // Red
        expect(ColorUtils.hexToHsv('#00FFFF')).toEqual([180, 1, 1]); // Cyan
        expect(ColorUtils.hexToHsv('#808080').map(n => Math.round(n * 100) / 100)).toEqual([0, 0, 0.5]); // Gray
    });

});
