/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { createPlugin } from '../utils/PluginsUtils';

import * as epics from '../epics/mapEditor';
import mapEditor from '../reducers/mapEditor';

import { hide, save, show } from '../actions/mapEditor';
import MapEditorModal from './mapEditor/MapEditorModal';
import ToolbarButton from '../components/misc/toolbar/ToolbarButton';

import {openSelector, ownerSelector} from '../selectors/mapEditor';

/*
 * Connect and toggle advanced Editor
 */
const mapEditorButton = ({ toggleAdvancedEditing = () => { }, map = {} }) => {
    return (<ToolbarButton
        bsStyle="primary"
        glyph="pencil"
        tooltipId="geostory.contentToolbar.advancedMapEditor"
        onClick={() => {
            const {id, ...data} = map;
            toggleAdvancedEditing('inlineEditor', {data, id});
        }} />);
};

const ConnectedMapEditorButton = connect(null, { toggleAdvancedEditing: show }
)(mapEditorButton);

const AdvancedMapEditorMenu = connect(null, {
    onClick: show
})(({
    onClick,
    itemComponent,
    widgetId,
    map = {},
    widgetType
}) => {
    if (widgetType !== "map") {
        return null;
    }
    const ItemComponent = itemComponent;
    return (
        <ItemComponent
            glyph="cog"
            textId="widgets.widget.menu.advancedMapEditor"
            onClick={() => onClick(
                "widgetInlineEditor",
                {data: {...map, widgetId}, id: map.mapId}
            )}
        />
    );
});

/**
 * Wraps the MapViewer in a modal to allow to edit a map with the usual plugins.
 * Used with {@link #plugins.GeoStoryEditor|GeoStoryEditor}.
 * @name MapEditor
 * @class
 * @memberof plugins
 */

export default createPlugin('MapEditor', {
    component: connect(
        createStructuredSelector({
            open: openSelector,
            owner: ownerSelector
        }), {
            hide,
            save
        }
    )(MapEditorModal),
    containers: {
        GeoStory: {
            name: 'MapEditor',
            target: 'mapEditorToolbar',
            Component: ConnectedMapEditorButton
        },
        Dashboard: {
            name: 'MapEditor',
            target: 'menu',
            Component: AdvancedMapEditorMenu
        }
    },
    reducers: {
        mapEditor
    },
    epics
});
