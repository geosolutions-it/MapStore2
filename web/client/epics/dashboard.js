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
    setEditing
} = require('../actions/dashboard');
const {
    setControlProperty,
    TOGGLE_CONTROL
} = require('../actions/controls');
const {
    featureTypeSelected
} = require('../actions/wfsquery');
const {
    loadFilter,
    QUERY_FORM_SEARCH
} = require('../actions/queryform');
const {
    isDashboardEditing,
    isDashboardAvailable = () => true
} = require('../selectors/dashboard');
const {
    getEditingWidgetLayer,
    getEditingWidgetFilter
} = require('../selectors/widgets');

const {LOCATION_CHANGE} = require('react-router-redux');
const getFTSelectedArgs = (state) => {
    let layer = getEditingWidgetLayer(state);
    let url = layer.search && layer.search.url;
    let typeName = layer.name;
    return [url, typeName];
};

module.exports = {
    openDashboardWidgetEditor: (action$, {getState = () => {}} = {}) => action$.ofType(NEW, EDIT)
        .filter( () => isDashboardAvailable(getState()))
        .switchMap(() => Rx.Observable.of(
            setEditing(true)
    )),
    closeDashboardWidgetEditorOnFinish: (action$, {getState = () => {}} = {}) => action$.ofType(INSERT)
        .filter( () => isDashboardAvailable(getState()))
        .switchMap(() => Rx.Observable.of(setEditing(false))),
    initDashboardEditorOnNew: (action$, {getState = () => {}} = {}) => action$.ofType(NEW)
        .filter( () => isDashboardAvailable(getState()))
        .switchMap((w) => Rx.Observable.of(editNewWidget({
            legend: false,
            mapSync: true,
            ...w
        }, {step: 0}))),
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
             )

};
