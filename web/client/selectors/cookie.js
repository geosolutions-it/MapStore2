/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Tells whether a container of the page (Footer, MapFooter, user menu) shows an access to the privacy settings.
 * @param {object} state the application state
 * @returns {boolean} true when at least one container shows it
 */
export const hasPrivacyAccessSelector = state => (state.cookie?.privacyAccesses?.length ?? 0) > 0;
