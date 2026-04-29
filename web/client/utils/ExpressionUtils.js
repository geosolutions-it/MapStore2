/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {compileExpression, useDotAccessOperatorAndOptionalChaining} from 'filtrex';
import { get, castArray } from 'lodash';
export const getFiltrexOptions = (state, context) => ({
    customProp: useDotAccessOperatorAndOptionalChaining,
    extraFunctions: {
        // all functions in context are added as extra functions, to allow the usage of myFunction() in expressions, that will be transformed into myFunction() and passed to filtrex as an extra function. This allows to use context to pass custom functions to the expressions without having to worry about the syntax, as they will be transformed into proper function calls.
        ...context,
        /**
         * Get function to extract values from objects using a path.
         * This is the function internally used to manage the `.` operator in expressions, that is transformed into a get operation.
         * Example: `get(state("browser"), "name")` will return the name of the browser
         * @param {object} o the object where to extract data
         * @param {string} path the path of the object to extract
         * @param {*} default default value if the element is not present
         * @returns {*} value extracted from the object
         */
        get: (o, path, d) => {
            const forbidden = ['__proto__', 'prototype', 'constructor'];

            const segments = path.split('.');
            if (segments.some(s => forbidden.includes(s))) {
                return null;
            }
            return get(o, path, d);
        },
        /**
         * Transforms a value into a boolean, following the javascript implicit conversion. Useful to manage cases where we want to test the presence of a value that can be not a boolean, e.g. `state('userrole')` that can return null if the user has no role, or a string with the role name if it has one.
         * @param {object} val any value to transform into a boolean
         * @returns {boolean} the boolean value of the input, following javascript implicit conversion rules (e.g. null, undefined, 0, "" will be transformed into false, while non empty strings, non zero numbers and objects will be transformed into true)
         */
        bool: (val) => {
            return !!val;
        },
        state: (key) => state(key),
        /**
         * Replaces the includes method for arrays and strings, to allow the usage of includes in expressions without having to worry about the type of the variable. If the variable is a string, it will use the string includes, if it's an array it will use the array includes, if it's null or undefined it will be treated as an empty array.
         * @param {array|string} arr the array or string to test
         * @param {object} val the value to search for
         * @returns {boolean} true if the array or string includes the value passed
         */
        includes: (arr, val) =>
            (typeof arr === 'string' && typeof val === 'string')
                ? arr.includes(val)
                : castArray(arr ?? []).includes(val),
        /**
         * Useful to replace common filter operations
         * to test arrays.
         * Example: `hasAtLeastOne(state("usergroups"), ("g1", "g2", "g3"))` will return true if the usergroups includes at least one of the groups passed as second parameter.
         * @param {array} arr the array to test
         * @param {array} testItems the items to search for
         * @returns {boolean} true if the array includes at least one of the value passed
         */
        hasAtLeastOne: (arr = [], testItems = []) =>
            castArray(testItems).some(item => castArray(arr).includes(item)),
        /**
         * Useful to replace common filter operations
         * to test arrays.
         * Example: `containsAll(state("usergroups"), ("g1", "g2", "g3"))` will return true if the usergroups includes all of the groups passed as second parameter.
         * @param {array} arr the array to test
         * @param {array} testItems the items to search for
         * @returns {boolean} true if the array includes all of the value passed
         */
        containsAll: (arr = [], testItems = []) =>
            castArray(testItems).every(item => castArray(arr).includes(item)),
        /**
         * Replaces the toLowerCase method for strings, to allow the usage of toLowerCase in expressions without having to worry about the type of the variable. If the variable is a string, it will use the string toLowerCase, if it's not a string it will return the value as is.
         * @param {string} str the string to transform
         * @returns {string} the transformed string or the original value if it's not a string
         * @example toLowerCase(state("browser").name) will return the name of the browser in lower case if it's a string, otherwise it will return the original value (e.g. null or undefined)
         */
        toLowerCase: (str) => (typeof str === 'string' ? str.toLowerCase() : str)
    }
});

export const wrapBooleans = (expr, isInsideLogical) => {
    const st = expr.trim();
    if (!st) return '';

    // if the string starts with bool( or is a string literal or is a comparison (starting at the beginning),
    // we assume it's already properly formed and we don't touch it
    if (/^bool\(|^"|^'|^(?:==|!=|>|<|>=|<=)|^(true|false|\d+)$/i.test(st)) {
        return st;
    }

    // manage parentheses:
    // - if the whole expression is wrapped in parentheses, we check if it contains logical operators.
    // - If it does, we wrap the inner part with bool() as well, to manage cases like (a and b) or not (a or b)
    if (st.startsWith('(') && st.endsWith(')')) {
        const content = st.substring(1, st.length - 1).trim();
        if (/\b(and|or|not)\b/i.test(content)) {
            return `(${wrapBooleans(content )})`;
        }
    }
    // manage not
    if (st.toLowerCase().startsWith('not ')) {
        const rest = st.substring(4).trim();
        // if there is a not, we are in a logical context, so we force the inner part to be bool() as well
        return `not ${wrapBooleans(rest, true)}`;
    }

    // split and/or at the top level (not inside parentheses)
    let depth = 0;
    let lastMatch = 0;
    const tokens = [];
    const regex = /\b(and|or)\b/gi;
    let match;

    match = regex.exec(st);
    while (match !== null) {
        let segment = st.substring(lastMatch, match.index);
        for (const char of segment) {
            if (char === '(') depth++;
            if (char === ')') depth--;
        }

        if (depth === 0) {
            tokens.push(st.substring(lastMatch, match.index).trim());
            tokens.push(match[0].toLowerCase());
            lastMatch = regex.lastIndex;
        }
        match = regex.exec(st);
    }

    // 5. if we have logical operators at the top level, we split and wrap each part with bool() as well, to manage cases like a and b or a and (b or c)
    if (tokens.length > 0) {
        tokens.push(st.substring(lastMatch).trim());
        return tokens.map(t => {
            if (t === 'and' || t === 'or') return ` ${t} `;
            // foce true
            return wrapBooleans(t, true);
        }).join('').replace(/\s+/g, ' ').trim();
    }

    return isInsideLogical ? `bool(${st})` : st;
};

export const transformSyntax = (expr) => {
    const tempExpr = expr
        .replace(/'((?:\\.|[^'])*)'/g, '"$1"') // replace ' with "
        .replace(/context\./g, '') // removes context string
        .replace(/(\[[^\]]+\]|[\w\d\(\)\"\'_]+)\.includes\(([^)]+)\)/g, 'includes($1, $2)')
        .replace(/\[\s*(.*?)\s*\]/g, '($1)') // replace [] arrays with () arrays
        .replace(/&&/g, 'and') // replace && with the proper string
        .replace(/\|\|/g, 'or') // replaces || with the proper string
        .replace(/!(?!=)/g, 'not ') // logical not (!= is skipped)
        .replace(/\?.(?=\w+)/g, '.') // Optional chaining is already managed
        .replace(/!==/g, '!=') // replace proper != operator
        .replace(/===/g, '==') // replace proper equal operator
        .replace(/([\w\.\(\)\"\'\s,]+)\.toLowerCase\(\)/g, 'toLowerCase($1)') // wraps toLowerCase as function
        // applies `get` replacing `.` notation - captures full property chains (a.b.c -> get(a, "b.c"))
        .replace(/("(?:\\.|[^"])*")|([a-zA-Z_]\w*(?:\([^\)]*\))?(?:\.\w+)+)(?!\()/g, (match, stringContent, chain) => {
            if (stringContent) return stringContent; // strings like "owner.username" should be preserved
            if (!chain) return match;
            const firstDot = chain.indexOf('.');
            const target = chain.substring(0, firstDot);
            const path = chain.substring(firstDot + 1);
            return `get(${target}, "${path}")`;
        });
    return wrapBooleans(tempExpr);
};
/**
 * Parses a filtrex expression returning the final result, with the variables and options passed
 * @prop {string} expression the expression to parse
 * @prop {object} context the variables for the expression.
 * @prop {options} options, the options to pass to compile the
 */
export function parseExpression(expression, context, options) {
    let expr = compileExpression(expression, options);
    return expr(context);
}

/**
 * Contains the `originalError`, the `original` expression and the `transformed` formula.
 * The error can be of `type` `execution` or `compile`.
 * In case of `compile` the error is due to the syntax of the expression.
 * In case of `execution` type, the error happened during execution it can be due to invalid data or function calls that are not available
 */
export class ExpressionError extends Error {
    constructor(message, { original, originalError, transformed, type }) {
        super(message);
        this.name = "ExpressionError";
        this.original = original;
        this.originalError = originalError;
        this.transformed = transformed;
        this.type = type;
    }
}
/**
 * Parses a plugin expression to provide the result. The plugin expression syntax is a superset of [Filtrex syntax](https://www.npmjs.com/package/filtrex).
 * This superset is made to provide backward compatibility with many use cases, to allow a gradual migration to the new rules.
 * Internally it translates the syntax into the filtrex syntax.
 * If a rule can not be translated of if it's evaluation returns an error, the error will be logged.
 * Adds to Filtrex syntax the following enhancements:
 * - The usage of `"` instead and `'` for strings (`'` in filtrex can not be used anymore for variable names, that must not contain special chars)
 * - `&&` `||` `!` operators instead of and or not
 * - allows using `[]` syntax for arrays
 * - allows to use `.` operator to access to simple properties of objects (transforming into `get` operation,see below). e.g. `state('browser').safari` --> `get(state("browser"), 'safari'))`)
 * - allow to pass `context` variable to define functions and variables. (spreading the object into evaluation context and into `extraFunctions` )
 * - attempts to transform `toLowerCase` `includes` applied to arrays into the corresponding functions (see below)
 * - attempts to implicitly transform values that are involved in logical operation into boolean using the `bool` function (see below)
 * Moreover it adds a set of utility functions for the expressions:
 * - `state`: get the part of the `monitoredState` selected (e.g. `state('userrole')`)
 * - `get`: get a value from an expression that returns an object. (e.g. `get(state("browser"), 'safari'))`)
 * - `bool`: transform a vale into a boolean, following the javascript implicit conversion e.g. `bool(state('userrole'))` --> true/false.
 * - `includes`: returns true if an array includes the value passed (e.g. `includes(state("usergroups"), "myGroup")`
 * - `hasAtLeastOne`: returns true if an array includes at least one of the value passed e.g. `hasAtLeastOne(state("usergroups"),("g1","g2","g3"))`
 * - `containsAll`: returns true if an array includes at all of the value passed e.g. `hasAtLeastOne(state("usergroups"),("g1","g2","g3")`
 * - `toLowerCase`: transforms the string to lower case.
 * @param {string} pluginExpression the expression to evalutate
 * @param {string} data includes `state` function and `context` object to pass
 */
export function pluginUtilsExpressionEvaluation(pluginExpression, {state, context} = {}) {
    const expression = transformSyntax(pluginExpression);
    const options = getFiltrexOptions(state, context);
    let result;
    try {
        result = parseExpression(expression, context, options);

    } catch (e) {
        throw new ExpressionError(
            `Plugin Expression Evaluation Failed: ${e.message}`,
            {
                original: pluginExpression,
                originalError: e,
                transformed: expression,
                type: 'compile'
            }
        );
    }
    if (result instanceof Error) {
        throw new ExpressionError(
            `Plugin Expression Evaluation Failed: ${result.message}`,
            {
                original: pluginExpression,
                originalError: result,
                transformed: expression,
                type: 'execution'
            }
        );
    }
    // console.debug(`Plugin Expression Success: \n- Expression: ${pluginExpression}\n - Filtrex Expression: ${expression} \n - Result: ${result}`);
    return result;
}
