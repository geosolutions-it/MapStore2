/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const { testEpic } = require('./epicTestUtils');

const {
    FIELDS_LOADED, FIELDS_ERROR, CLASSIFICATION_LOADED, CLASSIFICATION_ERROR, loadFields, loadClassification
} = require('../../actions/thematic');

const API = {
    getFieldsService: (layer) => {
        return layer.url + 'fields.json';
    },
    readFields: (data) => data,
    getStyleMetadataService: (layer) => {
        return layer.url + 'classification.json';
    },
    readClassification: (data) => data
};

const { loadFieldsEpic, loadClassificationEpic } = require('../thematic')(API);

const layer = {
    name: 'mylayer',
    url: 'base/web/client/test-resources/thematic/',
    thematic: {}
};

const wrongLayer = {
    name: 'mylayer',
    url: 'base/web/client/test-resources/thematic_wrong',
    thematic: {}
};

const BASE_STATE = { thematic: {} };

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
});
