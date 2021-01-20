/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default {
    plugins: {
        GeoStoryPlugin: require('../plugins/GeoStory').default,
        GeoStoryNavigationPlugin: require('../plugins/GeoStoryNavigation').default,
        FeedbackMaskPlugin: require('../plugins/FeedbackMask').default
    },
    requires: {
        ReactSwipe: require('react-swipeable-views').default,
        SwipeHeader: require('../components/data/identify/SwipeHeader').default
    }
};
