/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get } from 'lodash';
import { isCesium } from '../selectors/maptype';
export const createControlVariableSelector = (name, attribute) => state => get(state, `controls[${name}][${attribute}]`);
export const createControlEnabledSelector = name => createControlVariableSelector(name, 'enabled');


export const aboutSelector = (state) => get(state, "controls.about.enabled", false);
/**
 * selects the showCoordinateEditor flag from state
 * @memberof selectors.controls
 * @param  {object} state the state
 * @return {boolean} the showCoordinateEditor in the state
 */
export const showCoordinateEditorSelector = (state) => !isCesium(state) && get(state, "controls.measure.showCoordinateEditor");
export const shareSelector = (state) => get(state, "controls.share.enabled");
export const measureSelector = (state) => get(state, "controls.measure.enabled");
export const versionInfoSelector = (state) => get(state, "controls.version.enabled");
export const queryPanelSelector = (state) => get(state, "controls.queryPanel.enabled");
export const printSelector = (state) => get(state, "controls.print.enabled");
export const wfsDownloadSelector = state => !!get(state, "controls.layerdownload.enabled");
export const widgetBuilderAvailable = state => get(state, "controls.widgetBuilder.available", false);
export const widgetBuilderSelector = (state) => get(state, "controls.widgetBuilder.enabled");
export const activeTabSettingsSelector = state => get(state, "controls.layersettings.activeTab") || 'general';
export const drawerEnabledControlSelector = (state) => get(state, "controls.drawer.enabled", false);
export const unsavedMapSelector = (state) => get(state, "controls.unsavedMap.enabled", false);
export const unsavedMapSourceSelector = (state) => get(state, "controls.unsavedMap.source", "");
export const isIdentifyAvailable = (state) => get(state, "controls.info.available");
export const isLongitudinalProfileEnabledSelector = (state) => get(state, "controls.longitudinalProfile.enabled");
export const isGeoProcessingEnabledSelector = (state) => get(state, "controls.GeoProcessing.enabled", false);
export const showConfirmDeleteMapModalSelector = (state) => get(state, "controls.mapDelete.enabled", false);
export const burgerMenuSelector = (state) => get(state, "controls.burgermenu.enabled", false);
