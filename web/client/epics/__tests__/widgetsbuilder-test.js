/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { testEpic } from './epicTestUtils';

import {
    openWidgetEditor,
    initEditorOnNew,
    closeWidgetEditorOnFinish,
    handleWidgetsFilterPanel,
    initEditorOnNewChart
} from '../widgetsbuilder';

import {
    createWidget,
    editWidget,
    insertWidget,
    openFilterEditor,
    createChart,
    EDIT_NEW,
    EDITOR_CHANGE
} from '../../actions/widgets';

import { CLOSE_FEATURE_GRID } from '../../actions/featuregrid';
import { FEATURE_TYPE_SELECTED } from '../../actions/wfsquery';
import { LOAD_FILTER, search } from '../../actions/queryform';
import { CHANGE_DRAWING_STATUS } from '../../actions/draw';
import { SET_CONTROL_PROPERTY } from '../../actions/controls';
import { addLayer } from '../../actions/layers';

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
            } );
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
        const NUMBER_OF_ACTIONS = 3;
        testEpic(initEditorOnNewChart, NUMBER_OF_ACTIONS, startActions, actions => {
            expect(actions.length).toBe(NUMBER_OF_ACTIONS);
            actions.map((action) => {
                switch (action.type) {
                case EDIT_NEW:
                    expect(action.widget).toExist();
                    // verify default mapSync
                    expect(action.widget.mapSync).toBe(true);
                    expect(action.widget.widgetType).toBe('chart');
                    expect(action.widget.charts.length).toBe(1);
                    expect(action.widget.charts[0].chartId).toBe(action.widget.selectedChartId);
                    expect(action.widget.charts[0].traces.length).toBe(1);
                    expect(action.widget.charts[0].traces[0].type).toBe('bar');
                    expect(action.widget.charts[0].traces[0].layer.id).toBe('TEST2');
                    break;
                case EDITOR_CHANGE:
                    expect(action.key).toBe('returnToFeatureGrid');
                    expect(action.value).toBe(true);
                    break;
                case CLOSE_FEATURE_GRID:
                    expect(action.type).toBe(CLOSE_FEATURE_GRID);
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            } );
            done();
        }, {
            controls: {
                widgetBuilder: {
                    available: true
                }
            },
            layers: {
                flat: [
                    {
                        id: "TEST1"
                    },
                    {
                        id: "TEST2"
                    }]
            },
            featuregrid: {
                selectedLayer: "TEST2"
            },
            widgets: {
                builder: {
                    editor: {
                        charts: [{
                            traces: [{
                                layer: {
                                    id: "TEST1"
                                }
                            }]
                        }]
                    }
                }
            }
        });
    });
    it('handleWidgetsFilterPanel', (done) => {
        const startActions = [openFilterEditor()];
        testEpic(handleWidgetsFilterPanel, 3, startActions, actions => {
            expect(actions.length).toBe(3);
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
                    expect(action.fields).toEqual([{
                        name: "x",
                        type: "string",
                        alias: "X alias"
                    }]);
                    expect(action.owner).toEqual("widgets");
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
                            fields: [{
                                name: "x",
                                type: "string",
                                alias: "X alias"
                            }],
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
        testEpic(handleWidgetsFilterPanel, 7, startActions, actions => {
            expect(actions.length).toBe(7);
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
