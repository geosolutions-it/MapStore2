/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import WebFont from 'webfontloader';

import {
    currentStorySelector,
    currentPageSelector,
    isCollapsedSelector,
    isSettingsEnabledSelector,
    isToolbarEnabledSelector,
    modeSelector,
    settingsItemsSelector,
    selectedCardSelector,
    isFocusOnContentSelector,
    settingsSelector,
    settingsChangedSelector,
    isEditAllowedSelector
} from '../selectors/geostory';
import geostory from '../reducers/geostory';
import {
    updateSetting,
    move,
    remove,
    setEditing,
    selectCard,
    toggleCardPreview,
    toggleSettingsPanel,
    toggleSetting,
    update
} from '../actions/geostory';

import Builder from '../components/geostory/builder/Builder';
import { Modes, scrollToContent, createWebFontLoaderConfig, extractFontNamesFromConfig } from '../utils/GeoStoryUtils';
import { basicError } from '../utils/NotificationUtils';
import { createPlugin } from '../utils/PluginsUtils';
import tooltip from '../components/misc/enhancers/tooltip';
import { withRouter } from 'react-router';
import { removeQueryFromUrl } from '../utils/ShareUtils';
import { Button as ButtonRB, Glyphicon } from 'react-bootstrap';
const Button = tooltip(ButtonRB);

const EditButton = connect(
    createStructuredSelector({
        isEditAllowed: isEditAllowedSelector
    }),
    { setEditingMode: setEditing }
)(({
    isEditAllowed,
    setEditingMode = () => {},
    location,
    history
}) => {

    const handleOnClick = () => {
        setEditingMode(true);
        const { pathname } = location;
        if (pathname.includes('/geostory/shared')) {
            const newUrl = removeQueryFromUrl(pathname.replace('/geostory/shared', '/geostory'));
            history.push(newUrl);
        }
    };

    return isEditAllowed
        ? <Button
            id="edit-story"
            className="square-button-md no-border"
            onClick={handleOnClick}
            tooltipId="geostory.navigation.edit"
            tooltipPosition="bottom">
            <Glyphicon glyph="pencil" />
        </Button>
        : null;
});

const GeoStoryEditor = ({
    currentPage,
    isCollapsed,
    isSettingsChanged = false,
    isSettingsEnabled,
    isToolbarEnabled,
    isFocused = false,
    mode = Modes.VIEW,
    story = {},
    settings = {},
    settingsItems,
    selected,
    fontFamilies = [],
    setEditingMode = () => {},
    onToggleCardPreview = () => {},
    onToggleSettingsPanel = () => {},
    onToggleSettings = () => {},
    onUpdateSettings = () => {},
    onSelect = () => {},
    onRemove = () => {},
    onUpdate = () => {},
    onSort = () => {},
    onBasicError = () => {}
}) => {
    const [storyFonts, setStoryFonts] = useState([]);
    useEffect(() => {
        if (fontFamilies.length > 0) {
            WebFont.load(createWebFontLoaderConfig(
                fontFamilies,
                () => setStoryFonts(extractFontNamesFromConfig(fontFamilies)),
                () => onBasicError(
                    {
                        message: 'geostory.builder.settings.webFontLoadError',
                        autoDismiss: 6,
                        position: 'tc'
                    }
                )
            ));
        }
    }, [ fontFamilies ]);

    return mode === Modes.EDIT && !isFocused ? <div
        key="left-column"
        className="ms-geostory-editor"
        style={{ order: -1, width: 400, position: 'relative' }}>
        <Builder
            currentPage={currentPage}
            isCollapsed={isCollapsed}
            isSettingsChanged={isSettingsChanged}
            isSettingsEnabled={isSettingsEnabled}
            isToolbarEnabled={isToolbarEnabled}
            mode={mode}
            scrollTo={(id, options = { behavior: "smooth" }) => {
                scrollToContent(id, options);
            }}
            selected={selected}
            settings={settings}
            settingsItems={settingsItems}
            story={story}
            storyFonts={storyFonts}
            setEditing={setEditingMode}
            onRemove={onRemove}
            onSelect={onSelect}
            onSort={onSort}
            onToggleCardPreview={onToggleCardPreview}
            onToggleSettings={onToggleSettings}
            onToggleSettingsPanel={onToggleSettingsPanel}
            onUpdate={onUpdate}
            onUpdateSettings={onUpdateSettings}
        />
    </div> : null;
};
/**
 * Plugin for GeoStory side panel editor
 * @name GeoStoryEditor
 * @memberof plugins
 * @prop {object[]} cfg.fontFamilies: A list of objects with font family names and sources where to load them from e.g. [{"family": "Comic sans", "src": "link to source"}]
 */
export default createPlugin('GeoStoryEditor', {
    component: connect(
        createStructuredSelector({
            isCollapsed: isCollapsedSelector,
            mode: modeSelector,
            story: currentStorySelector,
            currentPage: currentPageSelector,
            settingsItems: settingsItemsSelector,
            settings: settingsSelector,
            isSettingsChanged: settingsChangedSelector,
            isToolbarEnabled: isToolbarEnabledSelector,
            selected: selectedCardSelector,
            isSettingsEnabled: isSettingsEnabledSelector,
            isFocused: isFocusOnContentSelector
        }), {
            setEditingMode: setEditing,
            onUpdateSettings: updateSetting,
            onToggleCardPreview: toggleCardPreview,
            onToggleSettingsPanel: toggleSettingsPanel,
            onToggleSettings: toggleSetting,
            onRemove: remove,
            onSelect: selectCard,
            onSort: move,
            onUpdate: update,
            onBasicError: basicError
        }
    )(GeoStoryEditor),
    containers: {
        GeoStoryNavigation: {
            tool: withRouter(EditButton)
        }
    },
    reducers: {
        geostory
    }
});
