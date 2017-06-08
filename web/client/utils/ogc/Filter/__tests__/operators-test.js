/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
 // Disable ESLint because some of the names to include are not in camel case
const expect = require('expect');
const {ogcComparisonOperators, ogcLogicalOperators, ogcSpatialOperators} = require('../operators');

describe('OGC Operators', () => {
    it('ogcComparisonOperators', () => {
        expect(ogcComparisonOperators["="]("ogc", "TEST")).toBe("<ogc:PropertyIsEqualTo>TEST</ogc:PropertyIsEqualTo>");
        expect(ogcComparisonOperators[">"]("ogc", "TEST")).toBe("<ogc:PropertyIsGreaterThan>TEST</ogc:PropertyIsGreaterThan>");
        expect(ogcComparisonOperators["<"]("ogc", "TEST")).toBe("<ogc:PropertyIsLessThan>TEST</ogc:PropertyIsLessThan>");
        expect(ogcComparisonOperators[">="]("ogc", "TEST")).toBe("<ogc:PropertyIsGreaterThanOrEqualTo>TEST</ogc:PropertyIsGreaterThanOrEqualTo>");
        expect(ogcComparisonOperators["<="]("ogc", "TEST")).toBe("<ogc:PropertyIsLessThanOrEqualTo>TEST</ogc:PropertyIsLessThanOrEqualTo>");
        expect(ogcComparisonOperators["<>"]("ogc", "TEST")).toBe("<ogc:PropertyIsNotEqualTo>TEST</ogc:PropertyIsNotEqualTo>");
        expect(ogcComparisonOperators.like("ogc", "TEST")).toBe('<ogc:PropertyIsLike matchCase="true" wildCard="*" singleChar="." escapeChar="!">TEST</ogc:PropertyIsLike>');
        expect(ogcComparisonOperators.ilike("ogc", "TEST")).toBe('<ogc:PropertyIsLike matchCase="false" wildCard="*" singleChar="." escapeChar="!">TEST</ogc:PropertyIsLike>');
        expect(ogcComparisonOperators.isNull("ogc", "TEST")).toBe('<ogc:PropertyIsNull>TEST</ogc:PropertyIsNull>');
    });
    it('ogcLogicalOperators', () => {
        const AND = "AND";
        const OR = "OR";
        const AND_NOT = "AND NOT";
        expect(ogcLogicalOperators[AND]("ogc", "TEST")).toBe("<ogc:And>TEST</ogc:And>");
        expect(ogcLogicalOperators[OR]("ogc", "TEST")).toBe("<ogc:Or>TEST</ogc:Or>");
        expect(ogcLogicalOperators[AND_NOT]("ogc", "TEST")).toBe("<ogc:Not>TEST</ogc:Not>");
    });
    it('ogcSpatialOperators', () => {
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
});
