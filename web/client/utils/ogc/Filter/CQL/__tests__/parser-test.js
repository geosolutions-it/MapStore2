const expect = require('expect');
const {get} = require('lodash');
const parser = require('../parser');

const COMPARISON_TESTS = [
    // numeric
    {
        cql: "PROP = 1",
        expected: {
            property: "PROP",
            type: "=",
            value: 1
        }
    },
    {
        cql: "PROP <> 1",
        expected: {
            property: "PROP",
            type: "<>",
            value: 1
        }
    },
    {
        cql: "PROP < 1",
        expected: {
            property: "PROP",
            type: "<",
            value: 1
        }
    },
    {
        cql: "PROP <= 1",
        expected: {
            property: "PROP",
            type: "<=",
            value: 1
        }
    },
    {
        cql: "PROP > 1",
        expected: {
            property: "PROP",
            type: ">",
            value: 1
        }
    },
    {
        cql: "PROP >= 1",
        expected: {
            property: "PROP",
            type: ">=",
            value: 1
        }
    },
    // string
    {
        cql: "PROP = 'a'",
        expected: {
            property: "PROP",
            type: "=",
            value: 'a'
        }
    },
    {
        cql: "PROP like 'a'",
        expected: {
            property: "PROP",
            type: "like",
            value: 'a'
        }
    }
];

const LOGICAL = [
    // and
    {
        cql: "PROP1 like 'a' and PROP2 < 1",
        expected: {
            "type": "and",
            "filters[0].property": "PROP1",
            "filters[0].type": "like",
            "filters[0].value": "a",
            "filters[1].property": "PROP2",
            "filters[1].type": "<",
            "filters[1].value": 1
        }
    },
    // or
    {
        cql: "PROP1 like 'a' or PROP2 < 1",
        expected: {
            "type": "or",
            "filters[0].property": "PROP1",
            "filters[0].type": "like",
            "filters[0].value": "a",
            "filters[1].property": "PROP2",
            "filters[1].type": "<",
            "filters[1].value": 1
        }
    },
    // not
    {
        cql: "NOT X < 12",
        expected: {
            "type": "not",
            "filters[0].property": "X",
            "filters[0].type": "<",
            "filters[0].value": 12
        }
    },
    // complex filter
    {
        cql: "(PROP1 like 'a') and PROP2 < 1 and (PROP1 <> 'a' or not PROP2 > 1)",
        expected: {
            "type": "and",
            "filters[0].type": "and",
            "filters[0].filters[0].type": "like",
            "filters[0].filters[0].property": "PROP1",
            "filters[0].filters[0].value": "a",
            "filters[0].filters[1].type": "<",
            "filters[0].filters[1].property": "PROP2",
            "filters[0].filters[1].value": 1,
            "filters[1].type": "or",
            "filters[1].filters[0].type": "<>",
            "filters[1].filters[0].property": "PROP1",
            "filters[1].filters[0].value": "a",
            "filters[1].filters[1].type": "not",
            "filters[1].filters[1].filters[0].property": "PROP2"
        }
    }
];

const REAL_WORLD = [
    // real world example
    {
        cql: "( DTINCID <= '1789-07-13' AND DTINCID >= '1492-10-11' ) AND (DOW='1') AND (TPINCID='1')",
        expected: {
            "type": "and",
            "filters[0].type": "and",
            "filters[0].filters[0].filters[0].type": "<=",
            "filters[1].property": "TPINCID"

        }
    }
];
const testRules = rules => rules.map(({ cql, expected }) => {
    const res = parser.read(cql);
    Object.keys(expected).map(k =>
        expect(get(res, k)).toBe(expected[k])
    );
});
describe('cql parser', () => {

    it('test simple comparison', () => {
        testRules(COMPARISON_TESTS);

    });
    it('test logical operators', () => {
        testRules(LOGICAL);

    });
    it('test more real world examples', () => {
        testRules(REAL_WORLD);
    });
});
