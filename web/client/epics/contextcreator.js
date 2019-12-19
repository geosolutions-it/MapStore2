/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';
import axios from 'axios';
import jsonlint from 'jsonlint-mod';
import {omit, flatten, uniq, difference, intersection, head, tail, cloneDeep} from 'lodash';
import {push} from 'connected-react-router';

import ConfigUtils from '../utils/ConfigUtils';
import MapUtils from '../utils/MapUtils';

import {SAVE_CONTEXT, LOAD_CONTEXT, SET_CREATION_STEP, MAP_VIEWER_LOAD, MAP_VIEWER_RELOAD, ENABLE_MANDATORY_PLUGINS, ENABLE_PLUGINS,
    DISABLE_PLUGINS, SAVE_PLUGIN_CFG, EDIT_PLUGIN, CHANGE_PLUGINS_KEY, UPDATE_EDITED_CFG, VALIDATE_EDITED_CFG,
    contextSaved, setResource, startResourceLoad, loadFinished, setCreationStep, contextLoadError, loading, mapViewerLoad, mapViewerLoaded,
    setEditedPlugin, setEditedCfg, setParsedCfg, validateEditedCfg, setValidationStatus, savePluginCfg, enableMandatoryPlugins, enablePlugins,
    setCfgError, changePluginsKey} from '../actions/contextcreator';
import {newContextSelector, resourceSelector, creationStepSelector, mapConfigSelector, mapViewerLoadedSelector,
    editedPluginSelector, editedCfgSelector, validationStatusSelector, parsedCfgSelector, cfgErrorSelector,
    pluginsSelector} from '../selectors/contextcreator';
import {wrapStartStop} from '../observables/epics';
import {isLoggedIn} from '../selectors/security';
import {show, error} from '../actions/notifications';
import {initMap} from '../actions/map';
import {mapSelector} from '../selectors/map';
import {layersSelector, groupsSelector} from '../selectors/layers';
import {backgroundListSelector} from '../selectors/backgroundselector';
import {textSearchConfigSelector} from '../selectors/searchconfig';
import {mapOptionsToSaveSelector} from '../selectors/mapsave';
import {loadMapConfig} from '../actions/config';
import {createResource, updateResource, getResource} from '../api/persistence';

const saveContextErrorStatusToMessage = (status) => {
    switch (status) {
    case 409:
        return 'contextCreator.saveErrorNotification.conflict';
    default:
        return 'contextCreator.saveErrorNotification.defaultMessage';
    }
};

const flattenPluginTree = (plugins = []) =>
    flatten(plugins.map(plugin => [omit(plugin, 'children')].concat(plugin.enabled ? flattenPluginTree(plugin.children) : [])));

const makePlugins = (plugins = []) =>
    plugins.map(plugin => ({...plugin.pluginConfig, ...(plugin.isUserPlugin ? {active: plugin.active} : {})}));

const findPlugin = (plugins, pluginName) =>
    plugins && plugins.reduce((result, plugin) =>
        result || pluginName === plugin.name && plugin || findPlugin(plugin.children, pluginName), null);

/**
 * Handles saving context resource
 * @memberof epics.contextcreator
 * @param {observable} action$ manages `SAVE_CONTEXT`
 * @param {object} store
 */
export const saveContextResource = (action$, store) => action$
    .ofType(SAVE_CONTEXT)
    .exhaustMap(({destLocation}) => {
        const state = store.getState();
        const context = newContextSelector(state);
        const resource = resourceSelector(state);
        const map = mapSelector(state);
        const layers = layersSelector(state);
        const groups = groupsSelector(state);
        const backgrounds = backgroundListSelector(state);
        const textSearchConfig = textSearchConfigSelector(state);
        const additionalOptions = mapOptionsToSaveSelector(state);
        const plugins = pluginsSelector(state);

        const mapConfig = MapUtils.saveMapConfiguration(map, layers, groups, backgrounds, textSearchConfig, additionalOptions);

        const pluginsArray = flattenPluginTree(plugins).filter(plugin => plugin.enabled);
        const unselectablePlugins = makePlugins(pluginsArray.filter(plugin => !plugin.isUserPlugin));
        const userPlugins = makePlugins(pluginsArray.filter(plugin => plugin.isUserPlugin));

        const newContext = {...context, mapConfig, plugins: {desktop: unselectablePlugins}, userPlugins};
        const newResource = resource && resource.id ? {
            ...omit(resource, 'name', 'description'),
            data: newContext,
            metadata: {
                name: resource && resource.name,
                description: resource.description
            }
        } : {
            category: 'CONTEXT',
            data: newContext,
            metadata: {
                name: resource && resource.name
            }
        };

        return (resource && resource.id ? updateResource : createResource)(newResource)
            .switchMap(rid => Rx.Observable.of(
                contextSaved(rid),
                push(destLocation || `/context/${context.name}`),
                show({
                    title: "saveDialog.saveSuccessTitle",
                    message: "saveDialog.saveSuccessMessage"
                })
            ))
            .catch(({status, data}) => Rx.Observable.of(error({
                title: 'contextCreator.saveErrorNotification.title',
                message: saveContextErrorStatusToMessage(status),
                position: "tc",
                autoDismiss: 5,
                values: {
                    data
                }
            })));
    });

/**
 * Loads context resource and sets up context creator state
 * @memberof epics.contextcreator
 * @param {observable} action$ manages `LOAD_CONTEXT`
 * @param {object} store
 */
export const contextCreatorLoadContext = (action$, store) => action$
    .ofType(LOAD_CONTEXT)
    .switchMap(({id, pluginsConfig = 'pluginsConfig.json'}) => Rx.Observable.of(startResourceLoad()).concat(
        Rx.Observable.defer(() => axios.get(pluginsConfig).then(result => result.data)).switchMap(config => (id === 'new' ?
            Rx.Observable.of(setResource(null, config)) :
            getResource(id).switchMap(resource => Rx.Observable.of(setResource(resource, config))))
            .concat(Rx.Observable.of(enableMandatoryPlugins(), loadFinished(), setCreationStep('general-settings')))
        ))
        .let(
            wrapStartStop(
                loading(true, "loading"),
                loading(false, "loading"),
                e => {
                    let message = `context.errors.context.unknownError`;
                    if (e.status === 403) {
                        message = `context.errors.context.pleaseLogin`;
                        if (isLoggedIn(store.getState())) {
                            message = `context.errors.context.notAccessible`;
                        }
                    } if (e.status === 404) {
                        message = `context.errors.context.notFound`;
                    }
                    // prompt login should be triggered here
                    return Rx.Observable.of(contextLoadError({error: {...e.originalError, message}}));
                }
            )
        )
    );

/**
 * Emits mapViewerLoad actions, when current step changes to Map Configuration
 * @memberof epics.contextcreator
 * @param {observable} action$ manages `SET_CREATION_STEP`
 */
export const loadMapViewerOnStepChange = (action$) => action$
    .ofType(SET_CREATION_STEP)
    .filter(({stepId}) => stepId === 'configure-map')
    .switchMap(() => Rx.Observable.of(mapViewerLoad()));

/**
 * Initiates context map load
 * @memberof epics.contextcreator
 * @param {observable} action$ manages `MAP_VIEWER_LOAD`
 * @param {object} store
 */
export const mapViewerLoadEpic = (action$, store) => action$
    .ofType(MAP_VIEWER_LOAD)
    .switchMap(() => {
        const state = store.getState();
        const isMapViewerLoaded = mapViewerLoadedSelector(state);
        const mapConfig = mapConfigSelector(state);
        const {configUrl} = ConfigUtils.getConfigUrl({mapId: 'new', config: null});

        return isMapViewerLoaded ?
            Rx.Observable.empty() :
            Rx.Observable.merge(
                Rx.Observable.of(
                    initMap(true),
                    loadMapConfig(configUrl, null, cloneDeep(mapConfig)),
                    mapViewerLoaded(true)
                ),
            );
    });

/**
 * Handles map reload
 * @memberof epics.contextcreator
 * @param {observable} action$ manages `MAP_VIEWER_RELOAD`
 * @param {object} store
 */
export const mapViewerReload = (action$, store) => action$
    .ofType(MAP_VIEWER_RELOAD)
    .switchMap(() => {
        const state = store.getState();
        const curStepId = creationStepSelector(state);

        return curStepId !== 'configure-map' ?
            Rx.Observable.empty() :
            Rx.Observable.of(
                mapViewerLoaded(false),
                mapViewerLoad()
            );
    });

/**
 * Enables mandatory plugins
 * @param {observable} action$ manages `ENABLE_MANDATORY_PLUGINS`
 * @param {object} store
 */
export const enableMandatoryPluginsEpic = (action$, store) => action$
    .ofType(ENABLE_MANDATORY_PLUGINS)
    .switchMap(() => {
        const state = store.getState();
        const plugins = flattenPluginTree(pluginsSelector(state));

        return Rx.Observable.of(enablePlugins(plugins.filter(plugin => plugin.mandatory).map(plugin => plugin.name)));
    });

/**
 * Handles plugin enabling
 * @param {observable} action$ manages `ENABLE_PLUGINS`
 * @param {object} store
 */
export const enablePluginsEpic = (action$, store) => action$
    .ofType(ENABLE_PLUGINS)
    .switchMap(({plugins}) => {
        const state = store.getState();
        const pluginsState = pluginsSelector(state);

        const arrangedPlugins = plugins.map(pluginName => {
            const getDepsParents = (curPlugin) => {
                if (curPlugin.parent && curPlugin.parent !== pluginName) {
                    const parent = findPlugin(pluginsState, curPlugin.parent);
                    return [parent, ...getDepsParents(parent)];
                }
                return [];
            };
            const plugin = findPlugin(pluginsState, pluginName);
            const allDeps = plugin.dependencies.map(dep => findPlugin(pluginsState, dep));
            const deps = allDeps.filter(dep => !dep.forcedMandatory);
            const depsToEnable = [...deps, ...flatten(deps.map(getDepsParents).filter(parent => !parent.forcedMandatory))];
            return {plugin, allDeps, depsToEnable};
        });

        const pluginsAndDeps = arrangedPlugins.map(({plugin, depsToEnable}) => [plugin, ...depsToEnable].map(p => p.name));
        const pluginsToEnable = uniq(flatten(pluginsAndDeps));
        const depsToForce = flatten(pluginsAndDeps.map(pluginArray => tail(pluginArray)));

        return Rx.Observable.of(
            changePluginsKey(pluginsToEnable, 'enabled', true),
            changePluginsKey(pluginsToEnable, 'isUserPlugin', false),
            changePluginsKey(depsToForce, 'forcedMandatory', true),
            ...flatten(arrangedPlugins.map(({plugin, allDeps}) =>
                allDeps.map(dep =>
                    changePluginsKey(
                        [dep.name],
                        'enabledDependentPlugins',
                        [...dep.enabledDependentPlugins.filter(enabledDep => enabledDep !== plugin.name), plugin.name]
                    )
                )
            ))
        );
    });

/**
 * Handles plugin disabling
 * @param {observable} action$ manages `DISABLE_PLUGINS`
 * @param {object} store
 */
export const disablePluginsEpic = (action$, store) => action$
    .ofType(DISABLE_PLUGINS)
    .switchMap(({plugins}) => {
        const state = store.getState();
        const pluginsState = pluginsSelector(state);
        const flattenedPlugins = flattenPluginTree(pluginsState);
        const allPlugins = flattenedPlugins.map(plugin => plugin.name);
        const rootPlugins = pluginsState.map(plugin => plugin.name);

        const maxCount = pluginsState.filter(plugin => plugin.enabled && !plugin.mandatory && !plugin.forcedMandatory).length;
        if (intersection(plugins, rootPlugins).length < maxCount) {
            const forcedMandatoryPlugins = flattenedPlugins.filter(plugin => plugin.forcedMandatory);
            const updatedMandatory = forcedMandatoryPlugins.map(plugin => ({
                name: plugin.name,
                enabledDependentPlugins: difference(plugin.enabledDependentPlugins, plugins)
            }));
            const depsToUnforceMandatory = updatedMandatory.filter(dep => dep.enabledDependentPlugins.length === 0).map(dep => dep.name);

            return Rx.Observable.of(
                changePluginsKey(plugins, 'enabled', false),
                ...updatedMandatory.map(({name, enabledDependentPlugins}) =>
                    changePluginsKey([name], 'enabledDependentPlugins', enabledDependentPlugins)),
                changePluginsKey(depsToUnforceMandatory, 'forcedMandatory', false)
            );
        }

        return Rx.Observable.of(
            changePluginsKey(rootPlugins, 'enabled', false),
            changePluginsKey(allPlugins, 'enabledDependentPlugins', []),
            changePluginsKey(allPlugins, 'forcedMandatory', false),
            enableMandatoryPlugins()
        );
    });

/**
 * Unset currently edited plugin when such plugin, or it's parent is moved from enabled plugins list
 * @memberof epics.contextcreator
 * @param {observable} action$ manages `CHANGE_PLUGINS_KEY`
 * @param {object} store
 */
export const resetConfigOnPluginKeyChange = (action$, store) => action$
    .ofType(CHANGE_PLUGINS_KEY)
    .switchMap(({ids, key, value}) => {
        const state = store.getState();
        const editedPlugin = editedPluginSelector(state);
        const plugins = pluginsSelector(state);

        if (key === 'enabled' && value === false) {
            const findEditedPlugin = (curPlugins) =>
                curPlugins.reduce((result, plugin) => result || editedPlugin === plugin.name || findEditedPlugin(plugin.children), false);
            const hasEditedPlugin = findEditedPlugin(ids.map(id => head(plugins.filter(plugin => plugin.name === id)))
                .filter(plugin => !!plugin));

            return hasEditedPlugin ?
                Rx.Observable.of(setCfgError(), setEditedPlugin()) :
                Rx.Observable.empty();
        }

        return Rx.Observable.empty();
    });

/**
 * Set validation status to false when cfg text changes
 * @param {observable} action$ manages `UPDATE_EDITED_CFG`
 * @param {object} store
 */
export const setValidationStatusOnEditedCfgUpdate = (action$, store) => action$
    .ofType(UPDATE_EDITED_CFG)
    .mergeMap(() => {
        const state = store.getState();
        const validationStatus = validationStatusSelector(state);
        return validationStatus ?
            Rx.Observable.of(setValidationStatus(false)) :
            Rx.Observable.empty();
    });

/**
 * Triggers validation and the update of configuration of currently edited plugin
 * @param {observable} action$ manages `UPDATE_EDITED_CFG`
 */
export const updateEditedCfgEpic = (action$) => action$
    .ofType(UPDATE_EDITED_CFG)
    .debounceTime(500)
    .switchMap(() => Rx.Observable.of(validateEditedCfg(), savePluginCfg(), setValidationStatus(true)));

/**
 * Validates currently edited cfg
 * @param {observable} action$ manages `VALIDATE_EDITED_CFG`
 * @param {object} store
 */
export const validateEditedCfgEpic = (action$, store) => action$
    .ofType(VALIDATE_EDITED_CFG)
    .switchMap(() => {
        const state = store.getState();
        const editedCfg = editedCfgSelector(state);

        const getErrorLine = (e) => {
            const matches = e.message.match(/line ([0-9]*)/);
            return matches && matches.length > 1 ? +matches[1] : undefined;
        };

        if (editedCfg) {
            try {
                const parsedCfg = jsonlint.parse(editedCfg);
                return Rx.Observable.of(setParsedCfg(parsedCfg), setCfgError());
            } catch (e) {
                return Rx.Observable.of(setCfgError({
                    message: e.message,
                    lineNumber: getErrorLine(e)
                }));
            }
        }

        return Rx.Observable.empty();
    });

/**
 * Handle editPlugin action
 * @param {observable} action$ manages `EDIT_PLUGIN`
 * @param {object} store
 */
export const editPluginEpic = (action$, store) => action$
    .ofType(EDIT_PLUGIN)
    .switchMap(({pluginName}) => {
        const state = store.getState();
        const editedPlugin = editedPluginSelector(state);
        const cfgError = cfgErrorSelector(state);
        const validationStatus = validationStatusSelector(state) || false;

        return !cfgError && validationStatus ?
            Rx.Observable.of(setEditedPlugin(pluginName), setEditedCfg(pluginName)) :
            cfgError ? Rx.Observable.of(error({
                title: 'contextCreator.configurePlugins.saveCfgErrorNotification.title',
                message: 'contextCreator.configurePlugins.saveCfgErrorNotification.message',
                position: 'tc',
                autoDismiss: 5,
                values: {
                    pluginName: editedPlugin
                }
            })) : Rx.Observable.empty();
    });

/**
 * Handle cfg saving
 * @memberof epics.contextcreator
 * @param {observable} action$ manages `EDIT_PLUGIN`
 * @param {object} store
 */
export const savePluginCfgEpic = (action$, store) => action$
    .ofType(SAVE_PLUGIN_CFG)
    .switchMap(() => {
        const state = store.getState();
        const pluginName = editedPluginSelector(state);
        const parsedCfg = parsedCfgSelector(state);
        const cfgError = cfgErrorSelector(state);

        return pluginName && parsedCfg && !cfgError ?
            Rx.Observable.of(changePluginsKey([pluginName], 'pluginConfig.cfg', parsedCfg)) :
            Rx.Observable.empty();
    });
