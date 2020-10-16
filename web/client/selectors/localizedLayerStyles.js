/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import { has, get, find } from 'lodash';

import { createSelector } from 'reselect';
import { currentLocaleLanguageSelector } from './locale';

/**
 * selects localizedLayerStyles state
 * @name localizedLayerStyles
 * @memberof selectors
 * @static
 */

/**
 * selects localizedLayerStyles from state
 * @memberof selectors.localizedLayerStyles
 * @param  {object} state the state
 * @return {boolean} true if the localizedLayerStyles property is defined
 */
export const isLocalizedLayerStylesEnabledSelector = (state) => has(state, 'localConfig.localizedLayerStyles');

/**
 * selects localizedLayerStyles value from state
 * @memberof selectors.localizedLayerStyles
 * @param  {object} state the state
 * @return {boolean} boolean if the localizedLayerStyles property is defined
 */
export const isLocalizedLayerStylesEnabledDashboardsSelector = (state) => {
    const dashboardPlugins = get(state, "localConfig.plugins.dashboard", []);
    const dashboardEditorPlugin = find(dashboardPlugins, item => item.name === 'DashboardEditor') || {};
    return get(dashboardEditorPlugin, "cfg.catalog.localizedLayerStyles", false);
};

/**
 * selects localizedLayerStyles name from state
 * @memberof selectors.localizedLayerStyles
 * @param  {object} state the state
 * @return {string} the localizedLayerStyles param name
 */
export const localizedLayerStylesNameSelector = (state) => get(state, 'localConfig.localizedLayerStyles.name', 'mapstore_language');

/**
 * generates localizedLayerStyles env object
 * @memberof selectors.localizedLayerStyles
 * @param  {object} state the state
 * @return {object} object that represents ENV param
 */
export const localizedLayerStylesEnvSelector = createSelector(
    isLocalizedLayerStylesEnabledSelector,
    localizedLayerStylesNameSelector,
    currentLocaleLanguageSelector,
    (isLocalizedLayerStylesEnabled, localizedLayerStylesName, currentLocaleLanguage) => {
        const env = [];
        if (isLocalizedLayerStylesEnabled) {
            env.push({
                name: localizedLayerStylesName,
                value: currentLocaleLanguage
            });
        }
        return env;
    }
);
