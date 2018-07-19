/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');

const {
    FIELDS_LOADED,
    FIELDS_ERROR,
    LOAD_FIELDS,
    CLASSIFICATION_LOADED,
    CLASSIFICATION_ERROR,
    LOAD_CLASSIFICATION,
    CHANGE_CONFIGURATION,
    CHANGE_DIRTY,
    CHANGE_INPUT_VALIDITY,
    fieldsLoaded,
    loadFields,
    fieldsError,
    loadClassification,
    classificationLoaded,
    classificationError,
    changeConfiguration,
    setDirty,
    cancelDirty,
    setInvalidInput,
    resetInvalidInput
} = require('../thematic');

const layer = {
    name: 'mylayer',
    thematic: {}
};

const fields = [{
    name: 'myfield'
}];

const classification = [{
    min: 1,
    max: 10,
    color: '#ff0000'
}];

const error = {
    message: 'myerror'
};

describe('Test correctness of the themtic actions', () => {
    it('loadFields', () => {
        const retval = loadFields(layer);
        expect(retval).toExist();
        expect(retval.type).toBe(LOAD_FIELDS);
        expect(retval.layer).toExist();
        expect(retval.layer.name).toBe('mylayer');
    });

    it('fieldsLoaded', () => {
        const retval = fieldsLoaded(layer, fields);
        expect(retval).toExist();
        expect(retval.type).toBe(FIELDS_LOADED);
        expect(retval.layer).toExist();
        expect(retval.layer.name).toBe('mylayer');
        expect(retval.fields).toExist();
        expect(retval.fields.length).toBe(1);
        expect(retval.fields[0].name).toBe('myfield');
    });

    it('fieldsError', () => {
        const retval = fieldsError(layer, error);
        expect(retval).toExist();
        expect(retval.type).toBe(FIELDS_ERROR);
        expect(retval.layer).toExist();
        expect(retval.layer.name).toBe('mylayer');
        expect(retval.error).toExist();
        expect(retval.error.message).toBe('myerror');
    });

    it('loadClassification', () => {
        const retval = loadClassification(layer, {
            myparam: 'value1'
        });
        expect(retval).toExist();
        expect(retval.type).toBe(LOAD_CLASSIFICATION);
        expect(retval.layer).toExist();
        expect(retval.layer.name).toBe('mylayer');
        expect(retval.params).toExist();
        expect(retval.params.myparam).toBe('value1');
    });

    it('classificationLoaded', () => {
        const retval = classificationLoaded(layer, classification);
        expect(retval).toExist();
        expect(retval.type).toBe(CLASSIFICATION_LOADED);
        expect(retval.layer).toExist();
        expect(retval.layer.name).toBe('mylayer');
        expect(retval.classification).toExist();
        expect(retval.classification.length).toBe(1);
        expect(retval.classification[0].color).toBe('#ff0000');
        expect(retval.classification[0].min).toBe(1);
        expect(retval.classification[0].max).toBe(10);
    });

    it('classificationError', () => {
        const retval = classificationError(layer, error);
        expect(retval).toExist();
        expect(retval.type).toBe(CLASSIFICATION_ERROR);
        expect(retval.layer).toExist();
        expect(retval.layer.name).toBe('mylayer');
        expect(retval.error).toExist();
        expect(retval.error.message).toBe('myerror');
    });

    it('changeConfiguration', () => {
        const retval = changeConfiguration(layer, true, "myconfig", error);
        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_CONFIGURATION);
        expect(retval.layer).toExist();
        expect(retval.layer.name).toBe('mylayer');
        expect(retval.editEnabled).toBe(true);
        expect(retval.current).toBe('myconfig');
        expect(retval.error).toExist();
        expect(retval.error.message).toBe('myerror');
    });

    it('setDirty', () => {
        const retval = setDirty();
        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_DIRTY);
        expect(retval.dirty).toBe(true);
    });

    it('cancelDirty', () => {
        const retval = cancelDirty();
        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_DIRTY);
        expect(retval.dirty).toBe(false);
    });

    it('setInvalidInput', () => {
        const retval = setInvalidInput('intervals', 'error', 'params');
        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_INPUT_VALIDITY);
        expect(retval.valid).toBe(false);
        expect(retval.message).toBe('error');
        expect(retval.params).toBe('params');
    });

    it('resetInvalidInput', () => {
        const retval = resetInvalidInput('intervals');
        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_INPUT_VALIDITY);
        expect(retval.valid).toBe(true);
        expect(retval.message).toNotExist();
        expect(retval.params).toNotExist();
    });
});
