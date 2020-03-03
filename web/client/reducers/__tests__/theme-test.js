
/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import theme from '../theme';
import {selectTheme, themeLoaded} from '../../actions/theme';


describe('Test the theme reducer', () => {
    it('should manage the THEME_SELECTED action', () => {
        const state = theme({}, selectTheme({id: "default"}));
        expect(state.selectedTheme).toExist();
        expect(state.selectedTheme.id).toBe("default");
    });
    it('should manage the THEME_LOADED action', () => {
        const state = theme({}, themeLoaded());
        expect(state.loaded).toBe(true);
    });
});
