/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {connect} = require('react-redux');
const {createSelector} = require('reselect');
const {compose, defaultProps} = require('recompose');
const {hideSettings, updateSettings, updateNode, updateSettingsParams} = require('../actions/layers');
const {getLayerCapabilities} = require('../actions/layerCapabilities');
const {updateSettingsLifecycle} = require("../components/TOC/enhancers/tocItemsSettings");
const TOCItemsSettings = require('../components/TOC/TOCItemsSettings');
const defaultSettingsTabs = require('./tocitemssettings/defaultSettingsTabs');
const LayersUtils = require('../utils/LayersUtils');
const { initialSettingsSelector, originalSettingsSelector, activeTabSettingsSelector } = require('../selectors/controls');
const {layerSettingSelector, layersSelector, groupsSelector, elementSelector} = require('../selectors/layers');
const {mapLayoutValuesSelector} = require('../selectors/maplayout');
const {currentLocaleSelector} = require('../selectors/locale');
const {isAdminUserSelector} = require('../selectors/security');
const {setControlProperty} = require('../actions/controls');
const {toggleStyleEditor} = require('../actions/styleeditor');

const tocItemsSettingsSelector = createSelector([
    layerSettingSelector,
    layersSelector,
    groupsSelector,
    currentLocaleSelector,
    state => mapLayoutValuesSelector(state, {height: true}),
    isAdminUserSelector,
    initialSettingsSelector,
    originalSettingsSelector,
    activeTabSettingsSelector,
    elementSelector
], (settings, layers, groups, currentLocale, dockStyle, isAdmin, initialSettings, originalSettings, activeTab, element) => ({
    settings,
    element,
    groups,
    currentLocale,
    dockStyle,
    isAdmin,
    initialSettings,
    originalSettings,
    activeTab
}));

/**
 * TOCItemsSettings plugin. This plugin allows to edit settings of groups and layers.
 * Inherit props from ResizableModal (dock = false) and DockPanel (dock = true) in cfg
 *
 * @class
 * @name TOCItemsSettings
 * @memberof plugins
 * @static
 *
 * @prop cfg.dock {bool} true shows dock panel, false shows modal
 * @prop cfg.width {number} width of panel
 * @prop cfg.showFeatureInfoTab {bool} enable/disbale feature info settings
 * @prop cfg.enableIFrameModule {bool} enable iframe in template editor of feature info, default true
 * @prop cfg.hideTitleTranslations {bool} if true hide the title translations tool
 * @prop cfg.showTooltipOptions {bool} if true, it shows tooltip section
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
        onRetrieveLayerData: getLayerCapabilities,
        onUpdateOriginalSettings: setControlProperty.bind(null, 'layersettings', 'originalSettings'),
        onUpdateInitialSettings: setControlProperty.bind(null, 'layersettings', 'initialSettings'),
        onSetTab: setControlProperty.bind(null, 'layersettings', 'activeTab'),
        onUpdateParams: updateSettingsParams,
        onToggleStyleEditor: toggleStyleEditor
    }),
    updateSettingsLifecycle,
    defaultProps({
        getDimension: LayersUtils.getDimension,
        getTabs: defaultSettingsTabs
    })
)(TOCItemsSettings);

module.exports = {
    TOCItemsSettingsPlugin
};
