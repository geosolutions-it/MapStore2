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
import version from '../../reducers/version';
import { aboutSelector } from '../../selectors/controls';
import {
    versionSelector,
    commitSelector,
    messageSelector,
    dateSelector
} from '../../selectors/version';


const About = connect((state) => ({
    version: versionSelector(state),
    commit: commitSelector(state),
    message: messageSelector(state),
    date: dateSelector(state),
    enabled: aboutSelector(state),
    withButton: false
}), {
    onClose: toggleControl.bind(null, 'about', null)
})(AboutComp);

const AboutNavBarButton = connect(() => ({}), { onClick: toggleControl.bind(null, 'about', null) })(({ component, onClick }) => {
    const Component = component;
    return (
        <Component
            labelId="about_title"
            glyph="info-sign"
            onClick={() => onClick()}
        />
    );
});


/**
 * Plugin for the "About" window in mapstore.
 * @name About
 * @class
 * @memberof plugins
 * @prop {string} cfg.githubUrl base url to the github tree project, default is "". It will generate a url like "https://github.com/GITHUB_USER/REPO_NAME/tree/COMMIT_SHA"
 * @prop {boolean} cfg.showVersionInfo a flag that resposible for show/hide the version section in About plugin
 * @prop {boolean} cfg.showAboutContent a flag that resposible for show/hide the content section of About plugin
 *
 * @example
 * {
 *   "cfg" : {
 *     githubUrl: "https://github.com/GITHUB_USER/REPO_NAME/tree/"
 *   }
 * }
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
            },
            BrandNavbar: {
                target: 'right-menu',
                doNotHide: true,
                priority: 3,
                position: 0,
                Component: AboutNavBarButton
            }
        }),
    reducers: {
        version
    }
};
