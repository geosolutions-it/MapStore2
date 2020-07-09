/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const CHECK_PENDING_CHANGES = 'SAVE:CHECK_PENDING_CHANGES';

/**
 * Action that triggers a check to the current content (if it has changes).
 * @param {object} action the action to trigger if there are no changes
 * @param {string} source the source object that invoked this call
 */
export const checkPendingChanges = (action, source) => ({
    type: CHECK_PENDING_CHANGES,
    action,
    source
});
