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


/**
 * Plugin for the "About" window in mapstore.
 * @name About
 * @class
 * @memberof plugins
 * @prop {string} cfg.githubUrl base url to the github tree project, default is "". It will generate a url like "https://github.com/GITHUB_USER/REPO_NAME/tree/COMMIT_SHA"
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
            }
        }),
    reducers: {
        version
    }
};
