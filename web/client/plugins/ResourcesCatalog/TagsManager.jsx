/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createPlugin } from "../../utils/PluginsUtils";

import TagsManager from './containers/TagsManager';


/**
 * This plugin provides a new menu item inside administration tools to manage tags
 * @memberof plugins
 * @class
 * @name TagsManager
 */
export default createPlugin('TagsManager', {
    component: () => null,
    containers: {
        Manager: {
            name: 'tagsmanager',
            position: 3,
            priority: 1,
            glyph: "tags",
            Component: TagsManager
        }
    }
});
