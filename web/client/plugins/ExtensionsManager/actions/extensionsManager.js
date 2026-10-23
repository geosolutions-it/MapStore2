/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const SHOW_RESULT = 'EXTENSIONSMANAGER:SHOW_RESULT';

/**
 * Shows the result of an action of the extensions manager.
 * @param {object} result `{ msgId, params }` of the message, null to hide it
 */
export const showResult = (result) => ({ type: SHOW_RESULT, result });
