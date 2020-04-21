/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');
const {addTimeoutEpic, TEST_TIMEOUT, testEpic } = require('./epicTestUtils');
const {
    handleDashboardWidgetsFilterPanel,
    openDashboardWidgetEditor,
    initDashboardEditorOnNew,
    closeDashboardWidgetEditorOnFinish,
    filterAnonymousUsersForDashboard
} = require('../dashboard');
const {
    createWidget, insertWidget,
    openFilterEditor,
    EDIT_NEW,
    EDITOR_CHANGE
} = require('../../actions/widgets');
const {
    DASHBOARD_LOAD_ERROR,
    SET_EDITING
} = require('../../actions/dashboard');
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


describe('openDashboardWidgetEditor epic', () => {
    it('openDashboardWidgetEditor with New', (done) => {
        const startActions = [createWidget({ id: "TEST" })];
        testEpic(openDashboardWidgetEditor, 1, startActions, actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case SET_EDITING:
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
                case SET_EDITING:
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
                expect(a.type).toBe(DASHBOARD_LOAD_ERROR);
                expect(a.error.status).toBe(403);
            },
            newDashboardState);
        });
        it('triggering an 403 error that shows prompt login when logging out from new dashboard page', () => {
            testEpic(filterAnonymousUsersForDashboard, NUM_ACTIONS, logout(), actions => {
                expect(actions.length).toBe(NUM_ACTIONS);
                const [a] = actions;
                expect(a).toExist();
                expect(a.type).toBe(DASHBOARD_LOAD_ERROR);
            },
            newDashboardState);
        });
    });
});
