/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {
    permalinkSettingsSelector,
    permalinkLoadingSelector,
    isPermalinkSelector
} from "../permalink";

describe('permalink selectors', () => {
    it('permalinkSettingsSelector', () => {
        const settings = {title: "test"};
        const permalinkSettings = permalinkSettingsSelector({permalink: {settings}});
        expect(permalinkSettings).toBeTruthy();
        expect(permalinkSettings).toEqual(settings);
    });
    it('permalinkLoadingSelector', () => {
        const permalinkLoading = permalinkLoadingSelector({permalink: {loading: true}});
        expect(permalinkLoading).toBeTruthy();
    });
    it('isPermalinkSelector', () => {
        const isPermalink = isPermalinkSelector({permalink: {id: 1}});
        expect(isPermalink).toBeTruthy();
    });
});
