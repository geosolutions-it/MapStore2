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
    alignDependenciesToWidgets
} = require('../widgets');
const {
    CLEAR_WIDGETS,
    insertWidget,
    LOAD_DEPENDENCIES
} = require('../../actions/widgets');
const {
    savingMap,
    mapCreated
} = require('../../actions/maps');
const {
    configureMap
} = require('../../actions/config');
const { LOCATION_CHANGE } = require('react-router-redux');

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
            [configureMap(), { type: LOCATION_CHANGE, payload: {
                pathname: "newPath"
            }}],
            checkActions,
            () => {
                return count++
                    ? {
                        routing: {
                            location: "new"
                        }
                    }
                    : {
                        routing: {
                            location: "old"
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
                {
                    type: LOCATION_CHANGE,
                    payload: {
                        pathname: "newPath"
                    }
                }
            ],
            checkActions,
            () => {
                return count++
                    ? {
                        routing: {
                            location: "new"
                        }
                    }
                    : {
                        routing: {
                            location: "old"
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
            {
                type: LOCATION_CHANGE,
                payload: {
                    pathname: "newPath"
                }
            },
            mapCreated(),
            {
                type: LOCATION_CHANGE, payload: {
                    pathname: "newPath"
                }
            }],
            checkActions,
            () => {
                return count++
                    ? {
                        routing: {
                            location: "new"
                        }
                    }
                    : {
                        routing: {
                            location: "old"
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

});
