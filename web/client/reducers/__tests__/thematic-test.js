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
        expect(state.fields).toBeFalsy();
        expect(state.errorFields).toBeFalsy();
    });

    it('fieldsLoaded action', () => {
        const state = thematic({}, fieldsLoaded(layer, fields));
        expect(state.loadingFields).toBe(false);
        expect(state.fields).toBeTruthy();
        expect(state.fields.length).toBe(1);
        expect(state.errorFields).toBeFalsy();
    });

    it('fieldsError action', () => {
        const state = thematic({}, fieldsError(layer, error));
        expect(state.loadingFields).toBe(false);
        expect(state.fields).toBeFalsy();
        expect(state.errorFields).toBeTruthy();
    });

    it('loadClassification action', () => {
        const state = thematic({}, loadClassification(layer, {}));
        expect(state.loadingClassification).toBe(true);
        expect(state.classification).toBeFalsy();
        expect(state.errorClassification).toBeFalsy();
    });

    it('classificationLoaded action', () => {
        const state = thematic({}, classificationLoaded(layer, classification));
        expect(state.loadingClassification).toBe(false);
        expect(state.classification).toBeTruthy();
        expect(state.classification.length).toBe(1);
        expect(state.errorClassification).toBeFalsy();
    });

    it('classificationError action', () => {
        const state = thematic({}, classificationError(layer, error));
        expect(state.loadingClassification).toBe(false);
        expect(state.classification).toBeFalsy();
        expect(state.errorClassification).toBeTruthy();
    });

    it('changeConfiguration action', () => {
        const state = thematic({}, changeConfiguration(layer, true, "{}"));
        expect(state.adminCfg).toBeTruthy();
        expect(state.adminCfg.open).toBe(true);
        expect(state.adminCfg.current).toBe("{}");
        expect(state.adminCfg.error).toBeFalsy();
    });

    it('changeConfiguration action with error', () => {
        const state = thematic({}, changeConfiguration(layer, true, "{}", error));
        expect(state.adminCfg).toBeTruthy();
        expect(state.adminCfg.open).toBe(true);
        expect(state.adminCfg.current).toBe("{}");
        expect(state.adminCfg.error).toBeTruthy();
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
        expect(state.invalidInputs).toBeTruthy();
        expect(state.invalidInputs.intervals).toBeTruthy();
        expect(state.invalidInputs.intervals.message).toBe('myerror');
        expect(state.invalidInputs.intervals.params).toBe('params');
    });

    it('resetInvalidInput action', () => {
        const state = thematic({
            invalidInputs: {
                intervals: {}
            }
        }, resetInvalidInput('intervals'));
        expect(state.invalidInputs).toBeTruthy();
        expect(state.invalidInputs.intervals).toBeFalsy();
    });
});
