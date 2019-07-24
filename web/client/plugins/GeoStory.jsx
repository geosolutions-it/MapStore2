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
import { currentStorySelector } from '../selectors/geostory';
import geostory from '../reducers/geostory';
import BorderLayout from '../components/layout/BorderLayout';
import Story from '../components/geostory/Story';
const { Modes } = require('../utils/GeoStoryUtils');

// TODO: implement
const onUpdate = () => {};
// TODO: implement
const onEdit = () => {};
// TODO: implement
const onAdd = () => {};

const GeoStory = ({
    story,
    slidePosition,
    mode = Modes.VIEW
}) => (<BorderLayout
        className="ms-geostory">
        <Story
            {...story}
            mode={mode}
            slidePosition={slidePosition}
            onUpdate={onUpdate}
            onEdit={onEdit}
            onAdd={onAdd} />
    </BorderLayout>
);
export const GeoStoryPlugin = connect(
    createStructuredSelector({
        story: currentStorySelector
    }),
)(GeoStory);

export const reducers = {
    geostory
};
