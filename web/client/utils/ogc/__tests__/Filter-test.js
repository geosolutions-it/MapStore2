/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const {Filter, marshaller, unmarshaller} = require('../Filter');
/**
 * Validates CSW tag trying to unmarshal that
 */
const validate = function(body, localPart) {
    const doc = unmarshaller.unmarshalDocument(body);
    expect(doc).toBeTruthy();
    expect(doc.name && doc.name.localPart).toBe(localPart);
    return doc;
};
describe('Test Filter generation/parsing', () => {

    it('propertyIsLike', () => {
        expect(Filter.propertyIsLike).toBeTruthy();
        let jsonBody = Filter.propertyIsLike("propName", "%propValueLike%");
        expect(jsonBody).toBeTruthy();
        const doc = marshaller.marshalDocument( { name: "ogc:PropertyIsLike", value: jsonBody});
        expect(doc).toBeTruthy();
        let outJson = validate(doc, "PropertyIsLike");
        expect(outJson).toBeTruthy();
    });

    it('BBox', () => {
        expect(Filter.propertyIsLike).toBeTruthy();
        let jsonBody = Filter.bbox(0, 0, 1, 1, "EPSG:4326");
        expect(jsonBody).toBeTruthy();
        const doc = marshaller.marshalDocument( { name: "ogc:BBOX", value: jsonBody});
        expect(doc).toBeTruthy();
        validate(doc, "BBOX");
    });
    it('and', () => {
        expect(Filter.propertyIsLike).toBeTruthy();
        let json1 = Filter.propertyIsLike("propName", "%propValueLike%");
        expect(json1).toBeTruthy();
        let json2 = Filter.bbox(0, 0, 1, 1, "EPSG:4326");
        let and = Filter.and([json1, json2]);
        const doc = marshaller.marshalDocument( and );
        expect(doc).toBeTruthy();
        let outJson = validate(doc, "And");
        expect(outJson).toBeTruthy();
    });
    it('or', () => {
        expect(Filter.propertyIsLike).toBeTruthy();
        let json1 = Filter.propertyIsLike("propName", "%propValueLike%");
        expect(json1).toBeTruthy();
        let json2 = Filter.bbox(0, 0, 1, 1, "EPSG:4326");
        let or = Filter.or([json1, json2]);
        const doc = marshaller.marshalDocument( or );
        expect(doc).toBeTruthy();
        let outJson = validate(doc, "Or");
        expect(outJson).toBeTruthy();
    });
    it('Filter', () => {
        expect(Filter.propertyIsLike).toBeTruthy();
        let json1 = Filter.propertyIsLike("propName", "%propValueLike%");
        expect(json1).toBeTruthy();
        let json2 = Filter.bbox(0, 0, 1, 1, "EPSG:4326");
        let or = Filter.or([json1, json2]);
        let filter = Filter.filter(or);
        const doc = marshaller.marshalDocument( filter );
        expect(doc).toBeTruthy();
        let outJson = validate(doc, "Filter");
        expect(outJson).toBeTruthy();
    });

});
