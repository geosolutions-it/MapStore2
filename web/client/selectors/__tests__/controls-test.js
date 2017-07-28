/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {
    isFeatureEditorOpen
} = require('../controls');


const initialState = {
    controls: {
        featuregrid: {open: true}
    }
};

describe('Test highlight selectors', () => {
    it('test if there are some selected features', () => {
        const featuregridopened = isFeatureEditorOpen(initialState);
        expect(featuregridopened).toExist();
        expect(featuregridopened).toBe(true);

    });
});
