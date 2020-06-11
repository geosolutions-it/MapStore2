/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const {has, get, find} = require('lodash');
const {createSelector} = require('reselect');

const {currentLocaleLanguageSelector} = require('./locale');

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
const isLocalizedLayerStylesEnabledSelector = (state) => has(state, 'localConfig.localizedLayerStyles');

/**
 * selects localizedLayerStyles value from state
 * @memberof selectors.localizedLayerStyles
 * @param  {object} state the state
 * @return {boolean} boolean if the localizedLayerStyles property is defined
 */
const isLocalizedLayerStylesEnabledDashboardsSelector = (state) => {
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
const localizedLayerStylesNameSelector = (state) => get(state, 'localConfig.localizedLayerStyles.name', 'mapstore_language');

/**
 * generates localizedLayerStyles env object
 * @memberof selectors.localizedLayerStyles
 * @param  {object} state the state
 * @return {object} object that represents ENV param
 */
const localizedLayerStylesEnvSelector = createSelector(
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

module.exports = {
    isLocalizedLayerStylesEnabledSelector,
    localizedLayerStylesNameSelector,
    localizedLayerStylesEnvSelector,
    isLocalizedLayerStylesEnabledDashboardsSelector
};
