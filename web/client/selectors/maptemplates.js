/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { createSelector } from 'reselect';
import { uniqBy } from 'lodash';
import { desktopPluginsConfigSelector } from './localConfig';
import { getPluginConfiguration } from '../utils/PluginsUtils';
import { templatesSelector as contextTemplatesSelector } from './context';

export const mapTemplatesLoadedSelector = state => state.maptemplates && state.maptemplates.mapTemplatesLoaded;
export const mapTemplatesLoadErrorSelector = state => state.maptemplates && state.maptemplates.mapTemplatesLoadError;
export const templatesSelector = state => state.maptemplates && state.maptemplates.templates;

export const desktopMapTemplatesConfigSelector = createSelector(
    desktopPluginsConfigSelector,
    (config = {}) => getPluginConfiguration(config, "MapTemplates")
);

export const localConfigTemplatesSelector = state => state.maptemplates && state.maptemplates.localConfigTemplates;

// This selector checks state for localConfigTemplates that were loaded into state from localConfig
// when MapTemplates plugin was mounting. At the moment, for retro-compatibility it also checks context for plugins
// that're stored there and then merges all the templates.
export const allTemplatesSelector = createSelector(
    localConfigTemplatesSelector,
    contextTemplatesSelector,
    (localTemplates, contextTemplates) => {
        if (contextTemplates !== null) {
            // Remove duplicate templates that're specified both in localConfig and context
            return uniqBy([...localTemplates, ...contextTemplates], 'id');
        }
        return localTemplates;
    }
);
