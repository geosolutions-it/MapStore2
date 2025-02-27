/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {toGeoJSON} from '../../WKT';

export const spatialOperators = {
    INTERSECTS: "INTERSECTS",
    BBOX: "BBOX",
    CONTAINS: "CONTAINS",
    DWITHIN: "DWITHIN",
    WITHIN: "WITHIN"
};

export const functionOperator = "func";
export const patterns = {
    INCLUDE: /^INCLUDE$/,
    PROPERTY: /^"?[_a-zA-Z"]\w*"?/,
    COMPARISON: /^(=|<>|<=|<|>=|>|LIKE|ILIKE)/i,
    IS_NULL: /^IS NULL/i,
    COMMA: /^,/,
    AND: /^(AND)/i,
    OR: /^(OR)/i,
    VALUE: /^('([^']|'')*'|-?\d+(\.\d*)?|\.\d+|true|false)/i,
    LPAREN: /^\(/,
    RPAREN: /^\)/,
    SPATIAL: /^(BBOX|INTERSECTS|DWITHIN|WITHIN|CONTAINS)/i,
    NOT: /^NOT/i,
    BETWEEN: /^BETWEEN/i,
    FUNCTION: /^[_a-zA-Z][_a-zA-Z1-9]*(?=\()/,
    GEOMETRY: (text) => {
        let type = /^(POINT|LINESTRING|POLYGON|MULTIPOINT|MULTILINESTRING|MULTIPOLYGON|GEOMETRYCOLLECTION)/.exec(text);
        if (type) {
            let len = text.length;
            let idx = text.indexOf("(", type[0].length);
            if (idx > -1) {
                let depth = 1;
                while (idx < len && depth > 0) {
                    idx++;
                    switch (text.charAt(idx)) {
                    case '(':
                        depth++;
                        break;
                    case ')':
                        depth--;
                        break;
                    default:
                        // in default case, do nothing
                    }
                }
            }
            return [text.substr(0, idx + 1)];
        }
        return null;
    },
    END: /^$/
};
const follows = {
    INCLUDE: ['END'],
    LPAREN: ['GEOMETRY', 'SPATIAL', 'FUNCTION', 'PROPERTY', 'VALUE', 'LPAREN', 'RPAREN', 'NOT'],
    RPAREN: ['NOT', 'AND', 'OR', 'END', 'RPAREN', 'COMMA', 'COMPARISON', 'BETWEEN', 'IS_NULL'],
    PROPERTY: ['COMPARISON', 'BETWEEN', 'COMMA', 'IS_NULL', 'RPAREN'],
    BETWEEN: ['VALUE'],
    IS_NULL: ['END'],
    COMPARISON: ['VALUE', 'FUNCTION'],
    COMMA: ['GEOMETRY', 'FUNCTION', 'VALUE', 'PROPERTY'],
    VALUE: ['AND', 'OR', 'COMMA', 'RPAREN', 'END'],
    SPATIAL: ['LPAREN'],
    AND: ['NOT', 'VALUE', 'SPATIAL', 'FUNCTION', 'PROPERTY', 'LPAREN'],
    OR: ['NOT', 'VALUE', 'SPATIAL', 'FUNCTION', 'PROPERTY', 'LPAREN'],
    NOT: ['PROPERTY', 'LPAREN'],
    GEOMETRY: ['COMMA', 'RPAREN'],
    FUNCTION: ['LPAREN', 'FUNCTION', 'VALUE', 'PROPERTY']
};


const operators = {
    '=': '=',
    '<>': "<>",
    '<': '<',
    '<=': '<=',
    '>': '>',
    '>=': '>=',
    'LIKE': 'like',
    'ILIKE': 'ilike',
    'BETWEEN': '><',
    'IS NULL': 'isNull'
};

const logical = {
    'AND': "and",
    'OR': "or",
    'NOT': "not"
};
const cql = {
    "INCLUDE": "include"
};

const precedence = {
    'RPAREN': 4,
    'OR': 3,
    'AND': 2,
    'COMPARISON': 1
};

const tryToken = (text, pattern) => {
    if (pattern instanceof RegExp) {
        return pattern.exec(text);
    }
    return pattern(text);
};
const sanitize = (text, token) => {
    if (token === "PROPERTY") {
        return text.replaceAll('"', ''); // remove intercepted do
    }
    return text;
};
const nextToken = (text, tokens) => {
    let i;
    let token;
    let len = tokens.length;
    for (i = 0; i < len; i++) {
        token = tokens[i];
        let pat = patterns[token];
        let matches = tryToken(text, pat);
        if (matches) {
            let match = matches[0];
            let remainder = text.substr(match.length).replace(/^\s*/, "");
            return {
                type: token,
                text: sanitize(match, token),
                remainder: remainder
            };
        }
    }

    let msg = "ERROR: In parsing: [" + text + "], expected one of: ";
    for (i = 0; i < len; i++) {
        token = tokens[i];
        msg += "\n    " + token + ": " + patterns[token];
    }

    throw new Error(msg);
};
const tokenize = (text) => {
    let results = [];
    let token;
    const expect = ["INCLUDE", "NOT", "GEOMETRY",  "SPATIAL", "FUNCTION", "PROPERTY", "LPAREN"];
    let text2 = text;
    let expect2 = expect;
    do {
        token = nextToken(text2, expect2);
        text2 = token.remainder;
        expect2 = follows[token.type];
        if (token.type !== "END" && !expect2) {
            throw new Error("No follows list for " + token.type);
        }
        results.push(token);
    } while (token.type !== "END");

    return results;
};


const buildAst = (tokens) => {
    let operatorStack = [];
    let postfix = [];
    while (tokens.length) {
        let tok = tokens.shift();
        switch (tok.type) {
        case "PROPERTY":
        case "GEOMETRY":
        case "VALUE":
            if (operatorStack.length > 0 &&
                operatorStack?.[operatorStack.length - 2]?.type === "FUNCTION") {
                operatorStack[operatorStack.length - 2].count++;
            }
            postfix.push(tok);
            break;
        case "COMPARISON":
        case "BETWEEN":
        case "IS_NULL":
        case "INCLUDE":
        case "AND":
        case "OR":
            let p = precedence[tok.type];
            while (operatorStack.length > 0 &&
                    (precedence[operatorStack[operatorStack.length - 1].type] <= p)
            ) {
                postfix.push(operatorStack.pop());
            }
            if (operatorStack.length > 0 &&
                operatorStack?.[operatorStack.length - 2]?.type === "FUNCTION") {
                operatorStack[operatorStack.length - 2].count++;
            }
            operatorStack.push(tok);
            break;
        case "SPATIAL":
        case "FUNCTION":
        case "NOT":
            if (operatorStack.length > 0 &&
                operatorStack?.[operatorStack.length - 2]?.type === "FUNCTION") {
                operatorStack[operatorStack.length - 2].count++;
            }
            operatorStack.push(tok);
            break;
        case "LPAREN":
            if (operatorStack.length > 0 &&
                operatorStack?.[operatorStack.length - 1]?.type === "FUNCTION") {
                operatorStack[operatorStack.length - 1].count = 0;
            }
            operatorStack.push(tok);
            break;
        case "RPAREN":
            while (operatorStack.length > 0 &&
                    (operatorStack[operatorStack.length - 1].type !== "LPAREN")
            ) {
                postfix.push(operatorStack.pop());
            }
            operatorStack.pop(); // toss out the LPAREN

            if (operatorStack.length > 0 &&
                    operatorStack[operatorStack.length - 1].type === "SPATIAL") {
                postfix.push(operatorStack.pop());
            }

            if (operatorStack.length > 0 &&
                operatorStack[operatorStack.length - 1].type === "FUNCTION") {
                let funcTok = operatorStack.pop();
                postfix.push(funcTok);
            }
            break;
        case "COMMA":
        case "END":
            break;
        default:
            throw new Error("Unknown token type " + tok.type);
        }
    }

    while (operatorStack.length > 0) {
        postfix.push(operatorStack.pop());
    }

    function buildTree() {
        let tok = postfix.pop();
        switch (tok.type) {
        case "AND":
        case "OR":
            let rhs = buildTree();
            let lhs = buildTree();
            return ({
                filters: [lhs, rhs],
                type: logical[tok.text.toUpperCase()]
            });
        case "NOT":
            let operand = buildTree();
            return ({
                filters: [operand],
                type: logical.NOT
            });
        case "BETWEEN": {
            postfix.pop(); // unneeded AND token here
            let max = buildTree();
            let min = buildTree();
            const property = buildTree();
            return ({
                args: [property, min, max],
                type: operators.BETWEEN
            });
        }
        case "COMPARISON": {
            const arg2 = buildTree();
            const arg1 = buildTree();
            return ({
                args: [arg1, arg2],
                type: operators[tok.text.toUpperCase()]
            });
        }
        case "IS_NULL": {
            const property = buildTree();
            return ({
                args: [property],
                type: operators[tok.text.toUpperCase()]
            });
        }
        case "VALUE":
            let match = tok.text.match(/^'(.*)'$/);
            if (match) {
                return {
                    type: 'literal',
                    value: match[1].replace(/''/g, "'")
                };
            }
            if (tok.text.toLowerCase() === "true" || tok.text.toLowerCase() === "false") {
                return {
                    type: 'literal',
                    value: tok.text.toLowerCase() === "true"
                };
            }
            return {
                type: 'literal',
                value: Number(tok.text)
            };
        case "PROPERTY":
            return ({
                type: "property",
                name: tok.text
            });

        case "INCLUDE": {
            return ({
                type: cql.INCLUDE
            });
        }
        case "FUNCTION": {
            let name = tok.text.replace(/\($/, "");
            let args = [];
            for ( let i = 0; i < tok.count; i++) {
                args.push(buildTree());
            }

            return ({
                type: functionOperator,
                name,
                args: args.reverse()
            });
        }

        case "SPATIAL":
            switch (tok.text.toUpperCase()) {
            case "BBOX": {
                let maxy = buildTree();
                let maxx = buildTree();
                let miny = buildTree();
                let minx = buildTree();
                let property = buildTree();

                return ({
                    type: spatialOperators.BBOX,
                    property,
                    value: [minx, miny, maxx, maxy] // TODO: evaluate this special case
                });
            }
            case "INTERSECTS": {
                const value = buildTree();
                const property = buildTree();
                return ({
                    type: spatialOperators.INTERSECTS,
                    args: [property, value]
                });
            }
            case "WITHIN": {
                let value = buildTree();
                let property = buildTree();
                return ({
                    type: spatialOperators.WITHIN,
                    args: [property, value]
                });
            }
            case "CONTAINS": {
                let value = buildTree();
                const property = buildTree();
                return ({
                    type: spatialOperators.CONTAINS,
                    args: [property, value]
                });
            }
            case "DWITHIN": {
                let distance = buildTree();
                let value = buildTree();
                const property = buildTree();
                return ({
                    type: spatialOperators.DWITHIN,
                    value,
                    property,
                    distance: Number(distance)
                });
            }
            default:
                return null;
            }
        case "GEOMETRY":
            // WKT to convert in GeoJSON.
            return toGeoJSON(tok.text);
        default:
            return tok.text;
        }
    }

    let result = buildTree();
    if (postfix.length > 0) {
        let msg = "Remaining tokens after building AST: \n";
        for (let i = postfix.length - 1; i >= 0; i--) {
            msg += postfix[i].type + ": " + postfix[i].text + "\n";
        }
        throw new Error(msg);
    }

    return result;
};


/**
 * Parse a CQL filter. returns an AST object representation of the filter.
 * Example:
 * ```
 * const cqlFilter = "property1 = 'value1' AND property2 = 'value2'";
 * const obj = read(cqlFilter);
 * console.log(obj);
 * // obj looks like this
 * {
 *   type: "and",
 *   filters: [{
 *      type: "=",
 *      args[{type: "property", name: "property1"}, {type: "literal", value: "value1"}]
 *   },{
 *      type: "=",
 *      property: "property1",
 *      args[{type: "property", name: "property1"}, {type: "literal", value: "value1"}]
 *   }, {
 *      type: "func",
 *      name: "func1",
 *      args: [{
 *         type: "property",
 *         name: "property5"
 *      }, {
 *         type: "literal",
 *         value: "value5"
 *      }]
 * }]]
 * }
 * ```
 * @memberof utils.ogc.Filter.CQL.parser
 * @name read
 * @param cqlFilter the cql_filter o parse
 * @return {object} a javascript representation of the filter.
 */
export const read = (text) => buildAst(tokenize(text));

