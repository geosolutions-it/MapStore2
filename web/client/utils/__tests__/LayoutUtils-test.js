/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {
    DEFAULT_BOUNDING_SIDEBAR_RIGHT,
    getBoundingSidebarRect,
    parseLayoutValue
} from '../LayoutUtils';

describe('LayoutUtils', () => {
    it('parseLayoutValue', () => {
        const percentageValue = parseLayoutValue('20%', 500);
        expect(percentageValue).toBe(100);

        const numberValue = parseLayoutValue(20);
        expect(numberValue).toBe(20);

        const noNumberValue = parseLayoutValue('value');
        expect(noNumberValue).toBe(0);
    });

    describe('getBoundingSidebarRect', () => {
        it('should return default right value when layout is missing boundingSidebarRect', () => {
            expect(getBoundingSidebarRect({})).toEqual({
                right: DEFAULT_BOUNDING_SIDEBAR_RIGHT
            });
        });

        it('should return default right value when layout is undefined', () => {
            expect(getBoundingSidebarRect()).toEqual({
                right: DEFAULT_BOUNDING_SIDEBAR_RIGHT
            });
        });

        it('should preserve boundingSidebarRect values and default only missing right value', () => {
            expect(getBoundingSidebarRect({
                boundingSidebarRect: {
                    left: 10,
                    top: 20,
                    bottom: 30
                }
            })).toEqual({
                left: 10,
                top: 20,
                bottom: 30,
                right: DEFAULT_BOUNDING_SIDEBAR_RIGHT
            });
        });

        it('should use configured right value from boundingSidebarRect', () => {
            expect(getBoundingSidebarRect({
                boundingSidebarRect: {
                    right: 80
                }
            })).toEqual({
                right: 80
            });
        });

        it('should default right value when right is null', () => {
            expect(getBoundingSidebarRect({
                boundingSidebarRect: {
                    right: null
                }
            })).toEqual({
                right: DEFAULT_BOUNDING_SIDEBAR_RIGHT
            });
        });
    });
});
