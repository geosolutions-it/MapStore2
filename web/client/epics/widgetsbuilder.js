/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Rx = require('rxjs');
const {
    NEW, INSERT, EDIT, OPEN_FILTER_EDITOR, NEW_CHART,
    editNewWidget,
    onEditorChange
} = require('../actions/widgets');
const {closeFeatureGrid} = require('../actions/featuregrid');

const {
    drawSupportReset
} = require('../actions/draw');
const {QUERY_FORM_SEARCH, loadFilter} = require('../actions/queryform');
const {setControlProperty, TOGGLE_CONTROL} = require('../actions/controls');
const {ADD_LAYER} = require('../actions/layers');
const {LOCATION_CHANGE} = require('connected-react-router');

const {featureTypeSelected} = require('../actions/wfsquery');
const {getWidgetLayer, getEditingWidgetFilter} = require('../selectors/widgets');
const {wfsFilter} = require('../selectors/query');
const {widgetBuilderAvailable} = require('../selectors/controls');
const getFTSelectedArgs = (state) => {
    let layer = getWidgetLayer(state);
    let url = layer.search && layer.search.url;
    let typeName = layer.name;
    return [url, typeName];
};
module.exports = {
    openWidgetEditor: (action$, {getState = () => {}} = {}) => action$.ofType(NEW, EDIT, NEW_CHART)
        .filter(() => widgetBuilderAvailable(getState()))
        .switchMap(() => Rx.Observable.of(
            setControlProperty("widgetBuilder", "enabled", true),
            setControlProperty("metadataexplorer", "enabled", false)
        )),
    closeWidgetEditorOnFinish: (action$, {getState = () => {}} = {}) => action$.ofType(INSERT, ADD_LAYER)
        .filter(() => widgetBuilderAvailable(getState()))
        .switchMap(() => Rx.Observable.of(setControlProperty("widgetBuilder", "enabled", false))),
    initEditorOnNew: (action$, {getState = () => {}} = {}) => action$.ofType(NEW)
        .filter(() => widgetBuilderAvailable(getState()))
        .switchMap((w) => Rx.Observable.of(editNewWidget({
            legend: false,
            mapSync: true,
            cartesian: true,
            yAxis: true,
            ...w,
            // override action's type
            type: undefined
        }, {step: 0}))),
    initEditorOnNewChart: (action$, {getState = () => {}} = {}) => action$.ofType(NEW_CHART)
        .filter(() => widgetBuilderAvailable(getState()))
        .switchMap((w) => Rx.Observable.of(closeFeatureGrid(), editNewWidget({
            legend: false,
            mapSync: true,
            cartesian: true,
            yAxis: true,
            widgetType: "chart",
            filter: wfsFilter(getState()),
            ...w,
            // override action's type
            type: undefined
        }, {step: 0}), onEditorChange("returnToFeatureGrid", true))),
    /**
     * Manages interaction with QueryPanel and widgetBuilder
     */
    handleWidgetsFilterPanel: (action$, {getState = () => {}} = {}) =>
        action$.ofType(OPEN_FILTER_EDITOR)
            .filter(() => widgetBuilderAvailable(getState()))
            .switchMap(() =>
                // open and setup query form
                Rx.Observable.of(
                    featureTypeSelected(...getFTSelectedArgs(getState())),
                    loadFilter(getEditingWidgetFilter(getState())),
                    setControlProperty("widgetBuilder", "enabled", false),
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
                        Rx.Observable.of(drawSupportReset(),
                            setControlProperty('queryPanel', "enabled", false)
                        )
                    )
            )

};
