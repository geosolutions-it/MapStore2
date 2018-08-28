/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const {
    LOADING_MASK_LOADING,
    LOADING_MASK_LOADED,
    LOADING_MASK_ENABLED,
    feedbackMaskLoading,
    feedbackMaskLoaded,
    feedbackMaskEnabled
} = require('../feedbackMask');

describe('Test correctness of the feedbackMask actions', () => {

    it('feedbackMaskLoading', () => {
        const retval = feedbackMaskLoading();
        expect(retval).toExist();
        expect(retval.type).toBe(LOADING_MASK_LOADING);
    });
    it('feedbackMaskLoaded', () => {
        const retval = feedbackMaskLoaded();
        expect(retval).toExist();
        expect(retval.type).toBe(LOADING_MASK_LOADED);
    });
    it('feedbackMaskEnabled', () => {
        const enabled = true;
        const error = {status: 404};
        const mode = 'map';
        const retval = feedbackMaskEnabled(enabled, error, mode);
        expect(retval).toExist();
        expect(retval.type).toBe(LOADING_MASK_ENABLED);
        expect(retval.enabled).toBe(enabled);
        expect(retval.error).toBe(error);
        expect(retval.mode).toBe(mode);
    });

});
