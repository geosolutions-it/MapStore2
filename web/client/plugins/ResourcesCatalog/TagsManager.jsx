/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { connect } from "react-redux";
import { createPlugin } from "../../utils/PluginsUtils";
import tagsReducer from './reducers/tags';
import { showTagsPanelSelector } from './selectors/tags';
import { createStructuredSelector } from 'reselect';
import { showTagsPanel } from './actions/tags';
import TagsManager from './containers/TagsManager';

function TagsManagerWrapper({ show, ...props }) {
    return show ? (
        <TagsManager {...props} />
    ) : null;
}

function TagsManagerMenuItem({
    onShow,
    itemComponent
}) {
    const ItemComponent = itemComponent;
    if (ItemComponent) {
        return (
            <ItemComponent
                onClick={() => onShow(true)}
                msgId="resourcesCatalog.manageTags"
                glyph="tags"
            />
        );
    }
    return null;
}

const tagsConnect = connect(
    createStructuredSelector({
        show: showTagsPanelSelector
    }),
    {
        onShow: showTagsPanel
    }
);

const ConnectedTagsManager = tagsConnect(TagsManagerWrapper);
const ConnectedTagsManagerMenuItem = tagsConnect(TagsManagerMenuItem);
/**
 * This plugin provides a new menu item inside administration tools to manage tags
 * @memberof plugins
 * @class
 * @name TagsManager
 */
export default createPlugin('TagsManager', {
    component: ConnectedTagsManager,
    containers: {
        ManagerMenu: {
            Component: ConnectedTagsManagerMenuItem,
            position: 5
        }
    },
    reducers: {
        tags: tagsReducer
    }
});
