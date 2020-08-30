/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {createSelector} from 'reselect';
import {get} from 'lodash';

export const newContextSelector = state => state.contextcreator && state.contextcreator.newContext;
export const mapConfigSelector = createSelector(newContextSelector, context => context && context.mapConfig);
export const creationStepSelector = state => state.contextcreator && state.contextcreator.stepId;
export const resourceSelector = state => state.contextcreator && state.contextcreator.resource;
export const mapViewerLoadedSelector = state => state.contextcreator && state.contextcreator.mapViewerLoaded;
export const reloadConfirmSelector = state => state.contextcreator && state.contextcreator.showReloadConfirm;
export const showDialogSelector = state => state.contextcreator && state.contextcreator.showDialog;
export const isLoadingSelector = state => state.contextcreator && state.contextcreator.loading;
export const loadFlagsSelector = state => state.contextcreator && state.contextcreator.loadFlags;
export const isValidContextNameSelector = state => state.contextcreator && state.contextcreator.isValidContextName;
export const contextNameCheckedSelector = state => state.contextcreator && state.contextcreator.contextNameChecked;
export const pluginsSelector = state => state.contextcreator && state.contextcreator.plugins;
export const initialEnabledPluginsSelector = state => state.contextcreator && state.contextcreator.initialEnabledPlugins;
export const editedPluginSelector = state => state.contextcreator && state.contextcreator.editedPlugin;
export const editedCfgSelector = state => state.contextcreator && state.contextcreator.editedCfg;
export const parsedCfgSelector = state => state.contextcreator && state.contextcreator.parsedCfg;
export const cfgErrorSelector = state => state.contextcreator && state.contextcreator.cfgError;
export const validationStatusSelector = state => get(state, 'contextcreator.validationStatus', true);
export const parsedTemplateSelector = state => state.contextcreator && state.contextcreator.parsedTemplate;
export const fileDropStatusSelector = state => state.contextcreator && state.contextcreator.fileDropStatus;
export const templatesSelector = state => state.contextcreator?.templates;
export const editedTemplateSelector = state => state.contextcreator && state.contextcreator.editedTemplate;
export const filterTextSelector = state => state.contextcreator && state.contextcreator.filterText;
export const availablePluginsFilterTextSelector = createSelector(filterTextSelector, filterText => get(filterText, 'availablePlugins'));
export const enabledPluginsFilterTextSelector = createSelector(filterTextSelector, filterText => get(filterText, 'enabledPlugins'));
export const availableTemplatesFilterTextSelector = createSelector(filterTextSelector, filterText => get(filterText, 'availableTemplates'));
export const enabledTemplatesFilterTextSelector = createSelector(filterTextSelector, filterText => get(filterText, 'enabledTemplates'));
export const showBackToPageConfirmationSelector = state => get(state, 'contextcreator.showBackToPageConfirmation', false);
export const tutorialsSelector = state => state.contextcreator?.tutorials;
export const wasTutorialShownSelector = stepId => state => state.contextcreator?.wasTutorialShown?.[stepId] || false;
export const tutorialStepSelector = state => state.contextcreator?.tutorialStep;
