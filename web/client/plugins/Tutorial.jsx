/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');
const {bindActionCreators} = require('redux');
const {initTutorial, startTutorial, updateTutorial, disableTutorial, resetTutorial, closeTutorial, toggleTutorial} = require('../actions/tutorial');
const presetList = require('./tutorial/preset');
const assign = require('object-assign');
const I18N = require('../components/I18N/I18N');
const {Glyphicon} = require('react-bootstrap');
const {createSelector} = require('reselect');
const {tutorialSelector} = require('../selectors/tutorial');
const {closeTutorialEpic, switchTutorialEpic} = require('../epics/tutorial');

/**
 * Tutorial plugin. Enables the steps of tutorial.
 * @prop {string} cfg.preset overrides the default_tutorial with another from the preset folder
 * @prop {object} cfg.presetList overrides preset list of MapStore2
 * @prop {boolean} cfg.showCheckbox shows/hides checkbox to disable tutorial next autostart
 * @prop {number} cfg.scrollOffset changes the scroll offset
 * @memberof plugins
 * @class Tutorial
 * @example
 * // preset example in localConfig
 * // overrides the default_tutorial with another from the preset folder
 * // by changing the name
 * {
 *  "name": "Tutorial",
 *  "cfg": {
 *   "preset": "home_tutorial"
 *  }
 * }
 *
 * // presetList example in localConfig
 * // overrides preset list of MapStore2
 * // note: set first step selector to ""#intro-tutorial", enables autostart of tutorial
 * {
 *  "name": "Tutorial",
 *  "cfg": {
 *   "presetList": {
 *    "default_tutorial": [
 *     {
 *      "title": "Welcome",
 *      "text": "my intro text",
 *      "selector": "#intro-tutorial"
 *     },
 *     {
 *      "translation": "myTranslation" // id from translation file,
 *      "selector": "#my-first-step-selector"
 *     },
 *     {
 *      "translationHTML": "myTranslationHTML" // id from translation file,
 *      "selector": "#my-first-step-selector"
 *     }
 *    ]
 *   }
 *  }
 * }
 *
 * // translation file example
 * ...
 *  "tutorial": {
 *   ...
 *   "myIntroTranslation": {
 *    "title": "My intro title",
 *    "text": "My intro description"
 *   },
 *    "myTranslation": {
 *    "title": "My first step title",
 *    "text": "My first step description"
 *   },
 *   "mySecondStepTranslation": {
 *    "title": "My second step title",
 *    "text": "My second step description"
 *   },
 *   "myTranslationHTML": {
 *    "title": "<div style="color:blue;">My html step title</div>",
 *    "text": "<div style="color:red;">My html step description</div>"
 *   }
 *   ...
 *  }
 * ...
 */

const tutorialPluginSelector = createSelector([tutorialSelector],
    (tutorial) => ({
        toggle: tutorial.enabled,
        steps: tutorial.steps,
        run: tutorial.run,
        autoStart: tutorial.start,
        status: tutorial.status,
        tourAction: tutorial.tourAction,
        stepIndex: tutorial.stepIndex
    }));

const Tutorial = connect(tutorialPluginSelector, (dispatch) => {
    return {
        actions: bindActionCreators({
            onSetup: initTutorial,
            onStart: startTutorial,
            onUpdate: updateTutorial,
            onDisable: disableTutorial,
            onReset: resetTutorial,
            onClose: closeTutorial
        }, dispatch)
    };
}, (stateProps, dispatchProps, ownProps) => ({
        ...stateProps,
        ...dispatchProps,
        ...ownProps,
        presetList: {
            ...presetList,
            ...ownProps.presetList
        }
}))(require('../components/tutorial/Tutorial'));

module.exports = {
    TutorialPlugin: assign(Tutorial, {
        BurgerMenu: {
            name: 'tutorial',
            position: 1000,
            text: <I18N.Message msgId="tutorial.title"/>,
            icon: <Glyphicon glyph="book"/>,
            action: toggleTutorial,
            priority: 2,
            doNotHide: true
        }
    }),
    reducers: {
        tutorial: require('../reducers/tutorial')
    },
    epics: {
        closeTutorialEpic,
        switchTutorialEpic
    }
};
