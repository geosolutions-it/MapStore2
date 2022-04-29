/*
* Copyright 2022, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';

import {isActiveSelector} from "../userextensions";

describe('UserExtensions SELECTORS', () => {
    it('should test isActiveSelector', () => {
        const state = {
            controls: {
                userExtensions: {
                    enabled: true
                }
            }
        };
        expect(isActiveSelector(state)).toEqual(state.controls.userExtensions.enabled);
    });
});
