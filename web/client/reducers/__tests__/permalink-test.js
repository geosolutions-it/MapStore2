/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {
    updatePermalinkSettings,
    permalinkLoading,
    resetPermalink
} from '../../actions/permalink';
import permalink from '../permalink';

describe('permalink reducer', () => {
    it('default permalink', () => {
        const state = permalink();
        expect(state).toBeTruthy();
        expect(state.settings).toEqual({allowAllUser: true});
    });
    it('update permalink settings', () => {
        const state = permalink({}, updatePermalinkSettings({title: "Test"}));
        expect(state).toBeTruthy();
        expect(state.settings).toBeTruthy();
        expect(state.settings.title).toBe("Test");
    });
    it('loading permalink', () => {
        const state = permalink({}, permalinkLoading(true));
        expect(state).toBeTruthy();
        expect(state.loading).toBeTruthy();
    });
    it('reset permalink', () => {
        const state = permalink({}, resetPermalink());
        expect(state).toBeTruthy();
        expect(state.settings).toBeTruthy();
        expect(state.settings.allowAllUser).toBeTruthy();
    });
});
