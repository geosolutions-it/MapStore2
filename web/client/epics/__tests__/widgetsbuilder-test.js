/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');
const {testEpic} = require('./epicTestUtils');
const {
    openWidgetEditor,
    initEditorOnNew,
    closeWidgetEditorOnFinish,
    handleWidgetsFilterPanel,
    initEditorOnNewChart
} = require('../widgetsbuilder');
const {
    createWidget, editWidget, insertWidget,
    openFilterEditor, createChart,
    EDIT_NEW,
    EDITOR_CHANGE
} = require('../../actions/widgets');
const {
    CLOSE_FEATURE_GRID
} = require('../../actions/featuregrid');

const {FEATURE_TYPE_SELECTED} = require('../../actions/wfsquery');
const {LOAD_FILTER, search} = require('../../actions/queryform');
const {
    CHANGE_DRAWING_STATUS
} = require('../../actions/draw');
const { SET_CONTROL_PROPERTY} = require('../../actions/controls');
const {addLayer} = require('../../actions/layers');

describe('widgetsbuilder epic', () => {
    it('openWidgetEditor with New', (done) => {
        const startActions = [createWidget({ id: "TEST" })];
        testEpic(openWidgetEditor, 2, startActions, actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                case SET_CONTROL_PROPERTY:
                    if (action.control === "widgetBuilder") {
                        expect(action.property).toBe("enabled");
                        expect(action.value).toBe(true);
                    } else if (action.control === "metadataexplorer") {
                        expect(action.property).toBe("enabled");
                        expect(action.value).toBe(false);
                    } else {
                        done(new Error("Control not recognized"));
                    }
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            });
            done();
        }, {
            controls: {
                widgetBuilder: {
                    available: true
                }
            }
        });
    });
    it('openWidgetEditor with edit', (done) => {
        const startActions = [editWidget({})];
        testEpic(openWidgetEditor, 2, startActions, actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                case SET_CONTROL_PROPERTY:
                    if (action.control === "widgetBuilder") {
                        expect(action.property).toBe("enabled");
                        expect(action.value).toBe(true);
                    } else if (action.control === "metadataexplorer") {
                        expect(action.property).toBe("enabled");
                        expect(action.value).toBe(false);
                    } else {
                        done(new Error("Control not recognized"));
                    }
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            });
            done();
        }, {
            controls: {
                widgetBuilder: {
                    available: true
                }
            }
        });
    });

    it('closeWidgetEditorOnFinish', (done) => {
        const startActions = [insertWidget({})];
        testEpic(closeWidgetEditorOnFinish, 1, startActions, actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case SET_CONTROL_PROPERTY:
                    if (action.control === "widgetBuilder") {
                        expect(action.property).toBe("enabled");
                        expect(action.value).toBe(false);
                    } else {
                        done(new Error("Control not recognized"));
                    }
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            });
            done();
        }, {
            controls: {
                widgetBuilder: {
                    available: true
                }
            }
        });


    });
    it('closeWidgetEditorOnFinish with ADD_LAYER', (done) => {
        const startActions = [addLayer()];
        testEpic(closeWidgetEditorOnFinish, 1, startActions, actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case SET_CONTROL_PROPERTY:
                    if (action.control === "widgetBuilder") {
                        expect(action.property).toBe("enabled");
                        expect(action.value).toBe(false);
                    } else {
                        done(new Error("Control not recognized"));
                    }
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            });
            done();
        }, {
            controls: {
                widgetBuilder: {
                    available: true
                }
            }
        });
    });
    it('initEditorOnNew', (done) => {
        const startActions = [createWidget()];
        testEpic(initEditorOnNew, 1, startActions, actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case EDIT_NEW:
                    expect(action.widget).toExist();
                    // verify default mapSync
                    expect(action.widget.mapSync).toBe(true);
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            }, );
            done();
        }, {
            controls: {
                widgetBuilder: {
                    available: true
                }
            }
        });
    });
    it('initEditorOnNewChart', (done) => {
        const startActions = [createChart()];
        testEpic(initEditorOnNewChart, 2, startActions, actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                case EDIT_NEW:
                    expect(action.widget).toExist();
                    // verify default mapSync
                    expect(action.widget.mapSync).toBe(true);
                    break;
                case CLOSE_FEATURE_GRID:
                    expect(action.type).toBe(CLOSE_FEATURE_GRID);
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            }, );
            done();
        }, {
            controls: {
                widgetBuilder: {
                    available: true
                }
            }
        });
    });
    it('handleWidgetsFilterPanel', (done) => {
        const startActions = [openFilterEditor()];
        testEpic(handleWidgetsFilterPanel, 4, startActions, actions => {
            expect(actions.length).toBe(4);
            actions.map((action) => {
                switch (action.type) {
                case SET_CONTROL_PROPERTY:
                    if (action.control === "widgetBuilder") {
                        expect(action.property).toBe("enabled");
                        expect(action.value).toBe(false);
                    } else if (action.control === "queryPanel") {
                        expect(action.property).toBe("enabled");
                        expect(action.value).toBe(true);
                    } else {
                        done(new Error("Control not recognized"));
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
        {
            controls: {
                widgetBuilder: {
                    available: true
                }
            },
            widgets: {
                builder: {
                    editor: {
                        layer: {
                            search: {
                                url: "test"
                            }
                        }
                    }
                }
            }
        });
    });
    it('handleWidgetsFilterPanel close on search', (done) => {
        const startActions = [openFilterEditor(), search("TEST", {

        })];
        testEpic(handleWidgetsFilterPanel, 8, startActions, actions => {
            expect(actions.length).toBe(8);
            actions.map((action) => {
                switch (action.type) {
                case SET_CONTROL_PROPERTY:
                    if (action.control === "widgetBuilder") {
                        expect(action.property).toBe("enabled");
                    } else if (action.control === "queryPanel") {
                        expect(action.property).toBe("enabled");
                    } else {
                        done(new Error("Control not recognized"));
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
        },
        // state
        {
            controls: {
                widgetBuilder: {
                    available: true
                }
            },
            widgets: {
                builder: {
                    editor: {
                        layer: {
                            search: {
                                url: "test"
                            }
                        }
                    }
                }
            }
        });
    });

});
