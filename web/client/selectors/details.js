/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const detailsControlEnabledSelector = state => state.controls?.details?.enabled;
export const contentSelector = state => state.details?.content;
export const editorStateSelector = state => state.details?.editorState;
export const contentChangedSelector = state => state.details?.contentChanged;
export const editingSelector = state => state.details?.editing;
export const settingsSelector = state => state.details?.settings;
export const editedSettingsSelector = state => state.details?.editedSettings;
export const loadingSelector = state => state.details?.loading;
export const loadFlagsSelector = state => state.details?.loadFlags;
