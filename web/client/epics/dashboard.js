/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Rx = require('rxjs');
const {
    NEW, INSERT, EDIT,
    editNewWidget
} = require('../actions/widgets');
const {
    setEditing
} = require('../actions/dashboard');
const {
    editingSelector: isEditing,
    isDashboardAvailable = () => true
} = require('../selectors/dashboard');

const {LOCATION_CHANGE} = require('react-router-redux');


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
        .filter( () => isEditing(getState()) )
        .switchMap(() => Rx.Observable.of(setEditing(false)))

};
