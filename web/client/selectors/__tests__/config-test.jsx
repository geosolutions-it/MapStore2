/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/


import expect from 'expect';
import {
    loadAfterThemeSelector
} from '../config';

let state = {
    localConfig: {
        loadAfterTheme: false
    }
};

describe('Test config selectors', () => {
    it('test loadAfterThemeSelector', () => {
        const props = loadAfterThemeSelector(state);
        expect(props).toEqual(false);
    });
});
