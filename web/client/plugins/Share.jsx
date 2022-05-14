/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { connect } from '../utils/PluginsUtils';
import assign from 'object-assign';
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
import { mapSelector } from '../selectors/map';
import { currentContextSelector } from '../selectors/context';
import { get } from 'lodash';
import controls from '../reducers/controls';
import { changeFormat } from '../actions/mapInfo';
import { addMarker, hideMarker } from '../actions/search';
import { updateMapView } from '../actions/map';
import { updateUrlOnScrollSelector } from '../selectors/geostory';
import { shareSelector } from "../selectors/controls";
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
    currentContextSelector,
    state => get(state, 'controls.share.settings', {}),
    (state) => state.mapInfo && state.mapInfo.formatCoord || ConfigUtils.getConfigProp("defaultCoordinateFormat"),
    state => state.search && state.search.markerPosition || {},
    updateUrlOnScrollSelector,
    state => get(state, 'map.present.viewerOptions')
], (isVisible, version, map, context, settings, formatCoords, point, isScrollPosition, viewerOptions) => ({
    isVisible,
    shareUrl: location.href,
    shareApiUrl: getApiUrl(location.href),
    shareConfigUrl: getConfigUrl(location.href, ConfigUtils.getConfigProp('geoStoreUrl')),
    version,
    viewerOptions,
    bbox: isVisible && map && map.bbox && getExtentFromViewport(map.bbox),
    center: map && map.center && ConfigUtils.getCenter(map.center),
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
    isScrollPosition})), {
    onClose: toggleControl.bind(null, 'share', null),
    hideMarker,
    updateMapView,
    onUpdateSettings: setControlProperty.bind(null, 'share', 'settings'),
    onChangeFormat: changeFormat,
    addMarker: addMarker
})(SharePanel);

export const SharePlugin = assign(Share, {
    disablePluginIf: "{state('router') && (state('router').endsWith('new') || state('router').includes('newgeostory') || state('router').endsWith('dashboard'))}",
    BurgerMenu: {
        name: 'share',
        position: 1000,
        priority: 2,
        doNotHide: true,
        text: <Message msgId="share.title"/>,
        tooltip: "share.tooltip",
        icon: <Glyphicon glyph="share-alt"/>,
        action: toggleControl.bind(null, 'share', null)
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
        toggle: true
    },
    Toolbar: {
        name: 'share',
        alwaysVisible: true,
        position: 2,
        priority: 0,
        doNotHide: true,
        tooltip: "share.title",
        icon: <Glyphicon glyph="share-alt"/>,
        action: toggleControl.bind(null, 'share', null)
    }
});

export const reducers = { controls };
export const epics = shareEpics;
