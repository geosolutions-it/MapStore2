/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const { testEpic, TEST_TIMEOUT, addTimeoutEpic } = require('./epicTestUtils');

const {
    FIELDS_LOADED, FIELDS_ERROR, CLASSIFICATION_LOADED, CLASSIFICATION_ERROR, loadFields, loadClassification
} = require('../../actions/thematic');

const { updateNode, CHANGE_LAYER_PARAMS } = require('../../actions/layers');

const API = {
    getFieldsService: (layer) => {
        return layer.url + 'fields.json';
    },
    readFields: (data) => data,
    getStyleMetadataService: (layer) => {
        return layer.url + 'classification.json';
    },
    readClassification: (data) => data,
    hasThematicStyle: (layer) => layer.params.SLD,
    removeThematicStyle: () => ({})
};

const { loadFieldsEpic, loadClassificationEpic, removeThematicEpic } = require('../thematic')(API);

const layer = {
    name: 'mylayer',
    url: 'base/web/client/test-resources/thematic/',
    thematic: {}
};

const layerWithThematic = {
    id: 'mylayer',
    name: 'mylayer',
    url: 'base/web/client/test-resources/thematic/',
    thematic: {},
    params: {
        SLD: "mysld"
    }
};

const wrongLayer = {
    name: 'mylayer',
    url: 'base/web/client/test-resources/thematic_wrong',
    thematic: {}
};

const BASE_STATE = { layers: {
    flat: [layerWithThematic]
}, thematic: {} };

describe('thematic epic', () => {
    it('loadFieldsEpic', (done) => {
        const startActions = [loadFields(layer)];
        testEpic(loadFieldsEpic, 1, startActions, actions => {
            expect(actions.length).toBe(1);
            actions.forEach((action) => {
                switch (action.type) {
                case FIELDS_LOADED:
                    expect(action.layer).toExist();
                    expect(action.fields).toExist();
                    expect(action.fields.length).toBe(1);
                    done();
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            });
            done();
        }, BASE_STATE);
    });

    it('loadFieldsEpicWithError', (done) => {
        const startActions = [loadFields(wrongLayer)];
        testEpic(loadFieldsEpic, 1, startActions, actions => {
            expect(actions.length).toBe(1);
            actions.forEach((action) => {
                switch (action.type) {
                case FIELDS_ERROR:
                    expect(action.layer).toExist();
                    expect(action.fields).toNotExist();
                    expect(action.error).toExist();
                    done();
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            });
            done();
        }, BASE_STATE);
    });

    it('loadClassificationEpic', (done) => {
        const startActions = [loadClassification(layer, {})];
        testEpic(loadClassificationEpic, 1, startActions, actions => {
            expect(actions.length).toBe(1);
            actions.forEach((action) => {
                switch (action.type) {
                case CLASSIFICATION_LOADED:
                    expect(action.layer).toExist();
                    expect(action.classification).toExist();
                    expect(action.classification.length).toBe(1);
                    done();
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            });
            done();
        }, BASE_STATE);
    });

    it('loadClassificationEpicWithError', (done) => {
        const startActions = [loadClassification(wrongLayer, {})];
        testEpic(loadClassificationEpic, 1, startActions, actions => {
            expect(actions.length).toBe(1);
            actions.forEach((action) => {
                switch (action.type) {
                case CLASSIFICATION_ERROR:
                    expect(action.layer).toExist();
                    expect(action.classification).toNotExist();
                    expect(action.error).toExist();
                    done();
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            });
            done();
        }, BASE_STATE);
    });

    it('removeStyleEpic', (done) => {
        const startActions = [updateNode('mylayer', 'layer', {thematic: null})];
        testEpic(removeThematicEpic, 1, startActions, actions => {
            expect(actions.length).toBe(1);
            actions.forEach((action) => {
                switch (action.type) {
                case CHANGE_LAYER_PARAMS:
                    expect(action.layer).toExist();
                    expect(action.params).toExist();
                    expect(action.params.SLD).toNotExist();
                    expect(action.params.viewparams).toNotExist();
                    done();
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            });
            done();
        }, BASE_STATE);
    });

    it('removeStyleEpic', (done) => {
        const startActions = [updateNode('mylayer', 'layer', { thematic: null })];
        testEpic(removeThematicEpic, 1, startActions, actions => {
            expect(actions.length).toBe(1);
            actions.forEach((action) => {
                switch (action.type) {
                case CHANGE_LAYER_PARAMS:
                    expect(action.layer).toExist();
                    expect(action.params).toExist();
                    expect(action.params.SLD).toNotExist();
                    expect(action.params.viewparams).toNotExist();
                    done();
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            });
            done();
        }, BASE_STATE);
    });

    it('removeStyleEpic not run', (done) => {
        const startActions = [updateNode('mylayer', 'layer', { })];
        testEpic(addTimeoutEpic(removeThematicEpic), 1, startActions, actions => {
            expect(actions.length).toBe(1);
            actions.forEach((action) => {
                switch (action.type) {
                case TEST_TIMEOUT:
                    done();
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            });
            done();
        }, BASE_STATE);
    });
});
