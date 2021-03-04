/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Rx from 'rxjs';

import { NEW, INSERT, EDIT, OPEN_FILTER_EDITOR, editNewWidget, onEditorChange } from '../actions/widgets';

import {
    setEditing,
    dashboardSaved,
    dashboardLoaded,
    dashboardLoading,
    triggerSave,
    triggerSaveAs,
    loadDashboard,
    dashboardSaveError,
    SAVE_DASHBOARD,
    LOAD_DASHBOARD,
    dashboardLoadError
} from '../actions/dashboard';

import { setControlProperty, TOGGLE_CONTROL } from '../actions/controls';
import { featureTypeSelected } from '../actions/wfsquery';
import { show, error } from '../actions/notifications';
import { loadFilter, QUERY_FORM_SEARCH } from '../actions/queryform';
import { CHECK_LOGGED_USER, LOGIN_SUCCESS, LOGOUT } from '../actions/security';
import { isDashboardEditing, isDashboardAvailable } from '../selectors/dashboard';
import { isLoggedIn } from '../selectors/security';
import { getEditingWidgetLayer, getEditingWidgetFilter } from '../selectors/widgets';
import { pathnameSelector } from '../selectors/router';
import { createResource, updateResource, getResource } from '../api/persistence';
import { wrapStartStop } from '../observables/epics';
import { LOCATION_CHANGE, push } from 'connected-react-router';
const getFTSelectedArgs = (state) => {
    let layer = getEditingWidgetLayer(state);
    let url = layer.search && layer.search.url;
    let typeName = layer.name;
    return [url, typeName];
};

// Basic interactions with dashboard editor
export const openDashboardWidgetEditor = (action$, {getState = () => {}} = {}) => action$.ofType(NEW, EDIT)
    .filter( () => isDashboardAvailable(getState()))
    .switchMap(() => Rx.Observable.of(
        setEditing(true)
    ));
// Basic interactions with dashboard editor
export const closeDashboardWidgetEditorOnFinish = (action$, {getState = () => {}} = {}) => action$.ofType(INSERT)
    .filter( () => isDashboardAvailable(getState()))
    .switchMap(() => Rx.Observable.of(setEditing(false)));

// Basic interactions with dashboard editor
export const initDashboardEditorOnNew = (action$, {getState = () => {}} = {}) => action$.ofType(NEW)
    .filter( () => isDashboardAvailable(getState()))
    .switchMap((w) => Rx.Observable.of(editNewWidget({
        legend: false,
        mapSync: false,
        cartesian: true,
        yAxis: true,
        ...w,
        // override action's type
        type: undefined
    }, {step: 0})));
// Basic interactions with dashboard editor
export const closeDashboardEditorOnExit = (action$, {getState = () => {}} = {}) => action$.ofType(LOCATION_CHANGE)
    .filter( () => isDashboardAvailable(getState()))
    .filter( () => isDashboardEditing(getState()) )
    .switchMap(() => Rx.Observable.of(setEditing(false)));
/**
     * Manages interaction with QueryPanel and Dashboard
     */
export const handleDashboardWidgetsFilterPanel = (action$, {getState = () => {}} = {}) => action$.ofType(OPEN_FILTER_EDITOR)
    .filter(() => isDashboardAvailable(getState()))
    .switchMap(() =>
    // open and setup query form
        Rx.Observable.of(
            featureTypeSelected(...getFTSelectedArgs(getState())),
            loadFilter(getEditingWidgetFilter(getState())),
            setControlProperty('queryPanel', "enabled", true)
            // wait for any filter update(search) or query form close event
        ).concat(
            Rx.Observable.race(
                action$.ofType(QUERY_FORM_SEARCH).take(1),
                action$.ofType(TOGGLE_CONTROL).filter(({control, property} = {}) => control === "queryPanel" && (!property || property === "enabled")).take(1)
            )
            // then close the query panel, open widget form and update the current filter for the widget in editing
                .switchMap( action =>
                    (action.filterObj
                        ? Rx.Observable.of(onEditorChange("filter", action.filterObj))
                        : Rx.Observable.empty()
                    )
                        .merge(Rx.Observable.of(
                            setControlProperty("widgetBuilder", "enabled", true)
                        ))
                )
            // if the widgetBuilder is closed or the page is changed, do not listen anymore
        ).takeUntil(
            action$.ofType(LOCATION_CHANGE, EDIT)
                .merge(action$.ofType(TOGGLE_CONTROL).filter(({control, property} = {}) => control === "widgetBuilder" && (!property === false))))
            .concat(
                Rx.Observable.of(// drawSupportReset(),
                    setControlProperty('queryPanel', "enabled", false)
                )
            )
    );
export const filterAnonymousUsersForDashboard = (actions$, store) => actions$
    .ofType(CHECK_LOGGED_USER, LOGOUT)
    .filter(() => pathnameSelector(store.getState()) === "/dashboard")
    .switchMap( ({}) => {
        return !isLoggedIn(store.getState()) ? Rx.Observable.of(dashboardLoadError({status: 403})) : Rx.Observable.empty();
    });
// dashboard loading from resource ID.
export const loadDashboardStream = (action$, {getState = () => {}}) => action$
    .ofType(LOAD_DASHBOARD)
    .switchMap( ({id}) =>
        getResource(id)
            .map(({ data, ...resource }) => dashboardLoaded(resource, data))
            .let(wrapStartStop(
                dashboardLoading(true, "loading"),
                dashboardLoading(false, "loading"),
                e => {
                    const page = window.location.href.match('dashboard-embedded')
                        ? 'dashboardEmbedded'
                        : 'dashboard';
                    let message = page + ".errors.loading.unknownError";
                    if (e.status === 403 ) {
                        message = page + ".errors.loading.pleaseLogin";
                        if ( isLoggedIn(getState())) {
                            message = page + ".errors.loading.dashboardNotAccessible";
                        }
                    } if (e.status === 404) {
                        message = page + ".errors.loading.dashboardDoesNotExist";
                    }
                    return Rx.Observable.of(
                        error({
                            title: page + ".errors.loading.title",
                            message
                        }),
                        dashboardLoadError({...e, messageId: message})
                    );
                }
            ))
    );
export const reloadDashboardOnLoginLogout = (action$) =>
    action$.ofType(LOAD_DASHBOARD).switchMap(
        ({ id }) => action$
            .ofType(LOGIN_SUCCESS, LOGOUT)
            .switchMap(() => Rx.Observable.of(loadDashboard(id)).delay(1000))
            .takeUntil(action$.ofType(LOCATION_CHANGE))
    );
// saving dashboard flow (both creation and update)
export const saveDashboard = action$ => action$
    .ofType(SAVE_DASHBOARD)
    .exhaustMap(({resource} = {}) =>
        (!resource.id ? createResource(resource) : updateResource(resource))
            .switchMap(rid => Rx.Observable.of(
                dashboardSaved(rid),
                resource.id ? triggerSave(false) : triggerSaveAs(false),
                !resource.id
                    ? push(`/dashboard/${rid}`)
                    : loadDashboard(rid),
            ).merge(
                Rx.Observable.of(show({
                    id: "DASHBOARD_SAVE_SUCCESS",
                    title: "saveDialog.saveSuccessTitle",
                    message: "saveDialog.saveSuccessMessage"
                })).delay(!resource.id ? 1000 : 0) // delay to allow loading
            )
            )
            .let(wrapStartStop(
                dashboardLoading(true, "saving"),
                dashboardLoading(false, "saving")
            ))
            .catch(
                ({ status, statusText, data, message, ...other } = {}) => Rx.Observable.of(dashboardSaveError(status ? { status, statusText, data } : message || other), dashboardLoading(false, "saving"))
            )
    );


export default {
    openDashboardWidgetEditor,
    closeDashboardWidgetEditorOnFinish,
    initDashboardEditorOnNew,
    closeDashboardEditorOnExit,
    handleDashboardWidgetsFilterPanel,
    filterAnonymousUsersForDashboard,
    loadDashboardStream,
    reloadDashboardOnLoginLogout,
    saveDashboard
};
