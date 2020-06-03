/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import { has, isEqual } from 'lodash';
import uuidv1 from 'uuid/v1';

import GeoStoreApi from '../api/GeoStoreDAO';
import {
    edit,
    setContent,
    setEditorState,
    setSettings,
    setEditedSettings,
    saveSuccess,
    loading,
    CLOSE,
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
    detailsControlEnabledSelector,
    contentSelector,
    editedSettingsSelector,
    editingSelector,
    settingsSelector
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
    showAtStartup: false
};

export const onDetailsControlEnabledChangeEpic = (action$, store) => Observable.merge(
    action$.ofType(TOGGLE_CONTROL, SET_CONTROL_PROPERTY).filter(({control, property}) => control === 'details' && property === 'enabled'),
    action$.ofType(SET_CONTROL_PROPERTIES).filter(({control, properties}) => control === 'details' && has(properties, 'enabled'))
)
    .switchMap(() => {
        const state = store.getState();
        const content = contentSelector(state);
        const detailsUri = mapInfoDetailsUriFromIdSelector(state);
        const detailsId = getIdFromUri(detailsUri);
        const detailsEnabled = detailsControlEnabledSelector(state);
        const settings = settingsSelector(state);

        const loadDataFlow = Observable.defer(() => GeoStoreApi.getData(detailsId).then(data => data))
            .switchMap((details) => {
                return Observable.of(
                    setContent(details)
                );
            })
            .catch(() => {
                return Observable.of(
                    basicError({message: "maps.feedback.errorFetchingDetailsOfMap"}),
                    setContent(NO_DETAILS_AVAILABLE)
                );
            });

        return detailsEnabled ?
            Observable.of(edit(), setEditedSettings(settings), closeFeatureGrid()).concat(content === null || content === undefined ? loadDataFlow : Observable.empty()) :
            Observable.of(setEditedSettings());
    });

export const mapCloseDetailsEpic = (action$, store) => action$
    .ofType(CLOSE)
    .switchMap(() => {
        const state = store.getState();
        const settings = settingsSelector(state);
        const editedSettings = editedSettingsSelector(state);
        const mapId = mapIdSelector(state);

        return editedSettings && !isEqual(settings, editedSettings) ?
            Observable.defer(() => GeoStoreApi.updateResourceAttribute(mapId, 'detailsSettings', JSON.stringify(editedSettings), 'STRING', {}))
                .switchMap(() => Observable.of(
                    basicSuccess({message: "details.feedback.settingsSavedSuccessfully"}),
                    setSettings(editedSettings),
                    setControlProperty('details', 'enabled', false)
                ))
                .let(wrapStartStop(
                    loading(true, 'settingsSaving'),
                    loading(false, 'settingsSaving'),
                    () => Observable.of(basicError({message: 'details.feedback.savingError'}))
                )) :
            Observable.of(setControlProperty('details', 'enabled', false));
    });

export const mapSaveDetailsEpic = (action$, store) => action$
    .ofType(SAVE)
    .switchMap(({content}) => {
        const state = store.getState();
        const editing = editingSelector(state);
        const detailsUri = mapInfoDetailsUriFromIdSelector(state);
        const detailsId = getIdFromUri(detailsUri);
        const mapId = mapIdSelector(state);

        const editingFlow = Observable.defer(() => GeoStoreApi.getPermissions(mapId)).switchMap(permissions => {
            const createOrUpdateDetailsFlow =
                detailsUri && detailsId ?
                    Observable.defer(() => GeoStoreApi.putResource(detailsId, content, {})).map(res => res.data) :
                    Observable.defer(() => GeoStoreApi.createResource({name: uuidv1()}, content, 'DETAILS', {}))
                        .map(res => res.data)
                        .switchMap(resId => {
                            const uri = ConfigUtils.getDefaults().geoStoreUrl + "data/" + resId + "/raw?decode=datauri";

                            return Observable.defer(() => GeoStoreApi.updateResourceAttribute(mapId, 'details', uri, 'STRING', {}))
                                .concat(Observable.of(resId));
                        });
            return createOrUpdateDetailsFlow.switchMap(resId => Observable.defer(
                () => GeoStoreApi.updateResourcePermissions(resId, fixPermissions(permissions))
            ).switchMap(() => Observable.of(basicSuccess({message: "details.feedback.savedSuccessfully"}), setContent(content), saveSuccess())));
        });

        return (editing ? editingFlow : Observable.empty())
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

export const mapOnSaveDetailsSuccess = (action$) => action$
    .ofType(SAVE_SUCCESS)
    .flatMap(() => Observable.of(
        edit()
    ));

export const mapDetailsCancelEditEpic = (action$) => action$
    .ofType(CANCEL_EDIT)
    .flatMap(() => Observable.of(
        setEditorState(),
        edit()
    ));
