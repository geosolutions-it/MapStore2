/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';
import {omit, cloneDeep, get} from 'lodash';
import {push} from 'connected-react-router';

import ConfigUtils from '../utils/ConfigUtils';
import MapUtils from '../utils/MapUtils';

import {SAVE_CONTEXT, LOAD_CONTEXT, SET_CREATION_STEP, MAP_VIEWER_LOAD, MAP_VIEWER_RELOAD, CHANGE_ATTRIBUTE, contextSaved, setResource,
    startResourceLoad, loadFinished, isValidContextName, contextNameChecked, setCreationStep, contextLoadError, loading, mapViewerLoad,
    mapViewerLoaded} from '../actions/contextcreator';
import {newContextSelector, resourceSelector, creationStepSelector,
    mapConfigSelector, mapViewerLoadedSelector, contextNameCheckedSelector} from '../selectors/contextcreator';
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
import {createResource, updateResource, getResource, getResourceIdByName} from '../api/persistence';

const saveContextErrorStatusToMessage = (status) => {
    switch (status) {
    case 409:
        return 'contextCreator.saveErrorNotification.conflict';
    default:
        return 'contextCreator.saveErrorNotification.defaultMessage';
    }
};

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

        const mapConfig = MapUtils.saveMapConfiguration(map, layers, groups, backgrounds, textSearchConfig, additionalOptions);
        const newContext = {...context, mapConfig};
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

export const contextCreatorLoadContext = (action$, store) => action$
    .ofType(LOAD_CONTEXT)
    .switchMap(({id}) => (id === 'new' ?
        Rx.Observable.empty() :
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

export const loadMapViewerOnStepChange = (action$) => action$
    .ofType(SET_CREATION_STEP)
    .filter(({stepId}) => stepId === 'configure-map')
    .switchMap(() => Rx.Observable.of(mapViewerLoad()));

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
