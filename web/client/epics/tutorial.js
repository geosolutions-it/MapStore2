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
const {TOGGLE_3D} = require('../actions/globeswitcher');
const preset = require('../plugins/tutorial/preset');
const defaultRegex = /\/(viewer)\/(\w+)\/(\d+)/;
const findMapType = path => path.match(defaultRegex) && path.replace(defaultRegex, "$2");
import { UPDATE_LOCATION } from 'react-router-redux';

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
 * @param {external:Observable} action$ manages `UPDATE_LOCATION`
 * @return {external:Observable}
 */

const switchTutorialEpic = (action$, store) =>
    action$.ofType(UPDATE_LOCATION)
        .audit(() => action$.ofType(CHANGE_MAP_VIEW))
        .filter(action =>
            action.payload
            && action.payload.pathname
            && action.payload.pathname.match(defaultRegex))
        .switchMap( (action) => {
            const path = findMapType(action.payload.pathname);
            const browser = store.getState().browser;
            const mobile = browser && browser.mobile ? '_mobile' : '';
            return Rx.Observable.of(preset[path + mobile + '_tutorial'] ?
                setupTutorial(path + mobile, preset[path + mobile + '_tutorial']) :
                setupTutorial('default' + mobile, preset['default' + mobile + '_tutorial'])
            );
        });

/**
 * Epics for Tutorial
 * @name epics.tutorial
 * @type {Object}
 */

module.exports = {
    closeTutorialEpic,
    switchTutorialEpic
};
