/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const {
    FEEDBACK_MASK_LOADING,
    FEEDBACK_MASK_LOADED,
    FEEDBACK_MASK_ENABLED,
    DETECTED_NEW_PAGE,
    feedbackMaskLoading,
    feedbackMaskLoaded,
    feedbackMaskEnabled,
    detectedNewPage
} = require('../feedbackMask');

describe('Test correctness of the feedbackMask actions', () => {

    it('feedbackMaskLoading', () => {
        const mode = 'map';
        const retval = feedbackMaskLoading(mode);
        expect(retval).toExist();
        expect(retval.type).toBe(FEEDBACK_MASK_LOADING);
        expect(retval.mode).toBe(mode);
    });
    it('feedbackMaskLoaded', () => {
        const retval = feedbackMaskLoaded();
        expect(retval).toExist();
        expect(retval.type).toBe(FEEDBACK_MASK_LOADED);
    });
    it('feedbackMaskEnabled', () => {
        const enabled = true;
        const error = {status: 404};
        const retval = feedbackMaskEnabled(enabled, error);
        expect(retval).toExist();
        expect(retval.type).toBe(FEEDBACK_MASK_ENABLED);
        expect(retval.enabled).toBe(enabled);
        expect(retval.error).toBe(error);
    });
    it('detectedNewPage', () => {
        const retval = detectedNewPage('viewer');
        expect(retval).toExist();
        expect(retval.type).toBe(DETECTED_NEW_PAGE);
        expect(retval.currentPage).toBe('viewer');
    });

});
