/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Rx = require('rxjs');
const {START_TUTORIAL, UPDATE_TUTORIAL, INIT_TUTORIAL, CHANGE_PRESET, closeTutorial, setupTutorial} = require('../actions/tutorial');
const {CHANGE_MAP_VIEW} = require('../actions/map');
const {MAPS_LIST_LOADED} = require('../actions/maps');
const {TOGGLE_3D} = require('../actions/globeswitcher');
const {modeSelector} = require('../selectors/geostory');
const {CHANGE_MODE} = require('../actions/geostory');
const { creationStepSelector } = require('../selectors/contextcreator');
const { CONTEXT_TUTORIALS } = require('../actions/contextcreator');
const findTutorialId = path => path.match(/\/(viewer)\/(\w+)\/(\d+)/) && path.replace(/\/(viewer)\/(\w+)\/(\d+)/, "$2")
    || path.match(/\/(\w+)\/(\d+)/) && path.replace(/\/(\w+)\/(\d+)/, "$1")
    || path.match(/\/(\w+)\//) && path.replace(/\/(\w+)\//, "$1");
const { LOCATION_CHANGE } = require('connected-react-router');
const {isEmpty, isArray, isObject} = require('lodash');

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
 * Setup new steps based on the current path
 * @memberof epics.tutorial
 * @param {external:Observable} action$ manages `LOCATION_CHANGE`
 * @return {external:Observable}
 */

const switchTutorialEpic = (action$, store) =>
    action$.ofType(LOCATION_CHANGE)
        .filter(action =>
            action.payload
            && action.payload.location
            && action.payload.location.pathname)
        .switchMap( (action) =>
            action$.ofType(MAPS_LIST_LOADED, CHANGE_MAP_VIEW, INIT_TUTORIAL)
                .take(1)
                .switchMap( () => {
                    let id = findTutorialId(action.payload.location.pathname);
                    const state = store.getState();
                    const presetList = state.tutorial && state.tutorial.presetList || {};
                    const browser = state.browser;
                    const mobile = browser && browser.mobile ? '_mobile' : '';
                    const defaultName = id ? 'default' : action.payload && action.payload.location && action.payload.location.pathname || 'default';
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
const switchGeostoryTutorialEpic = (action$, store) =>
    action$.ofType(CHANGE_MODE)
        .switchMap( ({mode}) => {
            const id = "geostory";
            const state = store.getState();
            const presetList = state.tutorial && state.tutorial.presetList || {};
            const geostoryMode = `_${mode}`;
            const steps = !isEmpty(presetList) ? presetList[id + geostoryMode + '_tutorial'] : null;
            const isGeostoryTutorialDisabled = localStorage.getItem("mapstore.plugin.tutorial.geostory.disabled") === "true";
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
const changePresetEpic = (action$, store) =>
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

const getActionsFromStepEpic = (action$) =>
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

module.exports = {
    closeTutorialEpic,
    switchTutorialEpic,
    getActionsFromStepEpic,
    changePresetEpic,
    switchGeostoryTutorialEpic
};
