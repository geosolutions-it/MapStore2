import expect from 'expect';
import { get } from 'lodash';
import {read, functionOperator} from '../parser';

const COMPARISON_TESTS = [
    // numeric
    {
        cql: "PROP = 1",
        expected: {
            args: [{type: "property", name: "PROP"}, {type: "literal", value: 1}],
            type: "="
        }
    },
    {
        cql: "PROP <> 1",
        expected: {
            args: [{type: "property", name: "PROP"}, {type: "literal", value: 1}],
            type: "<>"
        }
    },
    {
        cql: "PROP < 1",
        expected: {
            args: [{type: "property", name: "PROP"}, {type: "literal", value: 1}],
            type: "<"
        }
    },
    {
        cql: "PROP <= 1",
        expected: {
            args: [{type: "property", name: "PROP"}, {type: "literal", value: 1}],
            type: "<="
        }
    },
    {
        cql: "PROP > 1",
        expected: {
            args: [{type: "property", name: "PROP"}, {type: "literal", value: 1}],
            type: ">"
        }
    },
    {
        cql: "PROP >= 1",
        expected: {
            args: [{type: "property", name: "PROP"}, {type: "literal", value: 1}],
            type: ">="
        }
    },
    // string
    {
        cql: "PROP = 'a'",
        expected: {
            args: [{type: "property", name: "PROP"}, {type: "literal", value: 'a'}],
            type: "="
        }
    },
    {
        cql: "PROP like 'a'",
        expected: {
            args: [{type: "property", name: "PROP"}, {type: "literal", value: 'a'}],
            type: "like"
        }
    },
    {
        cql: "INCLUDE",
        expected: {
            type: "include"
        }
    }
];

const VARIANTS = [{
    cql: "\"PROP\" = 'a'",
    expected: {
        args: [{type: "property", name: "PROP"}, {type: "literal", value: 'a'}],
        type: "="
    }
}];

const LOGICAL = [
    // and
    {
        cql: "PROP1 like 'a' and PROP2 < 1",
        expected: {
            "type": "and",
            "filters[0].args[0].name": "PROP1",
            "filters[0].type": "like",
            "filters[0].args[1].value": "a",
            "filters[1].args[0].name": "PROP2",
            "filters[1].type": "<",
            "filters[1].args[1].value": 1
        }
    },
    // or
    {
        cql: "PROP1 like 'a' or PROP2 < 1",
        expected: {
            "type": "or",
            "filters[0].args[0].name": "PROP1",
            "filters[0].type": "like",
            "filters[0].args[1].value": "a",
            "filters[1].args[0].name": "PROP2",
            "filters[1].type": "<",
            "filters[1].args[1].value": 1
        }
    },
    // not
    {
        cql: "NOT X < 12",
        expected: {
            "type": "not",
            "filters[0].args[0].name": "X",
            "filters[0].type": "<",
            "filters[0].args[1].value": 12
        }
    },
    // complex filter
    {
        cql: "(PROP1 like 'a') and PROP2 < 1 and (PROP1 <> 'a' or not PROP2 > 1)",
        expected: {
            "type": "and",
            "filters[0].type": "and",
            "filters[0].filters[0].type": "like",
            "filters[0].filters[0].args[0].name": "PROP1",
            "filters[0].filters[0].args[1].value": "a",
            "filters[0].filters[1].type": "<",
            "filters[0].filters[1].args[0].name": "PROP2",
            "filters[0].filters[1].args[1].value": 1,
            "filters[1].type": "or",
            "filters[1].filters[0].type": "<>",
            "filters[1].filters[0].args[0].name": "PROP1",
            "filters[1].filters[0].args[1].value": "a",
            "filters[1].filters[1].type": "not",
            "filters[1].filters[1].filters[0].args[0].name": "PROP2"
        }
    }
];

const WKT_TESTS = [
    // POINT
    {
        cql: "INTERSECTS(PROP1, POINT(1 2))",
        expected: {
            type: "INTERSECTS",
            args: [{
                type: "property",
                name: "PROP1"
            }, {
                type: "Point",
                coordinates: [1, 2]
            }]
        }
    },
    // MULTIPOINT
    {
        cql: "INTERSECTS(PROP1, MULTIPOINT(1 2, 3 4))",
        expected: {
            type: "INTERSECTS",
            args: [{type: "property", name: "PROP1"},
                {
                    type: "MultiPoint",
                    coordinates: [[1, 2], [3, 4]]
                }]
        }
    },
    // LINESTRING
    {
        cql: "INTERSECTS(PROP1, LINESTRING(1 2, 3 4))",
        expected: {
            type: "INTERSECTS",
            args: [{
                type: "property",
                name: "PROP1"
            }, {
                type: "LineString",
                coordinates: [[1, 2], [3, 4]]
            }]
        }
    },
    // MULTILINESTRING
    {
        cql: "INTERSECTS(PROP1, MULTILINESTRING((1 2, 3 4), (5 6, 7 8)))",
        expected: {
            type: "INTERSECTS",
            args: [ {type: "property", name: "PROP1"}, {
                type: "MultiLineString",
                coordinates: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]]
            }]
        }
    },
    // POLYGON
    {
        cql: "INTERSECTS(PROP1, POLYGON((1 2, 3 4, 5 6, 1 2)))",
        expected: {
            type: "INTERSECTS",
            args: [
                {type: "property", name: "PROP1"}, {
                    type: "Polygon",
                    coordinates: [[[1, 2], [3, 4], [5, 6], [1, 2]]]
                }]
        }
    },
    // MULTIPOLYGON
    {
        cql: "INTERSECTS(PROP1, MULTIPOLYGON(((1 2, 3 4, 5 6, 1 2)), ((7 8, 9 10, 11 12, 7 8))))",
        expected: {
            type: "INTERSECTS",
            args: [
                {type: "property", name: "PROP1"},
                {
                    type: "MultiPolygon",
                    coordinates: [
                        [[[1, 2], [3, 4], [5, 6], [1, 2]]],
                        [[[7, 8], [9, 10], [11, 12], [7, 8]]]
                    ]
                }]
        }
    }
];
const FUNCTION_TESTS = [
    {
        cql: "func('text')",
        expected: {
            type: functionOperator,
            name: "func",
            args: [{type: 'literal', value: 'text'}]
        }
    },
    // multiple strings
    {
        cql: "func('Hello', ' ', 'World')",
        expected: {
            type: functionOperator,
            name: "func",
            args: [
                {type: 'literal', value: 'Hello'},
                {type: 'literal', value: ' '},
                {type: 'literal', value: 'World'}
            ]
        }
    },
    // mixed args
    {
        cql: "func('abcdef', 2, 4)",
        expected: {
            type: functionOperator,
            name: "func",
            args: [
                {type: 'literal', value: 'abcdef'},
                {type: 'literal', value: 2},
                {type: 'literal', value: 4}
            ]
        }
    },
    // Property Names
    {
        cql: "func( propertyName )",
        expected: {
            type: functionOperator,
            name: "func",
            args: [{type: 'property', name: 'propertyName'}]
        }
    },
    // with double quotes
    {
        cql: 'func("firstName" , lastName )',
        expected: {
            type: functionOperator,
            name: "func",
            args: [
                {type: 'property', name: 'firstName'},
                {type: 'property', name: 'lastName'}
            ]
        }
    },
    // mixing numbers, property names and strings
    {
        cql: 'substring("address", 1, \'test\')',
        expected: {
            type: functionOperator,
            name: "substring",
            args: [
                {type: 'property', name: 'address'},
                {type: 'literal', value: 1},
                {type: 'literal', value: 'test'}]
        }
    },
    {
        cql: 'func(propertyName, \'oldValue\', \'newValue\')',
        expected: {
            type: functionOperator,
            name: "func",
            args: [
                {type: 'property', name: 'propertyName'},
                {type: 'literal', value: 'oldValue'},
                {type: 'literal', value: 'newValue'}
            ]
        }
    },

    // Numbers
    {
        cql: "func(-5)",
        expected: {
            type: functionOperator,
            name: "func",
            args: [{type: 'literal', value: -5}]
        }
    },
    {
        cql: "func(3.14159)",
        expected: {
            type: functionOperator,
            name: "func",
            args: [{type: 'literal', value: 3.14159}]
        }
    },
    // nested functions
    {
        cql: "func(func2('text'))",
        expected: {
            type: functionOperator,
            name: "func",
            args: [{
                type: functionOperator,
                name: "func2",
                args: [{type: 'literal', value: 'text'}]
            }]
        }
    },
    {
        cql: "func(func2('text1'), func3('text2'))",
        expected: {
            type: functionOperator,
            name: "func",
            args: [
                {
                    type: functionOperator,
                    name: "func2",
                    args: [{type: 'literal', value: 'text1'}]
                },
                {
                    type: functionOperator,
                    name: "func3",
                    args: [{type: 'literal', value: 'text2'}]
                }
            ]
        }
    },
    // nested functions with property names
    {
        cql: "func(func2(propertyName))",
        expected: {
            type: functionOperator,
            name: "func",
            args: [{
                type: functionOperator,
                name: "func2",
                args: [{type: 'property', name: 'propertyName'}]
            }]
        }
    },
    // nested functions with multiple arguments
    {
        cql: "func(func2(propertyName, 'text1'), func3('text2', 2))",
        expected: {
            type: functionOperator,
            name: "func",
            args: [
                {
                    type: functionOperator,
                    name: "func2",
                    args: [
                        {type: 'property', name: 'propertyName'},
                        {type: 'literal', value: 'text1'}
                    ]
                }, {
                    type: functionOperator,
                    name: "func3",
                    args: [
                        {type: 'literal', value: 'text2'},
                        {type: 'literal', value: 2}
                    ]
                }
            ]
        }
    },
    // Existing functions

    // jsonArrayContains
    {
        cql: "jsonArrayContains(\"properties\", 'key', 'value')",
        expected: {
            "type": functionOperator,
            "name": "jsonArrayContains",
            "args": [
                {type: 'property', name: "properties"},
                {type: 'literal', value: "key"},
                {type: 'literal', value: "value"}
            ]

        }
    }, {
        cql: "jsonPointer(\"properties\", 'key')",
        expected: {
            "type": functionOperator,
            "name": "jsonPointer",
            "args": [
                {type: 'property', name: "properties"},
                {type: 'literal', value: "key"}
            ]
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
            "filters[1].args[0].type": "property",
            "filters[1].args[0].name": "TPINCID",
            "filters[1].type": "=",
            "filters[1].args[1].value": "1"

        }
    }, {
        cql: 'func1() = false',
        expected: {
            "type": "=",
            "args": [{
                "type": functionOperator,
                "name": "func1",
                "args": []
            }, {
                "type": "literal",
                "value": false
            }]
        }
    },
    {
        cql: "jsonArrayContains(\"property1\", 'key', 'value') = true",
        expected: {
            "type": "=",
            "args": [{
                "type": functionOperator,
                "name": "jsonArrayContains",
                "args": [
                    {type: 'property', name: "property1"},
                    {type: 'literal', value: "key"},
                    {type: 'literal', value: "value"}
                ]
            }, {
                "type": "literal",
                "value": true
            }]
        }
    },

    {
        cql: "INTERSECTS(PROP1, POINT(1 2)) AND PROP2 < 1",
        expected: {
            "type": "and",
            "filters": [{
                "type": "INTERSECTS",
                "args": [
                    {type: "property", name: "PROP1"},
                    {
                        "type": "Point",
                        "coordinates": [1, 2]
                    }]
            }, {
                "type": "<",
                "args": [{type: "property", name: "PROP2"}, {type: "literal", value: 1}]
            }]

        }
    },
    {
        cql: "a = 1 AND b = 2",
        expected: {
            "type": "and",
            "filters": [{
                "type": "=",
                "args": [{type: 'property', name: "a"}, {type: 'literal', value: 1}]
            }, {
                "type": "=",
                "args": [{type: 'property', name: "b"}, {type: 'literal', value: 2}]
            }]
        }
    }, {
        cql: "f1(a) AND f2(b)",
        expected: {
            "type": "and",
            "filters": [{
                "type": functionOperator,
                "name": "f1",
                "args": [{type: 'property', name: "a"}]
            }, {
                "type": functionOperator,
                "name": "f2",
                "args": [{type: 'property', name: "b"}]
            }]
        }
    },
    {
        cql: "jsonArrayContains(\"property1\", 'key', 'value') = false AND jsonPointer(\"property2\", 'key') = 'value')",
        expected: {
            "type": "and",
            filters: [{
                "type": "=",
                "args": [{
                    "type": functionOperator,
                    "name": "jsonArrayContains",
                    "args": [
                        {type: 'property', name: "property1"},
                        {type: 'literal', value: "key"},
                        {type: 'literal', value: "value"}
                    ]
                }, {
                    "type": "literal",
                    "value": false
                }]
            }, {
                "type": "=",
                "args": [{
                    "type": functionOperator,
                    "name": "jsonPointer",
                    "args": [
                        {type: 'property', name: "property2"},
                        {type: 'literal', value: "key"}
                    ]
                }, {
                    "type": "literal",
                    "value": "value"
                }]
            }]
        }
    },
    {
        cql: "(jsonArrayContains(\"property1\", 'key', 'value') = false) AND (jsonPointer(\"property2\", 'key') = 'value'))",
        expected: {
            "type": "and",
            filters: [{
                "type": "=",
                "args": [{
                    "type": functionOperator,
                    "name": "jsonArrayContains",
                    "args": [
                        {type: 'property', name: "property1"},
                        {type: 'literal', value: "key"},
                        {type: 'literal', value: "value"}
                    ]
                }, {
                    "type": "literal",
                    "value": false
                }]
            }, {
                "type": "=",
                "args": [{
                    "type": functionOperator,
                    "name": "jsonPointer",
                    "args": [
                        {type: 'property', name: "property2"},
                        {type: 'literal', value: "key"}
                    ]
                }, {
                    "type": "literal",
                    "value": "value"
                }]
            }]
        }
    },
    {
        // mixed functions and operators
        cql: `jsonArrayContains(\"property1\", 'key', 'value') = false AND jsonPointer(\"property2\", 'key') = 'value' AND INTERSECTS(geom, POINT(1 2)) AND property3 = 'value'`,
        expected: {
            type: "and",
            filters: [{
                "type": "and",
                filters: [{
                    type: "and",
                    filters: [{
                        "type": "=",
                        "args": [{
                            "type": functionOperator,
                            "name": "jsonArrayContains",
                            "args": [
                                {type: 'property', name: "property1"},
                                {type: 'literal', value: "key"},
                                {type: 'literal', value: "value"}
                            ]
                        }, {
                            "type": "literal",
                            "value": false
                        }]
                    }, {
                        "type": "=",
                        "args": [{
                            "type": functionOperator,
                            "name": "jsonPointer",
                            "args": [
                                {type: 'property', name: "property2"},
                                {type: 'literal', value: "key"}
                            ]
                        }, {
                            "type": "literal",
                            "value": "value"
                        }]
                    }]
                }, {
                    "type": "INTERSECTS",
                    "args": [
                        {type: "property", name: "geom"},
                        {
                            "type": "Point",
                            "coordinates": [1, 2]
                        }]
                }]
            }, {
                "type": "=",
                "args": [{type: 'property', name: "property3"}, {type: 'literal', value: "value"}]
            }]

        }
    }
];
const testRules = rules => rules.map(({ cql, expected }) => {
    it(`testing ${cql}`, () => {
        try {
            const res = read(cql);
            Object.keys(expected).map(k => {
                expect(get(res, k)).toEqual(expected[k]);
            });
        } catch (e) {
            throw e;
        }
    });
});
describe('cql parser', () => {

    describe('test simple comparison', () => {
        testRules(COMPARISON_TESTS);

    });
    describe('test logical operators', () => {
        testRules(LOGICAL);

    });
    describe('test variants of operators', () => {
        testRules(VARIANTS);
    });
    describe('test wkt parsing', () => {
        testRules(WKT_TESTS);
    });
    describe('test function parsing', () => {
        testRules(FUNCTION_TESTS);
    });
    describe('test more real world examples', () => {
        testRules(REAL_WORLD);
    });

});
