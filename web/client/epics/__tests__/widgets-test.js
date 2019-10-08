/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');
const { testEpic, addTimeoutEpic, TEST_TIMEOUT } = require('./epicTestUtils');

const {
    clearWidgetsOnLocationChange,
    alignDependenciesToWidgets,
    toggleWidgetConnectFlow,
    updateLayerOnLayerPropertiesChange,
    updateLayerOnLoadingErrorChange
} = require('../widgets');
const {
    CLEAR_WIDGETS,
    insertWidget,
    toggleConnection,
    selectWidget,
    UPDATE_LAYER,
    EDITOR_CHANGE,
    EDITOR_SETTING_CHANGE,
    LOAD_DEPENDENCIES,
    DEPENDENCY_SELECTOR_KEY
} = require('../../actions/widgets');
const {
    savingMap,
    mapCreated
} = require('../../actions/maps');
const {
    configureMap
} = require('../../actions/config');
const {
    changeLayerProperties,
    layerLoad,
    layerError
} = require('../../actions/layers');
const { onLocationChanged } = require('connected-react-router');
const { ActionsObservable } = require('redux-observable');
const Rx = require('rxjs');

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
    it('clearWidgetsOnLocationChange does not trigger CLEAR_WIDGETS when change maptype', (done) => {
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
                            location: { pathname: "new-map-type/3012"}
                        }
                    }
                    : {
                        router: {
                            location: { pathname: "old-map-type/2013"}
                        }
                    };
            });
    });
    it('clearWidgetsOnLocationChange stops CLEAR_WIDGETS triggers if saving', (done) => {
        const checkActions = actions => {
            expect(actions.length).toBe(1);
            const action = actions[0];
            expect(action.type).toBe(TEST_TIMEOUT);
            done();
        };
        let count = 0;
        testEpic(addTimeoutEpic(clearWidgetsOnLocationChange, 20),
            1,
            [
                configureMap(),
                savingMap(),
                onLocationChanged({
                    pathname: "newPath"
                })
            ],
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
    it('clearWidgetsOnLocationChange restores CLEAR_WIDGETS triggers after save completed', (done) => {
        const checkActions = actions => {
            expect(actions.length).toBe(1);
            const action = actions[0];
            expect(action.type).toBe(CLEAR_WIDGETS);
            done();
        };
        let count = 0;
        testEpic(clearWidgetsOnLocationChange,
            1,
            [configureMap(),
                savingMap(),
                onLocationChanged({
                    pathname: "newPath"
                }),
                mapCreated(),
                onLocationChanged({
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
            expect(action.value.center).toBe("widgets[a].map.center");
            expect(action.value.zoom).toBe("widgets[a].map.zoom");
            done();
        };
        testEpic(toggleWidgetConnectFlow,
            2,
            [toggleConnection(
                true,
                ["widgets[a].map"],
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
            expect(action.value.center).toBe("widgets[w1].map.center");
            expect(action.value.zoom).toBe("widgets[w1].map.zoom");
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
                widgetType: "map"
            })],
            checkActions,
            {
                widgets: {
                    builder: {
                        settings: {
                            [DEPENDENCY_SELECTOR_KEY]: { active: true,
                                availableDependencies: [
                                    "map.zoom",
                                    "widgets[w1].map",
                                    "widgets[w2].map"
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
                { mappings: { "center": "widgets[a].map.center", "zoom": "widgets[a].map.zoom" } }
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
});
