/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const {CSW, marshaller, unmarshaller} = require('../CSW');
const {Filter} = require('../Filter');
/**
 * Validates CSW tag trying to unmarshal that
 */
const validate = function(body, localPart) {
    const doc = unmarshaller.unmarshalDocument(body);
    expect(doc).toBeTruthy();
    expect(doc.name && doc.name.localPart).toBe(localPart);
    return doc;
};
describe('Test CSW request/response generation/parsing', () => {

    it('getRecords', () => {
        expect(CSW.getRecords).toBeTruthy();
        let jsonBody = CSW.getRecords(0, 1);
        expect(jsonBody).toBeTruthy();
        const doc = marshaller.marshalDocument( { name: "csw:GetRecords", value: jsonBody});
        expect(doc).toBeTruthy();
        validate(doc, "GetRecords");
    });

    it('getRecords with Filters', () => {
        expect(CSW.getRecords).toBeTruthy();

        // create a filter
        let json1 = Filter.propertyIsLike("propName", "%propValueLike%");
        expect(json1).toBeTruthy();
        let json2 = Filter.bbox(0, 0, 1, 1, "EPSG:4326");
        let or = Filter.or([json1, json2]);
        let filter = Filter.filter(or);

        // create a getRecords with the filter
        let jsonBody = CSW.getRecords(0, 1, filter);
        expect(jsonBody).toBeTruthy();

        // marshal and unmarshal
        const doc = marshaller.marshalDocument( { name: "csw:GetRecords", value: jsonBody});
        expect(doc).toBeTruthy();
        let jsonOut = validate(doc, "GetRecords").value;

        // check if the filter exists in the unmarshalled object
        expect(jsonOut).toBeTruthy();
        expect(jsonOut.abstractQuery).toBeTruthy();
        expect(jsonOut.abstractQuery.value.constraint).toBeTruthy();
        expect(jsonOut.abstractQuery.value.constraint.filter).toBeTruthy();
    });
    it('getRecordById', () => {
        expect(CSW.getRecordById).toBeTruthy();
        let jsonBody = CSW.getRecordById("TEST_ID");
        expect(jsonBody).toBeTruthy();
        const doc = marshaller.marshalDocument( { name: "csw:GetRecordById", value: jsonBody});
        expect(doc).toBeTruthy();
        validate(doc, "GetRecordById");
    });
});
