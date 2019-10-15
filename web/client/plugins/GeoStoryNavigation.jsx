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
import { Modes, scrollToContent } from '../utils/GeoStoryUtils';
import { setEditing } from '../actions/geostory';
import {
    currentStorySelector,
    isEditAllowedSelector,
    currentPageSelector,
    modeSelector
} from '../selectors/geostory';
import geostory from '../reducers/geostory';
import Navigation from '../components/geostory/navigation/Navigation';

const GeoStoryNavigation = ({
    mode = Modes.VIEW,
    currentPage,
    isEditAllowed,
    setEditingMode = () => { },
    story = {}
}) => (mode === Modes.VIEW ? <div
    key="geostory-navigation"
    className="ms-geostory-navigation"
    style={{width: "100%", position: 'relative' }}>
    <Navigation
        currentPage={currentPage}
        isEditAllowed={isEditAllowed}
        scrollTo={(id, options = { behavior: "smooth" }) => () => {
            scrollToContent(id, options);
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
            currentPage: currentPageSelector,
            isEditAllowed: isEditAllowedSelector,
            story: currentStorySelector
        }), {
            setEditingMode: setEditing
        }
    )(GeoStoryNavigation),
    reducers: {
        geostory
    }
});
