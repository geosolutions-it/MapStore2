/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import { get } from 'lodash';
import uuidv1 from 'uuid/v1';

import GeoStoreApi from '../api/GeoStoreDAO';
import {
    edit,
    setContent,
    setEditedContent,
    setSettings,
    setEditedSettings,
    saveSuccess,
    loading,
    SAVE,
    SAVE_SUCCESS,
    CANCEL_EDIT
} from '../actions/details';
import { NO_DETAILS_AVAILABLE, DETAILS_LOADED } from '../actions/maps';
import {
    setControlProperty,
    TOGGLE_CONTROL,
    SET_CONTROL_PROPERTY,
    SET_CONTROL_PROPERTIES
} from '../actions/controls';
import { closeFeatureGrid } from '../actions/featuregrid';
import {
    contentSelector,
    editedContentSelector,
    editedSettingsSelector,
    editingSelector
} from '../selectors/details';
import {
    mapInfoDetailsUriFromIdSelector,
    mapIdSelector
} from '../selectors/map';

import { getIdFromUri } from '../utils/MapUtils';
import { basicSuccess, basicError } from '../utils/NotificationUtils';
import { fixPermissions } from '../utils/GeoStoreUtils';
import ConfigUtils from '../utils/ConfigUtils';
import { wrapStartStop } from '../observables/epics';

const defaultSettings = {
    showAsModal: false,
    showAtStartup: true
};

export const setEditedContentOnEditEpic = (action$, store) => action$
    .ofType(TOGGLE_CONTROL, SET_CONTROL_PROPERTY, SET_CONTROL_PROPERTIES)
    .filter(({control}) => control === 'details')
    .switchMap(() => {
        const state = store.getState();
        const content = contentSelector(state);
        const editedContent = editedContentSelector(state);
        const detailsUri = mapInfoDetailsUriFromIdSelector(state);
        const detailsId = getIdFromUri(detailsUri);

        const loadDataFlow = Observable.defer(() => GeoStoreApi.getData(detailsId).then(data => data))
            .switchMap((details) => {
                return Observable.of(
                    closeFeatureGrid(),
                    setContent(details)
                );
            })
            .catch(() => {
                return Observable.of(
                    basicError({message: "maps.feedback.errorFetchingDetailsOfMap"}),
                    setContent(NO_DETAILS_AVAILABLE)
                );
            });

        const dataLoadedFlow = get(state, 'controls.details.enabled') && (editedContent === null || editedContent === undefined) ?
            Observable.of(setEditedContent(content)) :
            Observable.empty();

        return Observable.of(edit()).concat(content === null || content === undefined ? loadDataFlow : dataLoadedFlow);
    });

export const mapSaveDetailsEpic = (action$, store) => action$
    .ofType(SAVE)
    .switchMap(() => {
        const state = store.getState();
        const editing = editingSelector(state);
        const editedContent = editedContentSelector(state);
        const editedSettings = editedSettingsSelector(state);
        const detailsUri = mapInfoDetailsUriFromIdSelector(state);
        const detailsId = getIdFromUri(detailsUri);
        const mapId = mapIdSelector(state);

        const editingSettingsFlow =
            Observable.defer(() => GeoStoreApi.updateResourceAttribute(mapId, 'detailsSettings', JSON.stringify(editedSettings), 'STRING', {}))
                .switchMap(() => Observable.of(basicSuccess({message: "details.feedback.settingsSavedSuccessfully"}), saveSuccess()));

        const editingFlow = Observable.defer(() => GeoStoreApi.getPermissions(mapId)).switchMap(permissions => {
            const createOrUpdateDetailsFlow =
                detailsUri && detailsId ?
                    Observable.defer(() => GeoStoreApi.putResource(detailsId, editedContent, {})).map(res => res.data) :
                    Observable.defer(() => GeoStoreApi.createResource({name: uuidv1()}, editedContent, 'DETAILS', {}))
                        .map(res => res.data)
                        .switchMap(resId => {
                            const uri = ConfigUtils.getDefaults().geoStoreUrl + "data/" + resId + "/raw?decode=datauri";

                            return Observable.defer(() => GeoStoreApi.updateResourceAttribute(mapId, 'details', uri, 'STRING', {}))
                                .concat(Observable.of(resId));
                        });
            return createOrUpdateDetailsFlow.switchMap(resId => Observable.defer(
                () => GeoStoreApi.updateResourcePermissions(resId, fixPermissions(permissions))
            ).switchMap(() => Observable.of(basicSuccess({message: "details.feedback.savedSuccessfully"}), saveSuccess())));
        });

        return (editing === 'content' ? editingFlow : editing === 'settings' ? editingSettingsFlow : Observable.empty())
            .let(wrapStartStop(
                loading(true, 'detailsSaving'),
                loading(false, 'detailsSaving'),
                () => Observable.of(basicError({message: 'details.feedback.savingError'}))
            ));
    });

export const processDetailsSettingsEpic = (action$) => action$
    .ofType(DETAILS_LOADED)
    .switchMap(({detailsSettings}) => {
        const settings = detailsSettings || defaultSettings;

        return Observable.of(
            setSettings(settings),
            ...(settings.showAtStartup ? [setControlProperty('details', 'enabled', true)] : []),
        );
    });

export const mapOnSaveDetailsSuccess = (action$, store) => action$
    .ofType(SAVE_SUCCESS)
    .flatMap(() => Observable.of(
        ...(editingSelector(store.getState()) === 'content' ?
            [setContent(editedContentSelector(store.getState())), setEditedContent()] :
            [setSettings(editedSettingsSelector(store.getState())), setEditedSettings()]),
        edit()
    ));

export const mapDetailsCancelEditEpic = (action$) => action$
    .ofType(CANCEL_EDIT)
    .flatMap(() => Observable.of(
        setEditedContent(),
        setEditedSettings(),
        edit()
    ));
