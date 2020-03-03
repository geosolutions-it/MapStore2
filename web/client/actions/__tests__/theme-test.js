/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {
    THEME_SELECTED,
    selectTheme,
    THEME_LOADED,
    themeLoaded
} from '../theme';

describe('Test theme related actions', () => {
    it('test theme selection action', () => {
        const theme = {id: "newtheme"};
        const e = selectTheme(theme);

        expect(e).toExist();
        expect(e.type).toBe(THEME_SELECTED);
        expect(e.theme).toExist();
        expect(e.theme).toBe(theme);
    });
    it('test theme loaded action', () => {
        const e = themeLoaded();

        expect(e).toExist();
        expect(e.type).toBe(THEME_LOADED);
    });
});
