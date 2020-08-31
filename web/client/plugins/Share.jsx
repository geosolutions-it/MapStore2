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
import ShareUtils from '../utils/ShareUtils';
import {getExtentFromViewport} from '../utils/CoordinatesUtils';
import { versionSelector } from '../selectors/version';
import * as shareEpics from '../epics/queryparams';
import SharePanel from '../components/share/SharePanel';
import { createSelector } from 'reselect';
import { mapSelector } from '../selectors/map';
import { currentContextSelector } from '../selectors/context';
import { get } from 'lodash';
import controls from '../reducers/controls';
import {featureInfoClick, changeFormat, hideMapinfoMarker} from '../actions/mapInfo';
import { clickPointSelector} from '../selectors/mapInfo';
import { updateUrlOnScrollSelector } from '../selectors/geostory';
/**
 * Share Plugin allows to share the current URL (location.href) in some different ways.
 * You can share it on socials networks(facebook,twitter,google+,linkedin)
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
 * @prop {object} [advancedSettings] show advanced settings (bbox param or home button) f.e {bbox: true, homeButton: true}
 * @prop {boolean} []
 */

const Share = connect(createSelector([
    state => state.controls && state.controls.share && state.controls.share.enabled,
    versionSelector,
    mapSelector,
    currentContextSelector,
    state => get(state, 'controls.share.settings', {}),
    (state) => state.mapInfo && state.mapInfo.formatCoord || ConfigUtils.getConfigProp("defaultCoordinateFormat"),
    clickPointSelector,
    updateUrlOnScrollSelector
], (isVisible, version, map, context, settings, formatCoords, point, isScrollPosition) => ({
    isVisible,
    shareUrl: location.href,
    shareApiUrl: ShareUtils.getApiUrl(location.href),
    shareConfigUrl: ShareUtils.getConfigUrl(location.href, ConfigUtils.getConfigProp('geoStoreUrl')),
    version,
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
    isScrollPosition
})), {
    onClose: toggleControl.bind(null, 'share', null),
    hideMarker: hideMapinfoMarker,
    onUpdateSettings: setControlProperty.bind(null, 'share', 'settings'),
    onSubmitClickPoint: featureInfoClick,
    onChangeFormat: changeFormat
})(SharePanel);

export const SharePlugin = assign(Share, {
    disablePluginIf: "{state('router') && (state('router').endsWith('new') || state('router').includes('newgeostory') || state('router').endsWith('dashboard'))}",
    BurgerMenu: {
        name: 'share',
        position: 1000,
        text: <Message msgId="share.title"/>,
        icon: <Glyphicon glyph="share-alt"/>,
        action: toggleControl.bind(null, 'share', null)
    }
});

export const reducers = { controls };
export const epics = shareEpics;
