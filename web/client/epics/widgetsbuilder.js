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
const {setControlProperty} = require('../actions/controls');
module.exports = {
    openWidgetEditor: action$ => action$.ofType(NEW, EDIT)
        .switchMap(() => Rx.Observable.of(setControlProperty("widgetBulder", "enabled", true))),
    closeWidgetEditorOnFinish: action$ => action$.ofType(INSERT)
        .switchMap(() => Rx.Observable.of(setControlProperty("widgetBulder", "enabled", false))),
    initEditorOnNew: action$ => action$.ofType(NEW)
        .switchMap((w) => Rx.Observable.of(editNewWidget({
            legend: false,
            mapSync: true,
            ...w
        }, {step: 0})))
};
