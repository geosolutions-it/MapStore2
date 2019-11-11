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
import { add, update, updateCurrentPage, updateCurrentColumn, remove } from '../actions/geostory';
import { editMedia } from '../actions/mediaEditor';
import * as epics from '../epics/geostory';
import { currentStorySelector, modeSelector, getFocusedContentSelector} from '../selectors/geostory';
import { currentMessagesSelector } from '../selectors/locale';
import geostory from '../reducers/geostory';
import BorderLayout from '../components/layout/BorderLayout';
import Story from '../components/geostory/Story';
import MapEditor from '../components/geostory/common/MapEditor';

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
    />
</BorderLayout>
);

/**
 * Plugin for GeoStory visualization
 * @name GeoStory
 * @memberof plugins
 */
export default createPlugin("GeoStory", {
    component: compose(
        connect(
            createStructuredSelector({
                mode: modeSelector,
                story: currentStorySelector,
                messages: currentMessagesSelector,
                focusedContent: getFocusedContentSelector
            }), {
                add,
                update,
                updateCurrentPage,
                updateCurrentColumn,
                remove,
                editMedia
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
