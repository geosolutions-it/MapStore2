/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const {createSink} = require('recompose');
const { DEFAULT_TARGET } = require('../../actions/widgets');
const expect = require('expect');
const {
    getFloatingWidgets,
    getFloatingWidgetsLayout,
    getDashboardWidgets,
    getDashboardWidgetsLayout,
    getEditingWidget,
    getEditingWidgetLayer,
    getEditingWidgetFilter,
    getEditorSettings,
    getWidgetLayer,
    dependenciesSelector
} = require('../widgets');
const {set} = require('../../utils/ImmutableUtils');
describe('widgets selectors', () => {
    it('getFloatingWidgets', () => {
        const state = set(`widgets.containers[${DEFAULT_TARGET}].widgets`, [{title: "TEST"}], {});
        expect(getFloatingWidgets(state)).toExist();
        expect(getFloatingWidgets(state)[0]).toExist();
        expect(getFloatingWidgets(state)[0].title).toBe("TEST");
    });
    it('getFloatingWidgetsLayout', () => {
        const state = set(`widgets.containers[${DEFAULT_TARGET}].layouts`, [{ title: "TEST" }], {});
        expect(getFloatingWidgetsLayout(state)).toExist();
        expect(getFloatingWidgetsLayout(state)[0]).toExist();
        expect(getFloatingWidgetsLayout(state)[0].title).toBe("TEST");
    });
    it('getFloatingWidgets', () => {
        const state = set(`widgets.containers[${DEFAULT_TARGET}].widgets`, [{ title: "TEST" }], {});
        expect(getDashboardWidgets(state)).toExist();
        expect(getDashboardWidgets(state)[0]).toExist();
        expect(getDashboardWidgets(state)[0].title).toBe("TEST");
    });
    it('getFloatingWidgetsLayout', () => {
        const state = set(`widgets.containers[${DEFAULT_TARGET}].layouts`, [{ title: "TEST" }], {});
        expect(getDashboardWidgetsLayout(state)).toExist();
        expect(getDashboardWidgetsLayout(state)[0]).toExist();
        expect(getDashboardWidgetsLayout(state)[0].title).toBe("TEST");
    });
    it('getEditingWidget', () => {
        const state = set(`widgets.builder.editor`, { title: "TEST" }, {});
        expect(getEditingWidget(state)).toExist();
        expect(getEditingWidget(state).title).toBe("TEST");
    });
    it('getEditingWidgetLayer', () => {
        const state = set(`widgets.builder.editor`, { layer: { name: "TEST"}}, {});
        expect(getEditingWidgetLayer(state)).toExist();
        expect(getEditingWidgetLayer(state).name).toBe("TEST");
    });
    it('getEditingWidgetFilter', () => {
        const state = set(`widgets.builder.editor`, { filter: { name: "TEST" } }, {});
        expect(getEditingWidgetFilter(state)).toExist();
    });
    it('getEditorSettings', () => {
        const state = set(`widgets.builder.settings`, { flag: true }, {});
        expect(getEditorSettings(state)).toExist();
        expect(getEditorSettings(state).flag).toBe(true);
    });
    it('getWidgetLayer', () => {
        const tocLayerState = {'layers': { selected: ["TEST1"], flat: [{id: "TEST1", name: "TEST1"}] }};
        expect(getWidgetLayer(tocLayerState)).toExist();
        expect(getWidgetLayer(tocLayerState).name).toBe("TEST1");
        const dashboardNoLayer = set('dashboard.editing', true, set('dashboard.editor.available', true, tocLayerState));
        expect(getWidgetLayer(dashboardNoLayer)).toNotExist();
        const widgetLayer = set(`widgets.builder.editor`, { layer: { name: "TEST2" } }, dashboardNoLayer);
        expect(getWidgetLayer(widgetLayer).name).toBe("TEST2");
    });
    it('dependenciesSelector', () => {
        const state = {
            widgets: {
                dependencies: {
                    a: "mydep.a",
                    b: "mydep.b",
                    c: "map.abc"
                }
             },
             mydep: {
                 a: "A",
                 b: "B"
             },
             map: {
                 present: {
                     abc: "ABC"
                 }
             }
        };
        const dependencies = dependenciesSelector(state);
        expect(dependencies.a).toBe("A");
        expect(dependencies.b).toBe("B");
        expect(dependencies.c).toBe("ABC");
    });

});
