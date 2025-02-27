/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {connect, createPlugin} from '../utils/PluginsUtils';
import { Glyphicon } from 'react-bootstrap';
import Message from '../components/I18N/Message';
import { toggleControl, setControlProperty } from '../actions/controls';
import ConfigUtils from '../utils/ConfigUtils';
import {getApiUrl, getConfigUrl} from '../utils/ShareUtils';
import {getExtentFromViewport} from '../utils/CoordinatesUtils';
import { versionSelector } from '../selectors/version';
import shareEpics from '../epics/queryparams';
import SharePanel from '../components/share/SharePanel';
import { createSelector } from 'reselect';
import { mapIdSelector, mapSelector } from '../selectors/map';
import { currentContextSelector } from '../selectors/context';
import { get } from 'lodash';
import controls from '../reducers/controls';
import { changeFormat } from '../actions/mapInfo';
import { addMarker, hideMarker } from '../actions/search';
import { updateMapView } from '../actions/map';
import { resourceSelector as geostoryResourceSelector, updateUrlOnScrollSelector } from '../selectors/geostory';
import { shareSelector } from "../selectors/controls";
import { mapTypeSelector } from "../selectors/maptype";
import { dashboardResource } from '../selectors/dashboard';
/**
 * Share Plugin allows to share the current URL (location.href) in some different ways.
 * You can share it on socials networks(facebook,twitter,google+,linkedIn)
 * copying the direct link
 * copying the embedded code
 * using the QR code with mobile apps
 * @class
 * @memberof plugins
 * @prop {node} [title] the title of the page
 * @prop {string} [shareUrlRegex] reqular expression to parse the shareUrl to generate the final url, using shareUrlReplaceString
 * @prop {string} [shareUrlReplaceString] expression to be replaced by groups of the shareUrlRegex to get the final shareUrl to use for the iframe
 * @prop {object} [embedOptions] options for the iframe version of embedded share options
 * @prop {boolean} [embedOptions.showTOCToggle] true by default, set to false to hide the "show TOC" toggle.
 * @prop {boolean} [showAPI] default true, if false, hides the API entry of embed.
 * @prop {function} [onClose] function to call on close window event.
 * @prop {function} [getCount] function used to get the count for social links.
 * @prop {object} [cfg.advancedSettings] show advanced settings (bbox param, centerAndZoom param or home button) f.e {bbox: true, homeButton: true, centerAndZoom: true}
 * @prop {boolean} [cfg.advancedSettings.bbox] if true, the share url is generated with the bbox param
 * @prop {boolean} [cfg.advancedSettings.centerAndZoom] if true, the share url is generated with the center and zoom params
 * @prop {string} [cfg.advancedSettings.defaultEnabled] the value can either be "bbox", "centerAndZoom", "markerAndZoom". Based on the value, the checkboxes corresponding to the param will be enabled by default
 * @prop {string} [cfg.advancedSettings.hideInTab] based on the value (i.e value can be "link" or "social" or "embed"), the advancedSettings is hidden in the tab value specified
 * For example this will display marker, coordinates and zoom fields with the marker enabled by default generating share url with respective params
 * ```
 * "cfg": {
 *    "advancedSettings" : {
 *       "bbox": true,
 *       "centerAndZoom": true,
 *       "defaultEnabled": "markerAndZoom"
 *    }
 *  }
 * ```
 */

const Share = connect(createSelector([
    shareSelector,
    versionSelector,
    mapSelector,
    mapTypeSelector,
    currentContextSelector,
    state => get(state, 'controls.share.settings', {}),
    (state) => state.mapInfo && state.mapInfo.formatCoord || ConfigUtils.getConfigProp("defaultCoordinateFormat"),
    state => state.search && state.search.markerPosition || {},
    updateUrlOnScrollSelector,
    state => get(state, 'map.present.viewerOptions'),
    state => {
        const map = mapSelector(state);
        // get the camera position available in the 3D mode
        const cameraPosition = map?.viewerOptions?.cameraPosition;
        const center = cameraPosition
            ? [cameraPosition.longitude, cameraPosition.latitude]
            : map?.center;
        return center && ConfigUtils.getCenter(center);
    },
    state => get(state, 'controls.share.resource.shareUrl') || location.href,
    state => get(state, 'controls.share.resource.categoryName')
], (isVisible, version, map, mapType, context, settings, formatCoords, point, isScrollPosition, viewerOptions, center, shareUrl, categoryName) => ({
    isVisible,
    shareUrl,
    shareApiUrl: getApiUrl(shareUrl),
    shareConfigUrl: getConfigUrl(shareUrl, ConfigUtils.getConfigProp('geoStoreUrl')),
    version,
    viewerOptions,
    mapType,
    bbox: isVisible && map && map.bbox && getExtentFromViewport(map.bbox),
    center,
    zoom: map && map.zoom,
    showAPI: !context,
    embedOptions: {
        showTOCToggle: !context
    },
    settings,
    advancedSettings: {
        bbox: true,
        centerAndZoom: true
    },
    formatCoords: formatCoords,
    point,
    isScrollPosition,
    categoryName})), {
    onClose: toggleControl.bind(null, 'share', null),
    hideMarker,
    updateMapView,
    onUpdateSettings: setControlProperty.bind(null, 'share', 'settings'),
    onChangeFormat: changeFormat,
    addMarker: addMarker,
    onClearShareResource: setControlProperty.bind(null, 'share', 'resource', undefined)
})(({ categoryName, ...props }) => {
    const categoryCfg = props[categoryName];
    return <SharePanel {...props} {...categoryCfg} />;
});

const ActionCardShareButton = connect(
    () => ({}),
    {
        onToggle: toggleControl.bind(null, 'share', null),
        setShareResource: setControlProperty.bind(null, 'share', 'resource')
    }
)(({
    resource,
    viewerUrl,
    onToggle,
    setShareResource,
    component
}) => {
    const Component = component;
    function handleToggle() {
        const baseURL = location && (location.origin + location.pathname);
        const shareUrl = baseURL + viewerUrl;
        setShareResource({
            shareUrl,
            categoryName: (resource?.category?.name || '').toLowerCase()
        });
        onToggle();
    }
    return (<Component
        iconType="glyphicon"
        glyph="share-alt"
        labelId="share.title"
        onClick={handleToggle}
    />);
});

const shareButtonSelector = createSelector([
    mapIdSelector,
    dashboardResource,
    geostoryResourceSelector
], (mapId, dashboard, geostory) => {
    return {
        style: mapId || dashboard?.id || geostory?.id ? { } : { display: 'none' }
    };
});

const SharePlugin = createPlugin('Share', {
    component: Share,
    containers: {
        BurgerMenu: {
            name: 'share',
            position: 1000,
            priority: 2,
            doNotHide: true,
            text: <Message msgId="share.title"/>,
            tooltip: "share.tooltip",
            icon: <Glyphicon glyph="share-alt"/>,
            action: toggleControl.bind(null, 'share', null),
            selector: shareButtonSelector
        },
        SidebarMenu: {
            name: 'share',
            position: 1000,
            priority: 1,
            doNotHide: true,
            tooltip: "share.tooltip",
            text: <Message msgId="share.title"/>,
            icon: <Glyphicon glyph="share-alt"/>,
            action: toggleControl.bind(null, 'share', null),
            toggle: true,
            selector: shareButtonSelector
        },
        Toolbar: {
            name: 'share',
            alwaysVisible: true,
            position: 2,
            priority: 0,
            doNotHide: true,
            tooltip: "share.title",
            icon: <Glyphicon glyph="share-alt"/>,
            action: toggleControl.bind(null, 'share', null),
            selector: shareButtonSelector
        },
        ResourcesGrid: {
            priority: 1,
            target: 'card-options',
            doNotHide: true,
            Component: ActionCardShareButton,
            position: 1
        }
    },
    epics: shareEpics,
    reducers: { controls }
});

export default SharePlugin;
