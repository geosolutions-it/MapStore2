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
    INIT_TUTORIAL,
    CHANGE_PRESET,
    closeTutorial,
    setupTutorial
} from '../actions/tutorial';
import { openDetailsPanel } from '../actions/details';
import { CHANGE_MAP_VIEW } from '../actions/map';
import { modeSelector } from '../selectors/geostory';
import { CHANGE_MODE } from '../actions/geostory';
import { creationStepSelector } from '../selectors/contextcreator';
import { CONTEXT_TUTORIALS } from '../actions/contextcreator';
import { LOCATION_CHANGE } from 'connected-react-router';
import { isEmpty, isArray, isObject } from 'lodash';
import { getApi } from '../api/userPersistedStorage';
import {REDUCERS_LOADED} from "../actions/storemanager";
import { VISUALIZATION_MODE_CHANGED } from '../actions/maptype';
import { detailsSettingsSelector } from '../selectors/details';

const findTutorialId = path => path.match(/\/(viewer)\/(\w+)\/(\d+)/) && path.replace(/\/(viewer)\/(\w+)\/(\d+)/, "$2")
    || path.match(/\/(\w+)\/(\d+)/) && path.replace(/\/(\w+)\/(\d+)/, "$1")
    || path.match(/\/(\w+)\//) && path.replace(/\/(\w+)\//, "$1");

/**
 * Closes the tutorial if 3D button has been toggled
 * @memberof epics.tutorial
 * @param {external:Observable} action$ manages `START_TUTORIAL`
 * @return {external:Observable}
 */

export const closeTutorialEpic = (action$) =>
    action$.ofType(START_TUTORIAL)
        .audit(() => action$.ofType(VISUALIZATION_MODE_CHANGED))
        .switchMap( () => Rx.Observable.of(closeTutorial()));

/**
 * Setup new steps based on the current path
 * @memberof epics.tutorial
 * @param {external:Observable} action$ manages `LOCATION_CHANGE`, `REDUCERS_LOADED`
 * @param {external:Observable} store
 * @return {external:Observable}
 */

export const switchTutorialEpic = (action$, store) =>
    action$.ofType(LOCATION_CHANGE, REDUCERS_LOADED)
        .filter(action => {
            const state = store.getState();
            return (action.type === LOCATION_CHANGE && state.router?.location?.pathname)
                    || (action.type === REDUCERS_LOADED && action.reducers.includes('tutorial'));
        })
        .switchMap( () =>
            action$.ofType(CHANGE_MAP_VIEW, INIT_TUTORIAL)
                .take(1)
                .switchMap( () => {
                    const state = store.getState();
                    const location = state.router.location;
                    let id = findTutorialId(location.pathname);
                    const presetList = state.tutorial && state.tutorial.presetList || {};
                    const browser = state.browser;
                    const mobile = browser && browser.mobile ? '_mobile' : '';
                    const defaultName = id ? 'default' : location.pathname || 'default';
                    const prevTutorialId = state.tutorial && state.tutorial.id;
                    let presetName = id + mobile + '_tutorial';
                    if (defaultName.indexOf("context") !== -1) {
                        const currentStep = creationStepSelector(state) || "general-settings";
                        const currentPreset = CONTEXT_TUTORIALS[currentStep];
                        return Rx.Observable.of(setupTutorial(currentPreset, presetList[currentPreset], null, null, null, prevTutorialId === (currentPreset)));
                    }
                    if (id && id?.indexOf("geostory") !== -1 && !isEmpty(presetList)) {
                        // this is needed to setup correct geostory tutorial based on the current mode and page
                        if (modeSelector(state) === "edit" || id && id?.indexOf("newgeostory") !== -1) {
                            id  = "geostory";
                            presetName = `geostory_edit_tutorial`;
                            return Rx.Observable.from([
                                setupTutorial(id, presetList[presetName], null, null, null, false)
                            ]);
                        }
                        presetName = `geostory_view_tutorial`;
                        return Rx.Observable.of(setupTutorial(id, presetList[presetName], null, null, null, true));
                    }
                    return !isEmpty(presetList) ? Rx.Observable.of(presetList[presetName] ?
                        setupTutorial(id + mobile, presetList[presetName], null, null, null, prevTutorialId === (id + mobile)) :
                        setupTutorial(defaultName + mobile, presetList['default' + mobile + '_tutorial'], null, null, null, prevTutorialId === (defaultName + mobile))
                    ) : Rx.Observable.empty();
                })
        );

/**
 * It changes the Geostory tutorial when changing mode only
 * when changing to edit the tutorial is shown if not disabled
*/
export const switchGeostoryTutorialEpic = (action$, store) =>
    action$.ofType(CHANGE_MODE)
        .switchMap( ({mode}) => {
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
        .switchMap(({preset, presetGroup, ignoreDisabled}) => {
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
        .switchMap( (action) => {
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
        .filter(() => {
            const state = store.getState();
            let detailsSettings = detailsSettingsSelector(state);
            if (detailsSettings && typeof detailsSettings === 'string') {
                detailsSettings = JSON.parse(detailsSettings);
            }
            return detailsSettings?.showAtStartup;
        })
        .switchMap( () => {
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
