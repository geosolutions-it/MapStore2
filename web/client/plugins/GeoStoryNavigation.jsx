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
import { createPlugin } from '../utils/PluginsUtils';
import { Modes } from '../utils/GeoStoryUtils';
import { setEditing } from '../actions/geostory';
import {
    currentStorySelector,
    modeSelector
} from '../selectors/geostory';
import geostory from '../reducers/geostory';
import Navigation from '../components/geostory/navigation/Navigation';

const GeoStoryNavigation = ({
    mode = Modes.VIEW,
    setEditingMode = () => { },
    story = {}
}) => (mode === Modes.VIEW ? <div
    key="geostory-navigation"
    className="ms-geostory-navigation"
    style={{width: "100%", position: 'relative' }}>
    <Navigation
            scrollTo={(id, options = { behavior: "smooth" }) => () => {
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView(options);
                }
            }}
        story={story}
        setEditing={setEditingMode} />
</div> : null);
/**
 * Plugin for GeoStory top panel for navigation
 * @name GeoStoryNavigation
 * @memberof plugins
 */
export default createPlugin('GeoStoryNavigation', {
    component: connect(
        createStructuredSelector({
            mode: modeSelector,
            story: currentStorySelector
        }), {
        setEditingMode: setEditing
    }
    )(GeoStoryNavigation),
    reducers: {
        geostory
    }
});
