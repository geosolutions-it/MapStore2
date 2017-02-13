/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');
const {bindActionCreators} = require('redux');
const {setupTutorial, startTutorial, updateTutorial, disableTutorial, resetTutorial} = require('../actions/tutorial');
const {toggleControl, setControlProperty} = require('../actions/controls');
const presetList = require('./tutorial/preset');
const assign = require('object-assign');
const I18N = require('../components/I18N/I18N');
const {Glyphicon} = require('react-bootstrap');

const Tutorial = connect((state) => {
    return {
        toggle: state.controls && state.controls.tutorial && state.controls.tutorial.enabled,
        intro: state.tutorial && state.tutorial.intro,
        steps: state.tutorial && state.tutorial.steps,
        run: state.tutorial && state.tutorial.run,
        autoStart: state.tutorial && state.tutorial.start,
        showStepsProgress: state.tutorial && state.tutorial.progress,
        showSkipButton: state.tutorial && state.tutorial.skip,
        nextLabel: state.tutorial && state.tutorial.nextLabel,
        status: state.tutorial && state.tutorial.status,
        presetList
    };
}, (dispatch) => {
    return {
        actions: bindActionCreators({
            onSetup: setupTutorial,
            onStart: startTutorial,
            onUpdate: updateTutorial,
            onDisable: disableTutorial,
            onReset: resetTutorial,
            onClose: setControlProperty.bind(null, 'tutorial', 'enabled', false)
        }, dispatch)
    };
})(require('../components/tutorial/Tutorial'));

module.exports = {
    TutorialPlugin: assign(Tutorial, {
        BurgerMenu: {
            name: 'tutorial',
            position: 1000,
            text: <I18N.Message msgId="tutorial.title"/>,
            icon: <Glyphicon glyph="book"/>,
            action: toggleControl.bind(null, 'tutorial', null),
            priority: 2,
            doNotHide: true
        }
    }),
    reducers: {
        tutorial: require('../reducers/tutorial')
    }
};
