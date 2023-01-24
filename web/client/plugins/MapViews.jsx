/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { connect } from 'react-redux';
import { createPlugin } from '../utils/PluginsUtils';
import { createSelector } from 'reselect';
import MapViews from './mapviews/MapViews';
import { Glyphicon, MenuItem } from 'react-bootstrap';
import ButtonMS from '../components/misc/Button';
import Message from '../components/I18N/Message';
import tooltip from '../components/misc/enhancers/tooltip';
import { activateViews } from '../actions/mapviews';
import {
    getSelectedMapViewId,
    getMapViews,
    getMapViewsResources,
    isMapViewsActive
} from '../selectors/mapviews';
import { registerCustomSaveHandler } from '../selectors/mapsave';
import { isLoggedIn } from '../selectors/security';
import { layersSelector } from '../selectors/layers';
import {
    cleanMapViewSavedPayload,
    MAP_VIEWS_CONFIG_KEY
} from '../utils/MapViewsUtils';

const Button = tooltip(ButtonMS);

registerCustomSaveHandler(MAP_VIEWS_CONFIG_KEY, (state) => cleanMapViewSavedPayload({
    active: isMapViewsActive(state),
    selectedId: getSelectedMapViewId(state),
    views: getMapViews(state),
    resources: getMapViewsResources(state)
}, layersSelector(state)));

const pluginName = 'MapViews';

/**
 * This plugin allows to add a sequence of different views inside a map
 * @memberof plugins
 * @class
 * @name MapViews
 */
const MapViewsPlugin = connect(
    createSelector([
        isLoggedIn
    ], (canEdit) => ({
        pluginName,
        edit: !!canEdit
    }))
)(MapViews);

function MapViewsButton({
    active,
    onClick,
    visible,
    menuItem
}) {
    if (!visible) {
        return null;
    }
    const messageId = !active ? 'mapViews.activateMapViews' : 'mapViews.deactivateMapViews';
    return menuItem
        ? (
            <MenuItem
                active={active}
                onClick={() => onClick(!active)}
            >
                <Glyphicon glyph="map-view"/><Message msgId={messageId}/>
            </MenuItem>
        )
        : (
            <Button
                className="square-button"
                bsStyle={active ? 'primary' : 'tray'}
                active={active}
                onClick={() => onClick(!active)}
                tooltipId={messageId}
                tooltipPosition="left"
            >
                <Glyphicon glyph="map-view"/>
            </Button>
        );
}

const ConnectedMapViewsButton = connect(
    createSelector([
        isMapViewsActive,
        isLoggedIn,
        getMapViews
    ], (active, loggedIn, views) => ({
        active,
        visible: !!loggedIn
        || !loggedIn && (views?.length || 0)
    })),
    {
        onClick: activateViews
    }
)(MapViewsButton);

export default createPlugin(pluginName, {
    component: () => null,
    containers: {
        SidebarMenu: {
            name: 'mapViews',
            position: 2000,
            tool: ConnectedMapViewsButton,
            priority: 1
        },
        BurgerMenu: {
            name: 'mapviews',
            position: 9,
            tool: () => <ConnectedMapViewsButton menuItem />,
            priority: 2
        },
        Map: {
            name: pluginName,
            Tool: MapViewsPlugin,
            alwaysRender: true
        }
    }
});
