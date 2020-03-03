/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const THEME_SELECTED = 'THEME_SELECTED';
export const THEME_LOADED = 'THEME_LOADED';

export function selectTheme(theme) {
    return {
        type: THEME_SELECTED,
        theme
    };
}

export function themeLoaded() {
    return {
        type: THEME_LOADED
    };
}
