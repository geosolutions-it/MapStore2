/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const React = require('react');

const {connect} = require('../utils/PluginsUtils');
const assign = require('object-assign');
const {Glyphicon} = require('react-bootstrap');
const Message = require('../components/I18N/Message');
const {toggleControl} = require('../actions/controls');
const ConfigUtils = require('../utils/ConfigUtils');
const ShareUtils = require('../utils/ShareUtils');

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
 * @prop {getCount} [getCount] function used to get the count for social links.
 */
const Share = connect((state) => ({
    isVisible: state.controls && state.controls.share && state.controls.share.enabled,
    shareUrl: location.href,
    shareApiUrl: ShareUtils.getApiUrl(location.href),
    shareConfigUrl: ShareUtils.getConfigUrl(location.href, ConfigUtils.getConfigProp('geoStoreUrl'))
}), {
    onClose: toggleControl.bind(null, 'share', null)
})(require('../components/share/SharePanel'));

module.exports = {
    SharePlugin: assign(Share, {
        disablePluginIf: "{state('routing') && state('routing').endsWith('new')}",
        BurgerMenu: {
            name: 'share',
            position: 1000,
            text: <Message msgId="share.title"/>,
            icon: <Glyphicon glyph="share-alt"/>,
            action: toggleControl.bind(null, 'share', null)
        }
    })
};
