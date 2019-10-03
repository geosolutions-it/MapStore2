/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const fromWKT = () => {
    throw new Error("WKT parsing for CQL filter not supported yet");
}; // TODO: use wkt-parser
const spatialOperators = {
    INTERSECTS: "INTERSECTS",
    BBOX: "BBOX",
    CONTAINS: "CONTAINS",
    DWITHIN: "DWITHIN",
    WITHIN: "WITHIN"
};
const patterns = {
    PROPERTY: /^[_a-zA-Z]\w*/,
    COMPARISON: /^(=|<>|<=|<|>=|>|LIKE)/i,
    IS_NULL: /^IS NULL/i,
    COMMA: /^,/,
    LOGICAL: /^(AND|OR)/i,
    VALUE: /^('([^']|'')*'|-?\d+(\.\d*)?|\.\d+)/,
    LPAREN: /^\(/,
    RPAREN: /^\)/,
    SPATIAL: /^(BBOX|INTERSECTS|DWITHIN|WITHIN|CONTAINS)/i,
    NOT: /^NOT/i,
    BETWEEN: /^BETWEEN/i,
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
    LPAREN: ['GEOMETRY', 'SPATIAL', 'PROPERTY', 'VALUE', 'LPAREN'],
    RPAREN: ['NOT', 'LOGICAL', 'END', 'RPAREN'],
    PROPERTY: ['COMPARISON', 'BETWEEN', 'COMMA', 'IS_NULL'],
    BETWEEN: ['VALUE'],
    IS_NULL: ['END'],
    COMPARISON: ['VALUE'],
    COMMA: ['GEOMETRY', 'VALUE', 'PROPERTY'],
    VALUE: ['LOGICAL', 'COMMA', 'RPAREN', 'END'],
    SPATIAL: ['LPAREN'],
    LOGICAL: ['NOT', 'VALUE', 'SPATIAL', 'PROPERTY', 'LPAREN'],
    NOT: ['PROPERTY', 'LPAREN'],
    GEOMETRY: ['COMMA', 'RPAREN']
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

const precedence = {
    'RPAREN': 3,
    'LOGICAL': 2,
    'COMPARISON': 1
};
const tryToken = (text, pattern) => {
    if (pattern instanceof RegExp) {
        return pattern.exec(text);
    }
    return pattern(text);
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
                text: match,
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
    const expect = ["NOT", "GEOMETRY", "SPATIAL", "PROPERTY", "LPAREN"];
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
            postfix.push(tok);
            break;
        case "COMPARISON":
        case "BETWEEN":
        case "IS_NULL":
        case "LOGICAL":
            let p = precedence[tok.type];

            while (operatorStack.length > 0 &&
                    (precedence[operatorStack[operatorStack.length - 1].type] <= p)
            ) {
                postfix.push(operatorStack.pop());
            }

            operatorStack.push(tok);
            break;
        case "SPATIAL":
        case "NOT":
        case "LPAREN":
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
        case "LOGICAL":
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
                property,
                lowerBoundary: min,
                upperBoundary: max,
                type: operators.BETWEEN
            });
        }
        case "COMPARISON": {
            let value = buildTree();
            const property = buildTree();
            return ({
                property,
                value: value,
                type: operators[tok.text.toUpperCase()]
            });
        }
        case "IS_NULL": {
            const property = buildTree();
            return ({
                property,
                type: operators[tok.text.toUpperCase()]
            });
        }
        case "VALUE":
            let match = tok.text.match(/^'(.*)'$/);
            if (match) {
                return match[1].replace(/''/g, "'");
            }
            return Number(tok.text);
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
                    property,
                    value
                });
            }
            case "WITHIN": {
                let value = buildTree();
                let property = buildTree();
                return ({
                    type: spatialOperators.WITHIN,
                    property,
                    value
                });
            }
            case "CONTAINS": {
                let value = buildTree();
                const property = buildTree();
                return ({
                    type: spatialOperators.CONTAINS,
                    property,
                    value
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
            return fromWKT(tok.text);
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
module.exports = {
    /**
     * Parse a CQL filter. returns an object representation of the filter.
     * For the moment this parser doesn't support WKT parsing.
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
     *      property: "property1",
     *      value: "value1"
     *   },{
     *      type: "=",
     *      property: "property1",
     *      value: "value2"
     *   }]
     * }
     * ```
     * @memberof utils.ogc.Filter.CQL.parser
     * @name read
     * @param cqlFilter the cql_filter o parse
     * @return a javascript representation of the filter.
     */
    read: (text) => buildAst(tokenize(text))
};
