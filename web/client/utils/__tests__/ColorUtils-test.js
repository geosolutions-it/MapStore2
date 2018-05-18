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

});
