/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';
import jsonlint from 'jsonlint-mod';
import {omit, pick, get, flatten, uniq, intersection, head, keys, values, findIndex, find, cloneDeep, isString} from 'lodash';
import {push} from 'connected-react-router';

import Api from '../api/GeoStoreDAO';

import ConfigUtils from '../utils/ConfigUtils';

import {SAVE_CONTEXT, SAVE_TEMPLATE, LOAD_CONTEXT, LOAD_TEMPLATE, DELETE_TEMPLATE, EDIT_TEMPLATE, SHOW_DIALOG, SET_CREATION_STEP, MAP_VIEWER_LOAD,
    MAP_VIEWER_RELOAD, CHANGE_ATTRIBUTE, ENABLE_MANDATORY_PLUGINS, ENABLE_PLUGINS, DISABLE_PLUGINS, SAVE_PLUGIN_CFG,
    EDIT_PLUGIN, CHANGE_PLUGINS_KEY, UPDATE_EDITED_CFG, VALIDATE_EDITED_CFG, SET_RESOURCE, UPLOAD_PLUGIN, UNINSTALL_PLUGIN,
    SHOW_TUTORIAL, contextSaved, setResource, startResourceLoad, loadFinished, loadTemplate, showDialog, setFileDropStatus, updateTemplate,
    isValidContextName, contextNameChecked, setCreationStep, contextLoadError, loading, mapViewerLoad, mapViewerLoaded, setEditedPlugin,
    setEditedCfg, setParsedCfg, validateEditedCfg, setValidationStatus, savePluginCfg, enableMandatoryPlugins,
    enablePlugins, disablePlugins, setCfgError, changePluginsKey, changeTemplatesKey, setEditedTemplate, setTemplates, setParsedTemplate,
    pluginUploaded, pluginUploading, pluginUninstalled, pluginUninstalling, loadExtensions, uploadPluginError,
    setWasTutorialShown, setTutorialStep} from '../actions/contextcreator';
import {newContextSelector, resourceSelector, creationStepSelector, mapConfigSelector, mapViewerLoadedSelector, contextNameCheckedSelector,
    editedPluginSelector, editedCfgSelector, validationStatusSelector, parsedCfgSelector, cfgErrorSelector,
    pluginsSelector, initialEnabledPluginsSelector, templatesSelector, editedTemplateSelector, tutorialsSelector,
    wasTutorialShownSelector} from '../selectors/contextcreator';
import {CONTEXTS_LIST_LOADED} from '../actions/contextmanager';
import {wrapStartStop} from '../observables/epics';
import {isLoggedIn} from '../selectors/security';
import {show, error} from '../actions/notifications';
import {changePreset} from '../actions/tutorial';
import {initMap} from '../actions/map';
import {mapSaveSelector} from '../selectors/mapsave';
import {loadMapConfig} from '../actions/config';
import {createResource, createCategory, updateResource, deleteResource, getResource} from '../api/persistence';
import getPluginsConfig from '../observables/config/getPluginsConfig';
import { upload, uninstall } from '../api/plugins';

const saveContextErrorStatusToMessage = (status) => {
    switch (status) {
    case 409:
        return 'contextCreator.saveErrorNotification.conflict';
    default:
        return 'contextCreator.saveErrorNotification.defaultMessage';
    }
};

const loadTemplateErrorStatusToMessage = (status) => {
    switch (status) {
    case 403:
        return 'contextCreator.loadTemplateErrorNotification.forbidden';
    default:
        return 'contextCreator.loadTemplateErrorNotification.defaultMessage';
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
        const mapConfig = mapSaveSelector(state);
        const plugins = pluginsSelector(state);
        const context = newContextSelector(state);
        const resource = resourceSelector(state);
        const templates = templatesSelector(state);
        const pluginsArray = flattenPluginTree(plugins).filter(plugin => plugin.enabled).map(plugin => plugin.name === 'MapTemplates' ? ({
            ...plugin,
            pluginConfig: {
                ...plugin.pluginConfig,
                cfg: {
                    ...(plugin.pluginConfig.cfg || {}),
                    allowedTemplates: templates.filter(template => template.enabled).map(template => pick(template, 'id'))
                }
            }
        }) : plugin);
        const unselectablePlugins = makePlugins(pluginsArray.filter(plugin => !plugin.isUserPlugin));
        const userPlugins = makePlugins(pluginsArray.filter(plugin => plugin.isUserPlugin));

        const newContext = {
            ...context,
            mapConfig,
            plugins: {desktop: unselectablePlugins},
            userPlugins
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
            .switchMap(rid => Rx.Observable.merge(
                // LOCATION_CHANGE triggers notifications clear, need to work around that
                // can't wait for CLEAR_NOTIFICATIONS, because either in firefox notification action doesn't trigger
                // or in chrome it triggers too early
                // (on chrome there is another LOCATION_CHANGE after the first one for unknown reason, that cancels out the first)
                (destLocation === '/context-manager' ? action$.ofType(CONTEXTS_LIST_LOADED).take(1).switchMap(() => Rx.Observable.of(
                    show({
                        title: "saveDialog.saveSuccessTitle",
                        message: "saveDialog.saveSuccessMessage"
                    }))) : Rx.Observable.empty()),
                Rx.Observable.of(
                    contextSaved(rid),
                    push(destLocation || `/context/${context.name}`),
                    loadExtensions(),
                    loading(false, 'contextSaving')
                ),
            ))
            .catch(({status, data}) => Rx.Observable.of(error({
                title: 'contextCreator.saveErrorNotification.titleContext',
                message: saveContextErrorStatusToMessage(status),
                position: "tc",
                autoDismiss: 5,
                values: {
                    data
                }
            }), loading(false, 'contextSaving')))
            .startWith(loading(true, 'contextSaving'));
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
            ({status, data}, stream$) => {
                if (status === 404 && isString(data) && data.indexOf('Resource Category not found') > -1) {
                    return createCategory('TEMPLATE').switchMap(() => stream$.skip(1))
                        .catch(() => Rx.Observable.of(error({
                            title: 'contextCreator.saveErrorNotification.titleTemplate',
                            message: 'contextCreator.saveErrorNotification.categoryError',
                            position: "tc",
                            autoDismiss: 5,
                            values: {
                                categoryName: 'TEMPLATE'
                            }
                        })));
                }
                return Rx.Observable.of(error({
                    title: 'contextCreator.saveErrorNotification.titleTemplate',
                    message: saveContextErrorStatusToMessage(status),
                    position: "tc",
                    autoDismiss: 5,
                    values: {
                        data
                    }
                }));
            }
        )));

/**
 * Load a template from server and add it to the current list
 * @param {observable} action$ manages `LOAD_TEMPLATE`
 */
export const loadTemplateEpic = (action$) => action$
    .ofType(LOAD_TEMPLATE)
    .switchMap(({id}) => getResource(id, {includeAttributes: true, withData: false, withPermissions: false})
        .switchMap(resource => {
            const thumbnail = get(resource, 'attributes.thumbnail');
            const format = get(resource, 'attributes.format');
            return Rx.Observable.of(updateTemplate({
                ...resource,
                attributes: {
                    ...(thumbnail ? {thumbnail: decodeURIComponent(thumbnail)} : {}),
                    ...(format ? {format} : {})
                },
                ...(thumbnail ? {thumbnail: decodeURIComponent(thumbnail)} : {}),
                ...(format ? {format} : {})
            }));
        })
        .let(wrapStartStop(
            loading(true, 'templateLoading'),
            loading(false, 'templateLoading')
        )));

/**
 * Delete a template from server and remove it from the current list
 * @param {observable} action$ manages `DELETE_TEMPLATE`
 * @param {object} store
 */
export const deleteTemplateEpic = (action$, store) => action$
    .ofType(DELETE_TEMPLATE)
    .switchMap(({resource}) => deleteResource(resource).map(() => {
        const state = store.getState();
        const newContext = newContextSelector(state);

        return setTemplates(get(newContext, 'templates', []).filter(template => template.id !== resource.id));
    }).let(wrapStartStop(
        loading(true, "loading"),
        loading(false, "loading"),
        () => Rx.Observable.of(error({
            title: "notification.error",
            message: "contextCreator.configureTemplates.deleteError",
            autoDismiss: 6,
            position: "tc"
        }))
    )));

/**
 * Trigger template metadata editor
 * @param {observable} action$ manages `EDIT_TEMPLATE`
 */
export const editTemplateEpic = (action$, store) => action$
    .ofType(EDIT_TEMPLATE)
    .switchMap(({id}) => {
        const state = store.getState();
        const template = find(get(newContextSelector(state), 'templates', []), t => t.id === id) || {};

        return (id ? Rx.Observable.defer(() => Api.getData(id)) : Rx.Observable.of(null))
            .switchMap(data => Rx.Observable.of(
                setEditedTemplate(id),
                ...(id ? [setParsedTemplate('Template Data', data, template.format), setFileDropStatus('accepted')] : []),
                showDialog('uploadTemplate', true)
            ))
            .let(wrapStartStop(
                loading(true, "templateDataLoading"),
                loading(false, "templateDataLoading"),
                ({status}) => Rx.Observable.of(error({
                    title: "notification.error",
                    message: loadTemplateErrorStatusToMessage(status),
                    position: "tc",
                    autoDismiss: 5
                }))
            ));
    });

/**
 * Reset stuff when dialog is shown
 * @param {observable} action$ manages `SHOW_DIALOG`
 */
export const resetOnShowDialog = (action$, store) => action$
    .ofType(SHOW_DIALOG)
    .flatMap(({dialogName, show: showDialogBool}) => {
        const state = store.getState();
        const context = newContextSelector(state) || {};
        const editedTemplateId = editedTemplateSelector(state);
        const templates = context.templates || [];

        return showDialogBool ?
            Rx.Observable.of(...(dialogName === 'uploadTemplate' && !editedTemplateId ? [setFileDropStatus(), setParsedTemplate()] : []),
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
    .switchMap(({id, pluginsConfig}) => Rx.Observable.of(startResourceLoad()).concat(
        Rx.Observable.forkJoin(
            Rx.Observable.defer(() => getPluginsConfig(pluginsConfig)),
            Rx.Observable.defer(() => Api.getResourcesByCategory('TEMPLATE', '*', {
                params: {
                    start: 0,
                    limit: 10000,
                    includeAttributes: true
                }
            })).map(response => response.totalCount === 1 ? [response.results] : values(response.results)),
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

export const uploadPluginEpic = (action$) => action$
    .ofType(UPLOAD_PLUGIN)
    .switchMap(({files}) =>
        Rx.Observable.defer(() => upload(files.map(f => f.file)))
            .switchMap(result => Rx.Observable.of(pluginUploaded(result)))
            .let(wrapStartStop(
                pluginUploading(true, files.map(f => f.name)),
                pluginUploading(false, files.map(f => f.name)),
                (e) => Rx.Observable.of(uploadPluginError(files, e))
            ))
    );

export const uninstallPluginEpic = (action$) => action$
    .ofType(UNINSTALL_PLUGIN)
    .switchMap(({plugin}) =>
        Rx.Observable.defer(() => uninstall(plugin))
            .switchMap(result => Rx.Observable.of(
                pluginUninstalled(plugin, result),
                showDialog('confirmRemovePlugin', false)
            ))
            .let(wrapStartStop(
                pluginUninstalling(true, plugin),
                pluginUninstalling(false, plugin),
                () => Rx.Observable.of(error({
                    title: "notification.error",
                    message: "context.errors.plugins.uninstall",
                    autoDismiss: 6,
                    position: "tc"
                }))
            ))
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
            Rx.Observable.defer(() => Api.searchListByAttributes({
                AND: {
                    FIELD: {
                        field: ['NAME'],
                        operator: ['EQUAL_TO'],
                        value: [contextName]
                    }
                }
            })).switchMap(({ExtResourceList: {Resource, ResourceCount}}) =>
                get(Resource, 'id') !== get(resource, 'id') && ResourceCount > 0 ?
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
                    () => {
                        return Rx.Observable.of(error({
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
 * Changes tutorial on creation step changes
 * @memberof epics.contextcreator
 * @param {observable} action$ manages `SET_CREATION_STEP`
 * @param {object} store
 */
export const loadTutorialOnStepChange = (action$, store) => action$
    .ofType(SET_CREATION_STEP)
    .switchMap(({stepId}) => {
        const tutorials = tutorialsSelector(store.getState()) || {};

        return !wasTutorialShownSelector(stepId)(store.getState()) ?
            Rx.Observable.of(
                changePreset(tutorials[stepId], values(tutorials)),
                setWasTutorialShown(stepId)
            ) :
            Rx.Observable.empty();
    });

/**
 * Handles SHOW_TUTORIAL action
 * @param {observables} action$ manages `SHOW_TUTORIAL`
 * @param {object} store
 */
export const contextCreatorShowTutorialEpic = (action$, store) => action$
    .ofType(SHOW_TUTORIAL)
    .switchMap(({stepId}) => {
        const tutorials = tutorialsSelector(store.getState()) || {};
        return Rx.Observable.of(
            setTutorialStep(),
            changePreset(tutorials[stepId], values(tutorials), true)
        );
    });

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
        const plugins = pluginsSelector(state);

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
            const handleChildren = (processDepFunc, plugin) => {
                // enable mandatory children
                plugin.children.forEach(childPlugin => {
                    if (childPlugin.mandatory) {
                        enablePlugin(childPlugin.name);
                    }
                });
                // autoEnableChildren need to be handled only when the action is triggered by the user from ui,
                // unless the parent plugin is mandatory
                if (!isInitial && !plugin.mandatory) {
                    plugin.autoEnableChildren.forEach(childName => {
                        // treat autoEnableChildren as dependencies, but dont force mandatory
                        processDepFunc(null, findPlugin(pluginsState, childName), true);
                    });
                }
            };

            const processDependency = (parentName, dep, dontForceMandatory = false) => {
                // if dep is mandatory ignore it; it's dependency tree either has already been enabled or will be enabled anyway
                if (dep.mandatory) {
                    return;
                }

                const isDepEnabled = dep.enabled || pluginsToEnable.reduce((result, cur) => result || cur === dep.name, false);

                // add the plugin where we came from to enabledDependentPlugins of dep, unless dontForceMandatory === true
                if (parentName && !dontForceMandatory) {
                    if (!enabledDependentPlugins[dep.name]) {
                        enabledDependentPlugins[dep.name] = dep.enabledDependentPlugins.slice();
                    }
                    enabledDependentPlugins[dep.name].push(parentName);
                }

                // if dep is flagged as forcedMandatory we've already been here
                if (dep.forcedMandatory || depsToForce.reduce((result, cur) => result || cur === dep.name, false)) {
                    return;
                }

                // flag dep to have forcedMandatory enabled if dontForceMandatory === false
                if (!dontForceMandatory) {
                    depsToForce.push(dep.name);
                }

                // enable it if not already enabled
                if (!isDepEnabled) {
                    pluginsToEnable.push(dep.name);
                }

                // recursively process the dependencies
                dep.dependencies.forEach(depName => {
                    processDependency(dep.name, findPlugin(pluginsState, depName));
                });

                // enable children only if dep was disabled
                if (!isDepEnabled) {
                    handleChildren(processDependency, dep);
                }
            };

            const plugin = findPlugin(pluginsState, pluginName);

            // enable the plugin only if it hasn't been enabled already
            if (!plugin.enabled && pluginsToEnable.reduce((result, cur) => result && cur !== pluginName, true)) {
                pluginsToEnable.push(pluginName);
                plugin.dependencies.forEach(depName => {
                    processDependency(pluginName, findPlugin(pluginsState, depName));
                });
                handleChildren(processDependency, plugin);
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
            let pluginsToDisable = []; // plugins that need to be enabled after dependency resolution
            let depsToUnforceMandatory = []; // plugins that need to have their forcedMandatory flag removed

            const disablePlugin = (pluginName, isChild) => {
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
                    if ((!enabledDependentPlugins[plugin.name] || enabledDependentPlugins[plugin.name].length === 0) &&
                        pluginsToDisable.reduce((result, cur) => result && cur !== plugin.name, true)
                    ) {
                        depsToUnforceMandatory.push(plugin.name);
                        // if the plugin is not mandatory disable it and recursively process it's dependencies
                        if (!plugin.mandatory) {
                            disablePlugin(plugin.name);
                        }
                    }
                };


                const plugin = findPlugin(pluginsState, pluginName);
                const enabledDependentPluginsArr = enabledDependentPlugins[plugin.name] || plugin.enabledDependentPlugins.slice();

                // if we came here recursively from a parent in plugin tree hierarchy, ignore mandatory flag
                if (enabledDependentPluginsArr.length === 0 &&
                    pluginsToDisable.reduce((result, cur) => result && cur !== plugin.name, true) && (!plugin.mandatory || isChild)) {
                    pluginsToDisable.push(plugin.name);

                    // start processing dependencies
                    plugin.dependencies.forEach(depName => {
                        processDependency(pluginName, findPlugin(pluginsState, depName));
                    });

                    // disable children
                    plugin.children.filter(childPlugin => childPlugin.enabled).forEach(childPlugin => {
                        disablePlugin(childPlugin.name, true);
                    });
                }
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
            changePluginsKey(allPlugins, 'enabled', false),
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
 * Enables/disables user extensions plugin when enabled user plugins are present
 * @param {observable} action$
 * @param {object} store
 */
export const handleUserExtensionsPlugin = (action$, store) => action$
    .ofType(CHANGE_PLUGINS_KEY)
    .filter(({key}) => key === 'enabled' || key === 'isUserPlugin')
    .mergeMap(() => {
        const state = store.getState();
        const plugins = flattenPluginTree(pluginsSelector(state));

        const enabledUserPluginsCount =
            plugins.filter(({name, enabled, isUserPlugin}) => name !== 'UserExtensions' && enabled && isUserPlugin).length;
        const isUserExtensionsEnabled = (find(plugins, ({name}) => name === 'UserExtensions') || {}).enabled;
        const action = enabledUserPluginsCount > 0 && !isUserExtensionsEnabled ?
            enablePlugins :
            enabledUserPluginsCount === 0 && isUserExtensionsEnabled ?
                disablePlugins :
                null;

        return action ? Rx.Observable.of(action(['UserExtensions'])) : Rx.Observable.empty();
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
            Rx.Observable.of(
                changePluginsKey([pluginName], 'pluginConfig.cfg', parsedCfg.cfg),
                changePluginsKey([pluginName], 'pluginConfig.override', parsedCfg.override)
            ) :
            Rx.Observable.empty();
    });
