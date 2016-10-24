/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var {
    taskSuccess,
    taskStarted,
    taskError,
    TASK_STARTED,
    TASK_SUCCESS,
    TASK_ERROR
} = require('../tasks');

describe('Test correctness of the tasks actions', () => {
    it('test taskSuccess action', () => {
        let result = {value: "true"};
        let name = "myName";
        let actionPayload = null;
        const retVal = taskSuccess(result, name, actionPayload);
        expect(retVal).toExist();
        expect(retVal.type).toBe(TASK_SUCCESS);
        expect(retVal.result).toBe(result);
        expect(retVal.name).toBe(name);
        expect(retVal.actionPayload).toBe(null);
    });

    it('test taskError action', () => {
        let error = {value: "true"};
        let name = "myName";
        let actionPayload = null;
        const retVal = taskError(error, name, actionPayload);
        expect(retVal).toExist();
        expect(retVal.type).toBe(TASK_ERROR);
        expect(retVal.error).toBe(error);
        expect(retVal.name).toBe(name);
        expect(retVal.actionPayload).toBe(null);
    });


    it('test taskStarted action', () => {
        let name = "myName";
        const retVal = taskStarted(name);
        expect(retVal).toExist();
        expect(retVal.type).toBe(TASK_STARTED);
        expect(retVal.name).toBe(name);
    });
});
