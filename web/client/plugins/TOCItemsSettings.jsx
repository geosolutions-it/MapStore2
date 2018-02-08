/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {connect} = require('react-redux');
const {createSelector} = require('reselect');
const {layerSettingSelector, layersSelector, groupsSelector} = require('../selectors/layers');
const {head, isArray} = require('lodash');
const {withState, compose} = require('recompose');
const {hideSettings, updateSettings, updateNode} = require('../actions/layers');
const {getLayerCapabilities} = require('../actions/layerCapabilities');
const {currentLocaleSelector} = require('../selectors/locale');
const {generalInfoFormatSelector} = require("../selectors/mapinfo");
const {updateSettingsLifecycle} = require("../components/TOC/enhancers/tocItemsSettings");
const TOCItemsSettings = require('../components/TOC/TOCItemsSettings');
const defaultSettingsTabs = require('./tocitemssettings/defaultSettingsTabs');
const LayersUtils = require('../utils/LayersUtils');
const {mapLayoutValuesSelector} = require('../selectors/maplayout');

const tocItemsSettingsSelector = createSelector([
    layerSettingSelector,
    layersSelector,
    groupsSelector,
    currentLocaleSelector,
    generalInfoFormatSelector,
    state => mapLayoutValuesSelector(state, {height: true})
], (settings, layers, groups, currentLocale, generalInfoFormat, dockStyle) => ({
    settings,
    element: settings.nodeType === 'layers' && isArray(layers) && head(layers.filter(layer => layer.id === settings.node)) ||
    settings.nodeType === 'groups' && isArray(groups) && head(groups.filter(group => group.id === settings.node)) || {},
    groups,
    currentLocale,
    generalInfoFormat,
    getTabs: defaultSettingsTabs,
    getDimension: LayersUtils.getDimension,
    dockStyle
}));

/**
 * TOCItemsSettings plugin. This plugin allows to edit settings of groups and layers.
 * Inherit props from ResizableModal (dock = false) and DockPanel (dock = true) in cfg
 *
 * @class TOCItemsSettings
 * @memberof plugins
 * @static
 *
 * @prop cfg.dock {bool} true shows dock panel, false shows modal
 * @prop cfg.width {number} width of panel
 * @prop cfg.showFeatureInfoTab {bool} enable/disbale feature info settings
 *
 * @example
 * {
 *   "name": "TOCItemsSettings",
 *   "cfg": {
 *       "width": 300
 *    }
 * }
 */

const TOCItemsSettingsPlugin = compose(
    connect(tocItemsSettingsSelector, {
        onHideSettings: hideSettings,
        onUpdateSettings: updateSettings,
        onUpdateNode: updateNode,
        onRetrieveLayerData: getLayerCapabilities
    }),
    withState('activeTab', 'onSetTab', 'general'),
    updateSettingsLifecycle
)(TOCItemsSettings);

module.exports = {
    TOCItemsSettingsPlugin
};
