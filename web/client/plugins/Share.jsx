/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

 /************** DESCRIPTION OF COMPONENT **************
 * This component it is part of the plugin container
 * containing an icon and a text.
 * it shares a map in 4 different ways:
 * 1) social network
 * 2) direct link
 * 3) embed code
 * 4) qr code
*/

const React = require('react');

const {connect} = require('react-redux');
const assign = require('object-assign');
const {Glyphicon} = require('react-bootstrap');
const Message = require('../components/I18N/Message');
const {toggleControl} = require('../actions/controls');

const Share = connect((state) => ({
    isVisible: state.controls && state.controls.share && state.controls.share.enabled,
    shareUrl: "www.google.it"
}), {
    toggleControl: toggleControl.bind(null, 'share', null)
})(require('../components/share/SharePanel'));

module.exports = {
    SharePlugin: assign(Share, {
        BurgerMenu: {
            name: 'share',
            position: 1000,
            text: <Message msgId="share.title"/>,
            icon: <Glyphicon glyph="paperclip"/>,
            action: toggleControl.bind(null, 'share', null)
        }
    })
};
