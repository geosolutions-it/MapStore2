/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const SET_PENDING_CHANGES = 'SAVE:SET_PENDING_CHANGES';

export const setPendingChanges = (pendingChanges) => ({
    type: SET_PENDING_CHANGES,
    pendingChanges
});
