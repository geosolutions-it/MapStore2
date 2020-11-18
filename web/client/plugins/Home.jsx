/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import assign from 'object-assign';
import { goToPage } from '../actions/router';
import { comparePendingChanges } from '../epics/pendingChanges';
import Message from './locale/Message';
import { Glyphicon } from 'react-bootstrap';
import Home from '../components/home/Home';
import { connect } from 'react-redux';
import { checkPendingChanges } from '../actions/pendingChanges';
import { setControlProperty } from '../actions/controls';
import { unsavedMapSelector, unsavedMapSourceSelector } from '../selectors/controls';
import { feedbackMaskSelector } from '../selectors/feedbackmask';
import ConfigUtils from '../utils/ConfigUtils';

const checkUnsavedMapChanges = (action) => {
    return dispatch => {
        dispatch(checkPendingChanges(action, 'gohome'));
    };
};

const HomeConnected = connect((state) => ({
    renderUnsavedMapChangesDialog: ConfigUtils.getConfigProp('unsavedMapChangesDialog'),
    displayUnsavedDialog: unsavedMapSelector(state)
        && unsavedMapSourceSelector(state) === 'gohome'
        && (feedbackMaskSelector(state).currentPage === 'viewer'
        || feedbackMaskSelector(state).currentPage === 'geostory'
        || feedbackMaskSelector(state).currentPage === 'dashboard')
}), {
    onCheckMapChanges: checkUnsavedMapChanges,
    onCloseUnsavedDialog: setControlProperty.bind(null, 'unsavedMap', 'enabled', false)
})(Home);

/**
 * Renders a button that redirects to the home page.
 * It can be rendered in {@link #plugins.OmniBar|OmniBar}.
 * Supports as containers, lower priority, also {@link #plugins.BurgerMenu|BurgerMenu}
 * or {@link #plugins.Toolbar|Toolbar}.
 * @name Home
 * @class
 * @memberof plugins
 */
export default {
    HomePlugin: assign(HomeConnected, {
        Toolbar: {
            name: 'home',
            position: 1,
            tooltip: "gohome",
            icon: <Glyphicon glyph="home"/>,
            help: <Message msgId="helptexts.gohome"/>,
            action: (context) => goToPage('/', context.router),
            priority: 1
        },
        BurgerMenu: {
            name: 'home',
            position: 1,
            text: <Message msgId="gohome"/>,
            icon: <Glyphicon glyph="home"/>,
            action: (context) => goToPage('/', context.router),
            priority: 2
        },
        OmniBar: {
            name: 'home',
            position: 4,
            tool: true,
            action: (context) => goToPage('/', context.router),
            priority: 3
        }
    }),
    reducers: {},
    epics: { comparePendingChanges }
};
