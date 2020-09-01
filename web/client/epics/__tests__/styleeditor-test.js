/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {
    UPDATE_NODE,
    UPDATE_SETTINGS_PARAMS
} from '../../actions/layers';

import {
    SET_CONTROL_PROPERTY
} from '../../actions/controls';

import {
    SHOW_NOTIFICATION
} from '../../actions/notifications';

import {
    REMOVE_ADDITIONAL_LAYER,
    UPDATE_OPTIONS_BY_OWNER
} from '../../actions/additionallayers';

import {
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
    UPDATE_STATUS,
    setDefaultStyle,
    INIT_STYLE_SERVICE
} from '../../actions/styleeditor';

import {
    toggleStyleEditorEpic,
    updateLayerOnStatusChangeEpic,
    updateTemporaryStyleEpic,
    createStyleEpic,
    updateStyleCodeEpic,
    deleteStyleEpic,
    setDefaultStyleEpic
} from '../styleeditor';

import { testEpic } from './epicTestUtils';

import MockAdapter from 'axios-mock-adapter';
import axios from '../../libs/ajax';

let mockAxios;

describe('Test styleeditor epics', () => {

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
            } catch (e) {
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
            } catch (e) {
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
    it('toggleStyleEditorEpic: missing availableStyles starts the styles retrieval', (done) => {

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
                ],
                settings: {
                    options: {
                        opacity: 1
                    }
                }
            },
            styleeditor: {
                enabled: true
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
            } catch (e) {
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
            } catch (e) {
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
            } catch (e) {
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
            } catch (e) {
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
            } catch (e) {
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
            } catch (e) {
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
            } catch (e) {
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
        const NUMBER_OF_ACTIONS = 6;
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
                        expect(action.options._v_).toBeTruthy();
                        break;
                    case LOADED_STYLE:
                        expect(action).toBeTruthy();
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
                    case UPDATE_SETTINGS_PARAMS:
                        expect(action).toBeTruthy();
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
            } catch (e) {
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
            } catch (e) {
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

    it('test setDefaultStyleEpic', (done) => {

        const selectedStyle = 'point';
        const currentAvailableStyles = [
            // default style is on first position pf array
            {
                name: 'test_TEST_LAYER_1'
            },
            //
            {
                name: 'point'
            },
            {
                name: 'generic'
            }
        ];
        const updatedAvailableStyles = [
            // default style is on first position pf array
            {
                name: 'point'
            },
            //
            {
                name: 'test_TEST_LAYER_1'
            },
            {
                name: 'generic'
            }
        ];

        const state = {
            layers: {
                flat: [
                    {
                        id: 'layerId',
                        name: 'TEST_LAYER_2',
                        url: 'base/web/client/test-resources/geoserver/',
                        describeFeatureType: {},
                        style: ''
                    }
                ],
                selected: [
                    'layerId'
                ],
                settings: {
                    node: 'layerId',
                    nodeType: 'layers',
                    options: {
                        availableStyles: currentAvailableStyles,
                        style: selectedStyle
                    }
                }
            },
            styleeditor: {
                service: {
                    baseUrl: 'base/web/client/test-resources/geoserver/'
                }
            }
        };
        const NUMBER_OF_ACTIONS = 4;
        const results = (actions) => {
            try {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);

                expect(actions[0].type).toBe(LOADING_STYLE);

                expect(actions[1].type).toBe(UPDATE_SETTINGS_PARAMS);
                expect(actions[1].newParams.availableStyles).toEqual(updatedAvailableStyles);

                expect(actions[2].type).toBe(SHOW_NOTIFICATION);

                expect(actions[3].type).toBe(LOADED_STYLE);
            } catch (e) {
                done(e);
            }
            done();
        };
        try {
            testEpic(
                setDefaultStyleEpic,
                NUMBER_OF_ACTIONS,
                setDefaultStyle(),
                results,
                state);

        } catch (e) {
            done(e);
        }
    });
});

describe('Test styleeditor epics, with mock axios', () => {
    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });

    it('test updateStyleCodeEpic with 200 response', (done) => {

        mockAxios.onPut(/\/styles/).reply((config) => {
            expect(config.url).toBe('/geoserver/rest/styles/test_style');
            expect(config.params.raw).toBe(true);
            return [ 200, {}];
        });

        const state = {
            layers: {
                flat: [
                    {
                        id: 'layerId',
                        name: 'layerName',
                        url: '/geoserver/',
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
                    baseUrl: '/geoserver/'
                },
                code: '* { stroke: #ff0000; }'
            }
        };

        const NUMBER_OF_ACTIONS = 6;

        const results = (actions) => {
            const [
                loadingStyleAction,
                loadedStyleAction,
                updateNodeAction,
                updateSettingsParamsAction,
                updateTemporaryStyleAction,
                showNotificationAction
            ] = actions;

            try {
                expect(loadingStyleAction.type).toBe(LOADING_STYLE);
                expect(loadedStyleAction.type).toBe(LOADED_STYLE);
                expect(updateNodeAction.type).toBe(UPDATE_NODE);
                expect(updateSettingsParamsAction.type).toBe(UPDATE_SETTINGS_PARAMS);
                expect(updateTemporaryStyleAction.type).toBe(UPDATE_TEMPORARY_STYLE);
                expect(showNotificationAction.type).toBe(SHOW_NOTIFICATION);
                expect(showNotificationAction.level).toBe('success');
            } catch (e) {
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


    it('test updateStyleCodeEpic with 404 response', (done) => {

        mockAxios.onPut(/\/styles/).reply((config) => {
            expect(config.url).toBe('/geoserver/rest/styles/test_style');
            expect(config.params.raw).toBe(true);
            return [ 404, {}];
        });

        const state = {
            layers: {
                flat: [
                    {
                        id: 'layerId',
                        name: 'layerName',
                        url: '/geoserver/',
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
                    baseUrl: '/geoserver/'
                },
                code: '* { stroke: #ff0000; }'
            }
        };

        const NUMBER_OF_ACTIONS = 4;

        const results = (actions) => {
            const [
                loadingStyleAction,
                errorStyleAction,
                loadedStyleAction,
                showNotificationAction
            ] = actions;

            try {
                expect(loadingStyleAction.type).toBe(LOADING_STYLE);
                expect(errorStyleAction.type).toBe(ERROR_STYLE);
                expect(loadedStyleAction.type).toBe(LOADED_STYLE);
                expect(showNotificationAction.type).toBe(SHOW_NOTIFICATION);
                expect(showNotificationAction.level).toBe('error');
            } catch (e) {
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

    it('test updateTemporaryStyleEpic, temporary style does not exist, response 200', (done) => {

        let TEMP_STYLE_ID;

        mockAxios.onPost(/\/styles/).reply((config) => {
            try {
                expect(config.url).toBe('/geoserver/rest/styles.json');
                TEMP_STYLE_ID = config.params.name;
            } catch (e) {
                done(e);
            }
            return [ 200, {}];
        });

        mockAxios.onPut(/\/styles/).reply((config) => {
            try {
                expect(config.url).toBe(`/geoserver/rest/styles/${TEMP_STYLE_ID}`);
            } catch (e) {
                done(e);
            }
            return [ 200, {}];
        });

        const state = {
            styleeditor: {
                service: {
                    baseUrl: '/geoserver/'
                }
            }
        };

        const NUMBER_OF_ACTIONS = 5;

        const results = (actions) => {
            try {
                const [
                    postLoadingStyleAction,
                    putLoadingStyleAction,
                    loadedStyleAction,
                    updateOptionsByOwnerAction,
                    updateTemporaryStyleAction
                ] = actions;
                expect(postLoadingStyleAction.type).toBe(LOADING_STYLE);
                expect(putLoadingStyleAction.type).toBe(LOADING_STYLE);
                expect(loadedStyleAction.type).toBe(LOADED_STYLE);
                expect(updateOptionsByOwnerAction.type).toBe(UPDATE_OPTIONS_BY_OWNER);
                expect(updateTemporaryStyleAction.type).toBe(UPDATE_TEMPORARY_STYLE);
                expect(updateTemporaryStyleAction.temporaryId).toBe(TEMP_STYLE_ID);
            } catch (e) {
                done(e);
            }
            done();
        };

        testEpic(
            updateTemporaryStyleEpic,
            NUMBER_OF_ACTIONS,
            selectStyleTemplate({}),
            results,
            state);
    });


    it('test updateTemporaryStyleEpic, temporary style exist and change format, response 200', (done) => {

        let TEMP_STYLE_ID;
        const TEMPORARY_ID = 'id';

        mockAxios.onDelete(/\/styles/).reply((config) => {
            try {
                expect(config.url).toBe(`/geoserver/rest/styles/${TEMPORARY_ID}`);
            } catch (e) {
                done(e);
            }
            return [ 200, {}];
        });

        mockAxios.onPost(/\/styles/).reply((config) => {
            try {
                expect(config.url).toBe('/geoserver/rest/styles.json');
                TEMP_STYLE_ID = config.params.name;
            } catch (e) {
                done(e);
            }
            return [ 200, {}];
        });

        mockAxios.onPut(/\/styles/).reply((config) => {
            try {
                expect(config.url).toBe(`/geoserver/rest/styles/${TEMP_STYLE_ID}`);
            } catch (e) {
                done(e);
            }
            return [ 200, {}];
        });

        const state = {
            styleeditor: {
                temporaryId: TEMPORARY_ID,
                format: 'css',
                service: {
                    baseUrl: '/geoserver/'
                }
            }
        };

        const NUMBER_OF_ACTIONS = 5;

        const results = (actions) => {
            try {
                const [
                    postLoadingStyleAction,
                    putLoadingStyleAction,
                    loadedStyleAction,
                    updateOptionsByOwnerAction,
                    updateTemporaryStyleAction
                ] = actions;
                expect(postLoadingStyleAction.type).toBe(LOADING_STYLE);
                expect(putLoadingStyleAction.type).toBe(LOADING_STYLE);
                expect(loadedStyleAction.type).toBe(LOADED_STYLE);
                expect(updateOptionsByOwnerAction.type).toBe(UPDATE_OPTIONS_BY_OWNER);
                expect(updateTemporaryStyleAction.type).toBe(UPDATE_TEMPORARY_STYLE);
                expect(updateTemporaryStyleAction.temporaryId).toBe(TEMP_STYLE_ID);
            } catch (e) {
                done(e);
            }
            done();
        };

        testEpic(
            updateTemporaryStyleEpic,
            NUMBER_OF_ACTIONS,
            selectStyleTemplate({ format: 'sld' }),
            results,
            state);
    });


    it('test updateTemporaryStyleEpic, temporary style exist and same format and version, response 200', (done) => {

        const TEMPORARY_ID = 'id';

        mockAxios.onPut(/\/styles/).reply((config) => {
            try {
                expect(config.url).toBe(`/geoserver/rest/styles/${TEMPORARY_ID}`);
                expect(config.params.raw).toBe(undefined);
            } catch (e) {
                done(e);
            }
            return [ 200, {}];
        });

        const state = {
            styleeditor: {
                temporaryId: TEMPORARY_ID,
                format: 'sld',
                languageVersion: {
                    version: '1.0.0'
                },
                service: {
                    baseUrl: '/geoserver/'
                }
            }
        };

        const NUMBER_OF_ACTIONS = 4;

        const results = (actions) => {
            try {
                const [
                    putLoadingStyleAction,
                    loadedStyleAction,
                    updateOptionsByOwnerAction,
                    updateTemporaryStyleAction
                ] = actions;
                expect(putLoadingStyleAction.type).toBe(LOADING_STYLE);
                expect(loadedStyleAction.type).toBe(LOADED_STYLE);
                expect(updateOptionsByOwnerAction.type).toBe(UPDATE_OPTIONS_BY_OWNER);
                expect(updateTemporaryStyleAction.type).toBe(UPDATE_TEMPORARY_STYLE);
                expect(updateTemporaryStyleAction.temporaryId).toBe(TEMPORARY_ID);
            } catch (e) {
                done(e);
            }
            done();
        };

        testEpic(
            updateTemporaryStyleEpic,
            NUMBER_OF_ACTIONS,
            selectStyleTemplate({ format: 'sld' }),
            results,
            state);
    });

    it('test updateTemporaryStyleEpic, temporary style exist and same format and different version (style body version 1.1.0), response 200', (done) => {

        const TEMPORARY_ID = 'id';

        mockAxios.onPut(/\/styles/).reply((config) => {
            try {
                expect(config.url).toBe(`/geoserver/rest/styles/${TEMPORARY_ID}`);
                expect(config.params.raw).toBe(true);
            } catch (e) {
                done(e);
            }
            return [ 200, {}];
        });

        const state = {
            styleeditor: {
                temporaryId: TEMPORARY_ID,
                format: 'sld',
                languageVersion: {
                    version: '1.0.0'
                },
                service: {
                    baseUrl: '/geoserver/'
                }
            }
        };

        const NUMBER_OF_ACTIONS = 4;

        const results = (actions) => {
            try {
                const [
                    putLoadingStyleAction,
                    loadedStyleAction,
                    updateOptionsByOwnerAction,
                    updateTemporaryStyleAction
                ] = actions;
                expect(putLoadingStyleAction.type).toBe(LOADING_STYLE);
                expect(loadedStyleAction.type).toBe(LOADED_STYLE);
                expect(updateOptionsByOwnerAction.type).toBe(UPDATE_OPTIONS_BY_OWNER);
                expect(updateTemporaryStyleAction.type).toBe(UPDATE_TEMPORARY_STYLE);
                expect(updateTemporaryStyleAction.temporaryId).toBe(TEMPORARY_ID);
            } catch (e) {
                done(e);
            }
            done();
        };

        testEpic(
            updateTemporaryStyleEpic,
            NUMBER_OF_ACTIONS,
            selectStyleTemplate({
                format: 'sld',
                code: '<StyledLayerDescriptor version="1.1.0" ></StyledLayerDescriptor>'
            }),
            results,
            state);
    });


    it('test updateTemporaryStyleEpic, temporary style exist and cahnge format, delete response 404', (done) => {

        const TEMPORARY_ID = 'id';

        mockAxios.onDelete(/\/styles/).reply((config) => {
            try {
                expect(config.url).toBe(`/geoserver/rest/styles/${TEMPORARY_ID}`);
            } catch (e) {
                done(e);
            }
            return [ 404, {}];
        });

        mockAxios.onPut(/\/styles/).reply((config) => {
            try {
                expect(config.url).toBe(`/geoserver/rest/styles/${TEMPORARY_ID}`);
            } catch (e) {
                done(e);
            }
            return [ 200, {}];
        });

        const state = {
            styleeditor: {
                temporaryId: TEMPORARY_ID,
                format: 'css',
                service: {
                    baseUrl: '/geoserver/'
                }
            }
        };

        const NUMBER_OF_ACTIONS = 4;

        const results = (actions) => {
            try {
                const [
                    putLoadingStyleAction,
                    loadedStyleAction,
                    updateOptionsByOwnerAction,
                    updateTemporaryStyleAction
                ] = actions;
                expect(putLoadingStyleAction.type).toBe(LOADING_STYLE);
                expect(loadedStyleAction.type).toBe(LOADED_STYLE);
                expect(updateOptionsByOwnerAction.type).toBe(UPDATE_OPTIONS_BY_OWNER);
                expect(updateTemporaryStyleAction.type).toBe(UPDATE_TEMPORARY_STYLE);
                expect(updateTemporaryStyleAction.temporaryId).toBe(TEMPORARY_ID);
            } catch (e) {
                done(e);
            }
            done();
        };

        testEpic(
            updateTemporaryStyleEpic,
            NUMBER_OF_ACTIONS,
            selectStyleTemplate({ format: 'sld' }),
            results,
            state);
    });


    it('test updateTemporaryStyleEpic fails on create should reset temporary properties', (done) => {

        mockAxios.onPost(/\/styles/).reply(() => [ 404, {}]);

        const state = {};

        const results = (actions) => {
            try {
                const [
                    loadingStyleAction,
                    errorStyleAction,
                    loadedStyleAction,
                    showNotifiactionAction,
                    updateTemporaryStyleAction
                ] = actions;
                expect(loadingStyleAction.type).toBe(LOADING_STYLE);
                expect(errorStyleAction.type).toBe(ERROR_STYLE);
                expect(loadedStyleAction.type).toBe(LOADED_STYLE);
                expect(showNotifiactionAction.type).toBe(SHOW_NOTIFICATION);
                expect(showNotifiactionAction.level).toBe('error');
                expect(updateTemporaryStyleAction.type).toBe(UPDATE_TEMPORARY_STYLE);
                expect(updateTemporaryStyleAction.temporaryId).toBe(null);
            } catch (e) {
                done(e);
            }
            done();
        };

        const NUMBER_OF_ACTIONS = 5;

        testEpic(
            updateTemporaryStyleEpic,
            NUMBER_OF_ACTIONS,
            selectStyleTemplate({ }),
            results,
            state);
    });

    it('toggleStyleEditorEpic: test dynamic style service', (done) => {

        mockAxios.onGet(/\/manifest/).reply(() => {
            return [ 200, { about: { resource: [{ '@name': 'gt-css-2.16' }]} }];
        });

        mockAxios.onGet(/\/version/).reply(() => {
            return [ 200, { about: { resource: [{ '@name': 'GeoServer', version: '2.16' }] } }];
        });

        mockAxios.onGet(/\/fonts/).reply(() => {
            return [ 200, { fonts: ['Arial'] }];
        });

        mockAxios.onGet(/\/layerWorkspace/).reply(() => {
            return [ 200, ''];
        });

        const state = {
            layers: {
                flat: [
                    {
                        id: 'layerId',
                        name: 'layerWorkspace:layerName',
                        url: 'protocol://style-editor/geoserver/'
                    }
                ],
                selected: [
                    'layerId'
                ],
                settings: {
                    options: {
                        opacity: 1
                    }
                }
            }
        };
        const NUMBER_OF_ACTIONS = 2;

        const results = (actions) => {
            try {
                const [
                    loadingStyleAction,
                    initStyleServiceAction
                ] = actions;

                expect(loadingStyleAction.type).toBe(LOADING_STYLE);
                expect(initStyleServiceAction.type).toBe(INIT_STYLE_SERVICE);
                expect(initStyleServiceAction.service).toEqual({
                    baseUrl: 'protocol://style-editor/geoserver/',
                    version: '2.16',
                    formats: [ 'css', 'sld' ],
                    availableUrls: [],
                    fonts: ['Arial'],
                    classificationMethods: {
                        vector: [ 'equalInterval', 'quantile', 'jenks' ],
                        raster: [ 'equalInterval', 'quantile', 'jenks' ]
                    }
                });
            } catch (e) {
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

});
