/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const {
    loadFields,
    fieldsLoaded,
    fieldsError,
    loadClassification,
    classificationLoaded,
    classificationError,
    changeConfiguration,
    setDirty,
    cancelDirty,
    setInvalidInput,
    resetInvalidInput
} = require('../../actions/thematic');
const thematic = require('../thematic');

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

describe('Test the thematic reducer', () => {
    it('loadFields action', () => {
        const state = thematic({}, loadFields(layer));
        expect(state.loadingFields).toBe(true);
        expect(state.fields).toNotExist();
        expect(state.errorFields).toNotExist();
    });

    it('fieldsLoaded action', () => {
        const state = thematic({}, fieldsLoaded(layer, fields));
        expect(state.loadingFields).toBe(false);
        expect(state.fields).toExist();
        expect(state.fields.length).toBe(1);
        expect(state.errorFields).toNotExist();
    });

    it('fieldsError action', () => {
        const state = thematic({}, fieldsError(layer, error));
        expect(state.loadingFields).toBe(false);
        expect(state.fields).toNotExist();
        expect(state.errorFields).toExist();
    });

    it('loadClassification action', () => {
        const state = thematic({}, loadClassification(layer, {}));
        expect(state.loadingClassification).toBe(true);
        expect(state.classification).toNotExist();
        expect(state.errorClassification).toNotExist();
    });

    it('classificationLoaded action', () => {
        const state = thematic({}, classificationLoaded(layer, classification));
        expect(state.loadingClassification).toBe(false);
        expect(state.classification).toExist();
        expect(state.classification.length).toBe(1);
        expect(state.errorClassification).toNotExist();
    });

    it('classificationError action', () => {
        const state = thematic({}, classificationError(layer, error));
        expect(state.loadingClassification).toBe(false);
        expect(state.classification).toNotExist();
        expect(state.errorClassification).toExist();
    });

    it('changeConfiguration action', () => {
        const state = thematic({}, changeConfiguration(layer, true, "{}"));
        expect(state.adminCfg).toExist();
        expect(state.adminCfg.open).toBe(true);
        expect(state.adminCfg.current).toBe("{}");
        expect(state.adminCfg.error).toNotExist();
    });

    it('changeConfiguration action with error', () => {
        const state = thematic({}, changeConfiguration(layer, true, "{}", error));
        expect(state.adminCfg).toExist();
        expect(state.adminCfg.open).toBe(true);
        expect(state.adminCfg.current).toBe("{}");
        expect(state.adminCfg.error).toExist();
    });

    it('setDirty action', () => {
        const state = thematic({}, setDirty());
        expect(state.dirty).toBe(true);
    });

    it('cancelDirty action', () => {
        const state = thematic({}, cancelDirty());
        expect(state.dirty).toBe(false);
    });

    it('setInvalidInput action', () => {
        const state = thematic({}, setInvalidInput('intervals', 'myerror', 'params'));
        expect(state.invalidInputs).toExist();
        expect(state.invalidInputs.intervals).toExist();
        expect(state.invalidInputs.intervals.message).toBe('myerror');
        expect(state.invalidInputs.intervals.params).toBe('params');
    });

    it('resetInvalidInput action', () => {
        const state = thematic({
            invalidInputs: {
                intervals: {}
            }
        }, resetInvalidInput('intervals'));
        expect(state.invalidInputs).toExist();
        expect(state.invalidInputs.intervals).toNotExist();
    });
});
