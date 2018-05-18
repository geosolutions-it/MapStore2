/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {
    editWidget,
    editNewWidget,
    changeEditorSetting,
    onEditorChange,
    insertWidget,
    deleteWidget,
    changeLayout,
    clearWidgets,
    addDependency,
    removeDependency,
    resetDependencies,
    loadDependencies,
    DEFAULT_TARGET
} = require('../../actions/widgets');
const {configureMap} = require('../../actions/config');
const {dashboardLoaded} = require('../../actions/dashboard');
const widgets = require('../widgets');

const expect = require('expect');

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
});
