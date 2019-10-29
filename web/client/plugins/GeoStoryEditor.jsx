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
    currentPageSelector,
    isCollapsedSelector,
    isSettingsEnabledSelector,
    isToolbarEnabledSelector,
    modeSelector,
    navigableItemsSelectorCreator,
    selectedCardSelector,
    settingsSelector,
    settingsChangedSelector
} from '../selectors/geostory';
import geostory from '../reducers/geostory';
import {
    changeTitle,
    errorsLogo,
    move,
    remove,
    setEditing,
    selectCard,
    toggleCardPreview,
    toggleSettingsPanel,
    toggleSettings,
    toggleVisibilityItem,
    updateLogo,
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
    isSettingsChanged = false,
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
    onUpdateLogo = () => {},
    onErrorsLogo = () => {},
    onChangeTitle = () => {},
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
        isSettingsChanged={isSettingsChanged}
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
        onUpdateLogo={onUpdateLogo}
        onErrorsLogo={onErrorsLogo}
        onChangeTitle={onChangeTitle}
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
            isSettingsChanged: settingsChangedSelector,
            isToolbarEnabled: isToolbarEnabledSelector,
            isSettingsEnabled: isSettingsEnabledSelector,
            selected: selectedCardSelector
        }), {
            setEditingMode: setEditing,
            onChangeTitle: changeTitle,
            onErrorsLogo: errorsLogo,
            onToggleCardPreview: toggleCardPreview,
            onToggleSettingsPanel: toggleSettingsPanel,
            onToggleSettings: toggleSettings,
            onToggleVisibilityItem: toggleVisibilityItem,
            onRemove: remove,
            onSelect: selectCard,
            onSort: move,
            onUpdate: update,
            onUpdateLogo: updateLogo
        }
    )(GeoStoryEditor),
    reducers: {
        geostory
    }
});
