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
import {
    currentPageSelector,
    currentPositionSelector,
    modeSelector,
    navigableItemsSelectorCreator,
    settingsSelector,
    totalItemsSelector
} from '../selectors/geostory';
import {
    pathnameSelector,
    searchSelector
} from '../selectors/router';
import geostory from '../reducers/geostory';
import Navigation from '../components/geostory/navigation/Navigation';

const GeoStoryNavigation = ({
    mode = Modes.VIEW,
    currentPage,
    currentPosition,
    totalItems,
    settings,
    navigableItems = [],
    pathname,
    search,
    items = []
}) => {

    // get all buttons from other plugins via items
    const buttons = items
        .filter(({ tool }) => tool)
        .map(({ tool }) => ({ Element: tool }));

    return (mode === Modes.VIEW ? <div
        key="geostory-navigation"
        className="ms-geostory-navigation"
        style={{width: "100%", position: 'relative' }}>
        <Navigation
            settings={settings}
            currentPage={currentPage}
            currentPosition={currentPosition}
            totalItems={totalItems}
            scrollTo={(id, options = { behavior: "smooth" }) => {
                scrollToContent(id, options);
            }}
            navigableItems={navigableItems}
            router={{ pathname, search }}
            buttons={buttons} />
    </div> : null);
};
/**
 * Plugin for GeoStory top panel for navigation
 * @name GeoStoryNavigation
 * @memberof plugins
 */
export default createPlugin('GeoStoryNavigation', {
    component: connect(
        createStructuredSelector({
            mode: modeSelector,
            settings: settingsSelector,
            currentPage: currentPageSelector,
            currentPosition: currentPositionSelector,
            totalItems: totalItemsSelector,
            navigableItems: navigableItemsSelectorCreator({includeAlways: false}),
            pathname: pathnameSelector,
            search: searchSelector
        })
    )(GeoStoryNavigation),
    reducers: {
        geostory
    }
});
