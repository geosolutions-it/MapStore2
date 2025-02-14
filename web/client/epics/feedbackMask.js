
/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Rx from 'rxjs';

import { split, get, isNil } from 'lodash';
import { LOCATION_CHANGE } from 'connected-react-router';

import {
    FEEDBACK_MASK_ENABLED,
    DETECTED_NEW_PAGE,
    feedbackMaskLoading,
    feedbackMaskLoaded,
    feedbackMaskEnabled,
    detectedNewPage
} from '../actions/feedbackMask';

import { LOGIN_SUCCESS, LOGOUT, LOGIN_PROMPT_CLOSED, loginRequired } from '../actions/security';
import { LOAD_DASHBOARD, DASHBOARD_LOADED, DASHBOARD_LOAD_ERROR } from '../actions/dashboard';
import { LOAD_GEOSTORY, GEOSTORY_LOADED, LOAD_GEOSTORY_ERROR } from '../actions/geostory';
import { LOAD_CONTEXT, LOAD_FINISHED, CONTEXT_LOAD_ERROR } from '../actions/context';
import { LOAD_PERMALINK, LOAD_PERMALINK_ERROR, PERMALINK_LOADED } from '../actions/permalink';

import {
    START_RESOURCE_LOAD as LOAD_CONTEXT_CONTEXTCREATOR,
    LOAD_FINISHED as LOAD_FINISHED_CONTEXTCREATOR,
    CONTEXT_LOAD_ERROR as CONTEXT_LOAD_ERROR_CONTEXTCREATOR
} from '../actions/contextcreator';

import { INIT_MAP } from '../actions/map';
import { MAP_CONFIG_LOADED, MAP_CONFIG_LOAD_ERROR, MAP_INFO_LOAD_ERROR } from '../actions/config';
import { mapSelector } from '../selectors/map';
import { isLoggedIn } from '../selectors/security';
import { isSharedStory } from '../selectors/geostory';
import { pathnameSelector } from '../selectors/router';
import { getGeostoryMode } from '../utils/GeoStoryUtils';
import { goToHomePage } from '../actions/router';


/**
 * Enabled/disabled mask based on map load feedback, in case of error enable feedbackMask.
 * @param {Observable} action$ stream of actions. Manages `INIT_MAP`, `MAP_CONFIG_LOADED`, `MAP_CONFIG_LOAD_ERROR`, `LOGIN_SUCCESS`, `LOGOUT`
 * @param {Array} loadActions array of actions to control
 * @param {Function} isEnabled needs to return true or false to update the enabled state of feedbackMask
 * @param {String} mode declare mode to display the mask (map or dashboard)
 * @memberof epics.feedbackMask
 * @return {Observable}
 */
export const updateVisibility = (action$, loadActions, isEnabled = () => {}, mode) =>
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
export const updateMapVisibility = (action$, store) =>
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
export const updateDashboardVisibility = action$ =>
    action$.ofType(LOAD_DASHBOARD)
        .switchMap(() => {
            const loadActions = [DASHBOARD_LOADED, DASHBOARD_LOAD_ERROR];
            const isEnabled = ({type}) => type === DASHBOARD_LOAD_ERROR;
            const mode = window.location.href.match('dashboard-embedded')
                ? 'dashboardEmbedded'
                : 'dashboard';
            const updateObservable = updateVisibility(action$, loadActions, isEnabled, mode);
            return Rx.Observable.merge(
                updateObservable,
                action$.ofType(LOGIN_SUCCESS, LOGOUT, LOCATION_CHANGE)
                    .filter(action => !(action.type === LOCATION_CHANGE && action?.payload?.action === 'REPLACE')) // action REPLACE is used to manage pending changes
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
export const updateGeoStoryFeedbackMaskVisibility = action$ =>
    action$.ofType(LOAD_GEOSTORY)
        .switchMap(() => {
            const loadActions = [GEOSTORY_LOADED, LOAD_GEOSTORY_ERROR];
            const isEnabled = ({ type }) => type === LOAD_GEOSTORY_ERROR;
            const updateObservable = updateVisibility(action$, loadActions, isEnabled, getGeostoryMode());
            return Rx.Observable.merge(
                updateObservable,
                action$.ofType(LOGIN_SUCCESS, LOGOUT, LOCATION_CHANGE)
                    .filter(action => !(action.type === LOCATION_CHANGE && action?.payload?.action === 'REPLACE')) // action REPLACE is used to manage pending changes
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
export const updateContextFeedbackMaskVisibility = action$ =>
    action$.ofType(LOAD_CONTEXT)
        .switchMap(() => {
            const loadActions = [LOAD_FINISHED, CONTEXT_LOAD_ERROR, MAP_CONFIG_LOAD_ERROR, MAP_INFO_LOAD_ERROR];
            const isEnabled = ({ type }) => type === MAP_CONFIG_LOAD_ERROR || type === CONTEXT_LOAD_ERROR
                || type === MAP_INFO_LOAD_ERROR; // TODO: handle context config error
            const updateObservable = updateVisibility(action$, loadActions, isEnabled, 'context');
            return Rx.Observable.merge(
                updateObservable,
                action$.ofType(LOGIN_SUCCESS, LOGOUT, LOCATION_CHANGE)
                    .filter(action => !(action.type === LOCATION_CHANGE && action?.payload?.action === 'REPLACE')) // action REPLACE is used to manage pending changes
                    .switchMap(() => updateObservable)
                    .takeUntil(action$.ofType(DETECTED_NEW_PAGE))
            );
        });

/**
 * Enabled/disabled mask based on permalink load feedback, in case of error enable feedbackMask.
 * @param {Observable} action$ stream of actions. Manages `LOAD_PERMALINK, `PERMALINK_LOADED`, `LOAD_PERMALINK_ERROR`, `LOGIN_SUCCESS`, `LOGOUT`, `LOCATION_CHANGE`
 * @memberof epics.feedbackMask
 * @return {Observable}
 */
export const updatePermalinkFeedbackMaskVisibility = action$ =>
    action$.ofType(LOAD_PERMALINK)
        .switchMap(() => {
            const loadActions = [PERMALINK_LOADED, LOAD_PERMALINK_ERROR];
            const isEnabled = ({ type }) => type === LOAD_PERMALINK_ERROR;
            const updateObservable = updateVisibility(action$, loadActions, isEnabled, "permalink");
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
export const updateContextCreatorFeedbackMaskVisibility = action$ =>
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
export const detectNewPage = (action$, store) =>
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
export const feedbackMaskPromptLogin = (action$, store) => // TODO: separate login required logic (403) condition from feedback mask
    action$.ofType(MAP_CONFIG_LOAD_ERROR, DASHBOARD_LOAD_ERROR, LOAD_GEOSTORY_ERROR, CONTEXT_LOAD_ERROR, CONTEXT_LOAD_ERROR_CONTEXTCREATOR, LOAD_PERMALINK_ERROR)
        .filter((action) => {
            const pathname = pathnameSelector(store.getState());
            return action.error
                && [403].concat([CONTEXT_LOAD_ERROR, LOAD_PERMALINK_ERROR].includes(action.type) ? 404 : []).includes(action.error.status)
                && pathname.indexOf("new") === -1 && !(pathname.match(/dashboard/) !== null && pathname.match(/dashboard\/[0-9]+/) === null); // new map geostory and dashboard has different handling (see redirectUnauthorizedUserOnNewLoadError, TODO: uniform different behaviour)
        })
        .filter(() => !isLoggedIn(store.getState()) && !isSharedStory(store.getState()))
        .exhaustMap(
            () =>
                Rx.Observable.of(loginRequired()) // prompt login
                    .concat(
                        action$.ofType(LOGIN_PROMPT_CLOSED) // then if for login close
                            .take(1)
                            .switchMap(() => Rx.Observable.of(feedbackMaskLoading(), goToHomePage()))

                    ).takeUntil(action$.ofType(LOGIN_SUCCESS, LOCATION_CHANGE))
        );

export const redirectUnauthorizedUserOnNewLoadError = (action$, { getState = () => {}}) =>
    action$.ofType(MAP_CONFIG_LOAD_ERROR, LOAD_GEOSTORY_ERROR, DASHBOARD_LOAD_ERROR)
        .filter((action) => action.error &&
            action.error.status === 403 &&
            (pathnameSelector(getState()).indexOf("new") !== -1 ||
             pathnameSelector(getState()).match(/dashboard\/[0-9]+/) === null &&
             pathnameSelector(getState()).match(/dashboard/) !== null))
        .filter(() => !isLoggedIn(getState()))
        .switchMap(() => Rx.Observable.of(goToHomePage()));

/**
 * Epics for feedbackMask functionality
 * @name epics.feedbackMask
 * @type {Object}
 */
export default {
    updateMapVisibility,
    updateContextFeedbackMaskVisibility,
    updateContextCreatorFeedbackMaskVisibility,
    updateDashboardVisibility,
    updateGeoStoryFeedbackMaskVisibility,
    detectNewPage,
    feedbackMaskPromptLogin,
    redirectUnauthorizedUserOnNewLoadError,
    updatePermalinkFeedbackMaskVisibility
};
