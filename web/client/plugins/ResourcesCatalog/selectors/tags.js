/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * get if the tags panel is visible or not
 * @param {object} state the redux state
 * @return {boolean}
 */
export const showTagsPanelSelector = state => !!state?.tags?.show;
