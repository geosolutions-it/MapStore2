/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    hashLocationToHref,
    clearQueryParams,
    splitFilterValue,
    getTagColorVariables
} from '../ResourcesFiltersUtils';
import expect from 'expect';

describe('ResourcesFiltersUtils', () => {
    it('hashLocationToHref', () => {
        expect(hashLocationToHref({
            location: {
                search: ''
            },
            query: {
                f: 'map'
            }
        })).toBe('#?f=map');
        expect(hashLocationToHref({
            location: {
                search: '?f=map'
            },
            query: {
                f: 'map'
            }
        })).toBe('#');
        expect(hashLocationToHref({
            location: {
                search: '?f=map'
            },
            query: {
                f: 'dashboard'
            }
        })).toBe('#?f=map&f=dashboard');
        expect(hashLocationToHref({
            location: {
                search: '?f=map'
            },
            query: {
                f: 'dashboard'
            },
            replaceQuery: true
        })).toBe('#?f=dashboard');
        expect(hashLocationToHref({
            location: {
                search: '?f=map'
            },
            query: {
                f: 'dashboard'
            },
            excludeQueryKeys: ['f']
        })).toBe('#');
    });
    it('clearQueryParams', () => {
        expect(clearQueryParams({
            search: '?f=map'
        })).toEqual({ extent: undefined, f: [] });
        expect(clearQueryParams({
            search: '?filter{tags.in}=value'
        })).toEqual({ extent: undefined, 'filter{tags.in}': [] });
        expect(clearQueryParams({
            search: '?q=value'
        })).toEqual({ extent: undefined, 'q': [] });
    });
    it('splitFilterValue', () => {
        expect(splitFilterValue()).toEqual({ value: '', label: '' });
        expect(splitFilterValue('value')).toEqual({ value: 'value', label: '' });
        expect(splitFilterValue('value:label')).toEqual({ value: 'value', label: 'label' });
        expect(splitFilterValue('value:label_with:')).toEqual({ value: 'value', label: 'label_with:' });
    });
    it('getTagColorVariables', () => {
        expect(getTagColorVariables()).toEqual({});
        expect(getTagColorVariables('#ff0000')).toEqual({
            '--tag-color-r': 255,
            '--tag-color-g': 0,
            '--tag-color-b': 0
        });
        expect(getTagColorVariables('#00ff00')).toEqual({
            '--tag-color-r': 0,
            '--tag-color-g': 255,
            '--tag-color-b': 0
        });
        expect(getTagColorVariables('#0000ff')).toEqual({
            '--tag-color-r': 0,
            '--tag-color-g': 0,
            '--tag-color-b': 255
        });
    });
});
