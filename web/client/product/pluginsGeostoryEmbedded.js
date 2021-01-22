/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import GeoStoryPlugin from '../plugins/GeoStory';
import GeoStoryNavigationPlugin from '../plugins/GeoStoryNavigation';
import FeedbackMaskPlugin from '../plugins/FeedbackMask';
import ReactSwipe from 'react-swipeable-views';
import SwipeHeader from '../components/data/identify/SwipeHeader';

export default {
    plugins: {
        GeoStoryPlugin,
        GeoStoryNavigationPlugin,
        FeedbackMaskPlugin
    },
    requires: {
        ReactSwipe,
        SwipeHeader
    }
};
