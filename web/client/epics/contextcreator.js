/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';
import {omit, flatten, findIndex, cloneDeep} from 'lodash';
import {push} from 'connected-react-router';

import ConfigUtils from '../utils/ConfigUtils';
import MapUtils from '../utils/MapUtils';

import {SAVE_CONTEXT, LOAD_CONTEXT, SET_CREATION_STEP, MAP_VIEWER_LOAD, MAP_VIEWER_RELOAD, EDIT_PLUGIN, CHANGE_PLUGINS_KEY,
    contextSaved, setResource, startResourceLoad, loadFinished, setCreationStep, contextLoadError, loading, mapViewerLoad, mapViewerLoaded,
    setEditedPlugin, setEditedCfg, changePluginsKey} from '../actions/contextcreator';
import {newContextSelector, resourceSelector, creationStepSelector, mapConfigSelector, mapViewerLoadedSelector,
    editedPluginSelector, editedCfgSelector, pluginsSelector} from '../selectors/contextcreator';
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
    .switchMap(({id}) => (id === 'new' ?
        Rx.Observable.of(setResource()) :
        Rx.Observable.of(startResourceLoad())
            .concat(getResource(id).switchMap(resource => Rx.Observable.of(setResource(resource)))))
        .concat(Rx.Observable.of(loadFinished(), setCreationStep('general-settings')))
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
 * Unset currently edited plugin when such plugin is moved from enabled plugins list
 * @memberof epics.contextcreator
 * @param {observable} action$ manages `CHANGE_PLUGINS_KEY`
 * @param {object} store
 */
export const resetConfigOnPluginKeyChange = (action$, store) => action$
    .ofType(CHANGE_PLUGINS_KEY)
    .switchMap(({ids, key, value}) => {
        const state = store.getState();
        const editedPlugin = editedPluginSelector(state);
        return findIndex(ids, id => editedPlugin === id) > -1 && key === 'enabled' && value === false ?
            Rx.Observable.of(setEditedPlugin()) :
            Rx.Observable.empty();
    });

/**
 * Handle plugin editing
 * @memberof epics.contextcreator
 * @param {observable} action$ manages `EDIT_PLUGIN`
 * @param {object} store
 */
export const editPluginEpic = (action$, store) => action$
    .ofType(EDIT_PLUGIN)
    .switchMap(({pluginName}) => {
        const state = store.getState();
        const editedPluginName = editedPluginSelector(state);
        const editedCfg = editedCfgSelector(state);

        const endActions = [setEditedPlugin(pluginName), setEditedCfg(pluginName)];

        if (editedPluginName && editedCfg) {
            try {
                const parsedCfg = JSON.parse(editedCfg);
                return Rx.Observable.of(changePluginsKey([editedPluginName], 'pluginConfig.cfg', parsedCfg), ...endActions);
            } catch (e) {
                return Rx.Observable.of(
                    error({
                        title: 'contextCreator.configurePlugins.saveCfgErrorNotification.title',
                        message: 'contextCreator.configurePlugins.saveCfgErrorNotification.message',
                        position: "tc",
                        autoDismiss: 10,
                        values: {
                            pluginName: editedPluginName,
                            error: e.message
                        }
                    })
                );
            }
        }

        return Rx.Observable.of(...endActions);
    });
