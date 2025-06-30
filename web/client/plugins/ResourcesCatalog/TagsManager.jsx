/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { createPlugin } from "../../utils/PluginsUtils";

import TagsManager from './containers/TagsManager';
import PropTypes from 'prop-types';


function TagsManagerMenuItem({
    itemComponent
}, context) {
    const ItemComponent = itemComponent;
    if (ItemComponent) {
        return (
            <ItemComponent
                onClick={() => {
                    context.router.history.push("/manager/tagsmanager");
                }}
                msgId="resourcesCatalog.manageTags"
                glyph="tags"
            />
        );
    }
    return null;
}

TagsManagerMenuItem.contextTypes = {
    router: PropTypes.object
};


/**
 * This plugin provides a new menu item inside administration tools to manage tags
 * @memberof plugins
 * @class
 * @name TagsManager
 */
export default createPlugin('TagsManager', {
    component: () => null,
    containers: {
        ManagerMenu: {
            Component: TagsManagerMenuItem,
            position: 5
        },
        Login: {
            target: 'manager-menu',
            Component: TagsManagerMenuItem,
            position: 5,
            glyph: 'tags'
        },
        Manager: {
            name: 'tagsmanager',
            position: 3,
            priority: 1,
            glyph: "tags",
            Component: TagsManager
        }
    }
});
