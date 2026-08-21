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
    init,
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
import { refreshSecurityLayers } from '../../actions/security';

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
        expect(state.builder.settings.step).toBe(0);
    });
    it('editWidget initial by kind of widget', () => {
        // default chart
        expect(widgets(undefined, editWidget({ type: "bar" })).builder.settings.step).toBe(0);
        // chart explicit
        expect(widgets(undefined, editWidget({ widgetType: "chart" })).builder.settings.step).toBe(0);
        // text explicit
        expect(widgets(undefined, editWidget({ widgetType: "text" })).builder.settings.step).toBe(0);
    });
    it('onEditorChange', () => {
        const state = widgets(undefined, onEditorChange("type", "bar"));
        expect(state.builder.editor.type).toBe("bar");
    });
    it('onEditorChange maps', () => {
        const maps = ["map1", "map2"];
        const state = widgets({}, onEditorChange("maps", maps));
        expect(state.builder.editor.maps).toEqual(maps);
    });
    it('onEditorChange maps with id', () => {
        const state = widgets({builder: {editor: {selectedMapId: '1', maps: [{mapId: '1', value: "some"}]}}}, onEditorChange(`maps[1].value`, "updated"));
        expect(state.builder.editor.maps[0].value).toBe("updated");
    });
    it('onEditorChange charts', () => {
        const charts = ["chart1", "chart2"];
        const state = widgets({}, onEditorChange("charts", charts));
        expect(state.builder.editor.charts).toEqual(charts);
    });
    it('onEditorChange charts with id', () => {
        const state = widgets({builder: {editor: {selectedChartId: '1', charts: [{chartId: '1', value: "some"}]}}}, onEditorChange(`charts[1].value`, "updated"));
        expect(state.builder.editor.charts[0].value).toBe("updated");
    });
    it('insertWidget', () => {
        const state = widgets(undefined, insertWidget({id: "1"}));
        expect(state.containers[DEFAULT_TARGET].widgets.length).toBe(1);
    });
    it('insertWidget with default initialSize', () => {
        const state = widgets({
            defaults: {
                initialSize: {
                    w: 4,
                    h: 4
                }}
        }, insertWidget({id: "1"}));
        expect(state.containers[DEFAULT_TARGET].widgets.length).toBe(1);
        expect(state.containers[DEFAULT_TARGET].widgets[0].dataGrid.w).toBe(4);
        expect(state.containers[DEFAULT_TARGET].widgets[0].dataGrid.h).toBe(4);
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
                    },
                    {
                        id: "widget5",
                        widgetType: "chart",
                        charts: [
                            {
                                layer: Object.assign({}, targetLayer)
                            },
                            {
                                layer: {
                                    visibility: false,
                                    name: "layer3",
                                    id: "3"
                                }
                            }, {
                                layer: {
                                    visibility: false,
                                    name: "layer3",
                                    id: "3"
                                }, traces: [{
                                    layer: {
                                        visibility: false,
                                        name: "layer3",
                                        id: "3"
                                    }, id: "traceId"
                                }]
                            }
                        ]
                    }]
                }
            }
        };

        const newTargetLayer = Object.assign({}, targetLayer, {visibility: false});
        const newState = widgets(state, updateWidgetLayer(newTargetLayer));

        const widgetObjects = newState.containers[DEFAULT_TARGET].widgets;
        expect(widgetObjects.length).toBe(5);
        expect(widgetObjects[0].layer).toEqual(state.containers[DEFAULT_TARGET].widgets[0].layer);
        expect(widgetObjects[1].layer).toEqual(newTargetLayer);
        expect(widgetObjects[2].layer).toEqual(state.containers[DEFAULT_TARGET].widgets[2].layer);
        expect(widgetObjects[3].layer).toEqual(newTargetLayer);
        expect(widgetObjects[4].charts[0].layer.id).toEqual(newTargetLayer.id);
        expect(widgetObjects[4].charts[1].layer).toEqual(state.containers[DEFAULT_TARGET].widgets[4].charts[1].layer);
        expect(widgetObjects[4].charts[2].layer).toEqual(state.containers[DEFAULT_TARGET].widgets[4].charts[1].layer);
        expect(widgetObjects[4].charts[2].traces[0].layer).toEqual(state.containers[DEFAULT_TARGET].widgets[4].charts[2].traces[0].layer);
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
    it('deleteWidget clears maximized state without changing canonical layouts', () => {
        const {initialState} = require('../../test-resources/widgets/layout-state-collapse.js');
        const widgetToDelete = initialState.containers[DEFAULT_TARGET].widgets[0];
        let newState = widgets(initialState, toggleMaximize(widgetToDelete));

        newState = widgets(newState, deleteWidget(
            newState.containers[DEFAULT_TARGET].widgets.find(({id}) => id === widgetToDelete.id)
        ));

        const floating = newState.containers[DEFAULT_TARGET];
        expect(floating.widgets.find(({id}) => id === widgetToDelete.id)).toNotExist();
        expect(floating.maximized).toEqual({});
        expect(floating.layout).toBe(initialState.containers[DEFAULT_TARGET].layout);
        expect(floating.layouts).toBe(initialState.containers[DEFAULT_TARGET].layouts);

        newState = widgets(newState, insertWidget({id: 'replacement-widget'}));
        expect(getVisibleFloatingWidgets({widgets: newState})
            .find(({id}) => id === 'replacement-widget')).toExist();
    });
    it('deleteWidget removes only the deleted widget from multi-view maximized state', () => {
        const firstWidget = {
            id: 'widget-1',
            layoutId: 'view-1',
            dataGrid: {x: 0, y: 0, w: 1, h: 1}
        };
        const secondWidget = {
            id: 'widget-2',
            layoutId: 'view-2',
            dataGrid: {x: 0, y: 0, w: 1, h: 1}
        };
        const firstLayout = {i: firstWidget.id, x: 0, y: 0, w: 1, h: 1};
        const secondLayout = {i: secondWidget.id, x: 0, y: 0, w: 1, h: 1};
        const initialState = {
            containers: {
                [DEFAULT_TARGET]: {
                    widgets: [firstWidget, secondWidget],
                    layout: [firstLayout],
                    layouts: [
                        {id: firstWidget.layoutId, md: [firstLayout], xxs: [{...firstLayout}]},
                        {id: secondWidget.layoutId, md: [secondLayout], xxs: [{...secondLayout}]}
                    ],
                    selectedLayoutId: firstWidget.layoutId
                }
            }
        };
        let newState = widgets(initialState, toggleMaximize(firstWidget));
        newState = widgets(newState, toggleMaximize(secondWidget));
        newState = widgets(newState, deleteWidget(
            newState.containers[DEFAULT_TARGET].widgets.find(({id}) => id === secondWidget.id)
        ));

        const floating = newState.containers[DEFAULT_TARGET];
        expect(floating.widgets.map(({id}) => id)).toEqual([firstWidget.id]);
        expect(floating.maximized.widget).toEqual([firstWidget]);
        expect(floating.layout).toBe(initialState.containers[DEFAULT_TARGET].layout);
        expect(floating.layouts).toBe(initialState.containers[DEFAULT_TARGET].layouts);
    });
    it('deleteWidget remove dependenciesMap', () => {
        const state = {
            containers: {
                [DEFAULT_TARGET]: {
                    widgets: [{
                        id: "1",
                        maps: [{mapId: 1, layers: [1, 2]}]
                    }, {
                        id: "2",
                        mapSync: true,
                        dependenciesMap: {
                            layers: "widgets[1].maps[1].layers"
                        }
                    }]
                }
            }
        };
        const newState = widgets(state, deleteWidget({id: "1"}));
        const uWidgets = newState.containers[DEFAULT_TARGET].widgets;
        expect(uWidgets.length).toBe(1);
        expect(uWidgets[0].mapSync).toBeFalsy();
        expect(uWidgets[0].dependenciesMap).toBeFalsy();
        expect(uWidgets[0].id).toBe("2");
    });
    it('test deleteWidget if the some other widgets [not deleted] has dependenciesMap = {}', () => {
        const state = {
            containers: {
                [DEFAULT_TARGET]: {
                    widgets: [{
                        id: "1",
                        maps: [{mapId: 1, layers: [1, 2]}]
                    }, {
                        id: "2",
                        mapSync: true,
                        dependenciesMap: {
                            layers: "widgets[1].maps[1].layers"
                        }
                    }, {
                        id: "3",
                        mapSync: true,
                        dependenciesMap: {}
                    }]
                }
            }
        };
        const newState = widgets(state, deleteWidget({id: "1"}));
        const uWidgets = newState.containers[DEFAULT_TARGET].widgets;
        expect(uWidgets.length).toBe(2);
        expect(uWidgets[0].mapSync).toBeFalsy();
        expect(uWidgets[0].dependenciesMap).toBeFalsy();
        expect(uWidgets[0].id).toBe("2");
    });
    it('init', () => {
        const defaults = {initialSize: {
            w: 4,
            h: 4
        }};
        const state = widgets(undefined, init(defaults));
        expect(state.defaults).toEqual(defaults);
    });
    it('configureMap', () => {
        const state = widgets(undefined, configureMap({
            widgetsConfig: {widgets: [{id: "1"}]}}));
        expect(state.containers[DEFAULT_TARGET].widgets.length).toBe(1);
    });

    it('configureMap with no widgetsConfig', () => {
        const state = widgets(undefined, configureMap({}));
        expect(state.containers[DEFAULT_TARGET].widgets).toEqual([]);
    });
    it('configureMap with empty object widgetsConfig', () => {
        const state = widgets(undefined, configureMap({widgetsConfig: {}}));
        expect(state.containers[DEFAULT_TARGET].widgets).toEqual([]);
    });
    it('configureMap with empty widgets in widgetsConfig', () => {
        const state = widgets(undefined, configureMap({widgetsConfig: { widgets: []}}));
        expect(state.containers[DEFAULT_TARGET].widgets).toEqual([]);
    });
    it('configureMap with valid widgetsConfig containing layout and layouts', () => {
        const widgetsConfig = {
            widgets: [
                { id: "widget1", type: "text", title: "Test Widget 1" },
                { id: "widget2", type: "chart", title: "Test Widget 2" }
            ],
            layout: [
                { i: "widget1", x: 0, y: 0, w: 4, h: 2 },
                { i: "widget2", x: 4, y: 0, w: 4, h: 2 }
            ],
            layouts: {
                lg: [
                    { i: "widget1", x: 0, y: 0, w: 4, h: 2 },
                    { i: "widget2", x: 4, y: 0, w: 4, h: 2 }
                ]
            }
        };
        const state = widgets(undefined, configureMap({ widgetsConfig }));

        expect(state.containers[DEFAULT_TARGET]).toExist();
        expect(state.containers[DEFAULT_TARGET].widgets).toExist();
        expect(state.containers[DEFAULT_TARGET].widgets.length).toBe(2);
        expect(state.containers[DEFAULT_TARGET].widgets[0].id).toBe("widget1");
        expect(state.containers[DEFAULT_TARGET].widgets[1].id).toBe("widget2");
        expect(state.containers[DEFAULT_TARGET].layout).toEqual(widgetsConfig.layout);
        expect(state.containers[DEFAULT_TARGET].layouts).toEqual(widgetsConfig.layouts);
    });
    it('configureMap cleans stale maximized properties from saved map widgets', () => {
        const state = widgets(undefined, configureMap({
            widgetsConfig: {
                widgets: [{
                    id: 'widget-1',
                    dataGrid: { x: 2, "static": true, isDraggable: false, isResizable: false }
                }],
                layout: [{ i: 'widget-1', x: 2, isDraggable: false }],
                layouts: {
                    md: [{ i: 'widget-1', x: 2, isResizable: false }]
                }
            }
        }));
        const floating = state.containers[DEFAULT_TARGET];

        expect(floating.widgets[0].dataGrid).toEqual({ x: 2, "static": true });
        expect(floating.layout[0]).toEqual({ i: 'widget-1', x: 2 });
        expect(floating.layouts.md[0]).toEqual({ i: 'widget-1', x: 2 });
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
    it('widgets dashboardLoaded cleans stale maximized properties from saved dashboard widgets', () => {
        const data = {
            widgets: [{ id: 'widget-1', dataGrid: { y: 3, custom: true, isResizable: false } }],
            layouts: [{
                id: 'view-1',
                name: 'Main view',
                md: [{ i: 'widget-1', y: 3, isDraggable: false }],
                xxs: [{ i: 'widget-1', y: 0, isResizable: false }]
            }]
        };
        const state = widgets(undefined, dashboardLoaded('RESOURCE', data));
        const floating = state.containers[DEFAULT_TARGET];

        expect(floating.widgets[0].dataGrid).toEqual({ y: 3, custom: true });
        expect(floating.layouts).toEqual([{
            id: 'view-1',
            name: 'Main view',
            md: [{ i: 'widget-1', y: 3 }],
            xxs: [{ i: 'widget-1', y: 0 }]
        }]);
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
    it('widgets toggleMaximize changes only transient maximized state', () => {
        const {initialState} = require('../../test-resources/widgets/layout-state-collapse.js');
        const id = 'a7122cc0-f7a9-11e8-8602-03b7e0c9537b';
        const widgetToMaximize = initialState.containers.floating.widgets.filter(w => w.id === id)[0];

        let resultState = widgets(initialState, toggleMaximize(widgetToMaximize));

        expect(resultState).toExist();
        let floating = resultState.containers.floating;
        expect(floating.layout).toBe(initialState.containers.floating.layout);
        expect(floating.layouts).toBe(initialState.containers.floating.layouts);
        expect(floating.widgets).toBe(initialState.containers.floating.widgets);
        expect(floating.maximized).toEqual({ widget: widgetToMaximize });

        resultState = widgets(resultState, toggleMaximize(widgetToMaximize));

        floating = resultState.containers.floating;
        expect(floating.layout).toBe(initialState.containers.floating.layout);
        expect(floating.layouts).toBe(initialState.containers.floating.layouts);
        expect(floating.widgets).toBe(initialState.containers.floating.widgets);
        expect(floating.maximized).toEqual({});
    });
    it('widgets toggleMaximize manages widgets independently across dashboard views', () => {
        const firstWidget = {
            id: 'widget-1',
            layoutId: 'view-1',
            widgetType: 'text',
            dataGrid: { x: 0, y: 0, w: 1, h: 1 }
        };
        const secondWidget = {
            id: 'widget-2',
            layoutId: 'view-2',
            widgetType: 'text',
            dataGrid: { x: 1, y: 1, w: 2, h: 2 }
        };
        const firstLayout = { i: firstWidget.id, x: 0, y: 0, w: 1, h: 1 };
        const secondLayout = { i: secondWidget.id, x: 1, y: 1, w: 2, h: 2 };
        const initialState = {
            containers: {
                [DEFAULT_TARGET]: {
                    widgets: [firstWidget, secondWidget],
                    layouts: [{
                        id: firstWidget.layoutId,
                        md: [firstLayout],
                        xxs: [{ ...firstLayout }]
                    }, {
                        id: secondWidget.layoutId,
                        md: [secondLayout],
                        xxs: [{ ...secondLayout }]
                    }],
                    layout: [firstLayout],
                    selectedLayoutId: firstWidget.layoutId
                }
            }
        };

        let resultState = widgets(initialState, toggleMaximize(firstWidget));
        let floating = resultState.containers[DEFAULT_TARGET];
        expect(floating.maximized.widget).toEqual([firstWidget]);

        resultState = widgets(resultState, toggleMaximize(secondWidget));
        floating = resultState.containers[DEFAULT_TARGET];
        expect(floating.maximized.widget).toEqual([firstWidget, secondWidget]);

        resultState = widgets(resultState, toggleMaximize(firstWidget));
        floating = resultState.containers[DEFAULT_TARGET];
        expect(floating.maximized.widget).toEqual([secondWidget]);

        resultState = widgets(resultState, toggleMaximize(secondWidget));
        floating = resultState.containers[DEFAULT_TARGET];
        expect(floating.maximized).toEqual({});
        expect(floating.widgets).toBe(initialState.containers[DEFAULT_TARGET].widgets);
        expect(floating.layout).toBe(initialState.containers[DEFAULT_TARGET].layout);
        expect(floating.layouts).toBe(initialState.containers[DEFAULT_TARGET].layouts);
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
    it('widgets toggleMaximize on collapsed widget', () => {
        const {initialState} = require('../../test-resources/widgets/layout-state-collapse.js');
        const widgetToMaximize = initialState.containers.floating.widgets[0];
        const collapsedState = {
            ...initialState,
            containers: {
                ...initialState.containers,
                floating: {
                    ...initialState.containers.floating,
                    collapsed: {
                        [widgetToMaximize.id]: {}
                    }
                }
            }
        };

        expect(widgets(collapsedState, toggleMaximize(widgetToMaximize))).toBe(collapsedState);
    });
    it('widgets refreshSecurityLayers', () => {

        const resultState = widgets({
            containers: {
                floating: {
                    widgets: [{
                        id: 'a7122cc0-f7a9-11e8-8602-03b7e0c9537b',
                        maps: [{
                            layers: [{
                                security: {}
                            }]
                        }]
                    }]
                }
            },
            builder: {
                editor: {
                    maps: [{
                        layers: [{
                            security: {}
                        }]
                    }]
                }
            }
        }, refreshSecurityLayers());
        expect(resultState.containers.floating.widgets[0].maps[0].layers[0].security.rand).toBeTruthy();
        expect(resultState.builder.editor.maps[0].layers[0].security.rand).toBeTruthy();
    });
});
