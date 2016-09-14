/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
    plugins: {
        MousePositionPlugin: require('../plugins/MousePosition'),
        MapPlugin: require('../plugins/Map'),
        ToolbarPlugin: require('../plugins/Toolbar'),
        SettingsPlugin: require('../plugins/Settings'),
        ExpanderPlugin: require('../plugins/Expander'),
        SearchPlugin: require('../plugins/Search'),
        ScaleBoxPlugin: require('../plugins/ScaleBox'),
        LocatePlugin: require('../plugins/Locate'),
        ZoomInPlugin: require('../plugins/ZoomIn'),
        ZoomOutPlugin: require('../plugins/ZoomOut'),
        ZoomAllPlugin: require('../plugins/ZoomAll'),
        MapLoadingPlugin: require('../plugins/MapLoading'),
        UndoPlugin: require('../plugins/History'),
        RedoPlugin: require('../plugins/History'),
        OmniBarPlugin: require('../plugins/OmniBar'),
        DrawerMenuPlugin: require('../plugins/DrawerMenu'),
        TOCPlugin: require('../plugins/TOC'),
        BackgroundSwitcherPlugin: require('../plugins/BackgroundSwitcher'),
        BurgerMenuPlugin: require('../plugins/BurgerMenu'),
        IdentifyPlugin: require('../plugins/Identify')
    },
    requires: {
        ReactSwipe: require('react-swipeable-views').default,
        SwipeHeader: require('../components/data/identify/SwipeHeader')
    }
};
