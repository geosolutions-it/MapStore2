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
import {compose, withPropsOnChange, withHandlers} from 'recompose';

import {createPlugin} from '../utils/PluginsUtils';
import { Modes } from '../utils/GeoStoryUtils';
import { getMessageById } from '../utils/LocaleUtils';
import { add, update, updateCurrentPage, remove, editWebPage } from '../actions/geostory';
import { editMedia } from '../actions/mediaEditor';
import * as epics from '../epics/geostory';
import { currentStorySelector, modeSelector, getFocusedContentSelector, isFocusOnContentSelector, settingsSelector } from '../selectors/geostory';
import { currentMessagesSelector } from '../selectors/locale';
import geostory from '../reducers/geostory';
import BorderLayout from '../components/layout/BorderLayout';
import Story from '../components/geostory/Story';
import MapEditor from '../components/geostory/common/MapEditor';
import MediaViewer from './geostory/MediaViewer';

const GeoStory = ({
    story,
    mode = Modes.VIEW,
    ...props
}) => (<BorderLayout
    className="ms-geostory"
    columns={[<MapEditor {...props} mode={mode} />]}>
    <Story
        {...story}
        {...props} // add actions
        mode={mode}
        mediaViewer={MediaViewer}
    />
</BorderLayout>
);

const storyThemeSelector = (state) => {
    return settingsSelector(state)?.theme?.general || {};
};

/**
 * Plugin for GeoStory visualization
 * @name GeoStory
 * @memberof plugins
 * @prop {numeric} cfg.interceptionTime default 100, the debounce before calculations of currentPage active section
 */
export default createPlugin("GeoStory", {
    component: compose(
        connect(
            createStructuredSelector({
                mode: modeSelector,
                story: currentStorySelector,
                messages: currentMessagesSelector,
                focusedContent: getFocusedContentSelector,
                isContentFocused: isFocusOnContentSelector,
                theme: storyThemeSelector
            }), {
                add,
                update,
                updateCurrentPage,
                remove,
                editMedia,
                editWebPage
            }
        ),
        // adding a localize function when adding new content (to localize placeholders of new content)
        withPropsOnChange(
            ["messages"],
            ({messages}) => ({
                localize: (id) => getMessageById(messages, id)
            })
        ),
        withHandlers({
            // adding to the original add function the localize function that takes
            add: ({localize, add: addFunc}) => (path, position, element) => addFunc(path, position, element, localize)
        })
    )(GeoStory),
    reducers: {
        geostory
    },
    epics
});
