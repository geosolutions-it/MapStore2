/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const textSearchConfigSelector = state => state.searchconfig && state.searchconfig.textSearchConfig;

export const bookmarkSearchConfigSelector = state => state.searchbookmarkconfig && state.searchbookmarkconfig.bookmarkSearchConfig;
