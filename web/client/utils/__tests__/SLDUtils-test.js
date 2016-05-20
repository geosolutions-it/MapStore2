/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const {jsonToSLD} = require('../SLDUtils');

const rasterstylerstate = {
    redband: {band: '1', contrast: 'GammaValue', algorithm: "none", gammaValue: 1, min: 1, max: 255},
    blueband: {band: '3', contrast: 'none', algorithm: "none", gammaValue: 1, min: 1, max: 255},
    greenband: {band: '2', contrast: 'none', algorithm: "none", gammaValue: 1, min: 1, max: 255},
    grayband: {band: '1', contrast: 'none', algorithm: "none", gammaValue: 1, min: 1, max: 255},
    pseudocolor: {colorMapEntry: [{color: "#eff3ff", quantity: 0, label: "0.00"}], type: "ramp", opacity: "1.00"},
    pseudoband: {band: "1", contrast: "Normalize", algorithm: "ClipToMinimumMaximum", min: 1, max: 255}
};
const layer = {name: "sde:HYP_HR_SR_OB_DR"};

describe('SLDUtils', () => {

    it('convert rasterlayer state to sld strings', () => {
        let pseudo = jsonToSLD("pseudo", "0.50", rasterstylerstate, layer);
        expect(pseudo).toExist();
        let rgb = jsonToSLD("rgb", "0.50", rasterstylerstate, layer);
        expect(rgb).toExist();
        let gray = jsonToSLD("gray", "0.50", rasterstylerstate, layer);
        expect(gray).toExist();
    });
});
