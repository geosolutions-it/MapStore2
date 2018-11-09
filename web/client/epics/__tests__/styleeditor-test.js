/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');

const {
    UPDATE_NODE,
    UPDATE_SETTINGS_PARAMS
} = require('../../actions/layers');

const {
    SET_CONTROL_PROPERTY
} = require('../../actions/controls');

const {
    SHOW_NOTIFICATION
} = require('../../actions/notifications');

const {
    REMOVE_ADDITIONAL_LAYER,
    UPDATE_OPTIONS_BY_OWNER
} = require('../../actions/additionallayers');

const {
    RESET_STYLE_EDITOR,
    LOADING_STYLE,
    SELECT_STYLE_TEMPLATE,
    LOADED_STYLE,
    ERROR_STYLE,
    UPDATE_TEMPORARY_STYLE,
    toggleStyleEditor,
    updateStatus,
    selectStyleTemplate,
    createStyle,
    updateStyleCode,
    deleteStyle,
    UPDATE_STATUS
} = require('../../actions/styleeditor');

const {
    toggleStyleEditorEpic,
    updateLayerOnStatusChangeEpic,
    updateTemporaryStyleEpic,
    createStyleEpic,
    updateStyleCodeEpic,
    deleteStyleEpic
} = require('../styleeditor');

const { testEpic } = require('./epicTestUtils');

describe('styleeditor Epics', () => {

    it('test toggleStyleEditorEpic enabled to true', (done) => {

        const state = {
            layers: {
                flat: [
                    {
                        id: 'layerId',
                        name: 'layerName',
                        url: '/geoserver/'
                    }
                ],
                selected: [
                    'layerId'
                ]
            }
        };
        const NUMBER_OF_ACTIONS = 1;

        const results = (actions) => {
            expect(actions.length).toBe(NUMBER_OF_ACTIONS);
            try {
                actions.map((action) => {
                    switch (action.type) {
                        case LOADING_STYLE:
                            expect(action.status).toBe('global');
                            break;
                        default:
                            expect(true).toBe(false);
                    }
                });
            } catch(e) {
                done(e);
            }
            done();
        };

        testEpic(
            toggleStyleEditorEpic,
            NUMBER_OF_ACTIONS,
            toggleStyleEditor(undefined, true),
            results,
        state);

    });
    it('test toggleStyleEditorEpic enabled to false', (done) => {

        const state = {
            layers: {
                flat: [
                    {
                        id: 'layerId',
                        name: 'layerName',
                        url: '/geoserver/'
                    }
                ],
                selected: [
                    'layerId'
                ]
            }
        };
        const NUMBER_OF_ACTIONS = 2;

        const results = (actions) => {
            expect(actions.length).toBe(NUMBER_OF_ACTIONS);
            try {
                actions.map((action) => {
                    switch (action.type) {
                        case RESET_STYLE_EDITOR:
                            expect(action.type).toBe(RESET_STYLE_EDITOR);
                            break;
                        case REMOVE_ADDITIONAL_LAYER:
                            expect(action.owner).toBe('styleeditor');
                            break;
                        default:
                            expect(true).toBe(false);
                    }
                });
            } catch(e) {
                done(e);
            }
            done();
        };

        testEpic(
            toggleStyleEditorEpic,
            NUMBER_OF_ACTIONS,
            toggleStyleEditor(undefined, false),
            results,
        state);

    });
    it('test updateLayerOnStatusChangeEpic status template', (done) => {

        const state = {
            layers: {
                flat: [
                    {
                        id: 'layerId',
                        name: 'layerName',
                        url: '/geoserver/'
                    }
                ],
                selected: [
                    'layerId'
                ]
            }
        };
        const NUMBER_OF_ACTIONS = 1;

        const results = (actions) => {
            expect(actions.length).toBe(NUMBER_OF_ACTIONS);
            try {
                actions.map((action) => {
                    switch (action.type) {
                        case LOADING_STYLE:
                            expect(action.status).toBe('global');
                            break;
                        default:
                            expect(true).toBe(false);
                    }
                });
            } catch(e) {
                done(e);
            }
            done();
        };

        testEpic(
            updateLayerOnStatusChangeEpic,
            NUMBER_OF_ACTIONS,
            updateStatus('template'),
            results,
        state);

    });
    it('test updateLayerOnStatusChangeEpic status edit with describe', (done) => {

        const state = {
            layers: {
                flat: [
                    {
                        id: 'layerId',
                        name: 'layerName',
                        url: 'base/web/client/test-resources/geoserver/',
                        describeFeatureType: {},
                        style: 'test_style'
                    }
                ],
                selected: [
                    'layerId'
                ]
            },
            styleeditor: {
                service: {
                    baseUrl: 'base/web/client/test-resources/geoserver/'
                }
            }
        };
        const NUMBER_OF_ACTIONS = 1;
        const results = (actions) => {
            expect(actions.length).toBe(NUMBER_OF_ACTIONS);
            try {
                actions.map((action) => {
                    switch (action.type) {
                        case SELECT_STYLE_TEMPLATE:
                            expect(action.code).toBe('* { stroke: #ff0000; }');
                            expect(action.format).toBe('css');
                            expect(action.init).toBe(true);
                            break;
                        default:
                            expect(true).toBe(false);
                    }
                });
            } catch(e) {
                done(e);
            }
            done();
        };

        testEpic(
            updateLayerOnStatusChangeEpic,
            NUMBER_OF_ACTIONS,
            updateStatus('edit'),
            results,
        state);
    });
    it('test updateTemporaryStyleEpic error due to generated uuid', (done) => {
        const state = {
            layers: {
                flat: [
                    {
                        id: 'layerId',
                        name: 'layerName',
                        url: 'base/web/client/test-resources/geoserver/',
                        describeFeatureType: {},
                        style: 'test_style'
                    }
                ],
                selected: [
                    'layerId'
                ]
            },
            styleeditor: {
                service: {
                    baseUrl: 'base/web/client/test-resources/geoserver/'
                }
            }
        };
        const NUMBER_OF_ACTIONS = 3;
        const results = (actions) => {
            expect(actions.length).toBe(NUMBER_OF_ACTIONS);
            try {
                actions.map((action) => {
                    switch (action.type) {
                        case LOADING_STYLE:
                            expect(action.status).toBe(undefined);
                            break;
                        case ERROR_STYLE:
                            expect(action.status).toBe(undefined);
                            expect(action.error).toExist();
                            break;
                        case LOADED_STYLE:
                            expect(action).toExist();
                            break;
                        default:
                            expect(true).toBe(false);
                    }
                });
            } catch(e) {
                done(e);
            }
            done();
        };

        testEpic(
            updateTemporaryStyleEpic,
            NUMBER_OF_ACTIONS,
            selectStyleTemplate({ code: '* { stroke: #ff0000; }', templateId: '', format: 'css', init: false }),
            results,
        state);
    });

    it('test updateTemporaryStyleEpic with temporaryId', (done) => {
        const state = {
            layers: {
                flat: [
                    {
                        id: 'layerId',
                        name: 'layerName',
                        url: 'base/web/client/test-resources/geoserver/',
                        describeFeatureType: {},
                        style: 'test_style'
                    }
                ],
                selected: [
                    'layerId'
                ]
            },
            styleeditor: {
                service: {
                    baseUrl: 'base/web/client/test-resources/geoserver/'
                },
                temporaryId: 'test_style'
            }
        };
        const NUMBER_OF_ACTIONS = 4;
        const results = (actions) => {
            expect(actions.length).toBe(NUMBER_OF_ACTIONS);
            try {
                actions.map((action) => {
                    switch (action.type) {
                        case LOADING_STYLE:
                            expect(action.status).toBe(undefined);
                            break;
                        case LOADED_STYLE:
                            expect(action).toExist();
                            break;
                        case UPDATE_OPTIONS_BY_OWNER:
                            expect(action.owner).toBe('styleeditor');
                            expect(action.options[0].style).toBe('test_style');
                            expect(action.options[0]._v_).toExist();
                            expect(action.options[0].singleTile).toBe(true);
                            break;
                        case UPDATE_TEMPORARY_STYLE:
                            expect(action.temporaryId).toBe('test_style');
                            expect(action.templateId).toBe('');
                            expect(action.code).toBe('* { stroke: #ff0000; }');
                            expect(action.format).toBe('css');
                            expect(action.init).toBe(false);
                            break;
                        default:
                            expect(true).toBe(false);
                    }
                });
            } catch(e) {
                done(e);
            }
            done();
        };

        testEpic(
            updateTemporaryStyleEpic,
            NUMBER_OF_ACTIONS,
            selectStyleTemplate({ code: '* { stroke: #ff0000; }', templateId: '', format: 'css', init: false }),
            results,
        state);
    });

    it('test createStyleEpic', (done) => {
        const state = {
            layers: {
                flat: [
                    {
                        id: 'layerId',
                        name: 'layerName',
                        url: 'base/web/client/test-resources/geoserver/',
                        describeFeatureType: {},
                        style: 'test_style'
                    }
                ],
                selected: [
                    'layerId'
                ]
            },
            styleeditor: {
                service: {
                    baseUrl: 'base/web/client/test-resources/geoserver/'
                }
            }
        };
        const NUMBER_OF_ACTIONS = 5;
        const results = (actions) => {
            expect(actions.length).toBe(NUMBER_OF_ACTIONS);
            try {
                actions.map((action) => {
                    switch (action.type) {
                        case LOADING_STYLE:
                            expect(action.status).toBe('');
                            break;
                        case UPDATE_OPTIONS_BY_OWNER:
                            expect(action.owner).toBe('styleeditor');
                            expect(action.options).toEqual([{}]);
                            break;
                        case UPDATE_SETTINGS_PARAMS:
                            const styleName = action.newParams.style.split('___');
                            expect(styleName[0]).toBe('style_title');
                            expect(action.update).toBe(true);
                            break;
                        case UPDATE_STATUS:
                            expect(action.status).toBe('');
                            break;
                        case LOADED_STYLE:
                            expect(action).toExist();
                            break;
                        default:
                            expect(action).toBe(false);
                    }
                });
            } catch(e) {
                done(e);
            }
            done();
        };

        testEpic(
            createStyleEpic,
            NUMBER_OF_ACTIONS,
            createStyle({title: 'style TitLe'}),
            results,
        state);
    });

    it('test createStyleEpic with workspace', (done) => {
        const workspace = 'test';
        const state = {
            layers: {
                flat: [
                    {
                        id: 'layerId',
                        name: `${workspace}:layerName`,
                        url: 'base/web/client/test-resources/geoserver/',
                        describeFeatureType: {},
                        style: 'test_style'
                    }
                ],
                selected: [
                    'layerId'
                ]
            },
            styleeditor: {
                service: {
                    baseUrl: 'base/web/client/test-resources/geoserver/'
                }
            }
        };
        const NUMBER_OF_ACTIONS = 4;
        const results = (actions) => {
            expect(actions.length).toBe(NUMBER_OF_ACTIONS);
            try {
                actions.map((action) => {
                    switch (action.type) {
                        case LOADING_STYLE:
                            expect(action.status).toBe('');
                            break;
                        case UPDATE_OPTIONS_BY_OWNER:
                            expect(action.owner).toBe('styleeditor');
                            expect(action.options).toEqual([{}]);
                            break;
                        case UPDATE_SETTINGS_PARAMS:
                            const styleName = action.newParams.style.split('___');
                            expect(styleName[0]).toBe(`${workspace}:style_title`);
                            expect(action.update).toBe(true);
                            break;
                        case UPDATE_STATUS:
                            expect(action.status).toBe('');
                            break;
                        case LOADED_STYLE:
                            expect(action).toExist();
                            break;
                        default:
                            expect(action).toBe(false);
                    }
                });
            } catch(e) {
                done(e);
            }
            done();
        };

        testEpic(
            createStyleEpic,
            NUMBER_OF_ACTIONS,
            createStyle({title: 'style TitLe'}),
            results,
        state);
    });

    it('test updateStyleCodeEpic', (done) => {
        const state = {
            layers: {
                flat: [
                    {
                        id: 'layerId',
                        name: 'layerName',
                        url: 'base/web/client/test-resources/geoserver/',
                        describeFeatureType: {},
                        style: 'test_style'
                    }
                ],
                selected: [
                    'layerId'
                ]
            },
            styleeditor: {
                service: {
                    baseUrl: 'base/web/client/test-resources/geoserver/'
                },
                code: '* { stroke: #ff0000; }'
            }
        };
        const NUMBER_OF_ACTIONS = 5;
        const results = (actions) => {
            expect(actions.length).toBe(NUMBER_OF_ACTIONS);
            try {
                actions.map((action) => {
                    switch (action.type) {
                        case LOADING_STYLE:
                            expect(action.status).toBe('global');
                            break;
                        case UPDATE_NODE:
                            expect(action.node).toBe('layerId');
                            expect(action.nodeType).toBe('layer');
                            expect(action.options._v_).toExist();
                            break;
                        case LOADED_STYLE:
                            expect(action).toExist();
                            break;
                        case UPDATE_TEMPORARY_STYLE:
                            expect(action.temporaryId).toBe(undefined);
                            expect(action.templateId).toBe('');
                            expect(action.code).toBe('* { stroke: #ff0000; }');
                            expect(action.format).toBe('css');
                            expect(action.init).toBe(true);
                            break;
                        case SHOW_NOTIFICATION:
                            expect(action.title).toBe('styleeditor.savedStyleTitle');
                            expect(action.message).toBe('styleeditor.savedStyleMessage');
                            expect(action.uid).toBe('savedStyleTitle');
                            expect(action.autoDismiss).toBe(5);
                            expect(action.level).toBe('success');
                            break;
                        default:
                            expect(true).toBe(false);
                    }
                });
            } catch(e) {
                done(e);
            }
            done();
        };

        testEpic(
            updateStyleCodeEpic,
            NUMBER_OF_ACTIONS,
            updateStyleCode(),
            results,
        state);
    });

    it('test deleteStyleEpic', (done) => {
        const state = {
            layers: {
                flat: [
                    {
                        id: 'layerId',
                        name: 'TEST_LAYER_3',
                        url: 'base/web/client/test-resources/geoserver/',
                        describeFeatureType: {},
                        style: 'test_style'
                    }
                ],
                selected: [
                    'layerId'
                ]
            },
            styleeditor: {
                service: {
                    baseUrl: 'base/web/client/test-resources/geoserver/'
                },
                code: '* { stroke: #ff0000; }'
            }
        };
        const NUMBER_OF_ACTIONS = 6;
        const results = (actions) => {
            expect(actions.length).toBe(NUMBER_OF_ACTIONS);
            try {
                expect(actions[1].type).toBe(UPDATE_SETTINGS_PARAMS);
                expect(actions[2].type).toBe(LOADED_STYLE);
                expect(actions[3].type).toBe(SET_CONTROL_PROPERTY);
                expect(actions[4].type).toBe(SET_CONTROL_PROPERTY);
                expect(actions[5].type).toBe(SHOW_NOTIFICATION);

                expect(actions[5].level).toBe('success');
            } catch(e) {
                done(e);
            }
            done();
        };

        testEpic(
            deleteStyleEpic,
            NUMBER_OF_ACTIONS,
            deleteStyle('test_style'),
            results,
        state);
    });
});
