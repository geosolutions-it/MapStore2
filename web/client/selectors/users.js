/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const getTotalUsers = state => state?.users?.grid?.total || 0;
export const getUsersLoading = state => state?.users?.grid?.loading;
export const getUsers = state => state?.users?.grid?.users || [];
export const getUsersError = state => state?.users?.grid?.error;
export const getIsFirstRequest = state => state?.users?.grid?.isFirstRequest !== false;
export const getCurrentPage = state => state?.users?.grid?.params?.page ?? 1;
export const getSearch = state => state?.users?.grid?.search || null;
export const getCurrentParams = state => state?.users?.grid?.params;
