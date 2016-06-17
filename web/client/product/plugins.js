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
        PrintPlugin: require('../plugins/Print'),
        IdentifyPlugin: require('../plugins/Identify'),
        TOCPlugin: require('../plugins/TOC'),
        BackgroundSwitcherPlugin: require('../plugins/BackgroundSwitcher'),
        MeasurePlugin: require('../plugins/Measure'),
        MapPlugin: require('../plugins/Map'),
        ToolbarPlugin: require('../plugins/Toolbar'),
        DrawerMenuPlugin: require('../plugins/DrawerMenu'),
        ShapeFilePlugin: require('../plugins/ShapeFile'),
        SnapshotPlugin: require('../plugins/Snapshot'),
        SettingsPlugin: require('../plugins/Settings'),
        ExpanderPlugin: require('../plugins/Expander'),
        SearchPlugin: require('../plugins/Search'),
        ScaleBoxPlugin: require('../plugins/ScaleBox'),
        LocatePlugin: require('../plugins/Locate'),
        ZoomInPlugin: require('../plugins/ZoomIn'),
        ZoomOutPlugin: require('../plugins/ZoomOut'),
        ZoomAllPlugin: require('../plugins/ZoomAll'),
        MapLoadingPlugin: require('../plugins/MapLoading'),
        AboutPlugin: require('./plugins/About'),
        HelpPlugin: require('../plugins/Help'),
        HomePlugin: require('../plugins/Home'),
        MadeWithLovePlugin: require('./plugins/MadeWithLove'),
        MetadataExplorerPlugin: require('../plugins/MetadataExplorer'),
        LoginPlugin: require('../plugins/Login'),
        OmniBarPlugin: require('../plugins/OmniBar'),
        BurgerMenuPlugin: require('../plugins/BurgerMenu')
    },
    requires: {
        ReactSwipe: require('react-swipe'),
        SwipeHeader: require('../components/data/identify/SwipeHeader')
    }
};
