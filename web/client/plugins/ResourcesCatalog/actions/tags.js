/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const SHOW_TAGS_PANEL = 'TAGS:SHOW_TAGS_PANEL';
/**
 * show/hide the tags manager panel
 * @param {boolean} show if true will show the tags panel
 * @return {action} type `TAGS:SHOW_TAGS_PANEL`
 */
export const showTagsPanel = (show) => ({
    type: SHOW_TAGS_PANEL,
    show
});
