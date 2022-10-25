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
import { Glyphicon } from 'react-bootstrap';
import ButtonMS from '../components/misc/Button';
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
import { mapIdSelector } from '../selectors/map';
import { layersSelector } from '../selectors/layers';
import { cleanMapViewSavedPayload } from '../utils/MapViewsUtils';

const Button = tooltip(ButtonMS);

const MAP_VIEWS_CONFIG_KEY = 'mapViews';

registerCustomSaveHandler(MAP_VIEWS_CONFIG_KEY, (state) => cleanMapViewSavedPayload({
    active: isMapViewsActive(state),
    selectedId: getSelectedMapViewId(state),
    views: getMapViews(state),
    resources: getMapViewsResources(state)
}, layersSelector(state)));

const pluginName = 'MapViews';

const MapViewsPlugin = connect(
    createSelector([
        mapIdSelector,
        isLoggedIn
    ], (mapId, canEdit) => ({
        pluginName,
        mapViewsConfigKey: MAP_VIEWS_CONFIG_KEY,
        mapId,
        edit: !!canEdit
    }))
)(MapViews);

function MapViewsButton({
    active,
    onClick,
    visible
}) {
    return visible ? (
        <Button
            className="square-button"
            bsStyle={active ? 'primary' : 'tray'}
            active={active}
            onClick={() => onClick(!active)}
            tooltipId={!active ? 'mapViews.activateMapViews' : 'mapViews.deactivateMapViews'}
            tooltipPosition="left"
        >
            <Glyphicon glyph="map-view"/>
        </Button>
    ) : true;
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
            tool: ConnectedMapViewsButton
        },
        Map: {
            name: pluginName,
            Tool: MapViewsPlugin
        }
    }
});
