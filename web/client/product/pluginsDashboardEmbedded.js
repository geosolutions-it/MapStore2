/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import DashboardPlugin from '../plugins/Dashboard';
import FeedbackMaskPlugin from '../plugins/FeedbackMask';
import CookiePlugin from '../plugins/Cookie';
import SidebarMenuPlugin from '../plugins/SidebarMenu';

export default {
    plugins: {
        CookiePlugin,
        SidebarMenuPlugin,
        DashboardPlugin,
        FeedbackMaskPlugin
    },
    requires: {}
};
