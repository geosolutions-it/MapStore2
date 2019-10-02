/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');
const Message = require('../../components/I18N/Message');
const {toggleControl} = require('../../actions/controls');

const About = connect((state) => ({
    enabled: state.controls && state.controls.about && state.controls.about.enabled || false,
    withButton: false
}), {
    onClose: toggleControl.bind(null, 'about', null)
})(require('../components/viewer/about/About'));

const assign = require('object-assign');
const {Glyphicon} = require('react-bootstrap');

module.exports = {
    AboutPlugin: assign(About,
        {
            BurgerMenu: {
                name: 'about',
                position: 1500,
                text: <Message msgId="about_title"/>,
                icon: <Glyphicon glyph="info-sign"/>,
                action: toggleControl.bind(null, 'about', null),
                priority: 1,
                doNotHide: true
            }
        }),
    reducers: {}
};
