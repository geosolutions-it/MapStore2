/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
    plugins: {
        IdentifyPlugin: require('../plugins/Identify'),
        TOCPlugin: require('../plugins/TOC'),
        BackgroundSwitcherPlugin: require('../plugins/BackgroundSwitcher'),
        MapPlugin: require('../plugins/Map'),
        ToolbarPlugin: require('../plugins/Toolbar'),
        DrawerMenuPlugin: require('../plugins/DrawerMenu'),
        SearchPlugin: require('../plugins/Search'),
        LocatePlugin: require('../plugins/Locate'),
        ZoomAllPlugin: require('../plugins/ZoomAll'),
        MapLoadingPlugin: require('../plugins/MapLoading'),
        OmniBarPlugin: require('../plugins/OmniBar')
    },
    requires: {
        ReactSwipe: require('react-swipeable-views').default,
        SwipeHeader: require('../components/data/identify/SwipeHeader')
    }
};
