/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import WebFont from 'webfontloader';

import {createPlugin} from '../utils/PluginsUtils';
import { Modes, createWebFontLoaderConfig, extractFontNames, scrollToContent } from '../utils/GeoStoryUtils';
import { getMessageById } from '../utils/LocaleUtils';
import { basicError } from '../utils/NotificationUtils';
import {
    add,
    update,
    updateSetting,
    updateCurrentPage,
    remove,
    editWebPage,
    updateMediaEditorSettings
} from '../actions/geostory';
import { editMedia } from '../actions/mediaEditor';
import * as epics from '../epics/geostory';
import {
    currentStorySelector,
    modeSelector,
    getFocusedContentSelector,
    isFocusOnContentSelector,
    settingsSelector,
    currentStoryFonts } from '../selectors/geostory';
import { currentMessagesSelector } from '../selectors/locale';
import geostory from '../reducers/geostory';
import BorderLayout from '../components/layout/BorderLayout';
import Story from '../components/geostory/Story';
import MapEditor from '../components/geostory/common/MapEditor';
import MediaViewer from './geostory/MediaViewer';
import MediaContentToolbar from './geostory/MediaContentToolbar';

const GeoStory = ({
    story,
    mode = Modes.VIEW,
    onAdd,
    messages,
    fontFamilies = [],
    storyFonts = [],
    webFont = WebFont,
    onUpdate = () => {},
    onBasicError = () => {},
    onUpdateMediaEditorSetting,
    mediaEditorSettings,
    ...props
}) => {
    const localize = useCallback((id) => getMessageById(messages, id), [messages]);
    const addFunc = (path, position, element) => onAdd(path, position, element, localize);

    useEffect(() => {
        window.__geostory_interaction = (type, param) => {
            if (type === 'scrollTo')  {
                scrollToContent(param, {behavior: "smooth"});
            }
        };
    }, []);

    useEffect(() => {
        onUpdate("settings.theme.fontFamilies", fontFamilies, "merge");
        // we need to store settings for media editor
        // so we could use them later when we open the media editor plugin
        if (mediaEditorSettings) {
            onUpdateMediaEditorSetting(mediaEditorSettings);
        }
    }, []);

    useEffect(() => {
        if (storyFonts.length > 0) {
            const storyFontsSrc = storyFonts.filter(({ src }) => src && !document.head.querySelector(`link[href='${src}']`));
            if (storyFontsSrc.length > 0) {
                webFont.load(createWebFontLoaderConfig(
                    storyFonts,
                    () => {},
                    () => onBasicError({message: 'geostory.builder.settings.webFontLoadError'})
                ));
            }
        }
    }, [ storyFonts ]);

    return (<BorderLayout
        className="ms-geostory"
        columns={[<MapEditor {...props} add={addFunc} update={onUpdate} mode={mode} />]}>
        <Story
            {...story}
            {...props} // add actions
            storyFonts={extractFontNames(storyFonts)}
            add={addFunc}
            update={onUpdate}
            mode={mode}
            mediaViewer={MediaViewer}
            contentToolbar={MediaContentToolbar}
        />
    </BorderLayout>
    );
};

const storyThemeSelector = (state) => {
    return settingsSelector(state)?.theme || {};
};

GeoStory.defaultProps = {
    storyFonts: [],
    fontFamilies: [],
    onUpdateMediaEditorSetting: () => {}
};

/**
 * Plugin for GeoStory visualization
 * @name GeoStory
 * @class
 * @memberof plugins
 * @prop {numeric} cfg.interceptionTime default 100, the debounce before calculations of currentPage active section
 * @prop {object[]} cfg.fontFamilies: A list of objects with font family names and sources where to load them from e.g. [{"family": "Comic sans", "src": "link to source"}]
 * @prop {object} cfg.mediaEditorSettings settings for media editor services divided by media type
 * @prop {string} cfg.mediaEditorSettings.sourceId selected service identifier used when the modal shows up
 * @prop {object} cfg.mediaEditorSettings.mediaTypes configuration of source options for each media type: image, video and map
 * @prop {object} cfg.mediaEditorSettings.sources definition of sources
 * @prop {object} cfg.mediaEditorSettings.sources[sourceId].name name id of service for translations
 * @prop {object} cfg.mediaEditorSettings.sources[sourceId].type type of service
 * @prop {object} cfg.mediaEditorSettings.sources[sourceId].addMediaEnabled[mediaType] enable add button (supported service types: geostory)
 * @prop {object} cfg.mediaEditorSettings.sources[sourceId].editMediaEnabled[mediaType] enable edit button (supported service types: geostory and geostore)
 * @prop {object} cfg.mediaEditorSettings.sources[sourceId].removeMediaEnabled[mediaType] enable remove button (supported service types: geostory)
 * @example
 * // example of mediaEditorSettings configuration with only the geostory service
 * {
 *   "name": "GeoStory",
 *   "cfg": {
 *     "mediaEditorSettings": {
 *       "sourceId": "geostory",
 *       "mediaTypes": {
 *         "image": {
 *           "defaultSource": "geostory",
 *           "sources": ["geostory"]
 *         },
 *         "video": {
 *           "defaultSource": "geostory",
 *           "sources": ["geostory"]
 *         },
 *         "map": {
 *           "defaultSource": "geostory",
 *           "sources": ["geostory"]
 *         }
 *       },
 *       "sources": {
 *         "geostory": {
 *           "name": "geostory.currentStory",
 *           "type": "geostory"
 *           "addMediaEnabled": {
 *             "image": true,
 *             "video": true,
 *             "map": true
 *           },
 *           "editMediaEnabled": {
 *             "image": true,
 *             "video": true,
 *             "map": true
 *           },
 *           "removeMediaEnabled": {
 *             "image": true,
 *             "video": true,
 *             "map": true
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 */
export default createPlugin("GeoStory", {
    component: connect(
        createStructuredSelector({
            mode: modeSelector,
            story: currentStorySelector,
            messages: currentMessagesSelector,
            focusedContent: getFocusedContentSelector,
            isContentFocused: isFocusOnContentSelector,
            theme: storyThemeSelector,
            storyFonts: currentStoryFonts
        }), {
            onAdd: add,
            onUpdate: update,
            updateCurrentPage,
            onUpdateSetting: updateSetting,
            remove,
            editMedia,
            editWebPage,
            onBasicError: basicError,
            onUpdateMediaEditorSetting: updateMediaEditorSettings
        }
    )(GeoStory),
    reducers: {
        geostory
    },
    epics
});
