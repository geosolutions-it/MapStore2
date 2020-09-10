/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
    plugins: {
        MapPlugin: require('../../plugins/Map'),
        ToolbarPlugin: require('../../plugins/Toolbar'),
        DrawerMenuPlugin: require('../../plugins/DrawerMenu'),
        SnapshotPlugin: require('../../plugins/Snapshot'),
        SettingsPlugin: require('../../plugins/Settings'),
        ExpanderPlugin: require('../../plugins/Expander'),
        SearchPlugin: require('../../plugins/Search'),
        ScaleBoxPlugin: require('../../plugins/ScaleBox'),
        LocatePlugin: require('../../plugins/Locate'),
        ZoomInPlugin: require('../../plugins/ZoomIn'),
        ZoomOutPlugin: require('../../plugins/ZoomOut'),
        ZoomAllPlugin: require('../../plugins/ZoomAll'),
        MapLoadingPlugin: require('../../plugins/MapLoading'),
        HelpPlugin: require('../../plugins/Help'),
        HomePlugin: require('../../plugins/Home'),
        MetadataExplorerPlugin: require('../../plugins/MetadataExplorer'),
        LoginPlugin: require('../../plugins/Login'),
        OmniBarPlugin: require('../../plugins/OmniBar'),
        BurgerMenuPlugin: require('../../plugins/BurgerMenu'),
        UndoPlugin: require('../../plugins/History'),
        RedoPlugin: require('../../plugins/History'),
        MapsPlugin: require('../../plugins/Maps').default,
        MapSearchPlugin: require('../../plugins/MapSearch'),
        LanguagePlugin: require('../../plugins/Language'),
        ManagerPlugin: require('../../plugins/manager/Manager'),
        ManagerMenuPlugin: require('../../plugins/manager/ManagerMenu'),
        SharePlugin: require('../../plugins/Share'),
        SavePlugin: require('../../plugins/Save'),
        SaveAsPlugin: require('../../plugins/SaveAs'),
        TOCPlugin: require('../../plugins/TOC'),
        BackgroundSelectorPlugin: require('../../plugins/BackgroundSelector'),
        MeasurePlugin: require('../../plugins/Measure'),
        TOCItemsSettingsPlugin: require('../../plugins/TOCItemsSettings'),
        IdentifyPlugin: require('../../plugins/Identify')
    },
    requires: {
        ReactSwipe: require('react-swipeable-views').default,
        SwipeHeader: require('../../components/data/identify/SwipeHeader')
    }
};
