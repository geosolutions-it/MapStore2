/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import assign from 'object-assign';
import { goToHomePage } from '../actions/router';
import { comparePendingChanges } from '../epics/pendingChanges';
import Message from './locale/Message';
import { Glyphicon } from 'react-bootstrap';
import Home from '../components/home/Home';
import { connect } from 'react-redux';
import {burgerMenuSelector} from '../selectors/controls';

/**
 * Renders a button that redirects to the home page.
 * It can be rendered in {@link #plugins.OmniBar|OmniBar}.
 * Supports as containers at lower priority {@link #plugins.Toolbar|Toolbar}.
 * You can configure the home target path globally by setting `miscSettings.homePath` in `localConfig.json`. By default it redirects to `"#/"`;
 *
 * If you want to show this plugin with BurgerMenu (so without Sidebar), apply the following configuration:
 *
 * ```javascript
 * {
 *     "cfg": {},
 *     "override": {
 *         "OmniBar": {
 *             "priority": 5
 *         }
 *     }
 * }
 * ```
 *
 * @name Home
 * @class
 * @memberof plugins
 */
export default {
    HomePlugin: assign(Home, {
        Toolbar: {
            name: 'home',
            position: 1,
            tooltip: "gohome",
            icon: <Glyphicon glyph="home"/>,
            help: <Message msgId="helptexts.gohome"/>,
            action: goToHomePage,
            priority: 1
        },
        BurgerMenu: {
            name: 'home',
            position: 1,
            text: <Message msgId="gohome"/>,
            icon: <Glyphicon glyph="home"/>,
            action: goToHomePage,
            priority: 2
        },
        OmniBar: {
            name: 'home',
            position: 4,
            tool: connect(() => ({
                bsStyle: 'primary',
                tooltipPosition: 'bottom'
            }))(Home),
            priority: 3
        },
        SidebarMenu: {
            name: 'home',
            position: 1,
            tool: connect(() => ({
                bsStyle: 'tray',
                tooltipPosition: 'left',
                text: <Message msgId="gohome"/>
            }))(Home),
            selector: (state) => ({
                style: { display: burgerMenuSelector(state) ? 'none' : null }
            }),
            priority: 4
        },
        BrandNavbar: {
            target: 'right-menu',
            position: 6,
            priority: 5
        }
    }),
    reducers: {},
    epics: { comparePendingChanges }
};
