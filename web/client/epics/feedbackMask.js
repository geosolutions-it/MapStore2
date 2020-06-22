
/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const Rx = require('rxjs');
const {split, get, isNil} = require('lodash');
const { LOCATION_CHANGE, push } = require('connected-react-router');

const {FEEDBACK_MASK_ENABLED, DETECTED_NEW_PAGE, feedbackMaskLoading, feedbackMaskLoaded, feedbackMaskEnabled, detectedNewPage} = require('../actions/feedbackMask');
const { LOGIN_SUCCESS, LOGOUT, LOGIN_PROMPT_CLOSED, loginRequired } = require('../actions/security');
const {LOAD_DASHBOARD, DASHBOARD_LOADED, DASHBOARD_LOAD_ERROR} = require('../actions/dashboard');
const { LOAD_GEOSTORY, GEOSTORY_LOADED, LOAD_GEOSTORY_ERROR } = require('../actions/geostory');
const { LOAD_CONTEXT, LOAD_FINISHED, CONTEXT_LOAD_ERROR } = require('../actions/context');
const {START_RESOURCE_LOAD: LOAD_CONTEXT_CONTEXTCREATOR, LOAD_FINISHED: LOAD_FINISHED_CONTEXTCREATOR,
    CONTEXT_LOAD_ERROR: CONTEXT_LOAD_ERROR_CONTEXTCREATOR} = require('../actions/contextcreator');
const {INIT_MAP} = require('../actions/map');
const {MAP_CONFIG_LOADED, MAP_CONFIG_LOAD_ERROR, MAP_INFO_LOAD_ERROR} = require('../actions/config');

const {mapSelector} = require('../selectors/map');
const {isLoggedIn} = require('../selectors/security');
const {isSharedStory} = require('../selectors/geostory');
const {pathnameSelector} = require('../selectors/router');


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
        .switchMap(({disableFeedbackMask}) => {
            const loadActions = [MAP_CONFIG_LOADED, MAP_CONFIG_LOAD_ERROR];
            const isEnabled = ({type}) => type === MAP_CONFIG_LOAD_ERROR;
            const updateObservable = updateVisibility(action$, loadActions, isEnabled, 'map');
            return disableFeedbackMask ? Rx.Observable.empty() : Rx.Observable.merge(
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
 * Enabled/disabled mask based on geostory load feedback, in case of error enable feedbackMask.
 * @param {Observable} action$ stream of actions. Manages `LOAD_GEOSTORY, `GEOSTORY_LOADED`, `GEOSTORY_LOAD_ERROR`, `LOGIN_SUCCESS`, `LOGOUT`, `LOCATION_CHANGE`
 * @memberof epics.feedbackMask
 * @return {Observable}
 */
const updateGeoStoryFeedbackMaskVisibility = action$ =>
    action$.ofType(LOAD_GEOSTORY)
        .switchMap(() => {
            const loadActions = [GEOSTORY_LOADED, LOAD_GEOSTORY_ERROR];
            const isEnabled = ({ type }) => type === LOAD_GEOSTORY_ERROR;
            const updateObservable = updateVisibility(action$, loadActions, isEnabled, 'geostory');
            return Rx.Observable.merge(
                updateObservable,
                action$.ofType(LOGIN_SUCCESS, LOGOUT, LOCATION_CHANGE)
                    .switchMap(() => updateObservable)
                    .takeUntil(action$.ofType(DETECTED_NEW_PAGE))
            );
        });

/**
 * Enabled/disabled mask based on context load feedback, in case of error enable feedbackMask.
 * @param {Observable} action$ stream of actions. Manages `LOAD_CONTEXT, `LOAD_FINISHED`, `CONTEXT_LOAD_ERROR`, `MAP_CONFIG_LOAD_ERROR`, `MAP_INFO_LOAD_ERROR`, `LOGIN_SUCCESS`, `LOGOUT`, `LOCATION_CHANGE`
 * @memberof epics.feedbackMask
 * @return {Observable}
 */
const updateContextFeedbackMaskVisibility = action$ =>
    action$.ofType(LOAD_CONTEXT)
        .switchMap(() => {
            const loadActions = [LOAD_FINISHED, CONTEXT_LOAD_ERROR, MAP_CONFIG_LOAD_ERROR, MAP_INFO_LOAD_ERROR];
            const isEnabled = ({ type }) => type === MAP_CONFIG_LOAD_ERROR || type === CONTEXT_LOAD_ERROR
                || type === MAP_INFO_LOAD_ERROR; // TODO: handle context config error
            const updateObservable = updateVisibility(action$, loadActions, isEnabled, 'context');
            return Rx.Observable.merge(
                updateObservable,
                action$.ofType(LOGIN_SUCCESS, LOGOUT, LOCATION_CHANGE)
                    .switchMap(() => updateObservable)
                    .takeUntil(action$.ofType(DETECTED_NEW_PAGE))
            );
        });

/**
 * Enabled/disabled mask based on context load feedback in context creator, in case of error enable feedbackMask.
 * @param {Observable} action$ stream of actions. Manages `LOAD_CONTEXT, `LOAD_FINISHED`, `CONTEXT_LOAD_ERROR`, `LOGIN_SUCCESS`, `LOGOUT`, `LOCATION_CHANGE`
 * @memberof epics.feedbackMask
 * @return {Observable}
 */
const updateContextCreatorFeedbackMaskVisibility = action$ =>
    action$.ofType(LOAD_CONTEXT_CONTEXTCREATOR)
        .switchMap(() => {
            const loadActions = [LOAD_FINISHED_CONTEXTCREATOR, CONTEXT_LOAD_ERROR_CONTEXTCREATOR];
            const isEnabled = ({ type }) => type === CONTEXT_LOAD_ERROR_CONTEXTCREATOR;
            const updateObservable = updateVisibility(action$, loadActions, isEnabled, 'context');
            return Rx.Observable.merge(
                updateObservable,
                action$.ofType(LOGIN_SUCCESS, LOGOUT)
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
            const pathname = action.payload && action.payload.location && action.payload.location.pathname;
            const currentPage = !isNil(pathname) && split(pathname, '/')[1];
            const oldPage = get(store.getState(), 'feedbackMask.currentPage');
            // verify if it's a text to avoid id number (eg. embedded)
            return isNaN(parseFloat(currentPage)) && currentPage !== oldPage;
        })
        .switchMap(action => Rx.Observable.of(
            feedbackMaskLoaded(),
            feedbackMaskEnabled(false),
            detectedNewPage(split(action.payload.location.pathname, '/')[1])
        ));

/**
 * Prompts login when page some resource is not accessible and you're not logged in.
 * @param {stream} action$ the action stream
 */
const feedbackMaskPromptLogin = (action$, store) => // TODO: separate login required logic (403) condition from feedback mask
    action$.ofType(MAP_CONFIG_LOAD_ERROR, DASHBOARD_LOAD_ERROR, LOAD_GEOSTORY_ERROR, CONTEXT_LOAD_ERROR, CONTEXT_LOAD_ERROR_CONTEXTCREATOR)
        .filter((action) => action.error
            && action.error.status === 403
            && (pathnameSelector(store.getState()).indexOf("new") === -1 // new map has different handling (see redirectUnauthorizedUserOnNewMap, TODO: uniform different behaviour)
                || pathnameSelector(store.getState()).indexOf("newgeostory") >= 0)) // geostory can use this (that is the same of the dashboard)
        .filter(() => !isLoggedIn(store.getState()) && !isSharedStory(store.getState()))
        .exhaustMap(
            () =>
                Rx.Observable.of(loginRequired()) // prompt login
                    .concat(
                        action$.ofType(LOGIN_PROMPT_CLOSED) // then if for login close
                            .take(1)
                            .switchMap(() => Rx.Observable.of(feedbackMaskLoading(), push('/'))) // go to home page

                    ).takeUntil(action$.ofType(LOGIN_SUCCESS, LOCATION_CHANGE))
        );

/**
 * Epics for feedbackMask functionality
 * @name epics.feedbackMask
 * @type {Object}
 */
module.exports = {
    updateMapVisibility,
    updateContextFeedbackMaskVisibility,
    updateContextCreatorFeedbackMaskVisibility,
    updateDashboardVisibility,
    updateGeoStoryFeedbackMaskVisibility,
    detectNewPage,
    feedbackMaskPromptLogin
};
