/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { createSelector } from 'reselect';
import { desktopPluginsConfigSelector } from './localConfig';
import { getPluginConfiguration } from '../utils/PluginsUtils';

export const mapTemplatesLoadedSelector = state => state.maptemplates && state.maptemplates.mapTemplatesLoaded;
export const mapTemplatesLoadErrorSelector = state => state.maptemplates && state.maptemplates.mapTemplatesLoadError;
export const templatesSelector = state => state.maptemplates && state.maptemplates.templates;

export const desktopMapTemplatesConfigSelector = createSelector(
    desktopPluginsConfigSelector,
    (config = {}) => getPluginConfiguration(config, "MapTemplates")
);
