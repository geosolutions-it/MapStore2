/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

 /************** DESCRIPTION OF COMPONENT **************
 The share plugin should provide functionalities to:
 1. Share the map on social networks: Facebook, Twitter (linkedin and Google+ is a plus)
 2. Copy the unique link to the map.
 3. Copy a code to embed the map in your site (using an iframe).
 4. Using QR-Code for mobile devices.
*/

const React = require('react');

const {connect} = require('react-redux');
const assign = require('object-assign');
const {Glyphicon} = require('react-bootstrap');
const Message = require('../components/I18N/Message');
const {toggleControl} = require('../actions/controls');
const ConfigUtils = require('../utils/ConfigUtils');

const Url = require('url');


const getEmbeddedUrl = (url) => {
    let urlParsedObj = Url.parse(url, true);

    return urlParsedObj.protocol + '//' + urlParsedObj.host + urlParsedObj.path + "embedded.html#/" +
        urlParsedObj.hash.substring(urlParsedObj.hash.lastIndexOf('/') + 1, urlParsedObj.hash.lastIndexOf('?'));
};

const getApiUrl = (url) => {
    let urlParsedObj = Url.parse(url, true);

    return urlParsedObj.protocol + '//' + urlParsedObj.host + urlParsedObj.path;
};

const getConfigUrl = (url) => {
    let urlParsedObj = Url.parse(url, true);

    return urlParsedObj.protocol + '//' + (urlParsedObj.host + urlParsedObj.path + ConfigUtils.getConfigProp('geoStoreUrl') + 'data/' + urlParsedObj.hash.substring(urlParsedObj.hash.lastIndexOf('/') + 1, urlParsedObj.hash.lastIndexOf('?'))).replace('//', '/');
};

const Share = connect((state) => ({
    isVisible: state.controls && state.controls.share && state.controls.share.enabled,
    shareUrl: location.href,
    shareEmbeddedUrl: getEmbeddedUrl(location.href),
    shareApiUrl: getApiUrl(location.href),
    shareConfigUrl: getConfigUrl(location.href)
}), {
    onClose: toggleControl.bind(null, 'share', null)
})(require('../components/share/SharePanel'));

module.exports = {
    SharePlugin: assign(Share, {
        BurgerMenu: {
            name: 'share',
            position: 1000,
            text: <Message msgId="share.title"/>,
        icon: <Glyphicon glyph="share-alt"/>,
            action: toggleControl.bind(null, 'share', null)
        }
    })
};
