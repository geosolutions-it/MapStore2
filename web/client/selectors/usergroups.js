/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const getTotalUserGroups = state => state?.usergroups?.grid?.total || 0;
export const getUserGroupsLoading = state => state?.usergroups?.grid?.loading;
export const getUserGroups = state => state?.usergroups?.grid?.userGroups || [];
export const getUserGroupsError = state => state?.usergroups?.grid?.error;
export const getIsFirstRequest = state => state?.usergroups?.grid?.isFirstRequest !== false;
export const getCurrentPage = state => state?.usergroups?.grid?.params?.page ?? 1;
export const getSearch = state => state?.usergroups?.grid?.search || null;
export const getCurrentParams = state => state?.usergroups?.grid?.params;
