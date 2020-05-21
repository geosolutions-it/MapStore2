/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import axios from "../../libs/ajax";
import MockAdapter from "axios-mock-adapter";

var expect = require('expect');
const {addTimeoutEpic, TEST_TIMEOUT, testEpic } = require('./epicTestUtils');
const dashboardActions = require('../../actions/dashboard');
const {
    handleDashboardWidgetsFilterPanel,
    openDashboardWidgetEditor,
    initDashboardEditorOnNew,
    closeDashboardWidgetEditorOnFinish,
    filterAnonymousUsersForDashboard,
    saveDashboard
} = require('../dashboard');
const {
    createWidget, insertWidget,
    openFilterEditor,
    EDIT_NEW,
    EDITOR_CHANGE
} = require('../../actions/widgets');
const { SHOW_NOTIFICATION } = require('../../actions/notifications');

const {checkLoggedUser, logout} = require('../../actions/security');

const { FEATURE_TYPE_SELECTED } = require('../../actions/wfsquery');
const { LOAD_FILTER, search } = require('../../actions/queryform');
const {
    CHANGE_DRAWING_STATUS
} = require('../../actions/draw');
const { SET_CONTROL_PROPERTY } = require('../../actions/controls');

const BASE_STATE = {
    controls: {
        widgetBuilder: {
            available: false
        }
    },
    dashboard: {
        editor: {
            available: true
        }
    }
};
const DISABLE_STATE = {
    controls: {
        widgetBuilder: {
            available: true
        }
    },
    dashboard: {
        editor: {
            available: false
        }
    }
};
const FILTER_BUILDER_STATE = {
    ...BASE_STATE,
    widgets: {
        builder: {

            editor: {
                available: true,
                layer: {
                    search: {
                        url: "test"
                    }
                }
            }
        }
    }
};

const RESOURCE = {
    attributes: {context: undefined},
    category: "DASHBOARD",
    createdAt: null,
    data: {
        layouts: {md: [{}]},
        widgets: []
    },
    id: 1,
    linkedResources: undefined,
    metadata: {name: "test save", description: ""},
    modifiedAt: null,
    permission: null
};

describe('openDashboardWidgetEditor epic', () => {
    it('openDashboardWidgetEditor with New', (done) => {
        const startActions = [createWidget({ id: "TEST" })];
        testEpic(openDashboardWidgetEditor, 1, startActions, actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case dashboardActions.SET_EDITING:
                    expect(action.editing).toBe(true);
                    done();
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            });
            done();
        }, BASE_STATE);
    });
    it('openDashboardWidgetEditor with New disabled', (done) => {
        const startActions = [createWidget({ id: "TEST" })];
        testEpic(addTimeoutEpic(openDashboardWidgetEditor, 10), 1, startActions, actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case TEST_TIMEOUT:
                    done();
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            });
            done();
        }, DISABLE_STATE);
    });
    it('closeDashboardWidgetEditorOnFinish with edit', (done) => {
        const startActions = [insertWidget({})];
        testEpic(closeDashboardWidgetEditorOnFinish, 1, startActions, actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case dashboardActions.SET_EDITING:
                    expect(action.editing).toBe(false);
                    done();
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            });
            done();
        }, BASE_STATE);
    });
    it('closeDashboardWidgetEditorOnFinish disabled', (done) => {
        const startActions = [insertWidget({})];
        testEpic(addTimeoutEpic(closeDashboardWidgetEditorOnFinish, 10), 1, startActions, actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case TEST_TIMEOUT:
                    done();
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            });
            done();
        }, DISABLE_STATE);
    });

    it('initEditorOnNew', (done) => {
        const startActions = [createWidget()];
        testEpic(initDashboardEditorOnNew, 1, startActions, actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case EDIT_NEW:
                    expect(action.widget).toExist();
                    // verify default mapSync, legend, cartesian and yaxis
                    expect(action.widget.mapSync).toBe(false);
                    expect(action.widget.legend).toBe(false);
                    expect(action.widget.cartesian).toBe(true);
                    expect(action.widget.yAxis).toBe(true);
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            }, );
            done();
        }, BASE_STATE);
    });
    it('initEditorOnNew disabled', (done) => {
        const startActions = [createWidget()];
        testEpic(addTimeoutEpic(initDashboardEditorOnNew, 10), 1, startActions, actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case TEST_TIMEOUT:
                    done();
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            }, );
            done();
        }, DISABLE_STATE);
    });
    it('handleWidgetsFilterPanel', (done) => {
        const startActions = [openFilterEditor()];
        testEpic(handleDashboardWidgetsFilterPanel, 3, startActions, actions => {
            expect(actions.length).toBe(3);
            actions.map((action) => {
                switch (action.type) {
                case SET_CONTROL_PROPERTY:
                    if (action.control === "queryPanel") {
                        expect(action.property).toBe("enabled");
                        expect(action.value).toBe(true);
                    }
                    break;
                case FEATURE_TYPE_SELECTED:
                    break;
                case LOAD_FILTER:
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            });
            done();
        },
        // state
        FILTER_BUILDER_STATE);
    });

    it('handleDashboardWidgetsFilterPanel close on search', (done) => {
        const startActions = [openFilterEditor(), search("TEST", {})];
        testEpic(handleDashboardWidgetsFilterPanel, 6, startActions, actions => {
            expect(actions.length).toBe(6);
            actions.map((action) => {
                switch (action.type) {
                case SET_CONTROL_PROPERTY:
                    if (action.control === "queryPanel") {
                        expect(action.property).toBe("enabled");
                    }
                    break;
                case FEATURE_TYPE_SELECTED:
                    break;
                case LOAD_FILTER:
                    break;
                case EDITOR_CHANGE:
                    break;
                case CHANGE_DRAWING_STATUS:
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            });
            done();
        }, FILTER_BUILDER_STATE);
    });
    describe('filterAnonymousUsersForDashboard', () => {
        const newDashboardState = {
            router: {
                location: {
                    pathname: "/dashboard"
                }
            }
        };
        const NUM_ACTIONS = 1;

        it('testing if the user is logged when accessing new dashboard page', () => {
            testEpic(filterAnonymousUsersForDashboard, NUM_ACTIONS, checkLoggedUser(), actions => {
                expect(actions.length).toBe(NUM_ACTIONS);
                const [a] = actions;
                expect(a).toExist();
                expect(a.type).toBe(dashboardActions.DASHBOARD_LOAD_ERROR);
                expect(a.error.status).toBe(403);
            },
            newDashboardState);
        });
        it('triggering an 403 error that shows prompt login when logging out from new dashboard page', () => {
            testEpic(filterAnonymousUsersForDashboard, NUM_ACTIONS, logout(), actions => {
                expect(actions.length).toBe(NUM_ACTIONS);
                const [a] = actions;
                expect(a).toExist();
                expect(a.type).toBe(dashboardActions.DASHBOARD_LOAD_ERROR);
            },
            newDashboardState);
        });
    });
});

describe('saveDashboard', () => {
    let mockAxios;
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });
    afterEach(() => {
        mockAxios.restore();
    });
    it('test save dashboard', (done) => {
        const actionsCount = 6;

        mockAxios.onPost().reply(200, 'resource');
        mockAxios.onPut().reply(200, 'resource');
        mockAxios.onGet().reply(200, 'resource');

        const startActions = [dashboardActions.saveDashboard(RESOURCE)];
        testEpic(saveDashboard, actionsCount, startActions, actions => {
            expect(actions.length).toBe(actionsCount);
            expect(actions[0].type).toBe(dashboardActions.DASHBOARD_LOADING);
            expect(actions[0].value).toBe(true);
            expect(actions[1].type).toBe(dashboardActions.DASHBOARD_SAVED);
            expect(actions[1].id).toBe(RESOURCE.id);
            expect(actions[2].type).toBe(dashboardActions.TRIGGER_SAVE_MODAL);
            expect(actions[2].show).toBe(false);
            expect(actions[3].type).toBe(dashboardActions.LOAD_DASHBOARD);
            expect(actions[3].id).toBe(RESOURCE.id);
            expect(actions[4].type).toBe(SHOW_NOTIFICATION);
            expect(actions[4].id).toBe('DASHBOARD_SAVE_SUCCESS');
            expect(actions[5].type).toBe(dashboardActions.DASHBOARD_LOADING);
            expect(actions[5].value).toBe(false);
        }, BASE_STATE, done);
    });

    it('test save should invoke error if response return error', (done) => {
        const actionsCount = 3;

        mockAxios.onPost().reply(403, 'resource');
        mockAxios.onPut().reply(404, 'resource');
        mockAxios.onGet().reply(200, 'resource');

        const startActions = [dashboardActions.saveDashboard(RESOURCE)];
        testEpic(saveDashboard, actionsCount, startActions, actions => {
            expect(actions.length).toBe(actionsCount);
            expect(actions[0].type).toBe(dashboardActions.DASHBOARD_LOADING);
            expect(actions[0].value).toBe(true);
            expect(actions[1].type).toBe(dashboardActions.SAVE_ERROR);
            expect(
                actions[1].error.status === 403
                 || actions[1].error.status === 404
            ).toBeTruthy();
            expect(actions[2].type).toBe(dashboardActions.DASHBOARD_LOADING);
            expect(actions[2].value).toBe(false);
        }, BASE_STATE, done);
    });

    it('test save should invoke error if no metadata passed', (done) => {
        const withoutMetada = {
            ...RESOURCE,
            metadata: null
        };
        const actionsCount = 3;

        mockAxios.onPost().reply(200, 'resource');
        mockAxios.onPut().reply(200, 'resource');
        mockAxios.onGet().reply(200, 'resource');

        const startActions = [dashboardActions.saveDashboard(withoutMetada)];
        testEpic(saveDashboard, actionsCount, startActions, actions => {
            expect(actions.length).toBe(3);
            expect(actions[0].type).toBe(dashboardActions.DASHBOARD_LOADING);
            expect(actions[0].value).toBe(true);
            expect(actions[1].type).toBe(dashboardActions.SAVE_ERROR);
            expect(typeof(actions[1].error) === 'string').toBeTruthy();
            expect(actions[2].type).toBe(dashboardActions.DASHBOARD_LOADING);
            expect(actions[2].value).toBe(false);
        }, BASE_STATE, done);
    });
});
