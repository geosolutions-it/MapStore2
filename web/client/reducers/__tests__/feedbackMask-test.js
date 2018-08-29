/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');

const {feedbackMaskLoading, feedbackMaskLoaded, feedbackMaskEnabled, detectedNewPage} = require('../../actions/feedbackMask');
const feedbackMask = require('../feedbackMask');

describe('Test the feedbackMask reducer', () => {
    it('test feedbackMaskLoading', () => {
        let state = feedbackMask({}, feedbackMaskLoading());
        expect(state.loading).toEqual(true);
        expect(state.status).toEqual(null);
        expect(state.errorMessage).toEqual(null);
        expect(state.mode).toEqual(null);
    });
    it('test feedbackMaskLoaded', () => {
        let state = feedbackMask({loading: true}, feedbackMaskLoaded());
        expect(state.loading).toEqual(false);
    });
    it('test feedbackMaskLoaded', () => {
        let state = feedbackMask({}, feedbackMaskEnabled(true, {status: 404, messageId: 'message'}, 'map'));
        expect(state.enabled).toEqual(true);
        expect(state.status).toEqual(404);
        expect(state.errorMessage).toEqual('message');
        expect(state.mode).toEqual('map');
    });
    it('test detectedNewPage', () => {
        let state = feedbackMask({}, detectedNewPage('viewer'));
        expect(state.currentPage).toBe('viewer');
    });
});
