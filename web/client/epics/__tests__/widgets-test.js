/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { testEpic, addTimeoutEpic, TEST_TIMEOUT } from './epicTestUtils';

import {
    clearWidgetsOnLocationChange,
    alignDependenciesToWidgets,
    toggleWidgetConnectFlow,
    updateLayerOnLayerPropertiesChange,
    updateLayerOnLoadingErrorChange,
    updateDependenciesMapOnMapSwitch,
    onWidgetCreationFromMap,
    onMapEditorOpenEpic
} from '../widgets';

import {
    CLEAR_WIDGETS,
    insertWidget,
    toggleConnection,
    selectWidget,
    UPDATE_LAYER,
    EDITOR_CHANGE,
    EDITOR_SETTING_CHANGE,
    LOAD_DEPENDENCIES,
    DEPENDENCY_SELECTOR_KEY,
    updateWidgetProperty,
    REPLACE,
    onEditorChange,
    UPDATE_PROPERTY
} from '../../actions/widgets';

import { configureMap } from '../../actions/config';
import { changeLayerProperties, layerLoad, layerError, updateNode } from '../../actions/layers';
import { onLocationChanged } from 'connected-react-router';
import { ActionsObservable } from 'redux-observable';
import Rx from 'rxjs';
import { HIDE, save } from '../../actions/mapEditor';

describe('widgets Epics', () => {
    it('clearWidgetsOnLocationChange triggers CLEAR_WIDGETS on LOCATION_CHANGE', (done) => {
        const checkActions = actions => {
            expect(actions.length).toBe(1);
            const action = actions[0];
            expect(action.type).toBe(CLEAR_WIDGETS);
            done();
        };
        let count = 0;
        testEpic(clearWidgetsOnLocationChange,
            1,
            [configureMap(), onLocationChanged({
                pathname: "newPath"
            })],
            checkActions,
            () => {
                return count++
                    ? {
                        router: {
                            location: { pathname: "new/3012"}
                        }
                    }
                    : {
                        router: {
                            location: { pathname: "old/2013"}
                        }
                    };
            });
    });
    it('clearWidgetsOnLocationChange does not trigger CLEAR_WIDGETS on replace location', (done) => {
        const checkActions = actions => {
            expect(actions.length).toBe(1);
            const action = actions[0];
            expect(action.type).toBe(TEST_TIMEOUT);
            done();
        };
        testEpic(addTimeoutEpic(clearWidgetsOnLocationChange, 20),
            1,
            [configureMap(), onLocationChanged({
                pathname: "newPath"
            }, 'REPLACE')],
            checkActions);
    });
    it('alignDependenciesToWidgets triggered on insertWidget', (done) => {
        const checkActions = actions => {
            expect(actions.length).toBe(1);
            const action = actions[0];
            expect(action.type).toBe(LOAD_DEPENDENCIES);
            expect(action.dependencies).toExist();
            expect(action.dependencies.center).toBe("map.center");
            expect(action.dependencies.viewport).toBe("map.bbox");
            expect(action.dependencies.zoom).toBe("map.zoom");
            done();
        };
        testEpic(alignDependenciesToWidgets,
            1,
            [insertWidget({id: 'test'})],
            checkActions,
            {});
    });

    it('alignDependenciesToWidgets triggered on insertWidget of type map', (done) => {
        const checkActions = actions => {
            expect(actions.length).toBe(1);
            const action = actions[0];
            expect(action.type).toBe(LOAD_DEPENDENCIES);
            expect(action.dependencies).toExist();
            expect(action.dependencies.center).toBe("map.center");
            expect(action.dependencies.viewport).toBe("map.bbox");
            expect(action.dependencies.zoom).toBe("map.zoom");
            expect(action.dependencies["map.mapSync"]).toBe("map.mapSync");
            expect(action.dependencies["map.dependenciesMap"]).toBe("map.dependenciesMap");
            Object.keys(action.dependencies)
                .filter(d=> d.includes('widgets'))
                .forEach((dep)=>{
                    if (dep.includes('viewport')) {
                        expect(dep.replace('viewport', 'bbox')).toBe(action.dependencies[dep]);
                    } else {
                        expect(dep).toBe(action.dependencies[dep]);
                    }
                });
            done();
        };
        testEpic(alignDependenciesToWidgets,
            1,
            [insertWidget({id: 'test'})],
            checkActions,
            {
                widgets: {
                    containers: {
                        floating: {
                            widgets: [{
                                id: 'w1',
                                selectedMapId: 'm1',
                                widgetType: 'map',
                                maps: [
                                    {center: {x: 0, y: 0, crs: 'EPSG:4236'}, zoom: 4, mapId: 'm1', layers: ['layer_1']},
                                    {center: {x: 1, y: 1, crs: 'EPSG:4236'}, zoom: 5, mapId: 'm2', layers: ['layer_2']}
                                ]
                            }]
                        }
                    }
                }
            });
    });

    it('toggleWidgetConnectFlow with only map', (done) => {
        const checkActions = actions => {
            expect(actions.length).toBe(2);
            expect(actions[0].type).toBe(EDITOR_CHANGE);
            expect(actions[0].key).toBe("mapSync");
            expect(actions[0].value).toBe(true);
            const action = actions[1];
            expect(action.type).toBe(EDITOR_CHANGE);
            expect(action.key).toExist();
            expect(action.key).toBe("dependenciesMap");
            expect(action.value.center).toBe("center");
            expect(action.value.zoom).toBe("zoom");
            done();
        };
        testEpic(toggleWidgetConnectFlow,
            2,
            [toggleConnection(
                true,
                ["map"],
                { mappings: { zoom: "zoom", center: "center" } }
            )],
            checkActions,
            {});
    });
    it('toggleWidgetConnectFlow for widgets', (done) => {
        const checkActions = actions => {
            expect(actions.length).toBe(2);
            expect(actions[0].type).toBe(EDITOR_CHANGE);
            expect(actions[0].key).toBe("mapSync");
            expect(actions[0].value).toBe(true);
            const action = actions[1];
            expect(action.type).toBe(EDITOR_CHANGE);
            expect(action.key).toExist();
            expect(action.key).toBe("dependenciesMap");
            expect(action.value.center).toBe("widgets[a].maps[m].center");
            expect(action.value.zoom).toBe("widgets[a].maps[m].zoom");
            done();
        };
        testEpic(toggleWidgetConnectFlow,
            2,
            [toggleConnection(
                true,
                ["widgets[a].maps[m].map"],
                { mappings: { "center": "center", "zoom": "zoom" } }
            )],
            checkActions,
            {});
    });
    it('toggleWidgetConnectFlow for multiple widgets', (done) => {
        const checkActions = actions => {
            expect(actions.length).toBe(4);
            expect(actions[0].type).toBe(EDITOR_SETTING_CHANGE);
            expect(actions[0].key).toBe(DEPENDENCY_SELECTOR_KEY);
            expect(actions[0].value.active).toBe(true);
            expect(actions[0].value.availableDependencies.length).toBe(2);
            expect(actions[1].type).toBe(EDITOR_CHANGE);
            expect(actions[1].key).toBe("mapSync");
            expect(actions[1].value).toBe(true);
            const action = actions[2];
            expect(action.type).toBe(EDITOR_CHANGE);
            expect(action.key).toExist();
            expect(action.key).toBe("dependenciesMap");
            expect(action.value.center).toBe("widgets[w1].maps[m1].center");
            expect(action.value.zoom).toBe("widgets[w1].maps[m1].zoom");
            expect(actions[3].type).toBe(EDITOR_SETTING_CHANGE);
            expect(actions[3].key).toBe(DEPENDENCY_SELECTOR_KEY);
            expect(actions[3].value.active).toBe(false);
            done();
        };
        testEpic(toggleWidgetConnectFlow,
            4,
            [toggleConnection(
                true,
                ["w1", "w2"],
                { mappings: { "center": "center", "zoom": "zoom" } }
            ), selectWidget({
                id: "w1",
                widgetType: "map",
                selectedMapId: "m1"
            })],
            checkActions,
            {
                widgets: {
                    builder: {
                        settings: {
                            [DEPENDENCY_SELECTOR_KEY]: { active: true,
                                availableDependencies: [
                                    "map.zoom",
                                    "widgets[w1].maps[m1].map",
                                    "widgets[w2].maps[m1].map"
                                ] }
                        }
                    }
                }
            });
    });
    it('toggleWidgetConnectFlow deactivate widgets', (done) => {
        const checkActions = actions => {
            expect(actions.length).toBe(2);
            expect(actions[0].type).toBe(EDITOR_CHANGE);
            expect(actions[0].key).toBe("mapSync");
            expect(actions[0].value).toBe(false);
            const action = actions[1];
            expect(action.type).toBe(EDITOR_CHANGE);
            expect(action.key).toExist();
            expect(action.key).toBe("dependenciesMap");
            expect(action.value.center).toNotExist();
            expect(action.value.zoom).toNotExist();
            done();
        };
        testEpic(toggleWidgetConnectFlow,
            2,
            [toggleConnection(
                false,
                ["map"],
                { mappings: { "center": "widgets[a].maps[m].center", "zoom": "widgets[a].maps[m].zoom" } }
            )],
            checkActions,
            {});
    });
    it('changeLayerPropertiesEpic triggers updateWidgetLayer on filterLayer change', (done) => {
        const checkActions = actions => {
            expect(actions.length).toBe(1);
            expect(actions[0].type).toBe(UPDATE_LAYER);
            expect(actions[0].layer).toEqual({
                id: "1",
                name: "layer"
            });
            done();
        };
        testEpic(updateLayerOnLayerPropertiesChange,
            1,
            [changeLayerProperties(
                "1",
                {layerFilter: {rowId: 1567705038414}}
            )],
            checkActions,
            {
                layers: {
                    flat: [{
                        id: "1",
                        name: "layer"
                    }, {
                        id: "2",
                        name: "layer2",
                        filterLayer: {rowId: 1567705038414}
                    }, {
                        id: "3",
                        name: "layer3"
                    }]
                }
            });
    });
    it('changeLayerPropertiesEpic triggers updateWidgetLayer on fields change', (done) => {
        const checkActions = actions => {
            expect(actions.length).toBe(1);
            expect(actions[0].type).toBe(UPDATE_LAYER);
            expect(actions[0].layer).toEqual({
                id: "1",
                name: "layer"
            });
            done();
        };
        testEpic(updateLayerOnLayerPropertiesChange,
            1,
            [changeLayerProperties(
                "1",
                {fields: [{name: "field1", type: "string", alias: "Field 1"}]}
            )],
            checkActions,
            {
                layers: {
                    flat: [{
                        id: "1",
                        name: "layer"
                    }, {
                        id: "2",
                        name: "layer2",
                        fields: [{name: "field1", type: "string", alias: "Field 1"}]
                    }, {
                        id: "3",
                        name: "layer3"
                    }]
                }
            });
    });
    it('changeLayerPropertiesEpic does not triger updateWidgetLayer on visibility change', (done) => {
        const action = changeLayerProperties("1", {visibility: false});
        const state = {
            layers: {
                flat: [{
                    id: "1",
                    name: "layer"
                }, {
                    id: "2",
                    name: "layer2",
                    filterLayer: {rowId: 1567705038414}
                }, {
                    id: "3",
                    name: "layer3"
                }]
            }
        };
        const checkActions = actions => {
            expect(actions.length).toBe(0);
            done();
        };
        updateLayerOnLayerPropertiesChange(new ActionsObservable(Rx.Observable.of(action)), {getState: () => state})
            .toArray()
            .subscribe(checkActions);
    });
    it('updateNode triggers updateWidgetLayer on filterLayer change', (done) => {
        const checkActions = actions => {
            expect(actions.length).toBe(1);
            expect(actions[0].type).toBe(UPDATE_LAYER);
            expect(actions[0].layer).toEqual({
                id: "1",
                name: "layer"
            });
            done();
        };
        testEpic(updateLayerOnLayerPropertiesChange,
            1,
            [updateNode(
                "1",
                "layers",
                {layerFilter: {rowId: 1567705038414}}
            )],
            checkActions,
            {
                layers: {
                    flat: [{
                        id: "1",
                        name: "layer"
                    }, {
                        id: "2",
                        name: "layer2",
                        filterLayer: {rowId: 1567705038414}
                    }, {
                        id: "3",
                        name: "layer3"
                    }]
                }
            });
    });
    it('updateNode does not trigger updateWidgetLayer layer property change', (done) => {
        const checkActions = actions => {
            expect(actions.length).toBe(1);
            expect(actions[0].type).toBe(TEST_TIMEOUT);
            done();
        };
        testEpic(addTimeoutEpic(updateLayerOnLayerPropertiesChange, 0),
            1,
            [updateNode(
                "1",
                "layers",
                {filter: {rowId: 1567705038414}}
            )],
            checkActions,
            {
                layers: {
                    flat: [{
                        id: "1",
                        name: "layer"
                    }, {
                        id: "2",
                        name: "layer2",
                        filterLayer: {rowId: 1567705038414}
                    }]
                }
            });
    });
    it('updateNode does not trigger updateWidgetLayer group property change', (done) => {
        const checkActions = actions => {
            expect(actions.length).toBe(1);
            expect(actions[0].type).toBe(TEST_TIMEOUT);
            done();
        };
        testEpic(addTimeoutEpic(updateLayerOnLayerPropertiesChange, 0),
            1,
            [updateNode(
                "1",
                "groups",
                {test: "some"}
            )],
            checkActions,
            {
                layers: {
                    flat: [{
                        id: "1",
                        name: "layer"
                    }, {
                        id: "2",
                        name: "layer2",
                        filterLayer: {rowId: 1567705038414}
                    }]
                }
            });
    });
    it('updateLayerOnLoadingErrorChange triggers updateWidgetLayer on LAYER_LOAD error', (done) => {
        const checkActions = actions => {
            expect(actions.length).toBe(1);
            expect(actions[0].type).toBe(UPDATE_LAYER);
            expect(actions[0].layer).toEqual({
                id: "2",
                name: "layer2",
                loadingError: "Error"
            });
            done();
        };
        testEpic(updateLayerOnLoadingErrorChange,
            1,
            [layerLoad(
                "2",
                "Error"
            )],
            checkActions,
            {
                layers: {
                    flat: [{
                        id: "1",
                        name: "layer"
                    }, {
                        id: "2",
                        name: "layer2",
                        loadingError: "Error"
                    }, {
                        id: "3",
                        name: "layer3"
                    }]
                }
            });
    });
    it('updateLayerOnLoadingErrorChange triggers updateWidgetLayer on LAYER_ERROR error', (done) => {
        const checkActions = actions => {
            expect(actions.length).toBe(1);
            expect(actions[0].type).toBe(UPDATE_LAYER);
            expect(actions[0].layer).toEqual({
                id: "2",
                name: "layer2",
                loadingError: "Error"
            });
            done();
        };
        testEpic(updateLayerOnLoadingErrorChange,
            1,
            [layerError(
                "2",
                10,
                10
            )],
            checkActions,
            {
                layers: {
                    flat: [{
                        id: "1",
                        name: "layer"
                    }, {
                        id: "2",
                        name: "layer2",
                        loadingError: "Error"
                    }, {
                        id: "3",
                        name: "layer3"
                    }]
                }
            });
    });
    it('updateLayerOnLoadingErrorChange does not trigger updateWidgetLayer if loadingError does not change', (done) => {
        const action = layerLoad("3", "Error");
        const state = {
            layers: {
                flat: [{
                    id: "1",
                    name: "layer"
                }, {
                    id: "2",
                    name: "layer2",
                    loadingError: "Error"
                }, {
                    id: "3",
                    name: "layer3",
                    previousLoadingError: "Error",
                    loadingError: "Error"
                }]
            }
        };
        const checkActions = actions => {
            expect(actions.length).toBe(0);
            done();
        };
        updateLayerOnLoadingErrorChange(new ActionsObservable(Rx.Observable.of(action)), {getState: () => state})
            .toArray()
            .subscribe(checkActions);
    });

    it('updateDependenciesMapOnMapSwitch on mode="replace"', (done) => {
        const checkActions = actions => {
            expect(actions.length).toBe(1);
            expect(actions[0].type).toBe(REPLACE);
            expect(actions[0].widgets.length).toBe(2);
            expect(actions[0].widgets[1].dependenciesMap.layers).toBe("widgets[w1].maps[m2].layers");
            expect(actions[0].widgets[1].dependenciesMap.zoom).toBe("widgets[w1].maps[m2].zoom");
            expect(actions[0].widgets[1].dependenciesMap.viewport).toBe("widgets[w1].maps[m2].bbox");
            expect(actions[0].widgets[1].dependenciesMap.dependenciesMap).toBe("widgets[w1].dependenciesMap");
            expect(actions[0].widgets[1].dependenciesMap.mapSync).toBe("widgets[w1].mapSync");
            done();
        };
        testEpic(updateDependenciesMapOnMapSwitch,
            1,
            [updateWidgetProperty(
                "w1",
                "selectedMapId",
                "m2"
            )],
            checkActions,
            {
                widgets: {
                    containers: {
                        floating: {
                            widgets: [{
                                id: 'w1',
                                selectedMapId: 'm1',
                                widgetType: 'map',
                                maps: [
                                    {center: {x: 0, y: 0, crs: 'EPSG:4236'}, zoom: 4, mapId: 'm1', layers: ['layer_1']},
                                    {center: {x: 1, y: 1, crs: 'EPSG:4236'}, zoom: 5, mapId: 'm2', layers: ['layer_2']}
                                ]
                            },
                            {
                                id: 'w2',
                                widgetType: 'legend',
                                dependenciesMap: {
                                    zoom: "widgets[w1].maps[m1].zoom",
                                    layers: "widgets[w1].maps[m1].layers",
                                    viewport: "widgets[w1].maps[m1].bbox",
                                    dependenciesMap: "widgets[w1].dependenciesMap",
                                    mapSync: "widgets[w1].mapSync"
                                }
                            }]
                        }
                    }
                }
            });
    });
    it('updateDependenciesMapOnMapSwitch on mode="merge"', (done) => {
        const checkActions = actions => {
            expect(actions.length).toBe(1);
            expect(actions[0].type).toBe(REPLACE);
            expect(actions[0].widgets.length).toBe(2);
            expect(actions[0].widgets[1].dependenciesMap.layers).toBe("widgets[w1].maps[m2].layers");
            expect(actions[0].widgets[1].dependenciesMap.zoom).toBe("widgets[w1].maps[m2].zoom");
            expect(actions[0].widgets[1].dependenciesMap.viewport).toBe("widgets[w1].maps[m2].bbox");
            expect(actions[0].widgets[1].dependenciesMap.dependenciesMap).toBe("widgets[w1].dependenciesMap");
            expect(actions[0].widgets[1].dependenciesMap.mapSync).toBe("widgets[w1].mapSync");
            done();
        };
        testEpic(updateDependenciesMapOnMapSwitch,
            1,
            [updateWidgetProperty(
                "w1",
                "maps",
                {center: {x: 1, y: 1, crs: 'EPSG:4236'}, zoom: 8, mapId: 'm2', layers: ['layer_2']},
                "merge"
            )],
            checkActions,
            {
                widgets: {
                    containers: {
                        floating: {
                            widgets: [{
                                id: 'w1',
                                selectedMapId: 'm1',
                                widgetType: 'map',
                                maps: [
                                    {center: {x: 0, y: 0, crs: 'EPSG:4236'}, zoom: 4, mapId: 'm1', layers: ['layer_1']}
                                ]
                            },
                            {
                                id: 'w2',
                                widgetType: 'legend',
                                dependenciesMap: {
                                    zoom: "widgets[w1].maps[m1].zoom",
                                    layers: "widgets[w1].maps[m1].layers",
                                    viewport: "widgets[w1].maps[m1].bbox",
                                    dependenciesMap: "widgets[w1].dependenciesMap",
                                    mapSync: "widgets[w1].mapSync"
                                }
                            }]
                        }
                    }
                }
            });
    });
    it('onWidgetCreationFromMap', (done) => {
        const checkActions = actions => {
            expect(actions.length).toBe(1);
            expect(actions[0].type).toBe(EDITOR_CHANGE);
            expect(actions[0].key).toBe("chart-layers");
            expect(actions[0].value).toEqual([{id: "1", name: "layer"}]);
            done();
        };
        const state = {
            layers: {
                flat: [{
                    id: "1",
                    name: "layer"
                }, {
                    id: "2",
                    name: "layer2"
                }, {
                    id: "3",
                    name: "layer3"
                }],
                selected: ["1"]
            },
            dashboard: {
                editor: {
                    available: false
                },
                editing: false
            }
        };
        testEpic(onWidgetCreationFromMap,
            1,
            [onEditorChange("widgetType", "chart")],
            checkActions, state);
    });
    it('onMapEditorOpenEpic triggers updateWidgetProperty and hide on SAVE with widgetId', (done) => {
        const checkActions = actions => {
            expect(actions.length).toBe(2);
            expect(actions[0].type).toBe(UPDATE_PROPERTY);
            expect(actions[0].id).toBe("widget-123");
            expect(actions[0].key).toBe("maps");
            expect(actions[0].value).toEqual({
                widgetId: "widget-123",
                mapId: "map-456",
                layers: ["layer1", "layer2"],
                center: { x: 0, y: 0, crs: "EPSG:4326" },
                zoom: 5
            });
            expect(actions[0].mode).toBe("merge");
            expect(actions[1].type).toBe(HIDE);
            expect(actions[1].owner).toBe("widgetInlineEditor");
            done();
        };
        const mapData = {
            widgetId: "widget-123",
            mapId: "map-456",
            layers: ["layer1", "layer2"],
            center: { x: 0, y: 0, crs: "EPSG:4326" },
            zoom: 5
        };
        testEpic(onMapEditorOpenEpic,
            2,
            [save(mapData, "widgetInlineEditor")],
            checkActions);
    });
    it('onMapEditorOpenEpic does not trigger actions when map has no widgetId', (done) => {
        const checkActions = actions => {
            expect(actions.length).toBe(0);
            done();
        };
        const mapData = {
            mapId: "map-456",
            layers: ["layer1", "layer2"],
            center: { x: 0, y: 0, crs: "EPSG:4326" },
            zoom: 5
        };
        testEpic(onMapEditorOpenEpic,
            0,
            [save(mapData, "widgetInlineEditor")],
            checkActions);
    });
    it('onMapEditorOpenEpic does not trigger actions when map is undefined', (done) => {
        const checkActions = actions => {
            expect(actions.length).toBe(0);
            done();
        };
        testEpic(onMapEditorOpenEpic,
            0,
            [save(undefined, "widgetInlineEditor")],
            checkActions);
    });
});
