/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { DEFAULT_TARGET } from '../../actions/widgets';

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
    availableDependenciesSelector,
    availableDependenciesForEditingWidgetSelector,
    returnToFeatureGridSelector,
    isTrayEnabled,
    getVisibleFloatingWidgets
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
    it('getWidgetLayer', () => {
        const tocLayerState = {'layers': { selected: ["TEST1"], flat: [{id: "TEST1", name: "TEST1"}] }};
        expect(getWidgetLayer(tocLayerState)).toExist();
        expect(getWidgetLayer(tocLayerState).name).toBe("TEST1");
        const dashboardNoLayer = set('dashboard.editing', true, set('dashboard.editor.available', true, tocLayerState));
        expect(getWidgetLayer(dashboardNoLayer)).toNotExist();
        const widgetLayer = set(`widgets.builder.editor`, { layer: { name: "TEST2" } }, dashboardNoLayer);
        expect(getWidgetLayer(widgetLayer).name).toBe("TEST2");
    });
    it('availableDependenciesSelector', () => {
        const state = {
            widgets: {
                containers: {
                    [DEFAULT_TARGET]: {
                        widgets: [{
                            id: "WIDGET",
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
        expect(availableDependenciesSelector(state).availableDependencies[0]).toBe('widgets[WIDGET].map');
        expect(availableDependenciesSelector(state).availableDependencies[1]).toBe('map');
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
                        layers: [{
                            name: "layername"
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
                            id: "mapId",
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
        expect(availableDeps[0]).toBe('widgets[mapId].map');
        expect(availableDeps[1]).toBe('widgets[tableId]');
    });
    it('dependenciesSelector', () => {
        const state = {
            widgets: {
                containers: {
                    [DEFAULT_TARGET]: {
                        widgets: [{
                            id: "WIDGET_ID",
                            map: {
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
                            }
                        }]
                    }
                },
                dependencies: {
                    a: "mydep.a",
                    b: "mydep.b",
                    // special map path
                    c: "map.abc",
                    // special widgets path
                    d: "widgets[\"WIDGET_ID\"].map.center",
                    e: "widgets[WIDGET_ID].map.center",
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
        expect(dependencies.d).toBe(state.widgets.containers[DEFAULT_TARGET].widgets[0].map.center);
        expect(dependencies.e).toBe(state.widgets.containers[DEFAULT_TARGET].widgets[0].map.center);
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
});
