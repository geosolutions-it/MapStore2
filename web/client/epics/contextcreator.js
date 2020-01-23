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
import {omit, pick, get, flatten, uniq, intersection, head, keys, values, findIndex, cloneDeep} from 'lodash';
import {push} from 'connected-react-router';

import ConfigUtils from '../utils/ConfigUtils';
import MapUtils from '../utils/MapUtils';

import {SAVE_CONTEXT, SAVE_TEMPLATE, LOAD_CONTEXT, LOAD_TEMPLATE, EDIT_TEMPLATE, SHOW_DIALOG, SET_CREATION_STEP, MAP_VIEWER_LOAD,
    MAP_VIEWER_RELOAD, CHANGE_ATTRIBUTE, ENABLE_MANDATORY_PLUGINS, ENABLE_PLUGINS, DISABLE_PLUGINS, SAVE_PLUGIN_CFG,
    EDIT_PLUGIN, CHANGE_PLUGINS_KEY, UPDATE_EDITED_CFG, VALIDATE_EDITED_CFG, SET_RESOURCE, contextSaved, setResource,
    startResourceLoad, loadFinished, loadTemplate, showDialog, setFileDropStatus, updateTemplate, isValidContextName,
    contextNameChecked, setCreationStep, contextLoadError, loading, mapViewerLoad, mapViewerLoaded, setEditedPlugin,
    setEditedCfg, setParsedCfg, validateEditedCfg, setValidationStatus, savePluginCfg, enableMandatoryPlugins,
    enablePlugins, setCfgError, changePluginsKey, changeTemplatesKey, setEditedTemplate} from '../actions/contextcreator';
import {newContextSelector, resourceSelector, creationStepSelector, mapConfigSelector, mapViewerLoadedSelector, contextNameCheckedSelector,
    editedPluginSelector, editedCfgSelector, validationStatusSelector, parsedCfgSelector, cfgErrorSelector,
    pluginsSelector, initialEnabledPluginsSelector} from '../selectors/contextcreator';
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
import {createResource, updateResource, getResource, getResources, getResourceIdByName} from '../api/persistence';

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

        const newContext = {
            ...context,
            mapConfig,
            plugins: {desktop: unselectablePlugins},
            userPlugins,
            templates: get(context, 'templates', []).filter(template => template.enabled).map(template => pick(template, 'id'))
        };
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
                title: 'contextCreator.saveErrorNotification.titleContext',
                message: saveContextErrorStatusToMessage(status),
                position: "tc",
                autoDismiss: 5,
                values: {
                    data
                }
            })));
    });

/**
 * Save a template resource
 * @memberof epics.contextcreator
 * @param {observable} action$ manages `SAVE_TEMPLATE`
 */
export const saveTemplateEpic = (action$) => action$
    .ofType(SAVE_TEMPLATE)
    .switchMap(({resource}) => (resource && resource.id ? updateResource : createResource)(resource)
        .switchMap(rid => Rx.Observable.of(
            loadTemplate(rid),
            showDialog('uploadTemplate', false),
            show({
                title: 'saveDialog.saveSuccessTitle',
                message: 'saveDialog.saveSuccessMessage'
            })
        ))
        .let(wrapStartStop(
            loading(true, 'templateSaving'),
            loading(false, 'templateSaving'),
            ({status, data}) => Rx.Observable.of(error({
                title: 'contextCreator.saveErrorNotification.titleTemplate',
                message: saveContextErrorStatusToMessage(status),
                position: "tc",
                autoDismiss: 5,
                values: {
                    data
                }
            }))
        )));

/**
 * Load a template from server and add it to the current list
 * @param {observable} action$ manages `LOAD_TEMPLATE`
 */
export const loadTemplateEpic = (action$) => action$
    .ofType(LOAD_TEMPLATE)
    .switchMap(({id}) => getResource(id, {includeAttributes: true, withData: false, withPermissions: false})
        .switchMap(resource => Rx.Observable.of(updateTemplate({
            ...resource,
            thumbnail: get(resource, 'attributes.thumbnail')
        })))
        .let(wrapStartStop(
            loading(true, 'templateLoading'),
            loading(false, 'templateLoading')
        )));

/**
 * Trigger template metadata editor
 * @param {observable} action$ manages `EDIT_TEMPLATE`
 */
export const editTemplateEpic = (action$) => action$
    .ofType(EDIT_TEMPLATE)
    .switchMap(({id}) => Rx.Observable.of(setEditedTemplate(id), showDialog('uploadTemplate', true)));

/**
 * Reset stuff when dialog is shown
 * @param {observable} action$ manages `SHOW_DIALOG`
 */
export const resetOnShowDialog = (action$, store) => action$
    .ofType(SHOW_DIALOG)
    .flatMap(({dialogName, show: showDialogBool}) => {
        const state = store.getState();
        const context = newContextSelector(state) || {};
        const templates = context.templates || [];

        return showDialogBool ?
            Rx.Observable.of(...(dialogName === 'uploadTemplate' ? [setFileDropStatus()] : []),
                ...(dialogName === 'mapTemplatesConfig' ? [changeTemplatesKey(templates.map(template => template.id), 'selected', false)] : [])) :
            Rx.Observable.empty();
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
        Rx.Observable.forkJoin(
            Rx.Observable.defer(() => axios.get(pluginsConfig).then(result => result.data)),
            getResources({
                category: 'TEMPLATE',
                options: {
                    params: {
                        start: 0,
                        limit: 10000
                    }
                }
            }).map(response => response.totalCount === 1 ? [response.results] : values(response.results)),
            id === 'new' ? Rx.Observable.of(null) : getResource(id)
        ).switchMap(([config, templates, resource]) =>
            Rx.Observable.of(setResource(resource, config, templates))
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

export const invalidateContextName = (action$, store) => action$
    .ofType(CHANGE_ATTRIBUTE)
    .filter(({key}) => key === 'name')
    .switchMap(() => {
        const state = store.getState();
        const isChecked = contextNameCheckedSelector(state);

        return isChecked || isChecked === undefined ? Rx.Observable.of(contextNameChecked(false)) : Rx.Observable.empty();
    });

export const checkIfContextExists = (action$, store) => action$
    .ofType(CHANGE_ATTRIBUTE)
    .filter(({key}) => key === 'name')
    .debounceTime(500)
    .switchMap(() => {
        const state = store.getState();
        const resource = resourceSelector(state);

        const contextName = resource && resource.name;

        return (contextName ?
            getResourceIdByName('CONTEXT', contextName)
                .switchMap(id => id !== get(resource, 'id') ?
                    Rx.Observable.of(error({
                        title: 'contextCreator.contextNameErrorNotification.title',
                        message: 'contextCreator.saveErrorNotification.conflict',
                        position: "tc",
                        autoDismiss: 5
                    }), isValidContextName(false)) :
                    Rx.Observable.of(isValidContextName(true)))
                .let(wrapStartStop(
                    loading(true, 'contextNameCheck'),
                    loading(false, 'contextNameCheck'),
                    e => {
                        return e.status === 404 ?
                            Rx.Observable.of(isValidContextName(true)) :
                            Rx.Observable.of(error({
                                title: 'contextCreator.contextNameErrorNotification.title',
                                message: 'contextCreator.contextNameErrorNotification.unknownError',
                                position: "tc",
                                autoDismiss: 5
                            }));
                    }
                )) :
            Rx.Observable.empty()).concat(Rx.Observable.of(contextNameChecked(true)));
    });

/**
 * Enables plugins that should be enabled at the start
 * @param {observable} action$ manages `SET_RESOURCE`
 * @param {object} store
 */
export const enableInitialPlugins = (action$, store) => action$
    .ofType(SET_RESOURCE)
    .switchMap(() => {
        const state = store.getState();
        const pluginsToEnable = initialEnabledPluginsSelector(state);

        return pluginsToEnable && pluginsToEnable.length > 0 ?
            Rx.Observable.of(enablePlugins(pluginsToEnable, true)) :
            Rx.Observable.empty();
    });

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
 * Handles plugin enabling, resolving dependencies and enabling them as well.
 * Enables, along with requested plugins their dependencies, for dependencies.
 * Sets `forceMandatory` to true and updates `enabledDependentPlugins` array.
 * In the case when plugin A should have plugin B as it's dependency and B is a child of C, both B and C should be listed as dependencies of A.
 * (because you need C to be enabled too as it's a parent, it won't be enabled automagically, dependency resolution doesn't
 * care if a plugin is a parent or a child or whatever, it only cares about dependency relationships)
 * @param {observable} action$ manages `ENABLE_PLUGINS`
 * @param {object} store
 */
export const enablePluginsEpic = (action$, store) => action$
    .ofType(ENABLE_PLUGINS)
    .switchMap(({plugins, isInitial}) => {
        const state = store.getState();
        const pluginsState = pluginsSelector(state);

        let enabledDependentPlugins = {}; // object {[pluginName]: modified enabledDependentPlugins array}
        let pluginsToEnable = []; // plugins that need to be enabled after dependency resolution
        let depsToForce = []; // plugins that need to be temporarily flagged as mandatory

        const enablePlugin = (pluginName) => {
            const processDependency = (parentName, dep) => {
                // add the plugin where we came from to enabledDependentPlugins of dep
                if (!enabledDependentPlugins[dep.name]) {
                    enabledDependentPlugins[dep.name] = dep.enabledDependentPlugins.slice();
                }
                enabledDependentPlugins[dep.name].push(parentName);

                // if dep is flagged as forcedMandatory we've already been here
                if (dep.forcedMandatory || depsToForce.reduce((result, cur) => result || cur === dep.name, false)) {
                    return;
                }

                // flag dep to have forcedMandatory enabled
                depsToForce.push(dep.name);

                // enable it if not already enabled
                if (!dep.enabled && pluginsToEnable.reduce((result, cur) => result && cur !== dep.name, true)) {
                    pluginsToEnable.push(dep.name);
                }

                // recursively process the dependencies of dep
                dep.dependencies.forEach(depName => {
                    processDependency(dep.name, findPlugin(pluginsState, depName));
                });
            };

            const plugin = findPlugin(pluginsState, pluginName);

            // enable the plugin only if it hasn't been enabled already
            if (!plugin.enabled && pluginsToEnable.reduce((result, cur) => result && cur !== pluginName, true)) {
                pluginsToEnable.push(pluginName);
                plugin.dependencies.forEach(depName => {
                    processDependency(pluginName, findPlugin(pluginsState, depName));
                    // autoEnableChildren only applies when the action is triggered by the user from ui
                    if (!isInitial) {
                        plugin.autoEnableChildren.forEach(childName => {
                            enablePlugin(childName);
                        });
                    }
                });
            }
        };

        plugins.forEach(pluginName => {
            enablePlugin(pluginName);
        });

        // generate actions that update plugins
        return Rx.Observable.of(
            changePluginsKey(pluginsToEnable, 'enabled', true),

            // isUserPlugin value should be preserved when we set up the initial state of plugins when editing a context
            ...(!isInitial ? [changePluginsKey(uniq([...pluginsToEnable, ...depsToForce]), 'isUserPlugin', false)] : []),
            changePluginsKey(depsToForce, 'forcedMandatory', true),
            ...keys(enabledDependentPlugins).map(pluginName =>
                changePluginsKey([pluginName], 'enabledDependentPlugins', uniq(enabledDependentPlugins[pluginName])))
        );
    });

/**
 * Handles plugin disabling.
 * Disables requested plugins, finds dependencies, and disables those that don't have plugins enabled that depend on them.
 * Also specifically handles a case when all currently enabled plugins are requested to be disabled.
 * (i.e. when '<<' button is pressed in the configure plugins step)
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

        // max count of plugins in enabled column that can actually be selected
        // used to determine if everything should be disabled and mandatory plugins reenabled
        // since now disabling plugins disables their dependencies maybe is no longer needed
        // but it works so i didn't touch it
        const maxCount = pluginsState.filter(plugin => plugin.enabled && !plugin.mandatory && !plugin.forcedMandatory).length;
        if (intersection(plugins, rootPlugins).length < maxCount) {
            let enabledDependentPlugins = {}; // object {[pluginName]: modified enabledDependentPlugins array}
            let pluginsToDisable = plugins.slice(); // plugins that need to be enabled after dependency resolution
            let depsToUnforceMandatory = []; // plugins that need to have their forcedMandatory flag removed

            const disablePlugin = pluginName => {
                const processDependency = (parentName, plugin) => {
                    // update enabledDependentPlugins of plugin
                    const enabledDependentPluginsArr = enabledDependentPlugins[plugin.name] || plugin.enabledDependentPlugins.slice();
                    const dependentPluginIndex = findIndex(enabledDependentPluginsArr, p => p === parentName);
                    if (dependentPluginIndex > -1) {
                        if (!enabledDependentPlugins[plugin.name]) {
                            enabledDependentPlugins[plugin.name] = enabledDependentPluginsArr;
                        }
                        enabledDependentPlugins[plugin.name].splice(dependentPluginIndex, 1);
                    }

                    // if there are no more plugins that are enabled and have this plugin as a dependency, unforce it
                    if (enabledDependentPlugins[plugin.name].length === 0 &&
                        pluginsToDisable.reduce((result, cur) => result && cur !== plugin.name, true)
                    ) {
                        depsToUnforceMandatory.push(plugin.name);
                        // if the plugin is not mandatory disable it and recursively process it's dependencies
                        if (!plugin.mandatory) {
                            pluginsToDisable.push(plugin.name);
                            plugin.dependencies.forEach(depName => {
                                processDependency(plugin.name, findPlugin(pluginsState, depName));
                            });
                        }
                    }
                };

                // start processing dependencies
                const plugin = findPlugin(pluginsState, pluginName);
                plugin.dependencies.forEach(depName => {
                    processDependency(pluginName, findPlugin(pluginsState, depName));
                });
            };

            plugins.forEach(pluginName => {
                disablePlugin(pluginName);
            });

            // generate actions that update plugins
            return Rx.Observable.of(
                changePluginsKey(pluginsToDisable, 'enabled', false),
                ...keys(enabledDependentPlugins).map(pluginName =>
                    changePluginsKey([pluginName], 'enabledDependentPlugins', enabledDependentPlugins[pluginName])),
                changePluginsKey(uniq(depsToUnforceMandatory), 'forcedMandatory', false)
            );
        }

        // disable everything and reenable initial mandatory plugins
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
