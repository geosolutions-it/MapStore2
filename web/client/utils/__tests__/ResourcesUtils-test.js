/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    getResourceInfo,
    getResourceStatus
} from '../ResourcesUtils';
import expect from 'expect';

describe('ResourcesUtils', () => {
    describe('getResourceInfo', () => {
        it('should return resource info when info exists', () => {
            const resource = {
                '@extras': {
                    info: {
                        title: 'Test Title',
                        icon: 'test-icon',
                        thumbnailUrl: 'test-thumbnail-url',
                        viewerPath: 'test-viewer-path',
                        viewerUrl: 'test-viewer-url'
                    }
                }
            };
            const result = getResourceInfo(resource);
            expect(result).toEqual({
                title: 'Test Title',
                icon: 'test-icon',
                thumbnailUrl: 'test-thumbnail-url',
                viewerPath: 'test-viewer-path',
                viewerUrl: 'test-viewer-url'
            });
        });

        it('should return an empty object when info does not exist', () => {
            const resource = {};
            const result = getResourceInfo(resource);
            expect(result).toEqual({});
        });
    });

    describe('getResourceStatus', () => {
        it('should return resource status when status exists', () => {
            const resource = {
                '@extras': {
                    status: {
                        items: [
                            {
                                type: 'test-type',
                                tooltipId: 'test-tooltip-id',
                                glyph: 'test-glyph',
                                tooltipParams: { param1: 'value1' }
                            }
                        ]
                    }
                }
            };
            const result = getResourceStatus(resource);
            expect(result).toEqual({
                items: [
                    {
                        type: 'test-type',
                        tooltipId: 'test-tooltip-id',
                        glyph: 'test-glyph',
                        tooltipParams: { param1: 'value1' }
                    }
                ]
            });
        });

        it('should return an empty object when status does not exist', () => {
            const resource = {};
            const result = getResourceStatus(resource);
            expect(result).toEqual({});
        });

        it('should return an empty object when resource is undefined', () => {
            const result = getResourceStatus();
            expect(result).toEqual({});
        });
    });
});
