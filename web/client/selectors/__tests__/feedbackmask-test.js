/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {feedbackMaskSelector} = require('../feedbackmask');

const state = {
    feedbackMask: {
        status: 404
    }
};

describe('Test feedbackmask selectors', () => {
    it('test feedbackMaskSelector', () => {
        const feedbackMask = feedbackMaskSelector(state);
        expect(feedbackMask).toExist();
        expect(feedbackMask).toBe(state.feedbackMask);

        const feedbackMaskEmptyState = feedbackMaskSelector({});
        expect(feedbackMaskEmptyState).toExist();
        expect(feedbackMaskEmptyState).toEqual({});

        const feedbackMaskNoState = feedbackMaskSelector();
        expect(feedbackMaskNoState).toExist();
        expect(feedbackMaskNoState).toEqual({});
    });
});
