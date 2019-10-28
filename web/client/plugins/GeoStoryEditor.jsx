/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import {
    currentStorySelector,
    navigableItemsSelectorCreator,
    currentPageSelector,
    isCollapsedSelector,
    isSettingsEnabledSelector,
    settingsSelector,
    isToolbarEnabledSelector,
    modeSelector,
    selectedCardSelector
} from '../selectors/geostory';
import geostory from '../reducers/geostory';
import {
    move,
    remove,
    setEditing,
    selectCard,
    toggleCardPreview,
    toggleSettingsPanel,
    toggleSettings,
    toggleVisibilityItem,
    update
} from '../actions/geostory';

import Builder from '../components/geostory/builder/Builder';
import { Modes, scrollToContent } from '../utils/GeoStoryUtils';
import { createPlugin } from '../utils/PluginsUtils';


const GeoStoryEditor = ({
    mode = Modes.VIEW,
    isCollapsed,
    story = {},
    settings = {},
    currentPage,
    settingsItems,
    selected,
    isToolbarEnabled,
    isSettingsEnabled,
    setEditingMode = () => {},
    onToggleCardPreview = () => {},
    onToggleSettingsPanel = () => {},
    onToggleSettings = () => {},
    onToggleVisibilityItem = () => {},
    onSelect = () => {},
    onRemove = () => {},
    onUpdate = () => {},
    onSort = () => {}
}) => (mode === Modes.EDIT ? <div
    key="left-column"
    className="ms-geostory-editor"
    style={{ order: -1, width: 400, position: 'relative' }}>
    <Builder
        scrollTo={(id, options = { behavior: "smooth" }) => {
            scrollToContent(id, options);
        }}
        story={story}
        settings={settings}
        mode={mode}
        selected={selected}
        onSelect={onSelect}
        onRemove={onRemove}
        isToolbarEnabled={isToolbarEnabled}
        isSettingsEnabled={isSettingsEnabled}
        mode={mode}
        onUpdate={onUpdate}
        currentPage={currentPage}
        setEditing={setEditingMode}
        settingsItems={settingsItems}
        isCollapsed={isCollapsed}
        onToggleCardPreview={onToggleCardPreview}
        onToggleSettingsPanel={onToggleSettingsPanel}
        onToggleSettings={onToggleSettings}
        onToggleVisibilityItem={onToggleVisibilityItem}
        onSort={onSort}
    />
</div> : null);
/**
 * Plugin for GeoStory side panel editor
 * @name GeoStoryEditor
 * @memberof plugins
 */
export default createPlugin('GeoStoryEditor', {
    component: connect(
        createStructuredSelector({
            isCollapsed: isCollapsedSelector,
            mode: modeSelector,
            story: currentStorySelector,
            currentPage: currentPageSelector,
            settingsItems: navigableItemsSelectorCreator({withImmersiveSection: true}),
            settings: settingsSelector,
            isToolbarEnabled: isToolbarEnabledSelector,
            isSettingsEnabled: isSettingsEnabledSelector,
            selected: selectedCardSelector
        }), {
            setEditingMode: setEditing,
            onToggleCardPreview: toggleCardPreview,
            onToggleSettingsPanel: toggleSettingsPanel,
            onToggleSettings: toggleSettings,
            onToggleVisibilityItem: toggleVisibilityItem,
            onSelect: selectCard,
            onUpdate: update,
            onRemove: remove,
            onSort: move
        }
    )(GeoStoryEditor),
    reducers: {
        geostory
    }
});
