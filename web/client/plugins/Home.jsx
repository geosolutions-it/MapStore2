/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const assign = require('object-assign');

const {goToPage} = require('../actions/router');
const { comparePendingChanges } = require('../epics/pendingChanges');


const Message = require('./locale/Message');

const {Glyphicon} = require('react-bootstrap');

const Home = require('../components/home/Home');

const {connect} = require('react-redux');
const { checkPendingChanges } = require('../actions/pendingChanges');
const {setControlProperty} = require('../actions/controls');
const {unsavedMapSelector, unsavedMapSourceSelector} = require('../selectors/controls');
const {feedbackMaskSelector} = require('../selectors/feedbackmask');
const ConfigUtils = require('../utils/ConfigUtils');

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
        || feedbackMaskSelector(state).currentPage === 'geostory')
}), {
    onCheckMapChanges: checkUnsavedMapChanges,
    onCloseUnsavedDialog: setControlProperty.bind(null, 'unsavedMap', 'enabled', false)
})(Home);

module.exports = {
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
