/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
    plugins: {
        // framework plugins
        BackgroundSwitcherPlugin: require('../plugins/BackgroundSwitcher'),
        DrawerMenuPlugin: require('../plugins/DrawerMenu'),
        FeedbackMaskPlugin: require('../plugins/FeedbackMask'),
        GoFullPlugin: require('../plugins/GoFull'),
        IdentifyPlugin: require('../plugins/Identify'),
        LocatePlugin: require('../plugins/Locate'),
        MapFooterPlugin: require('../plugins/MapFooter'),
        MapLoadingPlugin: require('../plugins/MapLoading'),
        MapPlugin: require('../plugins/Map'),
        OmniBarPlugin: require('../plugins/OmniBar'),
        SearchPlugin: require('../plugins/Search'),
        TOCPlugin: require('../plugins/TOC'),
        ToolbarPlugin: require('../plugins/Toolbar'),
        ZoomAllPlugin: require('../plugins/ZoomAll')
    },
    requires: {
        ReactSwipe: require('react-swipeable-views').default,

        SwipeHeader: require('../components/data/identify/SwipeHeader')
    }
};
