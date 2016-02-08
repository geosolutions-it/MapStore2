/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const {
    ADD_FILTER_FIELD,
    REMOVE_FILTER_FIELD,
    UPDATE_FILTER_FIELD,
    UPDATE_EXCEPTION_FIELD,
    addFilterField,
    removeFilterField,
    updateFilterField,
    updateExceptionField
} = require('../queryform');

describe('Test correctness of the queryform actions', () => {

    it('addFilterField', () => {
        var retval = addFilterField();

        expect(retval).toExist();
        expect(retval.type).toBe(ADD_FILTER_FIELD);
    });

    it('removeFilterField', () => {
        let rowId = 100;

        let retval = removeFilterField(rowId);

        expect(retval).toExist();
        expect(retval.type).toBe(REMOVE_FILTER_FIELD);
        expect(retval.rowId).toBe(100);
    });

    it('updateFilterField', () => {
        let rowId = 100;
        let fieldName = "fieldName";
        let fieldValue = "fieldValue";

        let retval = updateFilterField(rowId, fieldName, fieldValue);

        expect(retval).toExist();
        expect(retval.type).toBe(UPDATE_FILTER_FIELD);
        expect(retval.rowId).toBe(100);
        expect(retval.fieldName).toBe("fieldName");
        expect(retval.fieldValue).toBe("fieldValue");
    });

    it('updateExceptionField', () => {
        let rowId = 100;
        let message = "message";

        let retval = updateExceptionField(rowId, message);

        expect(retval).toExist();
        expect(retval.type).toBe(UPDATE_EXCEPTION_FIELD);
        expect(retval.rowId).toBe(100);
        expect(retval.exceptionMessage).toBe("message");
    });
});
