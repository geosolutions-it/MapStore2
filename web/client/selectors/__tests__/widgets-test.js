/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { DEFAULT_TARGET } from '../../actions/widgets';
import { STATE_INTERACTION_DASH_1, STATE_INTERACTION_MAP_1 } from './widgets-test-data';

import expect from 'expect';

import {
    getFloatingWidgets,
    getFloatingWidgetsLayout,
    getDashboardWidgets,
    getDashboardWidgetsLayout,
    getEditingWidget,
    getEditingWidgetLayer,
    getEditingWidgetFilter,
    getEditorSettings,
    getWidgetLayer,
    getWidgetAttributeFilter,
    dependenciesSelector,
    createPathSelector,
    availableDependenciesSelector,
    availableDependenciesForEditingWidgetSelector,
    returnToFeatureGridSelector,
    isTrayEnabled,
    getVisibleFloatingWidgets,
    getChartWidgetLayers,
    getWidgetFilterKey,
    getWidgetInteractionTreeGenerated,
    interactionsNodesSelector,
    interactionTargetVisibilitySelector
} from '../widgets';

import { set } from '../../utils/ImmutableUtils';
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
    it('getEditingWidgetFilter - chart', () => {
        const state = set(`widgets.builder.editor`, {widgetType: "chart", charts: [{chartId: "1", traces: [{ filter: { name: "TEST" }}] }], selectedChartId: "1" }, {});
        expect(getEditingWidgetFilter(state)).toBeTruthy();
    });
    it('getEditorSettings', () => {
        const state = set(`widgets.builder.settings`, { flag: true }, {});
        expect(getEditorSettings(state)).toExist();
        expect(getEditorSettings(state).flag).toBe(true);
    });
    it('returnToFeatureGridSelector', () => {
        const state = set(`widgets.builder.editor`, { returnToFeatureGrid: true }, {});
        expect(returnToFeatureGridSelector(state)).toExist();
        expect(returnToFeatureGridSelector(state)).toBe(true);
    });

    it('getWidgetAttributeFilter', () => {
        const state = {
            widgets: {
                containers: {
                    floating: {
                        widgets: [{
                            id: "wId",
                            quickFilters: {
                                state: {
                                    rawValue: 'y',
                                    value: 'y',
                                    operator: 'ilike',
                                    type: 'string',
                                    attribute: 'state'
                                }
                            },
                            options: {
                                propertyName: ['state']
                            }
                        }]
                    }
                }
            }
        };
        const widgetFilter = getWidgetAttributeFilter("wId", "state")(state);
        expect(widgetFilter).toExist();
        expect(widgetFilter).toEqual({ rawValue: 'y', value: 'y', operator: 'ilike', type: 'string', attribute: 'state' });

    });
    it('getWidgetAttributeFilter propertyName with array of objects', () => {
        const state = {
            widgets: {
                containers: {
                    floating: {
                        widgets: [{
                            id: "wId",
                            quickFilters: {
                                state: {
                                    rawValue: 'y',
                                    value: 'y',
                                    operator: 'ilike',
                                    type: 'string',
                                    attribute: 'state'
                                }
                            },
                            options: {
                                propertyName: [{name: 'state'}]
                            }
                        }]
                    }
                }
            }
        };
        const widgetFilter = getWidgetAttributeFilter("wId", "state")(state);
        expect(widgetFilter).toExist();
        expect(widgetFilter).toEqual({ rawValue: 'y', value: 'y', operator: 'ilike', type: 'string', attribute: 'state' });

    });
    it('getWidgetLayer', () => {
        const tocLayerState = {'layers': { selected: ["TEST1"], flat: [{id: "TEST1", name: "TEST1"}] }};
        expect(getWidgetLayer(tocLayerState)).toExist();
        expect(getWidgetLayer(tocLayerState).name).toBe("TEST1");
        const dashboardNoLayer = set('dashboard.editing', true, set('dashboard.editor.available', true, tocLayerState));
        expect(getWidgetLayer(dashboardNoLayer)).toNotExist();
        const widgetLayer = set(`widgets.builder.editor`, { layer: { name: "TEST2" } }, dashboardNoLayer);
        expect(getWidgetLayer(widgetLayer).name).toBe("TEST2");
        const chartWidgetLayer = set(`widgets.builder.editor`,
            { selectedChartId: "1", charts: [{ chartId: "1", traces: [{ layer: {name: "TEST2"} }] }] }, dashboardNoLayer);
        expect(getWidgetLayer(chartWidgetLayer).name).toBe("TEST2");
    });
    it('getEditingWidgetLayer charts', () => {
        const chartWidgetLayer =
            getEditingWidgetLayer(set(`widgets.builder.editor`, { selectedChartId: "1", charts: [{ chartId: "1", traces: [{ layer: {name: "TEST2"} }] }] }, {}));
        expect(chartWidgetLayer.name).toBe("TEST2");
    });
    it('getWidgetLayers charts', () => {
        const chartWidgetLayer =
            getChartWidgetLayers(set(`widgets.builder.editor`, {
                selectedChartId: "1",
                charts: [{ chartId: "1", layer: {name: "TEST1"} },
                    { chartId: "2", layer: {name: "TEST2"} }]}, {})
            );
        expect(chartWidgetLayer.length).toBe(2);
    });
    it('availableDependenciesSelector', () => {
        const state = {
            widgets: {
                containers: {
                    [DEFAULT_TARGET]: {
                        widgets: [{
                            id: "WIDGET",
                            maps: [{mapId: "MAPS"}],
                            widgetType: "map"
                        }, {

                        }, {
                            widgetType: "table"
                        }]
                    }
                }
            }
        };
        expect(availableDependenciesSelector(state)).toExist();
        expect(availableDependenciesSelector(state).availableDependencies[0]).toBe('widgets[WIDGET].maps[MAPS].map');
        expect(availableDependenciesSelector(state).availableDependencies[1]).toBe('map');
    });
    it('createDependenciesSelector', () => {
        const LAYER_1 = {
            id: "l1"
        };
        const LAYER_2 = {
            id: "l2"
        };
        const state = {
            layers: [{

            }],
            widgets: {
                containers: {
                    [DEFAULT_TARGET]: {
                        widgets: [{
                            id: "WIDGET",
                            maps: [{mapId: "MAP1", layers: LAYER_1}],
                            widgetType: "map"
                        }, {

                        }, {
                            id: "table-1",
                            widgetType: "table",
                            layer: LAYER_2
                        }, {
                            widgetType: "chart"
                        }]
                    }
                }
            }
        };
        const tests = [
            {
                path: 'widgets[WIDGET].maps[MAP1].layers',
                expected: LAYER_1
            },
            {
                path: 'widgets[table-1].layer',
                expected: LAYER_2
            }
        ];
        tests.forEach(({path, expected}) => {
            expect(createPathSelector(path)(state)).toEqual(expected);
        });

    });
    it('availableDependenciesForEditingWidgetSelector for map', () => {
        const stateInput = {
            widgets: {
                containers: {
                    [DEFAULT_TARGET]: {
                        widgets: [{
                            widgetType: "table",
                            id: "tableId",
                            layer: {
                                name: "layername"
                            }
                        }, {
                            widgetType: "table",
                            id: "otherTableId",
                            layer: {
                                name: "layername"
                            }
                        }]
                    }
                },
                builder: {
                    editor: {
                        maps: [{
                            layers: [{
                                name: "layername"
                            }]
                        }],
                        widgetType: "map",
                        id: "mapId"
                    }
                }
            }
        };
        const state = availableDependenciesForEditingWidgetSelector(stateInput);
        const availableDeps = state.availableDependencies;
        expect(availableDeps).toExist();
        expect(availableDeps.length).toBe(2);
        expect(availableDeps[0]).toBe('widgets[tableId]');
        expect(availableDeps[1]).toBe('widgets[otherTableId]');
    });
    it('availableDependenciesForEditingWidgetSelector for chart', () => {
        const stateInput = {
            widgets: {
                containers: {
                    [DEFAULT_TARGET]: {
                        widgets: [{
                            widgetType: "table",
                            id: "tableId",
                            layer: {
                                name: "layername"
                            }
                        }, {
                            widgetType: "table",
                            id: "otherTableId",
                            layer: {
                                name: "layername"
                            }
                        },
                        {
                            id: "WIDGET",
                            maps: [{mapId: "MAPS"}],
                            widgetType: "map"
                        }]
                    }
                },
                builder: {
                    editor: {
                        charts: [
                            {
                                chartId: "1",
                                traces: [{
                                    layer: { name: "layername" }
                                }]
                            }
                        ],
                        widgetType: "chart",
                        id: "chartId"
                    }
                }
            }
        };
        const state = availableDependenciesForEditingWidgetSelector(stateInput);
        const availableDeps = state.availableDependencies;
        expect(availableDeps).toExist();
        expect(availableDeps.length).toBe(3);
        expect(availableDeps[0]).toBe('widgets[WIDGET].maps[MAPS].map');
        expect(availableDeps[1]).toBe('widgets[tableId]');
        expect(availableDeps[2]).toBe('widgets[otherTableId]');
    });
    it('availableDependenciesForEditingWidgetSelector for counter', () => {
        const stateInput = {
            widgets: {
                containers: {
                    [DEFAULT_TARGET]: {
                        widgets: [{
                            widgetType: "table",
                            id: "tableIdDifferent",
                            layer: {
                                name: "layernameDifferent"
                            }
                        }, {
                            widgetType: "table",
                            id: "tableId",
                            layer: {
                                name: "layername"
                            }
                        },
                        {
                            widgetType: "map",
                            id: "WIDGET",
                            maps: [{mapId: "MAPS"}],
                            layer: {
                                name: "layername"
                            }
                        }]
                    }
                },
                builder: {
                    editor: {
                        layer: {
                            name: "layername"
                        },
                        widgetType: "counter",
                        id: "counterId"
                    }
                }
            }
        };
        const state = availableDependenciesForEditingWidgetSelector(stateInput);
        const availableDeps = state.availableDependencies;
        expect(availableDeps).toExist();
        expect(availableDeps.length).toBe(2);
        expect(availableDeps[0]).toBe('widgets[WIDGET].maps[MAPS].map');
        expect(availableDeps[1]).toBe('widgets[tableId]');
    });
    it('dependenciesSelector', () => {
        const state = {
            widgets: {
                containers: {
                    [DEFAULT_TARGET]: {
                        widgets: [{
                            id: "WIDGET_ID",
                            widgetType: "map",
                            maps: [{
                                mapId: "MAP_ID",
                                center: {
                                    x: -4.866943359375001,
                                    y: 43.96119063892024,
                                    crs: 'EPSG:4326'
                                },
                                bbox: {
                                    bounds: {
                                        minx: -1346514.6902716649,
                                        miny: 5126784.36114334,
                                        maxx: 262943.37730100635,
                                        maxy: 5792092.255337515
                                    }
                                }
                            }]
                        }]
                    }
                },
                dependencies: {
                    a: "mydep.a",
                    b: "mydep.b",
                    // special map path
                    c: "map.abc",
                    // special widgets path
                    d: "widgets[\"WIDGET_ID\"].maps[\"MAP_ID\"].center",
                    e: "widgets[WIDGET_ID].maps[MAP_ID].center",
                    f: "widgets[NO_ID].map.center",
                    g: "widgets.otherStateSlice"
                },
                otherStateSlice: "otherStateValue"
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
        expect(dependencies.d).toBe(state.widgets.containers[DEFAULT_TARGET].widgets[0].maps[0].center);
        expect(dependencies.e).toBe(state.widgets.containers[DEFAULT_TARGET].widgets[0].maps[0].center);
        expect(dependencies.f).toBeFalsy();
        expect(dependencies.g).toBe(state.widgets.otherStateSlice);
    });
    it('isTrayEnabled', () => {
        expect(isTrayEnabled({
            widgets: {
                tray: true
            }
        })).toBe(true);
        expect(isTrayEnabled({
            widgets: {
                tray: false
            }
        })).toBe(false);
    });
    it('getVisibleFloatingWidgets with collapsed', () => {
        const state = {
            widgets: {
                containers: {
                    [DEFAULT_TARGET]: {
                        collapsed: {
                            'widget2': {
                                layout: [{
                                    i: 'widget2'
                                }],
                                layouts: {
                                    xxs: [{
                                        i: 'widget2'
                                    }]
                                }
                            }
                        },
                        widgets: [{
                            widgetType: "table",
                            id: "widget1"
                        }, {
                            widgetType: "table",
                            id: "widget2",
                            layer: {
                                name: "layername"
                            }
                        },
                        {
                            widgetType: "map",
                            id: "widget3",
                            layer: {
                                name: "layername"
                            }
                        }],
                        layout: [{
                            i: 'widget1'
                        }, {
                            i: 'widget3'
                        }],
                        layouts: {
                            xxs: [{
                                i: 'widget1'
                            }, {
                                i: 'widget3'
                            }]
                        }
                    }
                }
            }
        };
        const result = getVisibleFloatingWidgets(state);
        expect(result).toExist();
        expect(result.length).toBe(2);
        expect(result[0].id).toBe('widget1');
        expect(result[1].id).toBe('widget3');
    });
    it('getVisibleFloatingWidgets with maximized', () => {
        const state = {
            widgets: {
                containers: {
                    [DEFAULT_TARGET]: {
                        maximized: {
                            layout: [{
                                i: 'widget1'
                            }, {
                                i: 'widget2'
                            }, {
                                i: 'widget3'
                            }],
                            layouts: {
                                xxs: [{
                                    i: 'widget1'
                                }, {
                                    i: 'widget2'
                                }, {
                                    i: 'widget3'
                                }]
                            },
                            widget: {
                                widgetType: "map",
                                id: "widget3",
                                layer: {
                                    name: "layername"
                                }
                            }
                        },
                        widgets: [{
                            widgetType: "table",
                            id: "widget1"
                        }, {
                            widgetType: "table",
                            id: "widget2",
                            layer: {
                                name: "layername"
                            }
                        },
                        {
                            widgetType: "map",
                            id: "widget3",
                            layer: {
                                name: "layername"
                            }
                        }],
                        layout: [{
                            i: 'widget3'
                        }],
                        layouts: {
                            xxs: [{
                                i: 'widget3'
                            }]
                        }
                    }
                }
            }
        };
        const result = getVisibleFloatingWidgets(state);
        expect(result).toExist();
        expect(result.length).toBe(1);
        expect(result[0].id).toBe('widget3');
    });
    it('getVisibleFloatingWidgets with maximized and collapsed', () => {
        const state = {
            widgets: {
                containers: {
                    [DEFAULT_TARGET]: {
                        maximized: {
                            layout: [{
                                i: 'widget1'
                            }, {
                                i: 'widget2'
                            }, {
                                i: 'widget3'
                            }],
                            layouts: {
                                xxs: [{
                                    i: 'widget1'
                                }, {
                                    i: 'widget2'
                                }, {
                                    i: 'widget3'
                                }]
                            },
                            widget: {
                                widgetType: "map",
                                id: "widget3",
                                layer: {
                                    name: "layername"
                                }
                            }
                        },
                        collapsed: {
                            'widget2': {
                                layout: [{
                                    i: 'widget2'
                                }],
                                layouts: {
                                    xxs: [{
                                        i: 'widget2'
                                    }]
                                }
                            }
                        },
                        widgets: [{
                            widgetType: "table",
                            id: "widget1"
                        }, {
                            widgetType: "table",
                            id: "widget2",
                            layer: {
                                name: "layername"
                            }
                        },
                        {
                            widgetType: "map",
                            id: "widget3",
                            layer: {
                                name: "layername"
                            }
                        }],
                        layout: [{
                            i: 'widget3'
                        }],
                        layouts: {
                            xxs: [{
                                i: 'widget3'
                            }]
                        }
                    }
                }
            }
        };
        const result = getVisibleFloatingWidgets(state);
        expect(result).toExist();
        expect(result.length).toBe(1);
        expect(result[0].id).toBe('widget3');
    });
    it('getVisibleFloatingWidgets with no collapsed or maximized', () => {
        const state = {
            widgets: {
                containers: {
                    [DEFAULT_TARGET]: {
                        widgets: [{
                            widgetType: "table",
                            id: "widget1"
                        }, {
                            widgetType: "table",
                            id: "widget2",
                            layer: {
                                name: "layername"
                            }
                        },
                        {
                            widgetType: "map",
                            id: "widget3",
                            layer: {
                                name: "layername"
                            }
                        }],
                        layout: [{
                            i: 'widget1'
                        }, {
                            i: 'widget2'
                        }, {
                            i: 'widget3'
                        }],
                        layouts: {
                            xxs: [{
                                i: 'widget1'
                            }, {
                                i: 'widget2'
                            }, {
                                i: 'widget3'
                            }]
                        }
                    }
                }
            }
        };
        const result = getVisibleFloatingWidgets(state);
        expect(result).toExist();
        expect(result.length).toBe(3);
        expect(result[0].id).toBe('widget1');
        expect(result[1].id).toBe('widget2');
        expect(result[2].id).toBe('widget3');
    });
    it('getWidgetFilterKey without chart', () => {
        const state = set("widgets.builder.editor", { widgetType: "table" }, {});
        expect(getWidgetFilterKey(state)).toBe("filter");
    });
    it('getWidgetFilterKey with chart', () => {
        const state = set("widgets.builder.editor", { widgetType: "chart", selectedChartId: "chart-01", charts: [{ chartId: 'chart-01', traces: [{ id: 'trace-01' }] }] }, {});
        expect(getWidgetFilterKey(state)).toBe("charts[chart-01].traces[trace-01].filter");
    });
    it('getWidgetInteractionTreeGenerated without editing widget', () => {
        const state = set(`widgets.containers[${DEFAULT_TARGET}].widgets`, [
            { id: 'widget1', widgetType: 'table', title: 'Table Widget' },
            { id: 'widget2', widgetType: 'counter', title: 'Counter Widget' }
        ], {
            layers: {
                flat: [
                    { id: 'layer1', name: 'layer1', title: 'Layer 1' }
                ]
            }
        });
        const result = getWidgetInteractionTreeGenerated(state);
        expect(result).toExist();
        expect(result.id).toBe('root');
        expect(result.children).toExist();
        const widgetsCollection = result.children.find(c => c.id === 'widgets');
        expect(widgetsCollection).toExist();
        expect(widgetsCollection.children.length).toBe(2);
        const mapCollection = result.children.find(c => c.id === "map");
        expect(mapCollection).toExist();
        expect(mapCollection.children.length).toBe(1);
    });
    it('getWidgetInteractionTreeGenerated with filter widget as editing widget', () => {
        const state = set(`widgets.builder.editor`, {
            id: 'widget2',
            widgetType: 'filter',
            title: 'Editing Filter Widget',
            filters: [{
                id: 'filter-1',
                label: 'Filter 1',
                title: 'First Filter',
                data: {
                    layer: { id: 'layer1', name: 'layer1' }
                }
            }],
            selectedFilterId: 'filter-1'
        }, set(`widgets.containers[${DEFAULT_TARGET}].widgets`, [
            { id: 'widget2', widgetType: 'counter', title: 'Counter Widget' }
        ]));
        const result = getWidgetInteractionTreeGenerated(state);
        expect(result).toExist();
        expect(result.id).toBe('root');
        const widgetsCollection = result.children.find(c => c.id === 'widgets');
        expect(widgetsCollection).toExist();
        expect(widgetsCollection.children.length).toBe(1);
        const editingWidget = widgetsCollection.children.find(w => w.id === 'widget2');
        expect(editingWidget).toExist();
    });
    it('interactionTargetVisibilitySelector', () => {

        const tests = [
            {
                path: `widgets[53b5cfc0-fac9-11f0-b714-1b62e8a515ce]`
            },
            {
                path: 'widgets[746e1fb0-fac9-11f0-b714-1b62e8a515ce]'
            }, {
                path: 'map.layers[test:states_training__51824df0-fac9-11f0-b714-1b62e8a515ce]'
            }
        ];
        const map = interactionsNodesSelector(STATE_INTERACTION_MAP_1);
        tests.forEach(({path}) => {
            expect(map.get(path)).toExist();
        });
    });
    describe("interactionTargetVisibilitySelector", () => {
        const tests = [
            // MAP
            {
                state: STATE_INTERACTION_MAP_1,
                name: "check widget visibility true",
                path: 'widgets[746e1fb0-fac9-11f0-b714-1b62e8a515ce]',
                expected: true
            }, {
                state: STATE_INTERACTION_MAP_1,
                name: "check layer visibility true",
                path: 'map.layers[test:states_training__51824df0-fac9-11f0-b714-1b62e8a515ce]',
                expected: true
            }, {
                state: set('layers.flat[0].visibility', false, STATE_INTERACTION_MAP_1),
                name: "check layer visibility set to false",
                path: 'map.layers[test:states_training__51824df0-fac9-11f0-b714-1b62e8a515ce]',
                expected: false
            }, {
                state: set('layers.groups[0].visibility', false, STATE_INTERACTION_MAP_1),
                name: "check layer visibility with group visibility set to false",
                path: 'map.layers[test:states_training__51824df0-fac9-11f0-b714-1b62e8a515ce]',
                expected: false
            }, {
                state: set('widgets.containers.floating.collapsed["746e1fb0-fac9-11f0-b714-1b62e8a515ce"]', {
                    "layout": {
                        "w": 2,
                        "h": 2,
                        "x": 2,
                        "y": 2,
                        "i": "746e1fb0-fac9-11f0-b714-1b62e8a515ce",
                        "moved": false,
                        "static": false
                    },
                    "layouts": {
                        "md": {
                            "w": 2,
                            "h": 2,
                            "x": 2,
                            "y": 2,
                            "i": "746e1fb0-fac9-11f0-b714-1b62e8a515ce",
                            "moved": false,
                            "static": false
                        }
                    }
                }, STATE_INTERACTION_MAP_1),
                name: "check widget visibility with widget collapsed",
                path: 'widgets[746e1fb0-fac9-11f0-b714-1b62e8a515ce]',
                expected: false
            },
            // DASHBOARD
            {
                state: STATE_INTERACTION_DASH_1,
                path: 'widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].maps[5917e620-fad2-11f0-9e1f-7900d8be1f6f].layers[test:states_training__5e262640-fad2-11f0-9e1f-7900d8be1f6f]',
                name: "dashboard visibility of map layers",
                expected: true
            }, {
                state: set('widgets.containers.floating.widgets[1].maps[0].layers[0].visibility', false, STATE_INTERACTION_DASH_1),
                path: 'widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].maps[5917e620-fad2-11f0-9e1f-7900d8be1f6f].layers[test:states_training__5e262640-fad2-11f0-9e1f-7900d8be1f6f]',
                name: "dashboard visibility of map layers in map layers when LAYER has visibility false",
                expected: false
            },
            {
                state: set('widgets.containers.floating.widgets[1].maps[0].groups[0].visibility', false, STATE_INTERACTION_DASH_1),
                path: 'widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].maps[5917e620-fad2-11f0-9e1f-7900d8be1f6f].layers[test:states_training__5e262640-fad2-11f0-9e1f-7900d8be1f6f]',
                name: "dashboard visibility of map layers in map layers when GROUP has visibility false",
                expected: false
            }
        ];
        tests.forEach(({state, name, path, expected}) => {
            it(name, () => {
                const result = interactionTargetVisibilitySelector(state);
                expect(result[path]).toEqual(expected);
            });
        });
    });
});
