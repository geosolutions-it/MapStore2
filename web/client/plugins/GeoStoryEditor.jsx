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
    modeSelector
} from '../selectors/geostory';
import geostory from '../reducers/geostory';

import Builder from '../components/geostory/builder/Builder';
import { Modes } from '../utils/GeoStoryUtils';
import { setEditing } from '../actions/geostory';
const GeoStoryEditor = ({
    mode = Modes.VIEW,
    setEditingMode = () => {},
    story = {}
}) => (<div
    key="left-column"
    className="ms-geostory-left-panel"
    style={{ order: -1, width: 400, position: 'relative' }}>
    <Builder
        story={story}
        mode={mode}
        setEditing={setEditingMode}
        />
</div>
);
export const GeoStoryEditorPlugin = connect(
    createStructuredSelector({
        mode: modeSelector,
        story: currentStorySelector
    }), {
        setEditingMode: setEditing

    }
)(GeoStoryEditor);

export const reducers = {
    geostory
};
