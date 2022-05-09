/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import assign from 'object-assign';
import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import { connect } from 'react-redux';

import { toggleControl } from '../../actions/controls';
import Message from '../../components/I18N/Message';
import AboutComp from '../components/viewer/about/About';

const About = connect((state) => ({
    enabled: state.controls && state.controls.about && state.controls.about.enabled || false,
    withButton: false
}), {
    onClose: toggleControl.bind(null, 'about', null)
})(AboutComp);


/**
 * Plugin for the "About" window in mapstore.
 * @name About
 * @class
 * @memberof plugins
 */
export default {
    AboutPlugin: assign(About,
        {
            BurgerMenu: {
                name: 'about',
                position: 1500,
                tooltip: "aboutTooltip",
                text: <Message msgId="about_title"/>,
                icon: <Glyphicon glyph="info-sign"/>,
                action: toggleControl.bind(null, 'about', null),
                priority: 2,
                doNotHide: true
            },
            SidebarMenu: {
                name: 'about',
                position: 1500,
                tooltip: "aboutTooltip",
                text: <Message msgId="about_title"/>,
                icon: <Glyphicon glyph="info-sign"/>,
                action: toggleControl.bind(null, 'about', null),
                priority: 1,
                doNotHide: true,
                toggle: true
            }
        }),
    reducers: {}
};
