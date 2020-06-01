/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
// Disable ESLint because some of the names to include are not in camel case
const expect = require('expect');
const {ogcComparisonOperators, ogcLogicalOperators, ogcSpatialOperators, logical, spatial, comparison, literal, propertyName,
    lower, upper} = require('../operators');

describe('OGC Operators', () => {
    it('comparison object', () => {
        expect(ogcComparisonOperators["="]("ogc", "TEST")).toBe("<ogc:PropertyIsEqualTo>TEST</ogc:PropertyIsEqualTo>");
        expect(ogcComparisonOperators[">"]("ogc", "TEST")).toBe("<ogc:PropertyIsGreaterThan>TEST</ogc:PropertyIsGreaterThan>");
        expect(ogcComparisonOperators["<"]("ogc", "TEST")).toBe("<ogc:PropertyIsLessThan>TEST</ogc:PropertyIsLessThan>");
        expect(ogcComparisonOperators[">="]("ogc", "TEST")).toBe("<ogc:PropertyIsGreaterThanOrEqualTo>TEST</ogc:PropertyIsGreaterThanOrEqualTo>");
        expect(ogcComparisonOperators["<="]("ogc", "TEST")).toBe("<ogc:PropertyIsLessThanOrEqualTo>TEST</ogc:PropertyIsLessThanOrEqualTo>");
        expect(ogcComparisonOperators["<>"]("ogc", "TEST")).toBe("<ogc:PropertyIsNotEqualTo>TEST</ogc:PropertyIsNotEqualTo>");
        expect(ogcComparisonOperators["><"]("ogc", "TEST")).toBe("<ogc:PropertyIsBetween>TEST</ogc:PropertyIsBetween>");
        expect(ogcComparisonOperators.like("ogc", "TEST")).toBe('<ogc:PropertyIsLike matchCase="true" wildCard="*" singleChar="." escapeChar="!">TEST</ogc:PropertyIsLike>');
        expect(ogcComparisonOperators.ilike("ogc", "TEST")).toBe('<ogc:PropertyIsLike matchCase="false" wildCard="*" singleChar="." escapeChar="!">TEST</ogc:PropertyIsLike>');
        expect(ogcComparisonOperators.isNull("ogc", "TEST")).toBe('<ogc:PropertyIsNull>TEST</ogc:PropertyIsNull>');
    });
    it('ogcLogicalOperators object', () => {
        const AND = "AND";
        const OR = "OR";
        const NOT = "NOT";
        const NOR = "NOR";
        expect(ogcLogicalOperators[AND]("ogc", "TEST")).toBe("<ogc:And>TEST</ogc:And>");
        expect(ogcLogicalOperators[OR]("ogc", "TEST")).toBe("<ogc:Or>TEST</ogc:Or>");
        expect(ogcLogicalOperators[NOT]("ogc", "TEST")).toBe("<ogc:Not>TEST</ogc:Not>");
        expect(ogcLogicalOperators[NOR]("ogc", "TEST")).toBe("<ogc:Not><ogc:Or>TEST</ogc:Or></ogc:Not>");
    });
    it('ogcSpatialOperators object', () => {
        const INTERSECTS = "INTERSECTS";
        const BBOX = "BBOX";
        const CONTAINS = "CONTAINS";
        const DWITHIN = "DWITHIN";
        const WITHIN = "WITHIN";
        expect(ogcSpatialOperators[INTERSECTS]("ogc", "TEST")).toBe("<ogc:Intersects>TEST</ogc:Intersects>");
        expect(ogcSpatialOperators[BBOX]("ogc", "TEST")).toBe("<ogc:BBOX>TEST</ogc:BBOX>");
        expect(ogcSpatialOperators[CONTAINS]("ogc", "TEST")).toBe("<ogc:Contains>TEST</ogc:Contains>");
        expect(ogcSpatialOperators[DWITHIN]("ogc", "TEST")).toBe("<ogc:DWithin>TEST</ogc:DWithin>");
        expect(ogcSpatialOperators[WITHIN]("ogc", "TEST")).toBe("<ogc:Within>TEST</ogc:Within>");
    });
    it('logical functions with array', () => {
        expect(logical.and("ogc",
            [ogcComparisonOperators["="]("ogc", "TEST"),
                ogcComparisonOperators[">"]("ogc", "TEST")
            ])).toBe('<ogc:And><ogc:PropertyIsEqualTo>TEST</ogc:PropertyIsEqualTo><ogc:PropertyIsGreaterThan>TEST</ogc:PropertyIsGreaterThan></ogc:And>');
        expect(logical.or("ogc",
            [ogcComparisonOperators["="]("ogc", "TEST"),
                ogcComparisonOperators[">"]("ogc", "TEST")
            ])).toBe('<ogc:Or><ogc:PropertyIsEqualTo>TEST</ogc:PropertyIsEqualTo><ogc:PropertyIsGreaterThan>TEST</ogc:PropertyIsGreaterThan></ogc:Or>');
        expect(logical.not("ogc",
            [ogcComparisonOperators["="]("ogc", "TEST")]
        )).toBe('<ogc:Not><ogc:PropertyIsEqualTo>TEST</ogc:PropertyIsEqualTo></ogc:Not>');

    });
    it('logical functions with arg list', () => {
        expect(logical.and("ogc",
            ogcComparisonOperators["="]("ogc", "TEST"),
            ogcComparisonOperators[">"]("ogc", "TEST")
        )).toBe('<ogc:And><ogc:PropertyIsEqualTo>TEST</ogc:PropertyIsEqualTo><ogc:PropertyIsGreaterThan>TEST</ogc:PropertyIsGreaterThan></ogc:And>');
        expect(logical.or("ogc",
            ogcComparisonOperators["="]("ogc", "TEST"),
            ogcComparisonOperators[">"]("ogc", "TEST")
        )).toBe('<ogc:Or><ogc:PropertyIsEqualTo>TEST</ogc:PropertyIsEqualTo><ogc:PropertyIsGreaterThan>TEST</ogc:PropertyIsGreaterThan></ogc:Or>');
        expect(logical.not("ogc",
            ogcComparisonOperators["="]("ogc", "TEST")
        )).toBe('<ogc:Not><ogc:PropertyIsEqualTo>TEST</ogc:PropertyIsEqualTo></ogc:Not>');
    });
    it('spatial functions', () => {
        expect(spatial.intersects("ogc", propertyName("ogc", "GEOMETRY"), "TEST")).toBe("<ogc:Intersects><ogc:PropertyName>GEOMETRY</ogc:PropertyName>TEST</ogc:Intersects>");
        expect(spatial.bbox("ogc", propertyName("ogc", "GEOMETRY"), "TEST")).toBe("<ogc:BBOX><ogc:PropertyName>GEOMETRY</ogc:PropertyName>TEST</ogc:BBOX>");
        expect(spatial.contains("ogc", propertyName("ogc", "GEOMETRY"), "TEST")).toBe("<ogc:Contains><ogc:PropertyName>GEOMETRY</ogc:PropertyName>TEST</ogc:Contains>");
        expect(spatial.within("ogc", propertyName("ogc", "GEOMETRY"), "TEST")).toBe("<ogc:Within><ogc:PropertyName>GEOMETRY</ogc:PropertyName>TEST</ogc:Within>");
        expect(spatial.dwithin("ogc", propertyName("ogc", "GEOMETRY"), "TEST")).toBe("<ogc:DWithin><ogc:PropertyName>GEOMETRY</ogc:PropertyName>TEST</ogc:DWithin>");
    });
    it('comparison functions', () => {
        expect(comparison.equal("ogc", propertyName("ogc", "PROPERTY"), literal("ogc", "VALUE")))
            .toBe("<ogc:PropertyIsEqualTo><ogc:PropertyName>PROPERTY</ogc:PropertyName><ogc:Literal>VALUE</ogc:Literal></ogc:PropertyIsEqualTo>");
        expect(comparison.greater("ogc", propertyName("ogc", "PROPERTY"), literal("ogc", "VALUE")))
            .toBe("<ogc:PropertyIsGreaterThan><ogc:PropertyName>PROPERTY</ogc:PropertyName><ogc:Literal>VALUE</ogc:Literal></ogc:PropertyIsGreaterThan>");
        expect(comparison.less("ogc", propertyName("ogc", "PROPERTY"), literal("ogc", "VALUE")))
            .toBe("<ogc:PropertyIsLessThan><ogc:PropertyName>PROPERTY</ogc:PropertyName><ogc:Literal>VALUE</ogc:Literal></ogc:PropertyIsLessThan>");
        expect(comparison.greaterOrEqual("ogc", propertyName("ogc", "PROPERTY"), literal("ogc", "VALUE")))
            .toBe("<ogc:PropertyIsGreaterThanOrEqualTo><ogc:PropertyName>PROPERTY</ogc:PropertyName><ogc:Literal>VALUE</ogc:Literal></ogc:PropertyIsGreaterThanOrEqualTo>");
        expect(comparison.lessOrEqual("ogc", propertyName("ogc", "PROPERTY"), literal("ogc", "VALUE")))
            .toBe("<ogc:PropertyIsLessThanOrEqualTo><ogc:PropertyName>PROPERTY</ogc:PropertyName><ogc:Literal>VALUE</ogc:Literal></ogc:PropertyIsLessThanOrEqualTo>");
        expect(comparison.notEqual("ogc", propertyName("ogc", "PROPERTY"), literal("ogc", "VALUE")))
            .toBe("<ogc:PropertyIsNotEqualTo><ogc:PropertyName>PROPERTY</ogc:PropertyName><ogc:Literal>VALUE</ogc:Literal></ogc:PropertyIsNotEqualTo>");
        expect(comparison.between("ogc", propertyName("ogc", "PROPERTY"), lower("ogc", literal("ogc", "VALUE1")), upper("ogc", literal("ogc", "VALUE2"))))
            .toBe("<ogc:PropertyIsBetween><ogc:PropertyName>PROPERTY</ogc:PropertyName><ogc:LowerBoundary><ogc:Literal>VALUE1</ogc:Literal></ogc:LowerBoundary><ogc:UpperBoundary><ogc:Literal>VALUE2</ogc:Literal></ogc:UpperBoundary></ogc:PropertyIsBetween>");
        expect(comparison.like("ogc", propertyName("ogc", "PROPERTY"), literal("ogc", "VALUE")))
            .toBe('<ogc:PropertyIsLike matchCase="true" wildCard="*" singleChar="." escapeChar="!"><ogc:PropertyName>PROPERTY</ogc:PropertyName><ogc:Literal>VALUE</ogc:Literal></ogc:PropertyIsLike>');
        expect(comparison.ilike("ogc", propertyName("ogc", "PROPERTY"), literal("ogc", "VALUE")))
            .toBe('<ogc:PropertyIsLike matchCase="false" wildCard="*" singleChar="." escapeChar="!"><ogc:PropertyName>PROPERTY</ogc:PropertyName><ogc:Literal>VALUE</ogc:Literal></ogc:PropertyIsLike>');
        expect(comparison.isNull("ogc", propertyName("ogc", "PROPERTY")))
            .toBe("<ogc:PropertyIsNull><ogc:PropertyName>PROPERTY</ogc:PropertyName></ogc:PropertyIsNull>");
    });
});
