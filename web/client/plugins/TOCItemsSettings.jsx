/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import { compose, defaultProps, getContext, withPropsOnChange } from 'recompose';
import {createSelector} from 'reselect';

import {setControlProperty} from '../actions/controls';
import {getLayerCapabilities} from '../actions/layerCapabilities';
import {hideSettings, updateNode, updateSettings, updateSettingsParams} from '../actions/layers';
import {toggleStyleEditor} from '../actions/styleeditor';
import {updateSettingsLifecycle} from "../components/TOC/enhancers/tocItemsSettings";
import TOCItemsSettings from '../components/TOC/TOCItemsSettings';
import { activeTabSettingsSelector, initialSettingsSelector, originalSettingsSelector } from '../selectors/controls';
import {elementSelector, groupsSelector, layerSettingSelector, layersSelector} from '../selectors/layers';
import {currentLocaleLanguageSelector, currentLocaleSelector} from '../selectors/locale';
import {isLocalizedLayerStylesEnabledSelector} from '../selectors/localizedLayerStyles';
import {mapLayoutValuesSelector} from '../selectors/maplayout';
import {isAdminUserSelector} from '../selectors/security';
import {
    getDimension
} from '../utils/LayersUtils';
import { createPlugin } from '../utils/PluginsUtils';
import defaultSettingsTabs from './tocitemssettings/defaultSettingsTabs';

const tocItemsSettingsSelector = createSelector([
    layerSettingSelector,
    layersSelector,
    groupsSelector,
    currentLocaleSelector,
    currentLocaleLanguageSelector,
    state => mapLayoutValuesSelector(state, {height: true}),
    isAdminUserSelector,
    initialSettingsSelector,
    originalSettingsSelector,
    activeTabSettingsSelector,
    elementSelector,
    isLocalizedLayerStylesEnabledSelector
], (settings, layers, groups, currentLocale, currentLocaleLanguage, dockStyle, isAdmin, initialSettings, originalSettings, activeTab, element, isLocalizedLayerStylesEnabled) => ({
    settings,
    element,
    groups,
    currentLocale,
    currentLocaleLanguage,
    dockStyle,
    isAdmin,
    initialSettings,
    originalSettings,
    activeTab,
    isLocalizedLayerStylesEnabled
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
 * @prop cfg.initialActiveTab {string} tab that will be enabled initially when the settings are opened. Possible values:
 * 'general' (General tab), 'display' (Display tab), 'style' (Style tab), 'feature' (Feature info tab).
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
        getDimension: getDimension,
        enableLayerNameEditFeedback: true
    }),
    getContext({
        loadedPlugins: PropTypes.object
    }),
    withPropsOnChange(({items = []} = {}, {items: nextItems} = {}) => {
        return items !== nextItems; // TODO: check if equal
    }, (props) => ({
        tabs: defaultSettingsTabs(props)
    }))
)(TOCItemsSettings);

export default createPlugin('TOCItemsSettings', {
    component: TOCItemsSettingsPlugin,
    containers: {
        TOC: {
            doNotHide: true,
            name: "TOCItemsSettings"
        }
    }
});


