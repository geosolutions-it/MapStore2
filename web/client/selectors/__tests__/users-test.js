/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    getTotalUsers,
    getUsersLoading,
    getUsers,
    getUsersError,
    getIsFirstRequest,
    getCurrentPage,
    getSearch,
    getCurrentParams
} from '../users';
import expect from 'expect';

describe('users selectors', () => {
    it('getTotalUsers', () => {
        expect(getTotalUsers()).toBe(0);
        expect(getTotalUsers({ users: { grid: { total: 10 } } })).toBe(10);
    });
    it('getUsersLoading', () => {
        expect(getUsersLoading()).toBe(undefined);
        expect(getUsersLoading({ users: { grid: { loading: false } } })).toBe(false);
    });
    it('getUsers', () => {
        expect(getUsers()).toEqual([]);
        expect(getUsers({ users: { grid: { users: [{ id: '01' }] } } })).toEqual([{ id: '01' }]);
    });
    it('getUsersError', () => {
        expect(getUsersError()).toBe(undefined);
        expect(getUsersError({ users: { grid: { error: false } } })).toBe(false);
    });
    it('getIsFirstRequest', () => {
        expect(getIsFirstRequest()).toBe(true);
        expect(getIsFirstRequest({ users: { grid: { isFirstRequest: false } } })).toBe(false);
    });
    it('getCurrentPage', () => {
        expect(getCurrentPage()).toBe(1);
        expect(getCurrentPage({ users: { grid: { params: { page: 2 } } } })).toBe(2);
    });
    it('getSearch', () => {
        expect(getSearch()).toBe(null);
        expect(getSearch({ users: { grid: { search: { q: 'a' } }  } })).toEqual({ q: 'a' });
    });
    it('getCurrentParams', () => {
        expect(getCurrentParams()).toBe(undefined);
        expect(getCurrentParams({ users: { grid: { params: { page: 2 } } } })).toEqual({ page: 2 });
    });
});
