/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Rx = require('rxjs');
const {START_TUTORIAL, closeTutorial, setupTutorial} = require('../actions/tutorial');
const {CHANGE_MAP_VIEW} = require('../actions/map');
const {MAPS_LIST_LOADED} = require('../actions/maps');
const {TOGGLE_3D} = require('../actions/globeswitcher');
const defaultRegex = /\/(viewer)\/(\w+)\/(\d+)/;
const findMapType = path => path.match(defaultRegex) && path.replace(defaultRegex, "$2");
const { LOCATION_CHANGE } = require('react-router-redux');
const {isEmpty} = require('lodash');

/**
 * Closes the tutorial if 3D button has been toggled
 * @memberof epics.tutorial
 * @param {external:Observable} action$ manages `START_TUTORIAL`
 * @return {external:Observable}
 */

const closeTutorialEpic = (action$) =>
    action$.ofType(START_TUTORIAL)
        .audit(() => action$.ofType(TOGGLE_3D))
        .switchMap( () => Rx.Observable.of(closeTutorial()));

/**
 * Setup new steps based on the current maptype
 * @memberof epics.tutorial
 * @param {external:Observable} action$ manages `LOCATION_CHANGE`
 * @return {external:Observable}
 */

const switchTutorialEpic = (action$, store) =>
    action$.ofType(LOCATION_CHANGE)
        .filter(action =>
            action.payload
            && action.payload.pathname)
        .switchMap( (action) =>
            action$.ofType(MAPS_LIST_LOADED, CHANGE_MAP_VIEW)
                .take(1)
                .switchMap( () => {
                    const path = findMapType(action.payload.pathname);
                    const state = store.getState();
                    const presetList = state.tutorial && state.tutorial.presetList || {};
                    const browser = state.browser;
                    const mobile = browser && browser.mobile ? '_mobile' : '';
                    const defaultName = path ? 'default' : action.payload && action.payload.pathname || 'default';
                    return !isEmpty(presetList) ? Rx.Observable.of(presetList[path + mobile + '_tutorial'] ?
                        setupTutorial(path + mobile, presetList[path + mobile + '_tutorial']) :
                        setupTutorial(defaultName + mobile, presetList['default' + mobile + '_tutorial'])
                    ) : Rx.Observable.empty();
                })
        );

/**
 * Epics for Tutorial
 * @name epics.tutorial
 * @type {Object}
 */

module.exports = {
    closeTutorialEpic,
    switchTutorialEpic
};
