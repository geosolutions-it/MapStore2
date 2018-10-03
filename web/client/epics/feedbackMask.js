
/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const Rx = require('rxjs');
const {split, get, isNil} = require('lodash');
const {FEEDBACK_MASK_ENABLED, DETECTED_NEW_PAGE, feedbackMaskLoading, feedbackMaskLoaded, feedbackMaskEnabled, detectedNewPage} = require('../actions/feedbackMask');
const {LOAD_DASHBOARD, DASHBOARD_LOADED, DASHBOARD_LOAD_ERROR} = require('../actions/dashboard');
const {INIT_MAP} = require('../actions/map');
const {MAP_CONFIG_LOADED, MAP_CONFIG_LOAD_ERROR} = require('../actions/config');
const {mapSelector} = require('../selectors/map');
const {LOCATION_CHANGE} = require('react-router-redux');
const {LOGIN_SUCCESS, LOGOUT} = require('../actions/security');

/**
 * Enabled/disabled mask based on map load feedback, in case of error enable feedbackMask.
 * @param {Observable} action$ stream of actions. Manages `INIT_MAP`, `MAP_CONFIG_LOADED`, `MAP_CONFIG_LOAD_ERROR`, `LOGIN_SUCCESS`, `LOGOUT`
 * @param {Array} loadActions array of actions to control
 * @param {Function} isEnabled needs to return true or false to update the enabled state of feedbackMask
 * @param {Function} mode declare mode to display the mask (map or dashboard)
 * @memberof epics.feedbackMask
 * @return {Observable}
 */
const updateVisibility = (action$, loadActions, isEnabled = () => {}, mode) =>
    Rx.Observable.concat(
        Rx.Observable.of(feedbackMaskLoading(mode)),
        action$.ofType(...loadActions)
            .switchMap(action => {
                return Rx.Observable.of(
                    feedbackMaskLoaded(),
                    feedbackMaskEnabled(isEnabled(action), action.error)
                );
            })
            .takeUntil(action$.ofType(FEEDBACK_MASK_ENABLED))
    );

/**
 * Enabled/disabled mask based on map load feedback, in case of error enable feedbackMask.
 * @param {Observable} action$ stream of actions. Manages `INIT_MAP`, `MAP_CONFIG_LOADED`, `MAP_CONFIG_LOAD_ERROR`, `LOGIN_SUCCESS`, `LOGOUT`
 * @memberof epics.feedbackMask
 * @return {Observable}
 */
const updateMapVisibility = (action$, store) =>
    action$.ofType(INIT_MAP)
        .switchMap(() => {
            const loadActions = [MAP_CONFIG_LOADED, MAP_CONFIG_LOAD_ERROR];
            const isEnabled = ({type}) => type === MAP_CONFIG_LOAD_ERROR;
            const updateObservable = updateVisibility(action$, loadActions, isEnabled, 'map');
            return Rx.Observable.merge(
                updateObservable,
                action$.ofType(LOGIN_SUCCESS, LOGOUT)
                    .switchMap((action) =>
                        action.type === LOGIN_SUCCESS && !mapSelector(store.getState()) && updateObservable
                        || action.type === LOGOUT && updateObservable
                        || Rx.Observable.empty())
                    .takeUntil(action$.ofType(DETECTED_NEW_PAGE))
            );
        });

/**
 * Enabled/disabled mask based on dashboard load feedback, in case of error enable feedbackMask.
 * @param {Observable} action$ stream of actions. Manages `LOAD_DASHBOARD`, `DASHBOARD_LOADED`, `DASHBOARD_LOAD_ERROR`, `LOGIN_SUCCESS`, `LOGOUT`, `LOCATION_CHANGE`
 * @memberof epics.feedbackMask
 * @return {Observable}
 */
const updateDashboardVisibility = action$ =>
    action$.ofType(LOAD_DASHBOARD)
        .switchMap(() => {
            const loadActions = [DASHBOARD_LOADED, DASHBOARD_LOAD_ERROR];
            const isEnabled = ({type}) => type === DASHBOARD_LOAD_ERROR;
            const updateObservable = updateVisibility(action$, loadActions, isEnabled, 'dashboard');
            return Rx.Observable.merge(
                updateObservable,
                action$.ofType(LOGIN_SUCCESS, LOGOUT, LOCATION_CHANGE)
                    .switchMap(() => updateObservable)
                    .takeUntil(action$.ofType(DETECTED_NEW_PAGE))
            );
        });

/**
 * Detect if the page has changed, if so it will stop loading and disable feedbackMask state.
 * It needed to stop nested stream of updateDashboardVisibility and updateMapVisibility
 * @param {Observable} action$ stream of actions. Manages `LOCATION_CHANGE`
 * @memberof epics.feedbackMask
 * @return {Observable}
 */
const detectNewPage = (action$, store) =>
    action$.ofType(LOCATION_CHANGE)
    .filter(action => {
        const pathname = action.payload && action.payload.pathname;
        const currentPage = !isNil(pathname) && split(pathname, '/')[1];
        const oldPage = get(store.getState(), 'feedbackMask.currentPage');
        // verify if it's a text to avoid id number (eg. embedded)
        return isNaN(parseFloat(currentPage)) && currentPage !== oldPage;
    })
    .switchMap(action => Rx.Observable.of(
        feedbackMaskLoaded(),
        feedbackMaskEnabled(false),
        detectedNewPage(split(action.payload.pathname, '/')[1])
    ));
/**
 * Epics for feedbackMask functionality
 * @name epics.feedbackMask
 * @type {Object}
 */
module.exports = {
    updateMapVisibility,
    updateDashboardVisibility,
    detectNewPage
};
