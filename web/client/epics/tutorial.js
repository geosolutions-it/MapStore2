/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';

import {
    START_TUTORIAL,
    UPDATE_TUTORIAL,
    CLOSE_TUTORIAL,
    CHANGE_PRESET,
    closeTutorial,
    setupTutorial
} from '../actions/tutorial';
import { openDetailsPanel } from '../actions/details';
import { MAP_TYPE_CHANGED } from '../actions/maptype';
import { SET_EDITOR_AVAILABLE as DASHBOARD_AVAILABLE} from '../actions/dashboard';
import { TOGGLE_3D } from '../actions/globeswitcher';
import { CHANGE_MODE, GEOSTORY_LOADED } from '../actions/geostory';
import { modeSelector } from '../selectors/geostory';
import { creationStepSelector } from '../selectors/contextcreator';
import { CONTEXT_TUTORIALS, LOAD_FINISHED as CONTEXTCREATOR_LOADED } from '../actions/contextcreator';
import { isEmpty, isArray, isObject } from 'lodash';
import { getApi } from '../api/userPersistedStorage';
import { mapSelector } from './../selectors/map';

/**
 * Closes the tutorial if 3D button has been toggled
 * @memberof epics.tutorial
 * @param {external:Observable} action$ manages `START_TUTORIAL`
 * @return {external:Observable}
 */

export const closeTutorialEpic = (action$) =>
    action$.ofType(START_TUTORIAL)
        .audit(() => action$.ofType(TOGGLE_3D))
        .switchMap(() => Rx.Observable.of(closeTutorial()));

/**
 * Setup new steps based on the current path
 * @memberof epics.tutorial
 * @param {external:Observable} action$ manages `LOCATION_CHANGE`
 * @return {external:Observable}
 */

export const switchTutorialEpic = (action$, store) =>
    action$.ofType(MAP_TYPE_CHANGED, GEOSTORY_LOADED, DASHBOARD_AVAILABLE, CONTEXTCREATOR_LOADED)
        .switchMap((action) => {
            const state = store.getState();
            const presetList = state.tutorial && state.tutorial.presetList || {};
            const browser = state.browser;
            const mobile = browser && browser.mobile ? '_mobile' : '';
            const prevTutorialId = state.tutorial && state.tutorial.id;
            const defaultName = 'default';

            let id;
            let presetName;
            let ignoreDisabled;
            switch (action.type) {
            case 'CONTEXTCREATOR:LOAD_FINISHED':
                const currentStep = creationStepSelector(state) || "general-settings";
                id = CONTEXT_TUTORIALS[currentStep];
                presetName = id;
                ignoreDisabled = prevTutorialId === id;
                break;
            case 'GEOSTORY:GEOSTORY_LOADED':
                // this is needed to setup correct geostory tutorial based on the current mode and page
                id = "geostory";
                if (modeSelector(state) === "edit" || id && id?.indexOf("newgeostory") !== -1) {
                    presetName = `geostory_edit_tutorial`;
                    ignoreDisabled = false;
                } else {
                    presetName = `geostory_view_tutorial`;
                    ignoreDisabled = true;
                }
                break;
            case 'MAP_TYPE_CHANGED':
                id = action.mapType + mobile;
                presetName = id + '_tutorial';
                ignoreDisabled = prevTutorialId === id;
                break;
            case 'DASHBOARD:SET_AVAILABLE':
                // there is a DASHBOARD_LOADED event for existing dashboards, but nothing equivalent for dashboards in creation
                // DASHBOARD:SET_AVAILABLE is fired after opening/leaving an existing dashboards AND after creating/leaving a new dashboard
                id = (action.available) ? 'dashboard' + mobile : defaultName + mobile;
                presetName = id + '_tutorial';
                ignoreDisabled = prevTutorialId === id;
                break;
            default:
                id = defaultName + mobile;
                presetName = id + '_tutorial';
                ignoreDisabled = prevTutorialId === id;
            }

            return !isEmpty(presetList) ? Rx.Observable.of(presetList[presetName] ?
                setupTutorial(id, presetList[presetName], null, null, null, ignoreDisabled) :
                setupTutorial(defaultName + mobile, presetList['default' + mobile + '_tutorial'], null, null, null, prevTutorialId === (defaultName + mobile))
            ) : Rx.Observable.empty();
        });

/**
 * It changes the Geostory tutorial when changing mode only
 * when changing to edit the tutorial is shown if not disabled
*/
export const switchGeostoryTutorialEpic = (action$, store) =>
    action$.ofType(CHANGE_MODE)
        .switchMap(({ mode }) => {
            const id = "geostory";
            const state = store.getState();
            const presetList = state.tutorial && state.tutorial.presetList || {};
            const geostoryMode = `_${mode}`;
            const steps = !isEmpty(presetList) ? presetList[id + geostoryMode + '_tutorial'] : null;
            let isGeostoryTutorialDisabled = false;
            try {
                isGeostoryTutorialDisabled = getApi().getItem("mapstore.plugin.tutorial.geostory.disabled") === "true";
            } catch (e) {
                console.error(e);
            }
            // if no steps are found then do nothing
            return steps ? Rx.Observable.from(
                [
                    setupTutorial(id, steps, null, null, null, mode === "view" || isGeostoryTutorialDisabled)
                ]
            ) : Rx.Observable.empty();
        });


/**
 * Handle changePreset action
 * @param {external:Observable} action$ manages `CHANGE_PRESET`
 * @param {external:Observable} store
 */
export const changePresetEpic = (action$, store) =>
    action$.ofType(CHANGE_PRESET)
        .switchMap(({ preset, presetGroup, ignoreDisabled }) => {
            const state = store.getState();
            const presetList = state.tutorial && state.tutorial.presetList || {};
            const checkbox = state.tutorial && state.tutorial.checkbox;
            const tutorial = presetList[preset];

            return tutorial ?
                Rx.Observable.of(setupTutorial(preset, tutorial, null, checkbox, null, false, presetGroup, ignoreDisabled)) :
                Rx.Observable.empty();
        });

/**
 * Get actions from tutorial steps
 * @memberof epics.tutorial
 * @param {external:Observable} action$ manages `UPDATE_TUTORIAL`
 * @return {external:Observable}
 */

export const getActionsFromStepEpic = (action$) =>
    action$.ofType(UPDATE_TUTORIAL)
        .filter(action => action.tour && action.tour.step && action.tour.step.action && action.tour.step.action[action.tour.action])
        .switchMap((action) => {
            return isArray(action.tour.step.action[action.tour.action]) && Rx.Observable.of(...action.tour.step.action[action.tour.action])
                || isObject(action.tour.step.action[action.tour.action]) && Rx.Observable.of(action.tour.step.action[action.tour.action])
                || Rx.Observable.empty();
        });

/**
 * Epics for Tutorial
 * @name epics.tutorial
 * @type {Object}
 */

export const openDetailsPanelEpic = (action$, store) =>
    action$.ofType(CLOSE_TUTORIAL)
        .filter(() => mapSelector(store.getState())?.info?.detailsSettings?.showAtStartup)
        .switchMap(() => {
            return Rx.Observable.of(openDetailsPanel());
        });


export default {
    closeTutorialEpic,
    switchTutorialEpic,
    getActionsFromStepEpic,
    changePresetEpic,
    switchGeostoryTutorialEpic,
    openDetailsPanelEpic
};
