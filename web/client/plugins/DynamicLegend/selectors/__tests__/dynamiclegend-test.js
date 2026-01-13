/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {
    enabledSelector,
    isFloatingSelector
} from '../dynamiclegend';
import { CONTROL_NAME } from '../../constants';

describe('Dynamiclegend Selectors', () => {
    describe('enabledSelector', () => {
        it('should return true when Dynamic legend control is enabled', () => {
            const state = {
                controls: {
                    [CONTROL_NAME]: {
                        enabled: true
                    }
                }
            };
            expect(enabledSelector(state)).toBe(true);
        });

        it('should return false when Dynamic legend control is disabled', () => {
            const state = {
                controls: {
                    [CONTROL_NAME]: {
                        enabled: false
                    }
                }
            };
            expect(enabledSelector(state)).toBe(false);
        });

        it('should return false when Dynamic legend control is not defined', () => {
            const state = {
                controls: {
                    [CONTROL_NAME]: {
                        enabled: false
                    }
                }
            };
            expect(enabledSelector(state)).toBe(false);
        });

        it('should return false when controls are not defined', () => {
            const state = {};
            expect(enabledSelector(state)).toBe(undefined);
        });
    });

    it('isFloatingSelector', () => {
        expect(isFloatingSelector()).toBe(false);
        expect(isFloatingSelector({
            dynamiclegend: {
                config: {
                    isFloating: true
                }
            }
        })).toBe(true);
    });

});
