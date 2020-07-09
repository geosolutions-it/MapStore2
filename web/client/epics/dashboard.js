/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Rx = require('rxjs');
const {
    NEW, INSERT, EDIT, OPEN_FILTER_EDITOR,
    editNewWidget, onEditorChange
} = require('../actions/widgets');
const {
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
} = require('../actions/dashboard');
const {
    setControlProperty,
    TOGGLE_CONTROL
} = require('../actions/controls');
const {
    featureTypeSelected
} = require('../actions/wfsquery');
const {
    show,
    error
} = require('../actions/notifications');
const {
    loadFilter,
    QUERY_FORM_SEARCH
} = require('../actions/queryform');
const {
    CHECK_LOGGED_USER,
    LOGIN_SUCCESS,
    LOGOUT
} = require('../actions/security');
const {
    isDashboardEditing,
    isDashboardAvailable = () => true
} = require('../selectors/dashboard');

const {
    isLoggedIn
} = require('../selectors/security');
const {
    getEditingWidgetLayer,
    getEditingWidgetFilter
} = require('../selectors/widgets');
const { pathnameSelector } = require('../selectors/router');

const {
    createResource,
    updateResource,
    getResource
} = require('../api/persistence');
const {
    wrapStartStop
} = require('../observables/epics');
const { LOCATION_CHANGE, push} = require('connected-react-router');
const getFTSelectedArgs = (state) => {
    let layer = getEditingWidgetLayer(state);
    let url = layer.search && layer.search.url;
    let typeName = layer.name;
    return [url, typeName];
};

module.exports = {
    // Basic interactions with dashboard editor
    openDashboardWidgetEditor: (action$, {getState = () => {}} = {}) => action$.ofType(NEW, EDIT)
        .filter( () => isDashboardAvailable(getState()))
        .switchMap(() => Rx.Observable.of(
            setEditing(true)
        )),
    // Basic interactions with dashboard editor
    closeDashboardWidgetEditorOnFinish: (action$, {getState = () => {}} = {}) => action$.ofType(INSERT)
        .filter( () => isDashboardAvailable(getState()))
        .switchMap(() => Rx.Observable.of(setEditing(false))),

    // Basic interactions with dashboard editor
    initDashboardEditorOnNew: (action$, {getState = () => {}} = {}) => action$.ofType(NEW)
        .filter( () => isDashboardAvailable(getState()))
        .switchMap((w) => Rx.Observable.of(editNewWidget({
            legend: false,
            mapSync: false,
            cartesian: true,
            yAxis: true,
            ...w,
            // override action's type
            type: undefined
        }, {step: 0}))),
    // Basic interactions with dashboard editor
    closeDashboardEditorOnExit: (action$, {getState = () => {}} = {}) => action$.ofType(LOCATION_CHANGE)
        .filter( () => isDashboardAvailable(getState()))
        .filter( () => isDashboardEditing(getState()) )
        .switchMap(() => Rx.Observable.of(setEditing(false))),
    /**
      * Manages interaction with QueryPanel and Dashboard
      */
    handleDashboardWidgetsFilterPanel: (action$, {getState = () => {}} = {}) => action$.ofType(OPEN_FILTER_EDITOR)
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
        ),
    filterAnonymousUsersForDashboard: (actions$, store) => actions$
        .ofType(CHECK_LOGGED_USER, LOGOUT)
        .filter(() => pathnameSelector(store.getState()) === "/dashboard")
        .switchMap( ({}) => {
            return !isLoggedIn(store.getState()) ? Rx.Observable.of(dashboardLoadError({status: 403})) : Rx.Observable.empty();
        }),
    // dashboard loading from resource ID.
    loadDashboardStream: (action$, {getState = () => {}}) => action$
        .ofType(LOAD_DASHBOARD)
        .switchMap( ({id}) =>
            getResource(id)
                .map(({ data, ...resource }) => dashboardLoaded(resource, data))
                .let(wrapStartStop(
                    dashboardLoading(true, "loading"),
                    dashboardLoading(false, "loading"),
                    e => {
                        let message = "dashboard.errors.loading.unknownError";
                        if (e.status === 403 ) {
                            message = "dashboard.errors.loading.pleaseLogin";
                            if ( isLoggedIn(getState())) {
                                message = "dashboard.errors.loading.dashboardNotAccessible";
                            }
                        } if (e.status === 404) {
                            message = "dashboard.errors.loading.dashboardDoesNotExist";
                        }
                        return Rx.Observable.of(
                            error({
                                title: "dashboard.errors.loading.title",
                                message
                            }),
                            dashboardLoadError({...e, messageId: message})
                        );
                    }
                ))
        ),
    reloadDashboardOnLoginLogout: (action$) =>
        action$.ofType(LOAD_DASHBOARD).switchMap(
            ({ id }) => action$
                .ofType(LOGIN_SUCCESS, LOGOUT)
                .switchMap(() => Rx.Observable.of(loadDashboard(id)).delay(1000))
                .takeUntil(action$.ofType(LOCATION_CHANGE))
        ),
    // saving dashboard flow (both creation and update)
    saveDashboard: action$ => action$
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
        )
};
