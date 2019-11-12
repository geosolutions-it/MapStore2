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
    isCollapsedSelector,
    isToolbarEnabledSelector,
    modeSelector,
    selectedCardSelector,
    currentPageSelector,
    isFocusOnContentSelector
} from '../selectors/geostory';
import geostory from '../reducers/geostory';
import { setEditing, toggleCardPreview, move, selectCard, remove, update } from '../actions/geostory';

import Builder from '../components/geostory/builder/Builder';
import { Modes, scrollToContent } from '../utils/GeoStoryUtils';
import { createPlugin } from '../utils/PluginsUtils';


const GeoStoryEditor = ({
    mode = Modes.VIEW,
    isCollapsed,
    story = {},
    currentPage,
    selected,
    isToolbarEnabled,
    isFocused = false,
    setEditingMode = () => {},
    onToggleCardPreview = () => {},
    onSelect = () => {},
    onRemove = () => {},
    onUpdate = () => {},
    onSort = () => {}
}) => (mode === Modes.EDIT && !isFocused ? <div
    key="left-column"
    className="ms-geostory-editor"
    style={{ order: -1, width: 400, position: 'relative' }}>
    <Builder
        scrollTo={(id, options = { behavior: "smooth" }) => {
            scrollToContent(id, options);
        }}
        story={story}
        mode={mode}
        selected={selected}
        onSelect={onSelect}
        onRemove={onRemove}
        isToolbarEnabled={isToolbarEnabled}
        mode={mode}
        onUpdate={onUpdate}
        currentPage={currentPage}
        setEditing={setEditingMode}
        isCollapsed={isCollapsed}
        onToggleCardPreview={onToggleCardPreview}
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
            isToolbarEnabled: isToolbarEnabledSelector,
            selected: selectedCardSelector,
            isFocused: isFocusOnContentSelector
        }), {
            setEditingMode: setEditing,
            onToggleCardPreview: toggleCardPreview,
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
