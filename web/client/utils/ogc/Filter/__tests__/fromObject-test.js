import expect from 'expect';
import {read} from '../CQL/parser';
import filterBuilder from '../FilterBuilder';
import fromObject from '../fromObject';

const COMPARISON_TESTS = [
    // numeric
    {
        cql: "PROP = 1",
        expected: "<ogc:PropertyIsEqualTo><ogc:PropertyName>PROP</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo>"
    },
    {
        cql: "PROP <> 1",
        expected: "<ogc:PropertyIsNotEqualTo><ogc:PropertyName>PROP</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo>"
    },
    {
        cql: "PROP < 1",
        expected: "<ogc:PropertyIsLessThan><ogc:PropertyName>PROP</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsLessThan>"
    },
    {
        cql: "PROP <= 1",
        expected: "<ogc:PropertyIsLessThanOrEqualTo><ogc:PropertyName>PROP</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsLessThanOrEqualTo>"
    },
    {
        cql: "PROP > 1",
        expected: "<ogc:PropertyIsGreaterThan><ogc:PropertyName>PROP</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsGreaterThan>"
    },
    {
        cql: "PROP >= 1",
        expected: "<ogc:PropertyIsGreaterThanOrEqualTo><ogc:PropertyName>PROP</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsGreaterThanOrEqualTo>"
    },
    // string
    {
        cql: "PROP = 'a'",
        expected: "<ogc:PropertyIsEqualTo><ogc:PropertyName>PROP</ogc:PropertyName><ogc:Literal>a</ogc:Literal></ogc:PropertyIsEqualTo>"
    },
    {
        cql: "PROP like 'a'",
        expected: '<ogc:PropertyIsLike matchCase="true" wildCard="*" singleChar="." escapeChar="!"><ogc:PropertyName>PROP</ogc:PropertyName><ogc:Literal>a</ogc:Literal></ogc:PropertyIsLike>'
    },
    {
        cql: "PROP between 1 and 3",
        expected: '<ogc:PropertyIsBetween><ogc:PropertyName>PROP</ogc:PropertyName><ogc:LowerBoundary><ogc:Literal>1</ogc:Literal></ogc:LowerBoundary><ogc:UpperBoundary><ogc:Literal>3</ogc:Literal></ogc:UpperBoundary></ogc:PropertyIsBetween>'
    }
];

const LOGICAL = [
    // and
    {
        cql: "PROP1 like 'a' and PROP2 < 1",
        expected: '<ogc:And><ogc:PropertyIsLike matchCase="true" wildCard="*" singleChar="." escapeChar="!"><ogc:PropertyName>PROP1</ogc:PropertyName><ogc:Literal>a</ogc:Literal></ogc:PropertyIsLike><ogc:PropertyIsLessThan><ogc:PropertyName>PROP2</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsLessThan></ogc:And>'
    },
    // or
    {
        cql: "PROP1 like 'a' or PROP2 < 1",
        expected: '<ogc:Or>'
            + '<ogc:PropertyIsLike matchCase="true" wildCard="*" singleChar="." escapeChar="!">'
                + '<ogc:PropertyName>PROP1</ogc:PropertyName>'
                + '<ogc:Literal>a</ogc:Literal>'
            + '</ogc:PropertyIsLike>'
            + '<ogc:PropertyIsLessThan>'
                + '<ogc:PropertyName>PROP2</ogc:PropertyName>'
                + '<ogc:Literal>1</ogc:Literal>'
            + '</ogc:PropertyIsLessThan>'
        + '</ogc:Or>'
    },
    // not
    {
        cql: "NOT X < 12",
        expected: '<ogc:Not><ogc:PropertyIsLessThan><ogc:PropertyName>X</ogc:PropertyName><ogc:Literal>12</ogc:Literal></ogc:PropertyIsLessThan></ogc:Not>'
    },
    // complex filter
    {
        cql: "(PROP1 like 'a') and PROP2 < 1 and (PROP1 <> 'a' or not PROP2 > 1)",
        expected:
            '<ogc:And>'
                + '<ogc:And>'
                    + '<ogc:PropertyIsLike matchCase="true" wildCard="*" singleChar="." escapeChar="!">'
                        + '<ogc:PropertyName>PROP1</ogc:PropertyName>'
                        + '<ogc:Literal>a</ogc:Literal>'
                    + '</ogc:PropertyIsLike>'
                    + '<ogc:PropertyIsLessThan>'
                        + '<ogc:PropertyName>PROP2</ogc:PropertyName>'
                        + '<ogc:Literal>1</ogc:Literal>'
                    + '</ogc:PropertyIsLessThan>'
                + '</ogc:And>'
                + '<ogc:Or>'
                    + '<ogc:PropertyIsNotEqualTo>'
                        + '<ogc:PropertyName>PROP1</ogc:PropertyName>'
                        + '<ogc:Literal>a</ogc:Literal>'
                    + '</ogc:PropertyIsNotEqualTo>'
                    + '<ogc:Not>'
                        + '<ogc:PropertyIsGreaterThan>'
                            + '<ogc:PropertyName>PROP2</ogc:PropertyName>'
                            + '<ogc:Literal>1</ogc:Literal>'
                        + '</ogc:PropertyIsGreaterThan>'
                    + '</ogc:Not>'
                + '</ogc:Or>'
            + '</ogc:And>'
    }
];

// NOTE: INCLUDE and PROP = VALUE is not supported by the parser
const CQL_SPECIFIC = [{
    cql: "INCLUDE",
    expected: ""
}];

const FUNCTIONS = [
    // empty
    {
        cql: "func1() = false",
        expected: '<ogc:PropertyIsEqualTo>'
            + '<ogc:Function name="func1">'
            + '</ogc:Function>'
            + '<ogc:Literal>false</ogc:Literal>'
        + '</ogc:PropertyIsEqualTo>'
    },
    // simple
    {
        cql: "func1('arg1') = false",
        expected: '<ogc:PropertyIsEqualTo>'
            + '<ogc:Function name="func1">'
                + '<ogc:Literal>arg1</ogc:Literal>'
            + '</ogc:Function>'
            + '<ogc:Literal>false</ogc:Literal>'
        + '</ogc:PropertyIsEqualTo>'
    },
    // multiple args
    {
        cql: "func1('arg1', 'arg2') = false",
        expected: '<ogc:PropertyIsEqualTo>'
            + '<ogc:Function name="func1">'
                + '<ogc:Literal>arg1</ogc:Literal>'
                + '<ogc:Literal>arg2</ogc:Literal>'
            + '</ogc:Function>'
            + '<ogc:Literal>false</ogc:Literal>'
        + '</ogc:PropertyIsEqualTo>'
    },
    // property
    {
        cql: "func1(PROP) = false",
        expected: '<ogc:PropertyIsEqualTo>'
            + '<ogc:Function name="func1">'
                + '<ogc:PropertyName>PROP</ogc:PropertyName>'
            + '</ogc:Function>'
            + '<ogc:Literal>false</ogc:Literal>'
        + '</ogc:PropertyIsEqualTo>'
    },

    // nested
    {
        cql: "jsonArrayContains(\"property1\", 'key', 'value') = false",
        expected: '<ogc:PropertyIsEqualTo>'
        + '<ogc:Function name="jsonArrayContains">'
            + '<ogc:PropertyName>property1</ogc:PropertyName>'
            + '<ogc:Literal>key</ogc:Literal>'
            + '<ogc:Literal>value</ogc:Literal>'
        + '</ogc:Function>'
        + '<ogc:Literal>false</ogc:Literal>'
    + '</ogc:PropertyIsEqualTo>'
    }, {
        cql: "jsonPointer(\"property2\", 'key') = 'value')",
        expected: '<ogc:PropertyIsEqualTo>'
        + '<ogc:Function name="jsonPointer">'
            + '<ogc:PropertyName>property2</ogc:PropertyName>'
            + '<ogc:Literal>key</ogc:Literal>'
        + '</ogc:Function>'
        + '<ogc:Literal>value</ogc:Literal>'
    + '</ogc:PropertyIsEqualTo>'
    }];

const REAL_WORLD = [
    // real world example
    {
        cql: "( DTINCID <= '1789-07-13' AND DTINCID >= '1492-10-11' ) AND (DOW='1') AND (TPINCID='1')",
        expected:
            '<ogc:And>'
            + '<ogc:And>'
                + '<ogc:And>'
                    + '<ogc:PropertyIsLessThanOrEqualTo>'
                        + '<ogc:PropertyName>DTINCID</ogc:PropertyName>'
                        + '<ogc:Literal>1789-07-13</ogc:Literal>'
                    + '</ogc:PropertyIsLessThanOrEqualTo>'
                    + '<ogc:PropertyIsGreaterThanOrEqualTo>'
                        + '<ogc:PropertyName>DTINCID</ogc:PropertyName>'
                        + '<ogc:Literal>1492-10-11</ogc:Literal>'
                    + '</ogc:PropertyIsGreaterThanOrEqualTo>'
                + '</ogc:And>'
                + '<ogc:PropertyIsEqualTo>'
                    + '<ogc:PropertyName>DOW</ogc:PropertyName>'
                    + '<ogc:Literal>1</ogc:Literal>'
                + '</ogc:PropertyIsEqualTo>'
            + '</ogc:And>'
            + '<ogc:PropertyIsEqualTo>'
                + '<ogc:PropertyName>TPINCID</ogc:PropertyName>'
                + '<ogc:Literal>1</ogc:Literal>'
            + '</ogc:PropertyIsEqualTo>'
        + '</ogc:And>'
    }, {
        cql: "jsonArrayContains(\"property1\", 'key', 'value') = false AND jsonPointer(\"property2\", 'key') = 'value')",
        expected:
            '<ogc:And>'
                + '<ogc:PropertyIsEqualTo>'
                    + '<ogc:Function name="jsonArrayContains">'
                        + '<ogc:PropertyName>property1</ogc:PropertyName>'
                        + '<ogc:Literal>key</ogc:Literal>'
                        + '<ogc:Literal>value</ogc:Literal>'
                    + '</ogc:Function>'
                    + '<ogc:Literal>false</ogc:Literal>'
                + '</ogc:PropertyIsEqualTo>'
                + '<ogc:PropertyIsEqualTo>'
                    + '<ogc:Function name="jsonPointer">'
                        + '<ogc:PropertyName>property2</ogc:PropertyName>'
                        + '<ogc:Literal>key</ogc:Literal>'
                    + '</ogc:Function>'
                    + '<ogc:Literal>value</ogc:Literal>'
                + '</ogc:PropertyIsEqualTo>'
            + '</ogc:And>'

    },
    // geometry example
    {
        cql: "INTERSECTS(GEOMETRY, POLYGON((0 0, 0 10, 10 10, 10 0, 0 0)))",
        expected: '<ogc:Intersects>'
            + '<ogc:PropertyName>GEOMETRY</ogc:PropertyName>'
            + '<gml:Polygon srsName="EPSG:4326">'
                + '<gml:exterior>'
                    + '<gml:LinearRing>'
                        + '<gml:posList>0 0 0 10 10 10 10 0 0 0</gml:posList>'
                    + '</gml:LinearRing>'
                + '</gml:exterior>'
            + '</gml:Polygon>'
        + '</ogc:Intersects>'
    }
];
const testRules = (rules, toOGCFilter) => rules.map(({ cql, expected }) => {
    const res = toOGCFilter(read(cql));
    expect(res).toBe(expected);
});
describe('Convert CQL filter to OGC Filter', () => {

    it('comparison operators', () => {
        const toOGCFilter = fromObject(filterBuilder({ gmlVersion: "3.1.1" }));
        testRules(COMPARISON_TESTS, toOGCFilter);

    });
    it('logical operators', () => {
        const toOGCFilter = fromObject(filterBuilder({ gmlVersion: "3.1.1" }));
        testRules(LOGICAL, toOGCFilter);

    });
    it('cql_specific operators (include)', () => {
        const toOGCFilter = fromObject(filterBuilder({ gmlVersion: "3.1.1" }));
        testRules(CQL_SPECIFIC, toOGCFilter);

    });
    it('functions', () => {
        const toOGCFilter = fromObject(filterBuilder({ gmlVersion: "3.1.1" }));
        testRules(FUNCTIONS, toOGCFilter);
    });
    it('more real world examples', () => {
        const toOGCFilter = fromObject(filterBuilder({ gmlVersion: "3.1.1" }));
        testRules(REAL_WORLD, toOGCFilter);
    });
});
