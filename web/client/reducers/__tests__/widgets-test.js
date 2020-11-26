/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
    editWidget,
    editNewWidget,
    changeEditorSetting,
    onEditorChange,
    insertWidget,
    updateWidgetLayer,
    updateWidgetProperty,
    deleteWidget,
    changeLayout,
    clearWidgets,
    addDependency,
    removeDependency,
    resetDependencies,
    loadDependencies,
    toggleCollapse,
    toggleCollapseAll,
    toggleTray,
    toggleMaximize,
    DEFAULT_TARGET
} from '../../actions/widgets';

import { configureMap } from '../../actions/config';
import { dashboardLoaded } from '../../actions/dashboard';
import widgets from '../widgets';
import { getFloatingWidgets, getVisibleFloatingWidgets, getCollapsedIds } from '../../selectors/widgets';
import expect from 'expect';
import { find, get } from 'lodash';

describe('Test the widgets reducer', () => {
    it('initial state', () => {
        const state = widgets(undefined, {type: "START"});
        expect(state.containers).toExist();
        expect(state.dependencies.key).toBeFalsy();
        expect(state.dependencies.viewport).toBe("map.bbox");
        expect(state.dependencies.center).toBe("map.center");
        expect(state.dependencies.zoom).toBe("map.zoom");
    });
    it('editNewWidget', () => {
        const state = widgets(undefined, editNewWidget({a: "A"}, {step: 0}));
        expect(state.builder.editor.a).toBe("A");
        expect(state.builder.settings.step).toBe(0);
    });
    it('changeEditorSetting', () => {
        const state = widgets(undefined, changeEditorSetting("a", "A"));
        expect(state.builder.settings.a).toBe("A");
    });
    it('editWidget', () => {
        const state = widgets(undefined, editWidget({type: "bar"}));
        expect(state.builder.editor.type).toBe("bar");
        expect(state.builder.settings.step).toBe(1);
    });
    it('editWidget initial by kind of widget', () => {
        // default chart
        expect(widgets(undefined, editWidget({ type: "bar" })).builder.settings.step).toBe(1);
        // chart explicit
        expect(widgets(undefined, editWidget({ widgetType: "chart" })).builder.settings.step).toBe(1);
        // text explicit
        expect(widgets(undefined, editWidget({ widgetType: "text" })).builder.settings.step).toBe(0);
    });
    it('onEditorChange', () => {
        const state = widgets(undefined, onEditorChange("type", "bar"));
        expect(state.builder.editor.type).toBe("bar");
    });
    it('insertWidget', () => {
        const state = widgets(undefined, insertWidget({id: "1"}));
        expect(state.containers[DEFAULT_TARGET].widgets.length).toBe(1);
    });
    it('updateWidgetLayers', () => {
        const targetLayer = {
            name: "layer2",
            id: "2",
            visibility: true
        };
        const state = {
            containers: {
                [DEFAULT_TARGET]: {
                    widgets: [{
                        id: "widget1",
                        layer: {
                            visibility: false,
                            name: "layer",
                            id: "1"
                        }
                    }, {
                        id: "widget2",
                        layer: Object.assign({}, targetLayer)
                    }, {
                        id: "widget3",
                        layer: {
                            visibility: false,
                            name: "layer3",
                            id: "3"
                        }
                    }, {
                        id: "widget4",
                        layer: Object.assign({}, targetLayer)
                    }]
                }
            }
        };

        const newTargetLayer = Object.assign({}, targetLayer, {visibility: false});
        const newState = widgets(state, updateWidgetLayer(newTargetLayer));

        const widgetObjects = newState.containers[DEFAULT_TARGET].widgets;
        expect(widgetObjects.length).toBe(4);
        expect(widgetObjects[0].layer).toEqual(state.containers[DEFAULT_TARGET].widgets[0].layer);
        expect(widgetObjects[1].layer).toEqual(newTargetLayer);
        expect(widgetObjects[2].layer).toEqual(state.containers[DEFAULT_TARGET].widgets[2].layer);
        expect(widgetObjects[3].layer).toEqual(newTargetLayer);
    });
    it('deleteWidget', () => {
        const state = {
            containers: {
                [DEFAULT_TARGET]: {
                    widgets: [{
                        id: "1"
                    }]
                }
            }
        };
        const newState = widgets(state, deleteWidget({id: "1"}));
        expect(newState.containers[DEFAULT_TARGET].widgets.length).toBe(0);
    });
    it('configureMap', () => {
        const state = widgets(undefined, configureMap({widgetsConfig: {widgets: [{id: "1"}]}}));
        expect(state.containers[DEFAULT_TARGET].widgets.length).toBe(1);
    });
    it('changeLayout', () => {
        const L = {lg: []};
        const AL = {md: []};
        const state = widgets(undefined, changeLayout(L, AL));
        expect(state.containers[DEFAULT_TARGET].layout).toBe(L);
        expect(state.containers[DEFAULT_TARGET].layouts).toBe(AL);
    });
    it('clearWidgets', () => {
        const state = {
            containers: {
                [DEFAULT_TARGET]: {
                    widgets: [{
                        id: "1"
                    }]
                }
            }
        };
        const newState = widgets(state, clearWidgets());
        expect(newState.containers[DEFAULT_TARGET].widgets.length).toBe(0);
    });
    it('widgets addDependency', () => {
        const action = addDependency("key", "value");
        const state = widgets({ dependencies: {} }, action);
        expect(state).toExist();
        expect(state.dependencies.key).toBe("value");
    });
    it('widgets removeDependency', () => {
        const action = removeDependency("key");
        const state = widgets({dependencies: {key: "value"}}, action);
        expect(state).toExist();
        expect(state.dependencies.key).toBeFalsy();
    });
    it('widgets loadDependencies', () => {
        const action = loadDependencies({key: "value"});
        const state = widgets( undefined, action);
        expect(state).toExist();
        expect(state.dependencies.key).toBe("value");
    });
    it('widgets resetDependencies', () => {
        const action = resetDependencies();
        const state = widgets( {dependencies: {key: "value"}}, action);
        expect(state).toExist();
        expect(state.dependencies.key).toBeFalsy();
        expect(state.dependencies.viewport).toBe("map.bbox");
        expect(state.dependencies.center).toBe("map.center");
        expect(state.dependencies.zoom).toBe("map.zoom");
    });
    it('widgets dashboardLoaded', () => {
        const widgetsData = { widgets: [{}] };
        const action = dashboardLoaded("RESOURCE", widgetsData);
        const state = widgets( undefined, action);
        expect(state).toExist();
        expect(state.containers[DEFAULT_TARGET].widgets).toExist();
        expect(state.containers[DEFAULT_TARGET].widgets.length).toBe(1);
    });
    it('widgets toggleCollapse and toggleCollapseAll', () => {
        const {initialState, changeLayoutAction} = require('../../test-resources/widgets/layout-state-collapse.js');
        const widgetToCollapse = getFloatingWidgets({
            widgets: initialState
        })[0];
        const action = toggleCollapse(widgetToCollapse);
        let ws = widgets(initialState, action);
        expect(ws).toExist();
        expect(getCollapsedIds({ widgets: ws })).toExist();
        expect(getCollapsedIds({ widgets: ws }).length).toBe(1);

        // verify also selector
        expect(getVisibleFloatingWidgets({ widgets: initialState }).length).toBe(3);
        expect(getVisibleFloatingWidgets({ widgets: ws }).length).toBe(2);
        let collapsedState = ws.containers[DEFAULT_TARGET].collapsed[widgetToCollapse.id];
        expect(collapsedState).toExist();
        // check the layout is saved
        expect(collapsedState.layout).toBe(find(initialState.containers[DEFAULT_TARGET].layout, {i: widgetToCollapse.id}));
        // check the layouts are saved for every break point.
        Object.keys(collapsedState.layouts).forEach( breakPoint => {
            const collapsedLayout = collapsedState.layouts[breakPoint];
            expect(collapsedLayout).toBe(
                find(initialState.containers[DEFAULT_TARGET].layouts[breakPoint], { i: widgetToCollapse.id })
            );
        });

        // the layout parts are still there after the collapse action
        // waiting for the automatic trigger by the react-grid-layout lib
        // this checks before the change layout event simulation are not mandatory for the functionality
        // it's only a double check that the parts was existing and are removed after change layout simulation.
        expect(find(ws.containers[DEFAULT_TARGET].layout, { i: widgetToCollapse.id })).toExist();
        Object.keys(ws.containers[DEFAULT_TARGET].layouts).forEach(breakPoint => {
            expect(find(ws.containers[DEFAULT_TARGET].layouts[breakPoint], { i: widgetToCollapse.id })).toExist();
        });
        // change layout simulation
        ws = widgets(ws, changeLayoutAction);
        // now layouts are removed
        expect(find(ws.containers[DEFAULT_TARGET].layout, { i: widgetToCollapse.id })).toNotExist();
        Object.keys(ws.containers[DEFAULT_TARGET].layouts).forEach(breakPoint => {
            expect(find(ws.containers[DEFAULT_TARGET].layouts[breakPoint], { i: widgetToCollapse.id })).toNotExist();
        });
        // second call to toggleCollapse for the same widget triggers expand
        ws = widgets(ws, action);
        expect(ws).toExist();
        expect(getCollapsedIds({ widgets: ws })).toExist();
        expect(getCollapsedIds({ widgets: ws }).length).toBe(0);
        // check the collapsed state is not present anymore for the widget
        expect(ws.containers[DEFAULT_TARGET].collapsed[widgetToCollapse.id]).toNotExist();
        // check the layout is restored
        expect(find(ws.containers[DEFAULT_TARGET].layout, { i: widgetToCollapse.id })).toExist();
        // check the layouts are restored for every break point.
        Object.keys(ws.containers[DEFAULT_TARGET].layouts).forEach(breakPoint => {
            expect(
                find(ws.containers[DEFAULT_TARGET].layouts[breakPoint], { i: widgetToCollapse.id })
            ).toExist();
        });
        // verify also selector
        expect(getVisibleFloatingWidgets({ widgets: ws }).length).toBe(3);

        // check static (pinned) widget do not collapse
        const staticState = getFloatingWidgets({
            widgets: initialState
        })[2];
        const staticAction = toggleCollapse(staticState);
        const wsStatic = widgets(ws, staticAction);
        // nothing changed
        expect(wsStatic).toBe(ws);
        expect(getVisibleFloatingWidgets({ widgets: wsStatic }).length).toBe(3);
        // check collapse all
        const collapseAllState = widgets(wsStatic, toggleCollapseAll());
        // collapse all widgets
        expect(Object.keys(collapseAllState.containers[DEFAULT_TARGET].collapsed).length).toBe(2);
        // except static (pinned)
        expect(getVisibleFloatingWidgets({ widgets: collapseAllState }).length).toBe(1);
    });
    it('widgets toggleTray', () => {
        expect(widgets(undefined, {type: "NO_ACTION"}).tray).toBeFalsy();
        const action = toggleTray(true);
        const state = widgets( undefined, action);
        expect(state).toExist();
        expect(state.tray).toBe(true);
        expect(widgets(state, toggleTray(false)).tray).toBe(false);
    });
    it('widgets updateWidgetProperty', () => {
        const {initialState} = require('../../test-resources/widgets/layout-state-collapse.js');
        const id = "a7122cc0-f7a9-11e8-8602-03b7e0c9537b";
        const state = widgets({
            ...initialState
        }, updateWidgetProperty(id, "key", "value", "replace"));
        const widget = find(get(state, `containers.floating.widgets`), {
            id
        });
        expect(widget).toExist();
        expect(widget.key).toBe("value");
    });
    it('widgets updateWidgetProperty, merge mode', () => {
        const {initialStateWithLayers} = require('../../test-resources/widgets/layout-state-collapse.js');
        const id = "a7122cc0-f7a9-11e8-8602-03b7e0c9537b";
        const state = widgets({
            ...initialStateWithLayers
        }, updateWidgetProperty(id, "map", {zoom: 4}, "merge"));
        const widget = find(get(state, `containers.floating.widgets`), {
            id
        });
        expect(widget).toExist();
        expect(widget.map.zoom).toBe(4);
        expect(widget.map.layers.length).toBe(1);
        expect(widget.map.layers[0].params.CQL_FILTER).toBe("some cql");
    });
    it('widgets toggleMaximize', () => {
        const {initialState} = require('../../test-resources/widgets/layout-state-collapse.js');
        const id = 'a7122cc0-f7a9-11e8-8602-03b7e0c9537b';
        const widgetToMaximize = initialState.containers.floating.widgets.filter(w => w.id === id)[0];

        // first toggle
        let resultState = widgets({
            ...initialState
        }, toggleMaximize(widgetToMaximize));

        expect(resultState).toExist();
        let floating = resultState.containers.floating;
        expect(floating).toExist();
        expect(floating.layout).toExist();
        expect(floating.layout.length).toBe(1);
        expect(floating.layout[0].i).toBe(id);
        expect(floating.layout[0].x).toBe(0);
        expect(floating.layout[0].y).toBe(0);
        expect(floating.layout[0].w).toBe(1);
        expect(floating.layout[0].h).toBe(1);
        expect(floating.layouts).toExist();
        expect(floating.layouts.xxs).toExist();
        expect(floating.layouts.xxs.length).toBe(1);
        expect(floating.layouts.xxs[0].i).toBe(id);
        expect(floating.layouts.xxs[0].x).toBe(0);
        expect(floating.layouts.xxs[0].y).toBe(0);
        expect(floating.layouts.xxs[0].w).toBe(1);
        expect(floating.layouts.xxs[0].h).toBe(1);
        expect(floating.maximized).toExist();
        expect(floating.maximized.layout).toEqual(initialState.containers.floating.layout);
        expect(floating.maximized.layouts).toEqual(initialState.containers.floating.layouts);
        expect(floating.maximized.widget).toEqual(widgetToMaximize);
        expect(floating.widgets).toExist();
        const newWidget = floating.widgets.filter(w => w.id === id)[0];
        expect(newWidget).toExist();
        expect(newWidget.dataGrid).toExist();
        expect(newWidget.dataGrid.isDraggable).toBe(false);
        expect(newWidget.dataGrid.isResizable).toBe(false);

        // second toggle
        resultState = widgets({
            ...resultState
        }, toggleMaximize(widgetToMaximize));

        expect(resultState).toExist();
        floating = resultState.containers.floating;
        expect(floating).toExist();
        expect(floating.layout).toEqual(initialState.containers.floating.layout);
        expect(floating.layouts).toEqual(initialState.containers.floating.layouts);
        expect(floating.maximized).toEqual({});
    });
    it('widgets toggleMaximize on static widget', () => {
        const {initialState} = require('../../test-resources/widgets/layout-state-collapse.js');
        const id = 'b1786030-f7a9-11e8-8602-03b7e0c9537b';
        const widgetToMaximize = initialState.containers.floating.widgets.filter(w => w.id === id)[0];

        const resultState = widgets({
            ...initialState
        }, toggleMaximize(widgetToMaximize));

        expect(resultState).toEqual(initialState);
    });
});
