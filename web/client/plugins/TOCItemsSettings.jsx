/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import { compose, defaultProps, getContext, withPropsOnChange } from 'recompose';
import {createSelector} from 'reselect';

import {setControlProperty} from '../actions/controls';
import {getLayerCapabilities} from '../actions/layerCapabilities';
import {hideSettings, updateNode, updateSettings, updateSettingsParams, showSettings} from '../actions/layers';
import {toggleStyleEditor} from '../actions/styleeditor';
import {updateSettingsLifecycle} from "../components/TOC/enhancers/tocItemsSettings";
import TOCItemsSettings from '../components/TOC/TOCItemsSettings';
import { activeTabSettingsSelector } from '../selectors/controls';
import {elementSelector, groupsSelector, layerSettingSelector} from '../selectors/layers';
import {currentLocaleLanguageSelector, currentLocaleSelector} from '../selectors/locale';
import {isLocalizedLayerStylesEnabledSelector} from '../selectors/localizedLayerStyles';
import {mapLayoutValuesSelector} from '../selectors/maplayout';
import {isAdminUserSelector} from '../selectors/security';
import {
    getDimension
} from '../utils/LayersUtils';
import { createPlugin } from '../utils/PluginsUtils';
import defaultSettingsTabs from './tocitemssettings/defaultSettingsTabs';
import { isCesium } from '../selectors/maptype';
import { showEditableFeatureCheckboxSelector } from "../selectors/map";
import { isAnnotationLayer } from './Annotations/utils/AnnotationsUtils';

const tocItemsSettingsSelector = createSelector([
    layerSettingSelector,
    groupsSelector,
    currentLocaleSelector,
    currentLocaleLanguageSelector,
    state => mapLayoutValuesSelector(state, {height: true}),
    isAdminUserSelector,
    activeTabSettingsSelector,
    elementSelector,
    isLocalizedLayerStylesEnabledSelector,
    isCesium,
    showEditableFeatureCheckboxSelector
], (settings, groups, currentLocale, currentLocaleLanguage, dockStyle, isAdmin, activeTab, element, isLocalizedLayerStylesEnabled, isCesiumActive, showFeatureEditOption) => ({
    settings,
    element,
    groups,
    currentLocale,
    currentLocaleLanguage,
    dockStyle,
    isAdmin,
    activeTab,
    isLocalizedLayerStylesEnabled,
    isCesiumActive,
    showFeatureEditOption
}));

const SettingsButton = connect(() => ({}), {
    onSettings: showSettings,
    onHideSettings: hideSettings
})(({
    selectedNodes,
    status,
    itemComponent,
    statusTypes,
    expanded,
    onSettings = () => {},
    onHideSettings = () => {},
    ...props
}) => {
    const ItemComponent = itemComponent;

    function handleShowSettings() {
        if (!expanded) {
            return status === statusTypes.LAYER
                ? onSettings(selectedNodes[0].id, 'layers', {
                    opacity: parseFloat(selectedNodes[0]?.node?.opacity !== undefined
                        ? selectedNodes[0]?.node?.opacity
                        : 1)
                })
                : onSettings(selectedNodes[0].id, 'groups', {});
        }
        return onHideSettings();
    }

    if ([statusTypes.LAYER, statusTypes.GROUP].includes(status)) {

        if (statusTypes.LAYER === status && isAnnotationLayer(selectedNodes?.[0]?.node)) {
            return null;
        }

        return (
            <ItemComponent
                {...props}
                glyph="wrench"
                tooltipId={status === statusTypes.GROUP ? 'toc.toolGroupSettingsTooltip' : 'toc.toolLayerSettingsTooltip'}
                onClick={() => handleShowSettings()}
            />
        );
    }
    return null;
});

/**
 * TOCItemsSettings plugin. This plugin allows to edit settings of groups and layers.
 * Inherit props from ResizableModal (dock = false) and DockPanel (dock = true) in cfg
 *
 * @class
 * @name TOCItemsSettings
 * @memberof plugins
 * @static
 *
 * @prop {boolean} cfg.dock true shows dock panel, false shows modal
 * @prop {number} cfg.width width of panel
 * @prop {boolean} cfg.showFeatureInfoTab enable/disbale feature info settings
 * @prop {boolean} cfg.enableIFrameModule enable iframe in template editor of feature info, default true
 * @prop {boolean} cfg.hideTitleTranslations if true hide the title translations tool
 * @prop {boolean} cfg.showTooltipOptions if true, it shows tooltip section
 * @prop {string} cfg.initialActiveTab tab that will be enabled initially when the settings are opened. Possible values:
 * @prop {boolean} cfg.hideInteractiveLegendOption (deprecated) if true, it hide the checkbox of enable interactive legend in display tab
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
    withPropsOnChange(["items", "settings"], (props) => ({
        tabs: defaultSettingsTabs(props)
    }))
)(TOCItemsSettings);

export default createPlugin('TOCItemsSettings', {
    component: TOCItemsSettingsPlugin,
    containers: {
        TOC: {
            doNotHide: true,
            name: "TOCItemsSettings",
            Component: SettingsButton,
            target: 'toolbar',
            position: 5
        }
    }
});


