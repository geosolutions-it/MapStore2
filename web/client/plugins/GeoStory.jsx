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
import {createPlugin} from '../utils/PluginsUtils';
import { add, update, updateCurrentPage, remove } from '../actions/geostory';
import { editMedia } from '../actions/mediaEditor';
import * as epics from '../epics/geostory';
import { currentStorySelector, modeSelector } from '../selectors/geostory';
import geostory from '../reducers/geostory';
import BorderLayout from '../components/layout/BorderLayout';
import Story from '../components/geostory/Story';
const { Modes } = require('../utils/GeoStoryUtils');

const GeoStory = ({
    story,
    mode = Modes.VIEW,
    ...props
}) => (<BorderLayout
        className="ms-geostory">
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
    component: connect(
        createStructuredSelector({
            mode: modeSelector,
            story: currentStorySelector
        }), {
            add,
            update,
            updateCurrentPage,
            remove,
            editMedia
        },
    )(GeoStory),
    reducers: {
        geostory
    },
    epics
});
