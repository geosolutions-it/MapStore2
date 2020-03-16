/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const userSessionIdSelector = (state) => state.usersession && state.usersession.id || null;
export const userSessionSelector = (state) => state.usersession && state.usersession.session || null;
