/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import DetailsPlugin from '../plugins/Details';
import DrawerMenuPlugin from '../plugins/DrawerMenu';
import FeedbackMaskPlugin from '../plugins/FeedbackMask';
import GoFullPlugin from '../plugins/GoFull';
import IdentifyPlugin from '../plugins/Identify';
import LocatePlugin from '../plugins/Locate';
import MapFooterPlugin from '../plugins/MapFooter';
import MapLoadingPlugin from '../plugins/MapLoading';
import MapPlugin from '../plugins/Map';
import OmniBarPlugin from '../plugins/OmniBar';
import SearchPlugin from '../plugins/Search';
import TOCPlugin from '../plugins/TOC';
import ToolbarPlugin from '../plugins/Toolbar';
import ZoomAllPlugin from '../plugins/ZoomAll';
import FullScreenPlugin from '../plugins/FullScreen';
import MousePosition from '../plugins/MousePosition';
import GlobeViewSwitcherPlugin from '../plugins/GlobeViewSwitcher';
import ReactSwipe from 'react-swipeable-views';
import SwipeHeader from '../components/data/identify/SwipeHeader';

export default {
    plugins: {
        // framework plugins
        DetailsPlugin,
        DrawerMenuPlugin,
        FeedbackMaskPlugin,
        GoFullPlugin,
        IdentifyPlugin,
        LocatePlugin,
        MapFooterPlugin,
        MapLoadingPlugin,
        MapPlugin,
        OmniBarPlugin,
        SearchPlugin,
        TOCPlugin,
        ToolbarPlugin,
        ZoomAllPlugin,
        FullScreenPlugin,
        MousePosition,
        GlobeViewSwitcherPlugin
    },
    requires: {
        ReactSwipe,
        SwipeHeader
    }
};
