/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    getTotalUserGroups,
    getUserGroupsLoading,
    getUserGroups,
    getUserGroupsError,
    getIsFirstRequest,
    getCurrentPage,
    getSearch,
    getCurrentParams
} from '../usergroups';
import expect from 'expect';

describe('usergroups selectors', () => {
    it('getTotalUserGroups', () => {
        expect(getTotalUserGroups()).toBe(0);
        expect(getTotalUserGroups({ usergroups: { grid: { total: 10 } } })).toBe(10);
    });
    it('getUserGroupsLoading', () => {
        expect(getUserGroupsLoading()).toBe(undefined);
        expect(getUserGroupsLoading({ usergroups: { grid: { loading: false } } })).toBe(false);
    });
    it('getUserGroups', () => {
        expect(getUserGroups()).toEqual([]);
        expect(getUserGroups({ usergroups: { grid: { userGroups: [{ id: '01' }] } } })).toEqual([{ id: '01' }]);
    });
    it('getUserGroupsError', () => {
        expect(getUserGroupsError()).toBe(undefined);
        expect(getUserGroupsError({ usergroups: { grid: { error: false } } })).toBe(false);
    });
    it('getIsFirstRequest', () => {
        expect(getIsFirstRequest()).toBe(true);
        expect(getIsFirstRequest({ usergroups: { grid: { isFirstRequest: false } } })).toBe(false);
    });
    it('getCurrentPage', () => {
        expect(getCurrentPage()).toBe(1);
        expect(getCurrentPage({ usergroups: { grid: { params: { page: 2 } } } })).toBe(2);
    });
    it('getSearch', () => {
        expect(getSearch()).toBe(null);
        expect(getSearch({ usergroups: { grid: { search: { q: 'a' } }  } })).toEqual({ q: 'a' });
    });
    it('getCurrentParams', () => {
        expect(getCurrentParams()).toBe(undefined);
        expect(getCurrentParams({ usergroups: { grid: { params: { page: 2 } } } })).toEqual({ page: 2 });
    });
});
