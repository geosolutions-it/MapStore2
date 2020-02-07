/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {
    NEW,
    INSERT,
    UPDATE,
    UPDATE_PROPERTY,
    UPDATE_LAYER,
    DELETE,
    CHANGE_LAYOUT,
    EDIT,
    EDIT_NEW,
    EDITOR_CHANGE,
    EDITOR_SETTING_CHANGE,
    DEFAULT_TARGET,
    OPEN_FILTER_EDITOR,
    EXPORT_CSV,
    EXPORT_IMAGE,
    DEPENDENCY_SELECTOR_KEY,
    TOGGLE_TRAY,
    createChart, NEW_CHART,
    exportCSV,
    exportImage,
    openFilterEditor,
    createWidget,
    insertWidget,
    updateWidget,
    updateWidgetProperty,
    updateWidgetLayer,
    deleteWidget,
    changeLayout,
    editWidget,
    editNewWidget,
    onEditorChange,
    changeEditorSetting,
    setPage,
    setupDependencySelector,
    toggleDependencySelector,
    toggleTray
} = require('../widgets');

describe('Test correctness of the widgets actions', () => {

    it('exportCSV', () => {
        const data = [{a: "a"}];
        const retval = exportCSV({data, title: "TITLE"});
        expect(retval).toExist();
        expect(retval.type).toBe(EXPORT_CSV);
        expect(retval.data).toBe(data);
        expect(retval.title).toBe("TITLE");
    });
    it('exportImage', () => {
        const retval = exportImage({widgetDivId: "WIDGET"});
        expect(retval).toExist();
        expect(retval.type).toBe(EXPORT_IMAGE);
        expect(retval.widgetDivId).toBe("WIDGET");
    });
    it('openFilterEditor', () => {
        const retval = openFilterEditor();
        expect(retval).toExist();
        expect(retval.type).toBe(OPEN_FILTER_EDITOR);
    });
    it('createWidget', () => {
        const widget = {};
        const retval = createWidget(widget);
        expect(retval).toExist();
        expect(retval.type).toBe(NEW);
        expect(retval.widget).toBe(widget);
    });
    it('insertWidget', () => {
        const widget = {};
        const TARGET = "TARGET";
        const retval = insertWidget(widget, TARGET);
        expect(retval).toExist();
        expect(retval.type).toBe(INSERT);
        expect(retval.widget).toBe(widget);
        expect(retval.target).toBe(TARGET);
        const newval = insertWidget(widget);
        expect(newval.target).toBe(DEFAULT_TARGET);

    });
    it('updateWidget', () => {
        const widget = {};
        const retval = updateWidget(widget);
        expect(retval).toExist();
        expect(retval.type).toBe(UPDATE);
        expect(retval.widget).toBe(widget);
        expect(retval.target).toBe(DEFAULT_TARGET);
    });
    it('updateWidgetProperty', () => {
        const retval = updateWidgetProperty("id", "key", "value");
        expect(retval).toExist();
        expect(retval.type).toBe(UPDATE_PROPERTY);
        expect(retval.id).toBe("id");
        expect(retval.key).toBe("key");
        expect(retval.value).toBe("value");
        expect(retval.mode).toBe("replace");
        expect(retval.target).toBe(DEFAULT_TARGET);
    });
    it('updateWidgetLayer', () => {
        const layer = {id: "1", name: "layer1"};
        const retval = updateWidgetLayer(layer);
        expect(retval).toExist();
        expect(retval.type).toBe(UPDATE_LAYER);
        expect(retval.layer).toBe(layer);
    });
    it('deleteWidget', () => {
        const widget = {};
        const retval = deleteWidget(widget);
        expect(retval).toExist();
        expect(retval.type).toBe(DELETE);
        expect(retval.widget).toBe(widget);
        expect(retval.target).toBe(DEFAULT_TARGET);
    });
    it('changeLayout', () => {
        const layout = {};
        const allLayouts = {
            lg: {}
        };
        const retval = changeLayout(layout, allLayouts);
        expect(retval).toExist();
        expect(retval.layout).toBe(layout);
        expect(retval.allLayouts).toBe(allLayouts);
        expect(retval.type).toBe(CHANGE_LAYOUT);
        expect(retval.target).toBe(DEFAULT_TARGET);
    });
    it('editWidget', () => {
        const widget = {};
        const retval = editWidget(widget);
        expect(retval).toExist();
        expect(retval.type).toBe(EDIT);
        expect(retval.widget).toBe(widget);
    });
    it('editNewWidget', () => {
        const widget = {};
        const settings = {};
        const retval = editNewWidget(widget, settings);
        expect(retval).toExist();
        expect(retval.type).toBe(EDIT_NEW);
        expect(retval.widget).toBe(widget);
        expect(retval.settings).toBe(settings);
    });
    it('onEditorChange', () => {
        const key = "KEY";
        const value = "VALUE";
        const retval = onEditorChange(key, value);
        expect(retval).toExist();
        expect(retval.type).toBe(EDITOR_CHANGE);
        expect(retval.key).toBe(key);
        expect(retval.value).toBe(value);
    });
    it('changeEditorSetting', () => {
        const key = "KEY";
        const value = "VALUE";
        const retval = changeEditorSetting(key, value);
        expect(retval).toExist();
        expect(retval.type).toBe(EDITOR_SETTING_CHANGE);
        expect(retval.key).toBe(key);
        expect(retval.value).toBe(value);
    });
    it('setPage', () => {
        const retval = setPage(1);
        expect(retval).toExist();
        expect(retval.type).toBe(EDITOR_SETTING_CHANGE);
        expect(retval.key).toBe("step");
        expect(retval.value).toBe(1);
    });
    it('setupDependencySelector', () => {
        const value = { active: true, setup: "setup" };
        const retval = setupDependencySelector(value);
        expect(retval).toExist();
        expect(retval.type).toBe(EDITOR_SETTING_CHANGE);
        expect(retval.key).toBe(`${DEPENDENCY_SELECTOR_KEY}`);
        expect(retval.value).toBe(value);
    });
    it('toggleDependencySelector', () => {
        const value = { setup: "setup" };
        const retval = toggleDependencySelector(true, value);
        expect(retval).toExist();
        expect(retval.type).toBe(EDITOR_SETTING_CHANGE);
        expect(retval.key).toBe(`${DEPENDENCY_SELECTOR_KEY}`);
        expect(retval.value.setup).toBe("setup");
        expect(retval.value.active).toBe(true);
    });
    it('createChart', () => {
        const retval = createChart(true);
        expect(retval).toExist();
        expect(retval.type).toBe(NEW_CHART);
    });
    it('toggleTray', () => {
        const retval = toggleTray(true);
        expect(retval).toExist();
        expect(retval.type).toBe(TOGGLE_TRAY);
        expect(retval.value).toBe(true);
    });

});
