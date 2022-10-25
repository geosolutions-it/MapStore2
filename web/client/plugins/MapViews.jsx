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

/*

payload properties

@param {boolean} active if true the view will be active at initialization
@param {string} selectedId id of the selected view
@param {array} views array of views configuration
@param {array} resources array of resources configuration

view object configuration

@param {string} id identifier of the view
@param {string} title title of the view
@param {string} description an html string to describe the view
@param {number} duration time duration during navigation in seconds
@param {boolean} flyTo enable animation transition during navigation
@param {object} center center target position as { latitude (degrees), longitude (degrees), height (meter) }
@param {object} cameraPosition point of view position as { latitude (degrees), longitude (degrees), height (meter) }
@param {number} zoom zoom level
@param {array} bbox bounding box in WGS84 as [minx, miny, maxx, maxy]
@param {object} mask optional configuration for the 3D tiles mask
@param {boolean} mask.enabled enable mask
@param {string} mask.resourceId identifier of a resource configuration
@param {boolean} mask.inverse enabled inverse mask
@param {number} mask.offset offset in meter for the inverse mask
@param {object} terrain optional configuration for terrain clipping
@param {string} terrain.clippingLayerResourceId identifier of a resource configuration
@param {string} terrain.clippingPolygonFeatureId identifier of a polygon feature available in the selected layer source
@param {boolean} terrain.clippingPolygonUnion if true it applies inverse clipping
@param {object} globeTranslucency optional configuration for the globe translucency
@param {boolean} globeTranslucency.enabled enable translucency
@param {number} globeTranslucency.opacity opacity of the globe translucency, it should be a value between 0 and 1 where 1 is fully opaque
@param {boolean} globeTranslucency.fadeByDistance if true the translucency is visible only in between the nearDistance and farDistance values
@param {number} globeTranslucency.nearDistance minimum distance to apply translucency when fadeByDistance is true
@param {number} globeTranslucency.farDistance maximum distance to apply translucency when fadeByDistance is true
@param {array} layers array of layer configuration overrides, default property visibility and opacity

resource object configuration

@param {string} id identifier for the resource
@param {object} data information related to the layer used for the resource (wfs or vector type)

payload example

{
    active: true,
    selectedId: 'view.id.01',
    views: [
        {
            id: 'view.id.01',
            title: 'Title',
            description: '<p>Description</p>',
            duration: 10,
            flyTo: true,
            center: {
                longitude: 8.93690091201193,
                latitude: 44.39522451776296,
                height: -0.0022900843616703204
            },
            cameraPosition: {
                longitude: 8.93925651181738,
                latitude: 44.38698231953802,
                height: 655.705914040523
            },
            zoom: 17.89659156734602,
            bbox: [
                8.920925393119584,
                44.39084055670365,
                8.948118718933738,
                44.40554444092288
            ],
            mask: {
                enabled: true,
                resourceId: 'resource.id.01',
                inverse: true,
                offset: 10000
            },
            terrain: {
                clippingLayerResourceId: 'resource.id.02',
                clippingPolygonFeatureId: 'feature.id.01',
                clippingPolygonUnion: true
            },
            globeTranslucency: {
                enabled: true,
                fadeByDistance: false,
                nearDistance: 500,
                farDistance: 50000,
                opacity: 0.5
            },
            layers: [
                {
                    id: 'layer.id.01',
                    visibility: true,
                    opacity: 0.5
                },
                {
                    id: 'layer.id.04',
                    visibility: true,
                    clippingLayerResourceId: 'resource.id.02',
                    clippingPolygonFeatureId: 'feature.id.01',
                    clippingPolygonUnion: false
                }
            ]
        }
    ],
    resources: [
        {
            id: 'resource.id.01',
            data: {
                type: 'vector',
                name: 'mask',
                title: 'Mask',
                id: 'layer.id.02'
            }
        },
        {
            id: 'resource.id.02',
            data: {
                type: 'wfs',
                url: '/service/wfs',
                name: "clip",
                title: 'Clip',
                id: 'layer.id.03'
            }
        }
    ]
}
*/
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
